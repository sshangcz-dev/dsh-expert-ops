window.__ModuleLoader__.load({ id: "dsh-expert-ops", factory: (require) => {
  var module = { exports: {} }
  var exports = module.exports

  /**
   * dsh-expert-ops，浏览器半边（mock v0.1）。
   *
   * 结构对应 design.md 的两栏形态：
   *   左栏 = 功能（需求 / 专家库 / 设置 + 需求列表）
   *   右侧 = 招募成果 / 匹配看板 + 常驻 Agent 面板
   *
   * 入口走官方 slot：sidebar.panellist 注册入口，keyed main 渲染工作台。
   * 数据全部在内存里（mock），M3 再接 host 侧 ctx.llm / SQLite / 原识 / 飞书。
   */

  const React = require("react")
  const { useState, useEffect, useRef } = React
  const n = React.createElement

  const inject = ["slots", "theme", "layout"]

  const CSS = `
.eo-glyph{display:block}
.eo-root{height:100%;min-height:0;display:flex;background:#f7f8fa;font:13px/1.55 -apple-system,"PingFang SC","Helvetica Neue",Arial,sans-serif;color:#15171c}
.eo-shell{flex:1;min-width:0;min-height:0;width:100%;background:#f7f8fa;overflow:hidden;display:grid;grid-template-columns:200px 1fr}
/* 左栏 */
.eo-left{background:#fbfbfc;border-right:1px solid #e6e8ec;display:flex;flex-direction:column;min-height:0}
.eo-brand{display:flex;align-items:center;gap:9px;padding:15px 15px 11px;font-weight:680}
.eo-brand .dot{width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,#2563eb,#7c3aed)}
.eo-brand small{margin-left:auto;font-size:10.5px;font-weight:500;color:#9ca3af}
.eo-nav{padding:2px 8px}
.eo-nav button{display:flex;align-items:center;gap:9px;width:100%;border:0;background:transparent;padding:8px 10px;border-radius:8px;color:#374151;font-size:13px;cursor:pointer}
.eo-nav button:hover{background:#f1f2f5}
.eo-nav button.on{background:#eceef2;font-weight:600}
.eo-nav .ico{width:16px;color:#9ca3af;font-size:12px;display:grid;place-items:center}
.eo-nav button.on .ico{color:#2563eb}
.eo-sec{display:flex;align-items:center;justify-content:space-between;padding:13px 15px 5px;font-size:10.5px;letter-spacing:.07em;color:#9ca3af;text-transform:uppercase}
.eo-demands{padding:0 8px;overflow:auto;flex:1;min-height:0}
.eo-demand{display:block;width:100%;text-align:left;border:1px solid transparent;background:transparent;padding:8px 10px;border-radius:9px;margin-bottom:2px;cursor:pointer}
.eo-demand:hover{background:#f1f2f5}
.eo-demand.on{background:#fff;border-color:#e6e8ec;box-shadow:0 1px 2px rgba(16,24,40,.05)}
.eo-demand b{display:block;padding-right:14px;font-size:12.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eo-demand{position:relative}
.eo-demand-chevron{position:absolute;right:9px;top:10px;color:#9ca3af;font-size:10px;transition:transform .15s}
.eo-demand[aria-expanded="true"] .eo-demand-chevron{transform:rotate(90deg)}
.eo-project-menu{margin:3px 0 9px 18px;padding-left:8px;border-left:1px solid #e1e5eb;display:grid;gap:2px}
.eo-project-menu button{display:flex;align-items:center;justify-content:space-between;gap:4px;width:100%;text-align:left;border:0;border-radius:6px;background:transparent;color:#6b7280;padding:7px 8px;font-size:11.5px;cursor:pointer}
.eo-project-menu button:hover{background:#f1f2f5}
.eo-project-menu button.on{background:#eaf1ff;color:#1d4ed8;font-weight:600}
.eo-project-menu button:focus-visible,.eo-demand:focus-visible{outline:2px solid #2563eb;outline-offset:1px}
.eo-demand span{display:flex;align-items:center;gap:6px;color:#6b7280;font-size:11.2px;margin-top:2px}
.eo-sdot{width:6px;height:6px;border-radius:50%;background:#059669}
.eo-sdot.draft{background:#9ca3af}.eo-sdot.warn{background:#f59e0b}
.eo-me{display:flex;align-items:center;gap:9px;padding:11px 15px;border-top:1px solid #e6e8ec;color:#6b7280;font-size:11.5px}
.eo-avatar{width:26px;height:26px;border-radius:50%;background:#dbeafe;color:#1d4ed8;display:grid;place-items:center;font-weight:700;font-size:11px}
/* 右栏 */
.eo-right{display:flex;flex-direction:column;min-width:0;min-height:0;background:#f7f8fa}
.eo-head{background:#fff;border-bottom:1px solid #e6e8ec;padding:6px 14px}
.eo-htop{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.eo-htop h1{font-size:14px;line-height:1.4;margin:0;font-weight:650;min-width:0;overflow-wrap:anywhere}
.eo-title-divider{color:#9ca3af;margin:0 8px;font-weight:400}
.eo-title-space{font-weight:500;color:#374151}
.eo-head .eo-btn{font-size:11.5px;padding:4px 9px;border-radius:6px}
.eo-head .eo-hactions{gap:6px;flex-shrink:0}
.eo-meta{display:flex;gap:12px;flex-wrap:wrap;color:#6b7280;font-size:11.8px;margin-top:3px}
.eo-tag{font-size:10.5px;padding:1px 7px;border-radius:5px;background:#f3f4f6;color:#4b5563}
.eo-tag.warn{background:#fffbeb;color:#b45309}
.eo-hactions{margin-left:auto;display:flex;gap:8px}
.eo-btn{border:1px solid #e6e8ec;background:#fff;padding:6px 11px;border-radius:8px;font-size:12.3px;cursor:pointer}
.eo-btn:hover{border-color:#c9cfd8}
.eo-btn.primary{background:#2563eb;border-color:#2563eb;color:#fff}
.eo-badge{font-size:10.5px;background:#f1f2f5;color:#6b7280;padding:0 5px;border-radius:5px;margin-left:5px}
.eo-body{flex:1;display:grid;grid-template-columns:1fr 320px;min-height:0}
.eo-canvas{overflow:auto;padding:14px 14px 22px;min-width:0}
/* 卡片 */
.eo-card{background:#fff;border:1px solid #e6e8ec;border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,.05),0 10px 26px rgba(16,24,40,.05)}
.eo-pad{padding:13px 15px}
.eo-card h3{margin:0 0 9px;font-size:12.3px;font-weight:650;color:#374151;display:flex;align-items:center;gap:8px}
.eo-grid2{display:grid;grid-template-columns:1.05fr .95fr;gap:13px}
.eo-row{display:grid;grid-template-columns:88px 1fr;gap:10px;padding:6px 0;border-bottom:1px dashed #eef0f3;font-size:12.5px}
.eo-row:last-child{border-bottom:0}
.eo-row .k{color:#6b7280;font-size:12.1px}
.eo-recruitment{container-type:inline-size}
.eo-recruitment .eo-grid2{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);align-items:stretch}
.eo-recruitment .eo-grid2 > .eo-card{min-width:0}
.eo-recruitment .eo-fields{margin:0}
.eo-upload{margin-bottom:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(16,24,40,.03)}
.eo-upload-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.eo-upload-head h3{margin:0;white-space:nowrap}
.eo-upload-info{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.eo-upload .eo-btn{padding:4px 9px;font-size:11.5px}
.eo-upload-files summary{cursor:pointer;font-size:11.5px;color:#2563eb;margin-top:7px}
.eo-upload-note{color:#6b7280;font-size:11.5px}
.eo-upload-list{list-style:none;margin:10px 0 0;padding:0}
.eo-upload-list li{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid #eef0f3}
.eo-upload-name{min-width:0;flex:1;overflow-wrap:anywhere}
.eo-upload-size{color:#6b7280;font-size:11px;white-space:nowrap}
.eo-upload-error{color:#b45309;font-size:12px;margin-top:8px;white-space:pre-line}
.eo-recruitment .eo-row{grid-template-columns:76px minmax(0,1fr)}
.eo-recruitment .eo-row dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
.eo-recruitment .eo-profile-fields .eo-row{grid-template-columns:minmax(0,1fr);gap:3px;padding:8px 0}
.eo-recruitment .eo-empty-field{color:#6b7280}
.eo-recruitment .eo-evidence{margin-top:13px}
.eo-evidence summary{cursor:pointer;font-size:12.3px;font-weight:650;color:#374151}
.eo-evidence summary .eo-tag{margin-left:7px}
.eo-recruitment .eo-raw{font-size:12.5px;line-height:1.82;color:#374151;max-height:330px;overflow:auto}
.eo-recruitment .eo-raw mark{background:#fef3c7;padding:1px 2px;border-radius:3px}
.eo-recruitment .eo-raw p:last-child{margin-bottom:0}
@container (max-width:540px){.eo-recruitment .eo-grid2{grid-template-columns:minmax(0,1fr)}}
/* 看板 */
.eo-filters{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:11px}
.eo-chip{border:1px solid #e6e8ec;background:#fff;border-radius:999px;padding:3px 10px;font-size:11.6px;color:#4b5563;cursor:pointer}
.eo-chip.on{background:#eef4ff;border-color:#c7d7fe;color:#2563eb}
.eo-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start}
.eo-col{border:1px solid #e6e8ec;border-radius:12px;padding:8px;min-height:360px;background:#f2f4f7}
.eo-col.a{background:#ecfdf5;border-color:#d7f0e4}
.eo-col.b{background:#fffbeb;border-color:#fbe8c4}
.eo-colhead{display:flex;align-items:center;gap:7px;padding:3px 4px 8px;font-size:12.3px;font-weight:650}
.eo-coldot{width:7px;height:7px;border-radius:50%;background:#9ca3af}
.eo-col.a .eo-coldot{background:#059669}.eo-col.b .eo-coldot{background:#f59e0b}
.eo-cnt{color:#6b7280;font-weight:500}
.eo-expert{background:#fff;border:1px solid #e6e8ec;border-radius:9px;padding:8px 10px;margin-bottom:7px;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}
.eo-expert:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(16,24,40,.08);border-color:#d3d9e2}
.eo-exhead{display:flex;align-items:center;gap:7px}
.eo-exname{font-weight:620;font-size:12.6px}
.eo-score{margin-left:auto;font-size:11.3px;font-weight:700;color:#1d4ed8;background:#eef4ff;padding:1px 6px;border-radius:5px}
.eo-expert.excluded .eo-score{color:#6b7280;background:#f3f4f6}
.eo-exmeta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;color:#6b7280;font-size:10.8px;margin-top:3px}
.eo-src{font-size:10px;padding:1px 5px;border-radius:4px;background:#eef2ff;color:#4338ca}
.eo-src.fs{background:#ecfdf5;color:#047857}.eo-src.man{background:#fef3c7;color:#92400e}
.eo-why{margin-top:4px;font-size:11.2px;color:#4b5563;line-height:1.5}
.eo-why.gap{color:#b45309}
/* Agent */
.eo-agent{border-left:1px solid #e6e8ec;background:#fff;display:flex;flex-direction:column;min-height:0}
.eo-ahead{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid #eef0f3;font-size:12.5px;font-weight:620}
.eo-ahead .st{margin-left:auto;font-size:10.8px;color:#059669;display:flex;align-items:center;gap:5px;font-weight:500}
.eo-ahead .st i{width:6px;height:6px;border-radius:50%;background:#059669;display:block}
.eo-thread{flex:1;overflow:auto;padding:13px;display:flex;flex-direction:column;gap:11px}
.eo-msg{font-size:12.4px;line-height:1.62}
.eo-who{font-size:10.8px;color:#9ca3af;margin-bottom:3px}
.eo-bubble{background:#f5f6f8;border-radius:10px;padding:8px 10px;white-space:pre-wrap}
.eo-msg.you .eo-bubble{background:#eef4ff}
.eo-run{border:1px solid #e6e8ec;border-radius:10px;overflow:hidden}
.eo-run .rt{display:flex;align-items:center;gap:7px;padding:7px 10px;background:#fafbfc;border-bottom:1px solid #eef0f3;font-size:11.6px;color:#374151}
.eo-run code{font:11.4px ui-monospace,SFMono-Regular,Menlo,monospace;background:#eef1f5;padding:1px 5px;border-radius:4px}
.eo-run .rb{padding:7px 10px;color:#6b7280;font-size:11.3px}
.eo-run .rb b{color:#15171c}
.eo-ok{color:#059669;font-weight:700}
.eo-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 13px 9px}
.eo-quick button{border:1px solid #e6e8ec;background:#fff;border-radius:999px;padding:4px 9px;font-size:11.2px;color:#4b5563;cursor:pointer}
.eo-quick button:hover{border-color:#c7d7fe;color:#2563eb;background:#eef4ff}
.eo-composer{border-top:1px solid #eef0f3;padding:9px 11px}
.eo-box{border:1px solid #e6e8ec;border-radius:10px;padding:7px 9px;display:flex;gap:8px;align-items:flex-end}
.eo-box textarea{border:0;outline:0;resize:none;flex:1;font:12.4px/1.6 inherit;height:36px;background:transparent;color:inherit}
.eo-send{border:0;background:#2563eb;color:#fff;border-radius:7px;width:27px;height:27px;display:grid;place-items:center;cursor:pointer}
/* 抽屉 */
.eo-dw{position:absolute;inset:0;background:rgba(17,24,39,.26)}
.eo-drawer{position:absolute;right:0;top:0;bottom:0;width:420px;background:#fff;box-shadow:-10px 0 32px rgba(16,24,40,.16);padding:16px 18px;overflow:auto}
.eo-drawer h2{font-size:15.5px;margin:0 0 2px}
.eo-x{position:absolute;right:12px;top:10px;border:0;background:#f3f4f6;width:26px;height:26px;border-radius:7px;color:#6b7280;cursor:pointer}
.eo-dim{margin:8px 0}
.eo-dim .r{display:flex;justify-content:space-between;font-size:12px;color:#374151}
.eo-bar{height:6px;background:#eef0f3;border-radius:99px;overflow:hidden;margin-top:4px}
.eo-bar i{display:block;height:100%;background:linear-gradient(90deg,#93b4fd,#2563eb)}
.eo-dwacts{display:flex;gap:7px;margin-top:15px}
.eo-btn.g{background:#ecfdf5;border-color:#a7f3d0;color:#047857}
.eo-btn.y{background:#fffbeb;border-color:#fde68a;color:#b45309}
.eo-btn.r{background:#fef2f2;border-color:#fecaca;color:#b91c1c}
.eo-toast{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:#111827;color:#fff;font-size:12.2px;padding:7px 14px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
`

  // ---------------- mock 数据 ----------------
  const DEMANDS = [
    { id: "d1", title: "字节 · 多语言语音标注", org: "字节跳动", count: 40, state: "匹配中", dot: "" },
    { id: "d2", title: "美团 · 客服对话质检", org: "美团", count: 25, state: "待匹配", dot: "warn" },
    { id: "d3", title: "某车企 · 座舱语义标注", org: "某车企", count: 30, state: "草稿", dot: "draft" },
    { id: "d4", title: "蚂蚁 · 金融文档抽取", org: "蚂蚁集团", count: 12, state: "已完成", dot: "" },
  ]

  const PROFILE_FIELDS = ["专业背景", "从业经验", "能力要求", "其他条件"]
  const JD_FIELDS = ["职位名称", "岗位说明", "所属领域", "岗位职责", "任职要求", "核心能力", "价格", "招募人数"]

  // 示例成果按需求 ID 归属。其他需求暂未提供解析样例。
  const RECRUITMENT_RESULTS = {
    d1: {
      duration: "3 个月",
      profile: {
        专业背景: "具备语音数据标注或多语言转写相关背景。",
        从业经验: "有 2 年以上语音标注经验，熟悉标注规范与质检流程。",
        能力要求: "能处理普通话语料，并能处理粤语或四川话语料。能完成转写、切分与质检。",
        其他条件: "上海、成都优先，支持远程协作。项目周期 3 个月，需签署 NDA。",
      },
      jd: {
        职位名称: "多语言语音标注专家（粤语 / 四川话）",
        岗位说明: "参与多语言语音模型的训练数据项目，项目周期 3 个月，支持远程协作。",
        所属领域: "语音数据标注 / 多语言转写",
        岗位职责: "按规范完成语音转写、音频切分和质检。",
        任职要求: "有 2 年以上语音标注经验，熟悉标注规范与质检流程。上海、成都优先，需签署 NDA。",
        核心能力: "普通话及粤语或四川话转写、音频切分、语音数据质检。",
        价格: "120–180 元/小时，按实际有效工时结算。",
        招募人数: 40,
      },
      source: [
        ["项目背景：为 ", ["字节跳动"], " 多语言语音模型提供训练数据，覆盖普通话、粤语、四川话三类语料，需完成转写、切分与质检。"],
        ["人员要求：", ["2 年以上语音标注经验"], "，熟悉标注规范与质检流程；", ["上海、成都"], "两地优先，支持远程协作。"],
        ["交付节奏：项目周期 ", ["3 个月"], "，首批 ", ["40 人"], "，后续视产能追加。"],
        ["报价：", ["120–180 元/小时"], "，按实际有效工时结算，需签署 NDA，无竞业限制。"],
      ],
    },
  }

  const EXPERTS = [
    { name: "张*", src: "原识", city: "上海", years: 3, rate: 150, score: 92, bucket: "A", why: "技能命中 4/4；有字节语音项目；档期匹配", gap: "" },
    { name: "陈*", src: "飞书", city: "成都", years: 4, rate: 140, score: 88, bucket: "A", why: "粤语母语；质检经验 2 年；报价在区间内", gap: "" },
    { name: "李*", src: "原识", city: "远程", years: 3, rate: 160, score: 85, bucket: "A", why: "四川话转写熟练；可投入 3 个月", gap: "" },
    { name: "周*", src: "手填", city: "上海", years: 2, rate: 130, score: 82, bucket: "A", why: "技能命中 3/4；报价有优势", gap: "" },
    { name: "王*", src: "原识", city: "成都", years: 2, rate: 190, score: 74, bucket: "B", why: "技能匹配好，但报价高于上限", gap: "报价超 10 元/小时，建议追问可否下调" },
    { name: "赵*", src: "飞书", city: "北京", years: 5, rate: 150, score: 71, bucket: "B", why: "经验丰富，需确认是否接受远程", gap: "地域不符，追问远程意愿" },
    { name: "吴*", src: "手填", city: "上海", years: 1, rate: 120, score: 68, bucket: "B", why: "报价合适，经验略低于 2 年", gap: "经验差 1 年，建议试标验证" },
    { name: "孙*", src: "原识", city: "广州", years: 3, rate: 200, score: 38, bucket: "C", why: "报价下限 200 > 预算 180", gap: "硬门槛未通过" },
    { name: "郑*", src: "飞书", city: "西安", years: 2, rate: 140, score: 35, bucket: "C", why: "方言不符（仅普通话）", gap: "硬门槛未通过" },
  ]

  // ---------------- 极简 store ----------------
  const store = {
    open: false,
    tab: "p3",
    demand: "d1",
    expandedDemand: "d1",
    nav: "demand",
    drawer: null,
    toast: null,
    documents: {},
    experts: EXPERTS.map((e) => ({ ...e })),
  }
  const listeners = new Set()
  const emit = () => { for (const fn of listeners) fn() }
  const set = (patch) => { Object.assign(store, patch); emit() }

  function useStore() {
    const [, force] = useState(0)
    useEffect(() => {
      const fn = () => force((x) => x + 1)
      listeners.add(fn)
      return () => listeners.delete(fn)
    }, [])
    return store
  }

  let toastTimer = null
  function toast(text) {
    set({ toast: text })
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toast: null }), 2200)
  }

  // ---------------- 侧栏入口图标（原生 sidebar.panellist 行） ----------------
  function ExpertOpsGlyph(props) {
    const size = props && props.size ? props.size : 16
    const active = !!(props && props.active)
    return n("svg", {
      className: "eo-glyph", width: size, height: size, viewBox: "0 0 16 16",
      fill: "none", stroke: "currentColor", strokeWidth: active ? 1.55 : 1.4,
      strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
      opacity: active ? 1 : 0.78,
    },
      n("rect", { x: 1.8, y: 2.6, width: 12.4, height: 10.8, rx: 2.4 }),
      n("path", { d: "M4.7 6.1h6.6M4.7 8.5h6.6M4.7 10.9h3.4" }),
      n("circle", { cx: 11.5, cy: 10.9, r: 1.45, fill: "currentColor", stroke: "none" }))
  }

  // ---------------- 工作台 ----------------
  function Workbench() {
    const s = useStore()
    const active = DEMANDS.find((d) => d.id === s.demand) || DEMANDS[0]
    const recruitment = RECRUITMENT_RESULTS[active.id]
    const list = (bucket) => s.experts.filter((e) => e.bucket === bucket)

    const tabs = [
      ["recruitment", "需求与招募成果", null],
      ["p3", "匹配看板", s.experts.length],
    ]

    return n("div", { className: "eo-root" },
      n("div", { className: "eo-shell" },
        // 左栏
        n("aside", { className: "eo-left" },
          n("div", { className: "eo-brand" }, n("span", { className: "dot" }), "专家运营", n("small", null, "原识 × DSH")),
          n("div", { className: "eo-nav" },
            [["demand", "需求"], ["experts", "专家库"], ["settings", "设置"]].map(([id, label]) =>
              n("button", { key: id, className: s.nav === id ? "on" : "", onClick: () => set({ nav: id }) },
                n("span", { className: "ico" }, id === "demand" ? "▤" : id === "experts" ? "◎" : "⚙"), label))),
          n("div", { className: "eo-sec" }, "进行中的需求"),
          n("div", { className: "eo-demands" },
            DEMANDS.map((d) => n("div", { key: d.id },
              n("button", {
                className: "eo-demand" + (d.id === s.demand ? " on" : ""),
                "aria-expanded": s.expandedDemand === d.id,
                "aria-controls": "eo-project-menu-" + d.id,
                onClick: () => set({ expandedDemand: s.expandedDemand === d.id ? null : d.id }),
              },
                n("b", null, d.title),
                n("i", { className: "eo-demand-chevron", "aria-hidden": true }, "▸"),
                n("span", null, n("i", { className: "eo-sdot " + d.dot }), d.state + " · " + d.count + " 人")),
              n("div", { id: "eo-project-menu-" + d.id, hidden: s.expandedDemand !== d.id },
                n("nav", { className: "eo-project-menu", "aria-label": d.title + "功能" },
                  tabs.map(([id, label, cnt]) => n("button", {
                    key: id,
                    className: s.demand === d.id && s.tab === id ? "on" : "",
                    "aria-current": s.demand === d.id && s.tab === id ? "page" : undefined,
                    onClick: () => set({ demand: d.id, tab: id, expandedDemand: d.id, drawer: null }),
                  }, label, cnt != null ? n("span", { className: "eo-badge" }, cnt) : null))))))),
          n("div", { className: "eo-me" }, n("div", { className: "eo-avatar" }, "尚"), n("div", null, "尚楚哲", n("br"), n("span", { style: { fontSize: 10.5 } }, "专家运营")))),
        // 右栏
        n("main", { className: "eo-right" },
          n("header", { className: "eo-head" },
            n("div", { className: "eo-htop" },
              n("h1", null, active.title,
                n("span", { className: "eo-title-divider", "aria-hidden": true }, "/"),
                n("span", { className: "eo-title-space" }, s.tab === "recruitment" ? "需求与招募成果" : "匹配看板")),
              n("div", { className: "eo-hactions" },
                n("button", { className: "eo-btn", onClick: () => toast("导出 mock 名单（M3 接飞书表格）") }, "导出名单"),
                n("button", { className: "eo-btn", onClick: () => toast("已生成分享链接（示意）") }, "分享"),
                n("button", { className: "eo-btn primary", onClick: () => toast("已触发 expert_match（mock，3.2s）") }, "重新匹配")))),
          n("div", { className: "eo-body" },
            n("div", { className: "eo-canvas" },
              s.tab === "recruitment"
                ? n(RecruitmentView, { key: active.id, demandId: active.id, result: recruitment })
                : n(BoardView, { list, total: s.experts.length })),
            n(AgentPanel)),
          s.drawer ? n(Drawer, { expert: s.drawer }) : null,
          s.toast ? n("div", { className: "eo-toast" }, s.toast) : null)))
  }

  function RecruitmentFields({ title, badge, labels, values, profile }) {
    return n("section", { className: "eo-card eo-pad" },
      n("h3", null, title, n("span", { className: "eo-tag" }, badge)),
      n("dl", { className: "eo-fields" + (profile ? " eo-profile-fields" : "") },
        labels.map((label) => {
          const value = values?.[label]
          const isEmpty = value == null || (typeof value === "string" && !value.trim())
          const content = label === "招募人数" && !isEmpty ? value + " 人" : value
          return n("div", { className: "eo-row", key: label },
            n("dt", { className: "k" }, label),
            n("dd", { className: isEmpty ? "eo-empty-field" : undefined },
              isEmpty ? (profile ? "未限定" : "待补充") : content))
        })))
  }

  function DemandEvidence({ source }) {
    const citationCount = source?.reduce((count, paragraph) =>
      count + paragraph.filter(Array.isArray).length, 0) ?? 0
    return n("details", { className: "eo-card eo-pad eo-evidence" },
      n("summary", null, "需求原文与引用",
        n("span", { className: "eo-tag" }, citationCount ? "已定位 " + citationCount + " 处" : "暂无原文")),
      n("div", { className: "eo-raw" }, source
        ? source.map((paragraph, i) => n("p", { key: i },
          paragraph.map((part, j) => Array.isArray(part) ? n("mark", { key: j }, part[0]) : part)))
        : n("p", null, "当前需求暂无原文或引用。")))
  }

  // Session-only originals; no parsing or host upload until the M3 file API exists.
  function DemandUpload({ demandId }) {
    const s = useStore()
    const picker = useRef(null)
    const [error, setError] = useState("")
    const files = s.documents[demandId] || []
    function selectFiles(event) {
      const incoming = Array.from(event.target.files || [])
      event.target.value = ""
      const next = [...(store.documents[demandId] || [])]
      const errors = []
      let bytes = next.reduce((total, file) => total + file.size, 0)
      for (const file of incoming) {
        if (!/\.(pdf|docx?)$/i.test(file.name)) {
          errors.push(file.name + "：仅支持 PDF、DOC、DOCX。")
        } else if (!file.size) {
          errors.push(file.name + "：文件为空，请重新选择。")
        } else if (next.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) {
          errors.push(file.name + "：已在列表中。")
        } else if (bytes + file.size > 50 * 1024 * 1024 || next.length >= 20) {
          errors.push(file.name + "：每个需求最多暂存 20 份、合计 50 MB。")
        } else {
          next.push(file)
          bytes += file.size
        }
      }
      set({ documents: { ...store.documents, [demandId]: next } })
      setError(errors.join("\n"))
    }
    return n("section", { className: "eo-card eo-pad eo-upload", "aria-label": "甲方需求文档" },
      n("div", { className: "eo-upload-head" },
        n("div", { className: "eo-upload-info" },
          n("h3", null, "甲方需求文档"),
          n("span", { className: "eo-upload-note" }, "PDF / Word · 多选"),
          n("span", { className: "eo-tag", title: "文件仅在本次会话暂存，刷新后需重新选择；尚未接入保存与解析，现有示例成果不会随上传改变。" }, "本次暂存 · 未解析")),
        n("button", { className: "eo-btn primary", onClick: () => picker.current?.click() }, "上传文档"),
        n("input", { ref: picker, type: "file", hidden: true, multiple: true,
          accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "aria-label": "上传甲方需求文档", onChange: selectFiles })),
      files.length ? n("details", { className: "eo-upload-files" },
        n("summary", null, "已选择 " + files.length + " 份文档 · 查看文件"),
        n("ul", { className: "eo-upload-list" }, files.map((file, i) =>
        n("li", { key: file.name + ":" + file.size + ":" + file.lastModified },
          n("span", { className: "eo-upload-name" }, file.name),
          n("span", { className: "eo-upload-size" }, file.size >= 1048576 ? (file.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(file.size / 1024)) + " KB"),
          n("button", { className: "eo-btn", "aria-label": "移除 " + file.name, onClick: () => {
            set({ documents: { ...store.documents, [demandId]: files.filter((_, index) => index !== i) } })
            setError("")
          } }, "移除"))))) : null,
      error ? n("div", { className: "eo-upload-error", role: "alert" }, error) : null)
  }

  function RecruitmentView({ result, demandId }) {
    return n("div", { className: "eo-recruitment" },
      n(DemandUpload, { demandId }),
      result ? n("div", { className: "eo-grid2" },
        n(RecruitmentFields, { title: "专家画像", badge: "内部版", labels: PROFILE_FIELDS, values: result.profile, profile: true }),
        n(RecruitmentFields, { title: "岗位 JD", badge: "对外草稿", labels: JD_FIELDS, values: result.jd }))
        : n("section", { className: "eo-card eo-pad" },
          n("h3", null, "暂无招募成果"),
          n("div", null, "当前需求还没有解析结果、专家画像或岗位 JD。")),
      result ? n(DemandEvidence, { source: result.source }) : null)
  }

  function BoardView({ list, total }) {
    const s = useStore()
    const cols = [["A", "推荐", "a"], ["B", "待确认", "b"], ["C", "排除", "c"]]
    const srcCls = { 原识: "", 飞书: "fs", 手填: "man" }
    return n("div", null,
      n("div", { className: "eo-filters" },
        ["原识", "飞书表单", "手填"].map((x, i) => n("span", { key: x, className: "eo-chip on" }, x)),
        n("span", { className: "eo-chip" }, "城市 · 不限"),
        n("span", { className: "eo-chip" }, "报价 · 不限"),
        n("span", { className: "eo-chip" }, "只看有缺口"),
        n("span", { style: { marginLeft: "auto", color: "#9ca3af", fontSize: 11.2 } }, total + " 位候选 · mock 数据")),
      n("div", { className: "eo-board" },
        cols.map(([bucket, label, cls]) =>
          n("div", { className: "eo-col " + cls, key: bucket },
            n("div", { className: "eo-colhead" }, n("span", { className: "eo-coldot" }), label,
              n("span", { className: "eo-cnt" }, list(bucket).length)),
            list(bucket).map((e) => n("div", {
              key: e.name,
              className: "eo-expert" + (bucket === "C" ? " excluded" : ""),
              onClick: () => set({ drawer: e.name }),
            },
              n("div", { className: "eo-exhead" }, n("span", { className: "eo-exname" }, e.name), n("span", { className: "eo-score" }, e.score)),
              n("div", { className: "eo-exmeta" },
                n("span", { className: "eo-src " + srcCls[e.src] }, e.src),
                n("span", null, e.city + " · " + e.years + " 年 · " + e.rate + " 元/小时")),
              n("div", { className: "eo-why" }, e.why),
              e.gap ? n("div", { className: "eo-why gap" }, e.gap) : null))))))
  }

  function AgentPanel() {
    return n("aside", { className: "eo-agent" },
      n("div", { className: "eo-ahead" }, "运营 Agent", n("span", { className: "st" }, n("i"), "在线")),
      n("div", { className: "eo-thread" },
        n("div", { className: "eo-msg you" }, n("div", { className: "eo-who" }, "你"),
          n("div", { className: "eo-bubble" }, "把原识和飞书里的候选人按这份画像重排，粤语/四川话优先，报价别超 180。")),
        n("div", { className: "eo-msg" }, n("div", { className: "eo-who" }, "Agent"),
          n("div", { className: "eo-run" },
            n("div", { className: "rt" }, n("span", { className: "eo-ok" }, "✓"), n("code", null, "expert_match"),
              n("span", { style: { marginLeft: "auto", color: "#9ca3af", fontSize: 10.6 } }, "3.2s")),
            n("div", { className: "rb" }, "扫描 ", n("b", null, "43"), " 位候选（原识 27 / 飞书 9 / 手填 7）→ ",
              n("b", null, "12 推荐"), " · ", n("b", null, "8 待确认"), " · ", n("b", null, "23 排除")))),
        n("div", { className: "eo-msg" }, n("div", { className: "eo-who" }, "Agent"),
          n("div", { className: "eo-bubble" }, "已重排。3 位因报价超上限被移到「排除」，2 位原「待确认」补上档期信息后升到「推荐」。\n建议先看 张*（92）和陈*（88），两人技能全命中且有字节项目经验。")),
        n("div", { className: "eo-msg" }, n("div", { className: "eo-who" }, "Agent"),
          n("div", { className: "eo-bubble" }, "需要我把这 12 人导出成飞书表格，或者给「待确认」的 8 人各生成一条追问话术吗？"))),
      n("div", { className: "eo-quick" },
        ["重排匹配", "生成追问话术", "导出推荐名单", "补全缺失字段"].map((x) =>
          n("button", { key: x, onClick: () => toast("已执行「" + x + "」（mock）") }, x))),
      n("div", { className: "eo-composer" },
        n("div", { className: "eo-box" },
          n("textarea", { placeholder: "让 Agent 做点什么，例如：把待确认里报价超标的挑出来" }),
          n("button", { className: "eo-send", onClick: () => toast("Agent 收到（mock，M3 接工具）") }, "↑"))))
  }

  function Drawer({ expert }) {
    const s = useStore()
    const e = s.experts.find((x) => x.name === expert)
    if (!e) return null
    const status = e.bucket === "A" ? ["推荐", "#ecfdf5", "#047857"] : e.bucket === "B" ? ["待确认", "#fffbeb", "#b45309"] : ["排除", "#f3f4f6", "#6b7280"]
    const dims = [["专业匹配", 35, 0.92], ["经验年限", 25, 0.8], ["产能 / 档期", 15, 0.85], ["报价", 15, 0.7], ["信誉 / 历史", 10, 0.9]]
    const move = (bucket) => {
      set({
        experts: s.experts.map((x) => (x.name === e.name ? { ...x, bucket } : x)),
        drawer: null,
      })
      toast("已把「" + e.name + "」标记为「" + (bucket === "A" ? "推荐" : bucket === "B" ? "待确认" : "排除") + "」")
    }
    return n("div", { className: "eo-dw", onClick: (ev) => { if (ev.target === ev.currentTarget) set({ drawer: null }) } },
      n("div", { className: "eo-drawer" },
        n("button", { className: "eo-x", onClick: () => set({ drawer: null }) }, "✕"),
        n("h2", null, e.name),
        n("div", { className: "eo-meta", style: { marginBottom: 8 } },
          n("span", null, e.src === "原识" ? "原识平台" : e.src === "飞书" ? "飞书表单" : "业务手填"),
          n("span", null, e.city + " · " + e.years + " 年 · " + e.rate + " 元/小时")),
        n("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          n("span", { className: "eo-tag", style: { background: status[1], color: status[2] } }, status[0]),
          n("span", { style: { fontSize: 11.5, color: "#9ca3af" } }, "AI 综合分"),
          n("b", { style: { fontSize: 17, color: "#1d4ed8" } }, e.score)),
        n("h3", { style: { margin: "15px 0 6px", fontSize: 12.3, color: "#374151" } }, "维度评分"),
        dims.map(([k, w, r]) => n("div", { className: "eo-dim", key: k },
          n("div", { className: "r" }, n("span", null, k, " ", n("span", { style: { color: "#9ca3af" } }, "(" + w + ")")),
            n("span", null, Math.round(w * r) + "/" + w)),
          n("div", { className: "eo-bar" }, n("i", { style: { width: Math.round(r * 100) + "%" } })))),
        n("h3", { style: { margin: "13px 0 4px", fontSize: 12.3, color: "#374151" } }, "匹配理由"),
        n("div", { className: "eo-why", style: { fontSize: 12.1 } }, e.why),
        n("h3", { style: { margin: "13px 0 4px", fontSize: 12.3, color: "#374151" } }, "缺口与追问"),
        n("div", { className: "eo-why gap", style: { fontSize: 12.1 } }, e.gap || "无"),
        n("div", { className: "eo-dwacts" },
          n("button", { className: "eo-btn g", onClick: () => move("A") }, "推荐"),
          n("button", { className: "eo-btn y", onClick: () => move("B") }, "待确认"),
          n("button", { className: "eo-btn r", onClick: () => move("C") }, "排除")),
        n("div", { style: { fontSize: 11.2, color: "#9ca3af", marginTop: 8 } }, "人工覆写会强制选原因模板并写入审计日志（M3）。")))
  }

  // ---------------- 注册 ----------------
  function apply(ctx) {
    try {
      const style = document.createElement("style")
      style.dataset.dsh = "expert-ops"
      style.textContent = CSS
      document.head.appendChild(style)
      ctx.effect(() => () => style.remove(), "expert-ops: styles")
    } catch (error) {
      console.info("[dsh-expert-ops] style inject failed", error)
    }

    const slots = ctx.get("slots")
    if (slots === undefined) {
      console.warn("[dsh-expert-ops] slots service missing, UI not mounted")
      return
    }
    // 左栏原生入口：点它会把主区切到下面的 main panel
    ctx.effect(() => slots.inject("sidebar.panellist", () => slots.register({
      name: "sidebar.panellist",
      id: "expert-ops",
      order: 3,
      label: () => "专家运营",
    }, ExpertOpsGlyph)), "expert-ops: sidebar row")

    // 主区整页（keyed main slot，key 与上面的 id 一致）
    ctx.effect(() => slots.inject("main", function* () {
      yield slots.register({
        name: "main",
        key: "expert-ops",
        inject: () => ({}),
      }, Workbench)
    }), "expert-ops: main panel")

    console.info("[dsh-expert-ops] client apply() mounted")
  }

  module.exports = { inject, apply }
  return module.exports
} })