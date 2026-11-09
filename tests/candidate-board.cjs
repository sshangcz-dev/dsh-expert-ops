const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const src = fs.readFileSync('plugin/lib/client.js', 'utf8');
const data = new Map();
const ctx = { localStorage: { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }, toast: () => {}, store: { candidateReceipts: {}, experts: [
  { id: 'e1', name: '同名', bucket: 'A', score: 90, src: '原识', candidateProjectIds: ['p1', 'p2'] },
  { id: 'e2', name: '同名', bucket: 'B', score: 80, src: '飞书', candidateProjectIds: ['p1'] },
  { id: 'e3', name: '第三人', bucket: 'C', score: 30, src: '手填', candidateProjectIds: ['p1'] }
] } };
ctx.set = patch => Object.assign(ctx.store, patch);
vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('  function loadCandidateReceipts'), src.indexOf('  function BoardView')) + '\nthis.api={loadCandidateReceipts,candidateReceipt,openCandidate,reviewCandidates,poolCandidates,pendingCandidates}', ctx);
const a = ctx.api, [e1, e2] = ctx.store.experts;
const receipt = (p, e) => a.candidateReceipt(ctx.store, p, e);
assert.equal(receipt('p1',e1).unread,true);
a.openCandidate('p1', e1); a.openCandidate('p1', e1);
assert.equal(a.poolCandidates(ctx.store,'p1',ctx.store.experts,{view:'all',ai:'all',source:'all',query:''})[0].id,'e2');
assert.equal(receipt('p1',e1).unread,false); assert.equal(receipt('p2',e1).unread,true); assert.equal(receipt('p1',e2).unread,true);
assert.equal(a.pendingCandidates(ctx.store,'p1',ctx.store.experts,'A').length,1);
a.reviewCandidates('p1',['e1','e2'],'passed');
assert.equal(a.pendingCandidates(ctx.store,'p1',ctx.store.experts,'A').length,0);
assert.equal(a.pendingCandidates(ctx.store,'p1',ctx.store.experts,'B').length,0);
assert.equal(a.pendingCandidates(ctx.store,'p1',ctx.store.experts,'C').length,1);
assert.equal(a.pendingCandidates(ctx.store,'p2',ctx.store.experts,'B').length,0);
assert.equal(e1.bucket,'A'); assert.equal(e2.bucket,'B'); assert.equal(receipt('p2',e1).review,'pending');
assert.equal(receipt('p1',e2).unread,true);
const filters={view:'all',ai:'all',source:'all',query:''};
assert.equal(a.poolCandidates(ctx.store,'p1',ctx.store.experts,filters)[0].id,'e3');
assert.equal(a.poolCandidates(ctx.store,'p1',ctx.store.experts,{...filters,view:'passed'}).length,2);
assert.equal(a.poolCandidates(ctx.store,'p1',ctx.store.experts,{...filters,source:'飞书',ai:'A'}).length,0);
a.reviewCandidates('p1',['e2'],'excluded'); assert.equal(receipt('p1',e2).review,'excluded');
a.reviewCandidates('p1',['e2'],'pending'); assert.equal(receipt('p1',e2).review,'pending');
assert.equal(a.pendingCandidates(ctx.store,'p1',ctx.store.experts,'B').length,1);
e1.resultRevision=2; assert.equal(receipt('p1',e1).unread,true); assert.equal(receipt('p1',e1).review,'pending');
assert.equal(a.pendingCandidates(ctx.store,'p1',ctx.store.experts,'A').length,1);
e1.resultRevision=3; assert.equal(ctx.store.experts.filter(e=>receipt('p1',e).unread).length,3);
ctx.store.candidateReceipts=a.loadCandidateReceipts(); assert.equal(receipt('p1',e2).review,'pending');
const before=JSON.stringify(ctx.store.candidateReceipts); ctx.localStorage.setItem=()=>{throw Error('quota')};
assert.equal(a.reviewCandidates('p1',['e1'],'excluded'),false); assert.equal(JSON.stringify(ctx.store.candidateReceipts),before);
console.log('PASS: unread de-duplication, project/ID isolation, AI/manual separation, filtering, reviewed sorting, update re-review, persistence and storage failure');
