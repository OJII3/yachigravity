import { createInterface } from "node:readline";

const TOOL_NAME = "discord_send";
const PROTOCOL_VERSION = "2025-06-18";

interface JsonRpcRequest {
  readonly id?: string | number | null;
  readonly method?: unknown;
  readonly params?: unknown;
}

const tool = {
  name: TOOL_NAME,
  description: "Send a user-visible message to the current Discord conversation.",
  inputSchema: {
    type: "object",
    properties: {
      content: { type: "string", minLength: 1 },
    },
    required: ["content"],
    additionalProperties: false,
  },
};

const endpoint = requiredEnvironment("ANTIYACHIVIY_DISCORD_SEND_ENDPOINT");
const token = requiredEnvironment("ANTIYACHIVIY_DISCORD_SEND_TOKEN");

for await (const line of createInterface({ input: process.stdin })) {
  if (!line.trim()) continue;
  try {
    await handleRequest(line);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }
}

async function handleRequest(line: string): Promise<void> {
  let request: JsonRpcRequest;
  try {
    request = JSON.parse(line) as JsonRpcRequest;
  } catch {
    return;
  }

  if (request.id === undefined) return;

  if (request.method === "initialize") {
    writeResponse(request.id, {
      protocolVersion: protocolVersion(request.params),
      capabilities: { tools: {} },
      serverInfo: { name: "antiyachiviy-discord", version: "0.1.0" },
    });
    return;
  }

  if (request.method === "ping") {
    writeResponse(request.id, {});
    return;
  }

  if (request.method === "tools/list") {
    writeResponse(request.id, { tools: [tool] });
    return;
  }

  if (request.method === "tools/call") {
    await callTool(request.id, request.params);
    return;
  }

  writeError(request.id, -32601, `Method not found: ${String(request.method)}`);
}

async function callTool(id: string | number | null, params: unknown): Promise<void> {
  if (!isRecord(params) || params.name !== TOOL_NAME || !isRecord(params.arguments)) {
    writeError(id, -32602, "Invalid discord_send arguments");
    return;
  }

  const content = params.arguments.content;
  if (typeof content !== "string" || content.length === 0) {
    writeError(id, -32602, "content must be a non-empty string");
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error(`Discord send gateway returned HTTP ${response.status}`);
    }
  } catch (error) {
    writeResponse(id, {
      content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
      isError: true,
    });
    return;
  }

  writeResponse(id, {
    content: [
      {
        type: "text",
        text: `The message was sent to Discord.\nSent content:\n${content}`,
      },
    ],
  });
}

function protocolVersion(params: unknown): string {
  if (isRecord(params) && typeof params.protocolVersion === "string") {
    return params.protocolVersion;
  }
  return PROTOCOL_VERSION;
}

function writeResponse(id: string | number | null, result: unknown): void {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function writeError(id: string | number | null, code: number, message: string): void {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id })}\n`);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
