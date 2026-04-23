import React, { useEffect, useRef, useState } from 'react';
import { Box } from 'ink';
// ink-big-text has no types.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BigText from 'ink-big-text';
import { Gradient } from './Gradient.js';
import { logoGradient, c } from '../theme.js';
import { Tracked } from './Tracking.js';

/**
 * Boot logo. The site's headline font (Monoton) cannot be loaded in a
 * terminal; ink-big-text's "block" font is the closest stacked-bar feel.
 *
 * Fade-in is done by progressively revealing characters of the source
 * string, *not* by ramping color — ink-big-text renders at the block-char
 * level, so per-character color ramping would require forking the lib.
 * Character-reveal is simpler and reads well.
 */
export function Logo({
  onDone,
  speedMultiplier = 1,
}: {
  onDone?: () => void;
  speedMultiplier?: number;
}): React.ReactElement {
  const full = 'JUNGL3';
  const [shown, setShown] = useState<string>('');

  // Stash onDone in a ref so parent re-renders (which produce a new callback
  // identity each tick via App's elapsed timer) do not retrigger the reveal
  // effect. Without this, the effect restarts every ~1s and the logo gets
  // stuck on the first few chars.
  const onDoneRef = useRef<typeof onDone>(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let i = 0;
    setShown('');
    const perChar = Math.max(10, Math.round((800 / full.length) * speedMultiplier));
    const id = setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        const hold = Math.max(20, Math.round(1200 * speedMultiplier));
        setTimeout(() => onDoneRef.current?.(), hold);
      }
    }, perChar);
    return () => clearInterval(id);
  }, [speedMultiplier]);

  return (
    <Box flexDirection="column" alignItems="center">
      <Gradient colors={logoGradient}>
        <BigText text={shown || ' '} font="block" space={false} />
      </Gradient>
      <Box marginTop={1}>
        <Tracked color={c.label}>the prototype platform</Tracked>
      </Box>
    </Box>
  );
}
