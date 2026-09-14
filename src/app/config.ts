import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Check, Errors } from "typebox/value";

import { AntiyachiviyConfigSchema, type AntiyachiviyConfig } from "./config-schema.js";

export const DEFAULT_CONFIG_PATH = "config/antiyachiviy.json";

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export async function loadConfig(
  configPath = process.env.ANTIYACHIVIY_CONFIG_PATH ?? DEFAULT_CONFIG_PATH,
): Promise<AntiyachiviyConfig> {
  const resolvedConfigPath = resolve(configPath);

  let content: string;
  try {
    content = await readFile(resolvedConfigPath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error(
        `Antiyachiviy config was not found: ${resolvedConfigPath}. ` +
          `Copy config/antiyachiviy.example.json to config/antiyachiviy.json first.`,
      );
    }

    throw new Error(`Failed to read Antiyachiviy config: ${resolvedConfigPath}`, {
      cause: error,
    });
  }

  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch (error) {
    throw new Error(`Antiyachiviy config is not valid JSON: ${resolvedConfigPath}`, {
      cause: error,
    });
  }

  if (!Check(AntiyachiviyConfigSchema, value)) {
    const errors = Errors(AntiyachiviyConfigSchema, value)
      .slice(0, 5)
      .map((error) => `${error.instancePath || "$"}: ${error.message}`)
      .join("; ");

    throw new Error(`Antiyachiviy config is invalid: ${resolvedConfigPath}. ${errors}`);
  }

  return value;
}
