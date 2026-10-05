const SUPABASE_URL='YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY='YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const login=document.querySelector('#login'), dashboard=document.querySelector('#dashboard'), tickets=document.querySelector('#tickets');
const statuses=['Pending','Under Review','Assigned to IT','Resolved'];
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const date=v=>new Intl.DateTimeFormat('en-GH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));

async function loadTickets(){
  tickets.innerHTML='<div class="rounded-2xl bg-white p-6">Loading tickets…</div>';
  const {data,error}=await db.from('tickets').select('*').order('last_updated',{ascending:false});
  if(error){tickets.innerHTML='<div class="rounded-2xl bg-red-50 p-6 text-red-700">Unable to load tickets. Check your database policies.</div>';return;}
  tickets.innerHTML=data.map(t=>`<article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200" data-id="${esc(t.id)}"><div class="flex justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-wider text-slate-400">${esc(t.ticket_id)}</p><h3 class="mt-1 text-lg font-black">${esc(t.issue_type)}</h3></div><span class="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">${esc(t.status)}</span></div><p class="mt-4 text-sm text-slate-500">Last updated: ${date(t.last_updated)}</p><label class="mt-5 block text-sm font-bold">Status<select class="status mt-2 w-full rounded-xl border p-3">${statuses.map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select></label><label class="mt-4 block text-sm font-bold">Customer-facing update<textarea class="message mt-2 w-full rounded-xl border p-3" rows="3">${esc(t.customer_message||'')}</textarea></label><button class="save mt-4 w-full rounded-xl bg-gcbblue p-3 font-bold text-white">Save update</button><p class="saveMsg mt-2 text-center text-xs"></p></article>`).join('');
  document.querySelectorAll('.save').forEach(btn=>btn.addEventListener('click',saveTicket));
}
async function saveTicket(e){
  const card=e.target.closest('article'); const id=card.dataset.id; const status=card.querySelector('.status').value; const customer_message=card.querySelector('.message').value.trim(); const msg=card.querySelector('.saveMsg');
  e.target.disabled=true; msg.textContent='Saving…';
  const {error}=await db.from('tickets').update({status,customer_message,last_updated:new Date().toISOString()}).eq('id',id);
  e.target.disabled=false; msg.textContent=error?'Update failed.':'Saved successfully.'; if(!error) setTimeout(loadTickets,700);
}

document.querySelector('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const email=document.querySelector('#email').value;const password=document.querySelector('#password').value;const {error}=await db.auth.signInWithPassword({email,password});document.querySelector('#loginError').textContent=error?error.message:'';});
document.querySelector('#logout').addEventListener('click',()=>db.auth.signOut());
document.querySelector('#refresh').addEventListener('click',loadTickets);

db.auth.onAuthStateChange((_event,session)=>{const logged=!!session;login.classList.toggle('hidden',logged);dashboard.classList.toggle('hidden',!logged);document.querySelector('#logout').classList.toggle('hidden',!logged);if(logged)loadTickets();});
