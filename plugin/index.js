/**
 * dsh-expert-ops，node 半边（占位）。
 *
 * 当前是 mock 阶段：所有数据与交互都在浏览器半边（lib/client.js）里，host 侧
 * 只需要一条 loader row 存在，client-modules 才会把 client.js 注入窗口。
 * M3 会在这里补：ctx.llm 解析需求、node:sqlite 落库、原识/飞书适配器与工具注册。
 */

export function apply() {}