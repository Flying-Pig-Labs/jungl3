import React from 'react';
import { Text } from 'ink';

/**
 * The site uses wide letter-spacing on all labels (`tracking-[0.3em]`,
 * `tracking-[0.4em]`). A terminal cannot set letter-spacing, so we fake it
 * by inserting a space between every character. The visual signature is the
 * same: labels read as *labels*, not as words.
 *
 * Use for: act titles, pane titles, keybind hints, step counters — anywhere
 * the site uses uppercase tracking.
 */
export function Tracked({
  children,
  color,
  dimColor,
}: {
  children: React.ReactNode;
  color?: string;
  dimColor?: boolean;
}): React.ReactElement {
  const raw = React.Children.toArray(children)
    .map((node) => (typeof node === 'string' || typeof node === 'number' ? String(node) : ''))
    .join('');
  const spaced = raw.toUpperCase().split('').join(' ');
  return (
    <Text color={color} dimColor={dimColor}>
      {spaced}
    </Text>
  );
}
