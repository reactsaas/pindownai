import fastify from 'fastify';
import dotenv from 'dotenv';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import firebasePlugin from './plugins/firebase';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';
import { pinRoutes } from './routes/pins/index';
import { workflowDataRoutes } from './routes/workflow-data';
import { authRoutes } from './routes/auth';
import { publicPinRoutes } from './routes/public/pins';

// Load environment variables
dotenv.config();

const server = fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>();

// Set up Zod type provider
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

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
  // Register API routes
  await server.register(pinRoutes);
  await server.register(workflowDataRoutes);
  await server.register(authRoutes);
  await server.register(publicPinRoutes);
  
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

  // Example API endpoint removed - handled by pinRoutes
}

// Register plugins
async function registerPlugins() {
  // Register CORS first
  await server.register(require('@fastify/cors'), {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Register Error Handler
  await server.register(errorHandlerPlugin);
  
  // Register Firebase plugin
  await server.register(firebasePlugin);
  
  // Register Auth plugin
  await server.register(authPlugin);
}


// Start server
async function start() {
  try {
    // Register plugins first
    await registerPlugins();
    
    // Register Swagger
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

// Only start server if this file is run directly
if (require.main === module) {
  start();
}