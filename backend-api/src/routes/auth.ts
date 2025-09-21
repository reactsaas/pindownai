import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { generateApiKeySchema } from '../lib/validation';
import { generateApiKey, hashApiKey, createSuccessResponse, createErrorResponse } from '../lib/utils';
import { handleError } from '../lib/error-handler';

// Import auth plugin to get type declarations
import '../plugins/auth';

export async function authRoutes(fastify: FastifyInstance<ZodTypeProvider>) {
  
  // POST /api/auth/api-keys - Generate new API key
  fastify.post('/api/auth/api-keys', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Generate new API key',
      tags: ['Authentication'],
      body: generateApiKeySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                apiKey: { type: 'string' },
                keyId: { type: 'string' },
                name: { type: 'string' },
                permissions: { type: 'array' }
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
      const { name, permissions } = request.body as any;
      const userId = request.user!.user_id;
      
      // Generate new API key
      const apiKey = generateApiKey();
      const keyId = `key_${Date.now()}`;
      const hashedKey = hashApiKey(apiKey, process.env.API_KEY_SALT!);
      
      // Save API key to Firebase
      const apiKeyData = {
        name,
        permissions,
        key_hash: hashedKey,
        is_active: true,
        created_at: new Date().toISOString(),
        usage_count: 0
      };
      
      const updates: Record<string, any> = {};
      updates[`api_keys/${userId}/${keyId}`] = apiKeyData;
      
      await fastify.firebase.db.ref().update(updates);
      
      fastify.log.info(`Generated API key ${keyId} for user ${userId}`);
      
      return reply.code(200).send(createSuccessResponse({
        apiKey, // Only return the plain key once
        keyId,
        name,
        permissions
      }, 'API key generated successfully'));
      
    } catch (error) {
      fastify.log.error(`Error generating API key: ${error}`);
      return handleError(reply, error, 'Failed to generate API key');
    }
  });

  // GET /api/auth/api-keys - List user's API keys
  fastify.get('/api/auth/api-keys', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'List user\'s API keys',
      tags: ['Authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  keyId: { type: 'string' },
                  name: { type: 'string' },
                  permissions: { type: 'array' },
                  is_active: { type: 'boolean' },
                  created_at: { type: 'string' },
                  usage_count: { type: 'number' }
                }
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
      
      // Get user's API keys from Firebase
      const apiKeysRef = fastify.firebase.db.ref(`api_keys/${userId}`);
      const snapshot = await apiKeysRef.once('value');
      
      if (!snapshot.exists()) {
        return reply.code(200).send(createSuccessResponse([]));
      }
      
      const apiKeys = snapshot.val();
      const apiKeyList = Object.entries(apiKeys).map(([keyId, keyData]: [string, any]) => ({
        keyId,
        name: keyData.name,
        permissions: keyData.permissions,
        is_active: keyData.is_active,
        created_at: keyData.created_at,
        usage_count: keyData.usage_count || 0
      }));
      
      return reply.code(200).send(createSuccessResponse(apiKeyList));
      
    } catch (error) {
      fastify.log.error(`Error listing API keys: ${error}`);
      return handleError(reply, error, 'Failed to list API keys');
    }
  });

  // DELETE /api/auth/api-keys/:keyId - Revoke API key
  fastify.delete('/api/auth/api-keys/:keyId', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Revoke API key',
      tags: ['Authentication'],
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
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
      const { keyId } = request.params as any;
      const userId = request.user!.user_id;
      
      // Check if API key exists
      const apiKeyRef = fastify.firebase.db.ref(`api_keys/${userId}/${keyId}`);
      const snapshot = await apiKeyRef.once('value');
      
      if (!snapshot.exists()) {
        return reply.code(404).send(createErrorResponse(
          'Not Found',
          'API key not found'
        ));
      }
      
      // Delete API key
      await apiKeyRef.remove();
      
      fastify.log.info(`Revoked API key ${keyId} for user ${userId}`);
      
      return reply.code(200).send(createSuccessResponse(
        null,
        'API key revoked successfully'
      ));
      
    } catch (error) {
      fastify.log.error(`Error revoking API key: ${error}`);
      return handleError(reply, error, 'Failed to revoke API key');
    }
  });
}
