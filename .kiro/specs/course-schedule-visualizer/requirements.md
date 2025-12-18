# Requirements Document

## Introduction

本项目是一个基于 TypeScript + React + D3.js 的算法可视化演示工具，用于展示 LeetCode 207 课程表问题的拓扑排序算法。该工具提供分步骤的算法演示、代码高亮、变量状态追踪等功能，帮助用户理解拓扑排序算法的执行过程。项目部署在 GitHub Pages 上，支持自动化 CI/CD。

## Glossary

- **Visualizer**: 算法可视化演示系统
- **Step**: 算法执行的单个分镜步骤
- **Code Highlighter**: 代码语法高亮和执行行高亮组件
- **Variable Inspector**: 变量内存值展示组件
- **Control Panel**: 包含播放、暂停、上一步、下一步等控制按钮的面板
- **Graph View**: D3.js 绘制的课程依赖关系图
- **Topological Sort**: 拓扑排序算法

## Requirements

### Requirement 1

**User Story:** As a learner, I want to see the algorithm visualization with proper page title and navigation, so that I can easily identify the problem and access the original LeetCode problem.

#### Acceptance Criteria

1. WHEN the page loads THEN the Visualizer SHALL display the title "207. 课程表" matching the LeetCode problem title
2. WHEN a user clicks the title THEN the Visualizer SHALL navigate to the LeetCode problem page (https://leetcode.cn/problems/course-schedule/)
3. WHEN the page loads THEN the Visualizer SHALL display a GitHub icon in the top-right corner
4. WHEN a user clicks the GitHub icon THEN the Visualizer SHALL navigate to the project repository page

### Requirement 2

**User Story:** As a learner, I want to see the Java code with syntax highlighting and debug-like features, so that I can follow the algorithm execution step by step.

#### Acceptance Criteria

1. WHEN the page loads THEN the Visualizer SHALL display the Java algorithm code with syntax highlighting
2. WHEN an algorithm step is active THEN the Code Highlighter SHALL highlight the currently executing line with a distinct background color
3. WHEN a variable value changes during execution THEN the Variable Inspector SHALL display the variable's current value inline after the corresponding code line
4. WHEN multiple variables exist on the same line THEN the Variable Inspector SHALL display all variable values separated by commas
5. WHEN the algorithm step changes THEN the Code Highlighter SHALL update the highlighted line to match the current execution point

### Requirement 3

**User Story:** As a learner, I want to control the algorithm visualization playback, so that I can learn at my own pace.

#### Acceptance Criteria

1. WHEN a user clicks the "Play" button THEN the Control Panel SHALL start automatic step-by-step playback
2. WHEN a user clicks the "Pause" button during playback THEN the Control Panel SHALL stop the automatic playback
3. WHEN a user clicks the "Previous Step" button THEN the Visualizer SHALL navigate to the previous algorithm step
4. WHEN a user clicks the "Next Step" button THEN the Visualizer SHALL navigate to the next algorithm step
5. WHEN the user is at the first step THEN the Control Panel SHALL disable the "Previous Step" button
6. WHEN the user is at the last step THEN the Control Panel SHALL disable the "Next Step" button and stop playback

### Requirement 4

**User Story:** As a learner, I want to use keyboard shortcuts to control playback, so that I can navigate the visualization more efficiently.

#### Acceptance Criteria

1. WHEN a user presses the Left Arrow key THEN the Visualizer SHALL navigate to the previous step
2. WHEN a user presses the Right Arrow key THEN the Visualizer SHALL navigate to the next step
3. WHEN a user presses the Space key THEN the Visualizer SHALL toggle between play and pause states
4. WHEN the user is at the first step and presses Left Arrow THEN the Visualizer SHALL remain at the first step without error
5. WHEN the user is at the last step and presses Right Arrow THEN the Visualizer SHALL remain at the last step without error

### Requirement 5

**User Story:** As a learner, I want to see a visual representation of the course dependency graph, so that I can understand the relationships between courses.

#### Acceptance Criteria

1. WHEN the page loads THEN the Graph View SHALL render all courses as nodes using D3.js
2. WHEN prerequisites exist THEN the Graph View SHALL render directed edges from prerequisite courses to dependent courses
3. WHEN a course is processed during the algorithm THEN the Graph View SHALL visually indicate the course node status (unvisited, in-queue, completed)
4. WHEN the algorithm processes an edge THEN the Graph View SHALL animate the edge to show the dependency being resolved
5. WHEN the algorithm completes THEN the Graph View SHALL display the final state showing all processed courses

### Requirement 6

**User Story:** As a learner, I want to see the algorithm data structures visualized, so that I can understand how the queue and in-degree array change during execution.

#### Acceptance Criteria

1. WHEN the algorithm initializes THEN the Visualizer SHALL display the in-degree array with all course indices and their initial values
2. WHEN a course is added to the queue THEN the Visualizer SHALL animate the course entering the queue visualization
3. WHEN a course is removed from the queue THEN the Visualizer SHALL animate the course leaving the queue visualization
4. WHEN an in-degree value decreases THEN the Visualizer SHALL highlight the changed value and update the display
5. WHEN the algorithm completes THEN the Visualizer SHALL display the final learnCount value and the result (true/false)

### Requirement 7

**User Story:** As a developer, I want the project to automatically deploy to GitHub Pages, so that changes are published without manual intervention.

#### Acceptance Criteria

1. WHEN code is pushed to the main branch THEN the GitHub Action SHALL trigger the build and deploy workflow
2. WHEN the build process runs THEN the GitHub Action SHALL compile TypeScript and bundle the React application
3. WHEN the build succeeds THEN the GitHub Action SHALL deploy the built artifacts to GitHub Pages
4. WHEN the build fails due to compilation or linting errors THEN the GitHub Action SHALL report the failure and prevent deployment

### Requirement 8

**User Story:** As a learner, I want the entire visualization to fit on a single screen, so that I can see all components without scrolling.

#### Acceptance Criteria

1. WHEN the page loads THEN the Visualizer SHALL render all components (code panel, graph view, data structures, control panel) within a single viewport
2. WHEN the browser window is resized THEN the Visualizer SHALL adjust component sizes to maintain single-screen layout
3. WHEN the content exceeds available space THEN the Visualizer SHALL use internal scrolling within individual panels rather than page-level scrolling
