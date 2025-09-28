// Frontend Logger - Clean browser console output, dev-only logging

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

export const logInfo = (message: string, context?: string, data?: any) => {
  if (context) {
    console.info(`ℹ️ %c[${context}]%c ${message}`, 
      'color: #0ea5e9; font-weight: bold;', 
      'color: inherit;', 
      data || ""
    );
  } else {
    console.info(`ℹ️ ${message}`, data || "");
  }
};

export const logVerbose = (message: string, context?: string, data?: any) => {
  if (!isDev) return;
  
  if (context) {
    console.log(`🛠️ %c[${context}]%c ${message}`, 
      'color: #f59e0b; font-weight: bold;', 
      'color: inherit;', 
      data || ""
    );
  } else {
    console.log(`🛠️ ${message}`, data || "");
  }
};

export const logError = (error: Error | string, context?: string, data?: any) => {
  if (context) {
    if (typeof error === "string") {
      console.error(`🚨 %c[${context}]%c ${error}`, 
        'color: #ef4444; font-weight: bold;', 
        'color: inherit;', 
        data || ""
      );
    } else {
      console.error(`🚨 %c[${context}]%c ${error.message}`, 
        'color: #ef4444; font-weight: bold;', 
        'color: inherit;', 
        error, data || ""
      );
    }
  } else {
    if (typeof error === "string") {
      console.error(`🚨 ${error}`, data || "");
    } else {
      console.error(`🚨 ${error.message}`, error, data || "");
    }
  }
};
