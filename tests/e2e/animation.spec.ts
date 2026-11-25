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
  await page.goto('/');
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
    return css.match(/\b(?:purple|violet|rebeccapurple)\b|#[89a-f][0-9a-f]{5}\b/gi) ?? [];
  });
  expect(violations).toEqual([]);
});
