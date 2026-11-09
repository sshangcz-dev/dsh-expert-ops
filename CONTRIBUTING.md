# 参与开发

## 分支

- `main` 保持可运行，不直接推。
- 功能分支：`feat/<短描述>`，修复：`fix/<短描述>`。
- 提 PR 前先 `git pull --rebase origin main`。

## PR 检查清单

- [ ] `node --check plugin/lib/client.js` 通过（CI 也会跑）
- [ ] 若改了插件的注册/slot，附一张真实实例截图
- [ ] 涉及数据模型/算法的改动，同步更新 `design.md`
- [ ] 不提交任何密钥、token、`.env`、`node_modules`

## 本地跑起来

见 [HANDOFF.md](HANDOFF.md) §1 与 §6（实例路径、重启命令、`dsh web` token 取法）。

## 提交信息

`<type>: <一句话>`，type 用 `feat` / `fix` / `docs` / `refactor` / `chore`。
