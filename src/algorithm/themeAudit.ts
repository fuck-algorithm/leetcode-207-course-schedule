import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import Color from 'colorjs.io';

const FORBIDDEN_HUES = new Set(['purple', 'violet', 'rebeccapurple']);
const PURPLE_HUE_RANGE = [265, 315];

function isForbiddenColor(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (FORBIDDEN_HUES.has(normalized)) return true;

  try {
    const color = new Color(normalized).to('hsl');
    const [hue, saturation, lightness] = color.coords;
    return hue !== null && saturation !== null && lightness !== null
      && saturation > 8 && lightness > 8 && hue >= PURPLE_HUE_RANGE[0] && hue <= PURPLE_HUE_RANGE[1];
  } catch {
    return false;
  }
}

export function findForbiddenThemeColors(css: string): string[] {
  const root = postcss.parse(css);
  const violations = new Set<string>();

  root.walkDecls((declaration) => {
    const parsed = valueParser(declaration.value);
    parsed.walk((node) => {
      if (!['word', 'function', 'string'].includes(node.type) || !isForbiddenColor(valueParser.stringify(node))) return;
      violations.add(valueParser.stringify(node).toLowerCase());
    });
  });

  return [...violations].sort();
}
