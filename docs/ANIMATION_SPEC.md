# LeetCode 207 动画规格

## 目标与边界

用 Kahn BFS 展示课程依赖如何逐步解除，让学习者从稳定的课程节点、有向依赖边、入度与 FIFO 队列理解课程可学或存在环。本规格描述当前既有 React + TypeScript + D3 应用的动画改造，不代表整站其它 Skill 要求已完成。

## 可观察状态与布局

- 主结构：课程依赖图；节点 ID `course-{id}`，依赖边以 `(from,to)` 稳定配对。
- 辅助结构：FIFO 队列；课程 ID 是条目身份，入度徽章绑定课程节点。
- 标量：`learnCount`、`numCourses`、队列长度、每门课程剩余入度。
- 代码锚点：初始化、建立先修边、扫描入度、入队、出队、解除限制、完成课程、返回结果，分别记录于每步 `anchorIds`。
- D3 力导向只在输入图数据变化时重算；单步播放不重算坐标。用户缩放和平移由 SVG zoom transform 维护。

```text
┌──────────── 课程依赖图（主画布） ─────────────┐
│ 固定图例/指标              操作徽标与步骤说明  │
│                                               │
│     课程节点 ──先修关系──▶ 课程节点            │
│         ↑ 入度徽章                            │
│                                               │
│  FIFO 固定槽位：队首 → ... → 队尾               │
└───────────────────────────────────────────────┘
```

## 步骤语义与焦点

| 操作 | 焦点 | 解说意图 | 代码锚点 |
| --- | --- | --- | --- |
| `init` | 课程图/入度初值 | 建立状态并说明入度含义 | `initialize` |
| `insert` | 先修关系 | 登记方向边并增加目标入度 | `add-prerequisite` |
| `read` | 入度扫描 | 解释零入度的可学习含义 | `find-zero-indegree` |
| `enqueue` | 入度归零课程 | 进入 FIFO 队列等待 | `enqueue-course` |
| `dequeue` | 单个当前课程 | 从队首取出并释放后续依赖 | `dequeue-course` |
| `compare` | 活跃边与目标入度 | 移除一项先修限制 | `release-prerequisite` |
| `visit` | 已处理课程/计数 | 计入完成数并保留历史 | `complete-course` |
| `done` | 结果/残余依赖 | 判断拓扑序完整或存在环 | `return-result` |

每步快照包含 `operation`、非空 `narration`、`anchorIds` 和图/队列/入度状态。节点状态为 `unvisited/in-queue/current/completed`；同帧最多一个 `current`，以放大、粗描边和状态文字共同提示。课程完成后节点与已解除的边保持可见。

## 运动与无障碍

- 节点、边使用 keyed join；算法切步只更新状态，不重建 SVG。图输入变化时重新建模拟并重新布局。
- `src/algorithm/motion.ts` 提供统一运动 token 与倍速/降级时长函数；当前节点焦点缩放使用 token。
- `prefers-reduced-motion: reduce` 时 CSS transition/animation 关闭，节点 JS transition 为零；徽标、解说、状态、图例仍更新。
- 队列固定容量槽位（至少 4），显示占用 `n/capacity`、队首/队尾和空槽；节点 key 由课程 ID 决定。
- 当前实现没有算法运行中退场的 SVG 节点/边；将来增加 exit 需通过可靠的 fade-out/remove 策略清理。

## 验证与证据

- Vitest：步骤契约、状态焦点、运动时长及 Kahn 算法属性。
- Playwright：2 项通过（AC-023 动画场景、E2E-015 CSS 主题色审计）。AC-023 验证操作徽标、解说、固定图例、队列槽位、稳定节点 ID/DOM、1x 与 3x 播放、唯一 current、十次随机跳步、速度记忆、reduced-motion 信息完整与无应用错误。
- E2E 产物在 `test-results/`：初始化/先修步骤/1x/3x/reduced-motion 截图和浏览器录屏。
- 当前未覆盖 15 条通用 E2E、1x/3x 全程视觉节奏评分、解法切换（本题无多解法 UI）及完整 AC-001～023；不得据此宣称整站验收 PASS。
