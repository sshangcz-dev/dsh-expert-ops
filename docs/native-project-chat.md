# 项目原生聊天接入（2026-11-09）

## 本期实现

专家运营右侧直接复用已安装 DSH 的 conversation.content 工厂（embedded），固定展示 chat 视图，包含原生输入、模型选择、附件入口、消息流、工具执行和审批界面。没有另建模型接口，没有在 client 中放密钥。只有项目页面切换原生聊天；知识库问答暂保持原演示实现，专家库保持档案面板。

一个业务 project_id 绑定一个 dsh_session_id。新建项目先保存项目 ID，再打开并创建 DSH 会话；已有项目首次进入时建立绑定。进入同项目的不同业务页面共用会话，切换项目通过显式 SessionProvider 切换历史和输入上下文。项目重命名、结束、软删除不会改变会话 ID，也不会删除宿主历史。会话创建时命名为「专家运营 · 项目名」；以后项目改名不自动改宿主标题，身份仍以 ID 为准。

空会话和已有消息均使用 active 布局。输入框在面板底部；原生 sticky composer 负责滚动定位，局部 margin-top:auto 修复空会话输入框上浮。只使用本插件命名空间和宿主 data 属性，不依赖构建哈希 CSS 类。

## 已查证的宿主接口

来自本机 app.asar 中官方 @deepseek-ai 包，未改动应用包：

- dsh-api-session-controller：sessions.create({sessionId}) 返回实际 session ID；sessions.refresh() 刷新目录；manager.getListSnapshot().state 用于识别 refresh 不抛错的失败结果。
- sessions.retain(id,{source}) 返回 reference；await reference.ready 得到 binding；退出组件 release()。DSH 管理真实历史与执行任务，切换页面不取消正在运行的任务。
- binding.session.rename(title) 命名宿主会话。
- dsh-client-ui-session / dsh-client-ui-renderer：声明 session scope 子 slot 后获得 SessionProvider，使用 session={reference} 显式绑定。
- dsh-client-ui-conversation / dsh-client-ui-subagent：原生侧栏聊天同样复用 conversation.content 工厂与固定 chat 视图。

这是针对当前安装版本核对的插件契约。宿主升级后需重跑页面与发送验收，尤其 manager.getListSnapshot 属于当前实现对象接口。

## 持久化与数据库迁移边界

当前暂不增加业务数据库：

- localStorage 的 dsh-expert-ops:project-meta:v1 保存项目元数据（包括自建项目）。
- localStorage 的 dsh-expert-ops:project-sessions:v1 保存 project_id → {sessionId,ready}。
- DSH 自身负责持久化对话与历史；业务材料、候选人仍沿用现有演示存储。
- 绑定受浏览器和 origin 约束，换端口、换浏览器或清空站点数据不能自动恢复项目映射。迁移数据库前须导出这两个 key，不能仅凭名称猜测绑定。

建议下一步数据库提供项目创建/读取与会话绑定仓储，以 project_id 唯一约束确保每项目一条会话绑定，并保持现有 dsh_session_id，不新建替代历史。Session 创建保留重试状态；业务事务与宿主创建之间采用可恢复流程。

本期隔离的是会话消息、草稿和运行上下文；所有会话沿用 DSH 默认工作目录与宿主权限，不构成文件系统或共享记忆的安全隔离。未自动把左侧示例画像/候选人提交给模型，也未注册业务数据库工具；聊天真实可用不表示需求解析和匹配业务后端已完成。

## 异常和长期运行处理

1. 创建前持久化预留 UUID；创建响应丢失后先查宿主目录，恢复相同 ID，避免重复创建。
2. 同项目请求在内存合并；支持 Web Locks 时用全局绑定锁串行化跨标签页的绑定读写。
3. 已建立绑定不因打开失败就创建替代会话；显示失败和重试。
4. 存储失败/损坏、会话目录读取失败时停止创建，保留错误提示。
5. 切换/卸载后释放精确 reference；异步返回检查组件是否已卸载，避免 A 的结果写入 B；命名失败也释放引用。
6. 删除业务项目不删除宿主对话，后续数据库接入再定义归档策略。

## 校验

运行 `node --check plugin/lib/client.js` 和 `node tests/native-chat.cjs plugin/lib/client.js`。
测试覆盖并发防重复、项目隔离、重命名 ID 稳定、刷新复用、创建响应丢失恢复、引用释放、目录失败、存储损坏/配额不足以及自建项目恢复。

浏览器验收使用明确命名的「会话隔离验证 A/B」测试项目，仅发送无业务资料的测试文字。实际验证结果以本次交付说明为准。
