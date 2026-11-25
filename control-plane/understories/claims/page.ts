/** The whole UI: one static page, vanilla JS, no framework. All text is set with textContent, never innerHTML. */
export const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Claims</title>
<style>
body{font:15px/1.4 system-ui,sans-serif;margin:0;padding:16px;max-width:960px;margin:auto;color:#1b1f1d;background:#f7f8f5}
h1{font-size:20px}table{width:100%;border-collapse:collapse;background:#fff}
th,td{text-align:left;padding:8px;border-bottom:1px solid #dfe3dc;vertical-align:top}
.s{font-weight:600}button{margin-right:4px}form{display:grid;gap:8px;max-width:420px;margin:16px 0}
input{padding:6px;font:inherit}#err{color:#a12020;min-height:1.4em}.wrap{overflow-x:auto}
</style></head><body>
<h1>Claims</h1><p id="who"></p><div id="err" role="alert"></div>
<form id="new"><input name="claimant" placeholder="Claimant" required maxlength="80">
<input name="description" placeholder="What happened" required maxlength="500">
<input name="amount" placeholder="Amount in dollars" required inputmode="decimal">
<button>Submit a claim</button></form>
<div class="wrap"><table><thead><tr><th>Claim</th><th>Status</th><th>Claimant</th><th>What happened</th><th>Amount</th><th>Adjuster</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
<script>
const err=document.getElementById('err'),rows=document.getElementById('rows');
async function call(method,path,body){
  const r=await fetch(path,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
  const j=await r.json();if(!r.ok)throw new Error(j.error||r.status);return j;
}
function cell(tr,text,cls){const td=document.createElement('td');td.textContent=text;if(cls)td.className=cls;tr.appendChild(td);return td;}
function btn(td,label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=()=>run(fn);td.appendChild(b);}
async function run(fn){err.textContent='';try{await fn();await load();}catch(e){err.textContent=e.message;}}
async function load(){
  const {claims}=await call('GET','/claims');rows.replaceChildren();
  for(const c of claims){
    const tr=document.createElement('tr');
    cell(tr,c.claim_id);cell(tr,c.status,'s');cell(tr,c.claimant);cell(tr,c.description);
    cell(tr,'$'+(c.amount_cents/100).toFixed(2));cell(tr,c.adjuster||'');
    const td=cell(tr,'');
    if(c.status==='submitted')btn(td,'Assign',async()=>{const a=prompt('Adjuster name');if(a)await call('PATCH','/claims/'+c.claim_id,{action:'assign',adjuster:a});});
    if(c.status==='assigned'){btn(td,'Approve',()=>call('PATCH','/claims/'+c.claim_id,{action:'approve'}));btn(td,'Deny',()=>call('PATCH','/claims/'+c.claim_id,{action:'deny'}));}
    rows.appendChild(tr);
  }
}
document.getElementById('new').onsubmit=(e)=>{e.preventDefault();const f=new FormData(e.target);
  run(async()=>{await call('POST','/claims',{claimant:f.get('claimant'),description:f.get('description'),amount_cents:Math.round(Number(f.get('amount'))*100)});e.target.reset();});};
call('GET','/metadata').then(m=>{document.getElementById('who').textContent='Jungle: '+m.prototype_id+' · synthetic data';});
run(async()=>{});
</script></body></html>`;
