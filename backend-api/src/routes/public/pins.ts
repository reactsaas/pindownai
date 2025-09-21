import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { createSuccessResponse } from '../../lib/utils';
import { ERRORS, createNotFoundError } from '../../lib/errors';

export async function publicPinRoutes(fastify: FastifyInstance<ZodTypeProvider>) {
  // GET /api/public/pins/:pid - Get public pin data (no auth required)
  fastify.get('/api/public/pins/:pid', async (request, reply) => {
    try {
      const { pid } = request.params as { pid: string };
      
      // Get pin data
      const pinRef = fastify.firebase.db.ref(`pins/${pid}`);
      const pinSnapshot = await pinRef.once('value');
      
      if (!pinSnapshot.exists()) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found');
      }
      
      const pinData = pinSnapshot.val();
      
      fastify.log.info(`Pin data: ${JSON.stringify(pinData, null, 2)}`);
      
      // Check if pin is public
      if (!pinData.metadata?.is_public && !pinData.permissions?.is_public) {
        throw createNotFoundError('RESOURCE_NOT_FOUND', 'Pin not found or is private');
      }
      
      // Get blocks for this pin
      const blocks = await fastify.firebase.getPinBlocks(pid);
      fastify.log.info(`Blocks: ${JSON.stringify(blocks, null, 2)}`);
      
      // Format response
      const publicPinData = {
        id: pinData.id,
        metadata: {
          title: pinData.metadata?.title || 'Untitled Pin',
          description: pinData.metadata?.description || '',
          tags: pinData.metadata?.tags || [],
          created_at: pinData.metadata?.created_at || new Date().toISOString(),
          updated_at: pinData.metadata?.updated_at || new Date().toISOString()
        },
        blocks: blocks.map(block => ({
          id: block.id,
          name: block.name,
          type: block.type,
          template: block.template,
          order: block.order || 0,
          updated_at: block.updated_at || new Date().toISOString()
        }))
      };
      
      fastify.log.info(`Public pin accessed: ${pid}`);
      
      return reply.code(200).send({
        success: true,
        data: {
          pin: publicPinData
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      fastify.log.error(`Error fetching public pin: ${error}`);
      
      if (error.code === 'RESOURCE_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: {
            code: error.code,
            type: 'NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      throw ERRORS.INTERNAL_SERVER_ERROR;
    }
  });
}
