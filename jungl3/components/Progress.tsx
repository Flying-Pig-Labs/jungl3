import React, { useState } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import { useInterval } from '../hooks/useInterval.js';
import { c } from '../theme.js';

export type SubtaskState = 'pending' | 'active' | 'done' | 'error';

export interface Subtask {
  label: string;
  state: SubtaskState;
}

/**
 * Braille frames. Each tick lights one dot at a time traveling around a 2x4
 * cell. This is the handmade replacement for ink-spinner.
 */
const BRAILLE_FRAMES = ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'];

export function Spinner({ color = c.live }: { color?: string }): React.ReactElement {
  const [frame, setFrame] = useState(0);
  useInterval(() => setFrame((f) => (f + 1) % BRAILLE_FRAMES.length), 120);
  return <Text color={color}>{BRAILLE_FRAMES[frame]}</Text>;
}

export function SubtaskRow({ task }: { task: Subtask }): React.ReactElement {
  const { label, state } = task;
  return (
    <Box flexDirection="row">
      <Box width={3}>
        {state === 'pending' && <Text color={c.dim}>{figures.circleDotted}</Text>}
        {state === 'active' && <Spinner color={c.live} />}
        {state === 'done' && <Text color={c.done}>{figures.tick}</Text>}
        {state === 'error' && <Text color={c.rare}>{figures.cross}</Text>}
      </Box>
      <Box flexGrow={1}>
        <Text
          color={
            state === 'done'
              ? c.body
              : state === 'active'
                ? c.body
                : state === 'error'
                  ? c.rare
                  : c.dim
          }
          dimColor={state === 'pending'}
        >
          {label}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * A named stack of subtasks. The caller owns the state array and mutates it
 * via the beat runner; this component only renders.
 */
export function SubtaskList({ tasks }: { tasks: Subtask[] }): React.ReactElement {
  return (
    <Box flexDirection="column">
      {tasks.map((t, i) => (
        <SubtaskRow key={`${i}-${t.label}`} task={t} />
      ))}
    </Box>
  );
}
