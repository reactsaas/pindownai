import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { 
  createPinboardSchema, 
  updatePinboardSchema,
  pinboardIdParamSchema,
  successResponseSchema,
  errorResponseSchema,
  CreatePinboardRequest,
  UpdatePinboardRequest,
  PinboardIdParams
} from '../../lib/validation';
import { createSuccessResponse } from '../../lib/utils';
import { ERRORS, createNotFoundError, createAuthzError } from '../../lib/errors';

// Import auth plugin to get type declarations
import '../../plugins/auth';

export async function pinboardRoutes(fastify: FastifyInstance) {
  // POST /api/pinboards - Create new pinboard
  fastify.post('/api/pinboards', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Create a new pinboard',
      tags: ['Pinboards'],
      body: createPinboardSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any(),
          message: z.string(),
          timestamp: z.string()
        }),
        400: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const pinboardData = request.body as CreatePinboardRequest;
      
      // Add user_id to pinboard data
      const pinboardWithUser = {
        ...pinboardData,
        user_id: user.user_id
      };
      
      const pinboardId = await (fastify as any).firebase.createPinboard(pinboardWithUser);
      
      // Get the created pinboard to return full object
      const createdPinboard = await (fastify as any).firebase.getPinboard(pinboardId);
      
      const response = createSuccessResponse(
        createdPinboard,
        'Pinboard created successfully'
      );
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error creating pinboard: ${error}`);
      return reply.code(500).send({
        error: 'Failed to create pinboard',
        message: 'PINBOARD_CREATE_ERROR'
      });
    }
  });

  // GET /api/pinboards - Get user's pinboards
  fastify.get('/api/pinboards', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get user\'s pinboards',
      tags: ['Pinboards'],
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(z.any()),
          message: z.string(),
          timestamp: z.string()
        }),
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const pinboards = await (fastify as any).firebase.getUserPinboards(user.user_id);
      
      const response = createSuccessResponse(
        pinboards,
        'Pinboards retrieved successfully'
      );
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error getting pinboards: ${error}`);
      return reply.code(500).send({
        error: 'Failed to retrieve pinboards',
        message: 'PINBOARD_GET_ERROR'
      });
    }
  });

  // GET /api/pinboards/:pinboardId - Get specific pinboard
  fastify.get('/api/pinboards/:pinboardId', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get specific pinboard',
      tags: ['Pinboards'],
      params: pinboardIdParamSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any(),
          message: z.string(),
          timestamp: z.string()
        }),
        404: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const { pinboardId } = request.params as PinboardIdParams;
      
      const pinboard = await (fastify as any).firebase.getPinboard(pinboardId);
      
      if (!pinboard) {
        return reply.code(404).send({
          error: 'Pinboard not found',
          message: 'PINBOARD_NOT_FOUND'
        });
      }
      
      // Check if user owns this pinboard
      if (pinboard.user_id !== user.user_id) {
        return reply.code(403).send({
          error: 'Access denied to this pinboard',
          message: 'PINBOARD_ACCESS_DENIED'
        });
      }
      
      const response = createSuccessResponse(
        'Pinboard retrieved successfully',
        pinboard
      );
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error getting pinboard: ${error}`);
      return reply.code(500).send({
        error: 'Failed to retrieve pinboard',
        message: 'PINBOARD_GET_ERROR'
      });
    }
  });

  // PUT /api/pinboards/:pinboardId - Update pinboard
  fastify.put('/api/pinboards/:pinboardId', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Update pinboard',
      tags: ['Pinboards'],
      params: pinboardIdParamSchema,
      body: updatePinboardSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.any(),
          timestamp: z.string()
        }),
        404: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const { pinboardId } = request.params as PinboardIdParams;
      const updateData = request.body as UpdatePinboardRequest;
      
      // Check if pinboard exists and user owns it
      const existingPinboard = await (fastify as any).firebase.getPinboard(pinboardId);
      
      if (!existingPinboard) {
        return reply.code(404).send({
          error: 'Pinboard not found',
          message: 'PINBOARD_NOT_FOUND'
        });
      }
      
      if (existingPinboard.user_id !== user.user_id) {
        return reply.code(403).send({
          error: 'Access denied to this pinboard',
          message: 'PINBOARD_ACCESS_DENIED'
        });
      }
      
      await (fastify as any).firebase.updatePinboard(pinboardId, updateData);
      
      const response = createSuccessResponse(
        'Pinboard updated successfully',
        pinboardId
      );
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error updating pinboard: ${error}`);
      return reply.code(500).send({
        error: 'Failed to update pinboard',
        message: 'PINBOARD_UPDATE_ERROR'
      });
    }
  });

  // DELETE /api/pinboards/:pinboardId - Delete pinboard
  fastify.delete('/api/pinboards/:pinboardId', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Delete pinboard',
      tags: ['Pinboards'],
      params: pinboardIdParamSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          timestamp: z.string()
        }),
        404: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const { pinboardId } = request.params as PinboardIdParams;
      
      // Check if pinboard exists and user owns it
      const existingPinboard = await (fastify as any).firebase.getPinboard(pinboardId);
      
      if (!existingPinboard) {
        return reply.code(404).send({
          error: 'Pinboard not found',
          message: 'PINBOARD_NOT_FOUND'
        });
      }
      
      if (existingPinboard.user_id !== user.user_id) {
        return reply.code(403).send({
          error: 'Access denied to this pinboard',
          message: 'PINBOARD_ACCESS_DENIED'
        });
      }
      
      await (fastify as any).firebase.deletePinboard(pinboardId);
      
      const response = createSuccessResponse('Pinboard deleted successfully');
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error deleting pinboard: ${error}`);
      return reply.code(500).send({
        error: 'Failed to delete pinboard',
        message: 'PINBOARD_DELETE_ERROR'
      });
    }
  });

  // POST /api/pinboards/:pinboardId/pins - Add pin to pinboard
  fastify.post('/api/pinboards/:pinboardId/pins', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Add pin to pinboard',
      tags: ['Pinboards'],
      params: pinboardIdParamSchema,
      body: z.object({
        pinId: z.string().min(1, 'Pin ID is required')
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          timestamp: z.string()
        }),
        404: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const { pinboardId } = request.params as PinboardIdParams;
      const { pinId } = request.body as { pinId: string };
      
      // Check if pinboard exists and user owns it
      const existingPinboard = await (fastify as any).firebase.getPinboard(pinboardId);
      
      if (!existingPinboard) {
        return reply.code(404).send({
          error: 'Pinboard not found',
          message: 'PINBOARD_NOT_FOUND'
        });
      }
      
      if (existingPinboard.user_id !== user.user_id) {
        return reply.code(403).send({
          error: 'Access denied to this pinboard',
          message: 'PINBOARD_ACCESS_DENIED'
        });
      }
      
      await (fastify as any).firebase.addPinToPinboard(pinboardId, pinId);
      
      const response = createSuccessResponse('Pin added to pinboard successfully');
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error adding pin to pinboard: ${error}`);
      return reply.code(500).send({
        error: 'Failed to add pin to pinboard',
        message: 'PINBOARD_PIN_ADD_ERROR'
      });
    }
  });

  // DELETE /api/pinboards/:pinboardId/pins/:pinId - Remove pin from pinboard
  fastify.delete('/api/pinboards/:pinboardId/pins/:pinId', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Remove pin from pinboard',
      tags: ['Pinboards'],
      params: z.object({
        pinboardId: z.string().min(1, 'Pinboard ID is required'),
        pinId: z.string().min(1, 'Pin ID is required')
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          timestamp: z.string()
        }),
        404: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const { pinboardId, pinId } = request.params as { pinboardId: string; pinId: string };
      
      // Check if pinboard exists and user owns it
      const existingPinboard = await (fastify as any).firebase.getPinboard(pinboardId);
      
      if (!existingPinboard) {
        return reply.code(404).send({
          error: 'Pinboard not found',
          message: 'PINBOARD_NOT_FOUND'
        });
      }
      
      if (existingPinboard.user_id !== user.user_id) {
        return reply.code(403).send({
          error: 'Access denied to this pinboard',
          message: 'PINBOARD_ACCESS_DENIED'
        });
      }
      
      await (fastify as any).firebase.removePinFromPinboard(pinboardId, pinId);
      
      const response = createSuccessResponse('Pin removed from pinboard successfully');
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error removing pin from pinboard: ${error}`);
      return reply.code(500).send({
        error: 'Failed to remove pin from pinboard',
        message: 'PINBOARD_PIN_REMOVE_ERROR'
      });
    }
  });
}
