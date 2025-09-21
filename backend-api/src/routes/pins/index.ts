import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { 
  createPinSchema, 
  pinIdParamSchema,
  createDatasetSchema,
  datasetIdParamSchema,
  successResponseSchema,
  errorResponseSchema,
  CreateDatasetRequest,
  DatasetIdParams
} from '../../lib/validation';
import { generatePinId, extractWorkflowSources, createSuccessResponse } from '../../lib/utils';
import { ERRORS, createNotFoundError, createAuthzError } from '../../lib/errors';

// Import auth plugin to get type declarations
import '../../plugins/auth';

export async function pinRoutes(fastify: FastifyInstance) {
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
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { data_type, metadata } = request.body as any;
      const userId = request.user!.user_id;
      const generatedPid = generatePinId();

      const pinData = {
        id: generatedPid,
        user_id: userId,
        wid: null, // No workflow ID for new pins
        data_type: data_type || 'markdown',
        content: '', // Empty content for new pins
        metadata: {
          title: metadata?.title || 'Untitled Pin',
          description: metadata?.description || '',
          tags: metadata?.tags || [],
          workflow_sources: [], // No workflow sources for new pins
          created_at: new Date().toISOString(),
          is_public: metadata?.is_public || false,
          ...metadata
        },
        permissions: {
          is_public: metadata?.is_public || false,
          created_by: userId
        }
      };

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
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as any;
      const userId = request.user!.user_id;

      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const snapshot = await pinRef.once('value');

      if (!snapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      const pinData = snapshot.val();

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
      querystring: z.object({
        limit: z.coerce.number().default(50),
        offset: z.coerce.number().default(0)
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            pins: z.array(z.any()),
            total: z.number()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user!.user_id;
      const { limit, offset } = request.query as { limit: number; offset: number };

      const allUserPins = await fastify.firebase.getUserPins(userId);
      
      // Apply pagination
      const paginatedPins = allUserPins.slice(offset, offset + limit);

      return reply.code(200).send(createSuccessResponse({
        pins: paginatedPins,
        total: allUserPins.length
      }));
    } catch (error) {
      fastify.log.error(`Error listing pins: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // DELETE /api/pins/:pid - Delete pin
  fastify.delete('/api/pins/:pid', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Delete pin',
      tags: ['Pins'],
      params: pinIdParamSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.any().optional(),
          timestamp: z.string()
        }),
        403: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500:         z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as any;
      
      // Handle development mode
      if (process.env.NODE_ENV === 'development') {
        fastify.log.info(`Deleting pin: ${pid} (development mode - no auth)`);
      } else {
        const userId = request.user!.user_id;
        const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
        const snapshot = await pinRef.once('value');

        if (!snapshot.exists()) {
          throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
        }

        const pinData = snapshot.val();
        if (pinData.user_id !== userId) {
          throw createAuthzError('PERMISSION_DENIED', 'You can only delete your own pins');
        }
      }

      // Delete the pin and related data
      const updates: Record<string, any> = {};
      updates[`pins/${pid}`] = null;
      updates[`workflow_data/${pid}`] = null;
      
      // In production, also remove from user_pins
      if (process.env.NODE_ENV !== 'development') {
        const userId = request.user!.user_id;
        updates[`user_pins/${userId}/${pid}`] = null;
      }

      await fastify.firebase.db.ref().update(updates);
      fastify.log.info(`Deleted pin ${pid}`);

      return reply.code(200).send(createSuccessResponse(
        { pinId: pid },
        'Pin deleted successfully'
      ));
    } catch (error) {
      fastify.log.error(`Error deleting pin: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // PUT /api/pins/:pid - Update pin
  fastify.put('/api/pins/:pid', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Update pin',
      tags: ['Pins'],
      params: pinIdParamSchema,
      body: z.object({
        metadata: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          is_public: z.boolean().optional()
        }).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any(),
          message: z.string()
        }),
        403: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as any;
      const updateData = request.body as any;

      // Handle development mode
      if (process.env.NODE_ENV === 'development') {
        fastify.log.info(`Updating pin: ${pid} (development mode - no auth)`);
      } else {
        const userId = request.user!.user_id;
        const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
        const snapshot = await pinRef.once('value');

        if (!snapshot.exists()) {
          throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
        }

        const pinData = snapshot.val();
        if (pinData.user_id !== userId) {
          throw createAuthzError('PERMISSION_DENIED', 'You can only update your own pins');
        }
      }

      // Get current pin data and update it
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const snapshot = await pinRef.once('value');

      if (!snapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      const pinData = snapshot.val();
      const updatedPinData = {
        ...pinData,
        metadata: {
          ...pinData.metadata,
          ...updateData.metadata,
          updated_at: new Date().toISOString()
        }
      };

      await pinRef.set(updatedPinData);
      fastify.log.info(`Updated pin ${pid}`);

      return reply.code(200).send(createSuccessResponse(
        updatedPinData,
        'Pin updated successfully'
      ));
    } catch (error) {
      fastify.log.error(`Error updating pin: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // ===== BLOCKS CRUD ROUTES =====

  // POST /api/pins/:pid/blocks - Create a new block for a pin
  fastify.post('/api/pins/:pid/blocks', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Create a new block for a pin',
      tags: ['Blocks'],
      params: z.object({
        pid: z.string().min(1, 'Pin ID is required')
      }),
      body: z.object({
        name: z.string().min(1, 'Block name is required'),
        type: z.enum(['markdown', 'mermaid', 'conditional', 'image', 'image-steps']),
        template: z.string().min(1, 'Template content is required'),
        order: z.number().int().min(0).default(0)
      }),
      response: {
        201: z.object({
          success: z.boolean(),
          data: z.object({
            blockId: z.string(),
            block: z.any()
          })
        }),
        400: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };
      const blockData = request.body;

      // Verify pin exists (optional check for development)
      if (process.env.NODE_ENV === 'development') {
        fastify.log.info(`Creating block for pin: ${pid} (development mode - no auth)`);
      } else {
        // In production, verify user owns the pin
        const userId = request.user!.user_id;
        const userPins = await fastify.firebase.getUserPins(userId);
        const pinExists = userPins.some(pin => pin.id === pid);
        
        if (!pinExists) {
          throw ERRORS.RESOURCE_NOT_FOUND;
        }
      }

      const blockId = await fastify.firebase.createBlock(pid, blockData);
      
      return reply.code(201).send(createSuccessResponse({
        blockId,
        block: { ...(blockData as any), id: blockId }
      }));
    } catch (error) {
      fastify.log.error(`Error creating block: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // GET /api/pins/:pid/blocks - Get all blocks for a pin
  fastify.get('/api/pins/:pid/blocks', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Get all blocks for a pin',
      tags: ['Blocks'],
      params: z.object({
        pid: z.string().min(1, 'Pin ID is required')
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            blocks: z.array(z.any()),
            count: z.number()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };

      // Verify pin exists (optional check for development)
      if (process.env.NODE_ENV === 'development') {
        fastify.log.info(`Getting blocks for pin: ${pid} (development mode - no auth)`);
      } else {
        // In production, verify user owns the pin
        const userId = request.user!.user_id;
        const userPins = await fastify.firebase.getUserPins(userId);
        const pinExists = userPins.some(pin => pin.id === pid);
        
        if (!pinExists) {
          throw ERRORS.RESOURCE_NOT_FOUND;
        }
      }

      const blocks = await fastify.firebase.getPinBlocks(pid);
      
      return reply.code(200).send(createSuccessResponse({
        blocks,
        count: blocks.length
      }));
    } catch (error) {
      fastify.log.error(`Error getting blocks: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // PUT /api/pins/:pid/blocks/:blockId - Update a block
  fastify.put('/api/pins/:pid/blocks/:blockId', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Update a block',
      tags: ['Blocks'],
      params: z.object({
        pid: z.string().min(1, 'Pin ID is required'),
        blockId: z.string().min(1, 'Block ID is required')
      }),
      body: z.object({
        name: z.string().min(1, 'Block name is required').optional(),
        type: z.enum(['markdown', 'mermaid', 'conditional', 'image', 'image-steps']).optional(),
        template: z.string().min(1, 'Template content is required').optional(),
        order: z.number().int().min(0).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            blockId: z.string(),
            message: z.string()
          })
        }),
        400: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid, blockId } = request.params as { pid: string; blockId: string };
      const blockData = request.body;

      // Verify pin exists (optional check for development)
      if (process.env.NODE_ENV === 'development') {
        fastify.log.info(`Updating block ${blockId} for pin: ${pid} (development mode - no auth)`);
      } else {
        // In production, verify user owns the pin
        const userId = request.user!.user_id;
        const userPins = await fastify.firebase.getUserPins(userId);
        const pinExists = userPins.some(pin => pin.id === pid);
        
        if (!pinExists) {
          throw ERRORS.RESOURCE_NOT_FOUND;
        }
      }

      await fastify.firebase.updateBlock(pid, blockId, blockData);
      
      return reply.code(200).send(createSuccessResponse({
        blockId,
        message: 'Block updated successfully'
      }));
    } catch (error) {
      fastify.log.error(`Error updating block: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // DELETE /api/pins/:pid/blocks/:blockId - Delete a block
  fastify.delete('/api/pins/:pid/blocks/:blockId', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Delete a block',
      tags: ['Blocks'],
      params: z.object({
        pid: z.string().min(1, 'Pin ID is required'),
        blockId: z.string().min(1, 'Block ID is required')
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            blockId: z.string(),
            message: z.string()
          })
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        }),
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            details: z.any().optional(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid, blockId } = request.params as { pid: string; blockId: string };

      // Verify pin exists (optional check for development)
      if (process.env.NODE_ENV === 'development') {
        fastify.log.info(`Deleting block ${blockId} for pin: ${pid} (development mode - no auth)`);
      } else {
        // In production, verify user owns the pin
        const userId = request.user!.user_id;
        const userPins = await fastify.firebase.getUserPins(userId);
        const pinExists = userPins.some(pin => pin.id === pid);
        
        if (!pinExists) {
          throw ERRORS.RESOURCE_NOT_FOUND;
        }
      }

      await fastify.firebase.deleteBlock(pid, blockId);
      
      return reply.code(200).send(createSuccessResponse({
        blockId,
        message: 'Block deleted successfully'
      }));
    } catch (error) {
      fastify.log.error(`Error deleting block: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // POST /api/pins/:pid/publish - Make pin public
  fastify.post('/api/pins/:pid/publish', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Publish pin to make it publicly accessible',
      tags: ['Pins'],
      params: pinIdParamSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            pinId: z.string(),
            is_public: z.boolean()
          }),
          timestamp: z.string()
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };
      
      // Get current pin data
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const snapshot = await pinRef.once('value');
      
      if (!snapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }
      
      const pinData = snapshot.val();
      
      // In production, verify user owns the pin
      if (process.env.NODE_ENV !== 'development') {
        const userId = request.user!.user_id;
        if (pinData.user_id !== userId) {
          throw createAuthzError('PERMISSION_DENIED', 'You can only publish your own pins');
        }
      }
      
      // Update pin to be public
      const updatedPinData = {
        ...pinData,
        metadata: {
          ...pinData.metadata,
          is_public: true,
          updated_at: new Date().toISOString()
        },
        permissions: {
          ...pinData.permissions,
          is_public: true
        }
      };
      
      await pinRef.set(updatedPinData);
      fastify.log.info(`Published pin: ${pid}`);
      
      return reply.code(200).send(createSuccessResponse(
        {
          pinId: pid,
          is_public: true
        },
        'Pin published successfully'
      ));
      
    } catch (error) {
      fastify.log.error(`Error publishing pin: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND' || (error as any).code === 'PERMISSION_DENIED') {
        return reply.code(404).send({
          success: false,
          error: {
            code: (error as any).code,
            type: 'NOT_FOUND',
            message: (error as any).message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // POST /api/pins/:pid/unpublish - Make pin private
  fastify.post('/api/pins/:pid/unpublish', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      description: 'Unpublish pin to make it private',
      tags: ['Pins'],
      params: pinIdParamSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            pinId: z.string(),
            is_public: z.boolean()
          }),
          timestamp: z.string()
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            type: z.string(),
            message: z.string(),
            timestamp: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };
      
      // Get current pin data
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const snapshot = await pinRef.once('value');
      
      if (!snapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }
      
      const pinData = snapshot.val();
      
      // In production, verify user owns the pin
      if (process.env.NODE_ENV !== 'development') {
        const userId = request.user!.user_id;
        if (pinData.user_id !== userId) {
          throw createAuthzError('PERMISSION_DENIED', 'You can only unpublish your own pins');
        }
      }
      
      // Update pin to be private
      const updatedPinData = {
        ...pinData,
        metadata: {
          ...pinData.metadata,
          is_public: false,
          updated_at: new Date().toISOString()
        },
        permissions: {
          ...pinData.permissions,
          is_public: false
        }
      };
      
      await pinRef.set(updatedPinData);
      fastify.log.info(`Unpublished pin: ${pid}`);
      
      return reply.code(200).send(createSuccessResponse(
        {
          pinId: pid,
          is_public: false
        },
        'Pin unpublished successfully'
      ));
      
    } catch (error) {
      fastify.log.error(`Error unpublishing pin: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND' || (error as any).code === 'PERMISSION_DENIED') {
        return reply.code(404).send({
          success: false,
          error: {
            code: (error as any).code,
            type: 'NOT_FOUND',
            message: (error as any).message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // Dataset Management Routes
  // POST /api/pins/:pid/datasets - Create new dataset
  fastify.post('/api/pins/:pid/datasets', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      params: pinIdParamSchema,
      body: createDatasetSchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };
      const datasetData = request.body as CreateDatasetRequest;
      
      // Get user ID (development vs production)
      let userId: string;
      if (process.env.NODE_ENV === 'development') {
        userId = 'dev_user_123'; // For development - matches existing pins
      } else {
        userId = (request as any).user.user_id;
      }

      // Verify pin exists and user has access
      const pinData = await fastify.firebase.getPin(pid);
      if (!pinData) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      if (pinData.user_id !== userId) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      // Create dataset in Firebase
      const datasetId = await fastify.firebase.createDataset(pid, {
        ...datasetData,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      });

      fastify.log.info(`Dataset created: ${datasetId} for pin: ${pid}`);

      return reply.code(200).send(createSuccessResponse({
        datasetId,
        message: 'Dataset created successfully'
      }));

    } catch (error) {
      fastify.log.error(`Error creating dataset: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND') {
        return reply.code(404).send({
          error: (error as any).message || 'Pin not found',
          message: 'The requested pin was not found or you do not have permission to access it'
        });
      }
      
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Failed to create dataset'
      });
    }
  });

  // GET /api/pins/:pid/datasets - Get all datasets for pin
  fastify.get('/api/pins/:pid/datasets', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      params: pinIdParamSchema,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };
      
      // Get user ID (development vs production)
      let userId: string;
      if (process.env.NODE_ENV === 'development') {
        userId = 'dev_user_123'; // For development - matches existing pins
      } else {
        userId = (request as any).user.user_id;
      }

      // Verify pin exists and user has access
      const pinData = await fastify.firebase.getPin(pid);
      if (!pinData) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      if (pinData.user_id !== userId) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      // Get all datasets for the pin
      const datasets = await fastify.firebase.getPinDatasets(pid);

      return reply.code(200).send(createSuccessResponse({
        datasets,
        count: datasets.length
      }));

    } catch (error) {
      fastify.log.error(`Error fetching datasets: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: (error as any).code,
            type: 'NOT_FOUND',
            message: (error as any).message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // GET /api/pins/:pid/datasets/:datasetId - Get specific dataset
  fastify.get('/api/pins/:pid/datasets/:datasetId', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      params: datasetIdParamSchema,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { pid, datasetId } = request.params as { pid: string; datasetId: string };
      
      // Get user ID (development vs production)
      let userId: string;
      if (process.env.NODE_ENV === 'development') {
        userId = 'dev_user_123'; // For development - matches existing pins
      } else {
        userId = (request as any).user.user_id;
      }

      // Verify pin exists and user has access
      const pinData = await fastify.firebase.getPin(pid);
      if (!pinData) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      if (pinData.user_id !== userId) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      // Get specific dataset
      const dataset = await fastify.firebase.getDataset(pid, datasetId);
      if (!dataset) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Dataset not found');
      }

      return reply.code(200).send(createSuccessResponse({
        dataset
      }));

    } catch (error) {
      fastify.log.error(`Error fetching dataset: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: (error as any).code,
            type: 'NOT_FOUND',
            message: (error as any).message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // PUT /api/pins/:pid/datasets/:datasetId - Update dataset
  fastify.put('/api/pins/:pid/datasets/:datasetId', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      params: datasetIdParamSchema,
      body: z.object({
        name: z.string().min(1, 'Dataset name is required').optional(),
        type: z.enum(['json', 'markdown']).optional(),
        datasetType: z.enum(['workflow', 'user', 'integration', 'document', 'research']).optional(),
        data: z.string().min(1, 'Data content is required').optional(),
        description: z.string().optional()
      }),
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { pid, datasetId } = request.params as { pid: string; datasetId: string };
      const updateData = request.body as any;
      
      // Get user ID (development vs production)
      let userId: string;
      if (process.env.NODE_ENV === 'development') {
        userId = 'dev_user_123'; // For development - matches existing pins
      } else {
        userId = (request as any).user.user_id;
      }

      // Verify pin exists and user has access
      const pinData = await fastify.firebase.getPin(pid);
      if (!pinData) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      if (pinData.user_id !== userId) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      // Get current dataset to verify it exists
      const currentDataset = await fastify.firebase.getDataset(pid, datasetId);
      if (!currentDataset) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Dataset not found');
      }

      // Update dataset in Firebase
      const datasetRef = fastify.firebase.db.ref(`pin_datasets/${pid}/${datasetId}`);
      const currentData = currentDataset;
      
      // Parse data based on current dataset type (or new type if being updated)
      let parsedData = currentData.data;
      const dataType = updateData.type || currentData.metadata.type;
      
      if (updateData.data && dataType === 'json') {
        try {
          parsedData = JSON.parse(updateData.data);
        } catch (error) {
          throw new Error('Invalid JSON data');
        }
      } else if (updateData.data && dataType === 'markdown') {
        parsedData = { content: updateData.data };
      }

      const updatedDataset = {
        ...currentData,
        metadata: {
          ...currentData.metadata,
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.type && { type: updateData.type }),
          ...(updateData.datasetType && { datasetType: updateData.datasetType }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          updatedAt: new Date().toISOString()
        },
        ...(updateData.data && { data: parsedData })
      };

      await datasetRef.set(updatedDataset);

      fastify.log.info(`Dataset updated: ${datasetId} for pin: ${pid}`);

      return reply.code(200).send(createSuccessResponse({
        datasetId,
        message: 'Dataset updated successfully'
      }));

    } catch (error) {
      fastify.log.error(`Error updating dataset: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: (error as any).code,
            type: 'NOT_FOUND',
            message: (error as any).message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      if ((error as any).message === 'Invalid JSON data') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_JSON',
            type: 'VALIDATION_ERROR',
            message: 'Invalid JSON data',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // DELETE /api/pins/:pid/datasets/:datasetId - Delete dataset
  fastify.delete('/api/pins/:pid/datasets/:datasetId', {
    preHandler: process.env.NODE_ENV === 'development' ? [] : [fastify.authenticate],
    schema: {
      params: datasetIdParamSchema,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { pid, datasetId } = request.params as { pid: string; datasetId: string };
      
      // Get user ID (development vs production)
      let userId: string;
      if (process.env.NODE_ENV === 'development') {
        userId = 'dev_user_123'; // For development - matches existing pins
      } else {
        userId = (request as any).user.user_id;
      }

      // Verify pin exists and user has access
      const pinData = await fastify.firebase.getPin(pid);
      if (!pinData) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      if (pinData.user_id !== userId) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }

      // Delete dataset
      await fastify.firebase.deleteDataset(pid, datasetId);

      fastify.log.info(`Dataset deleted: ${datasetId} from pin: ${pid}`);

      return reply.code(200).send(createSuccessResponse({
        message: 'Dataset deleted successfully'
      }));

    } catch (error) {
      fastify.log.error(`Error deleting dataset: ${error}`);
      
      if ((error as any).code === 'RESOURCE_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: (error as any).code,
            type: 'NOT_FOUND',
            message: (error as any).message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });
 }



