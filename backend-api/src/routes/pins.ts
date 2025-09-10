import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { createPinSchema, pinIdParamSchema } from '../lib/validation';
import { generatePinId, extractWorkflowSources, createSuccessResponse } from '../lib/utils';
import { ERRORS, createNotFoundError, createAuthzError } from '../lib/errors';

// Import auth plugin to get type declarations
import '../plugins/auth';

export async function pinRoutes(fastify: FastifyInstance<ZodTypeProvider>) {
  
  // POST /api/pins/send - Create or update pin data
  fastify.post('/api/pins/send', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Create or update pin data',
      tags: ['Pins'],
      body: createPinSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          pid: z.string(),
          message: z.string(),
          data: z.any()
        }),
        400: z.object({
          error: z.string(),
          message: z.string()
        }),
        500: z.object({
          error: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { wid, data_type, content, api_key, metadata } = request.body as any;
      const userId = request.user!.user_id;
      
      // Generate unique pin ID (Firebase will create the actual key)
      const generatedPid = generatePinId();
      
      // Extract workflow sources from content if it's markdown
      const workflowSources = data_type === 'markdown' 
        ? extractWorkflowSources(content) 
        : [wid];
      
      // Prepare pin data
      const pinData = {
        id: generatedPid,
        user_id: userId,
        wid,
        data_type,
        content,
        metadata: {
          title: metadata?.title || 'Untitled Pin',
          description: metadata?.description || '',
          tags: metadata?.tags || [],
          workflow_sources: workflowSources,
          created_at: new Date().toISOString(),
          is_public: metadata?.is_public || false,
          ...metadata
        },
        permissions: {
          is_public: metadata?.is_public || false,
          created_by: userId
        }
      };
      
      // Save to Firebase
      const createdPid = await fastify.firebase.createPin(pinData);
      
      fastify.log.info(`Created pin ${createdPid} for user ${userId}`);
      
      return reply.code(200).send({
        success: true,
        pid: createdPid,
        message: 'Pin created successfully',
        data: pinData
      });
      
    } catch (error) {
      fastify.log.error(`Error creating pin: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // GET /api/pins/:pid - Get pin by ID
  fastify.get('/api/pins/:pid', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get pin by ID',
      tags: ['Pins'],
      params: pinIdParamSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any()
        }),
        403: z.object({
          error: z.string(),
          message: z.string()
        }),
        404: z.object({
          error: z.string(),
          message: z.string()
        }),
        500: z.object({
          error: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as any;
      const userId = request.user!.user_id;
      
      // Get pin from Firebase
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const snapshot = await pinRef.once('value');
      
      if (!snapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }
      
      const pinData = snapshot.val();
      
      // Check permissions
      if (!pinData.permissions.is_public && pinData.user_id !== userId) {
        throw createAuthzError('PERMISSION_DENIED', 'You do not have permission to access this pin');
      }
      
      return reply.code(200).send(createSuccessResponse(pinData));
      
    } catch (error) {
      fastify.log.error(`Error getting pin: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // GET /api/pins - List user's pins
  fastify.get('/api/pins', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'List user\'s pins',
      tags: ['Pins'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                pins: { type: 'array' },
                total: { type: 'number' }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user!.user_id;
      const { limit = 50, offset = 0 } = request.query as any;
      
      // Get user's pins from Firebase
      const userPinsRef = fastify.firebase.db.ref(`user_pins/${userId}`);
      const snapshot = await userPinsRef.once('value');
      
      if (!snapshot.exists()) {
        return reply.code(200).send(createSuccessResponse({
          pins: [],
          total: 0
        }));
      }
      
      const userPins = snapshot.val();
      const pinIds = Object.keys(userPins);
      
      // Apply pagination
      const paginatedPinIds = pinIds.slice(offset, offset + limit);
      
      // Get full pin data for paginated pins
      const pins = [];
      for (const pid of paginatedPinIds) {
        const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
        const pinSnapshot = await pinRef.once('value');
        if (pinSnapshot.exists()) {
          pins.push(pinSnapshot.val());
        }
      }
      
      return reply.code(200).send(createSuccessResponse({
        pins,
        total: pinIds.length
      }));
      
    } catch (error) {
      fastify.log.error(`Error listing pins: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // DELETE /api/pins/:pid - Delete pin
  fastify.delete('/api/pins/:pid', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Delete pin',
      tags: ['Pins'],
      params: pinIdParamSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as any;
      const userId = request.user!.user_id;
      
      // Check if pin exists and user owns it
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const snapshot = await pinRef.once('value');
      
      if (!snapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }
      
      const pinData = snapshot.val();
      
      if (pinData.user_id !== userId) {
        throw createAuthzError('PERMISSION_DENIED', 'You can only delete your own pins');
      }
      
      // Delete pin and user index
      const updates: Record<string, any> = {};
      updates[`pins/${pid}`] = null;
      updates[`user_pins/${userId}/${pid}`] = null;
      
      // Also delete workflow data if it exists
      updates[`workflow_data/${pid}`] = null;
      
      await fastify.firebase.db.ref().update(updates);
      
      fastify.log.info(`Deleted pin ${pid} for user ${userId}`);
      
      return reply.code(200).send(createSuccessResponse(
        null,
        'Pin deleted successfully'
      ));
      
    } catch (error) {
      fastify.log.error(`Error deleting pin: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });
}
