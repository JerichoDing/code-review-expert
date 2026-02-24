---
name: code-review-expert
description: "Expert code review of current git changes with a senior engineer lens. Detects SOLID violations, security risks, and proposes actionable improvements."
---

# Code Review Expert

## Overview

Perform a structured review of the current git changes with focus on SOLID, architecture, removal candidates, and security risks. Default to review-only output unless the user asks to implement changes.

## 严重级别

| 级别 | 名称 | 描述 | 处理方式 |
|------|------|------|---------|
| **P0** | 严重 | 安全漏洞、数据丢失风险、逻辑错误 | 直接修改+通知用户 |
| **P1** | 高 | 逻辑错误、严重SOLID违规、性能衰退 | 直接修改+通知用户 |
| **P2** | 中 | 代码坏味道、可维护性问题、轻微SOLID违规 | 建议修改或创建后续任务 |
| **P3** | 低 | 样式、命名、小建议 | 可选改进 |

## Workflow

### 1) Preflight context

- Use `git status -sb`, `git diff --stat`, and `git diff` to scope changes.
- If needed, use `rg` or `grep` to find related modules, usages, and contracts.
- Identify entry points, ownership boundaries, and critical paths (auth, payments, data writes, network).

**Edge cases:**
- **No changes**: If `git diff` is empty, inform user and ask if they want to review staged changes or a specific commit range.
- **Large diff (>500 lines)**: Summarize by file first, then review in batches by module/feature area.
- **Mixed concerns**: Group findings by logical feature, not just file order.

### 2) SOLID + architecture smells

- Load `references/solid-checklist.md` for specific prompts.
- Look for:
  - **SRP**: Overloaded modules with unrelated responsibilities.
  - **OCP**: Frequent edits to add behavior instead of extension points.
  - **LSP**: Subclasses that break expectations or require type checks.
  - **ISP**: Wide interfaces with unused methods.
  - **DIP**: High-level logic tied to low-level implementations.
- When you propose a refactor, explain *why* it improves cohesion/coupling and outline a minimal, safe split.
- If refactor is non-trivial, propose an incremental plan instead of a large rewrite.

### 3) Removal candidates + iteration plan

- Load `references/removal-plan.md` for template.
- Identify code that is unused, redundant, or feature-flagged off.
- Distinguish **safe delete now** vs **defer with plan**.
- Provide a follow-up plan with concrete steps and checkpoints (tests/metrics).

### 4) Security and reliability scan

- Load `references/security-checklist.md` for coverage.
- Check for:
  - XSS, injection (SQL/NoSQL/command), SSRF, path traversal
  - AuthZ/AuthN gaps, missing tenancy checks
  - Secret leakage or API keys in logs/env/files
  - Rate limits, unbounded loops, CPU/memory hotspots
  - Unsafe deserialization, weak crypto, insecure defaults
  - **Race conditions**: concurrent access, check-then-act, TOCTOU, missing locks
- Call out both **exploitability** and **impact**.

### 5) Code quality scan

- Load `references/code-quality-checklist.md` for coverage.
- Check for:
  - **Error handling**: swallowed exceptions, overly broad catch, missing error handling, async errors
  - **Performance**: N+1 queries, CPU-intensive ops in hot paths, missing cache, unbounded memory
  - **Boundary conditions**: null/undefined handling, empty collections, numeric boundaries, off-by-one
- Flag issues that may cause silent failures or production incidents.

### 6) 输出格式

**重要**: P0 和 P1 级别的问题应直接在代码中修改，并在报告中告知用户"已自动修改"。

使用中文表格形式输出审查结果：

```markdown
## 代码审查报告

**审查信息**: X 个文件，Y 行变更
**整体评估**: [批准 / 需要修改 / 仅注释]

---

## 发现的问题

### P0 - 严重问题

| 文件:行号 | 问题标题 | 描述 | 状态 |
|----------|--------|------|------|
| file.ts:10 | XXX | 问题描述 | ✅ 已修改 |

### P1 - 高级问题

| 文件:行号 | 问题标题 | 描述 | 状态 |
|----------|--------|------|------|
| file.ts:20 | XXX | 问题描述 | ✅ 已修改 |

### P2 - 中级问题

| 文件:行号 | 问题标题 | 描述 | 建议 |
|----------|--------|------|------|
| file.ts:30 | XXX | 问题描述 | 建议修改方案 |

### P3 - 低级问题

| 文件:行号 | 问题标题 | 描述 | 建议 |
|----------|--------|------|------|
| file.ts:40 | XXX | 问题描述 | 建议改进 |

---

## 移除/迭代计划
（如适用）

## 补充建议
（可选改进，非阻塞项）
```

**清晰审查**: 如未发现问题，明确说明：
- 审查内容
- 未覆盖的区域（例如"未验证数据库迁移"）
- 剩余风险或建议的后续测试

### 7) 完成通知

发现问题后，向用户通知结果：

```markdown
---

## 审查完成

发现 X 个问题（P0: _, P1: _, P2: _, P3: _）

**修改状态**: P0 和 P1 级问题已自动修改 ✅

**其他问题**: 请根据建议进行评估和修改
```

**重要**: P0 和 P1 自动修改并通知，P2 和 P3 作为建议提供。

## Resources

### references/

| File | Purpose |
|------|---------|
| `solid-checklist.md` | SOLID smell prompts and refactor heuristics |
| `security-checklist.md` | Web/app security and runtime risk checklist |
| `code-quality-checklist.md` | Error handling, performance, boundary conditions |
| `removal-plan.md` | Template for deletion candidates and follow-up plan |
