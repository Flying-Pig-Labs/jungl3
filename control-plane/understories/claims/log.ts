/** Structured JSON logs. Every line carries install_id, jungle_id and trace_id (ADR 0005, in spirit). */
export interface LogContext {
  install_id: string;
  jungle_id: string;
  trace_id: string;
}

export function log(ctx: LogContext, level: 'info' | 'warn' | 'error', msg: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...ctx, ...fields }));
}

export function envContext(traceId: string): LogContext {
  return { install_id: process.env.INSTALL_ID ?? 'unset', jungle_id: process.env.JUNGLE_ID ?? 'unset', trace_id: traceId };
}
