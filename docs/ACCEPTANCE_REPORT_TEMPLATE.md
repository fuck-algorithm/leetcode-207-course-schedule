# Canvas-first 视觉改版验收

## Round 2 — 2026-11-25

**结论：FAIL（画布空间与 AC-023 动画专项通过；全站 Skill 验收项仍有缺口）**

### 本轮完成

- 工作区改为画布单主视图，默认只显示代码入口；点击后打开浮层代码抽屉，不再常驻双列/三列挤压主图。
- 页面改为深石墨实验台视觉：细网格底、石板节点、雾化依赖边、薄荷当前焦点和琥珀活跃边；队列/图例/指标压缩为低干扰浮层。
- 1366×768 浏览器断言：画布高 >80% viewport、面积 >75% 工作区、代码入口宽 <160px、无纵向页面滚动。
- 代码示例的 D3 连线标签在平行边处交错偏移，减少重叠。
- 桌面与手机截图实测；Playwright 还覆盖打开/关闭代码抽屉。

### 验证结果

- `npm run test:coverage`：通过，8 个测试文件 / 35 项测试；lines 86.21%、functions 100%、branches 93.84%。
- `npm run lint`：通过。
- `npm run build`：通过（TypeScript + Vite）。
- `npm run test:e2e`：通过，2 项（动画/画布场景、E2E-015 配色检查）；再次重跑通过。
- `git diff --check`：通过。
- 截图：`test-results/canvas-first-1366.png`、`canvas-first-1920.png`、`animation-step-init.png`、`animation-step-prerequisite.png`、`animation-playback-1x.png`、`animation-playback-3x.png`、`animation-reduced-motion.png`；Playwright video 位于 `test-results/` 的测试目录。

### 剩余缺口

- E2E 矩阵覆盖 2 项，仍缺其余项目；`qa:guard` / `qa:full` 未配置。
- 完整 AC-001～024、双语界面、GitHub metadata、完整 README/Pages 规范、全站 Rubric 及所有 Blocking 项未验收，不能宣称整站 PASS。
- 覆盖率汇总达标；但 hooks 范围的 lines 为 53.9%（低于 60），需后续补 hook 单测。

### B1-B7

- B1：FAIL，全站 Blocking 要求尚未全部满足。
- B2：PASS（lint/build/coverage/E2E 命令均通过）。
- B3：FAIL，仅 2 项 Playwright 场景。
- B4：FAIL，AC-001～024 未逐项验收。
- B5：FAIL/未确认，尚未完成全站缺陷审查。
- B6：FAIL，未完成全站 Rubric 评分。
- B7：FAIL，本轮画布截图/录屏已留存，但全站证据集缺失。
