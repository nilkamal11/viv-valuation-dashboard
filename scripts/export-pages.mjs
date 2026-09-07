import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { startProdServer } from '../node_modules/vinext/dist/server/prod-server.js';

// Vinext beta.5 prerenders '/' without the configured basePath. Render the
// actual repository route, and stage assets at GitHub Pages' repository root.
const base='/viv-valuation-dashboard';
assert.equal(process.env.SITE_BASE_PATH,base);
const root=process.cwd();
const out=path.join(root,'dist/pages');
const assets=path.join(root,'dist/client',base.slice(1),'_next');
assert.ok(fs.existsSync(assets),'Expected repository-prefixed assets');
const running=await startProdServer({host:'127.0.0.1',port:0,outDir:path.join(root,'dist'),noCompression:true,purpose:'prerender'});
try{
 const url=`http://127.0.0.1:${running.port}${base}/`;
 const response=await fetch(url);
 assert.equal(response.status,200,'Repository route must render successfully');
 const html=await response.text();
 assert.ok(html.includes('Net portfolio value')&&html.includes('8,303,406')&&html.includes('Reading guide'),'Refuse to publish a missing or error page');
 const rsc=await fetch(url,{headers:{RSC:'1',Accept:'text/x-component'}});
 assert.equal(rsc.status,200);assert.ok(rsc.headers.get('content-type')?.includes('text/x-component'));
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'index.html'),html);
 fs.writeFileSync(path.join(out,'index.rsc'),new Uint8Array(await rsc.arrayBuffer()));
 fs.cpSync(assets,path.join(out,'_next'),{recursive:true});
 fs.copyFileSync(path.join(root,'public/favicon.svg'),path.join(out,'favicon.svg'));
 fs.writeFileSync(path.join(out,'.nojekyll'),'');
 const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(x=>x[1]).filter(x=>x.includes('/_next/'));
 assert.ok(refs.length>0);
 for(const ref of refs){assert.ok(ref.startsWith(base+'/'));assert.ok(fs.existsSync(path.join(out,ref.slice(base.length+1).split('?')[0])),ref);}
 console.log(`GitHub Pages homepage, RSC payload and ${refs.length} asset references validated.`);
}finally{
 running.server.closeAllConnections();
 await new Promise((resolve,reject)=>running.server.close(e=>e?reject(e):resolve()));
}
