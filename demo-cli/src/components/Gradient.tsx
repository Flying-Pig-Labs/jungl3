import React from 'react';
// ink-gradient has no types shipped; treat as any at the boundary.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import InkGradient from 'ink-gradient';
import { headlineGradient } from '../theme.js';

/**
 * Site-signature gradient wrapper. Reserved for hero payoff lines and the
 * boot logo. Do not apply to body text; the gradient loses impact when
 * everything wears it.
 */
export function Gradient({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors?: readonly string[];
}): React.ReactElement {
  const palette = colors ?? headlineGradient;
  return <InkGradient colors={[...palette]}>{children}</InkGradient>;
}
