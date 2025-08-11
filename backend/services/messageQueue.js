const { Queue, Worker, QueueScheduler } = require('bullmq');
const { Kafka } = require('kafkajs');
const Redis = require('ioredis');
const EventEmitter = require('events');

class MessageQueueService extends EventEmitter {
  constructor() {
    super();
    this.connection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null
    });

    // Initialize queues for different job types
    this.queues = {
      email: new Queue('email', { connection: this.connection }),
      analytics: new Queue('analytics', { connection: this.connection }),
      aiProcessing: new Queue('ai-processing', { connection: this.connection }),
      dataExport: new Queue('data-export', { connection: this.connection }),
      notifications: new Queue('notifications', { connection: this.connection }),
      audit: new Queue('audit-log', { connection: this.connection }),
      imageProcessing: new Queue('image-processing', { connection: this.connection }),
      reports: new Queue('reports', { connection: this.connection })
    };

    // Initialize Kafka for event streaming
    this.kafka = new Kafka({
      clientId: 'itda-app',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'itda-group' });

    this.initializeWorkers();
    this.initializeSchedulers();
    this.initializeKafka();
  }

  // Initialize workers for processing jobs
  initializeWorkers() {
    // Email Worker
    new Worker('email', async job => {
      console.log(`Processing email job ${job.id}`);
      const { to, subject, body, template } = job.data;
      
      // Simulate email sending
      await this.sendEmail(to, subject, body, template);
      
      return { success: true, sentAt: new Date() };
    }, { connection: this.connection });

    // Analytics Worker
    new Worker('analytics', async job => {
      console.log(`Processing analytics job ${job.id}`);
      const { type, data } = job.data;
      
      switch (type) {
        case 'project-metrics':
          return await this.calculateProjectMetrics(data);
        case 'budget-analysis':
          return await this.analyzeBudget(data);
        case 'performance-report':
          return await this.generatePerformanceReport(data);
        default:
          throw new Error(`Unknown analytics type: ${type}`);
      }
    }, { 
      connection: this.connection,
      concurrency: 5 
    });

    // AI Processing Worker
    new Worker('ai-processing', async job => {
      console.log(`Processing AI job ${job.id}`);
      const { task, data } = job.data;
      const aiService = require('./aiService');
      
      switch (task) {
        case 'generate-insights':
          return await aiService.generateProjectInsights(data);
        case 'predict-completion':
          return await aiService.predictProjectCompletion(data);
        case 'detect-anomalies':
          return await aiService.detectAnomalies(data);
        case 'sentiment-analysis':
          return await aiService.analyzeSentiment(data);
        default:
          throw new Error(`Unknown AI task: ${task}`);
      }
    }, { 
      connection: this.connection,
      concurrency: 3 
    });

    // Data Export Worker
    new Worker('data-export', async job => {
      console.log(`Processing export job ${job.id}`);
      const { format, query, userId } = job.data;
      
      const result = await this.exportData(format, query);
      
      // Notify user when export is ready
      await this.queues.notifications.add('export-complete', {
        userId,
        downloadUrl: result.url,
        expiresAt: result.expiresAt
      });
      
      return result;
    }, { 
      connection: this.connection,
      concurrency: 2 
    });

    // Image Processing Worker
    new Worker('image-processing', async job => {
      console.log(`Processing image job ${job.id}`);
      const { imagePath, operations } = job.data;
      
      return await this.processImage(imagePath, operations);
    }, { 
      connection: this.connection,
      concurrency: 4 
    });
  }

  // Initialize job schedulers
  initializeSchedulers() {
    // Daily analytics calculation
    this.queues.analytics.add(
      'daily-metrics',
      { type: 'calculate-daily-metrics' },
      {
        repeat: {
          pattern: '0 2 * * *' // Run at 2 AM daily
        }
      }
    );

    // Weekly reports
    this.queues.reports.add(
      'weekly-report',
      { type: 'generate-weekly-report' },
      {
        repeat: {
          pattern: '0 9 * * MON' // Run at 9 AM every Monday
        }
      }
    );

    // Hourly anomaly detection
    this.queues.aiProcessing.add(
      'anomaly-detection',
      { task: 'detect-anomalies', scope: 'all-projects' },
      {
        repeat: {
          pattern: '0 * * * *' // Run every hour
        }
      }
    );
  }

  // Initialize Kafka for event streaming
  async initializeKafka() {
    try {
      await this.producer.connect();
      await this.consumer.connect();

      // Subscribe to topics
      await this.consumer.subscribe({ 
        topics: ['project-events', 'user-events', 'system-events'],
        fromBeginning: false 
      });

      // Process incoming events
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const event = JSON.parse(message.value.toString());
          this.emit('kafka-event', { topic, event });
          
          // Process based on topic
          switch (topic) {
            case 'project-events':
              await this.handleProjectEvent(event);
              break;
            case 'user-events':
              await this.handleUserEvent(event);
              break;
            case 'system-events':
              await this.handleSystemEvent(event);
              break;
          }
        }
      });

      console.log('Kafka initialized successfully');
    } catch (error) {
      console.error('Kafka initialization error:', error);
    }
  }

  // Publish event to Kafka
  async publishEvent(topic, event) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.id || Date.now().toString(),
            value: JSON.stringify({
              ...event,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
    } catch (error) {
      console.error(`Error publishing to ${topic}:`, error);
    }
  }

  // Add job to queue
  async addJob(queueName, jobName, data, options = {}) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options
    });

    return job.id;
  }

  // Bulk add jobs
  async addBulkJobs(queueName, jobs) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const bulkJobs = jobs.map(job => ({
      name: job.name,
      data: job.data,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        ...job.options
      }
    }));

    return await queue.addBulk(bulkJobs);
  }

  // Get job status
  async getJobStatus(queueName, jobId) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      state: await job.getState(),
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn
    };
  }

  // Get queue metrics
  async getQueueMetrics(queueName) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  // Event handlers
  async handleProjectEvent(event) {
    switch (event.type) {
      case 'project.created':
        await this.queues.notifications.add('notify-team', {
          type: 'project-created',
          projectId: event.data.projectId
        });
        break;
      case 'project.updated':
        await this.queues.analytics.add('update-metrics', {
          type: 'project-metrics',
          data: event.data
        });
        break;
      case 'project.completed':
        await this.queues.reports.add('generate-completion-report', {
          projectId: event.data.projectId
        });
        break;
    }
  }

  async handleUserEvent(event) {
    switch (event.type) {
      case 'user.registered':
        await this.queues.email.add('welcome-email', {
          to: event.data.email,
          template: 'welcome'
        });
        break;
      case 'user.login':
        await this.queues.audit.add('log-activity', {
          action: 'login',
          userId: event.data.userId
        });
        break;
    }
  }

  async handleSystemEvent(event) {
    switch (event.type) {
      case 'error.critical':
        await this.queues.notifications.add('alert-admins', {
          level: 'critical',
          message: event.data.message
        });
        break;
      case 'performance.degraded':
        await this.queues.analytics.add('analyze-performance', {
          metrics: event.data.metrics
        });
        break;
    }
  }

  // Helper methods
  async sendEmail(to, subject, body, template) {
    // Email sending implementation
    console.log(`Sending email to ${to}: ${subject}`);
    return true;
  }

  async calculateProjectMetrics(data) {
    // Metrics calculation implementation
    return { calculated: true, metrics: {} };
  }

  async analyzeBudget(data) {
    // Budget analysis implementation
    return { analyzed: true, insights: {} };
  }

  async generatePerformanceReport(data) {
    // Report generation implementation
    return { generated: true, reportUrl: '/reports/123' };
  }

  async exportData(format, query) {
    // Data export implementation
    return { 
      url: `/exports/${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  async processImage(imagePath, operations) {
    // Image processing implementation
    return { processed: true, outputPath: imagePath };
  }

  // Cleanup
  async shutdown() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    await this.connection.quit();
  }
}

module.exports = new MessageQueueService();