import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { findForbiddenThemeColors } from './themeAudit';

describe('findForbiddenThemeColors', () => {
  it('detects named and numeric purple colors in CSS values', () => {
    expect(findForbiddenThemeColors('.x { color: purple; border-color: #8a2be2; background: rgb(130 70 170); }'))
      .toEqual(['#8a2be2', 'purple', 'rgb(130 70 170)']);
  });

  it('ignores neutral colors and non-color tokens', () => {
    expect(findForbiddenThemeColors('.x { color: #1e1e1e; width: 24px; --label: violet; }'))
      .toEqual(['violet']);
  });

  it('keeps application styles free of purple theme colors', () => {
    const css = [
      'src/styles/index.css',
      'src/components/GraphView.css',
      'src/components/App.css',
      'src/components/CodePanel.css',
    ].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8')).join('\n');

    expect(findForbiddenThemeColors(css)).toEqual([]);
  });
});
