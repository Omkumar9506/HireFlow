import swaggerJsdoc from 'swagger-jsdoc';
import { ENV } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HireFlow ATS - Enterprise Recruitment API',
      version: '1.0.0',
      description: 'API documentation for HireFlow Applicant Tracking System & Job Portal',
      contact: {
        name: 'HireFlow Support',
        email: 'support@hireflow.dev',
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}/api/v1`,
        description: 'Development Server',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
