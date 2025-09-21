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
      getPin: (pinId: string) => Promise<any>;
      getUserPins: (userId: string) => Promise<any[]>;
      validateApiKey: (apiKey: string) => Promise<{ user_id: string; permissions: string[] } | null>;
      createBlock: (pinId: string, blockData: any) => Promise<string>;
      getPinBlocks: (pinId: string) => Promise<any[]>;
      updateBlock: (pinId: string, blockId: string, blockData: any) => Promise<void>;
      deleteBlock: (pinId: string, blockId: string) => Promise<void>;
      createDataset: (pinId: string, datasetData: any) => Promise<string>;
      getPinDatasets: (pinId: string) => Promise<any[]>;
      getDataset: (pinId: string, datasetId: string) => Promise<any>;
      deleteDataset: (pinId: string, datasetId: string) => Promise<void>;
      createPinboard: (pinboardData: any) => Promise<string>;
      getPinboard: (pinboardId: string) => Promise<any>;
      getUserPinboards: (userId: string) => Promise<any[]>;
      updatePinboard: (pinboardId: string, pinboardData: any) => Promise<void>;
      deletePinboard: (pinboardId: string) => Promise<void>;
      addPinToPinboard: (pinboardId: string, pinId: string) => Promise<void>;
      removePinFromPinboard: (pinboardId: string, pinId: string) => Promise<void>;
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
      const firebaseId = pinRef.key!; // Firebase generates key like: -N1234567890abcdef
      const pinId = `p${firebaseId}`; // Add 'p' prefix: p-N1234567890abcdef
      
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

    async getPin(pinId: string): Promise<any> {
      const pinRef = db.ref(`pins/${pinId}`);
      const snapshot = await pinRef.once('value');
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return snapshot.val();
    },

    async getUserPins(userId: string): Promise<any[]> {
      const userPinsRef = db.ref(`user_pins/${userId}`);
      const snapshot = await userPinsRef.once('value');
      
      if (!snapshot.exists()) {
        return [];
      }

      const userPinsIndex = snapshot.val();
      const pinIds = Object.keys(userPinsIndex);
      
      if (pinIds.length === 0) {
        return [];
      }

      // Fetch full pin data for each pin ID
      const pinsRef = db.ref('pins');
      const pinsSnapshot = await pinsRef.once('value');
      
      if (!pinsSnapshot.exists()) {
        return [];
      }

      const allPins = pinsSnapshot.val();
      const userPins = pinIds
        .filter(pinId => allPins[pinId] && allPins[pinId].user_id === userId)
        .map(pinId => allPins[pinId]);

      return userPins;
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
    },

    async createBlock(pinId: string, blockData: any): Promise<string> {
      // Use Firebase push() to generate a unique key automatically
      const blockRef = db.ref(`pin_blocks/${pinId}`).push();
      const firebaseId = blockRef.key!; // Firebase generates key like: -N1234567890abcdef
      const blockId = `b${firebaseId}`; // Add 'b' prefix: b-N1234567890abcdef
      
      // Update blockData with the generated ID and timestamps
      const blockWithId = {
        ...blockData,
        id: blockId,
        created_at: { '.sv': 'timestamp' },
        updated_at: { '.sv': 'timestamp' }
      };
      
      await db.ref(`pin_blocks/${pinId}/${blockId}`).set(blockWithId);
      fastify.log.info(`Created block: ${blockId} for pin: ${pinId}`);
      return blockId;
    },

    async getPinBlocks(pinId: string): Promise<any[]> {
      const blocksRef = db.ref(`pin_blocks/${pinId}`);
      const snapshot = await blocksRef.once('value');
      
      if (!snapshot.exists()) {
        return [];
      }

      const blocks = snapshot.val();
      // Include the block ID in each block object
      return Object.entries(blocks)
        .map(([blockId, blockData]: [string, any]) => ({
          ...blockData,
          id: blockId
        }))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    },

    async updateBlock(pinId: string, blockId: string, blockData: any): Promise<void> {
      const updates: Record<string, any> = {};
      
      // Add updated_at timestamp
      const blockWithTimestamp = {
        ...blockData,
        updated_at: { '.sv': 'timestamp' }
      };
      
      updates[`pin_blocks/${pinId}/${blockId}`] = blockWithTimestamp;
      
      await db.ref().update(updates);
      fastify.log.info(`Updated block: ${blockId} for pin: ${pinId}`);
    },

    async deleteBlock(pinId: string, blockId: string): Promise<void> {
      await db.ref(`pin_blocks/${pinId}/${blockId}`).remove();
      fastify.log.info(`Deleted block: ${blockId} for pin: ${pinId}`);
    },

    // Dataset methods
    async createDataset(pinId: string, datasetData: any): Promise<string> {
      const firebaseId = db.ref(`pin_datasets/${pinId}`).push().key!;
      const datasetId = `d${firebaseId}`;
      const datasetRef = db.ref(`pin_datasets/${pinId}/${datasetId}`);
      
      // Parse data based on type
      let parsedData: any;
      if (datasetData.type === 'json') {
        try {
          parsedData = JSON.parse(datasetData.data);
        } catch (error) {
          throw new Error('Invalid JSON data');
        }
      } else {
        parsedData = { content: datasetData.data };
      }
      
      const datasetWithId = {
        id: datasetId,
        metadata: {
          name: datasetData.name,
          type: datasetData.type,
          datasetType: datasetData.datasetType || 'user', // Default to 'user' for backward compatibility
          description: datasetData.description || '',
          createdBy: datasetData.createdBy,
          createdAt: datasetData.createdAt,
          updatedAt: datasetData.updatedAt,
          status: datasetData.status || 'active'
        },
        data: parsedData,
        permissions: {
          viewers: [datasetData.createdBy],
          editors: [datasetData.createdBy]
        }
      };
      
      await datasetRef.set(datasetWithId);
      fastify.log.info(`Created dataset: ${datasetId} for pin: ${pinId}`);
      
      return datasetId;
    },

    async getPinDatasets(pinId: string): Promise<any[]> {
      const datasetsRef = db.ref(`pin_datasets/${pinId}`);
      const snapshot = await datasetsRef.once('value');
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const datasets = snapshot.val();
      return Object.values(datasets) || [];
    },

    async getDataset(pinId: string, datasetId: string): Promise<any> {
      const datasetRef = db.ref(`pin_datasets/${pinId}/${datasetId}`);
      const snapshot = await datasetRef.once('value');
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return snapshot.val();
    },

    async deleteDataset(pinId: string, datasetId: string): Promise<void> {
      await db.ref(`pin_datasets/${pinId}/${datasetId}`).remove();
      fastify.log.info(`Deleted dataset: ${datasetId} for pin: ${pinId}`);
    },

    async createPinboard(pinboardData: any): Promise<string> {
      const pinboardRef = db.ref('pin_boards').push();
      const firebaseId = pinboardRef.key!;
      const pinboardId = `pb-${firebaseId}`;
      
      const pinboardWithId = {
        ...pinboardData,
        id: pinboardId,
        pins: pinboardData.pins || [], // Ensure pins array is always present
        tags: pinboardData.tags || [], // Ensure tags array is always present
        created_at: { '.sv': 'timestamp' },
        updated_at: { '.sv': 'timestamp' }
      };
      
      await db.ref(`pin_boards/${pinboardId}`).set(pinboardWithId);
      
      // Add to user's pinboards index
      await db.ref(`user_pinboards/${pinboardData.user_id}/${pinboardId}`).set(true);
      
      fastify.log.info(`Created pinboard: ${pinboardId} for user: ${pinboardData.user_id}`);
      return pinboardId;
    },

    async getPinboard(pinboardId: string): Promise<any> {
      const pinboardRef = db.ref(`pin_boards/${pinboardId}`);
      const snapshot = await pinboardRef.once('value');
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const pinboard = snapshot.val();
      // Ensure pins and tags arrays are always present
      return {
        ...pinboard,
        pins: pinboard.pins || [],
        tags: pinboard.tags || []
      };
    },

    async getUserPinboards(userId: string): Promise<any[]> {
      const userPinboardsRef = db.ref(`user_pinboards/${userId}`);
      const snapshot = await userPinboardsRef.once('value');
      
      if (!snapshot.exists()) {
        return [];
      }

      const userPinboardsIndex = snapshot.val();
      const pinboardIds = Object.keys(userPinboardsIndex);
      
      if (pinboardIds.length === 0) {
        return [];
      }

      // Fetch full pinboard data for each pinboard ID
      const pinboardsRef = db.ref('pin_boards');
      const pinboardsSnapshot = await pinboardsRef.once('value');
      
      if (!pinboardsSnapshot.exists()) {
        return [];
      }

      const allPinboards = pinboardsSnapshot.val();
      const userPinboards = pinboardIds
        .filter(pinboardId => allPinboards[pinboardId] && allPinboards[pinboardId].user_id === userId)
        .map(pinboardId => ({
          ...allPinboards[pinboardId],
          pins: allPinboards[pinboardId].pins || [], // Ensure pins array is always present
          tags: allPinboards[pinboardId].tags || [] // Ensure tags array is always present
        }));

      return userPinboards;
    },

    async updatePinboard(pinboardId: string, pinboardData: any): Promise<void> {
      const updates: Record<string, any> = {};
      
      // Add updated_at timestamp
      const pinboardWithTimestamp = {
        ...pinboardData,
        updated_at: { '.sv': 'timestamp' }
      };
      
      Object.keys(pinboardWithTimestamp).forEach(key => {
        updates[key] = pinboardWithTimestamp[key];
      });
      
      await db.ref(`pin_boards/${pinboardId}`).update(updates);
      fastify.log.info(`Updated pinboard: ${pinboardId}`);
    },

    async deletePinboard(pinboardId: string): Promise<void> {
      // Get pinboard to find user_id for cleanup
      const pinboard = await this.getPinboard(pinboardId);
      
      // Remove from pin_boards
      await db.ref(`pin_boards/${pinboardId}`).remove();
      
      // Remove from user's pinboards index
      if (pinboard && pinboard.user_id) {
        await db.ref(`user_pinboards/${pinboard.user_id}/${pinboardId}`).remove();
      }
      
      fastify.log.info(`Deleted pinboard: ${pinboardId}`);
    },

    async addPinToPinboard(pinboardId: string, pinId: string): Promise<void> {
      const pinboardRef = db.ref(`pin_boards/${pinboardId}/pins`);
      const snapshot = await pinboardRef.once('value');
      
      let currentPins = snapshot.exists() ? snapshot.val() || [] : [];
      
      // Add pin if not already present
      if (!currentPins.includes(pinId)) {
        currentPins.push(pinId);
        await pinboardRef.set(currentPins);
        await db.ref(`pin_boards/${pinboardId}/updated_at`).set({ '.sv': 'timestamp' });
        fastify.log.info(`Added pin: ${pinId} to pinboard: ${pinboardId}`);
      }
    },

    async removePinFromPinboard(pinboardId: string, pinId: string): Promise<void> {
      const pinboardRef = db.ref(`pin_boards/${pinboardId}/pins`);
      const snapshot = await pinboardRef.once('value');
      
      if (snapshot.exists()) {
        let currentPins = snapshot.val() || [];
        currentPins = currentPins.filter((id: string) => id !== pinId);
        await pinboardRef.set(currentPins);
        await db.ref(`pin_boards/${pinboardId}/updated_at`).set({ '.sv': 'timestamp' });
        fastify.log.info(`Removed pin: ${pinId} from pinboard: ${pinboardId}`);
      }
    }
  };

  fastify.decorate('firebase', firebaseHelpers);
};

export default fp(firebasePlugin);
