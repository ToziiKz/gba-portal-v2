type LogLevel = "error" | "warn" | "info" | "debug";

const isProd = process.env.NODE_ENV === "production";

function sanitizeArg(value: unknown) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (typeof value === "object" && value !== null) {
    return "[object]";
  }
  return value;
}

function emit(level: LogLevel, message: string, ...args: unknown[]) {
  const safeArgs = isProd ? args.map(sanitizeArg) : args;

  if (level === "error") {
    console.error(message, ...safeArgs);
    return;
  }
  if (level === "warn") {
    console.warn(message, ...safeArgs);
    return;
  }
  if (!isProd) {
    if (level === "debug") {
      console.debug(message, ...safeArgs);
      return;
    }
    console.log(message, ...safeArgs);
  }
}

export const log = {
  error: (message: string, ...args: unknown[]) =>
    emit("error", message, ...args),
  warn: (message: string, ...args: unknown[]) => emit("warn", message, ...args),
  info: (message: string, ...args: unknown[]) => emit("info", message, ...args),
  debug: (message: string, ...args: unknown[]) =>
    emit("debug", message, ...args),
};
