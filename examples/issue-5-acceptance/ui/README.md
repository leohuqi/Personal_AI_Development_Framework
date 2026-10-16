# 随手账 · 可操作设计预览

双击 `prototype.html`，直接在浏览器打开。无需安装或服务。

- 「记一笔」：输入金额、商户与分类；改变商户不会替换你手动选择的分类。位置可跳过。
- 「导入账单」：使用虚构微信/支付宝样本，或从本目录选择专用样本文件。复核样本展示冲突、退款和待入账；每一笔都需明确处理。
- 「演示与测试设置」：选择模拟位置结果或下次保存失败结果，切换空账本/重置。真实账单格式不受支持，请勿上传真实账单。不会调用真实定位。
- 记录仅在页面内存，刷新重置。此预览不代表已实现原生应用或真实持久化。

Profile: `UI-PROFILE.md@d7e9c679a0a435310ef76d63432917d7e1656078`，PROPOSED，待 Owner 批准。原型/设计说明/manifest 都固定此版本。

验证：使用已安装的 Chrome 和环境提供的 Node/Playwright，运行 `verify-interactions.cjs` 和 `verify-adversarial.cjs`。脚本路径/运行时可通过 PLAYWRIGHT_MODULE_DIR、CHROME_PATH 覆盖，不需下载依赖。报告与截图均在本目录。验证仅针对 HTML 设计原型。

阅读顺序：UI-PROFILE.md → UI-DESIGN.md → prototype.html → JSON 测试报告 → HANDOFF.md。Owner 独立评分和新会话 DESIGN Review 尚待完成。

Screenshot publication boundary: PNG files are actual local rendered/inspected evidence in `/Users/leohu/Documents/Codex/2026-10-16/referenced-chatgpt-conversation-this-is-an/outputs/issue-5/ui/`. Binary upload was stopped while outcome was unknown; no PNG GitHub publication is claimed. Source/test code can regenerate them; SHA-256s are in manifest. Only textual sources/reports/manifest are in this source commit.

本次返工：I5-UI-002，修正独立评审 F01–F03（完整原始来源比较、最终重复关联目标检查、严格日期校验）。原先绿灯测试没有覆盖这些反例。新增 `verify-rework.cjs` 与 `rework-test-report.json`，18 组修正回归实际通过，包含22个日期边界；原14+6组也已重新执行通过。原评审 REQUEST CHANGES 保留，等待独立复评。

第二次返工 I5-UI-003：编号统一 NFC/外部空白处理；退款的重复处理与原支出关联分为两个选择。每笔新退款必须明确关联或保留待关联，重复关联不新增退款。同批原支出与退款总额在确认前整体复核。新增 `verify-rework-r2.cjs` 的21组检查通过；原38组重新通过，共59组。原独立评审仍保留，等待本轮独立复评。
