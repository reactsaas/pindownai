import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createSuccessResponse } from '../../lib/utils';
import { ERRORS, createNotFoundError } from '../../lib/errors';

// Import auth plugin to get type declarations
import '../../plugins/auth';

export async function publicPinboardRoutes(fastify: FastifyInstance) {
  // GET /api/public/pinboards/:pinboardId - Get pinboard data (public or private if owner)
  fastify.get('/api/public/pinboards/:pinboardId', async (request, reply) => {
    try {
      const { pinboardId } = request.params as { pinboardId: string };
      
      // Get pinboard data
      const pinboardRef = fastify.firebase.db.ref(`pin_boards/${pinboardId}`);
      const pinboardSnapshot = await pinboardRef.once('value');
      
      if (!pinboardSnapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pinboard not found');
      }
      
      const pinboardData = pinboardSnapshot.val();
      
      fastify.log.info(`Pinboard data: ${JSON.stringify(pinboardData, null, 2)}`);
      
      // Check if pinboard is public OR if user is authenticated and owns the pinboard
      const isPublic = pinboardData.metadata?.is_public || pinboardData.permissions?.is_public;
      
      // Try to authenticate user if token is provided
      let authenticatedUser = null;
      const authHeader = request.headers.authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        try {
          const decodedToken = await fastify.firebase.auth.verifyIdToken(token);
          authenticatedUser = decodedToken.uid as string;
        } catch (e) {
          const emsg = (e as Error).message || 'Unknown error';
          fastify.log.warn(`Invalid Firebase token: ${emsg}`);
        }
      }
      
      const isOwner = authenticatedUser === pinboardData.user_id;
      
      // Special case for development: allow access to dev_user_123 pinboards if user is authenticated
      const isDevUserPinboard = pinboardData.user_id === 'dev_user_123';
      const isAuthenticatedUser = authenticatedUser !== null;
      
      fastify.log.info(`Auth check - isPublic: ${isPublic}, authenticatedUser: ${authenticatedUser}, pinboardUserId: ${pinboardData.user_id}, isOwner: ${isOwner}, isDevUserPinboard: ${isDevUserPinboard}, isAuthenticatedUser: ${isAuthenticatedUser}`);
      
      if (!isPublic && !isOwner && !(isDevUserPinboard && isAuthenticatedUser)) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pinboard not found or is private');
      }
      
      // Get pins for this pinboard
      const pinIds = pinboardData.pins || [];
      const pins = [];
      
      // Fetch each pin's details
      for (const pinId of pinIds) {
        try {
          const pinRef = fastify.firebase.db.ref(`pins/${pinId}`);
          const pinSnapshot = await pinRef.once('value');
          
          if (pinSnapshot.exists()) {
            const pin = pinSnapshot.val();
            
            // Fetch blocks for this pin
            const blocks = await fastify.firebase.getPinBlocks(pinId);
            
            pins.push({
              id: pin.id,
              name: pin.metadata?.title || 'Untitled Pin',
              type: 'automation' as const,
              description: pin.metadata?.description || '',
              content: pin.content || '',
              blocks: blocks,
              lastModified: new Date(pin.metadata?.created_at || Date.now()).toLocaleDateString(),
              createdAt: new Date(pin.metadata?.created_at || Date.now()).toLocaleDateString(),
              author: pin.metadata?.created_by || 'Unknown',
              views: Math.floor(Math.random() * 1000), // Mock views for now
              metadata: {
                category: pin.metadata?.category,
                tags: pin.metadata?.tags || []
              }
            });
          }
        } catch (err) {
          fastify.log.warn(`Error fetching pin ${pinId}: ${err}`);
        }
      }
      
      fastify.log.info(`Pins: ${JSON.stringify(pins, null, 2)}`);
      
      // Fetch user information
      let userInfo = null;
      if (pinboardData.user_id) {
        try {
          const userRef = fastify.firebase.db.ref(`users/${pinboardData.user_id}`);
          const userSnapshot = await userRef.once('value');
          if (userSnapshot.exists()) {
            userInfo = userSnapshot.val();
            fastify.log.info(`User info: ${JSON.stringify(userInfo, null, 2)}`);
          }
        } catch (err) {
          fastify.log.warn(`Error fetching user info: ${err}`);
        }
      }
      
      // Format response
      const publicPinboardData = {
        id: pinboardData.id,
        metadata: {
          title: pinboardData.name || pinboardData.metadata?.title || 'Untitled Pinboard',
          description: pinboardData.description || pinboardData.metadata?.description || '',
          tags: pinboardData.tags || pinboardData.metadata?.tags || [],
          created_at: pinboardData.created_at || pinboardData.metadata?.created_at || new Date().toISOString(),
          updated_at: pinboardData.updated_at || pinboardData.metadata?.updated_at || new Date().toISOString(),
          is_public: isPublic,
          user_id: pinboardData.user_id,
          user_info: userInfo ? {
            displayName: userInfo.displayName,
            email: userInfo.email,
            photoURL: userInfo.photoURL
          } : null
        },
        pins: pins
      };
      
      fastify.log.info(`Public pinboard accessed: ${pinboardId}`);
      
      const response = {
        success: true,
        data: {
          pinboard: publicPinboardData
        },
        timestamp: new Date().toISOString()
      };
      
      fastify.log.info(`Sending response: ${JSON.stringify(response, null, 2)}`);
      
      return reply.code(200).send(response);
      
    } catch (error) {
      fastify.log.error(`Error fetching public pinboard: ${error}`);
      
      const errObj = error as any;
      if (errObj?.code === 'RESOURCE_NOT_FOUND') {
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
