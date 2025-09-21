'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Pinboard, CreatePinboardRequest, UpdatePinboardRequest } from '../types/pinboard';
import { pinboardApi } from './pinboard-api';

// State interface
interface PinboardState {
  pinboards: Pinboard[];
  loading: boolean;
  error: string | null;
}

// Action types
type PinboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PINBOARDS'; payload: Pinboard[] }
  | { type: 'ADD_PINBOARD'; payload: Pinboard }
  | { type: 'UPDATE_PINBOARD'; payload: Pinboard }
  | { type: 'DELETE_PINBOARD'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Context interface
interface PinboardContextType {
  pinboards: Pinboard[];
  loading: boolean;
  error: string | null;
  createPinboard: (data: CreatePinboardRequest) => Promise<void>;
  updatePinboard: (id: string, data: UpdatePinboardRequest) => Promise<void>;
  deletePinboard: (id: string) => Promise<void>;
  refreshPinboards: () => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: PinboardState = {
  pinboards: [],
  loading: false,
  error: null,
};

// Reducer
const pinboardReducer = (state: PinboardState, action: PinboardAction): PinboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PINBOARDS':
      return { ...state, pinboards: action.payload, loading: false, error: null };
    case 'ADD_PINBOARD':
      return { ...state, pinboards: [...state.pinboards, action.payload], loading: false, error: null };
    case 'UPDATE_PINBOARD':
      return {
        ...state,
        pinboards: state.pinboards.map(pb => pb.id === action.payload.id ? action.payload : pb),
        loading: false,
        error: null,
      };
    case 'DELETE_PINBOARD':
      return {
        ...state,
        pinboards: state.pinboards.filter(pb => pb.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const PinboardContext = createContext<PinboardContextType | undefined>(undefined);

// Provider component
interface PinboardProviderProps {
  children: ReactNode;
}

export const PinboardProvider: React.FC<PinboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(pinboardReducer, initialState);

  // Load pinboards on mount
  useEffect(() => {
    refreshPinboards();
  }, []);

  const refreshPinboards = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const pinboards = await pinboardApi.getPinboards();
      dispatch({ type: 'SET_PINBOARDS', payload: pinboards });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load pinboards' });
    }
  };

  const createPinboard = async (data: CreatePinboardRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const newPinboard = await pinboardApi.createPinboard(data);
      dispatch({ type: 'ADD_PINBOARD', payload: newPinboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create pinboard' });
      throw error;
    }
  };

  const updatePinboard = async (id: string, data: UpdatePinboardRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await pinboardApi.updatePinboard(id, data);
      
      // Refresh the specific pinboard to get updated data
      const updatedPinboard = await pinboardApi.getPinboard(id);
      dispatch({ type: 'UPDATE_PINBOARD', payload: updatedPinboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update pinboard' });
      throw error;
    }
  };

  const deletePinboard = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await pinboardApi.deletePinboard(id);
      dispatch({ type: 'DELETE_PINBOARD', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete pinboard' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: PinboardContextType = {
    pinboards: state.pinboards,
    loading: state.loading,
    error: state.error,
    createPinboard,
    updatePinboard,
    deletePinboard,
    refreshPinboards,
    clearError,
  };

  return (
    <PinboardContext.Provider value={contextValue}>
      {children}
    </PinboardContext.Provider>
  );
};

// Hook to use pinboard context
export const usePinboard = (): PinboardContextType => {
  const context = useContext(PinboardContext);
  if (context === undefined) {
    throw new Error('usePinboard must be used within a PinboardProvider');
  }
  return context;
};
