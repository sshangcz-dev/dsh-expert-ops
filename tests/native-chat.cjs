const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const file = process.argv[2];
let src = readFileSync(file, 'utf8');
src = src.slice(src.indexOf('  const PROJECT_META_KEY'), src.indexOf('  function sortedProjects')) + '\n' + src.slice(src.indexOf('  function persistProjects'), src.indexOf('  function useStore'));
function fixture(initial={}) {
 const data=new Map(Object.entries(initial));
 const context={ localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}, crypto:{randomUUID}, navigator:{}, DEMANDS:[{id:'d1',title:'A',state:'草稿'}], store:{projects:[]}, set:p=>Object.assign(context.store,p) };
 vm.createContext(context); vm.runInContext(src+'\nthis.api={ensureProjectSession,loadProjects,createProject};',context);
 let creates=0, releases=0, refreshError=false, renameError=false, loseResponse=false;
 const byId={};
 const sessions={list:{getSnapshot:()=>({byId})},manager:{getListSnapshot:()=>({state:refreshError?'error':'idle'})},refresh:async()=>{},create:async({sessionId})=>{creates++;byId[sessionId]={};if(loseResponse){loseResponse=false;throw Error('lost response')}return sessionId},retain:()=>({ready:Promise.resolve({session:{getSnapshot:()=>({openState:'open'}),rename:async()=>{if(renameError)throw Error('rename')}}}),release:()=>releases++})};
 return { ...context.api,context,data,sessions,counts:()=>({creates,releases}),byId,setRefreshError:v=>refreshError=v,setRenameError:v=>renameError=v,setLoseResponse:v=>loseResponse=v };
}
(async()=>{
 const f=fixture(); const p={id:'d1',title:'A'};
 const ids=await Promise.all(Array.from({length:10},()=>f.ensureProjectSession(f.sessions,p)));
 assert.equal(new Set(ids).size,1);assert.equal(f.counts().creates,1);assert.equal(f.counts().releases,1);
 assert.equal(await f.ensureProjectSession(f.sessions,{...p,title:'Renamed'}),ids[0]);
 const b=await f.ensureProjectSession(f.sessions,{id:'d2',title:'B'});assert.notEqual(b,ids[0]);
 const loaded=fixture(Object.fromEntries(f.data));assert.equal(await loaded.ensureProjectSession(loaded.sessions,p),ids[0]);assert.equal(loaded.counts().creates,0);
 const c=fixture();c.setLoseResponse(true);await assert.rejects(c.ensureProjectSession(c.sessions,p));const recovered=await c.ensureProjectSession(c.sessions,p);assert.equal(c.counts().creates,1);assert.ok(c.byId[recovered]);
 const d=fixture();d.setRenameError(true);await d.ensureProjectSession(d.sessions,p);assert.equal(d.counts().releases,1);
 const e=fixture();e.setRefreshError(true);await assert.rejects(e.ensureProjectSession(e.sessions,p));assert.equal(e.counts().creates,0);
 const bad=fixture({'dsh-expert-ops:project-sessions:v1':'{broken'});await assert.rejects(bad.ensureProjectSession(bad.sessions,p));assert.equal(bad.counts().creates,0);
 const storage=fixture();storage.context.localStorage.setItem=()=>{throw Error('quota')};await assert.rejects(storage.ensureProjectSession(storage.sessions,p));assert.equal(storage.counts().creates,0);assert.throws(()=>storage.createProject('No storage'));
 const custom=f.createProject('New project');assert.ok(f.loadProjects().some(x=>x.id===custom.id));
 console.log('PASS: concurrent creation, isolation, rename stability, reload binding, interrupted-create recovery, reference release, failed catalog, corrupt storage, storage quota, custom-project persistence');
})().catch(e=>{console.error(e);process.exit(1)});
