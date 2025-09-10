# Frontend Real-time Template Specification

## Overview
This specification outlines how the frontend will consume real-time data from Firebase Realtime Database and inject JSON variables into markdown templates, providing dynamic content updates on share pages.

---

## Core Architecture

### Template Variable System
```
Firebase RT DB → Template Engine → Rendered Markdown → ReactMarkdown
     ↓              ↓                    ↓              ↓
JSON Data → Variable Injection → Dynamic Content → Live UI Updates
```

### Data Flow
1. **Firebase Connection**: Subscribe to pin's live data changes
2. **Template Processing**: Parse markdown for variable placeholders
3. **Variable Injection**: Replace placeholders with real-time JSON data
4. **Content Rendering**: Update ReactMarkdown with processed content
5. **UI Updates**: Animate changes for better UX

---

## Template Variable Syntax

### Supported Formats
```markdown
# Multiple data source access
{{wd_01.revenue}}
{{wd_02.user.name}}
{{wd_03.metrics.conversion_rate}}

# Legacy single data source (still supported)
{{data.revenue}}
{{data.user.name}}

# Array access with data sources
{{wd_01.items[0].name}}
{{wd_02.results[2].score}}

# Nested object access across data sources
{{wd_01.analytics.performance.cpu}}
{{wd_02.api_integrations.stripe.revenue}}
{{wd_03.system.status}}

# Formatted numbers from different sources
{{wd_01.revenue | currency}}
{{wd_02.conversion_rate | percentage}}
{{wd_03.last_update | date}}

# Conditional rendering with multiple sources
{{#if wd_01.status === 'running'}}
Primary system is running
{{else if wd_02.status === 'running'}}
Backup system is running
{{else}}
All systems offline
{{/if}}

# Loops for arrays from specific data sources
{{#each wd_01.top_products}}
- **{{name}}**: {{sales | currency}}
{{/each}}

{{#each wd_02.alerts}}
- ⚠️ {{message}} (Source: {{source}})
{{/each}}

# Cross-data source operations
{{(wd_01.revenue + wd_02.revenue) | currency}}
{{((wd_01.sales - wd_02.sales) / wd_02.sales * 100) | round(2)}}%

# Default values with fallback to other sources
{{wd_01.primary_metric || wd_02.backup_metric || 'Not available'}}
```

### Advanced Template Features
```markdown
# Mathematical operations across data sources
Total Revenue: {{(wd_01.revenue + wd_02.revenue + wd_03.revenue) | currency}}
Growth Rate: {{((wd_01.this_month - wd_01.last_month) / wd_01.last_month * 100) | round(2)}}%
Performance Score: {{(wd_01.score * 0.6 + wd_02.score * 0.4) | round(1)}}

# String manipulation from different sources
Welcome {{wd_01.user.first_name | capitalize}} from {{wd_02.company.name}}!

# Date formatting across sources
Primary Updated: {{wd_01.timestamp | format('MMM DD, YYYY HH:mm')}}
Backup Updated: {{wd_02.timestamp | format('MMM DD, YYYY HH:mm')}}

# Status indicators from multiple sources
Primary: {{wd_01.status | status_badge}}
Secondary: {{wd_02.status | status_badge}}
Monitoring: {{wd_03.health_status | status_badge}}

# Progress bars from different workflows
Sales Progress: {{wd_01.sales_progress | progress_bar(100)}}
Development: {{wd_02.dev_progress | progress_bar(100)}}
Marketing: {{wd_03.campaign_progress | progress_bar(100)}}

# Aggregated progress
Overall Progress: {{((wd_01.progress + wd_02.progress + wd_03.progress) / 3) | progress_bar(100)}}
```

---

## Implementation Structure

### 1. Template Engine Hook

```typescript
// hooks/use-template-engine.ts
import { useState, useEffect, useMemo } from 'react';
import { parseTemplate, injectVariables } from '@/lib/template-engine';

interface UseTemplateEngineOptions {
  template: string;
  data: any;
  formatters?: Record<string, Function>;
  onError?: (error: Error) => void;
}

export function useTemplateEngine({
  template,
  data,
  formatters = {},
  onError
}: UseTemplateEngineOptions) {
  const [processedContent, setProcessedContent] = useState(template);
  const [variables, setVariables] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Parse template for variables on mount
  const parsedTemplate = useMemo(() => {
    try {
      const parsed = parseTemplate(template);
      setVariables(parsed.variables);
      return parsed;
    } catch (error) {
      onError?.(error);
      return { ast: null, variables: [] };
    }
  }, [template]);

  // Process template when data changes
  useEffect(() => {
    if (!data || !parsedTemplate.ast) {
      setProcessedContent(template);
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const result = injectVariables(parsedTemplate.ast, data, formatters);
      setProcessedContent(result.content);
      setErrors(result.errors);
    } catch (error) {
      onError?.(error);
      setErrors([error.message]);
    } finally {
      setIsProcessing(false);
    }
  }, [data, parsedTemplate, formatters]);

  return {
    processedContent,
    variables,
    isProcessing,
    errors,
    originalTemplate: template
  };
}
```

### 2. Template Engine Core

```typescript
// lib/template-engine.ts
interface TemplateVariable {
  path: string;
  formatter?: string;
  defaultValue?: any;
  raw: string;
}

interface ParsedTemplate {
  ast: TemplateNode[];
  variables: string[];
}

interface TemplateNode {
  type: 'text' | 'variable' | 'condition' | 'loop';
  content?: string;
  variable?: TemplateVariable;
  condition?: string;
  children?: TemplateNode[];
}

class TemplateEngine {
  private formatters: Record<string, Function> = {
    currency: (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value),
    
    percentage: (value: number) => `${(value * 100).toFixed(1)}%`,
    
    date: (value: string | number) => new Date(value).toLocaleDateString(),
    
    round: (value: number, decimals: number = 0) => Number(value.toFixed(decimals)),
    
    capitalize: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    
    status_badge: (status: string) => {
      const badges = {
        running: '🟢 Running',
        stopped: '🔴 Stopped',
        pending: '🟡 Pending',
        error: '🔴 Error'
      };
      return badges[status] || status;
    },
    
    progress_bar: (value: number, max: number = 100) => {
      const percentage = Math.round((value / max) * 100);
      const filled = Math.round(percentage / 10);
      const empty = 10 - filled;
      return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
    }
  };

  parseTemplate(template: string): ParsedTemplate {
    const variables: string[] = [];
    const ast = this.parseNodes(template, variables);
    
    return {
      ast,
      variables: [...new Set(variables)]
    };
  }

  private parseNodes(content: string, variables: string[]): TemplateNode[] {
    const nodes: TemplateNode[] = [];
    let current = 0;

    // Regex patterns for different template constructs
    const patterns = {
      variable: /\{\{([^}]+)\}\}/g,
      condition: /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      loop: /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g
    };

    while (current < content.length) {
      let nextMatch = null;
      let nextType = null;
      let nextIndex = content.length;

      // Find the earliest match
      for (const [type, pattern] of Object.entries(patterns)) {
        pattern.lastIndex = current;
        const match = pattern.exec(content);
        if (match && match.index < nextIndex) {
          nextMatch = match;
          nextType = type;
          nextIndex = match.index;
        }
      }

      // Add text before the match
      if (nextIndex > current) {
        const textContent = content.slice(current, nextIndex);
        if (textContent.trim()) {
          nodes.push({
            type: 'text',
            content: textContent
          });
        }
      }

      if (!nextMatch) break;

      // Process the match based on type
      switch (nextType) {
        case 'variable':
          const variableInfo = this.parseVariable(nextMatch[1]);
          variables.push(variableInfo.path);
          nodes.push({
            type: 'variable',
            variable: variableInfo
          });
          break;

        case 'condition':
          nodes.push({
            type: 'condition',
            condition: nextMatch[1],
            children: this.parseNodes(nextMatch[2], variables)
          });
          break;

        case 'loop':
          nodes.push({
            type: 'loop',
            variable: this.parseVariable(nextMatch[1]),
            children: this.parseNodes(nextMatch[2], variables)
          });
          break;
      }

      current = nextMatch.index + nextMatch[0].length;
    }

    return nodes;
  }

  private parseVariable(variableStr: string): TemplateVariable {
    const parts = variableStr.trim().split('|');
    const path = parts[0].trim();
    const formatter = parts[1]?.trim();
    const defaultMatch = path.match(/(.+?)\s*\|\|\s*(.+)/);
    
    if (defaultMatch) {
      return {
        path: defaultMatch[1].trim(),
        defaultValue: defaultMatch[2].trim().replace(/['"]/g, ''),
        formatter,
        raw: variableStr
      };
    }

    return {
      path,
      formatter,
      raw: variableStr
    };
  }

  injectVariables(
    nodes: TemplateNode[], 
    data: any, 
    customFormatters: Record<string, Function> = {}
  ): { content: string; errors: string[] } {
    const formatters = { ...this.formatters, ...customFormatters };
    const errors: string[] = [];
    
    const processNodes = (nodeList: TemplateNode[], context: any = data): string => {
      return nodeList.map(node => {
        switch (node.type) {
          case 'text':
            return node.content || '';

          case 'variable':
            try {
              const value = this.getValue(context, node.variable!.path);
              const finalValue = value !== undefined ? value : node.variable!.defaultValue;
              
              if (finalValue === undefined) {
                errors.push(`Variable not found: ${node.variable!.path}`);
                return `{{${node.variable!.raw}}}`;
              }

              return this.formatValue(finalValue, node.variable!.formatter, formatters);
            } catch (error) {
              errors.push(`Error processing variable ${node.variable!.path}: ${error.message}`);
              return `{{${node.variable!.raw}}}`;
            }

          case 'condition':
            try {
              const shouldRender = this.evaluateCondition(node.condition!, context);
              return shouldRender ? processNodes(node.children || [], context) : '';
            } catch (error) {
              errors.push(`Error in condition: ${error.message}`);
              return '';
            }

          case 'loop':
            try {
              const arrayData = this.getValue(context, node.variable!.path);
              if (!Array.isArray(arrayData)) {
                errors.push(`Loop variable is not an array: ${node.variable!.path}`);
                return '';
              }

              return arrayData.map(item => 
                processNodes(node.children || [], item)
              ).join('');
            } catch (error) {
              errors.push(`Error in loop: ${error.message}`);
              return '';
            }

          default:
            return '';
        }
      }).join('');
    };

    return {
      content: processNodes(nodes),
      errors
    };
  }

  private getValue(obj: any, path: string): any {
    // Handle array access like data.items[0].name
    const pathWithArrayAccess = path.replace(/\[(\d+)\]/g, '.$1');
    const keys = pathWithArrayAccess.split('.').filter(key => key !== '');
    
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  private formatValue(value: any, formatter?: string, formatters: Record<string, Function> = {}): string {
    if (!formatter) return String(value);

    const [formatterName, ...args] = formatter.split('(');
    const formatterFn = formatters[formatterName];
    
    if (!formatterFn) {
      return String(value);
    }

    try {
      if (args.length > 0) {
        // Parse arguments from formatter(arg1, arg2)
        const argStr = args.join('(').replace(')', '');
        const parsedArgs = argStr.split(',').map(arg => {
          const trimmed = arg.trim();
          if (trimmed.match(/^\d+$/)) return parseInt(trimmed);
          if (trimmed.match(/^\d+\.\d+$/)) return parseFloat(trimmed);
          return trimmed.replace(/['"]/g, '');
        });
        return formatterFn(value, ...parsedArgs);
      }
      
      return formatterFn(value);
    } catch (error) {
      return String(value);
    }
  }

  private evaluateCondition(condition: string, context: any): boolean {
    // Simple condition evaluation - can be enhanced
    const operators = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const leftValue = this.getValue(context, left);
        const rightValue = right.replace(/['"]/g, '');
        
        switch (op) {
          case '===': return leftValue === rightValue;
          case '!==': return leftValue !== rightValue;
          case '==': return leftValue == rightValue;
          case '!=': return leftValue != rightValue;
          case '>=': return Number(leftValue) >= Number(rightValue);
          case '<=': return Number(leftValue) <= Number(rightValue);
          case '>': return Number(leftValue) > Number(rightValue);
          case '<': return Number(leftValue) < Number(rightValue);
        }
      }
    }
    
    // Simple truthiness check
    return !!this.getValue(context, condition);
  }
}

export const templateEngine = new TemplateEngine();
export const parseTemplate = (template: string) => templateEngine.parseTemplate(template);
export const injectVariables = (ast: any, data: any, formatters?: any) => 
  templateEngine.injectVariables(ast, data, formatters);
```

### 3. Real-time Pin Component

```typescript
// components/real-time-pin.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useTemplateEngine } from '@/hooks/use-template-engine';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface RealTimePinProps {
  initialPin?: any;
}

export function RealTimePin({ initialPin }: RealTimePinProps) {
  const params = useParams();
  const pinId = params.pinId as string;
  
  const [pinData, setPinData] = useState(initialPin);
  const [liveData, setLiveData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!pinId || !db) return;

    const pinRef = ref(db, `pins/${pinId}`);
    const liveDataRef = ref(db, `pins/${pinId}/live_data`);

    // Subscribe to pin data changes
    const unsubscribePin = onValue(
      pinRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPinData(snapshot.val());
          setIsConnected(true);
          setConnectionError(null);
        }
      },
      (error) => {
        setConnectionError(error.message);
        setIsConnected(false);
      }
    );

    // Subscribe to live data changes
    const unsubscribeLiveData = onValue(
      liveDataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setLiveData(snapshot.val());
          setLastUpdate(new Date());
        }
      },
      (error) => {
        console.warn('Live data subscription error:', error);
      }
    );

    return () => {
      off(pinRef, 'value', unsubscribePin);
      off(liveDataRef, 'value', unsubscribeLiveData);
    };
  }, [pinId]);

     // Combine static pin data with live data for template processing
   const templateData = useMemo(() => {
     if (!pinData) return null;

     let combinedData = {};

     // If content is JSON, parse it for template variables
     if (pinData.data_type === 'json') {
       try {
         const jsonContent = typeof pinData.content === 'string' 
           ? JSON.parse(pinData.content)
           : pinData.content;
         
         // Handle multiple workflow data sources
         // Expected structure: { wd_01: {...}, wd_02: {...}, data: {...} }
         combinedData = jsonContent;
         
         // Ensure backward compatibility with legacy 'data' structure
         if (!combinedData.data && Object.keys(combinedData).length > 0) {
           // If no 'data' key exists, but we have workflow data, 
           // maintain legacy support by using first workflow data as 'data'
           const firstWorkflowKey = Object.keys(combinedData).find(key => key.startsWith('wd_'));
           if (firstWorkflowKey) {
             combinedData.data = combinedData[firstWorkflowKey];
           }
         }
       } catch (error) {
         console.error('Failed to parse JSON content:', error);
       }
     }

     // Merge with live data from Firebase Realtime DB
     if (liveData) {
       // Live data can also contain multiple workflow sources
       // Structure: { wd_01: {...}, wd_02: {...}, system: {...} }
       Object.keys(liveData).forEach(key => {
         if (key.startsWith('wd_')) {
           // Merge live data into corresponding workflow data source
           combinedData[key] = {
             ...combinedData[key],
             ...liveData[key],
             _live: true
           };
         } else {
           // Non-workflow data (system, meta, etc.)
           combinedData[key] = liveData[key];
         }
       });
       
       // Add global metadata
       combinedData._meta = {
         last_update: lastUpdate?.toISOString(),
         is_connected: isConnected,
         pin_id: pinId,
         workflow_sources: Object.keys(combinedData).filter(key => key.startsWith('wd_')),
         live_sources: Object.keys(liveData).filter(key => key.startsWith('wd_'))
       };
     }

     return combinedData;
   }, [pinData, liveData, lastUpdate, isConnected, pinId]);

  // Process template if it's markdown with JSON data
  const {
    processedContent,
    variables,
    isProcessing,
    errors
  } = useTemplateEngine({
    template: pinData?.data_type === 'markdown' ? pinData.content : '',
    data: templateData,
    onError: (error) => console.error('Template processing error:', error)
  });

  if (!pinData) {
    return <PinSkeleton />;
  }

  // Handle different content types
  const getProcessedContent = () => {
    switch (pinData.data_type) {
      case 'markdown':
        return templateData ? processedContent : pinData.content;
      
      case 'json':
        // For JSON content, show formatted JSON or processed template
        if (pinData.metadata?.markdown_template) {
          return useTemplateEngine({
            template: pinData.metadata.markdown_template,
            data: templateData
          }).processedContent;
        }
        return `\`\`\`json\n${JSON.stringify(templateData, null, 2)}\n\`\`\``;
      
      case 'text':
      default:
        return pinData.content;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-sm">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {variables.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {variables.length} variables
          </Badge>
        )}
      </div>

      {/* Connection Error */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertDescription>
            Connection error: {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Template Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Template errors: {errors.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {pinData.metadata?.title || 'Untitled Pin'}
              </CardTitle>
              {pinData.metadata?.description && (
                <p className="text-muted-foreground">
                  {pinData.metadata.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {pinData.data_type.toUpperCase()}
                </Badge>
                {isProcessing && (
                  <Badge variant="outline" className="animate-pulse">
                    Processing...
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Live Data Indicator */}
            {liveData && (
              <LiveDataIndicator data={liveData} />
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Enhanced components with animation support
                span: ({ children, className }) => (
                  <span 
                    className={`${className} transition-all duration-300 ${
                      isProcessing ? 'animate-pulse' : ''
                    }`}
                  >
                    {children}
                  </span>
                ),
                // Custom component for live values
                code: ({ children, className }) => {
                  if (className === 'language-live') {
                    return (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-mono animate-pulse">
                        {children}
                      </span>
                    );
                  }
                  return (
                    <code className="bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
              }}
            >
              {getProcessedContent()}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel 
          pinData={pinData}
          liveData={liveData}
          templateData={templateData}
          variables={variables}
          errors={errors}
        />
      )}
    </div>
  );
}

// Live data indicator component
function LiveDataIndicator({ data }: { data: any }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className={`p-2 rounded-lg border transition-all duration-300 ${
      animating ? 'bg-green-50 border-green-200' : 'bg-muted'
    }`}>
      <div className="text-xs text-muted-foreground">Live Data</div>
      <div className="text-sm font-mono">
        {Object.keys(data).length} fields
      </div>
    </div>
  );
}

// Skeleton loader
function PinSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="w-20 h-4" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-4" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="w-20 h-6" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Debug panel for development
function DebugPanel({ pinData, liveData, templateData, variables, errors }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="text-sm cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          Debug Panel {isOpen ? '▼' : '▶'}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Variables Found:</h4>
            <div className="flex flex-wrap gap-1">
              {variables.map((variable: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Template Data:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(templateData, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Live Data:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(liveData, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
```

### 4. Firebase Real-time Hook

```typescript
// hooks/use-firebase-realtime.ts
import { useEffect, useState, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';

interface UseFirebaseRealtimeOptions {
  path: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
  transform?: (data: any) => any;
}

export function useFirebaseRealtime<T = any>({
  path,
  enabled = true,
  onError,
  transform
}: UseFirebaseRealtimeOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !db || !path) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const dataRef = ref(db, path);
    
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const rawData = snapshot.val();
            const processedData = transform ? transform(rawData) : rawData;
            setData(processedData);
            setLastUpdate(new Date());
          } else {
            setData(null);
          }
          setIsConnected(true);
          setError(null);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          onError?.(error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        const error = new Error(`Firebase error: ${err.message}`);
        setError(error);
        setIsConnected(false);
        setLoading(false);
        onError?.(error);
      }
    );

    listenerRef.current = unsubscribe;

    return () => {
      if (listenerRef.current) {
        off(dataRef, 'value', listenerRef.current);
      }
    };
  }, [path, enabled, transform]);

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdate,
    refetch: () => {
      // Force reconnection
      if (listenerRef.current) {
        off(ref(db, path), 'value', listenerRef.current);
      }
      setLoading(true);
    }
  };
}
```

---

## Usage Examples

### Example 1: Multi-Source Sales Dashboard Template

**Markdown Template:**
```markdown
# Sales Dashboard - {{wd_01.date | date}}

## Key Metrics Overview
- **Primary Revenue**: {{wd_01.revenue | currency}} ({{wd_01.status | status_badge}})
- **Secondary Revenue**: {{wd_02.revenue | currency}} ({{wd_02.status | status_badge}})
- **Total Revenue**: {{(wd_01.revenue + wd_02.revenue) | currency}}

## Performance Comparison
| Source | Revenue | Conversion | Growth |
|--------|---------|------------|--------|
| Primary Sales | {{wd_01.revenue | currency}} | {{wd_01.conversion_rate | percentage}} | {{wd_01.growth | percentage}} |
| Partner Sales | {{wd_02.revenue | currency}} | {{wd_02.conversion_rate | percentage}} | {{wd_02.growth | percentage}} |

{{#if wd_01.status === 'running'}}
### Primary System - Live Updates
- Last processed: {{wd_01.last_processed | date}}
- Records processed: {{wd_01.records_processed}}/{{wd_01.total_records}}
- Progress: {{wd_01.progress | progress_bar}}
{{/if}}

{{#if wd_02.status === 'running'}}
### Partner System - Live Updates
- API calls today: {{wd_02.api_calls | number}}
- Sync status: {{wd_02.sync_status | status_badge}}
- Last sync: {{wd_02.last_sync | relative_time}}
{{/if}}

## Top Performing Products
### Primary Channel
{{#each wd_01.top_products}}
- **{{name}}**: {{sales | currency}} ({{growth | growth_indicator}})
{{/each}}

### Partner Channel
{{#each wd_02.top_products}}
- **{{name}}**: {{sales | currency}} ({{margin | percentage}} margin)
{{/each}}

---
*Data sources: {{_meta.workflow_sources.length}} active | Last updated: {{_meta.last_update | format('HH:mm:ss')}}*
```

**JSON Data Structure (Pin Content):**
```json
{
  "wd_01": {
    "date": "2024-12-25",
    "revenue": 45670.50,
    "conversion_rate": 0.124,
    "growth": 0.15,
    "status": "running",
    "top_products": [
      {
        "name": "Pro Plan",
        "sales": 28400,
        "growth": 0.12
      },
      {
        "name": "Basic Plan", 
        "sales": 12800,
        "growth": 0.18
      }
    ]
  },
  "wd_02": {
    "revenue": 23450.75,
    "conversion_rate": 0.089,
    "growth": 0.08,
    "status": "running",
    "api_calls": 15420,
    "sync_status": "healthy",
    "top_products": [
      {
        "name": "Enterprise",
        "sales": 18900,
        "margin": 0.65
      },
      {
        "name": "Starter",
        "sales": 4550,
        "margin": 0.45
      }
    ]
  }
}
```

**Firebase Live Data Structure:**
```json
{
  "wd_01": {
    "last_processed": "2024-12-25T15:30:00Z",
    "records_processed": 1240,
    "total_records": 1500,
    "progress": 82.7
  },
  "wd_02": {
    "last_sync": "2024-12-25T15:28:00Z",
    "sync_status": "healthy"
  }
}
```

### Example 2: Multi-System Monitoring Template

**Markdown Template:**
```markdown
# System Health Monitor

## Infrastructure Overview
- **Primary Servers**: {{wd_01.status | status_badge}}
- **Database Cluster**: {{wd_02.status | status_badge}}  
- **CDN Network**: {{wd_03.status | status_badge}}

### Performance Metrics
| System | CPU | Memory | Response Time | Status |
|--------|-----|--------|---------------|--------|
| Web Servers | {{wd_01.cpu}}% | {{wd_01.memory}}% | {{wd_01.response_time}}ms | {{wd_01.cpu > 80 || wd_01.memory > 90 ? '⚠️' : '✅'}} |
| Database | {{wd_02.cpu}}% | {{wd_02.memory}}% | {{wd_02.query_time}}ms | {{wd_02.cpu > 70 || wd_02.memory > 85 ? '⚠️' : '✅'}} |
| Cache Layer | {{wd_03.cpu}}% | {{wd_03.memory}}% | {{wd_03.hit_rate | percentage}} | {{wd_03.hit_rate < 0.95 ? '⚠️' : '✅'}} |

### Active Integrations

#### Primary Services (wd_01)
{{#each wd_01.integrations}}
- **{{name}}**: {{status | status_badge}} ({{last_sync | format('MMM DD HH:mm')}})
{{/each}}

#### Database Connections (wd_02)
{{#each wd_02.connections}}
- **{{service}}**: {{connection_count}} active ({{max_connections}} max)
{{/each}}

### System Alerts
{{#if wd_01.alerts && wd_01.alerts.length > 0}}
#### Web Server Alerts
{{#each wd_01.alerts}}
- **{{level}}**: {{message}} ({{timestamp | relative_time}})
{{/each}}
{{/if}}

{{#if wd_02.alerts && wd_02.alerts.length > 0}}
#### Database Alerts  
{{#each wd_02.alerts}}
- **{{level}}**: {{message}} ({{timestamp | relative_time}})
{{/each}}
{{/if}}

## Performance Trends
- **Overall Health**: {{((wd_01.health_score + wd_02.health_score + wd_03.health_score) / 3) | round(1)}}/10
- **Total Requests**: {{(wd_01.requests + wd_02.queries + wd_03.cache_requests) | number}}
- **Average Response**: {{((wd_01.response_time + wd_02.query_time) / 2) | round(0)}}ms

---
*Monitoring {{_meta.workflow_sources.length}} systems | Updated: {{_meta.last_update | relative_time}}*
```

### Example 3: Real-time Analytics

**Component Usage:**
```typescript
import { RealTimePin } from '@/components/real-time-pin';

export default function SharePinPage({ params }: { params: { pinId: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <RealTimePin 
        initialPin={null} // Will load from Firebase
      />
    </div>
  );
}
```

---

## Advanced Features

### 1. Custom Formatters

```typescript
// lib/custom-formatters.ts
export const customFormatters = {
  // Business-specific formatters
  mrr: (value: number) => `$${(value / 100).toFixed(0)}/mo`,
  
  growth_indicator: (value: number) => {
    if (value > 0) return `📈 +${value.toFixed(1)}%`;
    if (value < 0) return `📉 ${value.toFixed(1)}%`;
    return `➡️ ${value.toFixed(1)}%`;
  },
  
  user_avatar: (user: any) => user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`,
  
  relative_time: (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
};
```

### 2. Template Validation

```typescript
// lib/template-validator.ts
export function validateTemplate(template: string, sampleData: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  variables: string[];
} {
  const parsed = parseTemplate(template);
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if all variables exist in sample data
  for (const variable of parsed.variables) {
    const value = getValue(sampleData, variable);
    if (value === undefined) {
      warnings.push(`Variable '${variable}' not found in sample data`);
    }
  }
  
  // Validate template syntax
  try {
    injectVariables(parsed.ast, sampleData);
  } catch (error) {
    errors.push(`Template error: ${error.message}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    variables: parsed.variables
  };
}
```

### 3. Performance Optimization

```typescript
// hooks/use-optimized-template.ts
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

export function useOptimizedTemplate(template: string, data: any) {
  // Memoize parsed template
  const parsedTemplate = useMemo(() => {
    return parseTemplate(template);
  }, [template]);
  
  // Debounce template processing for rapid data changes
  const debouncedProcess = useCallback(
    debounce((data: any) => {
      return injectVariables(parsedTemplate.ast, data);
    }, 100),
    [parsedTemplate]
  );
  
  // Only reprocess when data actually changes
  const processedContent = useMemo(() => {
    if (!data) return template;
    return debouncedProcess(data).content;
  }, [data, debouncedProcess]);
  
  return processedContent;
}
```

---

## Error Handling & Fallbacks

### 1. Template Error Boundaries

```typescript
// components/template-error-boundary.tsx
import { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TemplateErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert variant="destructive">
          <AlertDescription>
            Template rendering failed: {this.state.error?.message}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### 2. Graceful Degradation

```typescript
// components/fallback-content.tsx
export function FallbackContent({ 
  originalContent, 
  errors 
}: { 
  originalContent: string; 
  errors: string[] 
}) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertDescription>
          Template processing failed. Showing original content.
          <details className="mt-2">
            <summary>Error details</summary>
            <ul className="mt-1 text-xs">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </details>
        </AlertDescription>
      </Alert>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown>{originalContent}</ReactMarkdown>
      </div>
    </div>
  );
}
```

---

## Testing Strategy

### 1. Template Engine Tests

```typescript
// __tests__/template-engine.test.ts
import { parseTemplate, injectVariables } from '@/lib/template-engine';

describe('Template Engine', () => {
  test('should parse simple variables', () => {
    const result = parseTemplate('Hello {{data.name}}!');
    expect(result.variables).toContain('data.name');
  });

  test('should inject variables correctly', () => {
    const parsed = parseTemplate('Revenue: {{data.revenue | currency}}');
    const result = injectVariables(parsed.ast, { data: { revenue: 1000 } });
    expect(result.content).toBe('Revenue: $1,000.00');
  });

  test('should handle missing variables gracefully', () => {
    const parsed = parseTemplate('Value: {{data.missing || "N/A"}}');
    const result = injectVariables(parsed.ast, { data: {} });
    expect(result.content).toBe('Value: N/A');
  });
});
```

### 2. Real-time Component Tests

```typescript
// __tests__/real-time-pin.test.tsx
import { render, screen } from '@testing-library/react';
import { RealTimePin } from '@/components/real-time-pin';

const mockPinData = {
  id: 'test-pin',
  data_type: 'markdown',
  content: 'Revenue: {{data.revenue | currency}}',
  metadata: { title: 'Test Pin' }
};

test('should render pin content with variables', () => {
  render(<RealTimePin initialPin={mockPinData} />);
  expect(screen.getByText('Test Pin')).toBeInTheDocument();
});
```

---

This comprehensive specification provides a robust foundation for real-time template processing in your frontend, enabling dynamic content updates with powerful variable injection capabilities.
