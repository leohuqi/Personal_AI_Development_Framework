# 重现与能力要求

工具只构建/验证本例文档与派生图，不运行产品。Python 3标准库用于生成和静态检查；Node.js、已获环境批准的Playwright与兼容Chrome用于真实渲染。不会自动下载依赖或修改用户浏览器资料。

从仓库根依次执行：

```sh
python3 examples/architecture-method/tools/build.py
python3 examples/architecture-method/tools/export-check.py --skill-dir <verified-diagram-design-checkout>
python3 examples/architecture-method/tools/check.py
PLAYWRIGHT_MODULE=<existing-playwright-module> CHROME_EXECUTABLE=<approved-browser-executable> node examples/architecture-method/tools/render.cjs
```

传入独立环境路径，不把作者用户目录绑定到脚本。export-check先核对锁定主Skill内容hash，再调用读过的self_check/export_svg helper；上游MIT许可适用于依赖，不在此复制其整个实现。主Skill与相关refs消费记录见[来源](../../../standards/architecture/sources.md)。

build.py从model.json取节点/关系/消息顺序，从layout.json取坐标，产HTML与manifest。SVG须由锁定Skill导出，PNG须由真实浏览器截图；不要跳过浏览器而填PASS。render.cjs阻断非本地请求，记录字体/边界/遮挡/窄屏局部滚动、模型方向/分支/顺序，验证独立SVG文字并导出1280×720 PNG。实看和内容语义仍由执行者另记录，不能由脚本自动宣称完成。

本次真实浏览器启动和审批故障见[RESULTS](../evidence/RESULTS.md)。本例不借用其他项目的渲染结果，也不把源码静态检查等同浏览器或视觉验收。
