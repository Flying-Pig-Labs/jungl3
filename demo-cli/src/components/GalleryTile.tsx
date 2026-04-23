import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme.js';

/**
 * Gallery listing tile. The border is drawn stroke-by-stroke over ~400ms
 * using Unicode box characters, in the order a pen would trace it:
 * top (left→right), right (top→bottom), bottom (right→left), left
 * (bottom→top).
 *
 * Interior content is passed as `interiorLines` — one string per interior
 * row. That is the smallest honest API for Ink: we render the grid as a
 * row stack, and each interior row composes left-border + content + right-
 * border in a flex row. Trying to absolute-position children over the
 * border would fight Ink's layout.
 *
 * Content appears once the border has finished drawing. Revealing interior
 * characters alongside the border would read as busy.
 */

interface StrokeCell {
  row: number;
  col: number;
  ch: string;
}

function computePerimeter(width: number, height: number): StrokeCell[] {
  const cells: StrokeCell[] = [];
  cells.push({ row: 0, col: 0, ch: '┌' });
  for (let x = 1; x < width - 1; x++) cells.push({ row: 0, col: x, ch: '─' });
  cells.push({ row: 0, col: width - 1, ch: '┐' });
  for (let y = 1; y < height - 1; y++) cells.push({ row: y, col: width - 1, ch: '│' });
  cells.push({ row: height - 1, col: width - 1, ch: '┘' });
  for (let x = width - 2; x >= 1; x--) cells.push({ row: height - 1, col: x, ch: '─' });
  cells.push({ row: height - 1, col: 0, ch: '└' });
  for (let y = height - 2; y >= 1; y--) cells.push({ row: y, col: 0, ch: '│' });
  return cells;
}

export interface GalleryTileProps {
  width: number;
  height: number;
  /** One string per *interior* row. Must have length === height - 2. */
  interiorLines: readonly React.ReactNode[];
  drawDurationMs?: number;
  speedMultiplier?: number;
  borderColor?: string;
  onBorderDone?: () => void;
}

export function GalleryTile({
  width,
  height,
  interiorLines,
  drawDurationMs = 400,
  speedMultiplier = 1,
  borderColor = c.done,
  onBorderDone,
}: GalleryTileProps): React.ReactElement {
  const perimeter = useMemo(() => computePerimeter(width, height), [width, height]);

  // Under --fast, a 1ms setInterval is at the mercy of the event loop and
  // routinely gets starved before the border finishes. The tile's purpose
  // under --fast is purely a smoke-test fixture, so we skip the animation
  // and render complete immediately.
  const instantDraw = speedMultiplier <= 0.1;
  const [cursor, setCursor] = useState<number>(instantDraw ? perimeter.length : 0);

  useEffect(() => {
    if (instantDraw) {
      setCursor(perimeter.length);
      onBorderDone?.();
      return;
    }
    setCursor(0);
    const stepMs = Math.max(6, Math.round(drawDurationMs / perimeter.length));
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCursor(i);
      if (i >= perimeter.length) {
        clearInterval(id);
        onBorderDone?.();
      }
    }, stepMs);
    return () => clearInterval(id);
  }, [perimeter.length, drawDurationMs, instantDraw, onBorderDone]);

  // Build a row×col char grid containing only the border cells drawn so far.
  const grid: (string | null)[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null as string | null),
  );
  for (let i = 0; i < Math.min(cursor, perimeter.length); i++) {
    const p = perimeter[i]!;
    grid[p.row]![p.col] = p.ch;
  }

  const borderComplete = cursor >= perimeter.length;

  return (
    <Box flexDirection="column">
      {grid.map((row, y) => {
        const leftBorder = row[0] ?? ' ';
        const rightBorder = row[width - 1] ?? ' ';
        const isEdgeRow = y === 0 || y === height - 1;

        if (isEdgeRow) {
          return (
            <Text key={y} color={borderColor}>
              {row.map((ch) => ch ?? ' ').join('')}
            </Text>
          );
        }

        // Interior row: left border + content + right border
        const contentNode = borderComplete ? interiorLines[y - 1] ?? null : null;

        return (
          <Box key={y} flexDirection="row">
            <Text color={borderColor}>{leftBorder}</Text>
            <Box width={width - 2} paddingX={1}>
              {contentNode != null ? (
                typeof contentNode === 'string' ? (
                  <Text color={c.body}>{contentNode}</Text>
                ) : (
                  contentNode
                )
              ) : (
                <Text> </Text>
              )}
            </Box>
            <Text color={borderColor}>{rightBorder}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
