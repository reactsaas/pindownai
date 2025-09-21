import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { updateWorkflowDataSchema, workflowIdParamSchema, pinIdParamSchema } from '../lib/validation';
import { createSuccessResponse, createErrorResponse } from '../lib/utils';

// Import auth plugin to get type declarations
import '../plugins/auth';

export async function workflowDataRoutes(fastify: FastifyInstance<ZodTypeProvider>) {
  
  // PUT /api/workflow-data/:pinId/:wid - Update specific workflow data
  fastify.put('/api/workflow-data/:pinId/:wid', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Update specific workflow data',
      tags: ['Workflow Data'],
      params: workflowIdParamSchema,
      body: updateWorkflowDataSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
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
      const { pid, wid } = request.params as any;
      const { data } = request.body as any;
      const userId = request.user!.user_id;
      
      // Check if pin exists and user has permission
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const pinSnapshot = await pinRef.once('value');
      
      if (!pinSnapshot.exists()) {
        return reply.code(404).send(createErrorResponse(
          'Not Found',
          'Pin not found'
        ));
      }
      
      const pinData = pinSnapshot.val();
      
      // Check permissions
      if (pinData.user_id !== userId) {
        return reply.code(403).send(createErrorResponse(
          'Forbidden',
          'You can only update workflow data for your own pins'
        ));
      }
      
      // Update workflow data in Firebase
      await fastify.firebase.updateWorkflowData(pid, wid, data);
      
      fastify.log.info(`Updated workflow data ${wid} for pin ${pid}`);
      
      return reply.code(200).send(createSuccessResponse(
        { pid, wid, data },
        'Workflow data updated successfully'
      ));
      
    } catch (error) {
      fastify.log.error(`Error updating workflow data: ${error}`);
      return reply.code(500).send(createErrorResponse(
        'Internal Server Error',
        'Failed to update workflow data',
        (error as Error).message
      ));
    }
  });

  // GET /api/workflow-data/:pinId/:wid - Get specific workflow data
  fastify.get('/api/workflow-data/:pinId/:wid', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get specific workflow data',
      tags: ['Workflow Data'],
      params: workflowIdParamSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
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
      const { pid, wid } = request.params as any;
      const userId = request.user!.user_id;
      
      // Check if pin exists and user has permission
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const pinSnapshot = await pinRef.once('value');
      
      if (!pinSnapshot.exists()) {
        return reply.code(404).send(createErrorResponse(
          'Not Found',
          'Pin not found'
        ));
      }
      
      const pinData = pinSnapshot.val();
      
      // Check permissions
      if (!pinData.permissions.is_public && pinData.user_id !== userId) {
        return reply.code(403).send(createErrorResponse(
          'Forbidden',
          'You do not have permission to access this pin\'s workflow data'
        ));
      }
      
      // Get workflow data from Firebase
      const workflowRef = fastify.firebase.db.ref(`workflow_data/${pid}/${wid}`);
      const workflowSnapshot = await workflowRef.once('value');
      
      if (!workflowSnapshot.exists()) {
        return reply.code(404).send(createErrorResponse(
          'Not Found',
          'Workflow data not found'
        ));
      }
      
      const workflowData = workflowSnapshot.val();
      
      return reply.code(200).send(createSuccessResponse(workflowData));
      
    } catch (error) {
      fastify.log.error(`Error getting workflow data: ${error}`);
      return reply.code(500).send(createErrorResponse(
        'Internal Server Error',
        'Failed to get workflow data',
        (error as Error).message
      ));
    }
  });

  // GET /api/workflow-data/:pinId - Get all workflow data for a pin
  fastify.get('/api/workflow-data/:pinId', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get all workflow data for a pin',
      tags: ['Workflow Data'],
      params: pinIdParamSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
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
      
      // Check if pin exists and user has permission
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const pinSnapshot = await pinRef.once('value');
      
      if (!pinSnapshot.exists()) {
        return reply.code(404).send(createErrorResponse(
          'Not Found',
          'Pin not found'
        ));
      }
      
      const pinData = pinSnapshot.val();
      
      // Check permissions
      if (!pinData.permissions.is_public && pinData.user_id !== userId) {
        return reply.code(403).send(createErrorResponse(
          'Forbidden',
          'You do not have permission to access this pin\'s workflow data'
        ));
      }
      
      // Get all workflow data for the pin
      const workflowDataRef = fastify.firebase.db.ref(`workflow_data/${pid}`);
      const workflowDataSnapshot = await workflowDataRef.once('value');
      
      const workflowData = workflowDataSnapshot.exists() ? workflowDataSnapshot.val() : {};
      
      return reply.code(200).send(createSuccessResponse(workflowData));
      
    } catch (error) {
      fastify.log.error(`Error getting all workflow data: ${error}`);
      return reply.code(500).send(createErrorResponse(
        'Internal Server Error',
        'Failed to get workflow data',
        (error as Error).message
      ));
    }
  });
}
