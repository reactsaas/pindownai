import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';
import { ERRORS } from '../lib/errors';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      user_id: string;
      auth_method: 'firebase_token' | 'api_key';
      permissions: string[];
    };
  }
  
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<ZodTypeProvider>) => {
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      // In development, still try to authenticate with Firebase token
      // but fall back to dev user if no token provided
      if (process.env.NODE_ENV === 'development') {
        const authHeader = request.headers.authorization;
        
        // Try to use Firebase token if provided
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '');
          try {
            const decodedToken = await fastify.firebase.auth.verifyIdToken(token);
            request.user = {
              user_id: decodedToken.uid,
              auth_method: 'firebase_token' as const,
              permissions: ['pins:read', 'pins:write', 'pins:delete', 'workflow_data:read', 'workflow_data:write']
            };
            return;
          } catch (error) {
            fastify.log.warn(`Invalid Firebase token in development: ${(error as Error).message}`);
            // Fall through to dev user fallback
          }
        }
        
        // Fallback to dev user if no valid token
        request.user = {
          user_id: 'dev_user_123',
          auth_method: 'development',
          permissions: ['*']
        };
        return;
      }

      const authHeader = request.headers.authorization;
      const apiKeyFromBody = request.body?.api_key;

      let user = null;

      // Try Firebase token authentication
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        try {
          const decodedToken = await fastify.firebase.auth.verifyIdToken(token);
          user = {
            user_id: decodedToken.uid,
            auth_method: 'firebase_token' as const,
            permissions: ['pins:read', 'pins:write', 'pins:delete', 'workflow_data:read', 'workflow_data:write']
          };
            } catch (error) {
              fastify.log.warn(`Invalid Firebase token: ${(error as Error).message}`);
            }
      }

      // Try API key authentication
      if (!user) {
        let apiKey = null;
        
        if (authHeader?.startsWith('ApiKey ')) {
          apiKey = authHeader.replace('ApiKey ', '');
        } else if (apiKeyFromBody) {
          apiKey = apiKeyFromBody;
        }

        if (apiKey) {
          const apiKeyData = await fastify.firebase.validateApiKey(apiKey);
          if (apiKeyData) {
            user = {
              user_id: apiKeyData.user_id,
              auth_method: 'api_key' as const,
              permissions: apiKeyData.permissions
            };
          }
        }
      }

      if (!user) {
        throw ERRORS.AUTH_REQUIRED;
      }

      request.user = user;
    } catch (error) {
      fastify.log.error(`Authentication error: ${error}`);
      throw ERRORS.AUTH_INVALID;
    }
  });
};

export default fp(authPlugin);
