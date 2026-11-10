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
   * 业务数据仍为 mock；项目聊天复用原生 DSH Session，项目与会话绑定暂存 localStorage。
   */

  const React = require("react")
  const { useState, useEffect, useRef } = React
  const n = React.createElement
  const ProjectHomeContext = React.createContext(null)

  const inject = ["slots", "theme", "layout", "sessions"]

  const CSS = `
.eo-glyph{display:block}
.eo-root{--eo-page:#FFFFFF;--eo-sidebar:#FFFFFF;--eo-selected:#EDEDEC;--eo-hover:#F4F4F3;--eo-line:#E9E9E9;--eo-accent:#D97757;--eo-ink:#141413;--eo-muted:#6E6A60;height:100%;min-height:0;display:flex;background:var(--eo-page);font:13px/1.55 -apple-system,"PingFang SC","Helvetica Neue",Arial,sans-serif;color:#141413}
.eo-shell{flex:1;min-width:0;min-height:0;width:100%;background:var(--eo-page);overflow:hidden;display:grid;grid-template-columns:200px 1fr}
/* 左栏 */
.eo-left{background:var(--eo-sidebar);border-right:1px solid var(--eo-line);display:flex;flex-direction:column;min-height:0}
.eo-brand{display:flex;align-items:center;gap:9px;padding:15px 15px 11px;font-weight:680}
.eo-brand .dot{width:10px;height:10px;border-radius:3px;background:var(--eo-accent)}
.eo-brand small{margin-left:auto;font-size:10.5px;font-weight:500;color:#91888A}
.eo-nav{padding:2px 8px}
.eo-nav button{display:flex;align-items:center;gap:9px;width:100%;border:0;background:transparent;padding:8px 10px;border-radius:8px;color:#2C2A27;font-size:13px;cursor:pointer}
.eo-nav button:hover{background:var(--eo-hover)}
.eo-nav button.on{background:var(--eo-selected);color:var(--eo-ink);font-weight:600}
.eo-nav .ico{width:16px;color:#91888A;font-size:12px;display:grid;place-items:center}
.eo-nav button.on .ico{color:var(--eo-ink)}
.eo-sec{display:flex;align-items:center;justify-content:space-between;padding:13px 15px 5px;font-size:10.5px;letter-spacing:.07em;color:#91888A;text-transform:uppercase}
.eo-demands{padding:0 8px;overflow:auto;flex:1;min-height:0}
.eo-demand{display:block;width:100%;text-align:left;border:1px solid transparent;background:transparent;padding:8px 10px;border-radius:9px;margin-bottom:2px;cursor:pointer}
.eo-demand:hover{background:var(--eo-hover)}
.eo-demand.on{background:var(--eo-selected);border-color:transparent;box-shadow:none}
.eo-demand b{display:block;padding-right:14px;font-size:12.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eo-demand{position:relative}
.eo-demand-chevron{position:absolute;right:9px;top:9px;width:18px;height:18px;display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:#91888A;font:inherit;font-size:10px;cursor:pointer;transition:transform .15s,background .15s}
.eo-demand-chevron:hover{background:#E9E9E9;color:#141413}
.eo-demand-chevron:focus-visible{outline:2px solid var(--eo-accent);outline-offset:1px}
.eo-project-item.expanded .eo-demand-chevron{transform:rotate(90deg)}
.eo-project-menu{margin:3px 0 9px 18px;padding-left:8px;border-left:1px solid #E9E9E9;display:grid;gap:2px}
.eo-project-menu button{display:flex;align-items:center;justify-content:space-between;gap:4px;width:100%;text-align:left;border:0;border-radius:6px;background:transparent;color:#6E6A60;padding:7px 8px;font-size:11.5px;cursor:pointer}
.eo-project-menu button:hover{background:var(--eo-hover)}
.eo-project-menu button.on{background:var(--eo-selected);color:var(--eo-ink);font-weight:600}
.eo-project-menu button:focus-visible,.eo-demand:focus-visible{outline:2px solid var(--eo-accent);outline-offset:1px}
.eo-demand span{display:flex;align-items:center;gap:6px;color:#6E6A60;font-size:11.2px;margin-top:2px}
.eo-sdot{width:6px;height:6px;border-radius:50%;background:#059669}
.eo-sdot.draft{background:#91888A}.eo-sdot.warn{background:#f59e0b}
.eo-me{display:flex;align-items:center;gap:9px;padding:11px 15px;border-top:1px solid var(--eo-line);color:#6E6A60;font-size:11.5px}
.eo-avatar{width:26px;height:26px;border-radius:50%;background:#F1F1F0;color:#B4623E;display:grid;place-items:center;font-weight:700;font-size:11px}
.eo-project-item{position:relative}
.eo-project-item .eo-demand b{padding-right:31px}
.eo-project-item .eo-demand-chevron{right:27px}
.eo-project-more{position:absolute;right:5px;top:7px;border:0;border-radius:4px;background:transparent;color:#6E6A60;cursor:pointer;font-size:16px;line-height:22px;width:22px;opacity:0}
.eo-project-item:hover>.eo-project-more,.eo-project-item:focus-within>.eo-project-more{opacity:1}
.eo-project-more:hover{background:#E9E9E9}
.eo-ended-toggle{display:flex;align-items:center;width:100%;border:0;border-top:1px solid var(--eo-line);background:transparent;padding:12px 7px 8px;margin-top:12px;text-align:left;font-size:11.5px;color:#6E6A60;cursor:pointer}
.eo-list-empty{font-size:11.5px;color:#91888A;padding:0 8px}
.eo-undo-delete{width:100%;text-align:left;border:0;background:transparent;font-size:11px;color:#D97757;padding:10px 7px;cursor:pointer;overflow-wrap:anywhere}
.eo-context-menu{position:fixed;z-index:2000;width:172px;padding:5px;background:#fff;border:1px solid var(--eo-line);border-radius:9px;box-shadow:0 8px 28px #14141329}
.eo-context-menu button{display:block;width:100%;text-align:left;border:0;background:transparent;border-radius:5px;padding:7px 10px;font-size:12px;cursor:pointer;color:#2C2A27}
.eo-context-menu button:hover,.eo-context-menu button:focus-visible{background:#F1F1F0;outline:none}
.eo-context-menu .danger{color:#dc2626;border-top:1px solid #eef0f3}
.eo-project-dialog-backdrop{position:fixed;inset:0;z-index:2100;background:#14141333;display:grid;place-items:center}
.eo-project-dialog{width:min(360px,calc(100vw - 40px));background:white;border-radius:12px;padding:20px;box-shadow:0 16px 50px #14141333}
.eo-project-dialog h3{margin:0 0 16px;font-size:15px}
.eo-project-dialog p{font-size:12px;color:#6E6A60;line-height:1.7;overflow-wrap:anywhere}
.eo-project-dialog label{display:grid;gap:6px;font-size:12px}
.eo-project-dialog input{box-sizing:border-box;width:100%;border:1px solid #DEDCD3;border-radius:6px;padding:8px 10px;font:inherit}
.eo-project-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.eo-project-dialog .danger{color:#fff;background:#dc2626;border-color:#dc2626}
@media(hover:none){.eo-project-more{opacity:1}}
/* 右栏 */
.eo-right{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--eo-page)}
.eo-head{background:#fff;border-bottom:1px solid var(--eo-line);padding:6px 14px}
.eo-htop{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.eo-htop h1{font-size:14px;line-height:1.4;margin:0;font-weight:650;min-width:0;overflow-wrap:anywhere}
.eo-title-btn{border:0;background:transparent;padding:2px 4px;margin:-2px -4px;border-radius:6px;font:inherit;color:inherit;cursor:pointer;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eo-title-btn:hover{color:var(--eo-accent);background:var(--eo-hover)}
.eo-title-btn:focus-visible{outline:2px solid var(--eo-accent);outline-offset:2px}
.eo-title-divider{color:#91888A;margin:0 8px;font-weight:400}
.eo-title-space{font-weight:500;color:#2C2A27}
.eo-head .eo-btn{font-size:11.5px;padding:4px 9px;border-radius:6px}
.eo-head .eo-hactions{gap:6px;flex-shrink:0}
.eo-meta{display:flex;gap:12px;flex-wrap:wrap;color:#6E6A60;font-size:11.8px;margin-top:3px}
.eo-tag{font-size:10.5px;padding:1px 7px;border-radius:5px;background:#F1F1F0;color:#6E6A60}
.eo-tag.warn{background:#fffbeb;color:#b45309}
.eo-hactions{margin-left:auto;display:flex;gap:8px}
.eo-btn{border:1px solid var(--eo-line);background:#fff;padding:6px 11px;border-radius:8px;font-size:12.3px;cursor:pointer}
.eo-btn:hover{border-color:#DEDCD3}
.eo-btn.primary{background:var(--eo-accent);border-color:var(--eo-accent);color:#fff}
.eo-btn.primary:hover{background:#C4603C;border-color:#C4603C}
.eo-badge{font-size:10.5px;background:#f1f2f5;color:#6E6A60;padding:0 5px;border-radius:5px;margin-left:5px}
.eo-body{flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,36%);min-height:0}
.eo-canvas{overflow:auto;padding:14px 14px 22px;min-width:0}

/* AI totals and compact human review queue */
.eo-candidate-workspace{container-type:inline-size}
.eo-stat-grid{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,3fr) minmax(0,3fr);gap:10px;position:sticky;top:-12px;z-index:6;margin:0 -12px 10px;padding:10px 12px 8px;background:var(--eo-page)}
.eo-stat{position:relative;border:1px solid #d1fae5;border-radius:11px;background:#ecfdf5;color:#047857;text-align:left;padding:10px 14px;cursor:pointer;font:inherit}
.eo-stat.B{background:#fffbeb;border-color:#fde68a;color:#b45309}.eo-stat.C{background:#F1F1F0;border-color:#E9E9E9;color:#6E6A60}
.eo-stat[aria-pressed="true"]{outline:2px solid currentColor;outline-offset:1px}
.eo-stat-label{display:block;padding-right:32px;font-size:12px;font-weight:600}.eo-stat-number{display:block;font-size:32px;font-weight:650;line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums}
.eo-stat-caption{display:block;margin-top:3px;font-size:10.5px;opacity:.85}
.eo-pool-pending{display:flex;align-items:center;gap:5px;font-size:11px;color:#64748b}
.eo-pool-pending input{min-height:0}
.eo-stat-number small{font-size:11px;font-weight:400;margin-left:6px}
.eo-stat-new{position:absolute;right:12px;top:12px;border-radius:12px;padding:2px 7px;background:#fff;color:inherit;border:1px solid currentColor;font-size:11px;font-weight:600}
.eo-pool-tabs{display:flex;gap:6px;border-bottom:1px solid var(--eo-line);margin-bottom:8px;overflow:auto}
.eo-pool-tabs button{white-space:nowrap;font:inherit;font-size:12px;padding:5px 9px;margin-bottom:6px;border-radius:6px;border:0;border-bottom:2px solid transparent;color:#6E6A60;background:none;cursor:pointer}
.eo-pool-tabs button[aria-pressed="true"]{color:var(--eo-ink);border-bottom-color:transparent;background:var(--eo-selected);font-weight:600}.eo-pool-tabs small{margin-left:5px;font:inherit}
.eo-pool-filters{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}.eo-pool-filters select,.eo-pool-filters input{min-height:33px;box-sizing:border-box;border:1px solid #E5E3DC;border-radius:7px;background:#fff;padding:6px 9px;font:inherit;font-size:12px;color:#2C2A27;min-width:0}
.eo-pool-filters input{flex:1;min-width:150px}.eo-pool-filters select{max-width:100%}
.eo-pool-bulk{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:11.5px;color:#64748b;flex-wrap:wrap}.eo-pool-checks{display:flex;align-items:center;gap:14px;flex-wrap:nowrap}.eo-pool-bulk label{display:flex;align-items:center;gap:5px;white-space:nowrap}.eo-pool-bulk input{margin:0;accent-color:var(--eo-accent)}.eo-pool-selected{white-space:nowrap}.eo-pool-bulk-actions{display:flex;gap:6px;margin-left:auto}.eo-pool-bulk-actions .eo-btn{padding:4px 9px;font-size:11.5px}
.eo-candidate-workspace .eo-btn:disabled{opacity:.45;cursor:not-allowed}
.eo-pool-list{background:white;border:1px solid #e0e5ec;border-radius:10px;overflow:hidden}
.eo-pool-row{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:11px;padding:14px;border-bottom:1px solid #e7ecf2;align-items:start}.eo-pool-row:last-child{border-bottom:0}.eo-pool-row>input{margin:3px 0 0;accent-color:var(--eo-accent)}
.eo-pool-row.reviewed{background:#f5f6f8}.eo-pool-row.reviewed .eo-pool-info,.eo-pool-row.reviewed .eo-pool-status{color:#7b8492}.eo-pool-row.reviewed .eo-ai-badge{background:#e8ebef;color:#6E6A60;border-color:#dce1e7}
.eo-pool-new{display:inline-flex;align-items:center;padding:2px 6px;border-radius:5px;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;font-size:10px;font-weight:600}
.eo-pool-source{display:inline-flex;padding:2px 6px;border-radius:5px;font-size:10px;background:#eff6ff;color:#B4623E}
.eo-pool-source.feishu{background:#f5f3ff;color:#6d28d9}.eo-pool-source.manual{background:#ecfeff;color:#0e7490}
.eo-pool-row.reviewed .eo-pool-source{background:#e8ebef;color:#6E6A60}
.eo-pool-name{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.eo-pool-name strong{font-size:13px}.eo-pool-name small{font-size:10px;color:#8a94a5}
.eo-ai-badge{border:1px solid #bbebd7;background:#ecfdf5;color:#047857;padding:2px 6px;border-radius:5px;font-size:10px}.eo-ai-badge.B{background:#fff7ed;border-color:#fed7aa;color:#b45309}.eo-ai-badge.C{background:#F1F1F0;border-color:#d1d5db;color:#6E6A60}
.eo-pool-info{min-width:0;color:#334155}.eo-pool-info p{font-size:11.5px;line-height:1.7;margin:5px 0 0;overflow-wrap:anywhere}.eo-pool-info .eo-pool-reason{color:#778296;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.eo-pool-side{display:flex;flex-direction:column;gap:7px;align-items:flex-end}.eo-pool-status{font-size:11px;color:#64748b}.eo-pool-row-actions{display:flex;gap:6px;flex-wrap:wrap}.eo-pool-row-actions .eo-btn{font-size:11px;padding:4px 8px}.eo-pool-detail{font:inherit;font-size:11px;background:none;border:0;color:#D97757;cursor:pointer;padding:0}
.eo-pool-empty{padding:28px;text-align:center;font-size:12px;color:#64748b}.eo-pool-note{font-size:10.5px;color:#8a94a5;margin-top:10px}
@container(max-width:620px){.eo-pool-row{grid-template-columns:16px minmax(0,1fr)}.eo-pool-side{grid-column:2;flex-direction:row;align-items:center;flex-wrap:wrap}.eo-pool-row-actions{margin-left:auto}.eo-stat{padding:12px}.eo-stat-number{font-size:28px}.eo-pool-tabs{gap:14px}}

/* 卡片 */
.eo-card{background:#fff;border:1px solid var(--eo-line);border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,.05),0 10px 26px rgba(16,24,40,.05)}
.eo-pad{padding:13px 15px}
.eo-card h3{margin:0 0 9px;font-size:12.3px;font-weight:650;color:#2C2A27;display:flex;align-items:center;gap:8px}
.eo-grid2{display:grid;grid-template-columns:1.05fr .95fr;gap:13px}
.eo-row{display:grid;grid-template-columns:88px 1fr;gap:10px;padding:6px 0;border-bottom:1px dashed #eef0f3;font-size:12.5px}
.eo-row:last-child{border-bottom:0}
.eo-row .k{color:#6E6A60;font-size:12.1px}
.eo-recruitment{container-type:inline-size}
.eo-artifact-switcher{min-width:0}
.eo-artifact-tabs{display:flex;gap:4px;padding:5px 10px;border-bottom:1px solid #E9E9E9}
.eo-artifact-tab{appearance:none;border:0;background:none;padding:3px 8px;border-radius:5px;color:#6E6A60;font:inherit;font-size:11.5px;font-weight:600;line-height:1.45;cursor:pointer}
.eo-artifact-tab[aria-selected="true"]{color:var(--eo-ink);border-bottom-color:transparent;background:var(--eo-selected)}
.eo-artifact-tab:focus-visible{outline:2px solid var(--eo-accent);outline-offset:2px;border-radius:3px}
.eo-artifact-panel[hidden]{display:none}
.eo-artifact-panel > .eo-artifact-card{border:0;border-radius:0;background:transparent;box-shadow:none;min-width:0}
.eo-artifact-panel .eo-artifact-head > .eo-tag{margin:0}
.eo-recruitment .eo-fields{margin:0}
.eo-artifact-card{display:flex;flex-direction:column}
.eo-profile-section-title{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:4px 8px;font-size:16px;line-height:1.4;font-weight:700;color:var(--eo-ink)}
.eo-profile-section-title span{font-size:10px;color:#6E6A60;font-weight:400}
.eo-profile-section-title.semantic{border-top:1px solid var(--eo-line);padding-top:12px;margin-top:8px}
.eo-profile-help{font-size:10.5px;color:#788293;margin:4px 0 10px}
.eo-criteria-group{margin-bottom:10px}
.eo-criteria-group h4{font-size:12px;line-height:1.5;font-weight:600;color:#5c626b;margin:0 0 4px}
.eo-criteria-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}
.eo-criterion{min-width:0;border-bottom:1px dashed #e8ecf2;padding:7px 0}
.eo-criterion-label{font-size:11px;color:#647084;display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-bottom:3px}
.eo-criterion .eo-field-value{font-size:12px;line-height:1.6}
.eo-criterion-rule{border-radius:4px;padding:0 4px;font-size:9px;line-height:16px}
.eo-criterion-rule.required{color:#275ca4;background:#eaf2ff}.eo-criterion-rule.preferred{color:#697a50;background:#eff4e9}
.eo-criterion .eo-empty-field{color:#a2a9b4}
.eo-criterion-options{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
.eo-criterion-options select{box-sizing:border-box;max-width:100%;font:inherit;font-size:10px;color:#536174;border:1px solid #d8e0eb;border-radius:4px;background:white;padding:3px}
.eo-criterion.semantic{padding:9px 0}
.eo-profile-legacy{font-size:11px;color:#788293;margin-top:12px}
.eo-profile-legacy summary{cursor:pointer}.eo-profile-legacy p{white-space:pre-wrap}
.eo-profile-criteria .eo-artifact-actions{position:sticky;bottom:0;background:white;padding-bottom:6px;box-shadow:0 -8px 10px white}
.eo-profile-criteria .eo-field-editor{font-size:12px}
.eo-artifact-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;flex-wrap:wrap}
.eo-artifact-head h3{margin:0}
.eo-artifact-head-inline{margin-bottom:7px}
.eo-artifact-head-inline .eo-profile-section-title{font-size:18px;font-weight:750;line-height:1.3;margin:0}
.eo-artifact-head-inline .eo-profile-section-title span{font-size:10.5px;font-weight:400}
.eo-artifact-head .eo-btn{font-size:11px;padding:4px 8px;flex-shrink:0}
.eo-editable-row{cursor:text}
.eo-field-value{display:block;text-align:left;width:100%;font:inherit;color:inherit;line-height:inherit;border:0;background:transparent;padding:2px 4px;margin:-2px -4px;border-radius:4px;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text}
.eo-editable-row:hover .eo-field-value{background:#f2f6ff}
.eo-field-value:focus-visible{outline:2px solid var(--eo-accent);outline-offset:2px}
.eo-field-editor{box-sizing:border-box;width:100%;min-width:0;display:block;font:inherit;color:inherit;line-height:1.65;border:1px solid #93b4f5;border-radius:6px;background:#fff;padding:6px 8px;resize:vertical;max-height:350px;outline-color:#D97757}
.eo-artifact-actions{margin-top:auto;padding-top:14px;display:flex;align-items:center;justify-content:flex-end;gap:8px}
.eo-artifact-actions span{margin-right:auto;font-size:11px;color:#8a6b31}
.eo-artifact-actions .eo-btn:disabled,.eo-artifact-head .eo-btn:disabled{opacity:.45;cursor:not-allowed}
.eo-upload{margin-bottom:10px;padding:8px 12px;box-shadow:0 1px 2px rgba(16,24,40,.03)}
.eo-upload-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.eo-upload-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.eo-upload-actions .eo-btn:disabled{background:#edf0f5;border-color:#E9E9E9;color:#a1a8b4;cursor:not-allowed;box-shadow:none}
.eo-upload-head h3{margin:0;white-space:nowrap}
.eo-upload-info{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.eo-upload .eo-btn{padding:4px 9px;font-size:11.5px}
.eo-upload-files summary{cursor:pointer;font-size:11.5px;color:#D97757;margin-top:7px}
.eo-upload-note{color:#6E6A60;font-size:11.5px}
.eo-upload-list{list-style:none;margin:10px 0 0;padding:0}
.eo-upload-list li{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid #eef0f3}
.eo-upload-name{min-width:0;flex:1;overflow-wrap:anywhere}
.eo-upload-size{color:#6E6A60;font-size:11px;white-space:nowrap}
.eo-upload-error{color:#b45309;font-size:12px;margin-top:8px;white-space:pre-line}
.eo-recruitment .eo-row{grid-template-columns:76px minmax(0,1fr)}
.eo-recruitment .eo-row dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
.eo-recruitment .eo-profile-fields .eo-row{grid-template-columns:minmax(0,1fr);gap:3px;padding:8px 0}
.eo-recruitment .eo-empty-field{color:#6E6A60}
.eo-recruitment .eo-evidence{margin-top:13px}
.eo-evidence summary{cursor:pointer;font-size:12.3px;font-weight:650;color:#2C2A27}
.eo-evidence summary .eo-tag{margin-left:7px}
.eo-recruitment .eo-raw{font-size:12.5px;line-height:1.82;color:#2C2A27;max-height:330px;overflow:auto}
.eo-recruitment .eo-raw mark{background:#fef3c7;padding:1px 2px;border-radius:3px}
.eo-recruitment .eo-raw p:last-child{margin-bottom:0}

.eo-kb-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:8px}
.eo-kb-toolbar h3{margin:0;overflow-wrap:anywhere}
.eo-kb-toolbar input{width:190px;max-width:100%;border:1px solid var(--eo-line);border-radius:7px;padding:6px 9px;font:inherit}
.eo-kb-docs{margin-top:10px}
.eo-kb-doc{width:100%;display:flex;align-items:center;gap:10px;text-align:left;border:1px solid transparent;border-top-color:#eef0f3;background:transparent;border-radius:7px;padding:11px 8px;cursor:pointer;font:inherit;color:inherit}
.eo-kb-doc:hover,.eo-kb-doc.on{background:#f3f7ff;border-color:#cdddf9}
.eo-kb-file-icon{font-size:9px;color:#D97757;background:#eff5ff;border:1px solid #dbe7fb;border-radius:5px;padding:8px 4px;min-width:26px;text-align:center}
.eo-kb-file-name{flex:1;min-width:0;overflow-wrap:anywhere}
.eo-kb-file-name b{font-size:12px;font-weight:550;display:block}
.eo-kb-file-name small{display:block;color:#91888A;font-size:11px;margin-top:3px}
.eo-kb-doc>.eo-tag{white-space:nowrap}
.eo-kb-preview{margin-top:12px}
.eo-kb-quotes{font-size:12.5px;line-height:1.8;color:#2C2A27}
.eo-kb-quotes small{display:block;color:#91888A;font-size:11px}
.eo-kb-scope{padding:9px 13px;border-bottom:1px solid #eef0f3}
.eo-kb-scope label{display:grid;gap:5px;font-size:11px;color:#6E6A60}
.eo-kb-scope select{width:100%;min-width:0;border:1px solid var(--eo-line);border-radius:6px;padding:6px;background:#f9fafb;font-size:11.5px;color:#2C2A27}
.eo-kb-welcome h3{font-size:14px;margin:7px 0}
.eo-kb-welcome p{font-size:12px;color:#6E6A60;line-height:1.8}
.eo-kb-welcome small{font-size:11px;color:#91888A}
.eo-kb-crumbs{display:flex;align-items:center;gap:6px;min-width:0;font-size:12.5px}
.eo-crumb{border:0;background:transparent;padding:2px 5px;border-radius:5px;color:#6E6A60;font:inherit;font-size:12px;cursor:pointer}
.eo-crumb:hover{background:var(--eo-hover);color:var(--eo-ink)}
.eo-crumb.on{color:var(--eo-ink);font-weight:600}
.eo-crumb-sep{color:#B7B2A9}
.eo-kb-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.eo-kb-nav{display:flex;align-items:center;gap:10px;padding:9px 12px;background:#fff;border:1px solid var(--eo-line);border-radius:12px;margin-bottom:14px}
.eo-kb-nav .eo-kb-toolbar{flex:1;margin-bottom:0}
.eo-kb-content{padding:0 2px}
.eo-kb-move{border:1px solid var(--eo-line);border-radius:6px;padding:4px 6px;font:inherit;font-size:11.5px;background:#fff;color:var(--eo-ink)}
.eo-kb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px 4px;margin-top:8px}
.eo-kb-cell{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 6px 9px;border:1px solid transparent;border-radius:10px;cursor:pointer;text-align:center;user-select:none}
.eo-kb-cell:hover{background:var(--eo-hover)}
.eo-kb-cell.on{background:rgba(217,119,87,.10);border-color:rgba(217,119,87,.28)}
.eo-kb-cell:focus-visible{outline:2px solid var(--eo-accent);outline-offset:1px}
.eo-kb-folder-icon{position:relative;width:58px;height:44px;border-radius:6px;background:linear-gradient(180deg,#93d4f8,#4ea9e2);box-shadow:inset 0 -12px 16px rgba(255,255,255,.16),0 1px 2px rgba(20,20,19,.12)}
.eo-kb-folder-icon:before{content:"";position:absolute;left:0;top:-6px;width:26px;height:10px;border-radius:5px 5px 0 0;background:#a6dcf9}
.eo-kb-file-tile{position:relative;width:44px;height:56px;border-radius:5px;background:#fff;border:1px solid #E1E0DB;box-shadow:0 1px 2px rgba(20,20,19,.08);display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px}
.eo-kb-file-tile em{font-style:normal;font-size:8px;font-weight:700;letter-spacing:.03em;color:#8A857C}
.eo-kb-file-tile.pdf{background:#FFF7F5;border-color:#F2CEC7}.eo-kb-file-tile.pdf em{color:#C0392B}
.eo-kb-file-tile.doc{background:#F5F8FF;border-color:#D6E2F6}.eo-kb-file-tile.doc em{color:#2E6BC4}
.eo-kb-file-tile.sheet{background:#F3FAF4;border-color:#CFE8D3}.eo-kb-file-tile.sheet em{color:#1F8A44}
.eo-kb-file-tile.slides{background:#FFF8F1;border-color:#F3DFC7}.eo-kb-file-tile.slides em{color:#B4651A}
.eo-kb-file-tile.code{background:#F7F5FF;border-color:#DED6F5}.eo-kb-file-tile.code em{color:#6B4BC4}
.eo-kb-file-tile.image{background:#F6F6F4}.eo-kb-file-tile.image em{color:#6E6A60}
.eo-kb-name{font-size:11.5px;line-height:1.4;color:var(--eo-ink);max-width:100%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.eo-kb-cell-sub{font-size:10px;color:#91888A;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eo-kb-cell-tools{position:absolute;top:4px;right:4px;display:flex;gap:2px;opacity:0;transition:opacity .12s}
.eo-kb-cell:hover .eo-kb-cell-tools,.eo-kb-cell:focus-within .eo-kb-cell-tools{opacity:1}
.eo-kb-tool{border:0;background:rgba(255,255,255,.94);border-radius:5px;width:18px;height:18px;line-height:1;font-size:10px;color:#6E6A60;cursor:pointer;padding:0;box-shadow:0 1px 2px rgba(20,20,19,.12)}
.eo-kb-tool:hover{background:#141413;color:#fff}
.eo-kb-rename{width:92px;font:inherit;font-size:11.5px;text-align:center;border:1px solid var(--eo-accent);border-radius:5px;padding:2px 4px;background:#fff;color:var(--eo-ink)}
.eo-kb-root-drop{margin-top:10px;border:1px dashed var(--eo-line);border-radius:8px;padding:10px;text-align:center;font-size:11.5px;color:#91888A}
.eo-kb-citation{margin-top:10px;border-left:2px solid #c7d7fe;padding-left:9px}
.eo-kb-citation blockquote{margin:0;font-size:12px;line-height:1.7}
.eo-kb-source{font-size:11px;line-height:1.6;text-align:left;color:#D97757;border:0;background:transparent;padding:5px 0;cursor:pointer;overflow-wrap:anywhere}
.eo-kb-source:disabled,.eo-send:disabled{opacity:.45;cursor:default}
.eo-knowledge .eo-upload{container-type:inline-size}
.eo-library{container-type:inline-size}
.eo-library-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
.eo-library-toolbar h3{margin:0;font-size:14px}
.eo-library-toolbar p{font-size:11.5px;color:#6E6A60;margin:5px 0 0;line-height:1.7}
.eo-library-toolbar>.eo-tag{white-space:nowrap}
.eo-library-filters{display:flex;gap:8px;flex-wrap:wrap}
.eo-library-filters input,.eo-library-filters select{min-width:0;border:1px solid #e0e5ed;background:#fff;border-radius:7px;padding:7px 9px;font:12px/1.5 inherit;color:#2C2A27}
.eo-library-filters input{flex:1;min-width:150px}
.eo-library-count{font-size:11px;color:#91888A;margin:10px 0}
.eo-library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.eo-library-card{display:block;text-align:left;padding:12px;color:inherit;font:inherit;cursor:pointer;box-shadow:0 1px 2px #10182808}
.eo-library-card:hover,.eo-library-card.on{border-color:#9bbdf7;background:#f8fbff}
.eo-library-card-head{display:flex;align-items:center;gap:8px}
.eo-library-card-head b{font-size:13px}
.eo-library-card-head>.eo-tag{margin-left:auto;white-space:nowrap}
.eo-library-basics{font-size:11.5px;color:#6E6A60;margin:9px 0}
.eo-library-projects{display:flex;gap:4px;flex-wrap:wrap;font-size:11px;color:#6E6A60;overflow-wrap:anywhere}
.eo-library-projects span{background:#F1F1F0;border-radius:4px;padding:3px 6px}
.eo-library-card-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #eef0f3;margin-top:10px;padding-top:8px;font-size:10px;color:#91888A}
.eo-library-state{border-radius:4px;padding:2px 6px;white-space:nowrap}
.eo-library-state.A{color:#047857;background:#ecfdf5}.eo-library-state.B{color:#b45309;background:#fffbeb}.eo-library-state.C{color:#b91c1c;background:#fef2f2}
.eo-library-detail h3{font-size:13px;margin:10px 0}.eo-library-detail small{font-size:10px;color:#91888A}
.eo-library-detail dd{margin:0}.eo-library-detail dl{margin:12px 0 20px}
.eo-library-history{margin-bottom:8px;font-size:12px;overflow-wrap:anywhere}
.eo-library-history p,.eo-library-empty p{color:#6E6A60;font-size:11.5px}
@container(max-width:480px){.eo-library-grid{grid-template-columns:minmax(0,1fr)}}
/* 看板 */
.eo-filters{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:11px}
.eo-chip{border:1px solid var(--eo-line);background:#fff;border-radius:999px;padding:3px 10px;font-size:11.6px;color:#6E6A60;cursor:pointer}
.eo-chip.on{background:#F1F1F0;border-color:#c7d7fe;color:#D97757}
.eo-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start}
.eo-col{border:1px solid var(--eo-line);border-radius:12px;padding:8px;min-height:360px;background:#f2f4f7}
.eo-col.a{background:#ecfdf5;border-color:#d7f0e4}
.eo-col.b{background:#fffbeb;border-color:#fbe8c4}
.eo-colhead{display:flex;align-items:center;gap:7px;padding:3px 4px 8px;font-size:12.3px;font-weight:650}
.eo-coldot{width:7px;height:7px;border-radius:50%;background:#91888A}
.eo-col.a .eo-coldot{background:#059669}.eo-col.b .eo-coldot{background:#f59e0b}
.eo-cnt{color:#6E6A60;font-weight:500}
.eo-expert{background:#fff;border:1px solid var(--eo-line);border-radius:9px;padding:8px 10px;margin-bottom:7px;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}
.eo-expert:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(16,24,40,.08);border-color:#d3d9e2}
.eo-exhead{display:flex;align-items:center;gap:7px}
.eo-exname{font-weight:620;font-size:12.6px}
.eo-score{margin-left:auto;font-size:11.3px;font-weight:700;color:#B4623E;background:#F1F1F0;padding:1px 6px;border-radius:5px}
.eo-expert.excluded .eo-score{color:#6E6A60;background:#F1F1F0}
.eo-exmeta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;color:#6E6A60;font-size:10.8px;margin-top:3px}
.eo-src{font-size:10px;padding:1px 5px;border-radius:4px;background:#eef2ff;color:#4338ca}
.eo-src.fs{background:#ecfdf5;color:#047857}.eo-src.man{background:#fef3c7;color:#92400e}
.eo-why{margin-top:4px;font-size:11.2px;color:#6E6A60;line-height:1.5}
.eo-why.gap{color:#b45309}
/* Native DSH conversation: only container sizing, no host CSS class overrides. */

.eo-project-layout{grid-template-columns:minmax(0,calc(100% - var(--eo-panel-width))) minmax(0,var(--eo-panel-width));background:var(--eo-page);overflow:hidden;transition:grid-template-columns .28s cubic-bezier(.2,.8,.2,1)}
.eo-project-layout>.eo-agent{border:0;background:transparent;width:100%;max-width:880px;margin:0 auto;padding:0 20px 14px;overflow:hidden;box-sizing:border-box}
.eo-project-layout.panel-open>.eo-agent{padding:0 12px 10px}
.eo-project-layout .eo-ahead,.eo-project-layout .eo-chat-context{display:none}
.eo-business-panel{min-width:0;min-height:0;display:flex;flex-direction:column;position:relative;background:var(--eo-page);border-left:1px solid #e2e5eb;opacity:0;visibility:hidden;transform:translateX(24px);transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s,visibility .28s;box-shadow:-5px 0 18px #18253b05}
.panel-open>.eo-business-panel{opacity:1;visibility:visible;transform:translateX(0)}
.eo-panel-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border-bottom:1px solid var(--eo-line);flex-shrink:0;white-space:nowrap}
.eo-panel-header h2{font-size:13px;font-weight:600;margin:0;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.eo-panel-close{display:grid;place-items:center;border:0;border-radius:6px;background:transparent;color:#79818e;font-size:22px;width:26px;height:26px;cursor:pointer;line-height:1}
.eo-panel-close:hover{background:#f0f2f5;color:#1f2937}
.eo-panel-close:focus-visible,.eo-panel-resizer:focus-visible{outline:2px solid var(--eo-accent);outline-offset:-2px}
.eo-panel-head-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}.eo-panel-head-actions .eo-btn{font-size:11px;padding:4px 9px;line-height:1.5}.eo-panel-head-actions .eo-btn.primary{padding:4px 11px}
.eo-panel-content{flex:1;min-height:0;padding:12px}
.eo-panel-resizer{position:absolute;left:-4px;top:0;bottom:0;width:8px;z-index:10;cursor:col-resize;touch-action:none}
.eo-panel-resizer:hover,.eo-panel-resizer:focus-visible{background:#D9775733}
.eo-project-layout.is-resizing{transition:none;user-select:none;cursor:col-resize}
.eo-project-layout.is-resizing>.eo-business-panel{transition:none}
@media(prefers-reduced-motion:reduce){.eo-project-layout,.eo-business-panel{transition:none}}
.eo-project-layout [data-conversation-scroll]:has(.eo-home-welcome){position:relative}
.eo-home-welcome{position:absolute;top:0;left:0;right:0;height:max(0px,calc(100% - var(--dsh-composer-height,180px)));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;padding:16px;text-align:center;box-sizing:border-box;pointer-events:none}
.eo-home-welcome h2{font-size:clamp(24px,2.3vw,32px);font-weight:650;line-height:1.4;margin:0 0 14px;color:#1f2937}
.eo-home-welcome p{font-size:16px;line-height:1.6;color:#6E6A60;margin:0}
.eo-home-welcome .eo-home-cards{justify-content:center;width:100%;max-width:268px;gap:12px;margin:24px auto 0;pointer-events:auto}
.eo-home-welcome .eo-home-card{flex:1 1 0;min-width:0;min-height:44px;box-sizing:border-box;justify-content:center;text-align:center;padding:9px 12px;border-radius:18px}
.eo-home-welcome .eo-home-card strong{font-size:13px}

.eo-home-dock{padding:0 var(--dsh-composer-side-clearance,16px)}
.eo-home-cards{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:8px;width:100%;max-width:var(--dsh-composer-card-max-width,100%);margin:0 auto;padding:0 0 4px;flex-shrink:0}
.eo-home-card{display:inline-flex;align-items:center;justify-content:center;width:112px;min-width:112px;min-height:34px;box-sizing:border-box;gap:7px;text-align:left;border:1px solid #e2e5e9;border-radius:16px;padding:7px 12px;background:rgba(255,255,255,.88);color:#596273;cursor:pointer;transition:border-color .15s,background .15s}
.eo-home-card[aria-pressed="true"]{background:var(--eo-selected);border-color:#d8d7d2;color:var(--eo-ink)}
.eo-home-card[aria-pressed="true"] .eo-home-card-icon{color:inherit}
.eo-home-card:hover{border-color:#d8d7d2;background:var(--eo-hover)}
.eo-home-card:focus-visible{outline:2px solid var(--eo-accent);outline-offset:2px}
.eo-home-card-icon{color:#7c8799;font-size:14px;line-height:1;flex-shrink:0}
.eo-home-card strong{display:block;font-size:12px;font-weight:500}
.eo-home-card small{display:none}
.eo-home-card-arrow{display:none}
@media(max-height:650px){.eo-home-card{padding:10px 12px}.eo-project-layout>.eo-agent{padding-bottom:10px}}

.eo-native-chat{flex:1;min-height:0;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.eo-native-chat > div{min-height:0;flex:1}
.eo-native-chat [data-composer-seat]{margin-top:auto;flex-shrink:0;bottom:0;--dsh-composer-text-max-height:180px}
.eo-project-layout .eo-native-chat [data-composer-seat]{padding-top:28px;background:linear-gradient(180deg,rgba(250,250,249,0) 0px,rgba(250,250,249,.85) 24px,var(--eo-page) 54px);}
.eo-chat-context{padding:6px 13px;border-bottom:1px solid #eef0f3;color:#6E6A60;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eo-chat-state{padding:20px 14px;font-size:12px;color:#6E6A60;overflow-wrap:anywhere}
.eo-agent{min-width:0}
/* Agent */
.eo-agent{border-left:1px solid var(--eo-line);background:#fff;display:flex;flex-direction:column;min-height:0}
.eo-ahead{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid #eef0f3;font-size:12.5px;font-weight:620}
.eo-ahead .st{margin-left:auto;font-size:10.8px;color:#059669;display:flex;align-items:center;gap:5px;font-weight:500}
.eo-ahead .st i{width:6px;height:6px;border-radius:50%;background:#059669;display:block}
.eo-thread{flex:1;overflow:auto;padding:13px;display:flex;flex-direction:column;gap:11px}
.eo-msg{font-size:12.4px;line-height:1.62}
.eo-who{font-size:10.8px;color:#91888A;margin-bottom:3px}
.eo-bubble{background:#f5f6f8;border-radius:10px;padding:8px 10px;white-space:pre-wrap}
.eo-msg.you .eo-bubble{background:#F1F1F0}
.eo-run{border:1px solid var(--eo-line);border-radius:10px;overflow:hidden}
.eo-run .rt{display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--eo-page);border-bottom:1px solid #eef0f3;font-size:11.6px;color:#2C2A27}
.eo-run code{font:11.4px ui-monospace,SFMono-Regular,Menlo,monospace;background:#eef1f5;padding:1px 5px;border-radius:4px}
.eo-run .rb{padding:7px 10px;color:#6E6A60;font-size:11.3px}
.eo-run .rb b{color:#141413}
.eo-ok{color:#059669;font-weight:700}
.eo-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 13px 9px}
.eo-quick button{border:1px solid var(--eo-line);background:#fff;border-radius:999px;padding:4px 9px;font-size:11.2px;color:#6E6A60;cursor:pointer}
.eo-quick button:hover{border-color:#c7d7fe;color:#D97757;background:#F1F1F0}
.eo-composer{border-top:1px solid #eef0f3;padding:9px 11px}
.eo-box{border:1px solid var(--eo-line);border-radius:10px;padding:7px 9px;display:flex;gap:8px;align-items:flex-end}
.eo-box textarea{border:0;outline:0;resize:none;flex:1;font:12.4px/1.6 inherit;height:36px;background:transparent;color:inherit}
.eo-send{border:0;background:#D97757;color:#fff;border-radius:7px;width:27px;height:27px;display:grid;place-items:center;cursor:pointer}
/* 抽屉 */
.eo-dw{position:absolute;inset:0;background:rgba(17,24,39,.26)}
.eo-drawer{position:absolute;right:0;top:0;bottom:0;width:420px;background:#fff;box-shadow:-10px 0 32px rgba(16,24,40,.16);padding:16px 18px;overflow:auto}
.eo-drawer h2{font-size:15.5px;margin:0 0 2px}
.eo-x{position:absolute;right:12px;top:10px;border:0;background:#F1F1F0;width:26px;height:26px;border-radius:7px;color:#6E6A60;cursor:pointer}
.eo-dim{margin:8px 0}
.eo-dim .r{display:flex;justify-content:space-between;font-size:12px;color:#2C2A27}
.eo-bar{height:6px;background:#eef0f3;border-radius:99px;overflow:hidden;margin-top:4px}
.eo-bar i{display:block;height:100%;background:linear-gradient(90deg,#93b4fd,#D97757)}
.eo-dwacts{display:flex;gap:7px;margin-top:15px}
.eo-btn.g{background:#ecfdf5;border-color:#a7f3d0;color:#047857}
.eo-btn.y{background:#fffbeb;border-color:#fde68a;color:#b45309}
.eo-btn.r{background:#fef2f2;border-color:#fecaca;color:#b91c1c}
.eo-toast{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:#111827;color:#fff;font-size:12.2px;padding:7px 14px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
/* Warm neutral theme is scoped to this workspace, including native chat descendants. */
.eo-native-chat{--dsw-alias-bg-base:var(--eo-page);--dsw-alias-bg-module-platform:var(--eo-page);--dsw-specific-input-major:#fff;--dsw-alias-state-business-primary:var(--eo-accent);--dsw-alias-state-business-tertiary:var(--eo-selected);--dsw-alias-button-info-fill:var(--eo-accent);--dsw-alias-button-info-hover:#C4603C;--dsw-focus-ring-color:var(--eo-accent);--dsw-alias-label-primary-bluish:var(--eo-ink)}
.eo-head,.eo-panel-header{background:var(--eo-page)}
.eo-home-card{color:#68635c;border-color:var(--eo-line)}
.eo-home-welcome h2{color:var(--eo-ink)}
.eo-home-welcome p{color:var(--eo-muted)}
.eo-card{box-shadow:0 1px 3px #14141306}


.eo-role-list-head,.eo-role-detail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.eo-role-list-head h3,.eo-role-detail-head h3{margin:0;color:var(--eo-ink);font-size:16px}
.eo-role-list-head p,.eo-role-detail-head span{margin:5px 0 0;color:#868079;font-size:11px;line-height:1.6}
.eo-role-detail-head>div{flex:1;min-width:0}.eo-role-detail-head h3{overflow-wrap:anywhere}
.eo-role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px}
.eo-role-card{display:flex;flex-direction:column;position:relative;overflow:hidden;transition:border-color .15s,box-shadow .15s}
.eo-role-card:hover{border-color:var(--eo-accent);box-shadow:0 3px 12px #24242008}
.eo-role-open{display:flex;flex:1;flex-direction:column;width:100%;text-align:left;background:none;border:0;color:inherit;font:inherit;cursor:pointer;padding:18px;min-height:190px}
.eo-role-open:focus-visible{outline:2px solid var(--eo-accent);outline-offset:-3px}
.eo-role-card-top{display:flex;align-items:center;gap:10px;font-size:11px;color:#91888A;margin-bottom:12px;padding-right:40px}
.eo-role-open h3{font-size:15px;line-height:1.5;margin:0 0 7px;color:var(--eo-ink)}
.eo-role-open p{font-size:12px;line-height:1.6;color:#77736C;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.eo-role-card-meta{display:flex;gap:14px;font-size:11px;color:#868079;margin-top:auto;padding-bottom:12px}
.eo-role-card-bottom{display:flex;justify-content:space-between;gap:8px;width:100%;border-top:1px solid var(--eo-line);padding-top:12px;font-size:11px;color:#77736C}
.eo-role-card-bottom>span:last-child{color:var(--eo-accent)}
.eo-role-confirm{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:10px 18px;border-top:1px solid var(--eo-line)}
.eo-role-confirm>span{margin-right:auto;font-size:11px;color:#77736C}.eo-role-confirm>span.confirmed{color:#078566}
.eo-role-confirm .eo-btn{font-size:12px;padding:6px 10px}.eo-role-confirm .eo-btn.primary:disabled{background:#F0F0EE;border-color:var(--eo-line);color:#9A9995;opacity:1;cursor:not-allowed}.eo-role-confirm-detail{margin-bottom:12px;background:white;border:1px solid var(--eo-line);border-radius:10px}
.eo-role-delete{position:absolute;right:14px;top:18px;background:none;border:0;color:#868079;font:inherit;font-size:11px;cursor:pointer;padding:3px}
.eo-role-delete:hover{color:#B34337}.eo-role-note{font-size:10.5px;color:#91888A;line-height:1.6;margin:12px 0 0}
.eo-role-add{display:flex;gap:8px;align-items:flex-end;margin-bottom:12px}.eo-role-add label{display:grid;gap:6px;flex:1;font-size:12px}
.eo-role-add input{min-width:0;border:1px solid var(--eo-line);border-radius:7px;padding:8px;font:inherit;background:white}
.eo-role-empty{text-align:center;color:#868079}.eo-pool-role{font-size:11px!important;color:#847362!important;overflow-wrap:anywhere}
.eo-match-role-card .eo-role-open{min-height:174px}
.eo-match-role-card .eo-role-card-top{justify-content:space-between;padding-right:0}
.eo-match-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%;gap:8px;margin:8px 0 14px;font-size:11px}
.eo-match-metrics span{display:grid;gap:5px;align-content:start;padding:10px 8px;border-radius:8px;background:#F2F2F0;color:#67645F}
.eo-match-metrics span:nth-child(2){background:#FFF4E5;color:#925C21}
.eo-match-metrics span:nth-child(3){background:#EAF5EF;color:#387559}
.eo-match-metrics strong{font-size:24px;line-height:1.2;color:inherit;font-weight:600}
.eo-match-unread{color:#B34337;background:#FFF1F0;border-radius:5px;padding:2px 6px}
.eo-match-detail-head{flex-wrap:wrap;gap:8px;margin-bottom:10px}
.eo-match-detail-head>.eo-match-heading{flex:1 1 180px}
.eo-match-detail-head h3{font-size:14px;line-height:1.45}
.eo-match-detail-head>.eo-match-actions{display:flex;flex:0 0 auto;justify-content:flex-end;gap:6px;margin-left:auto}
.eo-match-detail-head .eo-btn{white-space:nowrap}
.eo-match-archive{margin-top:20px;border-top:1px solid var(--eo-line);padding-top:14px}
.eo-match-archive summary{cursor:pointer;color:#868079;font-size:12px;margin-bottom:12px}
.eo-match-history-note{padding:12px;background:#F4F4F2;border-radius:8px;font-size:12px;line-height:1.7;color:#77736C}
.eo-pool-row.history{grid-template-columns:minmax(0,1fr) auto}
`

  // ---------------- mock 数据 ----------------
  const DEMANDS = [
    { id: "d1", title: "字节 · 多语言语音标注", org: "字节跳动", count: 40, state: "匹配中", dot: "" },
    { id: "d2", title: "美团 · 客服对话质检", org: "美团", count: 25, state: "待匹配", dot: "warn" },
    { id: "d3", title: "某车企 · 座舱语义标注", org: "某车企", count: 30, state: "草稿", dot: "draft" },
    { id: "d4", title: "蚂蚁 · 金融文档抽取", org: "蚂蚁集团", count: 12, state: "已完成", dot: "" },
  ]

  const PROJECT_META_KEY = "dsh-expert-ops:project-meta:v1"
  function loadProjects() {
    let saved = {}
    try { saved = JSON.parse(localStorage.getItem(PROJECT_META_KEY) || "{}") || {} } catch (_) {}
    const custom = Object.entries(saved).filter(([id, value]) => id.startsWith("project-") && value && typeof value.title === "string")
      .map(([id, value]) => ({ id, title: value.title, count: 0, state: "草稿", dot: "draft", org: "" }))
    return [...DEMANDS, ...custom].map((d) => {
      const meta = saved[d.id] || {}
      return { ...d,
        title: typeof meta.title === "string" && meta.title.trim() ? meta.title.trim().slice(0, 80) : d.title,
        pinned: meta.pinned === true,
        ended: typeof meta.ended === "boolean" ? meta.ended : d.state === "已完成",
        deletedAt: Number.isFinite(meta.deletedAt) && meta.deletedAt > 0 ? meta.deletedAt : null,
      }
    })
  }
  function sortedProjects(projects) {
    return projects.filter((p) => !p.deletedAt).sort((a, b) => Number(b.pinned) - Number(a.pinned))
  }

  const PROFILE_SCHEMA = [
    { key: "domain", label: "所属领域", group: "专业与资质", type: "tags", op: "any_of" },
    { key: "certificates", label: "资质证书", group: "专业与资质", type: "tags", op: "any_of" },
    { key: "education", label: "最高学历", group: "教育背景", type: "education", op: "gte" },
    { key: "school", label: "最高学历学校", group: "教育背景", type: "tags", op: "any_of" },
    { key: "major", label: "最高学历专业", group: "教育背景", type: "tags", op: "any_of" },
    { key: "graduation", label: "毕业时间", group: "教育背景", type: "month", op: "lte" },
    { key: "employer", label: "工作单位", group: "任职与投入", type: "tags", op: "any_of" },
    { key: "position", label: "职位", group: "任职与投入", type: "tags", op: "any_of" },
    { key: "years", label: "工作年限", group: "任职与投入", type: "number", op: "gte", unit: "年" },
    { key: "hours", label: "工作时长", group: "任职与投入", type: "number", op: "gte", unit: "小时 / 周" },
    { key: "background", label: "专业背景", group: "经历与能力", type: "text", op: "semantic" },
    { key: "experience", label: "从业经验", group: "经历与能力", type: "text", op: "semantic" },
    { key: "abilities", label: "能力要求", group: "经历与能力", type: "text", op: "semantic" },
    { key: "special", label: "特殊经历", group: "经历与能力", type: "text", op: "semantic" },
  ]
  const PROFILE_FIELDS = PROFILE_SCHEMA.map((field) => field.label)
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

  const KB_META_KEY = "eo-kb-meta-v1"
  function loadKbMeta() {
    try {
      const raw = JSON.parse(localStorage.getItem(KB_META_KEY) || "{}") || {}
      return { folders: Array.isArray(raw.folders) ? raw.folders : [], docs: raw.docs && typeof raw.docs === "object" ? raw.docs : {}, hidden: Array.isArray(raw.hidden) ? raw.hidden : [] }
    } catch (_) { return { folders: [], docs: {}, hidden: [] } }
  }
  function persistKbMeta(meta) { try { localStorage.setItem(KB_META_KEY, JSON.stringify(meta)) } catch (_) { /* quota or private mode */ } }

  // ---------------- 极简 store ----------------
  const store = {
    open: false,
    tab: "home",
    demand: "d1",
    expandedDemand: "d1",
    nav: "project",
    knowledgeSelected: null,
    knowledgeMessages: [],
    knowledgeDraft: "",
    kbMeta: loadKbMeta(),
    kbFolderId: null,
    libraryQuery: "",
    librarySource: "all",
    libraryStatus: "all",
    librarySelected: null,
    drawer: null,
    toast: null,
    documents: {},
    artifactDrafts: {},
    artifactRevision: 0,
    featureRole: null,
    candidateReceipts: loadCandidateReceipts(),
    projects: loadProjects(),
    showEnded: false,
    // Existing candidates are demo data for the multilingual speech project; never imply real history.
    experts: EXPERTS.map((e, i) => ({ ...e, id: "demo-expert-" + String(i + 1).padStart(2, "0"), candidateProjectIds: ["d1"] })),
  }
  // A deleted default project must not leave the selected navigation on a hidden item after reload.
  if (!store.projects.some((p) => p.id === store.demand && !p.deletedAt)) {
    const visible = sortedProjects(store.projects)
    const initial = visible.find((p) => !p.ended) || visible[0]
    store.demand = initial?.id || null
    store.expandedDemand = initial?.id || null
    store.showEnded = !!initial?.ended
  }
  const listeners = new Set()
  const emit = () => { for (const fn of listeners) fn() }
  const set = (patch) => { Object.assign(store, patch); emit() }

  function updateProject(id, patch) {
    const projects = store.projects.map((p) => p.id === id ? { ...p, ...patch } : p)
    const remaining = sortedProjects(projects)
    const current = remaining.find((p) => p.id === store.demand)
    const next = current || remaining.find((p) => !p.ended) || remaining[0]
    set({ projects, demand: next?.id || null,
      expandedDemand: current ? store.expandedDemand : next?.id || null,
      showEnded: current ? store.showEnded : !!next?.ended, drawer: null })
    try { persistProjects(projects) }
    catch (_) { toast("当前浏览器无法保存项目设置；刷新后本次修改可能丢失。") }
  }

  function persistProjects(projects) {
    const metadata = Object.fromEntries(projects.map(({ id, title, pinned, ended, deletedAt }) =>
      [id, { title, pinned, ended, deletedAt }]))
    localStorage.setItem(PROJECT_META_KEY, JSON.stringify(metadata))
  }

  function createProject(title) {
    const project = { id: "project-" + crypto.randomUUID(), title: title.trim(), count: 0,
      org: "", state: "草稿", dot: "draft", pinned: false, ended: false, deletedAt: null }
    const projects = [...store.projects, project]
    // Persist the project before opening its conversation; failed storage must not create an orphan.
    persistProjects(projects)
    set({ projects, demand: project.id, expandedDemand: null, nav: "project", tab: "home", drawer: null })
    return project
  }

  // Native session bridge. Replace this mapping repository with the business DB later.
  const SESSION_MAP_KEY = "dsh-expert-ops:project-sessions:v1"
  const sessionRequests = new Map()
  function readSessionMap() {
    const raw = localStorage.getItem(SESSION_MAP_KEY)
    const map = raw ? JSON.parse(raw) : {}
    if (!map || typeof map !== "object" || Array.isArray(map)) throw new Error("项目会话绑定损坏，请恢复本地项目数据。")
    return map
  }
  function saveSessionLink(projectId, link) {
    const map = readSessionMap()
    map[projectId] = link
    localStorage.setItem(SESSION_MAP_KEY, JSON.stringify(map))
  }
  async function ensureProjectSession(sessions, project) {
    if (sessionRequests.has(project.id)) return sessionRequests.get(project.id)
    const operation = async () => {
      let link = readSessionMap()[project.id]
      if (link && (typeof link.sessionId !== "string" || !link.sessionId)) throw new Error("项目会话 ID 无效。")
      if (link?.ready) return link.sessionId
      if (!link) {
        link = { sessionId: crypto.randomUUID(), ready: false }
        saveSessionLink(project.id, link)
      }
      // On an interrupted create, first recover the reserved ID from the host catalog.
      await sessions.refresh()
      if (sessions.manager.getListSnapshot().state === "error") throw new Error("无法读取 DSH 会话列表，请恢复连接后重试。")
      let id = link.sessionId
      if (!sessions.list.getSnapshot().byId[id]) id = await sessions.create({ sessionId: id })
      saveSessionLink(project.id, { sessionId: id, ready: true })
      const ref = sessions.retain(id, { source: "expertOpsNaming" })
      try {
        const binding = await ref.ready
        if (binding.session.getSnapshot().openState === "open") await binding.session.rename("专家运营 · " + project.title)
      } catch (_) { /* A title failure must not discard a successfully persisted session. */ }
      finally { ref.release() }
      return id
    }
    const promise = (navigator.locks ? navigator.locks.request("expert-ops-session-bindings", operation) : operation())
    sessionRequests.set(project.id, promise)
    try { return await promise }
    finally { if (sessionRequests.get(project.id) === promise) sessionRequests.delete(project.id) }
  }

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
  function Workbench({ sessions, SessionProvider, renderSlot }) {
    const s = useStore()
    const active = sortedProjects(s.projects).find((d) => d.id === s.demand) || sortedProjects(s.projects)[0]
    const knowledge = s.nav === "knowledge"
    const library = s.nav === "experts"
    const home = s.nav === "project" && s.tab === "home"
    const projectMode = !knowledge && !library
    const panelOpen = projectMode && !!active && !home
    const [panelWidth, setPanelWidth] = useState(58)
    const [resizing, setResizing] = useState(false)
    const lastFeature = useRef("recruitment")
    if (s.tab === "recruitment" || s.tab === "p3") lastFeature.current = s.tab
    const feature = home ? lastFeature.current : s.tab
    const featureTitle = feature === "recruitment" ? "岗位要求" : "专家匹配"
    const bodyRef = useRef(null)
    const recruitment = recruitmentResult(active?.id)
    const projectExperts = s.experts.filter((e) => e.candidateProjectIds.includes(active?.id))

    const tabs = [
      ["recruitment", "岗位要求", null],
      ["p3", "专家匹配", s.experts.length],
    ]

    return n("div", { className: "eo-root" },
      n("div", { className: "eo-shell" },
        // 左栏
        n("aside", { className: "eo-left" },
          n("div", { className: "eo-brand" }, n("span", { className: "dot" }), "专家运营"),
          n("div", { className: "eo-nav" },
            [["knowledge", "知识库"], ["experts", "专家库"], ["settings", "设置"]].map(([id, label]) =>
              n("button", { key: id, className: s.nav === id ? "on" : "", onClick: () => set({ nav: id, drawer: null }) },
                n("span", { className: "ico" }, id === "knowledge" ? "▤" : id === "experts" ? "◎" : "⚙"), label))),
          n(ProjectList, { tabs }),
          n("div", { className: "eo-me" }, n("div", { className: "eo-avatar" }, "尚"), n("div", null, "尚楚哲", n("br"), n("span", { style: { fontSize: 10.5 } }, "专家运营")))),
        // 右栏
        n("main", { className: "eo-right" },
          n("header", { className: "eo-head" },
            n("div", { className: "eo-htop" },
              n("h1", null, projectMode && active
                ? n("button", { className: "eo-title-btn", type: "button", title: "打开项目业务面板",
                    onClick: () => openProjectSpace(active.id, lastFeature.current) }, active.title)
                : (knowledge ? "知识库" : library ? "专家库" : active?.title || "暂无项目")))),
          n("div", { ref: bodyRef, className: "eo-body" + (projectMode ? " eo-project-layout" + (panelOpen ? " panel-open" : "") + (resizing ? " is-resizing" : "") : ""),
            style: projectMode ? { "--eo-panel-width": panelOpen ? panelWidth + "%" : "0%" } : undefined },
            projectMode ? n(AgentPanel, { key: active?.id || "none", project: active, home: true, panelOpen, sessions, SessionProvider, renderSlot }) :
              n("div", { className: "eo-canvas" }, knowledge ? n(KnowledgeView) : n(ExpertLibraryView)),
            projectMode ? n("section", { className: "eo-business-panel", "aria-label": "项目业务面板", "aria-hidden": !panelOpen, inert: !panelOpen ? "" : undefined },
              n("div", { className: "eo-panel-resizer", role: "separator", "aria-label": "调整业务面板宽度", "aria-orientation": "vertical", "aria-valuemin": 38, "aria-valuemax": 70, "aria-valuenow": panelWidth, tabIndex: panelOpen ? 0 : -1,
                onPointerDown: (event) => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setResizing(true) },
                onPointerMove: (event) => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const rect = bodyRef.current?.getBoundingClientRect(); if (rect?.width) setPanelWidth(Math.max(38, Math.min(70, (rect.right - event.clientX) / rect.width * 100))) },
                onPointerUp: (event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); setResizing(false) },
                onLostPointerCapture: () => setResizing(false),
                onDoubleClick: () => setPanelWidth(58),
                onKeyDown: (event) => { if (!["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return; event.preventDefault(); setPanelWidth((width) => event.key === "Home" ? 58 : Math.max(38, Math.min(70, width + (event.key === "ArrowLeft" ? 2 : -2)))) } }),
              n("header", { className: "eo-panel-header" },
                n("h2", null, featureTitle),
                n("button", { className: "eo-panel-close", title: "关闭业务面板", "aria-label": "关闭业务面板", onClick: () => { openProjectSpace(active.id, "home"); bodyRef.current?.querySelector('.eo-home-card')?.focus() } }, "×")),
              n("div", { className: "eo-canvas eo-panel-content" },
                active ? n("div", { hidden: feature !== "recruitment" }, n(RecruitmentView, { key: active.id, demandId: active.id, result: recruitment })) : null,
                active ? n("div", { hidden: feature !== "p3" }, n(MatchingView, { key: active.id, projectId: active.id, experts: projectExperts })) : null)) :
              knowledge ? n(KnowledgeAgent) : n(ExpertLibraryPanel)),
          s.drawer ? n(Drawer, { expert: s.drawer }) : null,
          s.toast ? n("div", { className: "eo-toast" }, s.toast) : null)))
  }

  function ProjectList({ tabs }) {
    const s = useStore()
    const [menu, setMenu] = useState(null)
    const [dialog, setDialog] = useState(null)
    const menuRef = useRef(null)
    const trigger = useRef(null)
    const projects = sortedProjects(s.projects)
    const ongoing = projects.filter((p) => !p.ended)
    const ended = projects.filter((p) => p.ended)
    const lastDeleted = s.projects.filter((p) => p.deletedAt).sort((a, b) => b.deletedAt - a.deletedAt)[0]
    const target = s.projects.find((p) => p.id === menu?.id)
    function closeMenu(restoreFocus = false) {
      setMenu(null)
      if (restoreFocus) trigger.current?.focus()
    }
    function openMenu(event, project, keyboard = false) {
      event.preventDefault()
      trigger.current = event.currentTarget
      const rect = event.currentTarget.getBoundingClientRect()
      setMenu({ id: project.id,
        x: Math.max(8, Math.min(keyboard ? rect.left + 12 : event.clientX, window.innerWidth - 188)),
        y: Math.max(8, Math.min(keyboard ? rect.bottom : event.clientY, window.innerHeight - 176)) })
    }
    useEffect(() => {
      if (!menu) return
      menuRef.current?.querySelector('button')?.focus()
      const outside = (event) => { if (!menuRef.current?.contains(event.target)) closeMenu() }
      const dismiss = () => closeMenu()
      document.addEventListener('pointerdown', outside)
      window.addEventListener('resize', dismiss)
      document.addEventListener('scroll', dismiss, true)
      return () => {
        document.removeEventListener('pointerdown', outside)
        window.removeEventListener('resize', dismiss)
        document.removeEventListener('scroll', dismiss, true)
      }
    }, [menu])
    function menuAction(action) {
      if (!target) return
      closeMenu(true)
      if (action === 'rename' || action === 'delete') setDialog({ kind: action, project: target })
      else updateProject(target.id, action === 'pin' ? { pinned: !target.pinned } : { ended: !target.ended })
    }
    function row(d) {
      const expanded = s.expandedDemand === d.id
      return n("div", { key: d.id, className: "eo-project-item" + (expanded ? " expanded" : "") },
        n("button", {
          className: "eo-demand" + (d.id === s.demand ? " on" : ""),
          title: d.title,
          onContextMenu: (event) => openMenu(event, d),
          onKeyDown: (event) => {
            if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) openMenu(event, d, true)
          },
          onClick: () => openProjectSpace(d.id, "home"),
        }, n("b", null, d.title),
          n("span", null, n("i", { className: "eo-sdot " + (d.ended ? "draft" : d.dot) }),
            (d.pinned ? "置顶 · " : "") + (d.ended ? "已结束" : d.state) + " · " + d.count + " 人")),
        n("button", { className: "eo-demand-chevron", type: "button",
          "aria-expanded": expanded, "aria-controls": "eo-project-menu-" + d.id,
          title: expanded ? "收起功能" : "展开功能", "aria-label": (expanded ? "收起 " : "展开 ") + d.title + " 的功能",
          onClick: (event) => { event.stopPropagation(); set({ expandedDemand: expanded ? null : d.id }) },
          onKeyDown: (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault(); event.stopPropagation()
            set({ expandedDemand: expanded ? null : d.id })
          } }, "▸"),
        n("button", { className: "eo-project-more", "aria-label": d.title + "项目选项", title: "项目选项（也可右键）",
          onClick: (event) => openMenu(event, d, true) }, "⋯"),
        n("div", { id: "eo-project-menu-" + d.id, hidden: s.expandedDemand !== d.id },
          n("nav", { className: "eo-project-menu", "aria-label": d.title + "功能" },
            tabs.map(([id, label, cnt]) => n("button", {
              key: id, className: s.nav === "project" && s.demand === d.id && s.tab === id ? "on" : "",
              "aria-current": s.nav === "project" && s.demand === d.id && s.tab === id ? "page" : undefined,
              onClick: () => set({ nav: "project", demand: d.id, tab: id, expandedDemand: d.id, drawer: null }),
            }, label, cnt != null ? n("span", { className: "eo-badge" }, s.experts.filter((expert) => expert.candidateProjectIds.includes(d.id)).length) : null)))))
    }
    return n(React.Fragment, null,
      n("div", { className: "eo-sec" }, "进行中的项目", n("button", { className: "eo-btn", onClick: () => setDialog({ kind: "create", project: { id: "new", title: "" } }) }, "+ 新建")),
      n("div", { className: "eo-demands" }, ongoing.map(row),
        !ongoing.length ? n("p", { className: "eo-list-empty" }, "暂无进行中的项目") : null,
        n("button", { className: "eo-ended-toggle", "aria-expanded": s.showEnded, "aria-controls": "eo-ended-projects",
          onClick: () => set({ showEnded: !s.showEnded }) }, s.showEnded ? "▾ 已结束" : "▸ 已结束", n("span", { className: "eo-badge" }, ended.length)),
        n("div", { id: "eo-ended-projects", hidden: !s.showEnded }, ended.length ? ended.map(row) : n("p", { className: "eo-list-empty" }, "暂无已结束项目")),
        lastDeleted ? n("button", { className: "eo-undo-delete", onClick: () => updateProject(lastDeleted.id, { deletedAt: null }) }, "撤销删除：" + lastDeleted.title) : null),
      menu && target ? n("div", { className: "eo-context-menu", ref: menuRef, role: "menu", "aria-label": target.title + "项目选项",
        style: { left: menu.x, top: menu.y },
        onKeyDown: (event) => {
          const items = [...event.currentTarget.querySelectorAll('button')]
          const index = items.indexOf(document.activeElement)
          if (event.key === 'Escape') { event.preventDefault(); closeMenu(true) }
          else if (event.key === 'Tab') closeMenu()
          else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
            items[next]?.focus()
          }
        } },
        n("button", { role: "menuitem", onClick: () => menuAction('rename') }, "重命名"),
        n("button", { role: "menuitem", onClick: () => menuAction('pin') }, target.pinned ? "取消置顶" : "置顶"),
        n("button", { role: "menuitem", onClick: () => menuAction('end') }, target.ended ? "恢复进行中" : "标记为已结束"),
        n("button", { role: "menuitem", className: "danger", onClick: () => menuAction('delete') }, "删除")) : null,
      dialog ? n(ProjectDialog, { key: dialog.project.id + dialog.kind, ...dialog, onClose: () => { setDialog(null); trigger.current?.focus() } }) : null)
  }

  function ProjectDialog({ kind, project, onClose }) {
    const [name, setName] = useState(project.title)
    const [error, setError] = useState("")
    const ref = useRef(null)
    useEffect(() => {
      const first = ref.current?.querySelector('input, button')
      first?.focus()
      if (first?.tagName === 'INPUT') first.select()
    }, [])
    const deleting = kind === 'delete'
    function submit(event) {
      event.preventDefault()
      if (!deleting && !name.trim()) { setError("请输入项目名称。"); return }
      try {
        if (kind === "create") createProject(name)
        else updateProject(project.id, deleting ? { deletedAt: Date.now() } : { title: name.trim() })
        onClose()
      } catch (_) { setError("项目保存失败，请检查浏览器存储后重试。") }
    }
    return n("div", { className: "eo-project-dialog-backdrop", onClick: (event) => { if (event.target === event.currentTarget) onClose() } },
      n("form", { className: "eo-project-dialog", ref, role: "dialog", "aria-modal": true, "aria-labelledby": "eo-project-dialog-title", onSubmit: submit,
        onKeyDown: (event) => {
          if (event.key === 'Escape') { event.preventDefault(); onClose() }
          if (event.key === 'Tab') {
            const items = [...event.currentTarget.querySelectorAll('input, button')]
            if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus() }
            else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus() }
          }
        } },
        n("h3", { id: "eo-project-dialog-title" }, deleting ? "删除项目" : kind === "create" ? "新建项目" : "重命名项目"),
        deleting ? n("p", null, "将「" + project.title + "」从项目列表移除。删除后可在左侧撤销，暂存文档不会被清除。") :
          n("label", null, "项目名称", n("input", { value: name, maxLength: 80, onChange: (event) => { setName(event.target.value); setError("") }, "aria-invalid": !!error })),
        error ? n("p", { role: "alert", className: "eo-upload-error" }, error) : null,
        n("div", { className: "eo-project-dialog-actions" },
          n("button", { className: "eo-btn", type: "button", onClick: onClose }, "取消"),
          n("button", { className: "eo-btn " + (deleting ? "danger" : "primary"), type: "submit" }, deleting ? "确认删除" : "保存"))))
  }

  const artifactKey = (projectId, kind) => "dsh-expert-ops:artifact:v1:" + projectId + ":" + kind
  function normalizeArtifact(labels, values) {
    return Object.fromEntries(labels.map((label) => {
      const text = String(values?.[label] ?? "").trim()
      if (label === "招募人数" && text && (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text))))
        throw new Error("招募人数请填写非负整数，或留空。")
      return [label, !text ? null : label === "招募人数" ? Number(text) : text]
    }))
  }
  function artifactCopyText(title, labels, values) {
    const rows = labels.filter((label) => values?.[label] != null && String(values[label]).trim())
      .map((label) => label + "：" + values[label] + (label === "招募人数" ? " 人" : ""))
    return rows.length ? title + "\n\n" + rows.join("\n\n") : ""
  }
  function recruitmentResult(projectId) {
    const base = RECRUITMENT_RESULTS[projectId]
    if (!base) return base
    const result = { ...base }
    for (const kind of ["profile", "jd"]) {
      try {
        const saved = JSON.parse(localStorage.getItem(artifactKey(projectId, kind)) || "null")
        if (saved?.values && typeof saved.values === "object") result[kind] = normalizeArtifact(kind === "profile" ? PROFILE_FIELDS : JD_FIELDS, saved.values)
      } catch (_) { /* Preserve the original sample if a stored override is unreadable. */ }
    }
    return result
  }
  function saveArtifact(projectId, kind, labels, draft, roleId = null) {
    const values = normalizeArtifact(labels, draft)
    if (roleId) updateRole(projectId, roleId, { [kind]: values })
    else localStorage.setItem(artifactKey(projectId, kind), JSON.stringify({ values, updatedAt: new Date().toISOString(), origin: "manual" }))
    const drafts = { ...store.artifactDrafts }; delete drafts[roleScope(projectId, roleId) + ":" + kind]
    set({ artifactDrafts: drafts, artifactRevision: store.artifactRevision + 1 })
  }

  const profileKey = (projectId) => "dsh-expert-ops:profile-criteria:v2:" + projectId
  const EDUCATION_LEVELS = ["高中 / 中专", "大专", "本科", "硕士", "博士"]
  function normalizeProfile(model) {
    const conditions = {}
    for (const field of PROFILE_SCHEMA) {
      const condition = model.conditions?.[field.key] || {}
      let value = condition.value
      if (field.type === "tags") {
        value = [...new Set((Array.isArray(value) ? value : String(value ?? "").split(/[、，,;；\n]/)).map((item) => String(item).trim()).filter(Boolean))]
        if (!value.length) value = null
      } else {
        value = String(value ?? "").trim() || null
        if (value !== null && field.type === "number") {
          if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) > Number.MAX_SAFE_INTEGER)
            throw new Error(field.label + "请填写非负数，或留空。")
          value = Number(value)
          if (field.key === "hours" && value > 168) throw new Error("每周工作时长不能超过 168 小时。")
        }
        if (value !== null && field.type === "month" && !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new Error("毕业时间请选择有效年月。")
        if (value !== null && field.type === "education" && !EDUCATION_LEVELS.includes(value)) throw new Error("请选择最高学历要求。")
      }
      conditions[field.key] = { value,
        operator: field.type === "tags" && condition.operator === "all_of" ? "all_of" : field.op,
        requirement: field.type === "text" ? "semantic" : condition.requirement === "preferred" ? "preferred" : "required" }
    }
    return { schemaVersion: 2, missingPolicy: "needs_verification", conditions,
      legacyOther: typeof model.legacyOther === "string" ? model.legacyOther : "" }
  }
  function loadProfile(projectId, roleId = null) {
    if (roleId) {
      const role = loadRoles(projectId).find((r) => r.id === roleId)
      if (!role) throw new Error("画像不存在")
      return normalizeProfile(role.profile)
    }
    const saved = localStorage.getItem(profileKey(projectId))
    if (saved) return normalizeProfile(JSON.parse(saved))
    const legacy = JSON.parse(localStorage.getItem(artifactKey(projectId, "profile")) || "null")
    const base = RECRUITMENT_RESULTS[projectId]?.profile || {}
    const source = legacy?.values || base
    const conditions = {}
    for (const field of PROFILE_SCHEMA) conditions[field.key] = { value: source[field.label] ?? null }
    // The bundled example explicitly states this numeric threshold. Do not infer it from edited prose.
    if (!legacy && projectId === "d1") conditions.years = { value: 2 }
    return normalizeProfile({ conditions, legacyOther: source.其他条件 || "" })
  }
  function profileValueText(field, condition) {
    const value = condition?.value
    if (value == null || value === "" || Array.isArray(value) && !value.length) return "不限"
    if (Array.isArray(value)) return value.join("、")
    if (field.type === "number") return "至少 " + value + " " + field.unit
    if (field.type === "education") return value + "及以上"
    if (field.type === "month") return value + " 及以前"
    return String(value)
  }
  function profileHasValue(condition) {
    return condition?.value != null && String(condition.value).trim() !== ""
  }
  function profileCopy(model) {
    const rows = PROFILE_SCHEMA.filter((field) => profileHasValue(model.conditions[field.key])).map((field) => {
      const condition = model.conditions[field.key]
      const rule = field.type === "text" ? "" : condition.requirement === "required" ? " [必须满足]" : " [优先考虑]"
      const operator = field.type === "tags" ? condition.operator === "all_of" ? "（全部符合）" : "（任一符合）" : ""
      return field.label + rule + "：" + profileValueText(field, condition) + operator
    })
    return rows.length ? "专家画像\n\n" + rows.join("\n\n") : ""
  }
  function saveProfile(projectId, draft, roleId = null) {
    const model = normalizeProfile(draft)
    if (roleId) updateRole(projectId, roleId, { profile: model })
    else localStorage.setItem(profileKey(projectId), JSON.stringify({ ...model, updatedAt: new Date().toISOString(), origin: "manual" }))
    const drafts = { ...store.artifactDrafts }; delete drafts[roleScope(projectId, roleId) + ":profile:v2"]
    set({ artifactDrafts: drafts, artifactRevision: store.artifactRevision + 1 })
  }
  // A project owns several role profiles; each role owns exactly one JD.
  const rolesKey = (projectId) => "dsh-expert-ops:roles:v1:" + projectId
  const roleScope = (projectId, roleId) => roleId ? projectId + ":role:" + roleId : projectId
  function loadRoles(projectId) {
    const raw = localStorage.getItem(rolesKey(projectId))
    if (raw !== null) {
      const value = JSON.parse(raw)
      if (!Array.isArray(value) || value.some((r) => !r || typeof r.id !== "string" || typeof r.name !== "string" || !r.profile || !r.jd))
        throw new Error("画像列表读取失败，原有数据未被覆盖。")
      if (new Set(value.map((r) => r.id)).size !== value.length) throw new Error("画像标识重复，请恢复数据后重试。")
      return value.map((r) => ({ ...r, profile: normalizeProfile(r.profile), jd: normalizeArtifact(JD_FIELDS, r.jd) }))
    }
    const legacy = recruitmentResult(projectId)
    if (!legacy) return []
    const roles = [{ id: "main", name: legacy.jd?.职位名称 || "专家画像", profile: loadProfile(projectId),
      jd: normalizeArtifact(JD_FIELDS, legacy.jd), source: legacy.source || null, origin: "legacy", deletedAt: null }]
    if (projectId === "d1") roles.push({ id: "quality", name: "语音数据质检专家", origin: "sample", deletedAt: null,
      profile: normalizeProfile({ conditions: { domain: { value: ["语音数据标注"] }, years: { value: 2 },
        background: { value: "具备语音标注或质检相关背景。" }, experience: { value: "具备语音标注质检、抽检与问题复核经验。" },
        abilities: { value: "能核对转写准确性、检查音频切分并说明质检问题。" } } }),
      jd: normalizeArtifact(JD_FIELDS, { 职位名称: "语音数据质检专家", 岗位说明: "参与多语言语音数据项目的质量检查。",
        所属领域: "语音数据标注", 岗位职责: "核对转写、切分成果，记录并复核问题。", 任职要求: "有语音标注或质检经验。",
        核心能力: "质检抽检、问题复核、规范理解" }), source: legacy.source || null })
    return roles
  }
  function persistRoles(projectId, roles) {
    localStorage.setItem(rolesKey(projectId), JSON.stringify(roles))
    set({ artifactRevision: store.artifactRevision + 1 })
  }
  function updateRole(projectId, roleId, patch) {
    const roles = loadRoles(projectId)
    if (!roles.some((r) => r.id === roleId && !r.deletedAt)) throw new Error("画像已删除或不存在，无法保存。")
    persistRoles(projectId, roles.map((r) => {
      if (r.id !== roleId) return r
      const changed = patch.profile && profileFingerprint(patch.profile) !== profileFingerprint(r.profile)
      return { ...r, ...patch, ...(changed ? { confirmedProfile: null, confirmedAt: null } : {}), updatedAt: new Date().toISOString() }
    }))
  }
  function createRole(projectId, name) {
    const clean = name.trim()
    if (!clean || clean.length > 80) throw new Error("画像名称请填写 1–80 个字。")
    const roles = loadRoles(projectId)
    if (roles.some((r) => !r.deletedAt && r.name === clean)) throw new Error("当前项目已有同名画像，请换一个名称。")
    const role = { id: "role-" + crypto.randomUUID(), name: clean, origin: "manual", deletedAt: null,
      profile: normalizeProfile({ conditions: {} }), jd: normalizeArtifact(JD_FIELDS, { 职位名称: clean }), source: null }
    persistRoles(projectId, [...roles, role]); return role.id
  }
  function deleteRole(projectId, roleId) {
    updateRole(projectId, roleId, { deletedAt: new Date().toISOString() })
    const drafts = { ...store.artifactDrafts }
    delete drafts[roleScope(projectId, roleId) + ":profile:v2"]; delete drafts[roleScope(projectId, roleId) + ":jd"]
    set({ artifactDrafts: drafts })
  }
  function candidateRoleId(expert, projectId) {
    if (expert.roleByProject?.[projectId]) return expert.roleByProject[projectId]
    // Explicit mock assignment, not an AI inference from an uploaded document.
    return projectId === "d1" && ["demo-expert-02", "demo-expert-06"].includes(expert.id) ? "quality" : "main"
  }

  function profileFingerprint(profile) { return JSON.stringify(normalizeProfile(profile)) }
  function roleConfirmed(role) {
    return !!role && !role.deletedAt && !!role.confirmedAt && role.confirmedProfile === profileFingerprint(role.profile)
  }
  function roleDraftPending(projectId, role) {
    const draft = store.artifactDrafts[roleScope(projectId, role.id) + ":profile:v2"]
    if (!draft) return false
    try { return profileFingerprint(draft) !== profileFingerprint(role.profile) } catch (_) { return true }
  }
  function actionableRole(projectId, roleId) {
    const project = store.projects.find((p) => p.id === projectId && !p.deletedAt)
    if (!project || project.ended) throw new Error("请先恢复项目，再确认画像或匹配专家。")
    const role = loadRoles(projectId).find((r) => r.id === roleId && !r.deletedAt)
    if (!role) throw new Error("画像已删除或不存在。")
    if (roleDraftPending(projectId, role)) throw new Error("请先保存或取消画像修改。")
    return role
  }
  function confirmRole(projectId, roleId) {
    const role = actionableRole(projectId, roleId)
    if (!PROFILE_SCHEMA.some((f) => profileHasValue(role.profile.conditions[f.key]))) throw new Error("请至少填写一项画像条件，再确认画像。")
    updateRole(projectId, roleId, { confirmedProfile: profileFingerprint(role.profile), confirmedAt: new Date().toISOString() })
  }
  function matchConfirmedRole(projectId, roleId) {
    const role = actionableRole(projectId, roleId)
    if (!roleConfirmed(role)) throw new Error("请先确认当前画像，再匹配专家。")
    openProjectSpace(projectId, "p3", roleId)
    toast("已进入“" + role.name + "”的专家匹配；匹配服务尚未接入，当前展示已有示例。")
  }
  function RoleConfirmation({ projectId, role, detail = false }) {
    const s = useStore()
    const confirmed = roleConfirmed(role)
    const draft = roleDraftPending(projectId, role)
    const ended = !s.projects.some((p) => p.id === projectId && !p.deletedAt && !p.ended)
    const empty = !PROFILE_SCHEMA.some((f) => profileHasValue(role.profile.conditions[f.key]))
    function act(fn) { try { fn(projectId, role.id) } catch (err) { toast(err.message || "操作失败，请重试") } }
    return n("div", { className: "eo-role-confirm" + (detail ? " eo-role-confirm-detail" : "") },
      n("span", { className: confirmed && !draft ? "confirmed" : "", role: "status" }, draft ? "修改未保存" : confirmed ? "画像已确认" : "画像待确认"),
      n("button", { className: "eo-btn", disabled: ended || draft || empty || confirmed, title: draft ? "请先保存或取消画像修改" : empty ? "请先填写画像条件" : "确认当前画像的筛选条件", onClick: () => act((pid, rid) => { confirmRole(pid, rid); toast("画像已确认，可以匹配当前画像的专家") }) }, confirmed && !draft ? "已确认" : "确认画像"),
      n("button", { className: "eo-btn primary", disabled: ended || draft || !confirmed, title: "仅匹配当前画像", onClick: () => act(matchConfirmedRole) }, "匹配专家"))
  }

  function ProfileCriteriaCard({ demandId, roleId = null, embedded = false }) {
    const s = useStore()
    const draftKey = roleScope(demandId, roleId) + ":profile:v2"
    let saved, loadError = ""
    try { saved = loadProfile(demandId, roleId) }
    catch (_) { loadError = "画像存储无法读取，请恢复数据后再编辑；原数据未被覆盖。" }
    const draft = s.artifactDrafts[draftKey]
    const model = draft || saved
    const [active, setActive] = useState(null)
    const [error, setError] = useState("")
    const [copying, setCopying] = useState(false)
    const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(saved)
    useEffect(() => {
      if (!dirty) return
      const warn = (event) => { event.preventDefault(); event.returnValue = "" }
      window.addEventListener("beforeunload", warn)
      return () => window.removeEventListener("beforeunload", warn)
    }, [dirty])
    function edit(key) { setActive(key); setError("") }
    function change(key, patch) {
      const current = store.artifactDrafts[draftKey] || saved
      set({ artifactDrafts: { ...store.artifactDrafts, [draftKey]: { ...current,
        conditions: { ...current.conditions, [key]: { ...current.conditions[key], ...patch } } } } })
      setError("")
    }
    function cancel() {
      const drafts = { ...store.artifactDrafts }; delete drafts[draftKey]
      set({ artifactDrafts: drafts }); setActive(null); setError("")
    }
    function save() {
      try { saveProfile(demandId, draft, roleId); setActive(null); setError(""); toast("专家画像已保存到本机；匹配规则待后端接入") }
      catch (err) { setError(err.name === "QuotaExceededError" ? "本机存储空间不足，草稿仍保留。" : err.message || "保存失败，草稿仍保留。") }
    }
    async function copy() {
      setCopying(true)
      try { await navigator.clipboard.writeText(profileCopy(saved)); toast("专家画像已复制（仅包含非空条件）") }
      catch (_) { toast("复制失败，请检查浏览器剪贴板权限。") }
      finally { setCopying(false) }
    }
    function fieldRow(field) {
      const condition = model.conditions[field.key]
      const filled = profileHasValue(condition)
      const editing = active === field.key
      const isText = field.type === "text"
      const raw = Array.isArray(condition.value) ? condition.value.join("、") : String(condition.value ?? "")
      return n("div", { className: "eo-criterion" + (isText ? " semantic" : ""), key: field.key },
        n("div", { className: "eo-criterion-label" }, field.label,
          !isText && filled ? n("span", { className: "eo-criterion-rule " + condition.requirement }, condition.requirement === "required" ? "必须" : "优先") : null),
        editing ? n("div", { className: "eo-criterion-editor" },
          field.type === "education" ? n("select", { className: "eo-field-editor", "aria-label": field.label, value: raw, autoFocus: true,
            onChange: (event) => change(field.key, { value: event.target.value }) }, n("option", { value: "" }, "不限"), EDUCATION_LEVELS.map((level) => n("option", { key: level, value: level }, level + "及以上"))) :
          n(isText ? "textarea" : "input", { className: "eo-field-editor", "aria-label": field.label, autoFocus: true,
            ...(isText ? { rows: field.key === "experience" ? 5 : 3 } : { type: field.type === "month" ? "month" : "text", inputMode: field.type === "number" ? "decimal" : "text" }),
            placeholder: field.type === "tags" ? "多个值用顿号分隔" : field.type === "number" ? "至少 · " + field.unit : "留空不限定",
            value: raw, onChange: (event) => change(field.key, { value: event.target.value }),
            onKeyDown: (event) => { if (event.key === "Escape") setActive(null) } }),
          !isText ? n("div", { className: "eo-criterion-options" },
            n("select", { "aria-label": field.label + "约束", value: condition.requirement, onChange: (event) => change(field.key, { requirement: event.target.value }) },
              n("option", { value: "required" }, "必须满足"), n("option", { value: "preferred" }, "优先考虑")),
            field.type === "tags" ? n("select", { "aria-label": field.label + "匹配方式", value: condition.operator, onChange: (event) => change(field.key, { operator: event.target.value }) },
              n("option", { value: "any_of" }, "任一符合"), n("option", { value: "all_of" }, "全部符合")) : null) : null) :
        n("button", { className: "eo-field-value" + (!filled ? " eo-empty-field" : ""), "aria-label": "修改专家画像 · " + field.label,
          onClick: () => edit(field.key), title: "点击修改" }, profileValueText(field, condition)))
    }
    const fixed = model ? PROFILE_SCHEMA.filter((f) => f.type !== "text" && profileHasValue(model.conditions[f.key])) : []
    const conditionMeta = n("span", null, fixed.filter((f) => model.conditions[f.key].requirement === "required").length + " 项必须 · " + fixed.filter((f) => model.conditions[f.key].requirement === "preferred").length + " 项优先")
    return n("section", { className: "eo-card eo-pad eo-artifact-card eo-profile-criteria", "aria-label": "专家画像" },
      n("div", { className: "eo-artifact-head" + (embedded ? " eo-artifact-head-inline" : "") },
        embedded ? n("div", { className: "eo-profile-section-title" }, "基础条件", conditionMeta)
          : n("h3", null, "专家画像", n("span", { className: "eo-tag" }, "筛选条件")),
        n("button", { className: "eo-btn", disabled: !saved || dirty || copying || !profileCopy(saved), onClick: copy, title: dirty ? "保存后再复制" : "复制已填写条件" }, copying ? "复制中…" : "复制画像")),
      loadError ? n("p", { role: "alert", className: "eo-upload-error" }, loadError) : n(React.Fragment, null,
        embedded ? null : n("div", { className: "eo-profile-section-title" }, "基础条件", conditionMeta),
        n("p", { className: "eo-profile-help" }, "必须条件先筛选；未填写不限制。"),
        ["专业与资质", "教育背景", "任职与投入"].map((group) => n("div", { key: group, className: "eo-criteria-group" },
          n("h4", null, group), n("div", { className: "eo-criteria-grid" }, PROFILE_SCHEMA.filter((f) => f.group === group).map(fieldRow)))),
        n("div", { className: "eo-profile-section-title semantic" }, "经历与能力"),
        n("p", { className: "eo-profile-help" }, "描述项目所需背景、经历和能力，用于语义匹配。"),
        PROFILE_SCHEMA.filter((f) => f.type === "text").map(fieldRow),
        model.legacyOther ? n("details", { className: "eo-profile-legacy" }, n("summary", null, "历史补充条件 · 待归类"), n("p", null, model.legacyOther),
          n("small", null, "原四字段画像的补充内容已保留，不自动作为筛选条件。")) : null,
        error ? n("p", { role: "alert", className: "eo-upload-error" }, error) : null,
        active || draft ? n("div", { className: "eo-artifact-actions" }, n("span", null, dirty ? "有未保存修改" : "填写条件后保存"),
          n("button", { className: "eo-btn", onClick: cancel }, "取消"), n("button", { className: "eo-btn primary", onClick: save, disabled: !dirty }, "保存")) : null))
  }

  function RecruitmentFields({ title, badge, labels, values, profile, demandId, roleId = null, embedded = false }) {
    const s = useStore()
    const kind = profile ? "profile" : "jd"
    const draftKey = roleScope(demandId, roleId) + ":" + kind
    const draft = s.artifactDrafts[draftKey]
    const [activeField, setActiveField] = useState(null)
    const [error, setError] = useState("")
    const [copying, setCopying] = useState(false)
    const dirty = !!draft && labels.some((label) => String(draft[label] ?? "") !== String(values?.[label] ?? ""))
    useEffect(() => {
      if (!dirty) return
      const warn = (event) => { event.preventDefault(); event.returnValue = "" }
      window.addEventListener("beforeunload", warn)
      return () => window.removeEventListener("beforeunload", warn)
    }, [dirty])
    function edit(label) {
      if (!draft) set({ artifactDrafts: { ...store.artifactDrafts, [draftKey]: { ...values } } })
      setActiveField(label); setError("")
    }
    function change(label, value) {
      set({ artifactDrafts: { ...store.artifactDrafts, [draftKey]: { ...(store.artifactDrafts[draftKey] || values), [label]: value } } })
      setError("")
    }
    function cancel() {
      const drafts = { ...store.artifactDrafts }; delete drafts[draftKey]
      set({ artifactDrafts: drafts }); setActiveField(null); setError("")
    }
    function save() {
      try { saveArtifact(demandId, kind, labels, draft, roleId); setActiveField(null); setError(""); toast(title + "已保存到本机") }
      catch (err) { setError(err.name === "QuotaExceededError" ? "本机存储空间不足，修改尚未保存。" : err.message || "保存失败，修改仍保留。") }
    }
    async function copy() {
      setCopying(true)
      try { await navigator.clipboard.writeText(artifactCopyText(title, labels, values)); toast(title + "已复制") }
      catch (_) { toast("复制失败，请允许浏览器访问剪贴板后重试。") }
      finally { setCopying(false) }
    }
    return n("section", { className: "eo-card eo-pad eo-artifact-card", "aria-label": title },
      n("div", { className: "eo-artifact-head" },
        embedded ? n("span", { className: "eo-tag" }, badge) : n("h3", null, title, n("span", { className: "eo-tag" }, badge)),
        n("button", { className: "eo-btn", disabled: dirty || copying || !artifactCopyText(title, labels, values), title: dirty ? "保存修改后再复制" : "复制非空字段", onClick: copy }, copying ? "复制中…" : profile ? "复制画像" : "复制 JD")),
      n("dl", { className: "eo-fields" + (profile ? " eo-profile-fields" : "") },
        labels.map((label) => {
          const value = (draft || values)?.[label]
          const isEmpty = value == null || !String(value).trim()
          return n("div", { className: "eo-row eo-editable-row", key: label, onClick: () => { if (activeField !== label) edit(label) } },
            n("dt", { className: "k" }, label),
            n("dd", null, activeField === label ? n(label === "招募人数" ? "input" : "textarea", {
              className: "eo-field-editor", "aria-label": title + " · " + label, autoFocus: true,
              ...(label === "招募人数" ? { type: "text", inputMode: "numeric" } : { rows: label === "从业经验" ? 5 : 3 }),
              value: String(value ?? ""), onChange: (event) => change(label, event.target.value),
              onKeyDown: (event) => { if (event.key === "Escape") { event.stopPropagation(); setActiveField(null) } },
            }) : n("button", { type: "button", className: "eo-field-value" + (isEmpty ? " eo-empty-field" : ""),
              "aria-label": "修改" + title + " · " + label, onClick: () => edit(label), title: "点击修改" },
              isEmpty ? (profile ? "未限定" : "待补充") : String(value) + (label === "招募人数" ? " 人" : ""))))
        })),
      error ? n("p", { className: "eo-upload-error", role: "alert" }, error) : null,
      draft ? n("div", { className: "eo-artifact-actions" },
        n("span", null, dirty ? "有未保存修改" : "点击字段编辑"),
        n("button", { className: "eo-btn", onClick: cancel }, "取消"),
        n("button", { className: "eo-btn primary", disabled: !dirty, onClick: save }, "保存")) : null)
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
  function DemandUpload({ demandId, title = "甲方需求文档", showParse = false }) {
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
          errors.push(file.name + "：当前文档分组最多暂存 20 份、合计 50 MB。")
        } else {
          next.push(file)
          bytes += file.size
        }
      }
      set({ documents: { ...store.documents, [demandId]: next } })
      setError(errors.join("\n"))
    }
    return n("section", { className: "eo-card eo-pad eo-upload", "aria-label": title },
      n("div", { className: "eo-upload-head" },
        n("div", { className: "eo-upload-info" },
          n("h3", null, title),
          n("span", { className: "eo-upload-note" }, "PDF / Word · 多选"),
          n("span", { className: "eo-tag", title: "文件仅在本次会话暂存，刷新后需重新选择；尚未接入保存与解析，现有示例成果不会随上传改变。" }, "本次暂存 · 未解析")),
        n("div", { className: "eo-upload-actions" },
          n("button", { className: "eo-btn primary", onClick: () => picker.current?.click() }, "上传文档"),
          showParse ? n("button", { className: "eo-btn", disabled: files.length === 0,
            title: files.length ? "解析当前项目已上传的文档" : "请先上传文档",
            onClick: () => {
              if (!(store.documents[demandId] || []).length) return
              toast("解析服务尚未接入，文档已暂存；现有画像与 JD 不会改变。")
            } }, "解析文档") : null),
        n("input", { ref: picker, type: "file", hidden: true, multiple: true,
          accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "aria-label": "上传" + title, onChange: selectFiles })),
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
    const s = useStore()
    const [activeId, setActiveId] = useState(() => s.featureRole?.projectId === demandId && s.featureRole.tab === "recruitment" ? s.featureRole.roleId : null)
    useEffect(() => { if (s.featureRole?.projectId === demandId && s.featureRole.tab === "recruitment") setActiveId(s.featureRole.roleId) }, [s.featureRole, demandId])
    const [artifactTab, setArtifactTab] = useState("profile")
    const [adding, setAdding] = useState(false)
    const [name, setName] = useState("")
    const [deleting, setDeleting] = useState(null)
    const dialogRef = useRef(null)
    useEffect(() => {
      if (!deleting) return
      const previous = document.activeElement
      dialogRef.current?.querySelector("button")?.focus()
      return () => previous?.isConnected && previous.focus()
    }, [deleting])
    const [error, setError] = useState("")
    let roles = [], loadError = ""
    try { roles = loadRoles(demandId) } catch (err) { loadError = err.message }
    const visible = roles.filter((r) => !r.deletedAt)
    const active = visible.find((r) => r.id === activeId)
    const tabs = [["profile", "专家画像"], ["jd", "岗位 JD"]]
    const prefix = "eo-artifact-" + demandId + "-" + activeId
    const scope = roleScope(demandId, activeId)
    const hasDraft = !!(s.artifactDrafts[scope + ":profile:v2"] || s.artifactDrafts[scope + ":jd"])
    function enter(id) { setActiveId(id); setArtifactTab("profile"); setError("") }
    function add(event) {
      event.preventDefault()
      try { const id = createRole(demandId, name); setAdding(false); setName(""); enter(id); toast("画像已添加，请填写筛选条件和对应 JD") }
      catch (err) { setError(err.message || "保存失败，请重试") }
    }
    function remove() {
      try { deleteRole(demandId, deleting.id); setDeleting(null); setActiveId(null); setError(""); toast("画像已删除，历史匹配记录保留") }
      catch (err) { setError(err.message || "删除失败，请重试") }
    }
    function onTabKey(event, index) {
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 :
        event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : null
      if (next === null) return
      event.preventDefault(); setArtifactTab(tabs[next][0]); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus()
    }
    return n("div", { className: "eo-recruitment" },
      active ? n("div", { className: "eo-role-detail-head" },
        n("button", { className: "eo-btn", onClick: () => { setActiveId(null); setError("") } }, "← 全部画像"),
        n("div", null, n("h3", null, active.name), n("span", null, "岗位要求 / 画像详情", hasDraft ? " · 修改草稿已保留" : "")),
        n("button", { className: "eo-btn", onClick: () => { setDeleting(active); setError("") } }, "删除画像")) :
        n(DemandUpload, { demandId, showParse: true }),
      loadError ? n("p", { role: "alert", className: "eo-upload-error" }, loadError) : null,
      !active && !loadError ? n("section", { className: "eo-role-overview" },
        n("div", { className: "eo-role-list-head" },
          n("div", null, n("h3", null, "专家画像", n("span", { className: "eo-tag" }, visible.length)),
            n("p", null, "一份需求可对应多个画像，每个画像拥有独立的筛选条件和岗位 JD。")),
          n("button", { className: "eo-btn primary", onClick: () => { setAdding(true); setError("") } }, "+ 添加画像")),
        adding ? n("form", { className: "eo-role-add eo-card eo-pad", onSubmit: add },
          n("label", null, "画像名称", n("input", { autoFocus: true, maxLength: 80, value: name, placeholder: "例如：粤语转写专家", onChange: (event) => setName(event.target.value) })),
          n("button", { className: "eo-btn", type: "button", onClick: () => { setAdding(false); setName(""); setError("") } }, "取消"),
          n("button", { className: "eo-btn primary", type: "submit", disabled: !name.trim() }, "添加")) : null,
        n("div", { className: "eo-role-grid" }, visible.map((role, index) => {
          const fields = PROFILE_SCHEMA.filter((f) => profileHasValue(role.profile.conditions[f.key]))
          const count = s.experts.filter((e) => e.candidateProjectIds.includes(demandId) && candidateRoleId(e, demandId) === role.id).length
          return n("article", { key: role.id, className: "eo-card eo-role-card" },
            n("button", { className: "eo-role-open", onClick: () => enter(role.id), "aria-label": "查看画像：" + role.name },
              n("div", { className: "eo-role-card-top" }, n("span", null, String(index + 1).padStart(2, "0")),
                n("span", { className: "eo-tag" }, role.origin === "manual" ? "手动添加" : "示例画像")),
              n("h3", null, role.name),
              n("p", null, role.profile.conditions.abilities?.value || role.profile.conditions.background?.value || "补充筛选条件后，可用于匹配专家。"),
              n("div", { className: "eo-role-card-meta" }, n("span", null, fields.length + " 项已填写"), n("span", null, count + " 位匹配专家")),
              n("div", { className: "eo-role-card-bottom" }, n("span", null, "专家画像 · 岗位 JD"), n("span", null, "查看详情 →"))),
            n(RoleConfirmation, { projectId: demandId, role }),
            n("button", { className: "eo-role-delete", "aria-label": "删除画像：" + role.name, onClick: () => { setDeleting(role); setError("") } }, "删除"))
        })),
        !visible.length ? n("div", { className: "eo-card eo-pad eo-role-empty" }, n("h3", null, "暂无专家画像"), n("p", null, "上传甲方需求，或手动添加一个画像开始整理岗位要求。")) : null,
        n("p", { className: "eo-role-note" }, "当前为前端演示；文档解析服务尚未接入。已有示例与手动修改保存在本机。")) : null,
      active ? n(RoleConfirmation, { projectId: demandId, role: active, detail: true }) : null,
      active ? n("section", { className: "eo-card eo-artifact-switcher", "aria-label": active.name + "的岗位要求" },
        n("div", { className: "eo-artifact-tabs", role: "tablist", "aria-label": "成果类型" },
          tabs.map(([key, label], index) => n("button", { key, type: "button", role: "tab", className: "eo-artifact-tab",
            id: prefix + "-tab-" + key, "aria-controls": prefix + "-panel-" + key,
            "aria-selected": artifactTab === key, tabIndex: artifactTab === key ? 0 : -1,
            onClick: () => setArtifactTab(key), onKeyDown: (event) => onTabKey(event, index) }, label))),
        n("div", { className: "eo-artifact-panel", role: "tabpanel", id: prefix + "-panel-profile", "aria-labelledby": prefix + "-tab-profile", hidden: artifactTab !== "profile" },
          n(ProfileCriteriaCard, { key: active.id, demandId, roleId: active.id, embedded: true })),
        n("div", { className: "eo-artifact-panel", role: "tabpanel", id: prefix + "-panel-jd", "aria-labelledby": prefix + "-tab-jd", hidden: artifactTab !== "jd" },
          n(RecruitmentFields, { key: active.id, title: "岗位 JD", badge: "对外草稿", labels: JD_FIELDS, values: active.jd, demandId, roleId: active.id, embedded: true }))) : null,
      active ? n(DemandEvidence, { source: active.source }) : null,
      error ? n("p", { role: "alert", className: "eo-upload-error" }, error) : null,
      deleting ? n("div", { className: "eo-project-dialog-backdrop" }, n("section", { className: "eo-project-dialog", ref: dialogRef, role: "dialog", "aria-modal": true, "aria-label": "删除画像确认",
        onKeyDown: (event) => {
          if (event.key === "Escape") { event.stopPropagation(); setDeleting(null) }
          if (event.key === "Tab") {
            const buttons = [...event.currentTarget.querySelectorAll("button")]
            const index = buttons.indexOf(document.activeElement)
            event.preventDefault(); buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus()
          }
        } },
        n("h3", null, "删除“" + deleting.name + "”？"), n("p", null, "画像及对应 JD 将从岗位要求中移除。历史匹配记录保留至专家匹配的“已删除画像”中，仅供查看，不再匹配、审核或导出。"),
        error ? n("p", { role: "alert", className: "eo-upload-error" }, error) : null,
        n("div", { className: "eo-project-dialog-actions" }, n("button", { className: "eo-btn", onClick: () => setDeleting(null) }, "取消"), n("button", { className: "eo-btn danger", onClick: remove }, "确认删除")))) : null)
  }

  // Receipt state is project-specific; AI classification remains separate from human review.
  function loadCandidateReceipts() {
    try {
      const value = JSON.parse(localStorage.getItem("dsh-expert-ops:candidate-receipts:v1") || "{}")
      return value && typeof value === "object" && !Array.isArray(value) ? value : {}
    } catch (_) { return {} }
  }
  function candidateRevision(expert) { return expert.resultRevision || 1 }
  function candidateReceipt(state, projectId, expert) {
    const receipt = state.candidateReceipts[projectId]?.[expert.id] || {}
    const current = candidateRevision(expert)
    return { unread: receipt.seenRevision !== current,
      review: receipt.reviewRevision === current && ["passed", "excluded"].includes(receipt.review) ? receipt.review : "pending" }
  }
  function writeCandidateReceipts(projectId, ids, patch) {
    const project = { ...store.candidateReceipts[projectId] }
    for (const expert of store.experts) {
      if (!ids.includes(expert.id) || !expert.candidateProjectIds.includes(projectId)) continue
      project[expert.id] = { ...project[expert.id], ...patch(candidateRevision(expert)) }
    }
    const receipts = { ...store.candidateReceipts, [projectId]: project }
    try { localStorage.setItem("dsh-expert-ops:candidate-receipts:v1", JSON.stringify(receipts)) }
    catch (_) { toast("保存失败，请重试；当前审核和提醒状态未改变。"); return false }
    set({ candidateReceipts: receipts }); return true
  }
  function openCandidate(projectId, expert, readOnly = false) {
    writeCandidateReceipts(projectId, [expert.id], (revision) => ({ seenRevision: revision }))
    set({ drawer: { projectId, id: expert.id, readOnly } })
  }
  function reviewCandidates(projectId, ids, review) {
    if (!["passed", "excluded", "pending"].includes(review)) return false
    return writeCandidateReceipts(projectId, ids, (revision) => ({ review, reviewRevision: revision }))
  }
  function poolCandidates(state, projectId, experts, filters) {
    const query = (filters.query || "").trim().toLowerCase()
    return experts.filter((e) => {
      const receipt = candidateReceipt(state, projectId, e)
      return e.candidateProjectIds.includes(projectId) &&
        (!filters.pendingOnly || receipt.review === "pending") &&
        (filters.view === "all" || filters.view === "ai" || receipt.review === filters.view) &&
        (filters.ai === "all" || e.bucket === filters.ai) &&
        (filters.source === "all" || e.src === filters.source) &&
        (!query || [e.name, e.id, e.city, e.why, e.gap].join(" ").toLowerCase().includes(query))
    }).sort((a, b) => Number(candidateReceipt(state, projectId, a).review !== "pending") - Number(candidateReceipt(state, projectId, b).review !== "pending") || Number(candidateReceipt(state, projectId, b).unread) - Number(candidateReceipt(state, projectId, a).unread) || b.score - a.score)
  }
  function pendingCandidates(state, projectId, experts, bucket) {
    return poolCandidates(state, projectId, experts, { view: "ai", ai: bucket, source: "all", pendingOnly: true })
  }
  function BoardView({ projectId, experts, role }) {
    const s = useStore()
    const [view, setView] = useState("all")
    const [ai, setAI] = useState("all")
    const [source, setSource] = useState("all")
    const scopedExperts = experts
    const readOnly = !!role.deletedAt
    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState([])
    const [pendingOnly, setPendingOnly] = useState(false)
    const selectAllRef = useRef(null)
    const groups = [["A", "推荐"], ["B", "待确认"], ["C", "建议排除"]]
    const labels = { A: "推荐入项", B: "待确认", C: "推荐排除" }
    const sourceLabels = { 原识: "原识平台", 飞书: "飞书表单", 手填: "手动上传" }
    const rows = poolCandidates(s, projectId, scopedExperts, { view, ai, source, query, pendingOnly })
    const selectedIds = selected.filter((id) => rows.some((e) => e.id === id))
    const allSelected = rows.length > 0 && selectedIds.length === rows.length
    useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectedIds.length > 0 && !allSelected }, [selectedIds.length, allSelected])
    function filter(update) { update(); setSelected([]) }
    function review(ids, value) {
      if (readOnly) return
      if (reviewCandidates(projectId, ids, value)) { setSelected([]); toast(value === "passed" ? "已人工确认通过" : value === "excluded" ? "已人工确认排除" : "已恢复待人工确认") }
    }
    return n("div", { className: "eo-candidate-workspace" },
      n("div", { className: "eo-stat-grid", "aria-label": "按 AI 判断分类的待人工审核数量" }, groups.map(([bucket, label]) => {
        const members = pendingCandidates(s, projectId, scopedExperts, bucket)
        const unread = members.filter((e) => candidateReceipt(s, projectId, e).unread).length
        return n("button", { key: bucket, type: "button", className: "eo-stat " + bucket, "aria-pressed": view === "ai" && ai === bucket && pendingOnly,
          "aria-label": "AI判断：" + label + (readOnly ? "，历史未审核 " : "，待人工审核 ") + members.length + " 人" + (unread ? "，" + unread + " 人有新动态" : ""),
          onClick: () => filter(() => { setView("ai"); setAI(bucket); setPendingOnly(true); setSource("all"); setQuery("") }) },
          n("span", { className: "eo-stat-label" }, "AI判断：" + label), n("span", { className: "eo-stat-number" }, members.length, n("small", null, "人")),
          n("span", { className: "eo-stat-caption" }, readOnly ? "历史未审核数量" : "待人工审核数量"),
          unread ? n("span", { className: "eo-stat-new", title: "待人工审核中新增或分析更新后尚未查看的专家；查看详情后清除" }, "+" + unread) : null)
      })),
      n("div", { className: "eo-pool-tabs", "aria-label": "候选人分类" },
        [["all", "全部"], ["ai", "AI 推荐"], ["passed", "已通过"], ["excluded", "已排除"]].map(([key, label]) =>
          n("button", { key, "aria-pressed": view === key, onClick: () => filter(() => { setView(key); setAI("all"); setPendingOnly(false) }) }, label,
            n("small", null, key === "all" || key === "ai" ? scopedExperts.length : scopedExperts.filter((e) => candidateReceipt(s, projectId, e).review === key).length)))),
      n("div", { className: "eo-pool-filters" },
        n("select", { "aria-label": "AI 推荐状态", value: ai, onChange: (event) => filter(() => setAI(event.target.value)) }, n("option", { value: "all" }, "全部 AI 状态"), groups.map(([key]) => n("option", { key, value: key }, labels[key]))),
        n("select", { "aria-label": "专家来源", value: source, onChange: (event) => filter(() => setSource(event.target.value)) }, n("option", { value: "all" }, "来源：全部"), Object.entries(sourceLabels).map(([key, label]) => n("option", { key, value: key }, label))),
        n("input", { type: "search", "aria-label": "搜索候选人", placeholder: "姓名、ID、城市或匹配理由", value: query, onChange: (event) => filter(() => setQuery(event.target.value)) })),
      !readOnly ? n("div", { className: "eo-pool-bulk" },
        n("div", { className: "eo-pool-checks" },
          ["all", "ai"].includes(view) ? n("label", { className: "eo-pool-pending" },
            n("input", { type: "checkbox", checked: pendingOnly, onChange: (event) => filter(() => setPendingOnly(event.target.checked)) }), "仅待人工审核") : null,
          n("label", null, n("input", { ref: selectAllRef, type: "checkbox", checked: allSelected, disabled: !rows.length, onChange: (event) => setSelected(event.target.checked ? rows.map((e) => e.id) : []) }), "选择当前列表")),
        n("span", { className: "eo-pool-selected" }, "已选 " + selectedIds.length + " 人"),
        n("div", { className: "eo-pool-bulk-actions" },
          n("button", { className: "eo-btn", disabled: !selectedIds.length, onClick: () => review(selectedIds, "passed") }, "批量通过"),
          n("button", { className: "eo-btn", disabled: !selectedIds.length, onClick: () => review(selectedIds, "excluded") }, "批量排除"))) : null,
      n("div", { className: "eo-pool-list" }, rows.length ? rows.map((e) => {
        const receipt = candidateReceipt(s, projectId, e)
        // The parent supplies a single profile and its candidates.
        const muted = ["all", "ai"].includes(view) && receipt.review !== "pending"
        return n("article", { key: e.id, className: "eo-pool-row" + (readOnly ? " history" : "") + (muted ? " reviewed" : ""), "aria-label": e.name + "候选人" },
          !readOnly ? n("input", { type: "checkbox", "aria-label": "选择 " + e.name, checked: selectedIds.includes(e.id), onChange: (event) => setSelected(event.target.checked ? [...selectedIds, e.id] : selectedIds.filter((id) => id !== e.id)) }) : null,
          n("div", { className: "eo-pool-info" },
            n("div", { className: "eo-pool-name" }, receipt.unread ? n("span", { className: "eo-pool-new", title: "尚未查看的新动态" }, "新") : null, n("strong", null, e.name), n("small", null, e.id.replace("demo-expert-", "E")),
              n("span", { className: "eo-ai-badge " + e.bucket }, "AI · " + labels[e.bucket]), n("span", { className: "eo-pool-source " + (e.src === "飞书" ? "feishu" : e.src === "手填" ? "manual" : "origin") }, sourceLabels[e.src])),
            n("p", null, e.city + " · " + e.years + " 年经验 · " + e.rate + " 元/小时 · 匹配分 " + e.score),

            n("p", { className: "eo-pool-reason" }, e.why)),
          n("div", { className: "eo-pool-side" }, n("span", { className: "eo-pool-status" }, receipt.review === "passed" ? "人工已通过" : receipt.review === "excluded" ? "人工已排除" : readOnly ? "历史未审核" : "待人工确认"),
            n("button", { className: "eo-pool-detail", onClick: () => openCandidate(projectId, e, readOnly) }, "查看 AI 理由 →"),
            !readOnly ? n("div", { className: "eo-pool-row-actions" },
              receipt.review !== "passed" ? n("button", { className: "eo-btn primary", onClick: () => review([e.id], "passed") }, "审核通过") : null,
              receipt.review !== "excluded" ? n("button", { className: "eo-btn", onClick: () => review([e.id], "excluded") }, "排除") : null,
              receipt.review !== "pending" ? n("button", { className: "eo-btn", onClick: () => review([e.id], "pending") }, "撤销结论") : null) : null))
      }) : n("div", { className: "eo-pool-empty" }, experts.length ? "没有符合筛选条件的专家" : "当前画像暂无候选人")),
      n("p", { className: "eo-pool-note" }, "示例数据 · +N 为尚未查看的新动态人数；查看详情后清除。抓取与上传解析接口待接入。"))
  }

  function matchingRoles(projectId, roles, experts) {
    const projectExperts = experts.filter((e) => e.candidateProjectIds.includes(projectId))
    const entries = roles.map((role) => ({ role, experts: projectExperts.filter((e) => candidateRoleId(e, projectId) === role.id) }))
    // Keep old unmatched metadata visible rather than silently losing historical candidates.
    for (const id of new Set(projectExperts.map((e) => candidateRoleId(e, projectId)))) {
      if (!entries.some((entry) => entry.role.id === id)) entries.push({
        role: { id, name: "历史画像", deletedAt: "unavailable" },
        experts: projectExperts.filter((e) => candidateRoleId(e, projectId) === id) })
    }
    return { active: entries.filter((entry) => !entry.role.deletedAt),
      archived: entries.filter((entry) => entry.role.deletedAt && entry.experts.length) }
  }
  function MatchingView({ projectId, experts }) {
    const s = useStore()
    const [activeId, setActiveId] = useState(() => s.featureRole?.projectId === projectId && s.featureRole.tab === "p3" ? s.featureRole.roleId : null)
    useEffect(() => { if (s.featureRole?.projectId === projectId && s.featureRole.tab === "p3") setActiveId(s.featureRole.roleId) }, [s.featureRole, projectId])
    let groups, error = ""
    try { groups = matchingRoles(projectId, loadRoles(projectId), experts) } catch (err) { error = err.message }
    if (error) return n("p", { role: "alert", className: "eo-upload-error" }, error)
    const current = [...groups.active, ...groups.archived].find((entry) => entry.role.id === activeId)
    const card = ({ role, experts: members }) => {
      const pending = members.filter((e) => candidateReceipt(s, projectId, e).review === "pending").length
      const unread = members.filter((e) => candidateReceipt(s, projectId, e).unread).length
      const passed = members.filter((e) => candidateReceipt(s, projectId, e).review === "passed").length
      return n("article", { className: "eo-card eo-role-card eo-match-role-card", key: role.id },
        n("button", { className: "eo-role-open", "aria-label": "查看匹配：" + role.name, onClick: () => setActiveId(role.id) },
          n("div", { className: "eo-role-card-top" }, n("span", { className: "eo-tag" }, role.deletedAt ? "画像已删除" : members.length ? "匹配结果" : "暂无匹配"),
            unread ? n("span", { className: "eo-match-unread" }, "+" + unread) : null),
          n("h3", null, role.name),
          n("div", { className: "eo-match-metrics" },
            n("span", null, n("strong", null, members.length), "候选人"),
            n("span", null, n("strong", null, pending), role.deletedAt ? "历史未审核" : "待人工审核"),
            n("span", null, n("strong", null, passed), "已通过")),
          n("div", { className: "eo-role-card-bottom" }, n("span", null, role.deletedAt ? "保留原归属与审核记录" : "每位专家仅归属一个画像"),
            n("span", null, role.deletedAt ? "查看历史 →" : "查看候选人 →"))))
    }
    if (current) return n("div", null,
      n("div", { className: "eo-role-detail-head eo-match-detail-head" },
        n("button", { className: "eo-btn", onClick: () => setActiveId(null) }, "← 全部画像"),
        n("div", { className: "eo-match-heading" }, n("h3", null, current.role.name), n("span", null, "专家匹配 / " + (current.role.deletedAt ? "历史记录" : "候选人"))),
        !current.role.deletedAt ? n("div", { className: "eo-match-actions" },
          n("button", { className: "eo-btn", disabled: !current.experts.some((e) => candidateReceipt(s, projectId, e).review === "passed"), onClick: () => toast("当前画像已通过名单的导出服务尚未接入") }, "导出已通过名单"),
          n("button", { className: "eo-btn primary", disabled: !roleConfirmed(current.role) || roleDraftPending(projectId, current.role) || s.projects.find((p) => p.id === projectId)?.ended, onClick: () => { try { matchConfirmedRole(projectId, current.role.id) } catch (err) { toast(err.message) } } }, current.experts.length ? "重新匹配" : "开始匹配")) : null),
      current.role.deletedAt ? n("p", { className: "eo-match-history-note" }, "画像已删除，历史匹配与人工审核结论保留。此处仅供查看，不再匹配、审核或导出，也不会将专家自动转入其他画像。") : null,
      !current.role.deletedAt && (!roleConfirmed(current.role) || roleDraftPending(projectId, current.role)) ? n("div", { className: "eo-role-confirm eo-role-confirm-detail" }, n("span", null, "请先核对并确认当前画像，再开始匹配。"), n("button", { className: "eo-btn", onClick: () => openProjectSpace(projectId, "recruitment", current.role.id) }, "前往确认画像")) : null,
      n(BoardView, { key: current.role.id + (current.role.deletedAt ? ":archive" : ""), projectId, experts: current.experts, role: current.role }))
    return n("section", { className: "eo-matching-overview" },
      n("div", { className: "eo-role-list-head" }, n("div", null, n("h3", null, "选择专家画像"), n("p", null, "选择岗位画像，查看匹配建议并完成人工审核。")),
        n("button", { className: "eo-btn", onClick: () => openProjectSpace(projectId, "recruitment") }, "管理画像")),
      n("div", { className: "eo-role-grid" }, groups.active.map(card)),
      !groups.active.length ? n("div", { className: "eo-card eo-pad eo-role-empty" }, n("h3", null, "暂无可用画像"),
        n("p", null, "请先在岗位要求中添加专家画像，再开始匹配。"),
        n("button", { className: "eo-btn primary", onClick: () => openProjectSpace(projectId, "recruitment") }, "前往岗位要求")) : null,
      groups.archived.length ? n("details", { className: "eo-match-archive" }, n("summary", null, "已删除画像 · 历史记录（" + groups.archived.length + "）"),
        n("div", { className: "eo-role-grid" }, groups.archived.map(card))) : null)
  }

  // Knowledge sources reuse project originals. Built-in excerpts are explicitly marked as demo content.
  function knowledgeDocuments(state) {
    const docs = []
    for (const project of state.projects.filter((p) => !p.deletedAt)) {
      const result = RECRUITMENT_RESULTS[project.id]
      if (result?.source) docs.push({ id: "example:" + project.id, name: project.title + "需求原文（示例）",
        project: project.title, projectId: project.id, sample: true,
        paragraphs: result.source.map((paragraph) => paragraph.map((part) => Array.isArray(part) ? part[0] : part).join("")) })
    }
    for (const [projectId, files] of Object.entries(state.documents)) {
      const project = state.projects.find((p) => p.id === projectId && !p.deletedAt)
      if (projectId !== "__knowledge" && !project) continue
      for (const file of files) docs.push({ id: JSON.stringify([projectId, file.name, file.size, file.lastModified]),
        name: file.name, project: project?.title || "通用知识库", projectId, file, paragraphs: [] })
    }
    return docs
  }

  function knowledgeAnswer(question, docs, selectedId) {
    const scope = selectedId ? docs.filter((d) => d.id === selectedId) : docs
    if (!scope.length) return { text: "当前没有可查询的文档，请先上传或重新选择文档。", citations: [] }
    const readable = scope.filter((d) => d.paragraphs.length)
    if (!readable.length) return { text: "已收到问题，但所选文档尚未解析。当前仅暂存原文件，无法读取其中的内容或据此作答；需接入文档解析与模型服务后启用。", citations: [] }
    const summary = /总结|概述|主要内容|摘要/.test(question)
    const terms = [...new Set((question.toLowerCase().match(/[a-z0-9]+|[\u4e00-\u9fff]{2,}/g) || []).flatMap((term) =>
      /^[\u4e00-\u9fff]+$/.test(term) ? Array.from({ length: term.length - 1 }, (_, i) => term.slice(i, i + 2)) : [term]))]
      .filter((term) => !["什么", "哪些", "这个", "这份", "文档", "请问", "多少", "一下", "帮我", "要求"].includes(term))
    const hits = readable.flatMap((doc) => doc.paragraphs.map((quote, index) => ({ docId: doc.id, name: doc.name, quote, paragraph: index + 1,
      score: terms.reduce((score, term) => score + Number(quote.toLowerCase().includes(term)), 0) })))
      .filter((hit) => summary || hit.score > 0).sort((a, b) => b.score - a.score).slice(0, 4)
    if (!hits.length) return { text: "未在可读取的示例原文中找到相关内容。当前为关键词检索演示，不会补写没有来源的结论；上传的 PDF / Word 仍待解析。", citations: [] }
    return { text: "以下为示例原文的相关片段（本地检索演示，非模型生成答案）。" +
      (scope.some((d) => !d.paragraphs.length) ? " 尚未解析的上传文件未参与检索。" : ""), citations: hits }
  }

  // Finder-style knowledge workspace: root folders + documents, with rename / move / delete.
  function KnowledgeView() {
    const s = useStore()
    const meta = s.kbMeta || { folders: [], docs: {}, hidden: [] }
    const [search, setSearch] = useState("")
    const [renaming, setRenaming] = useState(null)
    const [draftName, setDraftName] = useState("")
    const [dragId, setDragId] = useState(null)
    const folderId = s.kbFolderId || null
    const docs = knowledgeDocuments(s)
      .filter((d) => !meta.hidden.includes(d.id))
      .map((d) => ({ ...d, displayName: (meta.docs[d.id] && meta.docs[d.id].name) || d.name,
        folderId: (meta.docs[d.id] && meta.docs[d.id].folderId) || null }))
    const selected = docs.find((d) => d.id === s.knowledgeSelected)
    const current = meta.folders.find((f) => f.id === folderId) || null
    const q = search.trim().toLowerCase()
    const inFolder = current ? docs.filter((d) => d.folderId === current.id) : docs
    const shownDocs = q ? docs.filter((d) => (d.displayName + " " + d.project).toLowerCase().includes(q)) : inFolder
    const shownFolders = q ? meta.folders.filter((f) => f.name.toLowerCase().includes(q)) : (current ? [] : meta.folders)

    function commit(next) { const merged = { ...meta, ...next }; set({ kbMeta: merged }); persistKbMeta(merged) }
    function setDocMeta(id, patch) { commit({ docs: { ...meta.docs, [id]: { ...(meta.docs[id] || {}), ...patch } } }) }
    function startRename(kind, id, name) { setRenaming({ kind, id }); setDraftName(name) }
    function finishRename() {
      const name = draftName.trim()
      if (!renaming || !name) { setRenaming(null); return }
      if (renaming.kind === "folder") commit({ folders: meta.folders.map((f) => (f.id === renaming.id ? { ...f, name } : f)) })
      else setDocMeta(renaming.id, { name })
      setRenaming(null)
    }
    function addFolder() {
      const id = "kb-folder-" + Date.now().toString(36)
      commit({ folders: [...meta.folders, { id, name: "新建文件夹", createdAt: new Date().toISOString() }] })
      startRename("folder", id, "新建文件夹")
    }
    function removeFolder(id) {
      const nextDocs = {}
      for (const [key, value] of Object.entries(meta.docs)) nextDocs[key] = { ...value, folderId: value.folderId === id ? null : value.folderId }
      commit({ folders: meta.folders.filter((f) => f.id !== id), docs: nextDocs })
      if (folderId === id) set({ kbFolderId: null })
    }
    function removeDoc(id) { commit({ hidden: [...meta.hidden, id] }); if (s.knowledgeSelected === id) set({ knowledgeSelected: null }) }
    function moveDoc(id, to) { if (id) setDocMeta(id, { folderId: to }) }
    function enterFolder(id) { set({ kbFolderId: id, knowledgeSelected: null }) }

    const fileKind = (name) => {
      const ext = (name.split(".").pop() || "").toLowerCase()
      if (ext === "pdf") return "pdf"
      if (["doc", "docx", "pages", "rtf"].includes(ext)) return "doc"
      if (["xls", "xlsx", "csv", "numbers"].includes(ext)) return "sheet"
      if (["ppt", "pptx", "key"].includes(ext)) return "slides"
      if (["ipynb", "py", "js", "ts", "json", "sh"].includes(ext)) return "code"
      if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image"
      return "txt"
    }
    const extLabel = (name) => (name.includes(".") ? name.split(".").pop().slice(0, 4).toUpperCase() : "FILE")

    const nameEditor = (kind, id) => n("input", { className: "eo-kb-rename", value: draftName, autoFocus: true,
      onClick: (event) => event.stopPropagation(), onChange: (event) => setDraftName(event.target.value), onBlur: finishRename,
      onKeyDown: (event) => {
        if (event.key === "Enter") { event.preventDefault(); finishRename() }
        if (event.key === "Escape") { event.preventDefault(); setRenaming(null) }
      } })

    const folderCell = (f) => n("div", { key: f.id, className: "eo-kb-cell", role: "button", tabIndex: 0, title: f.name,
        onClick: () => enterFolder(f.id),
        onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); enterFolder(f.id) } },
        onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move" },
        onDrop: (event) => { event.preventDefault(); moveDoc(event.dataTransfer.getData("text/eo-doc") || dragId, f.id); setDragId(null) } },
      n("span", { className: "eo-kb-folder-icon", "aria-hidden": true }),
      renaming && renaming.kind === "folder" && renaming.id === f.id ? nameEditor("folder", f.id) : n("span", { className: "eo-kb-name" }, f.name),
      n("span", { className: "eo-kb-cell-tools" },
        n("button", { className: "eo-kb-tool", type: "button", title: "重命名", "aria-label": "重命名 " + f.name,
          onClick: (event) => { event.stopPropagation(); startRename("folder", f.id, f.name) } }, "✎"),
        n("button", { className: "eo-kb-tool", type: "button", title: "删除文件夹", "aria-label": "删除 " + f.name,
          onClick: (event) => { event.stopPropagation(); removeFolder(f.id) } }, "✕")))

    const docCell = (d) => n("div", { key: d.id, className: "eo-kb-cell" + (d.id === selected?.id ? " on" : ""), role: "button", tabIndex: 0,
        draggable: true, title: d.displayName,
        onClick: () => set({ knowledgeSelected: d.id }),
        onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); set({ knowledgeSelected: d.id }) } },
        onDragStart: (event) => { setDragId(d.id); event.dataTransfer.setData("text/eo-doc", d.id); event.dataTransfer.effectAllowed = "move" } },
      n("span", { className: "eo-kb-file-tile " + fileKind(d.displayName), "aria-hidden": true }, n("em", null, extLabel(d.displayName))),
      renaming && renaming.kind === "doc" && renaming.id === d.id ? nameEditor("doc", d.id) : n("span", { className: "eo-kb-name" }, d.displayName),
      n("span", { className: "eo-kb-cell-sub" }, d.sample ? "示例原文" : d.project),
      n("span", { className: "eo-kb-cell-tools" },
        n("button", { className: "eo-kb-tool", type: "button", title: "重命名", "aria-label": "重命名 " + d.displayName,
          onClick: (event) => { event.stopPropagation(); startRename("doc", d.id, d.displayName) } }, "✎"),
        n("button", { className: "eo-kb-tool", type: "button", title: "删除", "aria-label": "删除 " + d.displayName,
          onClick: (event) => { event.stopPropagation(); removeDoc(d.id) } }, "✕")))

    const rootDrop = { onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move" },
      onDrop: (event) => { event.preventDefault(); moveDoc(event.dataTransfer.getData("text/eo-doc") || dragId, null); setDragId(null) } }

    return n("div", { className: "eo-knowledge" },
      n(DemandUpload, { demandId: "__knowledge", title: "知识库文档" }),
      n("div", { className: "eo-kb-nav" },
        n("div", { className: "eo-kb-toolbar" },
          n("div", { className: "eo-kb-crumbs" },
            n("button", { className: "eo-crumb" + (current ? "" : " on"), type: "button", onClick: () => set({ kbFolderId: null, knowledgeSelected: null }) }, "全部文档"),
            current ? n(React.Fragment, null, n("span", { className: "eo-crumb-sep" }, "›"),
              n("span", { className: "eo-crumb on" }, current.name)) : null,
            n("span", { className: "eo-tag" }, (q ? shownDocs.length + shownFolders.length : shownDocs.length + shownFolders.length) + " 项")),
          n("div", { className: "eo-kb-actions" },
            n("button", { className: "eo-btn", type: "button", onClick: addFolder }, "新建文件夹"),
            n("input", { type: "search", value: search, placeholder: "搜索文档", "aria-label": "搜索知识库文档",
              onChange: (event) => setSearch(event.target.value) })))),
      n("div", { className: "eo-kb-content" },
        n("div", { className: "eo-upload-note" }, current
          ? "拖拽文档到「全部文档」或其它文件夹可移动；点右上角 ✎ 重命名、✕ 删除。"
          : "双击/点击文件夹进入；把文档拖到文件夹上即可归类。"),
        (shownFolders.length || shownDocs.length) ? n("div", { className: "eo-kb-grid" },
          shownFolders.map(folderCell), shownDocs.map(docCell)) :
          n("p", { className: "eo-list-empty" }, q ? "没有符合搜索条件的文档。" : "暂无文档，上传 PDF 或 Word 开始整理知识库。"),
        current ? n("div", { className: "eo-kb-root-drop", ...rootDrop }, "拖到这里可移出文件夹") : null),
      selected ? n("section", { className: "eo-card eo-pad eo-kb-preview" },
        n("div", { className: "eo-kb-toolbar" }, n("h3", null, selected.displayName),
          n("div", { className: "eo-kb-actions" },
            n("select", { className: "eo-kb-move", value: selected.folderId || "", "aria-label": "移动到文件夹",
              onChange: (event) => moveDoc(selected.id, event.target.value || null) },
              n("option", { value: "" }, "根目录"),
              meta.folders.map((f) => n("option", { key: f.id, value: f.id }, f.name))),
            n("button", { className: "eo-btn", onClick: () => set({ knowledgeSelected: null }) }, "返回全部范围"))),
        selected.sample ? n("div", { className: "eo-kb-quotes" }, selected.paragraphs.map((text, i) =>
          n("p", { key: i }, n("small", null, "第 " + (i + 1) + " 段"), text))) :
          n("p", { className: "eo-upload-note" }, "原文件已在本次会话暂存（" + Math.max(1, Math.round(selected.file.size / 1024)) + " KB）。尚未解析正文，暂不能用于知识库问答；刷新后需重新选择文件。")) : null)
  }

  function KnowledgeAgent() {
    const s = useStore()
    const thread = useRef(null)
    const docs = knowledgeDocuments(s)
    const selected = docs.find((d) => d.id === s.knowledgeSelected)
    useEffect(() => { if (thread.current) thread.current.scrollTop = thread.current.scrollHeight }, [s.knowledgeMessages])
    function ask(value) {
      const question = value.trim()
      if (!question) return
      const answer = knowledgeAnswer(question, docs, selected?.id)
      set({ knowledgeMessages: [...store.knowledgeMessages,
        { role: "user", text: question, scope: selected?.name || "全部知识库" },
        { role: "assistant", ...answer }].slice(-40), knowledgeDraft: "" })
    }
    return n("aside", { className: "eo-agent", "aria-label": "知识库问答" },
      n("div", { className: "eo-ahead" }, "知识库问答", n("span", { className: "eo-tag" }, "演示")),
      n("div", { className: "eo-kb-scope" },
        n("label", null, "问答范围", n("select", { value: selected?.id || "", onChange: (event) => set({ knowledgeSelected: event.target.value || null }) },
          n("option", { value: "" }, "全部知识库"), docs.map((doc) => n("option", { value: doc.id, key: doc.id }, doc.name))))),
      n("div", { className: "eo-thread", ref: thread, role: "log", "aria-label": "知识库对话" },
        !s.knowledgeMessages.length ? n("div", { className: "eo-kb-welcome" },
          n("h3", null, "从资料中查找答案"),
          n("p", null, "选择左侧文档，再询问需求、预算或人员条件。回答中的来源可点击，左侧会打开对应文档。"),
          n("small", null, "当前仅检索示例原文；上传文件待解析，未接入真实模型。")) : null,
        s.knowledgeMessages.map((message, i) => n("div", { className: "eo-msg" + (message.role === "user" ? " you" : ""), key: i },
          n("div", { className: "eo-who" }, message.role === "user" ? "你 · " + message.scope : "知识库 Agent"),
          n("div", { className: "eo-bubble" }, message.text,
            message.citations?.map((cite) => n("div", { className: "eo-kb-citation", key: cite.docId + cite.paragraph },
              n("blockquote", null, cite.quote),
              n("button", { className: "eo-kb-source", disabled: !docs.some((d) => d.id === cite.docId),
                onClick: () => set({ knowledgeSelected: cite.docId }) }, cite.name + " · 第 " + cite.paragraph + " 段 →"))))))),
      n("div", { className: "eo-quick" }, ["招募人员需要哪些经验？", "报价是多少？", "总结需求文档"].map((question) =>
        n("button", { key: question, onClick: () => ask(question) }, question))),
      n("form", { className: "eo-composer", onSubmit: (event) => { event.preventDefault(); ask(s.knowledgeDraft) } },
        n("div", { className: "eo-box" }, n("textarea", { value: s.knowledgeDraft, maxLength: 2000, "aria-label": "知识库问题", placeholder: "向知识库提问…",
          onChange: (event) => set({ knowledgeDraft: event.target.value }),
          onKeyDown: (event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); ask(s.knowledgeDraft) } } }),
          n("button", { className: "eo-send", type: "submit", disabled: !s.knowledgeDraft.trim(), "aria-label": "发送知识库问题" }, "↑"))))
  }

  const LIBRARY_SOURCES = { 原识: "原识平台", 飞书: "飞书表单", 手填: "手动录入" }
  const LIBRARY_STATUSES = { A: "推荐", B: "待确认", C: "排除" }
  // Library membership depends on ever entering a project pool, independently of its current recommendation.
  function libraryExperts(state) {
    const unique = new Map()
    for (const expert of state.experts) {
      if (!expert.id || !expert.candidateProjectIds?.length) continue
      const prior = unique.get(expert.id)
      unique.set(expert.id, { ...expert, candidateProjectIds: [...new Set([...(prior?.candidateProjectIds || []), ...expert.candidateProjectIds])] })
    }
    return [...unique.values()]
  }
  function filteredLibrary(state) {
    const query = state.libraryQuery.trim().toLowerCase()
    return libraryExperts(state).filter((e) => {
      const projects = e.candidateProjectIds.map((id) => state.projects.find((p) => p.id === id)?.title || id).join(" ")
      const haystack = [e.name, e.id, e.city, LIBRARY_SOURCES[e.src] || e.src, projects].join(" ").toLowerCase()
      return (!query || haystack.includes(query)) &&
        (state.librarySource === "all" || e.src === state.librarySource) &&
        (state.libraryStatus === "all" || e.bucket === state.libraryStatus)
    })
  }
  function openExpertProject(projectId) {
    const project = store.projects.find((p) => p.id === projectId && !p.deletedAt)
    if (!project) return
    set({ nav: "project", demand: project.id, expandedDemand: project.id, tab: "p3", showEnded: project.ended, drawer: null })
  }
  function ExpertLibraryView() {
    const s = useStore()
    const all = libraryExperts(s)
    const experts = filteredLibrary(s)
    return n("div", { className: "eo-library" },
      n("div", { className: "eo-library-toolbar" },
        n("div", null, n("h3", null, "项目专家档案", n("span", { className: "eo-badge" }, all.length + " 人")),
          n("p", null, "汇总曾进入项目候选池的专家，包含待确认及排除人员；同一专家合并展示。")),
        n("span", { className: "eo-tag" }, "示例数据")),
      n("div", { className: "eo-library-filters" },
        n("input", { type: "search", "aria-label": "搜索专家库", placeholder: "姓名、ID、城市或关联项目", value: s.libraryQuery,
          onChange: (event) => set({ libraryQuery: event.target.value }) }),
        n("select", { "aria-label": "专家来源", value: s.librarySource, onChange: (event) => set({ librarySource: event.target.value }) },
          n("option", { value: "all" }, "全部来源"), Object.entries(LIBRARY_SOURCES).map(([value, label]) => n("option", { key: value, value }, label))),
        n("select", { "aria-label": "候选状态", value: s.libraryStatus, onChange: (event) => set({ libraryStatus: event.target.value }) },
          n("option", { value: "all" }, "全部候选状态"), Object.entries(LIBRARY_STATUSES).map(([value, label]) => n("option", { key: value, value }, label)))),
      n("div", { className: "eo-library-count", role: "status" }, "显示 " + experts.length + " / " + all.length + " 位专家"),
      n("div", { className: "eo-library-grid" }, experts.map((e) =>
        n("button", { key: e.id, className: "eo-card eo-library-card" + (s.librarySelected === e.id ? " on" : ""),
          "aria-label": "查看专家 " + e.name, "aria-pressed": s.librarySelected === e.id,
          onClick: () => set({ librarySelected: e.id }) },
          n("div", { className: "eo-library-card-head" }, n("span", { className: "eo-avatar" }, e.name[0]),
            n("b", null, e.name), n("span", { className: "eo-tag" }, LIBRARY_SOURCES[e.src] || e.src)),
          n("p", { className: "eo-library-basics" }, e.city + " · " + e.years + " 年经验 · " + e.rate + " 元/小时"),
          n("div", { className: "eo-library-projects" }, e.candidateProjectIds.map((id) => {
            const project = s.projects.find((p) => p.id === id)
            return n("span", { key: id }, project?.title || "历史项目", project?.deletedAt ? "（已删除）" : project?.ended ? "（已结束）" : "")
          })),
          n("div", { className: "eo-library-card-foot" },
            n("span", { className: "eo-library-state " + e.bucket }, LIBRARY_STATUSES[e.bucket] || "待确认"),
            n("span", null, "关联 " + e.candidateProjectIds.length + " 个项目 · 查看档案 →"))))),
      !experts.length ? n("div", { className: "eo-card eo-pad eo-library-empty" },
        n("h3", null, all.length ? "没有符合条件的专家" : "暂无项目专家"),
        n("p", null, all.length ? "调整搜索或筛选条件后重试。" : "专家进入项目候选池后，会自动汇总到这里。"),
        all.length ? n("button", { className: "eo-btn", onClick: () => set({ libraryQuery: "", librarySource: "all", libraryStatus: "all" }) }, "清除筛选") : null) : null)
  }
  function ExpertLibraryPanel() {
    const s = useStore()
    const all = libraryExperts(s)
    const expert = all.find((e) => e.id === s.librarySelected)
    return n("aside", { className: "eo-agent", "aria-label": "专家库档案" },
      n("div", { className: "eo-ahead" }, "专家档案", n("span", { className: "eo-tag" }, "示例")),
      n("div", { className: "eo-thread" }, expert ? n("div", { className: "eo-library-detail" },
        n("div", { className: "eo-kb-toolbar" }, n("h3", null, expert.name),
          n("button", { className: "eo-btn", onClick: () => set({ librarySelected: null }) }, "关闭档案")),
        n("small", null, expert.id),
        n("dl", { className: "eo-fields" }, [["来源", LIBRARY_SOURCES[expert.src] || expert.src], ["城市", expert.city], ["工作年限", expert.years + " 年"], ["参考报价", expert.rate + " 元/小时"], ["候选状态", LIBRARY_STATUSES[expert.bucket]]].map(([label, value]) =>
          n("div", { className: "eo-row", key: label }, n("dt", { className: "k" }, label), n("dd", null, value)))),
        n("h3", null, "关联项目"),
        expert.candidateProjectIds.map((id) => {
          const project = s.projects.find((p) => p.id === id)
          return n("div", { className: "eo-card eo-pad eo-library-history", key: id },
            n("b", null, project?.title || "历史项目"),
            n("p", null, project?.deletedAt ? "项目已删除，保留专家历史关联。" : project?.ended ? "项目已结束，专家仍保留在库。" : "项目进行中"),
            project && !project.deletedAt ? n("button", { className: "eo-btn", onClick: () => openExpertProject(id) }, "打开项目候选池 →") : null)
        })) : n("div", { className: "eo-kb-welcome" },
        n("h3", null, "查看跨项目专家档案"), n("p", null, "点击左侧专家卡片，查看基础资料与关联项目。"),
        n("p", null, "当前汇总 " + all.length + " 位专家。项目结束或专家被排除后，历史档案仍保留。"),
        n("small", null, "当前为示例候选池数据；真实跨项目履历接口待接入。"))))
  }

  function openProjectSpace(projectId, tab, roleId = null) {
    if (!["home", "recruitment", "p3"].includes(tab) || !store.projects.some((p) => p.id === projectId && !p.deletedAt)) return
    // 点项目卡片只切换项目；只有进入具体功能页（tab 非 home）时才展开该项目下的功能菜单
    set({ nav: "project", demand: projectId, expandedDemand: tab === "home" ? null : projectId, tab, drawer: null, featureRole: { projectId, tab, roleId } })
  }

  // Navigation only: no business task execution or model-response parsing.
  function projectTaskDestination(text) {
    if (typeof text !== "string") return null
    if (/(怎么|如何|是什么|有什么区别|能不能|能否)/.test(text)) return null
    if (/(不要|不用|别|暂不)[^，。；\n]{0,6}(生成|解析|匹配|筛选|打开|进入|修改|查看)[^，。；\n]{0,8}(JD|画像|需求|专家|候选|看板)/.test(text)) return null
    const recruitment = /(打开|进入|切换到).{0,8}(岗位要求|需求与招募成果)|(?:生成|解析|修改|编辑|查看|核对|上传).{0,10}(?:JD|岗位说明|专家画像|需求文档|甲方需求)/i.test(text)
    const matching = /(打开|进入|查看|切换到).{0,8}(专家匹配|匹配看板|候选池|候选人)|(?:匹配|筛选|查找|审核).{0,8}(?:专家|候选人)/.test(text)
    return recruitment === matching ? null : recruitment ? "recruitment" : "p3"
  }

  function subscribeProjectNavigation(eventSource, projectId) {
    if (!eventSource?.subscribe || !eventSource?.getSnapshot) return () => {}
    let latestSeq = -1
    const remember = (entries) => {
      for (const entry of entries || []) if (Number.isSafeInteger(entry.event?.seq)) latestSeq = Math.max(latestSeq, entry.event.seq)
    }
    remember(eventSource.getSnapshot().entries)
    return eventSource.subscribe(() => {
      const change = eventSource.getSnapshot().change
      if (!change) return
      if (change.kind !== "append") { remember(change.entries); return }
      for (const entry of change.entries || []) {
        const event = entry.event
        if (!Number.isSafeInteger(event?.seq) || event.seq <= latestSeq) continue
        latestSeq = event.seq
        if (event.type !== "user/message" || event.data?.source?.kind !== "user") continue
        if (store.nav !== "project" || store.demand !== projectId || store.tab !== "home") continue
        const content = event.data.content
        if (!Array.isArray(content)) continue
        const text = content.filter((part) => part.type === "text").map((part) => part.text).join("\n")
        const destination = projectTaskDestination(text)
        if (destination) openProjectSpace(projectId, destination)
      }
    })
  }

  function ProjectHomeDock() {
    const project = React.useContext(ProjectHomeContext)
    return project && !project.showWelcome ? n("div", { className: "eo-home-dock" }, n(ProjectHomeCards, { project })) : null
  }

  function ProjectHomeCards({ project }) {
    const state = useStore()
    if (!project) return null
    return n("nav", { className: "eo-home-cards", "aria-label": "项目工作空间" },
      [["recruitment", "▤", "岗位要求", "上传甲方需求，生成与核对专家画像、岗位 JD"],
       ["p3", "◎", "专家匹配", "按画像匹配专家，查看 AI 建议并人工审核"]].map(([tab, icon, title, description]) =>
        n("button", { key: tab, className: "eo-home-card", title: description, "aria-pressed": state.demand === project.id && state.tab === tab, onClick: () => openProjectSpace(project.id, tab) },
          n("span", { className: "eo-home-card-icon", "aria-hidden": true }, icon),
          n("span", null, n("strong", null, title), n("small", null, description)),
          n("span", { className: "eo-home-card-arrow", "aria-hidden": true }, "→"))))
  }

  function FixedProjectChatView(props) {
    const home = React.useContext(ProjectHomeContext)
    return n(React.Fragment, null,
      home?.showWelcome ? n("div", { className: "eo-home-welcome" },
        n("h2", null, "今天想推进这个项目的哪项工作？"),
        n("p", null, "上传需求文档，开始这个项目"),
        n(ProjectHomeCards, { project: home })) : null,
      props.renderSlot("conversation.session", { view: "chat" }))
  }

  // Same embedded Conversation factory used by DSH's own sidebar chat.
  function ProjectConversation({ useSession, renderFactorySlot }) {
    const session = useSession((value) => value)
    if (session.openState === "error") return n("p", { className: "eo-chat-state", role: "alert" }, "DSH 会话加载失败，请重试或检查原生会话。")
    return renderFactorySlot("conversation.content", {
      variant: "embedded", phase: session.openState === "loading" ? "settling" : "active", hero: false,
    }, { slots: { views: FixedProjectChatView } })
  }

  function isProjectChatEmpty(snapshot) {
    return snapshot.blank === true && !snapshot.promptAttempted && !snapshot.awaitingFirstTurn && !snapshot.running && !(snapshot.pendingSubmissions?.length)
  }

  function AgentPanel({ project, home, panelOpen, sessions, SessionProvider, renderSlot }) {
    const [reference, setReference] = useState(null)
    const [blank, setBlank] = useState(false)
    const [error, setError] = useState("")
    const [attempt, setAttempt] = useState(0)
    useEffect(() => {
      if (!project) return
      let disposed = false, held, unsubscribeNavigation, unsubscribeSession
      setReference(null); setError(""); setBlank(false)
      ensureProjectSession(sessions, project).then(async (id) => {
        if (disposed) return
        held = sessions.retain(id, { source: "expertOpsPanel" })
        const binding = await held.ready
        if (disposed) return
        if (binding.session.getSnapshot().openState === "error") throw new Error("DSH 未能打开该项目会话，请检查连接后重试；不会自动创建替代会话。")
        unsubscribeNavigation = subscribeProjectNavigation(binding.session.eventSource, project.id)
        const updateBlank = () => { if (!disposed) setBlank(isProjectChatEmpty(binding.session.getSnapshot())) }
        updateBlank()
        unsubscribeSession = binding.session.subscribe(updateBlank)
        setReference(held)
      }).catch((err) => {
        unsubscribeNavigation?.(); unsubscribeSession?.()
        held?.release(); held = null
        if (!disposed) setError(err.message || "原生会话连接失败")
      })
      return () => { disposed = true; unsubscribeNavigation?.(); unsubscribeSession?.(); held?.release() }
    }, [project?.id, sessions, attempt])
    return n("aside", { className: "eo-agent", "aria-label": "项目原生聊天" },
      n("div", { className: "eo-ahead" }, "运营 Agent", n("span", { className: "st" }, reference ? "DSH 原生会话" : error ? "连接失败" : "正在连接")),
      n("div", { className: "eo-chat-context", title: project?.title }, project ? project.title + " · 独立对话" : "请先新建项目"),
      n("div", { className: "eo-native-chat" }, reference ? n(ProjectHomeContext.Provider, { value: home && project ? { ...project, showWelcome: blank && !panelOpen } : null }, n(SessionProvider, { session: reference }, renderSlot("expert-ops.conversation", {}))) :
        n("div", { className: "eo-chat-state", role: error ? "alert" : "status" }, error || (project ? "正在加载项目会话…" : "暂无项目"),
          error ? n("button", { className: "eo-btn", onClick: () => setAttempt((x) => x + 1) }, "重试连接") : null)))
  }

  function Drawer({ expert }) {
    const s = useStore()
    const e = s.experts.find((x) => x.id === expert.id && x.candidateProjectIds.includes(expert.projectId))
    if (!e) return null
    let matchedRole
    try { matchedRole = loadRoles(expert.projectId).find((r) => r.id === candidateRoleId(e, expert.projectId)) } catch (_) {}
    const status = e.bucket === "A" ? ["推荐", "#ecfdf5", "#047857"] : e.bucket === "B" ? ["待确认", "#fffbeb", "#b45309"] : ["排除", "#F1F1F0", "#6E6A60"]
    const dims = [["专业匹配", 35, 0.92], ["经验年限", 25, 0.8], ["产能 / 档期", 15, 0.85], ["报价", 15, 0.7], ["信誉 / 历史", 10, 0.9]]
    const archived = !!matchedRole?.deletedAt || !!expert.readOnly
    const move = (review) => {
      if (archived) return
      if (reviewCandidates(expert.projectId, [e.id], review)) {
        set({ drawer: null })
        toast(review === "passed" ? "已人工确认通过" : review === "excluded" ? "已人工确认排除" : "已恢复待人工确认")
      }
    }
    return n("div", { className: "eo-dw", onClick: (ev) => { if (ev.target === ev.currentTarget) set({ drawer: null }) } },
      n("div", { className: "eo-drawer" },
        n("button", { className: "eo-x", "aria-label": "关闭专家详情", onClick: () => set({ drawer: null }) }, "✕"),
        n("h2", null, e.name),
        n("p", { className: "eo-pool-role" }, "匹配画像：" + (matchedRole?.name || "历史画像") + (matchedRole?.deletedAt ? " · 画像已删除" : "")),
        n("div", { className: "eo-meta", style: { marginBottom: 8 } },
          n("span", null, e.src === "原识" ? "原识平台" : e.src === "飞书" ? "飞书表单" : "业务手填"),
          n("span", null, e.city + " · " + e.years + " 年 · " + e.rate + " 元/小时")),
        n("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          n("span", { className: "eo-tag", style: { background: status[1], color: status[2] } }, status[0]),
          n("span", { style: { fontSize: 11.5, color: "#91888A" } }, "AI 综合分"),
          n("b", { style: { fontSize: 17, color: "#B4623E" } }, e.score)),
        n("h3", { style: { margin: "15px 0 6px", fontSize: 12.3, color: "#2C2A27" } }, "维度评分"),
        dims.map(([k, w, r]) => n("div", { className: "eo-dim", key: k },
          n("div", { className: "r" }, n("span", null, k, " ", n("span", { style: { color: "#91888A" } }, "(" + w + ")")),
            n("span", null, Math.round(w * r) + "/" + w)),
          n("div", { className: "eo-bar" }, n("i", { style: { width: Math.round(r * 100) + "%" } })))),
        n("h3", { style: { margin: "13px 0 4px", fontSize: 12.3, color: "#2C2A27" } }, "匹配理由"),
        n("div", { className: "eo-why", style: { fontSize: 12.1 } }, e.why),
        n("h3", { style: { margin: "13px 0 4px", fontSize: 12.3, color: "#2C2A27" } }, "缺口与追问"),
        n("div", { className: "eo-why gap", style: { fontSize: 12.1 } }, e.gap || "无"),
        archived ? n("p", { className: "eo-role-note" }, "画像已删除：仅查看历史匹配与人工结论。") : n("div", { className: "eo-dwacts" },
          n("button", { className: "eo-btn g", onClick: () => move("passed") }, "审核通过"),
          n("button", { className: "eo-btn y", onClick: () => move("pending") }, "撤销人工结论"),
          n("button", { className: "eo-btn r", onClick: () => move("excluded") }, "排除")),
        n("div", { style: { fontSize: 11.2, color: "#91888A", marginTop: 8 } }, "人工结论独立于 AI 推荐；本机保存，数据库与审核日志待接入。")))
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
    ctx.effect(() => slots.inject("conversation.input.dock", () => slots.register({
      name: "conversation.input.dock", id: "expert-ops-project-home", order: 20,
    }, ProjectHomeDock)), "expert-ops: project home dock")
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
        children: { "expert-ops.conversation": { kind: "single", scope: "session" } },
        inject: () => ({ sessions: ctx.sessions }),
      }, Workbench)
      yield slots.inject("expert-ops.conversation", () => slots.register({ name: "expert-ops.conversation" }, ProjectConversation))
    }), "expert-ops: main panel")

    console.info("[dsh-expert-ops] client apply() mounted")
  }

  module.exports = { inject, apply }
  return module.exports
} })