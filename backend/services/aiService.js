const OpenAI = require('openai');
const * as tf = require('@tensorflow/tfjs');
const { cache } = require('../config/redis');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-your-api-key',
    });
    this.model = null;
    this.initializeMLModel();
  }

  // Initialize TensorFlow model for predictions
  async initializeMLModel() {
    try {
      // Create a simple neural network for project completion prediction
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [5], units: 10, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      console.log('ML Model initialized successfully');
    } catch (error) {
      console.error('ML Model initialization error:', error);
    }
  }

  // AI-powered project insights
  async generateProjectInsights(project) {
    try {
      const cacheKey = `ai:insights:${project.projCode}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const prompt = `Analyze this project data and provide insights:
        Project: ${project.projName}
        Progress: ${project.progress}%
        Budget Used: ${project.spentBudget}/${project.allocatedBudget}
        Status: ${project.status}
        
        Provide:
        1. Risk assessment
        2. Optimization suggestions
        3. Predicted completion date
        4. Resource allocation recommendations`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const insights = {
        analysis: completion.choices[0].message.content,
        generatedAt: new Date().toISOString(),
        projectCode: project.projCode,
      };

      await cache.set(cacheKey, insights, 3600); // Cache for 1 hour
      return insights;
    } catch (error) {
      console.error('AI Insights error:', error);
      return {
        analysis: 'AI analysis temporarily unavailable',
        fallback: true
      };
    }
  }

  // Natural Language Query Processing
  async processNaturalQuery(query, context) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a project management assistant. Convert natural language queries to database queries."
          },
          {
            role: "user",
            content: `Convert this query to MongoDB filter: "${query}". Context: ${JSON.stringify(context)}`
          }
        ],
        max_tokens: 200,
      });

      const result = completion.choices[0].message.content;
      return this.parseQueryResponse(result);
    } catch (error) {
      console.error('NLQ error:', error);
      return null;
    }
  }

  // Smart Task Assignment using ML
  async recommendTaskAssignment(task, availableUsers) {
    try {
      // Prepare features for ML model
      const features = this.extractTaskFeatures(task, availableUsers);
      
      // Use TensorFlow model for prediction
      const prediction = this.model.predict(tf.tensor2d(features));
      const scores = await prediction.array();
      
      // Rank users by predicted success score
      const recommendations = availableUsers.map((user, index) => ({
        user,
        score: scores[index],
        reasoning: this.generateAssignmentReasoning(user, task, scores[index])
      })).sort((a, b) => b.score - a.score);

      return recommendations;
    } catch (error) {
      console.error('Task assignment error:', error);
      return availableUsers.map(user => ({
        user,
        score: 0.5,
        reasoning: 'ML prediction unavailable'
      }));
    }
  }

  // Anomaly Detection in Project Metrics
  async detectAnomalies(projectMetrics) {
    try {
      const features = this.extractMetricFeatures(projectMetrics);
      const tensor = tf.tensor2d([features]);
      
      // Simple anomaly detection using reconstruction error
      const encoded = this.model.predict(tensor);
      const reconstructionError = tf.losses.meanSquaredError(tensor, encoded);
      const errorValue = await reconstructionError.data();
      
      const threshold = 0.1; // Configurable threshold
      const isAnomaly = errorValue[0] > threshold;
      
      return {
        isAnomaly,
        score: errorValue[0],
        threshold,
        details: this.explainAnomaly(projectMetrics, errorValue[0])
      };
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return { isAnomaly: false, error: true };
    }
  }

  // Sentiment Analysis for Comments/Feedback
  async analyzeSentiment(text) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze sentiment and return JSON: {sentiment: 'positive'|'negative'|'neutral', score: 0-1, keywords: []}"
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 100,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', score: 0.5, error: true };
    }
  }

  // Intelligent Document Summarization
  async summarizeDocument(document) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Provide a concise summary of the following document in bullet points"
          },
          {
            role: "user",
            content: document
          }
        ],
        max_tokens: 300,
      });

      return {
        summary: completion.choices[0].message.content,
        wordCount: document.split(' ').length,
        summaryWordCount: completion.choices[0].message.content.split(' ').length
      };
    } catch (error) {
      console.error('Summarization error:', error);
      return { summary: 'Summary unavailable', error: true };
    }
  }

  // Predictive Analytics for Project Completion
  async predictProjectCompletion(project) {
    try {
      const features = [
        project.progress / 100,
        project.spentBudget / project.allocatedBudget,
        this.getDaysElapsed(project.startDate) / 365,
        project.teamSize / 10,
        project.complexity / 5
      ];

      const prediction = this.model.predict(tf.tensor2d([features]));
      const probability = await prediction.data();
      
      const daysRemaining = this.calculateDaysRemaining(project, probability[0]);
      
      return {
        completionProbability: probability[0],
        estimatedCompletionDate: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000),
        confidence: this.calculateConfidence(probability[0]),
        recommendations: this.generateCompletionRecommendations(project, probability[0])
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return { error: true };
    }
  }

  // Helper methods
  extractTaskFeatures(task, users) {
    // Extract relevant features for ML model
    return users.map(user => [
      task.priority || 3,
      task.complexity || 3,
      user.workload || 5,
      user.expertise || 3,
      user.availability || 5
    ]);
  }

  extractMetricFeatures(metrics) {
    return [
      metrics.progress || 0,
      metrics.budgetUtilization || 0,
      metrics.timeElapsed || 0,
      metrics.resourceUtilization || 0,
      metrics.qualityScore || 0
    ];
  }

  generateAssignmentReasoning(user, task, score) {
    if (score > 0.8) return `Excellent match: ${user.name} has high availability and expertise`;
    if (score > 0.6) return `Good match: ${user.name} is suitable for this task`;
    if (score > 0.4) return `Fair match: ${user.name} can handle this with support`;
    return `Consider alternatives: ${user.name} may be overloaded`;
  }

  explainAnomaly(metrics, score) {
    if (score > 0.3) return 'Significant deviation from normal patterns detected';
    if (score > 0.2) return 'Moderate anomaly detected in project metrics';
    if (score > 0.1) return 'Minor deviation from expected patterns';
    return 'Metrics within normal range';
  }

  getDaysElapsed(startDate) {
    return Math.floor((Date.now() - new Date(startDate)) / (1000 * 60 * 60 * 24));
  }

  calculateDaysRemaining(project, probability) {
    const baseEstimate = (100 - project.progress) * 2; // Simple heuristic
    return Math.floor(baseEstimate / probability);
  }

  calculateConfidence(probability) {
    if (probability > 0.9) return 'Very High';
    if (probability > 0.75) return 'High';
    if (probability > 0.5) return 'Medium';
    if (probability > 0.25) return 'Low';
    return 'Very Low';
  }

  generateCompletionRecommendations(project, probability) {
    const recommendations = [];
    
    if (probability < 0.5) {
      recommendations.push('Consider allocating additional resources');
      recommendations.push('Review and adjust project timeline');
    }
    
    if (project.spentBudget / project.allocatedBudget > 0.8) {
      recommendations.push('Monitor budget closely - nearing limit');
    }
    
    if (project.progress < 50 && this.getDaysElapsed(project.startDate) > 180) {
      recommendations.push('Project pace is slow - consider acceleration strategies');
    }
    
    return recommendations;
  }

  parseQueryResponse(response) {
    try {
      // Parse AI response to MongoDB query
      return JSON.parse(response);
    } catch {
      return { $text: { $search: response } };
    }
  }
}

module.exports = new AIService();