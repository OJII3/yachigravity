export interface ViewerPage<TItem> {
  readonly items: TItem[];
  readonly nextCursor: string | null;
}

export interface PinoViewerEvent {
  readonly source: "pino";
  readonly id: string;
  readonly timestamp: string;
  readonly level: number;
  readonly levelLabel: string;
  readonly kind: string;
  readonly summary: string;
  readonly attributes: Readonly<Record<string, unknown>>;
}

export type AntigravityViewerEventKind = "user" | "assistant" | "tool" | "status";

export interface AntigravityViewerEvent {
  readonly source: "antigravity";
  readonly id: string;
  readonly timestamp: string;
  readonly sessionId: string;
  readonly kind: AntigravityViewerEventKind;
  readonly role?: string;
  readonly parentId?: string | null;
  readonly summary?: string;
  readonly content?: unknown;
}

export type ViewerEvent = PinoViewerEvent | AntigravityViewerEvent;

export interface ViewerSessionSummary {
  readonly id: string;
  readonly channelKey: string;
  readonly created: string;
  readonly modified: string;
  readonly messageCount: number;
  readonly firstMessage: string;
}

export interface ViewerSessionDetail {
  readonly session: ViewerSessionSummary;
  readonly items: AntigravityViewerEvent[];
}
