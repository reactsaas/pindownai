import React, { createContext, useEffect, useState } from 'react'

interface TemplateVariableLoadingContextType {
  registerVariable: (id: string) => void
  unregisterVariable: (id: string) => void
  markVariableLoaded: (id: string) => void
  seedVariables: (ids: string[]) => void
  setConnection: (id: string, connected: boolean) => void
  isInitialLoadComplete: boolean
  isAnyVariableLoading: boolean
  anyConnected: boolean
}

const TemplateVariableLoadingContext = createContext<TemplateVariableLoadingContextType>({
  registerVariable: () => {},
  unregisterVariable: () => {},
  markVariableLoaded: () => {},
  seedVariables: () => {},
  setConnection: () => {},
  isInitialLoadComplete: false,
  isAnyVariableLoading: false,
  anyConnected: false
})

export const useTemplateVariableLoading = () => React.useContext(TemplateVariableLoadingContext)

interface TemplateVariableLoadingProviderProps {
  children: React.ReactNode
}

export const TemplateVariableLoadingProvider: React.FC<TemplateVariableLoadingProviderProps> = ({ 
  children
}) => {
  const [variables, setVariables] = useState<Set<string>>(new Set())
  const [loadedVariables, setLoadedVariables] = useState<Set<string>>(new Set())
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
  const [hasStartedLoading, setHasStartedLoading] = useState(false)
  const [stableAnyConnected, setStableAnyConnected] = useState(false)

  const seedVariables = React.useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return
    setVariables(prev => new Set([...Array.from(prev), ...ids]))
    setHasStartedLoading(true)
  }, [])

  const registerVariable = React.useCallback((id: string) => {
    setVariables(prev => new Set([...prev, id]))
    setHasStartedLoading(true)
  }, [])

  const unregisterVariable = React.useCallback((id: string) => {
    setVariables(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    setLoadedVariables(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    setConnections(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const markVariableLoaded = React.useCallback((id: string) => {
    setLoadedVariables(prev => new Set([...prev, id]))
  }, [])

  const setConnection = React.useCallback((id: string, connected: boolean) => {
    setConnections(prev => {
      const next = new Set(prev)
      if (connected) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  // Check if all variables are loaded
  useEffect(() => {
    if (hasStartedLoading && variables.size > 0 && loadedVariables.size === variables.size) {
      const t = setTimeout(() => {
        setIsInitialLoadComplete(true)
      }, 100)
      return () => clearTimeout(t)
    }
  }, [variables.size, loadedVariables.size, hasStartedLoading])

  // Debounce anyConnected to prevent flickering
  useEffect(() => {
    const actualAnyConnected = connections.size > 0
    const timer = setTimeout(() => {
      setStableAnyConnected(actualAnyConnected)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [connections.size])

  const isAnyVariableLoading = variables.size > loadedVariables.size
  const anyConnected = stableAnyConnected

  const value = React.useMemo(() => ({
    registerVariable,
    unregisterVariable,
    markVariableLoaded,
    seedVariables,
    setConnection,
    isInitialLoadComplete,
    isAnyVariableLoading,
    anyConnected
  }), [registerVariable, unregisterVariable, markVariableLoaded, seedVariables, setConnection, isInitialLoadComplete, isAnyVariableLoading, anyConnected])

  return (
    <TemplateVariableLoadingContext.Provider value={value}>
      {children}
    </TemplateVariableLoadingContext.Provider>
  )
}
