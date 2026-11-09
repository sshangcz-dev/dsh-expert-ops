# Handoff · dsh-expert-ops（专家运营 Agent 插件）

写给接手开发的 agent（Codex）。读完这份就能在这个仓库里继续干，不需要原始对话。
最后更新：2026-11-09，状态：**M2.5 完成（原生接入 + mock UI 可跑），M3 未开始**。

---

## 0. 一句话现状

一个跑在 DSH（DeepSeek Harness）里的原生插件：左侧栏多一个「专家运营」入口，点它主区整页切换成
「需求解析 / 画像·JD / 匹配看板 + Agent 面板」工作台。UI 与交互已完成，**数据全是内存 mock**；
真正的需求解析、匹配引擎、数据源接入（M3–M5）还没写。

---

## 1. 路径与环境（务必用这些，别按 design.md 里旧路径走）

| 项 | 值 |
|---|---|
| 项目根 | `/Users/sean/Documents/deepseek-harness/default-workspace/expert-ops/` |
| 插件源码 | `…/expert-ops/plugin/`（就是 npm 包 `dsh-expert-ops` 本体） |
| 设计文档 | `…/expert-ops/design.md`（交互/数据模型/算法/里程碑，**权威**） |
| 静态原型 | `…/expert-ops/prototype.html`（三屏可点，可 `open` 直接看） |
| 截图 | `…/expert-ops/shots/`（native-board / native-drawer / live-*） |
| 运行实例 | `http://127.0.0.1:5100`（DSH web，dev 实例） |
| 实例的 DSH_HOME | `/Users/sean/Documents/deepseek-harness/default-workspace/dsh-dev/home` |
| 实例的 profile | `web` → `…/dsh-dev/home/profiles/web` |
| 启动脚本 | `…/dsh-dev/start.sh`（`dsh web --no-open --port 5100`） |
| 日志（含访问 URL） | `…/dsh-dev/web.log`（或启动重定向的文件） |
| DSH 可执行 | `/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh` |
| pnpm | `/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/pnpm/bin/pnpm.cjs` |

> design.md §1 写的「目标实例 `~/.dsh/profiles/web`」已过时：现在跑的是 `dsh-dev/home/profiles/web`。
> 启动后 `dsh web:` 那行带一次性 token 的 URL 在日志里，**token 每次重启都变**，不要硬编码。

---

## 2. 已经做完的事（不要重做）

1. **插件骨架**：host `index.js`（空 `apply()`）+ client `lib/client.js`（React，约 460 行）+ `cordis.patch.yml` + `package.json`。
2. **装进 dev profile**：以 `file:` 依赖装进 `dsh-dev/home/profiles/web/node_modules`，并在该 profile 的
   `package.json` → `dsh.profile.bundles` 里登记了 `dsh-expert-ops`（共 3 项）。
3. **原生接入（关键，已踩通）**：不再用 `shell.overlay` 弹层。改为
   - `sidebar.panellist` 注册入口行（`id: "expert-ops"`，`label: () => "专家运营"`）
   - `main` 这个 **keyed slot** 注册整页（`key: "expert-ops"`）
   - 点侧栏行 → 宿主把 `panelInfo.activePanelId` 设为 `expert-ops` → 主区渲染我们的页面；
     点 Plugins / 打开会话 → 宿主切走或置 null，页面自动消失。
4. **UI 完成度**：需求列表切换、三页签、三列看板（9 张 mock 卡）、点卡开抽屉、抽屉里「推荐/待确认/排除」
   真的会把卡片挪列并弹 toast、右侧 Agent 面板（mock 对话 + 运行卡片 + 快捷指令）。
5. **验证过**：无头 Chrome + CDP 实测点击链路、切页、抽屉、移动、切回对话全部通过（见 §7）。

---

## 3. 插件是怎么进 runtime 的（改代码前必须理解）

DSH 的插件 = npm 包 + Cordis 插件。加载顺序：

```
profile/package.json 的 dsh.profile.bundles（顺序执行）
  → 每个包的 dsh.bundle.patch 指向的 cordis.patch.yml 依次叠加
  → profile 自己的 cordis.patch.yml
  → 命令行 --patch
  → 生成 Loader 插件树 → 实例化 host 半边（apply(ctx)）
```

- host 半边：`index.js` 的 `export function apply(ctx)`，能拿 `ctx.llm`、`ctx.tools`、`ctx.reflect` 等。
- client 半边：`package.json` 里 `dsh.client = { platform: "web", inject: [...] }`；宿主扫到后把
  `window.__DSH_BOOT__` 注入页面，client bundle 由 **合并端点** `/plugins/<id>/<file>?rev=…` 提供
  （单文件路径 `/plugins/dsh-expert-ops/client.js` 直连 404 是正常的，别被骗）。
- 浏览器侧契约（`lib/client.js` 第一行）：

```js
window.__ModuleLoader__.load({ id: "dsh-expert-ops", factory: (require) => {
  const React = require("react")           // React 由宿主提供，不要 bundle 自己的 React
  const inject = ["slots", "theme", "layout"]
  function apply(ctx) { /* ctx.effect(...) 注册，返回清理 */ }
  module.exports = { inject, apply }
  return module.exports
}})
```

- **改 host 配置 / 加新包 → 必须重启实例**；只改 client 代码 → 刷新页面即可（dev 无 HMR）。
- 布局契约（`@deepseek-ai/dsh-client-ui-layout`，从 app.asar 里读出来的，权威）：
  `root` 下挂 `sidebar`(single) / **`main`(keyed)** / `rightbar`(single) / `shell.bottom` / `shell.overlay`(list)。
  `ctx.layout.selectPanel(id | null)` 切主区；`ctx.layout.panelInfo` 可订阅当前 panelId。
  已确认**没有**「左栏导航项 + 主区整页」以外的独立 slot——`main` 就是官方给整页用的口子。
- 官方同款参考实现：`@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js` 末尾的注册段
  （`ctx.slots.inject("main", function*(){ yield ctx.slots.register({name:"main", key:"plugins", …}, Page) })`
  + `sidebar.panellist` 行）。照它写就不会错。

---

## 4. 代码地图（plugin/）

```
plugin/
├── package.json        # name dsh-expert-ops, type module, exports ".", "./client"
│                       # dsh.bundle.patch → ./cordis.patch.yml
│                       # dsh.client = { platform: "web", inject: ["@deepseek-ai/dsh-client-ui-theme"] }
├── cordis.patch.yml    # - insert: [{ id: ui-expert-ops, name: dsh-expert-ops }]
├── index.js            # host 半边，目前空 apply()；M3 全写这里（+ lib/host/*.js）
├── lib/client.js       # 全部 UI：CSS 字符串 + store + 组件 + apply()
└── README.md           # 安装/结构说明
```

`lib/client.js` 内部结构（按顺序）：

1. `CSS` 模板字符串（约 180 行，类名统一 `eo-` 前缀）
2. mock 数据：`DEMANDS`（4 条）、`EXPERTS`（9 位）、`CARD`（需求卡 10 行）
3. 极简 store：`state / set / useStore`（订阅式，无依赖）
4. `toast()`
5. `ExpertOpsGlyph`（侧栏 SVG 图标，接收 `{size, active}`）
6. `Workbench`（整页：左功能栏 + 右 header/tabs/body + Agent 面板 + Drawer + toast）
7. `ParseView` / `ProfileView` / `BoardView` / `AgentPanel` / `Drawer`
8. `apply(ctx)`：注入 `<style>`、注册 `sidebar.panellist`、注册 `main`

已知问题（按优先级）：

- **配色写死浅色**：`body[data-ds-dark-theme]` 下不会跟随主题。要换成宿主 token（`--dsh-*`）。
- **内层 200px 功能栏与外层侧栏同向**，视觉上"套娃"。要么保留，要么把需求列表挪到看板顶部。
- 页面一离开（切 panel / 开会话）就丢内存状态，回来是初始 mock。
- `main` 面板没有 `children` 子 slot；如果后续要放抽屉/弹窗到宿主层级，考虑 `shell.overlay` 只做 portal。

---

## 5. M3 要做什么（这是接手后的主线）

范围（用户已确认的 POC）：**AC1 需求解析 + AC2 画像/JD + AC8 匹配评分 + AC9 三态审核工作台**。
交互与字段以 `design.md` §3/§4/§5 为准，别自己发明 schema。

### 5.1 host 侧（`index.js` 或拆 `lib/host/`）

- `ctx.llm` 调宿主模型（不要另配 key）：需求解析 → 需求卡（每个字段带 `confidence`、`missing`、`evidence_quote`）。
- 文件解析：`pdf-parse`（PDF）+ `mammoth`（Word）。上传落 `profiles/web/expert-ops/uploads/`。
- 存储：`node:sqlite`（Node 24 自带），库文件放 `profiles/web/expert-ops/data.sqlite`。
- 表结构照 `design.md` §4：`demands / demand_cards / jd_profiles / experts / matches / review_logs / settings`。
- 注册 4 个工具（`ctx.tools` 或本仓库等价 API，先在宿主源码里确认签名）：
  `expert_parse_demand`、`expert_generate_jd`、`expert_match`、`expert_review`。
- 数据源适配器（先接口 + 手填兜底）：
  - `yuanshi`：只读 SQL，**表结构未知**，先写 `TODO` 与 `manual` 平替
  - `feishu`：走 `lark-cli base +record-list --app-token <t> --table-id <t> --format json`（本机已装 1.0.99 并授权）
  - `manual`：前端表单写入
- 密钥/凭据只留在 host，**不得进 client bundle**。

### 5.2 匹配引擎（`design.md` §5，照抄默认值）

硬门槛 5 项（任一不过 → 排除）：地域且不可远程 / 语言方言 / 必备证书 / 报价下限 > 预算上限 / 档期冲突。
维度权重：专业 35、经验 25、产能 15、报价 15、信誉 10。
三态：`hard_pass=false` → 排除；`score>=80 且 gaps 为空` → 推荐；`60–79 或中等缺口` → 待确认；`<60` → 排除。
**LLM 只负责把结构化评分翻译成人话 + 追问建议，不参与打分**（可解释、可复现）。

### 5.3 client 侧

- 把 mock 数据换成 IPC/HTTP 到 host（宿主已有 client↔host 通道，先在 `dsh-client-modules` 或现有插件里找
  `ctx.remote` / `remote.*` 的用法，plugin-manager 就是范例）。
- 上传入口、需求卡编辑、审核原因模板、批量操作、留痕时间线。
- 状态要能跨切换保留（存 host，不要只放内存）。

---

## 6. 工程约定（这个项目特有的坑）

- 改完 `lib/client.js` 先 `node --check lib/client.js`。之前就是少一个右括号导致
  `Failed to load plugins / import failed`，页面只显示一句错误。
- 装/换包用 profile 目录下执行 pnpm（路径见 §1），不要用全局 npm。
- 重启实例：
  ```sh
  cd /Users/sean/Documents/deepseek-harness/default-workspace/dsh-dev
  kill $(lsof -tiTCP:5100 -sTCP:LISTEN)
  nohup ./start.sh > /tmp/dsh-dev.log 2>&1 &
  sleep 6; grep -o 'http://127.0.0.1:5100/?token=[A-Za-z0-9_-]*' /tmp/dsh-dev.log | tail -1
  ```
- 不要改 `/Applications/DeepSeek Harness.app/Contents/Resources/app.asar`（只读，且更新会覆盖）。
  需要读宿主实现时用 asar 解析脚本（见 §7）。
- 沙箱：workspace 内可写；写 `~/.dsh`、`~/Library/Application Support` 等要 `danger-full-access`。
- 不要 `as any` 之类的 hack；本项目 TS 未启用，client 是纯 JS。

---

## 7. 验证配方（复制即用）

### 7.1 确认插件被加载

```sh
TOKEN=$(grep -o 'token=[A-Za-z0-9_-]*' /tmp/dsh-dev.log | tail -1 | cut -d= -f2)
curl -s "http://127.0.0.1:5100/?token=$TOKEN" | grep -c "dsh-expert-ops"   # ≥3
```

### 7.2 无头浏览器点一遍（ego 不可用时）

```sh
CHROME="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-mac-arm64/chrome-headless-shell"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1440,900 \
  --remote-debugging-port=9224 --user-data-dir=/tmp/eo-profile \
  "http://127.0.0.1:5100/?token=$TOKEN" &
# 然后用 Node 内置 WebSocket 连 http://127.0.0.1:9224/json/list 做 Runtime.evaluate：
#   点 [aria-label="专家运营"] → 断言 .eo-shell 出现、主区 x≈280 宽≈1160
#   点 Plugins → .eo-shell 消失；点回 → 再出现
#   点 .eo-expert → .eo-drawer 出现；点抽屉「待确认」→ 列计数 4/3/2 → 3/4/2
#   点会话行 → .eo-shell 消失（回到对话）
```

### 7.3 读宿主实现（需要时）

`/tmp/asar2.js` 是一次性 asar 读取器（`node /tmp/asar2.js grep '<regex>'` / `read <path>`）。
丢了就重写：读前 16 字节拿 header size（offset 12, uint32LE），JSON 解析 header，按 `offset+dataStart` 读。
重点文件：
`dsh/node_modules/@deepseek-ai/dsh-client-ui-layout/lib/client.js`（布局与 `ctx.layout`）、
`…/dsh-client-ui-plugin-manager/lib/client.js`（官方整页插件范例）、
`…/dsh-client-ui-sidebar/lib/client.js`（panellist 行渲染）。

---

## 8. 决策与理由（别推翻，除非有更好证据）

| 决策 | 理由 |
|---|---|
| 用 `main` keyed slot，不用 `shell.overlay` | 用户明确要"原生 DSH 页面、直接改 UI"；overlay 是模态弹层 |
| 入口用 `sidebar.panellist`，不用 `sidebar.footer.action` | panellist 才是 Plugins / Automation tasks 那一排原生导航 |
| UI 自研，不 fork `@alpacachen/dsh-kanban` | 它的数据模型是任务不是专家，且兼容矩阵只到 0.2.1-rc.3 |
| 匹配用规则 + 可选阈值，LLM 只润色 | 可解释、可复现、可审计（甲方场景） |
| 结果只落本地 SQLite，不写飞书 | POC 阶段避免污染甲方 Base；导出再推 |
| mock 先行 | 先把交互和页面打通，再换真数据，避免边写边改 |

---

## 9. 待确认（会阻塞 M3 的部分）

1. 原识专家库的数据库类型/地址/只读账号/表结构 —— 目前只有适配器接口。
2. 飞书候选人 Base 的 `app_token` / `table_id`（`lark-cli base +base-list` 可先列出来让用户挑）。
3. 三态阈值/权重是否按 design.md §5 默认值（目前 mock 用的是 80/60 + 35/25/15/15/10）。
4. 需求文档上传后是否要保留原文件与解析中间产物（影响存储与清理策略）。

---

## 10. Suggested skills（下一个 agent 可直接调用）

- `codebase-design`：拆 host 侧模块边界（解析 / 匹配 / 存储 / 适配器）时用。
- `tdd`：匹配引擎（纯函数）最适合先写测试：硬门槛 5 条 + 权重 + 三态边界（79/80、59/60）。
- `implement`：按 design.md 的 AC 清单逐条实现。
- `office-docx` / `pdf`：验证 Word/PDF 解析质量。
- `diagnosing-bugs`：宿主加载失败、slot 不渲染时按它的循环排（先看 console、再看 boot 清单）。
- `writing-for-agents`：如果要把本文件再拆成 AGENTS.md / 更细的交接文档。

---

## 11. 参考文件

- `…/expert-ops/design.md` —— 交互 / schema / 算法 / 里程碑（权威）
- `…/expert-ops/prototype.html` —— 静态原型（`?view=p1|p2|p3`、`?drawer=张*`）
- `…/expert-ops/plugin/README.md` —— 安装与结构
- `…/expert-ops/shots/native-board.png`、`native-drawer.png` —— 当前真实效果
- 需求来源：飞书文档《专家运营agent需求梳理》<https://xcnhc87xvcni.feishu.cn/docx/Wl3ldqrHNo3yBlxswePcL8PVnGb>
  （AC1–AC22、业务流程 6 步、时间线 11/23 POC）