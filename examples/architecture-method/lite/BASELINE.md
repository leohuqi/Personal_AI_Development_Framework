# SYN-LITE-B1：练习既有基线

**SYNTHETIC / DOCUMENTATION ONLY。** 假设既有Owner批准的系统/UI行为，不是真实审批。此例不用PR或伪造签名。系统是现有Web客户端调用只读记录API；API负责权限，前端不产生数据写入。

记录列表已有list/card两种表现。URL包含query/filter/sort/page；详情依record_id打开。服务端返回本次查询可见对象；前端已有loading/empty/error/forbidden状态；旧请求迟到不得覆盖新query。布局切换不改变可见集合、分页语义、操作权限或数据接口。临时选择存在页面状态，离页即结束；不存在用户偏好写入或跨设备同步。

这是案例内唯一基线规则；DESIGN只维护增量。若真实项目不能证实有效批准基线，必须停止复用并由Master核对；不能把本文件当真实system_baseline_ref。
