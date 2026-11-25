import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('canvas-first workspace', () => {
  it('places the graph canvas before the compact code rail and hides the duplicate data rail', () => {
    render(<App />);
    const workspace = screen.getByRole('main');
    const canvas = screen.getByTestId('graph-canvas-card');
    const toggle = workspace.querySelector('.code-toggle')!;
    const hiddenDataRail = workspace.querySelector('.data-section');

    expect(canvas.classList.contains('graph-section')).toBe(true);
    expect(toggle.textContent).toContain('查看代码');
    expect(hiddenDataRail).toBeNull();
  });
});
