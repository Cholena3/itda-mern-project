const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ITDA Project Management API',
      version: '2.0.0',
      description: 'A comprehensive project management system with real-time features, caching, and advanced security',
      contact: {
        name: 'ITDA Development Team',
        email: 'dev@itda.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.itda.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            username: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
            },
            department: {
              type: 'string',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Scheme: {
          type: 'object',
          required: ['schCode', 'schName', 'schType'],
          properties: {
            schCode: {
              type: 'string',
              description: 'Unique scheme code',
            },
            schName: {
              type: 'string',
              description: 'Scheme name',
            },
            schType: {
              type: 'string',
              enum: ['Central', 'State', 'Local'],
            },
            totalBudget: {
              type: 'number',
              description: 'Total budget allocated',
            },
            usedBudget: {
              type: 'number',
              description: 'Budget used so far',
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            status: {
              type: 'string',
              enum: ['Active', 'Completed', 'Pending'],
            },
          },
        },
        Project: {
          type: 'object',
          required: ['projCode', 'projName', 'schCode'],
          properties: {
            projCode: {
              type: 'string',
              description: 'Unique project code',
            },
            projName: {
              type: 'string',
              description: 'Project name',
            },
            schCode: {
              type: 'string',
              description: 'Parent scheme code',
            },
            location: {
              type: 'object',
              properties: {
                district: { type: 'string' },
                mandal: { type: 'string' },
                village: { type: 'string' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            allocatedBudget: {
              type: 'number',
            },
            spentBudget: {
              type: 'number',
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            status: {
              type: 'string',
              enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
            },
          },
        },
        Work: {
          type: 'object',
          required: ['workCode', 'workName', 'projCode'],
          properties: {
            workCode: {
              type: 'string',
              description: 'Unique work code',
            },
            workName: {
              type: 'string',
              description: 'Work name',
            },
            projCode: {
              type: 'string',
              description: 'Parent project code',
            },
            contractor: {
              type: 'string',
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            completionDate: {
              type: 'string',
              format: 'date',
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            photos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  uploadedAt: { type: 'string', format: 'date-time' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Schemes',
        description: 'Scheme management endpoints',
      },
      {
        name: 'Projects',
        description: 'Project management endpoints',
      },
      {
        name: 'Works',
        description: 'Work management endpoints',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and analytics endpoints',
      },
      {
        name: 'System',
        description: 'System health and metrics endpoints',
      },
    ],
  },
  apis: ['./backend/routes/*.js', './backend/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;