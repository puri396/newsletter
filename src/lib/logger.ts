type LogLevel = "error" | "warn" | "info";

interface LogContext {
  [key: string]: string | number | boolean | undefined | null;
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
): void {
  const payload = {
    level,
    message,
    ...context,
    timestamp: new Date().toISOString(),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
