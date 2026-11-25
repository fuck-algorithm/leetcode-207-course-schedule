import { expect, test } from '@playwright/test';

test('AC-023 animation states, playback, stable nodes, and reduced motion', async ({ page }) => {
  test.setTimeout(90000);
  const captures: string[] = [];
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.route('https://**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_')) captures.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => captures.push(`pageerror: ${error.message}`));

  const layout = await page.evaluate(() => {
    const canvas = document.querySelector('.graph-section')!.getBoundingClientRect();
    const workspace = document.querySelector('.main-content')!.getBoundingClientRect();
    const code = document.querySelector('.code-toggle')!.getBoundingClientRect();
    const svg = document.querySelector('.graph-svg')!.getBoundingClientRect();
    return {
      canvasViewportHeightRatio: canvas.height / window.innerHeight,
      canvasWorkspaceAreaShare: (canvas.width * canvas.height) / (workspace.width * workspace.height),
      svgHeightRatio: svg.height / window.innerHeight,
      canvasWidthShare: canvas.width / (canvas.width + code.width),
      visibleCodeRailWidth: code.width,
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight,
    };
  });
  expect(layout.canvasViewportHeightRatio).toBeGreaterThan(0.8);
  expect(layout.canvasWorkspaceAreaShare).toBeGreaterThan(0.75);
  expect(layout.svgHeightRatio).toBeGreaterThan(0.75);
  expect(layout.canvasWidthShare).toBeGreaterThan(0.72);
  expect(layout.visibleCodeRailWidth).toBeLessThan(160);
  expect(layout.pageScrolls).toBe(false);
  await page.screenshot({ path: 'test-results/canvas-first-1366.png' });

  const badge = page.locator('.operation-badge');
  const narration = page.locator('.step-narration');
  const nodes = page.locator('.node');
  const initialNodeIds = await nodes.evaluateAll((elements) => elements.map((node) => node.getAttribute('data-node-id')).sort());
  await nodes.evaluateAll((elements) => {
    (window as typeof window & { __courseNodeRefs?: Element[] }).__courseNodeRefs = elements;
  });

  await expect(badge).toHaveAttribute('data-operation', 'init');
  await expect(narration).toBeVisible();
  await expect(page.locator('.legend').first()).toBeVisible();
  await expect(page.locator('[data-container-kind="queue"] .queue-slot')).toHaveCount(4);
  await page.screenshot({ path: 'test-results/animation-step-init.png' });
  await page.getByRole('button', { name: '打开算法代码' }).click();
  await expect(page.getByRole('complementary', { name: '算法代码' })).toBeVisible();
  await expect(page.locator('.drawer-close')).toBeVisible();
  await page.locator('.drawer-close').click();
  await expect(page.getByRole('complementary', { name: '算法代码' })).toHaveCount(0);

  await page.getByRole('button', { name: /下一步/ }).click();
  await expect(badge).toHaveAttribute('data-operation', 'insert');
  await expect(narration).not.toContainText('建立 4 门课程');
  expect(await nodes.evaluateAll((elements) => elements.map((node) => node.getAttribute('data-node-id')).sort())).toEqual(initialNodeIds);
  await page.screenshot({ path: 'test-results/animation-step-prerequisite.png' });

  await page.getByLabel('播放速度').selectOption('1000');
  await page.getByRole('button', { name: /播放/ }).click();
  await expect(badge).toHaveAttribute('data-operation', 'dequeue', { timeout: 8000 });
  await expect(page.locator('[data-status="current"]')).toHaveCount(1);
  const sameNodeElements = await nodes.evaluateAll((elements) => {
    const refs = (window as typeof window & { __courseNodeRefs?: Element[] }).__courseNodeRefs;
    return refs?.every((node, index) => node === elements[index]);
  });
  expect(sameNodeElements).toBe(true);
  await page.screenshot({ path: 'test-results/animation-playback-1x.png' });
  await page.getByRole('button', { name: /暂停/ }).click();

  await page.getByRole('button', { name: /重置/ }).click();
  await page.getByLabel('播放速度').selectOption('333');
  await page.getByRole('button', { name: /播放/ }).click();
  await expect(badge).toHaveAttribute('data-operation', 'dequeue', { timeout: 8000 });
  await page.screenshot({ path: 'test-results/animation-playback-3x.png' });
  await page.getByRole('button', { name: /暂停/ }).click();

  for (let index = 0; index < 10; index += 1) {
    const targetStep = Math.floor(Math.random() * 23);
    const progress = page.locator('.progress-bar').last();
    const box = await progress.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * (targetStep / 22), box.y + box.height / 2);
      await expect(badge).toHaveAttribute('data-operation', /.+/);
    }
    expect(await nodes.evaluateAll((elements) => elements.map((node) => node.getAttribute('data-node-id')).sort())).toEqual(initialNodeIds);
  }

  await page.getByLabel('播放速度').selectOption('333');
  await page.reload();
  await expect(page.getByLabel('播放速度')).toHaveValue('333');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: /重置/ }).click();
  await page.getByRole('button', { name: /下一步/ }).click();
  await expect(badge).toHaveAttribute('data-operation', 'insert');
  await expect(narration).toBeVisible();
  await expect(page.locator('.node-circle').first()).toHaveCSS('transition-duration', '1e-05s');
  await page.screenshot({ path: 'test-results/animation-reduced-motion.png' });
  expect(captures).toEqual([]);
});

test('E2E-015 forbids purple theme colors', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.screenshot({ path: 'test-results/canvas-first-1920.png' });
  const violations = await page.evaluate(async () => {
    const stylesheets = Array.from(document.styleSheets);
    const rules = stylesheets.flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText);
      } catch {
        return [];
      }
    });
    const css = rules.join(' ');
    const namedColors = css.match(/\b(?:purple|violet|rebeccapurple)\b/gi) ?? [];
    const hexColors = css.match(/#[0-9a-f]{3,8}\b/gi) ?? [];
    const purpleHex = hexColors.filter((value) => {
      const color = value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value;
      const channels = color.slice(1, 7).match(/.{2}/g)!.map((channel) => parseInt(channel, 16) / 255);
      const [r, g, b] = channels;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const hue = delta === 0 ? 0 : max === r ? ((g - b) / delta) % 6 * 60 : max === g ? ((b - r) / delta + 2) * 60 : ((r - g) / delta + 4) * 60;
      return delta > 0.08 && hue >= 265 && hue <= 315;
    });
    return [...namedColors, ...purpleHex];
  });
  expect(violations).toEqual([]);
});
