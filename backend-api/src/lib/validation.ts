import { z } from 'zod';

// Pin creation schema
export const createPinSchema = z.object({
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
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
