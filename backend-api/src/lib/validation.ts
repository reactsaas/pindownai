import { z } from 'zod';

// Pin creation schema (for creating new pins)
export const createPinSchema = z.object({
  data_type: z.enum(['json', 'markdown', 'text']).default('markdown'),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    is_public: z.boolean().default(false)
  }).optional()
});

// Pin update schema (for updating existing pins with workflow data)
export const updatePinSchema = z.object({
  wid: z.string().min(1, 'Workflow ID is required'),
  data_type: z.enum(['json', 'markdown', 'text']),
  content: z.string().min(1, 'Content is required'),
  api_key: z.string().optional(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    is_public: z.boolean().default(false)
  }).optional()
});

// Workflow data update schema
export const updateWorkflowDataSchema = z.object({
  data: z.record(z.string(), z.any()).refine((data) => Object.keys(data).length > 0, {
    message: 'Data is required'
  })
});

// API key generation schema
export const generateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  permissions: z.array(z.string()).default(['workflow_data:write'])
});

// Pin ID parameter schema
export const pinIdParamSchema = z.object({
  pid: z.string().min(1, 'Pin ID is required')
});

// Workflow ID parameter schema
export const workflowIdParamSchema = z.object({
  pid: z.string().min(1, 'Pin ID is required'),
  wid: z.string().min(1, 'Workflow ID is required')
});

// Block creation schema
export const createBlockSchema = z.object({
  name: z.string().min(1, 'Block name is required'),
  type: z.enum(['markdown', 'mermaid', 'conditional', 'image', 'image-steps']),
  template: z.string().min(1, 'Template content is required'),
  order: z.number().int().min(0).default(0)
});

// Block update schema
export const updateBlockSchema = z.object({
  name: z.string().min(1, 'Block name is required').optional(),
  type: z.enum(['markdown', 'mermaid', 'conditional', 'image', 'image-steps']).optional(),
  template: z.string().min(1, 'Template content is required').optional(),
  order: z.number().int().min(0).optional()
});

// Block ID parameter schema
export const blockIdParamSchema = z.object({
  pid: z.string().min(1, 'Pin ID is required'),
  blockId: z.string().min(1, 'Block ID is required')
});

// Dataset schemas
export const createDatasetSchema = z.object({
  name: z.string().min(1, 'Dataset name is required').max(100, 'Dataset name too long'),
  type: z.enum(['json', 'markdown'], {
    errorMap: () => ({ message: 'Type must be either json or markdown' })
  }),
  datasetType: z.enum(['workflow', 'user', 'integration', 'document', 'research'], {
    errorMap: () => ({ message: 'Dataset type must be one of: workflow, user, integration, document, research' })
  }).default('user'),
  data: z.string().min(1, 'Data content is required'),
  description: z.string().optional()
});

export const datasetIdParamSchema = z.object({
  pid: z.string().min(1, 'Pin ID is required'),
  datasetId: z.string().min(1, 'Dataset ID is required')
});

// Response schemas
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional()
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional()
});

// Type exports
export type CreatePinRequest = z.infer<typeof createPinSchema>;
export type UpdateWorkflowDataRequest = z.infer<typeof updateWorkflowDataSchema>;
export type GenerateApiKeyRequest = z.infer<typeof generateApiKeySchema>;
export type PinIdParams = z.infer<typeof pinIdParamSchema>;
export type WorkflowIdParams = z.infer<typeof workflowIdParamSchema>;
export type CreateBlockRequest = z.infer<typeof createBlockSchema>;
export type UpdateBlockRequest = z.infer<typeof updateBlockSchema>;
export type BlockIdParams = z.infer<typeof blockIdParamSchema>;
export type CreateDatasetRequest = z.infer<typeof createDatasetSchema>;
export type DatasetIdParams = z.infer<typeof datasetIdParamSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Pinboard schemas
export const createPinboardSchema = z.object({
  name: z.string().min(1, 'Pinboard name is required').max(100, 'Pinboard name too long'),
  description: z.string().optional(),
  pins: z.array(z.string()).default([]), // Array of pin IDs
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

export const updatePinboardSchema = z.object({
  name: z.string().min(1, 'Pinboard name is required').max(100, 'Pinboard name too long').optional(),
  description: z.string().optional(),
  pins: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export const pinboardIdParamSchema = z.object({
  pinboardId: z.string().min(1, 'Pinboard ID is required')
});

// Pinboard types
export type CreatePinboardRequest = z.infer<typeof createPinboardSchema>;
export type UpdatePinboardRequest = z.infer<typeof updatePinboardSchema>;
export type PinboardIdParams = z.infer<typeof pinboardIdParamSchema>;
