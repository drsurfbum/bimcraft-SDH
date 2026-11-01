/* SPDX-License-Identifier: Apache-2.0 */
// Additional pypdf-readable output; this does not replace or mark the Poppler gate passed.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {setPdf,viewItems} from '../../../app/res-sheets.js';
const image={kind:'flate',w:2,h:2,rgb:new Uint8Array(zlib.deflateSync(Buffer.from([255,0,0,0,255,0,0,0,255,255,255,0]))),alpha:null};
const view={bounds:{x0:0,y0:0,x1:100,y1:100},lines:[],images:[{m:[1,0,0,1,0,0],w:2,h:2,opacity:1,image,href:'',name:'test.png'}]};
const sheet={number:'TEST',title:'Image and attachment',items:viewItems(view,p=>p,1),views:[]};
fs.writeFileSync('.cc-test/upstream08/r52-attachment.pdf',setPdf([sheet],{paper:'a3',title:'Independent reader',attach:{name:'a.json',bytes:new Uint8Array([123,125]),mime:'application/json',desc:'Fixture'}}));
