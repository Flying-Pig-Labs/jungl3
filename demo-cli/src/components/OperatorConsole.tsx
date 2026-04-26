import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { c } from '../theme.js';

/**
 * OperatorConsole — interactive jungl3› REPL.
 *
 * Drops the v2 sidebar; the Footer carries the keybinding hints in the
 * outer frame, and the act area is left wide for command output. Banner
 * reveals one row at a time (~180ms per row, scaled by speedMultiplier);
 * once the banner is up, useInput captures keystrokes and the prompt is
 * live.
 *
 * Commands recognized:
 *   help                    show command list
 *   clear                   wipe the history
 *   jungle list             4-row table of active jungles
 *   jungle status <name>    kv block for a jungle
 *   jungle logs <name>      4 recent log lines
 *   jungle teardown <name>  warn line + ack
 *   gallery list            3 visitor ratings
 *
 * VHS drives this via `Type "..." Enter` in the tape; useInput reads PTY
 * keystrokes the same way it would from a real keyboard.
 */

type HistoryItem =
  | { kind: 'prompt'; text: string }
  | { kind: 'title'; text: string }
  | { kind: 'help'; cmd: string; desc: string }
  | { kind: 'thead'; cols: readonly string[] }
  | { kind: 'trow'; cols: readonly string[]; mine?: boolean }
  | { kind: 'kv'; k: string; v: string; ok?: boolean }
  | { kind: 'logline'; ts: string; src: string; text: string }
  | { kind: 'star'; stars: number; who: string; what: string }
  | { kind: 'err'; text: string }
  | { kind: 'warn'; text: string }
  | { kind: 'out'; text: string; dim?: boolean };

const OP_HELP: ReadonlyArray<readonly [string, string]> = [
  ['jungle list', 'show all active jungles'],
  ['jungle status <name>', 'health + act progress'],
  ['jungle logs <name> --tail', 'stream recent events'],
  ['jungle teardown <name>', 'deallocate a jungle'],
  ['gallery list', 'browse Canopy gallery'],
  ['help', 'show this help'],
  ['clear', 'clear the screen'],
];

const TROW_WIDTHS = [22, 6, 12, 9, 4] as const;

function PromptCmd({ text }: { text: string }): React.ReactElement {
  // Color the head verb (jungl3›-prefixed user input) like the v2 demo:
  // first token gradient-ish (we use done as a proxy), --flags labelish,
  // <placeholders> dim, rest body.
  const parts = text.split(/\s+/);
  return (
    <Box flexDirection="row">
      <Text color={c.done} bold>
        jungl3›{' '}
      </Text>
      {parts.map((p, i) => {
        const col = i === 0 ? c.done : p.startsWith('--') ? c.label : p.startsWith('<') ? c.dim : c.body;
        return (
          <Text key={i} color={col}>
            {p}
            {i < parts.length - 1 ? ' ' : ''}
          </Text>
        );
      })}
    </Box>
  );
}

function HistoryRow({ row }: { row: HistoryItem }): React.ReactElement {
  switch (row.kind) {
    case 'prompt':
      return <PromptCmd text={row.text} />;
    case 'title':
      return (
        <Box>
          <Text color={c.label}>{row.text.toUpperCase().split('').join(' ')}</Text>
        </Box>
      );
    case 'help':
      return (
        <Box flexDirection="row">
          <Box width={28}>
            <Text color={c.done} bold>
              {row.cmd}
            </Text>
          </Box>
          <Text color={c.muted}>{row.desc}</Text>
        </Box>
      );
    case 'thead':
      return (
        <Box flexDirection="row">
          {row.cols.map((col, j) => (
            <Box key={j} width={TROW_WIDTHS[j] ?? 10}>
              <Text color={c.dim}>{col}</Text>
            </Box>
          ))}
        </Box>
      );
    case 'trow': {
      const isMine = Boolean(row.mine);
      return (
        <Box flexDirection="row">
          {row.cols.map((col, j) => {
            const w = TROW_WIDTHS[j] ?? 10;
            // Color cues per column:
            //   col 0 (name)    body for mine, muted otherwise; bold for mine
            //   col 2 (status)  status-specific color
            //   col 4 (health)  always done
            let color: string = isMine ? c.body : c.muted;
            if (j === 2) {
              color =
                col === 'settled'
                  ? c.done
                  : col === 'vending'
                    ? c.live
                    : col === 'probing'
                      ? c.label
                      : col === 'shaping'
                        ? c.label
                        : c.muted;
            }
            if (j === 4) color = c.done;
            const prefix = j === 0 ? (isMine ? '▸ ' : '  ') : '';
            return (
              <Box key={j} width={w}>
                <Text color={color} bold={isMine && j === 0}>
                  {prefix}
                  {col}
                </Text>
              </Box>
            );
          })}
        </Box>
      );
    }
    case 'kv':
      return (
        <Box flexDirection="row">
          <Box width={12}>
            <Text color={c.dim}>{row.k.toUpperCase()}</Text>
          </Box>
          <Text color={row.ok ? c.done : c.body}>{row.v}</Text>
        </Box>
      );
    case 'logline':
      return (
        <Box flexDirection="row">
          <Box width={10}>
            <Text color={c.dim}>{row.ts}</Text>
          </Box>
          <Box width={12}>
            <Text color={c.label}>{row.src}</Text>
          </Box>
          <Text color={c.muted}>{row.text}</Text>
        </Box>
      );
    case 'star':
      return (
        <Box flexDirection="row">
          <Box width={8}>
            <Text color={c.done}>
              {'★'.repeat(row.stars)}
              <Text color={c.dim}>{'☆'.repeat(Math.max(0, 5 - row.stars))}</Text>
            </Text>
          </Box>
          <Box width={18}>
            <Text color={c.body}>{row.who}</Text>
          </Box>
          <Text color={c.muted}>{row.what}</Text>
        </Box>
      );
    case 'err':
      return <Text color={c.rare}>✗ {row.text}</Text>;
    case 'warn':
      return <Text color={c.label}>! {row.text}</Text>;
    case 'out':
      return <Text color={row.dim ? c.dim : c.body}>{row.text}</Text>;
  }
}

export function OperatorConsole({
  teamName,
  speedMultiplier = 1,
}: {
  teamName: string;
  speedMultiplier?: number;
}): React.ReactElement {
  // c.muted reads like the dim moss the v2 web banner uses; the palette
  // export `palette.moss` exists but isn't aliased on `c`, and adding an
  // alias just for the console banner isn't worth it.
  const bannerLines: ReadonlyArray<{ text: string; col: string }> = [
    { text: '╭──────────────────────────────────────────────────────────╮', col: c.muted },
    { text: '│  jungl3 operator console                         v0.1.0  │', col: c.muted },
    { text: '│  connected · control-plane us-east-1 · account …012      │', col: c.muted },
    {
      text: `│  active jungle  ▸  jungle-${teamName.padEnd(30)} │`,
      col: c.muted,
    },
    { text: '├──────────────────────────────────────────────────────────┤', col: c.muted },
    { text: "│  type 'help' for commands · 'clear' to wipe · ↑/↓ history │", col: c.dim },
    { text: '╰──────────────────────────────────────────────────────────╯', col: c.muted },
  ];

  const [bannerShown, setBannerShown] = useState<number>(0);
  useEffect(() => {
    if (bannerShown >= bannerLines.length) return;
    const dwell = Math.max(8, Math.round(180 * speedMultiplier));
    const id = setTimeout(() => setBannerShown((n) => n + 1), dwell);
    return () => clearTimeout(id);
  }, [bannerShown, speedMultiplier, bannerLines.length]);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);

  const push = (items: HistoryItem[]) => setHistory((h) => [...h, ...items]);

  const run = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setCmdHistory((ch) => [...ch, trimmed]);
    setHistIdx(-1);
    push([{ kind: 'prompt', text: trimmed }]);
    const tokens = trimmed.split(/\s+/);
    const head = tokens[0] ?? '';
    const rest = tokens.slice(1);
    if (head === 'help') {
      push([
        { kind: 'title', text: 'commands' },
        ...OP_HELP.map(([cmd, desc]): HistoryItem => ({ kind: 'help', cmd, desc })),
      ]);
    } else if (head === 'clear') {
      setHistory([]);
    } else if (head === 'jungle' && rest[0] === 'list') {
      push([
        { kind: 'thead', cols: ['NAME', 'ACT', 'STATUS', 'AGE', 'HP'] },
        {
          kind: 'trow',
          cols: [`jungle-${teamName}`, '5', 'settled', '1h 02m', '●'],
          mine: true,
        },
        { kind: 'trow', cols: ['jungle-nova', '1', 'vending', '4m', '●'] },
        { kind: 'trow', cols: ['jungle-delta', '3', 'probing', '28m', '●'] },
        { kind: 'trow', cols: ['jungle-ember', '2', 'shaping', '12m', '●'] },
      ]);
    } else if (head === 'jungle' && rest[0] === 'status') {
      const name = rest[1] ?? teamName;
      push([
        { kind: 'title', text: `jungle-${name}` },
        { kind: 'kv', k: 'state', v: 'settled', ok: true },
        { kind: 'kv', k: 'region', v: 'us-east-1' },
        { kind: 'kv', k: 'tests', v: '47 passing · 0 failed', ok: true },
        { kind: 'kv', k: 'personas', v: '4 seeded · 6 defects (0 critical)' },
        { kind: 'kv', k: 'visitors', v: '3 · avg 4.0★' },
        { kind: 'kv', k: 'uptime', v: '1h 02m' },
      ]);
    } else if (head === 'jungle' && rest[0] === 'logs') {
      push([
        { kind: 'logline', ts: '22:14:03', src: 'canopy', text: 'judge-a session expired' },
        { kind: 'logline', ts: '22:14:11', src: 'understory', text: 'postgres backup rotated' },
        { kind: 'logline', ts: '22:14:29', src: 'heartbeat', text: 'all services green' },
        { kind: 'logline', ts: '22:14:44', src: 'synthetic', text: 'drift check · no anomalies' },
      ]);
    } else if (head === 'jungle' && rest[0] === 'teardown') {
      const name = rest[1] ?? teamName;
      push([
        { kind: 'warn', text: `teardown jungle-${name}? [y/N] y` },
        { kind: 'out', text: '  ⤷ resources released · state archived · 4s', dim: true },
      ]);
    } else if (head === 'gallery' && rest[0] === 'list') {
      push([
        { kind: 'title', text: 'canopy · gallery' },
        { kind: 'star', stars: 5, who: 'beta-user-b', what: 'claims-intake · "feels shipped"' },
        { kind: 'star', stars: 4, who: 'judge-a', what: 'claims-intake · missed one label' },
        { kind: 'star', stars: 3, who: 'stakeholder-c', what: 'needs more reporting' },
      ]);
    } else {
      push([{ kind: 'err', text: `unknown command: ${head}. try 'help'.` }]);
    }
  };

  // Caret blink
  const [caretOn, setCaretOn] = useState<boolean>(true);
  useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  // Gate useInput on TTY availability — under the smoke test stdin is
  // 'ignore', and Ink's raw-mode call throws. The console then renders
  // the banner + a prompt and gracefully does nothing, which is the
  // right smoke-test behavior anyway.
  const inputEnabled = Boolean(process.stdin.isTTY);
  useInput((char, key) => {
    if (key.return) {
      run(input);
      setInput('');
      return;
    }
    if (key.backspace || key.delete) {
      setInput((s) => s.slice(0, -1));
      return;
    }
    if (key.upArrow) {
      if (cmdHistory.length === 0) return;
      const next = histIdx < 0 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? '');
      return;
    }
    if (key.downArrow) {
      if (histIdx < 0) return;
      const next = histIdx + 1;
      if (next >= cmdHistory.length) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(cmdHistory[next] ?? '');
      }
      return;
    }
    if (key.escape || key.tab) return;
    if (char && !key.ctrl && !key.meta) {
      // Only printable ASCII — no zero-width or control sequences. The
      // command set itself is ASCII-only so we don't need to support
      // wider Unicode in the input line.
      const filtered = char.replace(/[^\x20-\x7e]/g, '');
      if (filtered) setInput((s) => s + filtered);
    }
  }, { isActive: inputEnabled });

  // Render the most recent ~12 history items so the console stays inside
  // the act area without scrollback. With the banner taking 7 rows there's
  // no room for unbounded history; older commands roll off the top.
  const HISTORY_TAIL = 8;
  const tail = history.slice(Math.max(0, history.length - HISTORY_TAIL));

  return (
    <Box flexDirection="column" paddingX={2} flexGrow={1}>
      <Box flexDirection="column">
        {bannerLines.slice(0, bannerShown).map((l, i) => (
          <Text key={i} color={l.col}>
            {l.text}
          </Text>
        ))}
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {tail.map((row, i) => (
          <HistoryRow key={i} row={row} />
        ))}
      </Box>
      {/* Input line */}
      <Box flexDirection="row" marginTop={1}>
        <Text color={c.done} bold>
          jungl3›{' '}
        </Text>
        <Text color={c.body}>{input}</Text>
        <Text color={c.done}>{caretOn ? '█' : ' '}</Text>
      </Box>
    </Box>
  );
}
