/* SPDX-License-Identifier: Apache-2.0 */
/** F08-A: a wall-specific seam calculation, never an axis/recipe editor.
 * One core-first envelope per supported wall. Through T segments are transient.
 * All straight geometry uses mm; detection 1 mm is NOT a measurement tolerance.
 */
import {wallGeom} from './model-arcs.js';
export const JOIN_TOL_MM = 1;
const EPS = 1e-7, ANGLE = Math.PI / 6;
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,k)=>[a[0]*k,a[1]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],cross=(a,b)=>a[0]*b[1]-a[1]*b[0],left=a=>[-a[1],a[0]],dist=(a,b)=>Math.hypot(...sub(a,b));
const near=(a,b)=>dist(a,b)<EPS,point=(w,s,y)=>add(add(w.a,mul(w.u,s)),mul(w.n,y));
const area=p=>p.reduce((s,a,i)=>s+cross(a,p[(i+1)%p.length]),0)/2;
function tidy(p) {
 let q=p.filter((a,i)=>!i||!near(a,p[i-1]));
 if(q.length>1&&near(q[0],q.at(-1)))q.pop();
 return q;
}
function valid(p) {
 if(p.length<3||!p.flat().every(Number.isFinite)||area(p)<=EPS)return false;
 for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++){
  if(i===0&&j===p.length-1)continue;
  const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];
  const u=sub(b,a),v=sub(d,c),den=cross(u,v);if(Math.abs(den)<1e-10)continue;
  const t=cross(sub(c,a),v)/den,s=cross(sub(c,a),u)/den;
  if(t>EPS&&t<1-EPS&&s>EPS&&s<1-EPS)return false;
 }
 return true;
}
function meet(p,d,q,e) {
 const c=cross(d,e);return Math.abs(c)<1e-10?null:add(p,mul(d,cross(sub(q,p),e)/c));
}
function clip(p,n,d) {
 const out=[];
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length],da=dot(a,n)-d,db=dot(b,n)-d;
  if(da>=-EPS)out.push(a);
  if((da>=-EPS)!==(db>=-EPS))out.push(add(a,mul(sub(b,a),da/(da-db))));
 }
 return tidy(out);
}
export function endJoins(w,end) {
 const e=w.joinSettings?.[end];return !w.joinIssue&&e?.allow!==false&&e?.cap!=='square';
}
function prepare(w) {
 const L=dist(w.a,w.b),u=mul(sub(w.b,w.a),1/L),n=left(u);
 const layers=w.assembly?.layers,sign=w.extSide==='right'?-1:1;
 let off=sign*w.t/2,lo=Infinity,hi=-Infinity;
 for(const l of layers||[]){
  const next=off-sign*l.t;
  if(l.core){lo=Math.min(lo,off,next);hi=Math.max(hi,off,next);}off=next;
 }
 // No invented core when an authored recipe cannot resolve.
 return {...w,L,u,n,g:wallGeom(w),lo,hi,coreOK:!!layers?.length&&Number.isFinite(lo)&&hi-lo>EPS&&!w.referenceIssue&&!w.joinIssue,
   cuts:[],caps:new Map()};
}
const rect=w=>[point(w,0,-w.t/2),point(w,w.L,-w.t/2),point(w,w.L,w.t/2),point(w,0,w.t/2)];
function squareCap(w,s,end) {
 return end==='a'?[point(w,s,w.t/2),point(w,s,-w.t/2)]:[point(w,s,-w.t/2),point(w,s,w.t/2)];
}
// Stitch only adjacent same-wall pieces with identically shared cap vertices.
// No polygon union engine or quantized topology is introduced.
function stitch(parts) {
 let edges=parts.flatMap(p=>p.map((a,i)=>[a,p[(i+1)%p.length]])).filter(([a,b])=>!near(a,b));
 for(let i=0;i<edges.length;i++)if(edges[i]){
  const j=edges.findIndex((e,k)=>k>i&&e&&near(edges[i][0],e[1])&&near(edges[i][1],e[0]));
  if(j>=0){edges[j]=null;edges[i]=null;}
 }
 edges=edges.filter(Boolean);if(!edges.length)return null;
 const p=[edges[0][0]],first=p[0];let current=edges.shift()[1];
 for(let k=0;k<10000;k++){
  if(near(current,first))return edges.length?null:tidy(p);
  p.push(current);
  const next=edges.findIndex(e=>near(e[0],current));if(next<0)return null;
  current=edges.splice(next,1)[0][1];
 }
 return null;
}
function ray(w,s,end,node) {
 const forward=end==='a',d=mul(w.u,forward?1:-1),n=left(d);
 return {w,s,end,d,n,o:point(w,s,0),lo:forward?w.lo:-w.hi,hi:forward?w.hi:-w.lo,node};
}
function connected(w,q,tol) {
 if(w.storey!=null&&q.storey!=null&&w.storey!==q.storey)return false;
 if(['a','b'].some(a=>endJoins(w,a)&&w.joinSettings?.[a]?.tee===q.guid)||['a','b'].some(a=>endJoins(q,a)&&q.joinSettings?.[a]?.tee===w.guid))return true;
 if(['a','b'].some(a=>endJoins(w,a)&&w.joinSettings?.[a]?.node&&['a','b'].some(b=>endJoins(q,b)&&q.joinSettings?.[b]?.node===w.joinSettings[a].node)))return true;
 if(w.bulge||q.bulge){
  const hits=(a,b)=>[a.a,a.b].some(p=>{const r=b.g.param(p);return r.s>=-tol&&r.s<=b.g.L+tol&&Math.abs(r.off)<=(a.t+b.t)/2+tol;});
  return hits(w,q)||hits(q,w);
 }
 const station=p=>dot(sub(p,w.a),w.u),offset=p=>dot(sub(p,w.a),w.n);
 if([w.a,w.b].some(p=>[q.a,q.b].some(r=>dist(p,r)<=tol)))return true;
 if([q.a,q.b].some(p=>station(p)>-tol&&station(p)<w.L+tol&&Math.abs(offset(p))<=(w.t+q.t)/2+tol))return true;
 const qs=p=>dot(sub(p,q.a),q.u),qo=p=>dot(sub(p,q.a),q.n);
 if([w.a,w.b].some(p=>qs(p)>-tol&&qs(p)<q.L+tol&&Math.abs(qo(p))<=(w.t+q.t)/2+tol))return true;
 const den=cross(w.u,q.u);if(Math.abs(den)<1e-10)return false;
 const p=meet(w.a,w.u,q.a,q.u);
 return station(p)>0&&station(p)<w.L&&dot(sub(p,q.a),q.u)>0&&dot(sub(p,q.a),q.u)<q.L;
}
/** Full rows from readWalls are mandatory for core/height/end semantics.
 * legacy() is the unchanged curved/generic-outline implementation.
 * Result Map has diagnostics and each joined straight ring has joinPieces for
 * layer clipping without bridging the disconnected finish bands of a T host.
 */
export function straightWallJoins(rows,legacy,{tol=JOIN_TOL_MM}={}) {
 const ordered=[...rows].sort((a,b)=>String(a.key).localeCompare(String(b.key))),W=ordered.filter(w=>w.a?.length===2&&w.b?.length===2&&[...w.a,...w.b,w.t].every(Number.isFinite)&&dist(w.a,w.b)>0&&w.t>0).map(prepare);
 const out=new Map(),diagnostics=[],seen=new Set();
 const warn=(ws,reason)=>{for(const w of ws)if(!diagnostics.some(d=>d.key===w.key&&d.reason===reason))diagnostics.push({key:w.key,reason});};
 for(let i=0;i<W.length;i++){
  if(seen.has(i))continue;const component=[i];seen.add(i);
  for(let k=0;k<component.length;k++)for(let j=0;j<W.length;j++)if(!seen.has(j)&&connected(W[component[k]],W[j],tol)){seen.add(j);component.push(j);}
  const ws=component.map(j=>W[j]);
  if(ws.some(w=>w.bulge)) {
   for(const [key,poly] of legacy(rows.filter(w=>ws.some(q=>q.key===w.key)),{tol}))out.set(key,poly);
   warn(ws,'curved-legacy');continue;
  }
  // Conservative fallback is component-wide: never leave half of a seam active.
  let issue=ws.find(w=>!w.coreOK)?'unresolved-core':null;
  if(ws.some(w=>w.t>2000||w.L<1))issue='invalid-size';
  const nodes=[];
  // Stable order and complete-link clustering; chains wider than tol refuse.
  for(const w of ws)for(const end of ['a','b']){
   if(!endJoins(w,end))continue;
   const p=w[end],identity=w.joinSettings?.[end]?.node,linked=identity?nodes.find(n=>n.identity===identity):null;
   const nearNodes=linked?[linked]:nodes.filter(n=>n.members.some(e=>dist(e.p,p)<=tol));
   if(!linked&&(nearNodes.length>1||nearNodes.some(n=>n.members.some(e=>dist(e.p,p)>tol)))){issue='ambiguous-proximity';continue;}
   const node=nearNodes[0]||{p,identity,members:[],rays:[]};if(!nearNodes.length)nodes.push(node);
   if(identity&&node.identity&&identity!==node.identity){issue='ambiguous-proximity';continue;}
   if(identity)node.identity=identity;
   node.members.push({w,end,p});node.rays.push(ray(w,end==='a'?0:w.L,end,node));
  }
  // Only true near-axis T nodes. Face-near stubs are explicit unsupported cases.
  for(const node of nodes)for(const w of ws){
   if(node.members.some(e=>e.w===w))continue;
   const s=dot(sub(node.p,w.a),w.u),off=Math.abs(dot(sub(node.p,w.a),w.n));
   const linked=node.members.some(e=>e.w.joinSettings?.[e.end]?.tee===w.guid);
   if(linked&&off>4*Math.max(w.t,...node.members.map(e=>e.w.t))){issue='unbounded-seam';continue;}
   if(linked&&(s<=tol||s>=w.L-tol)){issue='tee-outside-span';continue;}
   if(s<=tol||s>=w.L-tol||off>(linked?4*Math.max(w.t,...node.members.map(e=>e.w.t)):w.t/2+tol))continue;
   if(off>tol&&!linked){issue='near-face-tee';continue;}
   if(w.cuts.some(c=>Math.abs(c.s-s)<=tol&&c.node!==node)){issue='ambiguous-proximity';continue;}
   w.cuts.push({s,node});node.rays.push(ray(w,s,'b',node),ray(w,s,'a',node));
  }
  for(const node of nodes)for(const e of node.members){
   const host=e.w.joinSettings?.[e.end]?.tee;
   if(host&&!ws.some(w=>w.guid===host))issue='missing-tee-host';
  }
  // Interior/interior crossings cannot be represented as one connected ring
  // for both hosts with the selected ownership rule.
  for(let a=0;a<ws.length;a++)for(let b=a+1;b<ws.length;b++){
   const w=ws[a],q=ws[b],p=meet(w.a,w.u,q.a,q.u);if(!p)continue;
   const s=dot(sub(p,w.a),w.u),t=dot(sub(p,q.a),q.u);
   const known=['a','b'].some(a=>endJoins(w,a)&&(w.joinSettings?.[a]?.tee===q.guid||w.joinSettings?.[a]?.node&&['a','b'].some(b=>endJoins(q,b)&&q.joinSettings?.[b]?.node===w.joinSettings[a].node)))||['a','b'].some(b=>endJoins(q,b)&&q.joinSettings?.[b]?.tee===w.guid);
   if(!known&&s>tol&&s<w.L-tol&&t>tol&&t<q.L-tol)issue='interior-crossing';
  }
  for(const node of nodes){
   const rays=node.rays;if(rays.length<2)continue;
   if(node.identity&&node.members.some(e=>dist(e.p,node.p)>4*Math.max(...rays.map(r=>r.w.t)))){issue='unbounded-seam';continue;}
   if(rays.length>4){issue='node-degree';continue;}
   const z=rays[0].w.z??rays[0].w.baseOffset??0,h=rays[0].w.height;
   if(rays.some(r=>Math.abs((r.w.z??r.w.baseOffset??0)-z)>.005||Math.abs(r.w.height-h)>.005)){issue='height-mismatch';continue;}
   rays.sort((a,b)=>Math.atan2(a.d[1],a.d[0])-Math.atan2(b.d[1],b.d[0])||String(a.w.key).localeCompare(String(b.w.key)));
   let bad=false;
   for(let a=0;a<rays.length;a++)for(let b=a+1;b<rays.length;b++){
    const angle=Math.acos(Math.max(-1,Math.min(1,dot(rays[a].d,rays[b].d))));
    if(angle<ANGLE-1e-9||(angle>Math.PI-ANGLE+1e-9&&angle<Math.PI-1e-9))bad=true;
    if(Math.abs(angle-Math.PI)<1e-9&&rays[a].w!==rays[b].w&&rays.length===2)bad=true;
   }
   if(bad){issue='angle-or-collinear';continue;}
   const extent=4*Math.max(...rays.map(r=>r.w.t)),p=node.p;
   // Calculate locally to keep large-coordinate half-plane arithmetic stable.
   let common=[[-extent,-extent],[extent,-extent],[extent,extent],[-extent,extent]];
   for(const r of rays){
    const o=sub(r.o,p);common=clip(common,r.n,dot(o,r.n)+r.lo);
    if(common.length)common=clip(common,mul(r.n,-1),-dot(o,r.n)-r.hi);
   }
   if(common.length<3||area(common)<EPS){issue='disjoint-cores';continue;}
   const hub=add(p,mul(common.reduce((a,b)=>add(a,b),[0,0]),1/common.length));
   const seams=[];
   for(let k=0;k<rays.length;k++){
    const a=rays[k],b=rays[(k+1)%rays.length];
    let outer=meet(add(a.o,mul(a.n,a.w.t/2)),a.d,add(b.o,mul(b.n,-b.w.t/2)),b.d);
    let core=meet(add(a.o,mul(a.n,a.hi)),a.d,add(b.o,mul(b.n,b.lo)),b.d);
    // Opposite halves of a continuous T host use its transverse station.
    if(!outer&&a.w===b.w){outer=add(a.o,mul(a.n,a.w.t/2));core=add(a.o,mul(a.n,a.hi));}
    if(!outer||!core||Math.max(dist(outer,p),dist(core,p),dist(hub,p))>extent){issue='unbounded-seam';bad=true;break;}
    seams.push([outer,core,hub]);
   }
   if(bad)continue;
   for(let k=0;k<rays.length;k++){
    const r=rays[k],prev=seams[(k+rays.length-1)%rays.length],next=seams[k];
    const cap=tidy([prev[0],prev[1],hub,next[1],next[0]]); // right → left looking out
    r.w.caps.set(r.s+':'+r.end,cap.reverse());
   }
  }
  const results=[];
  if(!issue)for(const w of ws){
   const stations=[0,...w.cuts.map(c=>c.s).sort((a,b)=>a-b),w.L],parts=[];
   for(let k=0;k<stations.length-1;k++){
    const a=stations[k],b=stations[k+1],A=w.caps.get(a+':a')||squareCap(w,a,'a'),B=w.caps.get(b+':b')||squareCap(w,b,'b');
    const poly=tidy([...A,...B]);
    if(!valid(poly)){issue='short-or-invalid-seam';break;}parts.push(poly);
   }
   if(issue)break;
   let poly=parts.length===1?parts[0]:stitch(parts);
   if(poly){
    const target=(w.caps.get('0:a')||squareCap(w,0,'a')).at(-1),index=poly.findIndex(p=>near(p,target));
    if(index>=0)poly=[...poly.slice(index),...poly.slice(0,index)];
   }
   if(!poly||!valid(poly)){issue='short-or-invalid-seam';break;}
   poly.joinPieces=parts.map(p=>p.map(q=>[...q]));results.push([w.key,poly]);
  }
  if(issue){warn(ws,issue);for(const w of ws)out.set(w.key,rect(w));}
  else for(const [key,poly]of results)out.set(key,poly);
 }
 for(const w of ordered)if(!out.has(w.key))warn([w],'invalid-size');
 out.diagnostics=diagnostics;return out;
}
