import PrettyError from "pretty-error";
import chalk from "chalk";

// Force chalk to use colors even when output is redirected
chalk.level = 3; // Force 256 color support

const prettyError = new PrettyError();

// Style the errors with nice colors
prettyError.appendStyle({
  "pretty-error > header > title > kind": {
    background: "red",
    color: "white",
  },
  "pretty-error > header > colon": { color: "white" },
  "pretty-error > header > message": { color: "red" },
  "pretty-error > trace > item > header > pointer > file": { color: "cyan" },
  "pretty-error > trace > item > header > pointer > line": { color: "yellow" },
});

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development";

// Centralized info logging function with beautiful colors using chalk
export const logInfo = (message: string, context?: string, data?: any) => {
  const emoji = "📌";
  const timestamp = new Date().toISOString();

  if (context) {
    console.info(
      chalk.blue(`${emoji} INFO`) +
        chalk.gray(` [${timestamp}]`) +
        chalk.cyan(` [${context}]`) +
        chalk.white(`: ${message}`)
    );
  } else {
    console.info(
      chalk.blue(`${emoji} INFO`) +
        chalk.gray(` [${timestamp}]`) +
        chalk.white(`: ${message}`)
    );
  }

  // Log additional data if provided - formatted beautifully
  if (data !== undefined) {
    if (typeof data === "object" && data !== null) {
      // Format objects with proper indentation and colors
      console.info(chalk.gray("   Variables:"));
      Object.entries(data).forEach(([key, value]) => {
        console.info(
          chalk.gray("     ") +
            chalk.cyan(key) +
            chalk.gray(": ") +
            chalk.dim(typeof value === "string" ? `"${value}"` : String(value))
        );
      });
    } else {
      console.info(chalk.gray("   Data:"), chalk.dim(String(data)));
    }
  }

  console.info(""); // Empty line for spacing
};

// Centralized verbose logging function with yellow colors using chalk
export const logVerbose = (message: string, context?: string, data?: any) => {
  // Only log if in development mode
  if (!isDev) return;

  const emoji = "🔍";
  const timestamp = new Date().toISOString();

  if (context) {
    console.log(
      chalk.yellow(`${emoji} VERBOSE`) +
        chalk.gray(` [${timestamp}]`) +
        chalk.yellowBright(` [${context}]`) +
        chalk.white(`: ${message}`)
    );
  } else {
    console.log(
      chalk.yellow(`${emoji} VERBOSE`) +
        chalk.gray(` [${timestamp}]`) +
        chalk.white(`: ${message}`)
    );
  }

  // Log additional data if provided - formatted beautifully
  if (data !== undefined) {
    if (typeof data === "object" && data !== null) {
      // Format objects with proper indentation and colors
      console.log(chalk.gray("   Data:"));
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          console.log(
            chalk.gray("     ") +
              chalk.yellow(`[${index}]`) +
              chalk.gray(": ") +
              chalk.dim(
                typeof item === "string" ? `"${item}"` : JSON.stringify(item)
              )
          );
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          console.log(
            chalk.gray("     ") +
              chalk.yellow(key) +
              chalk.gray(": ") +
              chalk.dim(
                typeof value === "string" ? `"${value}"` : JSON.stringify(value)
              )
          );
        });
      }
    } else {
      console.log(chalk.gray("   Data:"), chalk.dim(String(data)));
    }
  }

  console.log(""); // Empty line for spacing
};

// Centralized error logging function with beautiful formatting
export const logError = (
  error: Error | string,
  context?: string,
  data?: any
) => {
  if (typeof error === "string") {
    error = new Error(error);
  }

  const emoji = "🚨";
  const timestamp = new Date().toISOString();

  if (context) {
    console.error(
      chalk.red(`${emoji} ERROR`) +
        chalk.gray(` [${timestamp}]`) +
        chalk.redBright(` [${context}]`)
    );
  } else {
    console.error(
      chalk.red(`${emoji} ERROR`) +
        chalk.gray(` [${timestamp}]`)
    );
  }

  console.error(prettyError.render(error));

  // Log additional data if provided
  if (data !== undefined) {
    if (typeof data === "object" && data !== null) {
      console.error(chalk.gray("   Additional Data:"));
      Object.entries(data).forEach(([key, value]) => {
        console.error(
          chalk.gray("     ") +
            chalk.red(key) +
            chalk.gray(": ") +
            chalk.dim(typeof value === "string" ? `"${value}"` : String(value))
        );
      });
    } else {
      console.error(chalk.gray("   Data:"), chalk.dim(String(data)));
    }
  }

  console.error(""); // Empty line for spacing
};
