/**
 * Palette converted once from the site's oklch source
 * (src/styles.css @ repo root) to sRGB hex. Done offline with the standard
 * OKLab → linear sRGB → sRGB pipeline from CSS Color Module 4, gamut-clamped.
 *
 * Why hex here and not oklch at runtime: Ink writes raw ANSI to stdout. The
 * terminal does the final color; we cannot rely on a CSS engine. Convert once,
 * trust the constants.
 *
 * The four site-language roles:
 *   neon      — bright lime, the "alive" color; reserved for payoff and
 *               completion highlights
 *   primaryGreen — a dimmer live green; the baseline "working UI" color
 *   moss      — darker green, recedes; used in gradients and secondary text
 *   gold      — accent for HUD corners, pane titles, and the act counter
 *   ember     — rare hot-pink, used at most one moment per run
 *   jungle    — very dark green, reserved (not used on screen; the terminal's
 *               own background is our background)
 *   foreground   — warm off-white body text
 *   muted        — dimmed secondary / log body text
 */

export const palette = {
  foreground: '#F6F2E0',
  muted: '#A5B39A',
  neon: '#52D07A',
  primaryGreen: '#3CB769',
  moss: '#2B8A50',
  gold: '#D7B24A',
  ember: '#E8468E',
  jungle: '#0F2F1E',
  dim: '#5A6A5E',
} as const;

export type ColorName = keyof typeof palette;

/**
 * Site's --gradient-headline is gold → neon → moss. We reuse it for every
 * hero payoff line across the four acts so the gradient reads as a recurring
 * signature rather than as decoration.
 */
export const headlineGradient = [palette.gold, palette.neon, palette.moss] as const;

/**
 * Boot-logo gradient. Slightly richer than the headline gradient so the logo
 * does not read as "yet another title."
 */
export const logoGradient = [palette.gold, palette.neon, palette.moss, palette.primaryGreen] as const;

/**
 * Convenience exports to avoid magic strings in act code.
 */
export const c = {
  label: palette.gold,
  title: palette.foreground,
  live: palette.primaryGreen,
  done: palette.neon,
  body: palette.foreground,
  dim: palette.dim,
  muted: palette.muted,
  rare: palette.ember,
} as const;
