import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fp from 'fastify-plugin';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

declare module 'fastify' {
  interface FastifyInstance {
    firebase: {
      db: any;
      auth: any;
      updateWorkflowData: (pinId: string, workflowId: string, data: any) => Promise<void>;
      createPin: (pinData: any) => Promise<string>;
      validateApiKey: (apiKey: string) => Promise<{ user_id: string; permissions: string[] } | null>;
    };
  }
}

const firebasePlugin: FastifyPluginAsync = async (fastify: FastifyInstance<ZodTypeProvider>) => {
  // Initialize Firebase Admin
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL!,
    });
  }

  const db = getDatabase();
  const auth = getAuth();

  const firebaseHelpers = {
    db,
    auth,

    async updateWorkflowData(pinId: string, workflowId: string, data: any): Promise<void> {
      const updates: Record<string, any> = {};
      updates[`workflow_data/${pinId}/${workflowId}`] = {
        ...data,
        last_update: { '.sv': 'timestamp' }
      };
      
      await db.ref().update(updates);
      fastify.log.info(`Updated workflow data: ${pinId}/${workflowId}`);
    },

    async createPin(pinData: any): Promise<string> {
      // Use Firebase push() to generate a unique key automatically
      const pinRef = db.ref('pins').push();
      const pinId = pinRef.key!; // Firebase generates key like: -N1234567890abcdef
      
      // Update pinData with the generated ID
      pinData.id = pinId;
      
      const updates: Record<string, any> = {};

      // Save main pin data
      updates[`pins/${pinId}`] = pinData;

      // Index by user
      updates[`user_pins/${pinData.user_id}/${pinId}`] = {
        title: pinData.metadata?.title || 'Untitled Pin',
        workflow_sources: pinData.metadata?.workflow_sources || [],
        created_at: pinData.metadata.created_at,
        is_active: true
      };

      await db.ref().update(updates);
      return pinId;
    },

    async validateApiKey(apiKey: string): Promise<{ user_id: string; permissions: string[] } | null> {
      const crypto = require('crypto');
      const hashedKey = crypto.createHash('sha256').update(apiKey + process.env.API_KEY_SALT).digest('hex');

      const apiKeysRef = db.ref('api_keys');
      const snapshot = await apiKeysRef.once('value');
      
      if (!snapshot.exists()) return null;

      const allApiKeys = snapshot.val();
      for (const userId of Object.keys(allApiKeys)) {
        const userKeys = allApiKeys[userId];
        for (const keyId of Object.keys(userKeys)) {
          const keyData = userKeys[keyId];
          if (keyData.key_hash === hashedKey && keyData.is_active) {
            return {
              user_id: userId,
              permissions: keyData.permissions || []
            };
          }
        }
      }

      return null;
    }
  };

  fastify.decorate('firebase', firebaseHelpers);
};

export default fp(firebasePlugin);
