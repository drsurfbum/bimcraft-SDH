/* SPDX-License-Identifier: Apache-2.0 */
// Review images of actual browser-downloaded vector PDFs, rendered by independent Poppler.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const out=path.resolve('.cc-test/f28-c-browser');
for(const [file,page]of [['edited-section',1],['drawing-sheet',1],['assemblies',2],['legend',1]]){
 const prefix=path.join(out,'export-'+file);execFileSync('pdftoppm',['-f',String(page),'-singlefile','-scale-to','1600','-png',path.join(out,file+'.pdf'),prefix],{stdio:'inherit'});
 const name=path.basename(prefix)+'.png',b=fs.readFileSync(prefix+'.png').toString('base64'),n=Math.ceil(b.length/12000);
 if(process.env.F28_EMIT_REVIEW_FRAMES==='1')for(let i=0;i<n;i++)console.log(`F28C_EXPORT_FRAME ${name} ${i}/${n} ${b.slice(i*12000,(i+1)*12000)}`);
}
