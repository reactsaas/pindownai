export interface Pinboard {
  id: string;
  name: string;
  description?: string;
  pins: string[]; // Array of pin IDs
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreatePinboardRequest {
  name: string;
  description?: string;
  pins: string[];
  is_public: boolean;
  tags: string[];
}

export interface UpdatePinboardRequest {
  name?: string;
  description?: string;
  pins?: string[];
  is_public?: boolean;
  tags?: string[];
}

export interface PinboardApiResponse {
  success: boolean;
  data?: Pinboard | Pinboard[];
  message: string;
  pinboardId?: string;
}

export interface PinboardError {
  code: string;
  type: string;
  message: string;
  timestamp: string;
}
