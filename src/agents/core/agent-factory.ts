import type { AgentDefinition } from "./agent-definition.js";
import type { AgentRuntime } from "./agent-runtime.js";

export interface AgentCreationOptions {
  readonly sessionKey: string;
}

export interface AgentFactory {
  create(definition: AgentDefinition, options: AgentCreationOptions): Promise<AgentRuntime>;
}
