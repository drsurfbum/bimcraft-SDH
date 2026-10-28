/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: structured MCP ownership receipts, never UI strings. */
import { documentHistoryState } from './material-wall-agent.js';
import { docFail } from './documentation-data.js';

// Accepted MCP-01/F08 ownership semantics, on the ordinary editor journal. This
// observes confirmed results; it neither writes history nor computes progress from stack growth.
export async function documentationMutation(env, ed, name, tasks) {
  const prefix=ed.changes.map(entry=>({entry,label:entry.label,kind:entry.kind}));
  const redo=ed.undone.map(entry=>({entry,label:entry.label,kind:entry.kind}));
  const label='Assistant: '+name, confirmed=[], processed=[];
  const sourceContext=env.documentationContext?.();
  // Live rendering reparses IFC normally; its existing file-entry tag attests the owner.
  // A host without that lifecycle attestation must retain the actual IFC instance.
  const owner=env.documentationOwner?env.documentationOwner():ed.api.file(ed.mid);
  let originalFile=ed.api.file(ed.mid), first=true, stopped=null;
  const matches=(entries,expected)=>entries.length===expected.length&&expected.every((x,i)=>entries[i]===x.entry&&x.entry.label===x.label&&x.entry.kind===x.kind);
  const historyMatches=()=>ed.changes.length===prefix.length+confirmed.length&&
    matches(ed.changes.slice(0,prefix.length),prefix)&&
    confirmed.every((c,i)=>{const entry=ed.changes[prefix.length+i];return entry?.result===c.result&&entry.kind==='model'&&entry.label===label;})&&
    (confirmed.length?ed.undone.length===0:matches(ed.undone,redo));
  const verify=()=>{
    let active;try{active=env.ed();}catch{docFail('document_changed','Original document is no longer bound.');}
    if(active!==ed||!ed.api.IsModelOpen(ed.mid))docFail('document_changed','Original document changed or closed.');
    if((env.documentationOwner?env.documentationOwner():ed.api.file(ed.mid))!==owner)docFail('document_changed','Original document instance was replaced.');
    if(env.documentationContext&&env.documentationContext()!==sourceContext)docFail('source_changed','The person activated another drawing source. Further steps stopped.');
    if(!historyMatches())docFail('history_changed','History changed outside this request. Inspect again.');
    if(env.documentationEditing?.())docFail('dirty_properties','Pending Properties input changed during this request. Finish or cancel it before continuing.');
    if(env.busy?.())docFail('busy','Document is busy.');
  };
  for(const task of tasks){
    try{
      verify();
      if(task.noop){processed.push({target:task.target,changed:false,value:task.read?.(ed,null)??null});continue;}
      let ownCommit=true;
      await env.apply(name,current=>{
        if(ownCommit){
          verify();if(current!==ed)docFail('document_changed','Different editor at commit.');
          if(first){if(current.api.file(current.mid)!==originalFile)docFail('document_changed','Original IFC instance changed before commit.');first=false;originalFile=null;}
        }
        const result=task.run(current);
        if(ownCommit){
          ownCommit=false;const c={target:task.target,result,value:null,readbackAvailable:false};confirmed.push(c);
          try{c.value=task.read?.(current,result)??null;c.readbackAvailable=true;}catch{/* A confirmed mutation is not erased by readback failure. */}
          processed.push({target:task.target,changed:true,value:c.value});
        }
        return result;
      });
      verify();
      if(confirmed.at(-1)?.readbackAvailable===false)docFail('readback_unavailable','Confirmed edit completed; captured readback is unavailable. Further steps stopped.');
    }catch(e){
      if(!confirmed.length)throw e;
      stopped={code:e.documentationCode||'notification_failed',message:e.message||String(e)};break;
    }
  }
  if(!stopped&&confirmed.some(c=>!c.readbackAvailable))stopped={code:'readback_unavailable',message:'Confirmed edit completed; captured readback is unavailable.'};
  const state=documentHistoryState(ed),available=!stopped&&confirmed.length>0&&historyMatches();
  return{...state,units:'mm',ok:!stopped,changed:confirmed.length>0,requestedSteps:tasks.length,completedSteps:confirmed.length,complete:!stopped&&processed.length===tasks.length,
    steps:processed,readback:{phase:confirmed.length?'synchronous-commit':'read',current:!stopped},
    undo:{owner:available?'assistant':null,available,steps:available?confirmed.length:0,label,documentId:state.documentId,revision:state.revision},
    ...(stopped?{isError:true,code:'POST_COMMIT_INTERRUPTED',error:stopped.message,stopped}:{})};
}
