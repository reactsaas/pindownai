import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createSuccessResponse } from '../lib/utils';
import { ERRORS, createNotFoundError } from '../lib/errors';

// Import auth plugin to get type declarations
import '../plugins/auth';

export async function userRoutes(fastify: FastifyInstance) {
  // POST /api/users - Create or update user data
  fastify.post('/api/users', {
    schema: {
      description: 'Create or update user data',
      tags: ['Users'],
      body: z.object({
        uid: z.string(),
        email: z.string().email(),
        displayName: z.string().optional(),
        photoURL: z.string().optional(),
        emailVerified: z.boolean().optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.any(),
          timestamp: z.string()
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
      const userData = request.body as {
        uid: string;
        email: string;
        displayName?: string;
        photoURL?: string;
        emailVerified?: boolean;
      };

      // Check if user already exists
      const userRef = fastify.firebase.db.ref(`users/${userData.uid}`);
      const userSnapshot = await userRef.once('value');
      
      const userRecord = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        emailVerified: userData.emailVerified || false,
        createdAt: userSnapshot.exists() ? userSnapshot.val().createdAt : { '.sv': 'timestamp' },
        updatedAt: { '.sv': 'timestamp' },
        lastLoginAt: { '.sv': 'timestamp' }
      };

      // Save or update user data
      await userRef.set(userRecord);
      
      fastify.log.info(`User data saved/updated: ${userData.uid}`);
      
      const response = createSuccessResponse(
        userRecord,
        userSnapshot.exists() ? 'User data updated successfully' : 'User data created successfully'
      );
      
      return reply.code(200).send(response);
      
    } catch (error) {
      fastify.log.error(`Error saving user data: ${error}`);
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });

  // GET /api/users/:uid - Get user data
  fastify.get('/api/users/:uid', {
    schema: {
      description: 'Get user data',
      tags: ['Users'],
      params: z.object({
        uid: z.string()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any(),
          message: z.string(),
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
      const { uid } = request.params as { uid: string };
      
      const userRef = fastify.firebase.db.ref(`users/${uid}`);
      const userSnapshot = await userRef.once('value');
      
      if (!userSnapshot.exists()) {
        throw createNotFoundError('USER_NOT_FOUND', 'User not found');
      }
      
      const userData = userSnapshot.val();
      
      const response = createSuccessResponse(
        userData,
        'User data retrieved successfully'
      );
      
      return reply.code(200).send(response);
      
    } catch (error) {
      fastify.log.error(`Error fetching user data: ${error}`);
      
      const errObj = error as any;
      if (errObj?.code === 'USER_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: errObj.code,
            type: 'NOT_FOUND',
            message: errObj.message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });
}
