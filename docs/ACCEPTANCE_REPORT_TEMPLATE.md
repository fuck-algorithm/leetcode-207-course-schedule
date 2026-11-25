# Canvas-first 视觉改版验收

## Round 3 — 2026-11-25

**结论：FAIL（全屏画布面积 80%～90% 已按视口面积测量并通过；完整 Skill 验收仍未完成）**

### 面积口径与实测

定义：`屏幕画布面积占比 = graph-canvas-card 的 DOM bounding-box 面积 / (window.innerWidth × window.innerHeight)`。不使用画布高度或工作区占比替代该口径。

- Playwright E2E-001 在 1366×768 与 1920×1080 分别直接计算上述面积，断言结果在 80%～90% 范围；本轮两个视口均通过。
- 画布占可用工作区面积 >80%，SVG 高度 >75% 视口；页面无纵向滚动。
- 代码只保留一个小型操作入口，按需打开代码抽屉；收起时画布成为单屏主内容。
- 截图：`test-results/canvas-area-1366.png`、`canvas-area-1920.png`、`canvas-first-1366.png`、`canvas-first-1920.png`。

### 本轮变更及验证

- 桌面下将课程图作为主舞台、代码改为浮层抽屉；手机视口也不再在首屏预留隐藏代码行。
- 收紧标题/输入/控制栏和外围 padding，画布节点及边铺开并调整标签避免重叠。
- `npm run test:coverage`：通过，35 项单测；lines 86.21%、functions 100%、branches 93.84%。
- `npm run lint`：通过。
- `npm run build`：通过（TypeScript + Vite）。
- `npm run test:e2e`：通过，3 项（AC-023 动画、E2E-001 两档面积占比、E2E-015 配色）；串行运行避免本机 Chromium 并发崩溃。
- `git diff --check`：通过。

### 剩余缺口

- 全 E2E 矩阵仅覆盖 3 项，`qa:guard` / `qa:full` 未配置。
- 未完整验收 AC-001～024、全站双语/元数据/README 等要求，也未完成 Rubric 全站评分；不宣称整体 Skill PASS。
- hooks 覆盖率 lines 53.9%，需后续补齐 hook 测试。

### B1-B7

- B1：FAIL，全站 Blocking 要求仍未全满足。
- B2：PASS（lint/build/coverage/E2E 均通过）。
- B3：FAIL，当前 3 项测试。
- B4：FAIL，AC-001～024 未逐项验收。
- B5：FAIL/未确认，未执行完整全站缺陷审查。
- B6：FAIL，未完成全站 Rubric 评分。
- B7：FAIL，画布面积截图和动画证据已留存，但完整验收证据集不足。
