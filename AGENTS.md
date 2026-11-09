# expert-ops（DSH 插件）

先说结论：这个目录是一个**跑在本机 DSH 里的插件**，不是普通网页项目。

- 先读 `HANDOFF.md`（交接文档：现状、架构、M3 待办、坑与验证配方）。
- 设计/字段/算法以 `design.md` 为准；`prototype.html` 是静态原型，仅作视觉参考。
- 插件本体在 `plugin/`，已用 `file:` 依赖装进 `…/dsh-dev/home/profiles/web`。

## 常用命令

```sh
# 语法自检（改完 client.js 必做）
node --check plugin/lib/client.js

# 重启 5100 实例并取访问 URL
cd ../dsh-dev && kill $(lsof -tiTCP:5100 -sTCP:LISTEN) 2>/dev/null; \
  nohup ./start.sh > /tmp/dsh-dev.log 2>&1 & sleep 6; \
  grep -o 'http://127.0.0.1:5100/?token=[A-Za-z0-9_-]*' /tmp/dsh-dev.log | tail -1
```

## 硬约束

- 入口用 `sidebar.panellist` 行 + `main`（keyed，key 与行 id 一致）；**不要**改回 `shell.overlay` 弹层。
- `~/.dsh` 之外的文件写入可能需要沙箱提权；不要改 `app.asar`。
- client 里不能出现任何密钥；LLM 一律走宿主 `ctx.llm`。
