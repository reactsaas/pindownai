import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';
import { createErrorResponse, isAppError, isValidationError } from '../lib/errors';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<ZodTypeProvider>) => {
  // Global Error Handler
  fastify.setErrorHandler(async (error, request, reply) => {
    // Log error for debugging
    fastify.log.error({
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      statusCode: error.statusCode
    }, 'Request error occurred');

    // Handle Zod validation errors
    if (hasZodFastifySchemaValidationErrors(error)) {
      const errorResponse = createErrorResponse(error);
      return reply.code(400).send(errorResponse);
    }

    // Handle custom AppError
    if (isAppError(error)) {
      const errorResponse = createErrorResponse(error);
      return reply.code(error.statusCode).send(errorResponse);
    }

    // Handle Fastify validation errors
    if (isValidationError(error)) {
      const errorResponse = createErrorResponse(error);
      return reply.code(400).send(errorResponse);
    }

    // Handle generic errors
    const errorResponse = createErrorResponse(error);
    return reply.code(500).send(errorResponse);
  });

  // 404 Handler
  fastify.setNotFoundHandler(async (request, reply) => {
    const errorResponse = createErrorResponse({
      code: 'RESOURCE_NOT_FOUND',
      type: 'not_found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404
    } as any);
    
    return reply.code(404).send(errorResponse);
  });
};

export default fp(errorHandlerPlugin);


