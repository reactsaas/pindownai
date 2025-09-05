import fastify from 'fastify';

const server = fastify({
  logger: true
});

const PORT = parseInt(process.env.PORT || '8000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Register Swagger
async function registerSwagger() {
  await server.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'PinDown.ai API',
        description: 'API for transforming automation outputs into shareable pins',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server'
        }
      ],
    }
  });

  await server.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });
}

// Register routes after Swagger
async function registerRoutes() {
  // Basic routes with Swagger schemas
  server.get('/', {
    schema: {
      description: 'API root endpoint',
      tags: ['General'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return { message: 'Fastify TypeScript API is running!' };
  });

  server.get('/api/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString() 
    };
  });

  // Example API endpoint
  server.get('/api/pins', {
    schema: {
      description: 'Get all pins',
      tags: ['Pins'],
      response: {
        200: {
          type: 'object',
          properties: {
            pins: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return { 
      pins: [
        { id: 1, title: 'Sample Pin', content: 'This is a sample pin' }
      ]
    };
  });
}

// Start server
async function start() {
  try {
    // Register Swagger first
    await registerSwagger();
    
    // Then register routes
    await registerRoutes();
    
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`🚀 Server running on http://localhost:${PORT}`);
    server.log.info(`📚 API Documentation available at http://localhost:${PORT}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();