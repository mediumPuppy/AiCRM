import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Keys API',
      version: '1.0.0',
      description: 'API documentation for API Keys management',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
