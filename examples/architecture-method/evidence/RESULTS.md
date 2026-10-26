# SA 样例验证记录

执行：VNEXT-SA-01，真实Solution Architect子任务 `/root/vnext_solution_architect`；授权范围为框架文档和合成样例。状态在后续重跑时按准确输入更新，本文件不充当独立Reviewer或Owner结论。

## 已实际执行

- 核对固定Diagram-Design根Skill SHA256=`1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618`，消费主指令、相关类型/呈现/导出refs；Owner本对话选择默认风格，项目内离线中文系统字体。
- `tools/build.py`实际生成8张HTML：Standard的Container/必要Component，Full的Context/Container/Deployment/Component/Sequence/概念ER。数量是本例选择，不是Profile验收配额。
- 锁定Skill `self_check.py --offline`与`export_svg.py --system-fonts`分别对8图执行，全部exit 0；完整结果[export-check.json](export-check.json)。证明静态安全/可访问结构和SVG导出，不证明实际浏览器呈现或图语义正确。
- `tools/check.py`核对模型ID/关系方向/消息顺序、端点、预算、权威来源与本地文档链接；结果[source-check.json](source-check.json)。仅静态检查。

## 实际浏览器、PNG和实看：PASS（恢复后补证）

初次普通Chrome启动受限；随后自动审批服务HTTP403，命令未执行。保留该历史失败，不将其改写成早期通过。服务恢复后，Master通过同一正常审批机制运行`tools/render.cjs`，没有绕过审批、接管用户现有浏览器或安装依赖。

最终运行：2026-10-26T05:54:28.939Z；Chrome155.0.8059.85 / Playwright1.62.1；最新模型SHA256 `bde3dd16fd1a6e413e180ef39c83fe68a3a3c4a41789a7f522cdfae004a3187a`，8/8 PASS。真实记录[render-results.json](render-results.json)含每图HTML/SVG/PNG hash、节点/边/顺序/guard、字形边界/节点标签、实际PingFang SC字体、390px局部滚动、独立SVG加载及零远程请求。

Master实际查看了8图，并对校正后的两张组件图再次实看；[逐图结果](VISUAL-REVIEW.md)。实看识别Standard组件图把所属运行单元写成C-API，现模型显式container_id，Standard=S-API、Full=C-API；从模型生成并在HTML/SVG静态核验，两张图已重新导出、渲染、实看。没有因此改变节点、关系、模块或权限语义。12组源破坏测试另覆盖边界身份/标签，不以文件存在当验证。

## 已完成的有界语义推演与未测

正文/模型核对：C4 Container与Component分离；Deployment仅映射实例；记录/源修订/派生代次分离；Parser没有DB直写路径；Runtime M07仅在valid guard发布，M08为任一校验失败拒绝，不把撤权/换源/旧epoch当成功。Records保存提交后响应丢失和跨资源恢复，Parsing保存完整manifest/当前权限校验。此为作者静态内容核对，不是独立Review，不能替代实际图观察。

Lite无新图理由为scope none与有效练习基线，无新接口/持久化；Standard补必要组件图，未按Full全套展开；Full只细化Records/Parsing。全部是文档合成，不是产品实现。产品API/数据库/文件故障、恢复、安全、性能、容量和真实产品验收均 **NOT RUN**。受控Reader前后对照及独立Review由Master另组织，SA未伪造输出，未声称Token/时间提升。
