const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY';
const db = (SUPABASE_URL.startsWith('http') && !SUPABASE_ANON_KEY.startsWith('YOUR_'))
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const form = document.querySelector('#trackForm');
const input = document.querySelector('#ticketInput');
const result = document.querySelector('#result');

const stages = ['Pending', 'Under Review', 'Assigned to IT', 'Resolved'];

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function stageIndex(status) { return Math.max(0, stages.indexOf(status)); }
function date(value) { return new Intl.DateTimeFormat('en-GH', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)); }

function render(ticket) {
  const current = stageIndex(ticket.status);
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
      <div class="bg-gcbblue p-6 text-white sm:p-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div><p class="text-xs uppercase tracking-widest text-gcbgold">Ticket</p><h3 class="mt-1 text-2xl font-black">${esc(ticket.ticket_id)}</h3></div>
          <span class="rounded-full bg-white/15 px-4 py-2 text-sm font-bold">${esc(ticket.status)}</span>
        </div>
      </div>
      <div class="p-6 sm:p-8">
        <div class="grid gap-4 sm:grid-cols-2">
          <div><p class="text-xs font-semibold uppercase text-slate-400">Issue type</p><p class="mt-1 font-semibold">${esc(ticket.issue_type)}</p></div>
          <div><p class="text-xs font-semibold uppercase text-slate-400">Last updated</p><p class="mt-1 font-semibold">${date(ticket.last_updated)}</p></div>
        </div>
        <div class="mt-8">
          <p class="mb-4 text-sm font-bold text-slate-700">Progress</p>
          <div class="relative space-y-6">
            ${stages.map((stage, i) => `
              <div class="relative flex items-center gap-4">
                ${i < stages.length-1 ? `<div class="absolute left-[11px] top-7 h-7 w-0.5 ${i < current ? 'bg-gcbgold' : 'bg-slate-200'}"></div>` : ''}
                <div class="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${i <= current ? 'bg-gcbgold text-gcbblue' : 'bg-slate-200 text-slate-400'} text-xs font-black">${i <= current ? '✓' : i+1}</div>
                <span class="font-medium ${i === current ? 'text-gcbblue font-bold' : 'text-slate-600'}">${stage}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="mt-8 rounded-2xl bg-slate-50 p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest update</p>
          <p class="mt-2 text-slate-700">${esc(ticket.customer_message || 'Your complaint is being processed.')}</p>
        </div>
        <p class="mt-5 text-xs text-slate-400">Created ${date(ticket.created_at)}</p>
      </div>
    </div>`;
  result.scrollIntoView({ behavior:'smooth', block:'start' });
}

function showError(message) {
  result.classList.remove('hidden');
  result.innerHTML = `<div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"><p class="font-bold">Ticket not found</p><p class="mt-1 text-sm">${esc(message)}</p></div>`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = input.value.trim().toUpperCase();
  if (!db) { showError('Supabase is not connected yet. Add your project URL and anon/publishable key in app.js.'); return; }
  result.classList.remove('hidden');
  result.innerHTML = '<div class="rounded-2xl bg-white p-6 text-center shadow-sm">Checking ticket…</div>';
  const { data, error } = await db.from('customer_ticket_view').select('*').eq('ticket_id', id).maybeSingle();
  if (error) return showError('We could not retrieve this ticket. Please try again.');
  if (!data) return showError('Check the ticket ID and try again.');
  render(data);
});
