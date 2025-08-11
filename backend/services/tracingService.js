const { initTracer } = require('jaeger-client');
const promClient = require('prom-client');
const { cache } = require('../config/redis');

class TracingService {
  constructor() {
    // Initialize Jaeger tracer for distributed tracing
    const config = {
      serviceName: 'itda-backend',
      reporter: {
        logSpans: true,
        agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
        agentPort: process.env.JAEGER_AGENT_PORT || 6832
      },
      sampler: {
        type: 'probabilistic',
        param: 1.0
      }
    };

    const options = {
      tags: {
        'itda.version': '2.0.0',
        'itda.environment': process.env.NODE_ENV || 'development'
      },
      logger: {
        info: msg => console.log('JAEGER:', msg),
        error: msg => console.error('JAEGER ERROR:', msg)
      }
    };

    this.tracer = initTracer(config, options);

    // Initialize Prometheus metrics
    this.initializeMetrics();
    
    // Start metrics collection
    this.startMetricsCollection();
  }

  // Initialize Prometheus metrics
  initializeMetrics() {
    // Create custom metrics
    this.metrics = {
      // HTTP metrics
      httpRequestDuration: new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status'],
        buckets: [0.1, 0.5, 1, 2, 5]
      }),
      
      httpRequestTotal: new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status']
      }),

      // Database metrics
      dbQueryDuration: new promClient.Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries',
        labelNames: ['operation', 'collection'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1]
      }),

      dbConnectionPool: new promClient.Gauge({
        name: 'db_connection_pool_size',
        help: 'Database connection pool size',
        labelNames: ['state']
      }),

      // Cache metrics
      cacheHits: new promClient.Counter({
        name: 'cache_hits_total',
        help: 'Total number of cache hits',
        labelNames: ['cache_type']
      }),

      cacheMisses: new promClient.Counter({
        name: 'cache_misses_total',
        help: 'Total number of cache misses',
        labelNames: ['cache_type']
      }),

      // Business metrics
      projectsCreated: new promClient.Counter({
        name: 'projects_created_total',
        help: 'Total number of projects created'
      }),

      activeUsers: new promClient.Gauge({
        name: 'active_users',
        help: 'Number of active users'
      }),

      // WebSocket metrics
      wsConnections: new promClient.Gauge({
        name: 'websocket_connections',
        help: 'Number of active WebSocket connections'
      }),

      wsMessages: new promClient.Counter({
        name: 'websocket_messages_total',
        help: 'Total WebSocket messages',
        labelNames: ['type', 'direction']
      }),

      // Queue metrics
      queueJobs: new promClient.Gauge({
        name: 'queue_jobs',
        help: 'Number of jobs in queue',
        labelNames: ['queue', 'state']
      }),

      queueProcessingTime: new promClient.Histogram({
        name: 'queue_job_processing_seconds',
        help: 'Queue job processing time',
        labelNames: ['queue', 'job_type'],
        buckets: [0.5, 1, 5, 10, 30, 60]
      }),

      // AI metrics
      aiInferences: new promClient.Counter({
        name: 'ai_inferences_total',
        help: 'Total AI model inferences',
        labelNames: ['model', 'task']
      }),

      aiLatency: new promClient.Histogram({
        name: 'ai_inference_latency_seconds',
        help: 'AI inference latency',
        labelNames: ['model', 'task'],
        buckets: [0.1, 0.5, 1, 2, 5, 10]
      }),

      // Error metrics
      errors: new promClient.Counter({
        name: 'errors_total',
        help: 'Total errors',
        labelNames: ['type', 'severity']
      }),

      // Custom business metrics
      budgetUtilization: new promClient.Gauge({
        name: 'budget_utilization_ratio',
        help: 'Budget utilization across all projects'
      }),

      projectProgress: new promClient.Gauge({
        name: 'average_project_progress',
        help: 'Average progress across all active projects'
      })
    };

    // Register metrics
    promClient.register.registerMetric(this.metrics.httpRequestDuration);
    promClient.register.registerMetric(this.metrics.httpRequestTotal);
    promClient.register.registerMetric(this.metrics.dbQueryDuration);
    promClient.register.registerMetric(this.metrics.dbConnectionPool);
    promClient.register.registerMetric(this.metrics.cacheHits);
    promClient.register.registerMetric(this.metrics.cacheMisses);
    promClient.register.registerMetric(this.metrics.projectsCreated);
    promClient.register.registerMetric(this.metrics.activeUsers);
    promClient.register.registerMetric(this.metrics.wsConnections);
    promClient.register.registerMetric(this.metrics.wsMessages);
    promClient.register.registerMetric(this.metrics.queueJobs);
    promClient.register.registerMetric(this.metrics.queueProcessingTime);
    promClient.register.registerMetric(this.metrics.aiInferences);
    promClient.register.registerMetric(this.metrics.aiLatency);
    promClient.register.registerMetric(this.metrics.errors);
    promClient.register.registerMetric(this.metrics.budgetUtilization);
    promClient.register.registerMetric(this.metrics.projectProgress);

    // Collect default metrics
    promClient.collectDefaultMetrics({ prefix: 'itda_' });
  }

  // Start span for tracing
  startSpan(name, parentSpan = null) {
    const span = parentSpan 
      ? this.tracer.startSpan(name, { childOf: parentSpan })
      : this.tracer.startSpan(name);
    
    span.setTag('span.kind', 'server');
    return span;
  }

  // Trace HTTP request
  traceHttpRequest(req, res, next) {
    const span = this.startSpan(`${req.method} ${req.path}`);
    
    span.setTag('http.method', req.method);
    span.setTag('http.url', req.url);
    span.setTag('user.id', req.user?.id || 'anonymous');
    
    const startTime = Date.now();
    
    // Store span in request for child spans
    req.span = span;
    
    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = (Date.now() - startTime) / 1000;
      
      // Record metrics
      this.metrics.httpRequestDuration
        .labels(req.method, req.route?.path || req.path, res.statusCode)
        .observe(duration);
      
      this.metrics.httpRequestTotal
        .labels(req.method, req.route?.path || req.path, res.statusCode)
        .inc();
      
      // Complete span
      span.setTag('http.status_code', res.statusCode);
      span.finish();
      
      originalEnd.apply(res, args);
    }.bind(this);
    
    next();
  }

  // Trace database operation
  traceDbOperation(operation, collection, query, parentSpan) {
    const span = this.startSpan(`db.${operation}`, parentSpan);
    
    span.setTag('db.type', 'mongodb');
    span.setTag('db.operation', operation);
    span.setTag('db.collection', collection);
    span.setTag('db.query', JSON.stringify(query).substring(0, 100));
    
    const startTime = Date.now();
    
    return {
      span,
      finish: (error = null) => {
        const duration = (Date.now() - startTime) / 1000;
        
        this.metrics.dbQueryDuration
          .labels(operation, collection)
          .observe(duration);
        
        if (error) {
          span.setTag('error', true);
          span.log({ event: 'error', message: error.message });
        }
        
        span.finish();
      }
    };
  }

  // Trace cache operation
  traceCacheOperation(operation, key, hit, parentSpan) {
    const span = this.startSpan(`cache.${operation}`, parentSpan);
    
    span.setTag('cache.operation', operation);
    span.setTag('cache.key', key);
    span.setTag('cache.hit', hit);
    
    if (hit) {
      this.metrics.cacheHits.labels('redis').inc();
    } else {
      this.metrics.cacheMisses.labels('redis').inc();
    }
    
    return span;
  }

  // Trace AI operation
  traceAIOperation(model, task, parentSpan) {
    const span = this.startSpan(`ai.${task}`, parentSpan);
    
    span.setTag('ai.model', model);
    span.setTag('ai.task', task);
    
    const startTime = Date.now();
    
    this.metrics.aiInferences.labels(model, task).inc();
    
    return {
      span,
      finish: (error = null) => {
        const duration = (Date.now() - startTime) / 1000;
        
        this.metrics.aiLatency
          .labels(model, task)
          .observe(duration);
        
        if (error) {
          span.setTag('error', true);
          span.log({ event: 'error', message: error.message });
        }
        
        span.finish();
      }
    };
  }

  // Record business metrics
  recordBusinessMetric(metric, value, labels = {}) {
    switch (metric) {
      case 'project.created':
        this.metrics.projectsCreated.inc();
        break;
      case 'user.active':
        this.metrics.activeUsers.set(value);
        break;
      case 'ws.connection':
        this.metrics.wsConnections.set(value);
        break;
      case 'ws.message':
        this.metrics.wsMessages.labels(labels.type, labels.direction).inc();
        break;
      case 'queue.jobs':
        this.metrics.queueJobs.labels(labels.queue, labels.state).set(value);
        break;
      case 'error':
        this.metrics.errors.labels(labels.type, labels.severity).inc();
        break;
      case 'budget.utilization':
        this.metrics.budgetUtilization.set(value);
        break;
      case 'project.progress':
        this.metrics.projectProgress.set(value);
        break;
    }
  }

  // Start metrics collection
  startMetricsCollection() {
    // Collect queue metrics every 30 seconds
    setInterval(async () => {
      try {
        const messageQueue = require('./messageQueue');
        const queues = ['email', 'analytics', 'aiProcessing'];
        
        for (const queueName of queues) {
          const metrics = await messageQueue.getQueueMetrics(queueName);
          this.metrics.queueJobs.labels(queueName, 'waiting').set(metrics.waiting);
          this.metrics.queueJobs.labels(queueName, 'active').set(metrics.active);
          this.metrics.queueJobs.labels(queueName, 'completed').set(metrics.completed);
          this.metrics.queueJobs.labels(queueName, 'failed').set(metrics.failed);
        }
      } catch (error) {
        console.error('Queue metrics collection error:', error);
      }
    }, 30000);

    // Collect database metrics every minute
    setInterval(async () => {
      try {
        const mongoose = require('mongoose');
        const connections = mongoose.connections;
        
        connections.forEach(conn => {
          this.metrics.dbConnectionPool.labels('active').set(conn.readyState);
        });
      } catch (error) {
        console.error('DB metrics collection error:', error);
      }
    }, 60000);

    // Collect business metrics every 5 minutes
    setInterval(async () => {
      try {
        // This would fetch from your database
        const Project = require('../models/Project');
        const projects = await Project.find({ status: 'IN_PROGRESS' });
        
        const totalBudget = projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
        const spentBudget = projects.reduce((sum, p) => sum + p.spentBudget, 0);
        const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;
        
        this.metrics.budgetUtilization.set(spentBudget / totalBudget);
        this.metrics.projectProgress.set(avgProgress);
      } catch (error) {
        console.error('Business metrics collection error:', error);
      }
    }, 300000);
  }

  // Get metrics for Prometheus
  async getMetrics() {
    return promClient.register.metrics();
  }

  // Get metrics in JSON format
  async getMetricsJSON() {
    return promClient.register.getMetricsAsJSON();
  }

  // Create custom dashboard data
  async getDashboardMetrics() {
    const metrics = await this.getMetricsJSON();
    
    return {
      http: {
        requestsPerSecond: this.calculateRate(metrics, 'http_requests_total'),
        avgResponseTime: this.getAverage(metrics, 'http_request_duration_seconds'),
        errorRate: this.calculateErrorRate(metrics)
      },
      database: {
        avgQueryTime: this.getAverage(metrics, 'db_query_duration_seconds'),
        connectionsActive: this.getValue(metrics, 'db_connection_pool_size')
      },
      cache: {
        hitRate: this.calculateCacheHitRate(metrics)
      },
      business: {
        activeProjects: this.getValue(metrics, 'projects_created_total'),
        budgetUtilization: this.getValue(metrics, 'budget_utilization_ratio'),
        avgProgress: this.getValue(metrics, 'average_project_progress')
      },
      system: {
        cpuUsage: this.getValue(metrics, 'process_cpu_seconds_total'),
        memoryUsage: this.getValue(metrics, 'process_resident_memory_bytes'),
        uptime: this.getValue(metrics, 'process_start_time_seconds')
      }
    };
  }

  // Helper methods for metrics calculation
  calculateRate(metrics, metricName) {
    // Implementation for rate calculation
    return 0;
  }

  getAverage(metrics, metricName) {
    // Implementation for average calculation
    return 0;
  }

  getValue(metrics, metricName) {
    // Implementation to get metric value
    return 0;
  }

  calculateErrorRate(metrics) {
    // Implementation for error rate calculation
    return 0;
  }

  calculateCacheHitRate(metrics) {
    // Implementation for cache hit rate calculation
    return 0;
  }
}

module.exports = new TracingService();