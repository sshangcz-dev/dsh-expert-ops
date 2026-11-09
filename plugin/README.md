# dsh-expert-ops（mock v0.1）

专家运营工作台：**原生嵌在 DSH 主区**（不是弹层）——左栏 `sidebar.panellist` 注册入口行，
点它把主区（keyed `main` slot）切到本插件的整页视图，点会话/新会话自动切回对话。
页面内部是 Coze/Dify 式两栏：左侧功能栏 + 右侧「需求解析 / 画像·JD / 匹配看板」+ 常驻 Agent 面板。
当前是 **mock 数据**，交互全部可点；真实数据链路在 M3 接入。

## 装到某个 profile

```sh
PROFILE=~/.dsh/profiles/web          # 换成目标 profile 目录
PNPM="/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/pnpm/bin/pnpm.cjs"

cd "$PROFILE"
node "$PNPM" add "file:/Users/sean/Documents/deepseek-harness/default-workspace/expert-ops/plugin"
```

然后把 `dsh-expert-ops` 追加进该 profile `package.json` 的 `dsh.profile.bundles`：

```json
{ "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-expert-ops"] } } }
```

重启 `dsh web`（或对应实例）后生效；入口在左侧栏顶部（Plugins / 专家运营 / Automation tasks 那一排）。

## 结构

| 文件 | 作用 |
|---|---|
| `package.json` | 声明 `dsh.bundle.patch` 与 `dsh.client.platform=web` |
| `cordis.patch.yml` | 往 loader 插一行 `id: ui-expert-ops` |
| `index.js` | host 半边，目前空实现（M3 放 ctx.llm / SQLite / 数据源适配器） |
| `lib/client.js` | 浏览器半边：`sidebar.panellist` 放入口行（id=expert-ops），`main` slot 以 `key=expert-ops` 注册整页面板 |

## M3 待接

- 需求文档上传（Word/PDF）→ `ctx.llm` 解析需求卡，缺失字段反问
- 画像/JD 生成（内部版 / 对外版）
- `expert_match` 工具：硬门槛 + 维度评分（专业 35 / 经验 25 / 产能 15 / 报价 15 / 信誉 10）
- 数据源：原识只读适配器、飞书 Base（走 `lark-cli base +record-list`）、业务手填
- 结果落 `node:sqlite`（demands / demand_cards / jd_profiles / experts / matches / review_logs）
- 人工覆写强制原因模板 + 审计日志