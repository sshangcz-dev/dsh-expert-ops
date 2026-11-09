# dsh-expert-ops

专家运营 Agent —— 一个原生嵌进 [DeepSeek Harness](https://github.com/deepseek-ai) 的插件：
业务把甲方需求丢进来，AI 解析成需求卡与专家画像，再按硬门槛 + 维度评分把候选人分到
「推荐 / 待确认 / 排除」三列，运营在工作台里逐个人工确认并留痕。

当前状态：**M2.5**（原生接入 + mock UI 跑通），M3 起接真实数据。

## 目录

```
plugin/          插件本体（npm 包 dsh-expert-ops，host + client 两半）
design.md        交互 / 数据模型 / 匹配算法 / 里程碑
HANDOFF.md       交接文档：架构、运行时契约、M3 待办、坑与验证配方
AGENTS.md        给 AI 编码代理的项目约定
prototype.html   静态原型（?view=p1|p2|p3）
shots/           真实实例截图
```

## 安装到某个 DSH profile

```sh
PROFILE=/path/to/dsh/home/profiles/web
PNPM="/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/pnpm/bin/pnpm.cjs"

cd "$PROFILE"
node "$PNPM" add "file:$PWD/../../path/to/plugin"   # 或 clone 后的绝对路径
```

再把 `dsh-expert-ops` 加进该 profile `package.json` 的 `dsh.profile.bundles`，重启 `dsh web`。
入口在左侧栏顶部（Plugins / 专家运营 / Automation tasks 那一排）。

## 路线图

- [x] M1 静态原型
- [x] M2 插件骨架 + 原生主区接入 + mock 看板
- [ ] M3 需求解析 + JD 生成（`ctx.llm`）
- [ ] M4 匹配引擎 + 三态 + 留痕（SQLite）
- [ ] M5 原识只读 + 飞书 Base 接入
- [ ] M6 打包分发

详见 [HANDOFF.md](HANDOFF.md)。
