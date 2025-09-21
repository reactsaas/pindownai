import axios from 'axios';

const BASE_URL = 'http://localhost:8000';
const TEST_PIN_ID = 'p-O_IVNbyHoSCPYLvjrtx';

describe('Blocks CRUD API', () => {
  let createdBlockId: string;

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('POST /api/pins/:pid/blocks', () => {
    it('should create a new block for a pin', async () => {
      const blockData = {
        name: 'Test Block',
        type: 'markdown',
        template: '# Test Block\n\nThis is a test block with **markdown** content.\n\n- Item 1\n- Item 2',
        order: 0
      };

      const response = await axios.post(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks`, blockData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.blockId).toBeDefined();
      expect(response.data.data.blockId).toMatch(/^b-/); // Should start with 'b-'
      expect(response.data.data.block.name).toBe(blockData.name);
      expect(response.data.data.block.type).toBe(blockData.type);
      expect(response.data.data.block.template).toBe(blockData.template);

      createdBlockId = response.data.data.blockId;
    });

    it('should validate required fields', async () => {
      const invalidBlockData = {
        name: '', // Empty name should fail
        type: 'markdown',
        template: 'Some content'
      };

      try {
        await axios.post(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks`, invalidBlockData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
      }
    });

    it('should validate block type enum', async () => {
      const invalidBlockData = {
        name: 'Test Block',
        type: 'invalid-type', // Invalid type should fail
        template: 'Some content'
      };

      try {
        await axios.post(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks`, invalidBlockData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
      }
    });
  });

  describe('GET /api/pins/:pid/blocks', () => {
    it('should get all blocks for a pin', async () => {
      const response = await axios.get(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.blocks).toBeDefined();
      expect(Array.isArray(response.data.data.blocks)).toBe(true);
      expect(response.data.data.count).toBeGreaterThanOrEqual(1);
      
      // Should find our created block
      const createdBlock = response.data.data.blocks.find((block: any) => block.id === createdBlockId);
      expect(createdBlock).toBeDefined();
      expect(createdBlock.name).toBe('Test Block');
    });

    it('should return empty array for pin with no blocks', async () => {
      // Use a different pin ID that likely has no blocks
      const response = await axios.get(`${BASE_URL}/api/pins/p-nonexistent/blocks`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.blocks).toEqual([]);
      expect(response.data.data.count).toBe(0);
    });
  });

  describe('PUT /api/pins/:pid/blocks/:blockId', () => {
    it('should update a block', async () => {
      const updateData = {
        name: 'Updated Test Block',
        template: '# Updated Block\n\nThis block has been **updated**!\n\n- New item 1\n- New item 2'
      };

      const response = await axios.put(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks/${createdBlockId}`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.blockId).toBe(createdBlockId);
      expect(response.data.data.message).toBe('Block updated successfully');
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        name: '', // Empty name should fail
        template: 'Some content'
      };

      try {
        await axios.put(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks/${createdBlockId}`, invalidUpdateData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
      }
    });
  });

  describe('DELETE /api/pins/:pid/blocks/:blockId', () => {
    it('should delete a block', async () => {
      const response = await axios.delete(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks/${createdBlockId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.blockId).toBe(createdBlockId);
      expect(response.data.data.message).toBe('Block deleted successfully');
    });

    it('should handle deletion of non-existent block gracefully', async () => {
      const response = await axios.delete(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks/b-nonexistent`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('Block Types', () => {
    it('should create different block types', async () => {
      const blockTypes = [
        {
          name: 'Mermaid Block',
          type: 'mermaid',
          template: '```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n```'
        },
        {
          name: 'Conditional Block',
          type: 'conditional',
          template: '{{#if success}}\n✅ **Status:** Success\n{{else}}\n❌ **Status:** Failed\n{{/if}}'
        },
        {
          name: 'Image Block',
          type: 'image',
          template: '![Alt text](https://example.com/image.jpg)\n\n*Caption for the image*'
        }
      ];

      for (const blockData of blockTypes) {
        const response = await axios.post(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks`, blockData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.data.block.type).toBe(blockData.type);
        expect(response.data.data.block.name).toBe(blockData.name);

        // Clean up - delete the created block
        await axios.delete(`${BASE_URL}/api/pins/${TEST_PIN_ID}/blocks/${response.data.data.blockId}`);
      }
    });
  });
});





