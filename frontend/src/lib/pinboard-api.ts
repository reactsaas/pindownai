import { 
  Pinboard, 
  CreatePinboardRequest, 
  UpdatePinboardRequest, 
  PinboardApiResponse,
  PinboardError 
} from '../types/pinboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('firebase_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response): Promise<PinboardApiResponse> => {
  if (!response.ok) {
    const error: PinboardError = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const pinboardApi = {
  // Create a new pinboard
  createPinboard: async (data: CreatePinboardRequest): Promise<Pinboard> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleApiResponse(response);
    return result.data as Pinboard;
  },

  // Get all user's pinboards
  getPinboards: async (): Promise<Pinboard[]> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiResponse(response);
    return result.data as Pinboard[];
  },

  // Get a specific pinboard
  getPinboard: async (id: string): Promise<Pinboard> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const result = await handleApiResponse(response);
    return result.data as Pinboard;
  },

  // Update a pinboard
  updatePinboard: async (id: string, data: UpdatePinboardRequest): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    await handleApiResponse(response);
  },

  // Delete a pinboard
  deletePinboard: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse(response);
  },

  // Add a pin to a pinboard
  addPinToPinboard: async (pinboardId: string, pinId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards/${pinboardId}/pins`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pinId }),
    });
    
    await handleApiResponse(response);
  },

  // Remove a pin from a pinboard
  removePinFromPinboard: async (pinboardId: string, pinId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/pinboards/${pinboardId}/pins/${pinId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse(response);
  },
};
