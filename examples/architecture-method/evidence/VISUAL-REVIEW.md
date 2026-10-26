# 实际看图记录

Master `/root` 使用view_image实际查看全部8张1280×720 PNG；修正Standard组件图所属容器后，再查看Standard/Full两张组件图。其余6图HTML/SVG与初次实看源相同；最终8图全部重新浏览器渲染，准确哈希见[render-results](render-results.json)。本记录是Master交付充分性核对，不是Independent Reviewer批准或Owner验收。

| 图 | 实看结论 |
| --- | --- |
| Standard Container | Web/API/存储三个边界，文字和方向清楚 |
| Standard Component | 原图误标C-API，已改从模型读取S-API并重新实看；组件为同一应用内部，未增加服务 |
| Full Context | 用户/系统/身份提供方三个层级清楚 |
| Full Container | API拥有元数据/原件边界，解析通过API，无DB直写箭头 |
| Full Deployment | 主机/应用实例区分清楚，与Container ID一致 |
| Full Component | C-API内职责和恢复端口清楚；与Standard不同的所属容器标记正确 |
| Full Data | 概念实体、基数及所有者可读；不冒充物理Schema |
| Full Runtime | 主要消息顺序与成功/拒绝分支可辨；固定输入与发布校验详见模块契约 |

未见本批PNG中的文字截断、文本重叠或被节点遮挡的标签。正常桌面、390px窄屏局部滚动、实际PingFang SC字体、SVG浏览器加载和零外部请求由真实脚本另行记录。自动几何检查不证明全部连线/标签组合或所有环境的显示质量，本批实看不能推广为浏览器/无障碍/多语言全面测试。
