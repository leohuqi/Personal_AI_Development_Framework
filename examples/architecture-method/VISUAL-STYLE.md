# PADF 示例项目 Visual Style Profile

Owner本次对话已明确选择PADF默认风格，复用此选择；只在本样例生效，不改全局Skill或用户Profile。采用固定Diagram-Design默认light语义色：paper #f5f5f5、paper-2 #ececec、ink #2d3142、muted #4f5d75、soft #5a6580、accent #bf4520、link #2e5aa8；最多两个焦点。此配置仅属于合成示例。

Font source=system，完全离线。名称族Geist / PingFang SC / Noto Sans SC / Microsoft YaHei / system-ui / sans-serif；标题Instrument Serif / Songti SC / serif；技术ID用Geist Mono / Menlo / ui-monospace。未安装Geist/Instrument时如实记录系统回退，不假称品牌字体已加载。中文名称20px，辅助/关系至少14px；doc-wide=1280×720、40px外边距、底部图例，超预算拆图不缩小字号。

静态HTML内嵌SVG，无远程字体/图片/JS。直交圆角连线、标签有遮罩且离线8px，先线后节点，不允许穿越非端点。节点类型/边方向用文字表达，色彩只辅助；每图有独立title/desc和局部横向滚动、打印释放。SVG导出由锁定Skill helper，PNG真实Chrome截图（1×用于紧凑预览）；源模型与布局分离并可重现。
