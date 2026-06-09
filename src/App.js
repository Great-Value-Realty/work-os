import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const USERS = {
  payas:  { id:'payas',  name:'Payas',  pin:'1234', role:'Owner', avatar:'P', color:'#F5A623', tabs:['capture','todo','ea','del','approvals'], rights:{ todo:true,ea:true,del:true,approvals:true,capture:true,transfer:true,delete:true,star:true,approve:true } },
  varsha: { id:'varsha', name:'Varsha', pin:'5678', role:'EA',    avatar:'V', color:'#4A9EFF', tabs:['ea','del'],                              rights:{ todo:false,ea:true,del:true,approvals:false,capture:false,transfer:false,delete:false,star:false,approve:false } },
};

const TODO_STATUS = {
  schedule:{ label:'Scheduled',   color:'#4A9EFF', bg:'rgba(74,158,255,0.13)'  },
  waiting: { label:'Waiting',     color:'#9B8AFF', bg:'rgba(155,138,255,0.13)' },
  someday: { label:'Someday',     color:'#50C8A8', bg:'rgba(80,200,168,0.13)'  },
  done:    { label:'Done ✓',      color:'#4CAF50', bg:'rgba(76,175,80,0.13)'   },
};
const EA_STATUS = {
  todo:          { label:'To Do',       color:'#888',    bg:'rgba(136,136,136,0.12)' },
  'in-progress': { label:'In Progress', color:'#4A9EFF', bg:'rgba(74,158,255,0.13)'  },
  scheduled:     { label:'Scheduled',   color:'#50C8A8', bg:'rgba(80,200,168,0.13)'  },
  waiting:       { label:'Waiting',     color:'#9B8AFF', bg:'rgba(155,138,255,0.13)' },
  done:          { label:'Done ✓',      color:'#4CAF50', bg:'rgba(76,175,80,0.13)'   },
};
const DEL_STATUS = {
  todo:          { label:'To Do',       color:'#888',    bg:'rgba(136,136,136,0.12)' },
  'in-progress': { label:'In Progress', color:'#4A9EFF', bg:'rgba(74,158,255,0.13)'  },
  'need-help':   { label:'Need Help',   color:'#FF7A7A', bg:'rgba(255,77,77,0.13)'   },
  done:          { label:'Done ✓',      color:'#4CAF50', bg:'rgba(76,175,80,0.13)'   },
};

// ─── DB HELPERS ───────────────────────────────────────────────────────────────
const db = {
  async getTasks()      { const { data } = await supabase.from('tasks').select('*').order('created_at'); return data || []; },
  async getApprovals()  { const { data } = await supabase.from('approvals').select('*').order('approved_at',{ascending:false}); return data || []; },
  async getCapture()    { const { data } = await supabase.from('quick_capture').select('*').order('created_at',{ascending:false}); return data || []; },
  async upsertTask(t)   { await supabase.from('tasks').upsert({ id:t.id, list:t.list, text:t.text, update_note:t.update||'', delegate:t.delegate||'', status:t.status||'todo', bci:t.bci||'schedule', starred:t.starred||false, follow_up:t.followUp||false, next_follow_up:t.nextFollowUp||'', day:t.day||'', time:t.time||'', updated_at:new Date().toISOString() }); },
  async deleteTask(id)  { await supabase.from('tasks').delete().eq('id', id); },
  async upsertApproval(a){ await supabase.from('approvals').upsert({ id:a.id, text:a.text, delegate:a.delegate||'', update_note:a.update||'', from_list:a.fromList, approved_at:new Date().toISOString() }); },
  async deleteApproval(id){ await supabase.from('approvals').delete().eq('id', id); },
  async addCapture(c)   { await supabase.from('quick_capture').insert({ id:c.id, text:c.text }); },
  async deleteCapture(id){ await supabase.from('quick_capture').delete().eq('id', id); },
};

// Map DB row → app object
const rowToTask = r => ({ id:r.id, list:r.list, text:r.text, update:r.update_note, delegate:r.delegate, status:r.status, bci:r.bci, starred:r.starred, followUp:r.follow_up, nextFollowUp:r.next_follow_up, day:r.day, time:r.time });
const rowToApproval = r => ({ id:r.id, text:r.text, delegate:r.delegate, update:r.update_note, fromList:r.from_list });
const rowToCapture = r => ({ id:r.id, text:r.text, ts: new Date(r.created_at).getTime() });

// ─── SMALL UI ─────────────────────────────────────────────────────────────────
function Chip({ label, color, bg }) {
  return <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:bg, color, fontFamily:"'DM Mono',monospace", whiteSpace:'nowrap' }}>{label}</span>;
}

function UpdateField({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  useEffect(() => setDraft(value), [value]);
  const save = () => { onChange(draft); setEditing(false); };
  return editing ? (
    <div style={{ marginTop:10 }}>
      <textarea value={draft} onChange={e=>setDraft(e.target.value)} autoFocus rows={3}
        style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'9px 11px', color:'#DDD', fontSize:13, resize:'none', boxSizing:'border-box', lineHeight:1.5 }} />
      <div style={{ display:'flex', gap:8, marginTop:6 }}>
        <button onClick={()=>setEditing(false)} style={{ flex:1, padding:'7px', borderRadius:9, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#666', fontSize:12, cursor:'pointer' }}>Cancel</button>
        <button onClick={save} style={{ flex:2, padding:'7px', borderRadius:9, border:'none', background:'#F5A623', color:'#000', fontSize:12, fontWeight:700, cursor:'pointer' }}>Save</button>
      </div>
    </div>
  ) : (
    <div onClick={()=>setEditing(true)} style={{ marginTop:8, background:'rgba(255,255,255,0.04)', borderRadius:9, padding:'8px 11px', cursor:'text', border:'1px dashed rgba(255,255,255,0.07)', minHeight:34 }}>
      {value ? <p style={{ margin:0, fontSize:12, color:'#999', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{value}</p>
             : <p style={{ margin:0, fontSize:11, color:'#2E2E2E' }}>Tap to add update…</p>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const handlePin = d => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next); setErr('');
    if (next.length === 4) {
      if (next === USERS[sel].pin) { setTimeout(() => onLogin(USERS[sel]), 150); }
      else { setTimeout(() => { setPin(''); setErr('Incorrect PIN'); }, 400); }
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0C', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px' }}>
      <p style={{ margin:'0 0 4px', fontSize:10, color:'#F5A623', fontFamily:"'DM Mono',monospace", letterSpacing:2.5, textTransform:'uppercase' }}>Work OS</p>
      <h1 style={{ margin:'0 0 48px', fontSize:26, fontWeight:600, color:'#F0F0F0', letterSpacing:-0.5 }}>{sel ? 'Enter PIN' : "Who's signing in?"}</h1>

      {!sel ? (
        <div style={{ display:'flex', gap:16, width:'100%', maxWidth:340 }}>
          {Object.values(USERS).map(u => (
            <button key={u.id} onClick={() => { setSel(u.id); setPin(''); setErr(''); }} style={{ flex:1, padding:'28px 16px', borderRadius:22, border:`1.5px solid ${u.color}35`, background:`${u.color}08`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`${u.color}20`, border:`2px solid ${u.color}45`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:u.color }}>{u.avatar}</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ margin:0, fontSize:16, fontWeight:600, color:'#E0E0E0' }}>{u.name}</p>
                <p style={{ margin:'3px 0 0', fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:280 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:`${USERS[sel].color}20`, border:`2px solid ${USERS[sel].color}45`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:USERS[sel].color, marginBottom:10 }}>{USERS[sel].avatar}</div>
          <p style={{ margin:'0 0 32px', fontSize:15, color:'#AAA' }}>{USERS[sel].name}</p>
          <div style={{ display:'flex', gap:16, marginBottom:8 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ width:14, height:14, borderRadius:'50%', background:i<pin.length?USERS[sel].color:'rgba(255,255,255,0.08)', border:`1.5px solid ${i<pin.length?USERS[sel].color:'rgba(255,255,255,0.12)'}`, transition:'all 0.15s', boxShadow:i<pin.length?`0 0 8px ${USERS[sel].color}70`:'none' }} />)}
          </div>
          <p style={{ margin:'0 0 24px', fontSize:11, color:err?'#FF7A7A':'#444', fontFamily:"'DM Mono',monospace", minHeight:16 }}>{err||' '}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, width:'100%', marginBottom:20 }}>
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d,i) => (
              <button key={i} onClick={() => { if(d==='⌫'){setPin(p=>p.slice(0,-1));setErr('');} else if(d!=='') handlePin(String(d)); }}
                style={{ padding:'16px', borderRadius:14, border:'1px solid rgba(255,255,255,0.07)', background:d===''?'transparent':'rgba(255,255,255,0.05)', color:d==='⌫'?'#777':'#DDD', fontSize:d==='⌫'?18:20, fontWeight:500, cursor:d===''?'default':'pointer', fontFamily:"'DM Mono',monospace" }}>{d}</button>
            ))}
          </div>
          <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', color:'#444', fontSize:12, cursor:'pointer' }}>← Back</button>
        </div>
      )}
    </div>
  );
}

// ─── TODO CARD ────────────────────────────────────────────────────────────────
function TodoCard({ task, onUpdate, onBciChange, onTransfer, onDelete, canTransfer, canDelete }) {
  const [open, setOpen] = useState(false);
  const isDone = task.bci === 'done';
  const bci = TODO_STATUS[task.bci] || TODO_STATUS.schedule;
  return (
    <div style={{ background:isDone?'rgba(255,255,255,0.02)':'rgba(255,255,255,0.045)', border:isDone?'1px solid rgba(76,175,80,0.15)':'1px solid rgba(255,255,255,0.08)', borderLeft:`3px solid ${bci.color}`, borderRadius:13, marginBottom:8, overflow:'hidden', opacity:isDone?0.6:1 }}>
      <div style={{ padding:'11px 13px', display:'flex', gap:9, alignItems:'flex-start' }}>
        <button onClick={()=>onBciChange(task.id, isDone?'schedule':'done')} style={{ flexShrink:0, width:22, height:22, borderRadius:'50%', marginTop:2, border:isDone?'none':'1.5px solid #333', background:isDone?'#4CAF50':'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#000', transition:'all 0.15s', boxShadow:isDone?'0 0 8px rgba(76,175,80,0.4)':'none' }}>{isDone?'✓':''}</button>
        <div style={{ flex:1, cursor:'pointer' }} onClick={()=>!isDone&&setOpen(!open)}>
          <p style={{ margin:0, fontSize:14, color:isDone?'#555':'#E0E0E0', lineHeight:1.4, textDecoration:isDone?'line-through':'none' }}>{task.text}</p>
          {task.followUp && task.delegate && <span style={{ fontSize:11, color:'#F5A623', fontFamily:"'DM Mono',monospace", marginTop:3, display:'inline-block' }}>👀 {task.delegate}</span>}
          <div style={{ display:'flex', gap:5, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
            <Chip label={bci.label} color={bci.color} bg={bci.bg} />
            {task.day && !isDone && <span style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace" }}>{task.day} {task.time}</span>}
            {task.update && !open && <span style={{ fontSize:10, color:'#444' }}>💬</span>}
          </div>
        </div>
        {!isDone && <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:'2px 4px', flexShrink:0 }}>{open?'▲':'▼'}</button>}
      </div>
      {open && !isDone && (
        <div style={{ padding:'0 13px 13px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin:'10px 0 6px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Schedule bucket</p>
          <div style={{ display:'flex', gap:6 }}>
            {Object.entries(TODO_STATUS).filter(([k])=>k!=='done').map(([k,v])=>(
              <button key={k} onClick={()=>onBciChange(task.id,k)} style={{ flex:1, padding:'7px 4px', borderRadius:10, border:'none', cursor:'pointer', background:task.bci===k?v.bg:'rgba(255,255,255,0.04)', color:task.bci===k?v.color:'#444', fontSize:10, fontFamily:"'DM Mono',monospace", outline:task.bci===k?`1.5px solid ${v.color}50`:'none' }}>{v.label}</button>
            ))}
          </div>
          <p style={{ margin:'12px 0 4px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Update / Notes</p>
          <UpdateField value={task.update} onChange={v=>onUpdate(task.id,v)} />
          {canTransfer && (
            <>
              <p style={{ margin:'12px 0 6px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Transfer to</p>
              <div style={{ display:'flex', gap:6 }}>
                {[{id:'ea',icon:'🎯',label:'EA List'},{id:'del',icon:'🔁',label:'Delegated'}].map(o=>(
                  <button key={o.id} onClick={()=>onTransfer(task.id,o.id)} style={{ flex:1, padding:'8px 4px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#888', fontSize:11, fontFamily:"'DM Mono',monospace", cursor:'pointer' }}>{o.icon} {o.label}</button>
                ))}
                {canDelete && <button onClick={()=>onDelete(task.id)} style={{ padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,77,77,0.2)', background:'rgba(255,77,77,0.06)', color:'#FF7A7A', fontSize:11, cursor:'pointer' }}>✕</button>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EA CARD ──────────────────────────────────────────────────────────────────
function EaCard({ task, onUpdate, onStatusChange, onTransfer, onDone, canTransfer }) {
  const [open, setOpen] = useState(false);
  const sm = EA_STATUS[task.status] || EA_STATUS.todo;
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(74,158,255,0.1)`, borderLeft:`3px solid ${sm.color}`, borderRadius:13, marginBottom:8, overflow:'hidden' }}>
      <div style={{ padding:'11px 13px', display:'flex', gap:9, alignItems:'flex-start' }}>
        <div style={{ flex:1, cursor:'pointer' }} onClick={()=>setOpen(!open)}>
          <p style={{ margin:0, fontSize:14, color:'#E0E0E0', lineHeight:1.4 }}>{task.text}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#666' }}>→ {task.delegate}</p>
          <div style={{ display:'flex', gap:5, marginTop:6, flexWrap:'wrap' }}>
            <Chip label={sm.label} color={sm.color} bg={sm.bg} />
            {task.update && !open && <span style={{ fontSize:10, color:'#444' }}>💬</span>}
          </div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:'2px 4px', flexShrink:0 }}>{open?'▲':'▼'}</button>
      </div>
      {open && (
        <div style={{ padding:'0 13px 13px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin:'10px 0 6px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Status</p>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {Object.entries(EA_STATUS).map(([k,v])=>(
              <button key={k} onClick={()=>{ if(k==='done') onDone(task.id,'ea'); else onStatusChange(task.id,k); }} style={{ padding:'5px 11px', borderRadius:20, border:'none', cursor:'pointer', background:task.status===k?v.bg:'rgba(255,255,255,0.04)', color:task.status===k?v.color:'#444', fontSize:10, fontFamily:"'DM Mono',monospace", outline:task.status===k?`1px solid ${v.color}50`:'none' }}>{v.label}</button>
            ))}
          </div>
          <p style={{ margin:'12px 0 4px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Update / Notes</p>
          <UpdateField value={task.update} onChange={v=>onUpdate(task.id,v)} />
          {canTransfer && (
            <>
              <p style={{ margin:'12px 0 6px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Transfer to</p>
              <div style={{ display:'flex', gap:6 }}>
                {[{id:'todo',icon:'👤',label:'My Tasks'},{id:'del',icon:'🔁',label:'Delegated'}].map(o=>(
                  <button key={o.id} onClick={()=>onTransfer(task.id,'ea',o.id)} style={{ flex:1, padding:'8px 4px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#888', fontSize:11, fontFamily:"'DM Mono',monospace", cursor:'pointer' }}>{o.icon} {o.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DEL CARD ─────────────────────────────────────────────────────────────────
function DelCard({ task, onUpdate, onStatusChange, onStar, onTransfer, onDone, canStar, canTransfer }) {
  const [open, setOpen]         = useState(false);
  const [editDate, setEditDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(task.nextFollowUp||'');
  const sm = DEL_STATUS[task.status] || DEL_STATUS.todo;
  return (
    <div style={{ background:task.starred?'rgba(255,200,60,0.05)':'rgba(255,255,255,0.04)', border:task.starred?'1px solid rgba(255,200,60,0.28)':'1px solid rgba(255,255,255,0.07)', borderLeft:`3px solid ${sm.color}`, borderRadius:13, marginBottom:8, overflow:'hidden' }}>
      <div style={{ padding:'11px 13px', display:'flex', gap:8, alignItems:'flex-start' }}>
        {canStar && <button onClick={()=>onStar(task.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, padding:'1px 0', flexShrink:0, color:task.starred?'#F5C842':'#242424', filter:task.starred?'drop-shadow(0 0 5px #F5C84290)':'none', transition:'all 0.15s' }}>★</button>}
        {!canStar && task.starred && <span style={{ fontSize:16, color:'#F5C842', flexShrink:0 }}>★</span>}
        <div style={{ flex:1, cursor:'pointer' }} onClick={()=>setOpen(!open)}>
          <p style={{ margin:0, fontSize:14, color:'#E0E0E0', lineHeight:1.4 }}>{task.text}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#666' }}>→ {task.delegate}</p>
          <div style={{ display:'flex', gap:5, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
            <Chip label={sm.label} color={sm.color} bg={sm.bg} />
            {task.nextFollowUp && <Chip label={`📅 ${task.nextFollowUp}`} color="#F5A623" bg="rgba(245,166,35,0.1)" />}
            {task.update && !open && <span style={{ fontSize:10, color:'#444' }}>💬</span>}
          </div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', color:'#444', fontSize:13, cursor:'pointer', padding:'2px 4px', flexShrink:0 }}>{open?'▲':'▼'}</button>
      </div>
      {open && (
        <div style={{ padding:'0 13px 13px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin:'10px 0 6px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Status</p>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {Object.entries(DEL_STATUS).map(([k,v])=>(
              <button key={k} onClick={()=>{ if(k==='done') onDone(task.id,'del'); else onStatusChange(task.id,k); }} style={{ padding:'5px 11px', borderRadius:20, border:'none', cursor:'pointer', background:task.status===k?v.bg:'rgba(255,255,255,0.04)', color:task.status===k?v.color:'#444', fontSize:10, fontFamily:"'DM Mono',monospace", outline:task.status===k?`1px solid ${v.color}50`:'none' }}>{v.label}</button>
            ))}
          </div>
          <p style={{ margin:'12px 0 5px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Next Follow-up Date</p>
          {editDate ? (
            <div style={{ display:'flex', gap:8 }}>
              <input type="date" value={dateDraft} onChange={e=>setDateDraft(e.target.value)} style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'8px 11px', color:'#DDD', fontSize:13, fontFamily:"'DM Mono',monospace" }} />
              <button onClick={()=>{ onUpdate(task.id, task.update, dateDraft); setEditDate(false); }} style={{ padding:'8px 14px', borderRadius:9, border:'none', background:'#F5A623', color:'#000', fontSize:12, fontWeight:700, cursor:'pointer' }}>Set</button>
              <button onClick={()=>setEditDate(false)} style={{ padding:'8px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#666', fontSize:12, cursor:'pointer' }}>✕</button>
            </div>
          ) : (
            <div onClick={()=>setEditDate(true)} style={{ background:'rgba(245,166,35,0.06)', borderRadius:9, padding:'8px 11px', cursor:'pointer', border:'1px dashed rgba(245,166,35,0.2)' }}>
              {task.nextFollowUp ? <p style={{ margin:0, fontSize:12, color:'#F5A623', fontFamily:"'DM Mono',monospace" }}>📅 {task.nextFollowUp}</p> : <p style={{ margin:0, fontSize:11, color:'#3A3A3A' }}>Tap to set follow-up date…</p>}
            </div>
          )}
          <p style={{ margin:'12px 0 4px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Update / Notes</p>
          <UpdateField value={task.update} onChange={v=>onUpdate(task.id,v,task.nextFollowUp)} />
          {canTransfer && (
            <>
              <p style={{ margin:'12px 0 6px', fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1 }}>Transfer to</p>
              <div style={{ display:'flex', gap:6 }}>
                {[{id:'todo',icon:'👤',label:'My Tasks'},{id:'ea',icon:'🎯',label:'EA List'}].map(o=>(
                  <button key={o.id} onClick={()=>onTransfer(task.id,'del',o.id)} style={{ flex:1, padding:'8px 4px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#888', fontSize:11, fontFamily:"'DM Mono',monospace", cursor:'pointer' }}>{o.icon} {o.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── APPROVAL CARD ────────────────────────────────────────────────────────────
function ApprovalCard({ task, onApprove, onReject }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:'rgba(76,175,80,0.05)', border:'1px solid rgba(76,175,80,0.2)', borderLeft:'3px solid #4CAF50', borderRadius:13, marginBottom:8, overflow:'hidden' }}>
      <div style={{ padding:'11px 13px', display:'flex', gap:9, alignItems:'flex-start', cursor:'pointer' }} onClick={()=>setOpen(!open)}>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:14, color:'#E0E0E0', lineHeight:1.4 }}>{task.text}</p>
          <p style={{ margin:'3px 0 0', fontSize:11, color:'#666' }}>→ {task.delegate} · from {task.fromList==='ea'?'EA List':'Delegation'}</p>
          {task.update && <p style={{ margin:'5px 0 0', fontSize:12, color:'#888' }}>{task.update}</p>}
        </div>
        <Chip label="Pending ✓" color="#4CAF50" bg="rgba(76,175,80,0.12)" />
      </div>
      {open && (
        <div style={{ padding:'0 13px 13px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:8, paddingTop:12 }}>
          <button onClick={()=>onApprove(task.id)} style={{ flex:2, padding:'10px', borderRadius:11, border:'none', background:'#4CAF50', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' }}>✓ Approve & Close</button>
          <button onClick={()=>onReject(task.id)} style={{ flex:1, padding:'10px', borderRadius:11, border:'1px solid rgba(255,77,77,0.3)', background:'rgba(255,77,77,0.08)', color:'#FF7A7A', fontSize:13, cursor:'pointer' }}>↩ Send Back</button>
        </div>
      )}
    </div>
  );
}

// ─── QUICK CAPTURE ────────────────────────────────────────────────────────────
function QuickCapture({ items, onAdd, onDelete, onRoute }) {
  const [newText, setNewText] = useState('');
  const [routing, setRouting] = useState(null);
  const [rList, setRList]     = useState('todo');
  const [rDel, setRDel]       = useState('');

  const now = Date.now();
  const isOld = ts => now - ts > 86400000;
  const age = ts => { const h=Math.round((now-ts)/3600000); return h<24?`${h}h ago`:`${Math.round(h/24)}d ago`; };

  const add = () => { if(!newText.trim()) return; onAdd(newText.trim()); setNewText(''); };
  const confirm = () => { onRoute(routing, rList, rDel); setRouting(null); setRDel(''); };

  const LISTS = [
    { id:'todo', icon:'👤', label:'My Tasks', color:'#F5A623' },
    { id:'ea',   icon:'🎯', label:'EA List',  color:'#4A9EFF' },
    { id:'del',  icon:'🔁', label:'Delegated',color:'#9B8AFF' },
  ];

  return (
    <div style={{ padding:'0 16px' }}>
      {routing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div style={{ width:'100%', maxWidth:600, margin:'0 auto', background:'#141416', borderRadius:'20px 20px 0 0', padding:'22px 20px 44px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ margin:'0 0 4px', fontSize:10, color:'#888', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1.5 }}>Add to which list?</p>
            <p style={{ margin:'0 0 18px', fontSize:14, color:'#DDD', lineHeight:1.4 }}>{routing.text}</p>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {LISTS.map(l => (
                <button key={l.id} onClick={()=>setRList(l.id)} style={{ flex:1, padding:'11px 4px', borderRadius:12, border:'none', cursor:'pointer', background:rList===l.id?`${l.color}18`:'rgba(255,255,255,0.05)', color:rList===l.id?l.color:'#555', fontSize:11, fontFamily:"'DM Mono',monospace", outline:rList===l.id?`1.5px solid ${l.color}50`:'none' }}>
                  <div style={{ fontSize:18 }}>{l.icon}</div><div style={{ marginTop:4 }}>{l.label}</div>
                </button>
              ))}
            </div>
            {rList !== 'todo' && <input value={rDel} onChange={e=>setRDel(e.target.value)} placeholder="Delegate name (e.g. Varsha)" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 12px', color:'#DDD', fontSize:13, boxSizing:'border-box', marginBottom:14 }} />}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setRouting(null)} style={{ flex:1, padding:'12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#555', fontSize:13, cursor:'pointer' }}>Cancel</button>
              <button onClick={confirm} style={{ flex:2, padding:'12px', borderRadius:12, border:'none', background:'#F5A623', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' }}>Add →</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ background:'rgba(245,166,35,0.05)', border:'1px dashed rgba(245,166,35,0.22)', borderRadius:14, padding:14, marginBottom:14 }}>
        <p style={{ margin:'0 0 8px', fontSize:11, color:'#F5A623', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1.5 }}>⚡ Quick Capture</p>
        <div style={{ display:'flex', gap:8 }}>
          <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Capture anything instantly…" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', color:'#F0F0F0', fontSize:14 }} />
          <button onClick={add} style={{ background:'#F5A623', border:'none', borderRadius:10, padding:'10px 18px', color:'#000', fontWeight:700, fontSize:17, cursor:'pointer' }}>+</button>
        </div>
      </div>
      {items.filter(i=>isOld(i.ts)).length>0 && <p style={{ fontSize:11, color:'#FF7A7A', margin:'0 0 10px', fontFamily:"'DM Mono',monospace" }}>⚠ {items.filter(i=>isOld(i.ts)).length} items older than 24h</p>}
      {items.length===0
        ? <div style={{ textAlign:'center', padding:'40px 0', color:'#222' }}><p style={{ fontSize:28 }}>✓</p><p style={{ fontSize:12 }}>Inbox zero</p></div>
        : items.map(item => (
          <div key={item.id} style={{ background:isOld(item.ts)?'rgba(255,77,77,0.06)':'rgba(255,255,255,0.04)', border:`1px solid ${isOld(item.ts)?'rgba(255,77,77,0.2)':'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'11px 13px', marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:13, color:'#DDD', lineHeight:1.4 }}>{item.text}</p>
                <p style={{ margin:'3px 0 0', fontSize:10, color:isOld(item.ts)?'#FF7A7A':'#444', fontFamily:"'DM Mono',monospace" }}>{isOld(item.ts)?'⚠ ':''}{age(item.ts)}</p>
              </div>
              <button onClick={()=>onDelete(item.id)} style={{ background:'none', border:'none', color:'#333', fontSize:14, cursor:'pointer', padding:'2px 6px' }}>✕</button>
            </div>
            <button onClick={()=>setRouting(item)} style={{ width:'100%', marginTop:9, padding:'8px', borderRadius:9, border:'none', background:'rgba(255,255,255,0.06)', color:'#777', fontSize:12, fontFamily:"'DM Mono',monospace", cursor:'pointer' }}>Add to list → 👤 🎯 🔁</button>
          </div>
        ))
      }
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab]       = useState('capture');
  const [tasks, setTasks]   = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [capture, setCapture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState(null);
  const [todoFilter, setTodoFilter] = useState('all');
  const [eaFilter, setEaFilter]     = useState('all');
  const [delFilter, setDelFilter]   = useState('all');

  // ── Load data ──
  const loadAll = useCallback(async () => {
    const [t, a, c] = await Promise.all([db.getTasks(), db.getApprovals(), db.getCapture()]);
    setTasks(t.map(rowToTask));
    setApprovals(a.map(rowToApproval));
    setCapture(c.map(rowToCapture));
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Real-time subscriptions ──
  useEffect(() => {
    const taskSub = supabase.channel('tasks-channel')
      .on('postgres_changes', { event:'*', schema:'public', table:'tasks' }, () => loadAll())
      .on('postgres_changes', { event:'*', schema:'public', table:'approvals' }, () => loadAll())
      .on('postgres_changes', { event:'*', schema:'public', table:'quick_capture' }, () => loadAll())
      .subscribe();
    return () => supabase.removeChannel(taskSub);
  }, [loadAll]);

  const fire = msg => { setToast(msg); setTimeout(()=>setToast(null), 2000); };

  if (!currentUser) return <LoginScreen onLogin={u=>{ setCurrentUser(u); setTab(u.tabs[0]); }} />;
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0A0A0C', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div style={{ width:32, height:32, border:'3px solid rgba(245,166,35,0.2)', borderTop:'3px solid #F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#444', fontSize:12, fontFamily:"'DM Mono',monospace" }}>Loading…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const R = currentUser.rights;
  const uid = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);

  // ── Task handlers ──
  const updateTask = async (id, changes) => {
    const task = tasks.find(t=>t.id===id);
    if (!task) return;
    const updated = { ...task, ...changes };
    setTasks(prev => prev.map(t=>t.id===id?updated:t));
    await db.upsertTask(updated);
  };

  const deleteTask = async id => {
    setTasks(prev=>prev.filter(t=>t.id!==id));
    await db.deleteTask(id);
    fire('Deleted');
  };

  const transferTask = async (id, fromList, toList) => {
    const task = tasks.find(t=>t.id===id);
    if (!task) return;
    const updated = { ...task, list:toList };
    if (toList==='todo') updated.bci = 'schedule';
    setTasks(prev=>prev.map(t=>t.id===id?updated:t));
    await db.upsertTask(updated);
    fire(`Moved to ${toList==='todo'?'My Tasks':toList==='ea'?'EA List':'Delegation'}`);
  };

  const markDone = async (id, fromList) => {
    const task = tasks.find(t=>t.id===id);
    if (!task) return;
    const approval = { id:uid(), text:task.text, delegate:task.delegate||'', update:task.update||'', fromList };
    setTasks(prev=>prev.filter(t=>t.id!==id));
    setApprovals(prev=>[approval,...prev]);
    await db.deleteTask(id);
    await db.upsertApproval(approval);
    setTab('approvals');
    fire('Moved to Approvals ✓');
  };

  const approve = async id => {
    setApprovals(prev=>prev.filter(a=>a.id!==id));
    await db.deleteApproval(id);
    fire('Approved & closed ✓');
  };

  const reject = async id => {
    const a = approvals.find(x=>x.id===id);
    if (!a) return;
    const task = { id:uid(), list:a.fromList, text:a.text, update:(a.update||'')+' [Sent back]', delegate:a.delegate||'', status:'in-progress', bci:'schedule', starred:false, followUp:false, nextFollowUp:'', day:'', time:'' };
    setApprovals(prev=>prev.filter(x=>x.id!==id));
    setTasks(prev=>[task,...prev]);
    await db.deleteApproval(id);
    await db.upsertTask(task);
    fire('Sent back ↩');
  };

  // ── Capture handlers ──
  const addCapture = async text => {
    const item = { id:uid(), text, ts:Date.now() };
    setCapture(prev=>[item,...prev]);
    await db.addCapture(item);
  };

  const deleteCapture = async id => {
    setCapture(prev=>prev.filter(i=>i.id!==id));
    await db.deleteCapture(id);
  };

  const routeCapture = async (item, list, delegate) => {
    await deleteCapture(item.id);
    const task = { id:uid(), list, text:item.text, update:'', delegate:delegate||'', status:'todo', bci:'schedule', starred:false, followUp:false, nextFollowUp:'', day:'', time:'' };
    setTasks(prev=>[task,...prev]);
    await db.upsertTask(task);
    fire(`Added to ${list==='todo'?'My Tasks':list==='ea'?'EA List':'Delegation'}`);
  };

  // ── Filters ──
  const applyFilter = (items, f) => {
    if (f==='all') return items;
    if (f==='starred') return items.filter(t=>t.starred);
    return items.filter(t=>t.status===f||t.bci===f);
  };

  const todoItems = tasks.filter(t=>t.list==='todo');
  const eaItems   = tasks.filter(t=>t.list==='ea');
  const delItems  = tasks.filter(t=>t.list==='del');
  const todoCounts = { schedule:todoItems.filter(t=>t.bci==='schedule').length, waiting:todoItems.filter(t=>t.bci==='waiting').length, someday:todoItems.filter(t=>t.bci==='someday').length, done:todoItems.filter(t=>t.bci==='done').length };
  const delStarCount = delItems.filter(t=>t.starred).length;

  const ALL_TABS = [
    { id:'capture',   icon:'⚡', label:'Capture',  badge:capture.length, alert:capture.filter(i=>Date.now()-i.ts>86400000).length>0 },
    { id:'todo',      icon:'👤', label:'My Tasks',  badge:todoItems.length },
    { id:'ea',        icon:'🎯', label:'EA',         badge:eaItems.length },
    { id:'del',       icon:'🔁', label:'Delegated',  badge:delItems.length, star:delStarCount },
    { id:'approvals', icon:'✅', label:'Approvals',  badge:approvals.length, alert:approvals.length>0 },
  ];
  const TABS = ALL_TABS.filter(t=>currentUser.tabs.includes(t.id));

  // ── Layout helpers ──
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0C', display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (min-width: 768px) {
          .app-shell { display: flex !important; flex-direction: row !important; }
          .side-nav  { display: flex !important; }
          .bottom-nav { display: none !important; }
          .content-area { margin-left: 220px !important; padding-bottom: 40px !important; }
          .header-bar { margin-left: 220px !important; }
          .content-inner { max-width: 720px !important; margin: 0 auto !important; }
        }
        @media (max-width: 767px) {
          .side-nav { display: none !important; }
          .bottom-nav { display: flex !important; }
          .content-area { margin-left: 0 !important; }
          .content-inner { max-width: 100% !important; }
        }
      `}</style>

      {toast && <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', background:'#1C1C1E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'10px 20px', fontSize:13, color:'#DDD', zIndex:999, boxShadow:'0 8px 32px rgba(0,0,0,0.6)', whiteSpace:'nowrap' }}>{toast}</div>}

      {/* DESKTOP SIDE NAV */}
      <div className="side-nav" style={{ position:'fixed', left:0, top:0, bottom:0, width:220, background:'#0D0D0F', borderRight:'1px solid rgba(255,255,255,0.06)', display:'none', flexDirection:'column', padding:'28px 0', zIndex:100 }}>
        <div style={{ padding:'0 20px 24px' }}>
          <p style={{ margin:0, fontSize:9, color:'#F5A623', fontFamily:"'DM Mono',monospace", letterSpacing:2.5, textTransform:'uppercase' }}>Work OS</p>
          <p style={{ margin:'2px 0 0', fontSize:18, fontWeight:600, color:'#F0F0F0' }}>Task Manager</p>
        </div>
        {/* User pill */}
        <div style={{ margin:'0 12px 24px', padding:'10px 12px', background:`${currentUser.color}0A`, border:`1px solid ${currentUser.color}25`, borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:`${currentUser.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:currentUser.color, flexShrink:0 }}>{currentUser.avatar}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#DDD' }}>{currentUser.name}</p>
            <p style={{ margin:0, fontSize:9, color:'#555', fontFamily:"'DM Mono',monospace", textTransform:'uppercase' }}>{currentUser.role}</p>
          </div>
        </div>
        {/* Nav items */}
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', background:tab===t.id?'rgba(245,166,35,0.08)':'transparent', border:'none', borderLeft:tab===t.id?'3px solid #F5A623':'3px solid transparent', cursor:'pointer', width:'100%', textAlign:'left', transition:'all 0.15s' }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ flex:1, fontSize:13, color:tab===t.id?'#F5A623':'#777', fontFamily:"'DM Sans',sans-serif" }}>{t.label}</span>
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              {t.alert && <span style={{ width:7, height:7, borderRadius:'50%', background:t.id==='approvals'?'#4CAF50':'#FF4D4D', boxShadow:`0 0 6px ${t.id==='approvals'?'#4CAF50':'#FF4D4D'}90` }} />}
              {t.star>0 && <span style={{ fontSize:9, color:'#F5C842', fontFamily:"'DM Mono',monospace" }}>★{t.star}</span>}
              {t.badge>0 && !t.alert && <span style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", background:'rgba(255,255,255,0.06)', padding:'1px 6px', borderRadius:10 }}>{t.badge}</span>}
            </div>
          </button>
        ))}
        {/* Sign out */}
        <div style={{ marginTop:'auto', padding:'0 12px 12px' }}>
          <button onClick={()=>setCurrentUser(null)} style={{ width:'100%', padding:'10px', borderRadius:10, border:'1px solid rgba(255,255,255,0.07)', background:'transparent', color:'#555', fontSize:12, cursor:'pointer', fontFamily:"'DM Mono',monospace" }}>← Sign out</button>
        </div>
      </div>

      {/* HEADER (mobile) */}
      <div className="header-bar" style={{ padding:'52px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'linear-gradient(180deg,rgba(245,166,35,0.04) 0%,transparent 100%)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ margin:0, fontSize:10, color:'#F5A623', fontFamily:"'DM Mono',monospace", letterSpacing:2.5, textTransform:'uppercase' }}>Work OS</p>
            <h1 style={{ margin:'2px 0 0', fontSize:22, fontWeight:600, color:'#F0F0F0', letterSpacing:-0.5 }}>Task Manager</h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, background:`${currentUser.color}12`, border:`1px solid ${currentUser.color}30`, borderRadius:20, padding:'5px 10px 5px 7px' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:`${currentUser.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:currentUser.color }}>{currentUser.avatar}</div>
              <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#CCC' }}>{currentUser.name}</p>
            </div>
            <button onClick={()=>setCurrentUser(null)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'6px 10px', color:'#555', fontSize:11, cursor:'pointer' }}>Sign out</button>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:'flex', gap:6, marginTop:14 }}>
          {[
            { label:'My Tasks',  val:todoItems.length,  color:'#F5A623', show:R.todo },
            { label:'EA List',   val:eaItems.length,    color:'#4A9EFF', show:R.ea   },
            { label:'Delegated', val:delItems.length,   color:'#9B8AFF', show:R.del, star:delStarCount },
            { label:'Approvals', val:approvals.length,  color:approvals.length>0?'#4CAF50':'#333', warn:approvals.length>0, show:R.approvals },
          ].filter(s=>s.show).map(s=>(
            <div key={s.label} style={{ flex:1, background:s.warn?'rgba(76,175,80,0.08)':'rgba(255,255,255,0.04)', border:`1px solid ${s.warn?'rgba(76,175,80,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:10, padding:'7px 6px', textAlign:'center' }}>
              <p style={{ margin:0, fontSize:16, fontWeight:700, color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.val}</p>
              {s.star>0 && <p style={{ margin:0, fontSize:9, color:'#F5C842' }}>★{s.star}</p>}
              <p style={{ margin:0, fontSize:8, color:'#3A3A3A', textTransform:'uppercase', letterSpacing:0.4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="content-area" style={{ flex:1, paddingTop:14, paddingBottom:100 }}>
        <div className="content-inner" style={{ padding:'0', width:'100%' }}>

          {tab==='capture' && R.capture && (
            <QuickCapture items={capture} onAdd={addCapture} onDelete={deleteCapture} onRoute={routeCapture} />
          )}

          {tab==='todo' && (
            <div style={{ padding:'0 16px' }}>
              <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                {Object.entries(TODO_STATUS).map(([k,v])=>(
                  <button key={k} onClick={()=>setTodoFilter(todoFilter===k?'all':k)} style={{ flex:1, padding:'8px 4px', borderRadius:11, border:'none', cursor:'pointer', background:todoFilter===k?v.bg:'rgba(255,255,255,0.04)', color:todoFilter===k?v.color:'#3A3A3A', fontSize:10, fontFamily:"'DM Mono',monospace", outline:todoFilter===k?`1.5px solid ${v.color}50`:'none' }}>
                    <div style={{ fontSize:16 }}>{k==='schedule'?'📅':k==='waiting'?'⏳':k==='someday'?'💤':'✓'}</div>
                    <div style={{ marginTop:2 }}>{todoCounts[k]}</div>
                    <div style={{ fontSize:9, opacity:0.7 }}>{v.label}</div>
                  </button>
                ))}
              </div>
              {applyFilter(todoItems, todoFilter).map(task=>(
                <TodoCard key={task.id} task={task}
                  onUpdate={(id,v)=>updateTask(id,{update:v})}
                  onBciChange={(id,bci)=>updateTask(id,{bci})}
                  onTransfer={(id,dest)=>transferTask(id,'todo',dest)}
                  onDelete={deleteTask}
                  canTransfer={R.transfer} canDelete={R.delete} />
              ))}
              {applyFilter(todoItems, todoFilter).length===0 && <div style={{ textAlign:'center', padding:'36px 0', color:'#222' }}><p style={{ fontSize:28 }}>✓</p><p style={{ fontSize:12 }}>Nothing here</p></div>}
            </div>
          )}

          {tab==='ea' && (
            <div style={{ padding:'0 16px' }}>
              <div style={{ display:'flex', gap:5, marginBottom:12, overflowX:'auto' }}>
                {[{id:'all',label:'All'},...Object.entries(EA_STATUS).map(([k,v])=>({id:k,label:v.label}))].map(f=>(
                  <button key={f.id} onClick={()=>setEaFilter(f.id)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border:'none', background:eaFilter===f.id?'rgba(74,158,255,0.12)':'rgba(255,255,255,0.04)', color:eaFilter===f.id?'#4A9EFF':'#555', fontSize:11, fontFamily:"'DM Mono',monospace", cursor:'pointer' }}>{f.label}</button>
                ))}
              </div>
              {applyFilter(eaItems, eaFilter).map(task=>(
                <EaCard key={task.id} task={task}
                  onUpdate={(id,v)=>updateTask(id,{update:v})}
                  onStatusChange={(id,st)=>updateTask(id,{status:st})}
                  onTransfer={(id,from,dest)=>transferTask(id,from,dest)}
                  onDone={markDone} canTransfer={R.transfer} />
              ))}
              {applyFilter(eaItems, eaFilter).length===0 && <div style={{ textAlign:'center', padding:'36px 0', color:'#222' }}><p style={{ fontSize:28 }}>✓</p><p style={{ fontSize:12 }}>Nothing here</p></div>}
            </div>
          )}

          {tab==='del' && (
            <div style={{ padding:'0 16px' }}>
              <div style={{ display:'flex', gap:5, marginBottom:12, overflowX:'auto' }}>
                {[{id:'all',label:'All'},{id:'starred',label:'★ Starred'},{id:'need-help',label:'⚠ Need Help'},...Object.entries(DEL_STATUS).filter(([k])=>k!=='need-help').map(([k,v])=>({id:k,label:v.label}))].map(f=>(
                  <button key={f.id} onClick={()=>setDelFilter(f.id)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border:'none', background:delFilter===f.id?'rgba(155,138,255,0.12)':'rgba(255,255,255,0.04)', color:delFilter===f.id?'#9B8AFF':f.id==='need-help'?'#FF7A7A':'#555', fontSize:11, fontFamily:"'DM Mono',monospace", cursor:'pointer' }}>{f.label}</button>
                ))}
              </div>
              {[...applyFilter(delItems,delFilter).filter(t=>t.starred),...applyFilter(delItems,delFilter).filter(t=>!t.starred)].map(task=>(
                <DelCard key={task.id} task={task}
                  onUpdate={(id,v,nf)=>updateTask(id,{update:v,nextFollowUp:nf??task.nextFollowUp})}
                  onStatusChange={(id,st)=>updateTask(id,{status:st})}
                  onStar={id=>updateTask(id,{starred:!tasks.find(t=>t.id===id)?.starred})}
                  onTransfer={(id,from,dest)=>transferTask(id,from,dest)}
                  onDone={markDone} canStar={R.star} canTransfer={R.transfer} />
              ))}
              {applyFilter(delItems,delFilter).length===0 && <div style={{ textAlign:'center', padding:'36px 0', color:'#222' }}><p style={{ fontSize:28 }}>✓</p><p style={{ fontSize:12 }}>Nothing here</p></div>}
            </div>
          )}

          {tab==='approvals' && R.approvals && (
            <div style={{ padding:'0 16px' }}>
              <div style={{ background:'rgba(76,175,80,0.07)', border:'1px solid rgba(76,175,80,0.18)', borderRadius:14, padding:'12px 14px', marginBottom:14 }}>
                <p style={{ margin:0, fontSize:11, color:'#4CAF50', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:1.5 }}>✅ Approval Queue</p>
                <p style={{ margin:'3px 0 0', fontSize:11, color:'#555' }}>Tasks marked done — approve to close or send back.</p>
              </div>
              {approvals.length===0
                ? <div style={{ textAlign:'center', padding:'40px 0', color:'#222' }}><p style={{ fontSize:28 }}>✓</p><p style={{ fontSize:12 }}>Nothing to approve</p></div>
                : approvals.map(task=><ApprovalCard key={task.id} task={task} onApprove={approve} onReject={reject} />)
              }
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="bottom-nav" style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,10,12,0.97)', backdropFilter:'blur(24px)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'10px 6px 30px', display:'none', gap:2, zIndex:100 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'5px 2px', borderRadius:10 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              {t.alert && <span style={{ position:'absolute', top:-2, right:-4, width:7, height:7, background:t.id==='approvals'?'#4CAF50':'#FF4D4D', borderRadius:'50%', boxShadow:`0 0 6px ${t.id==='approvals'?'#4CAF50':'#FF4D4D'}90` }} />}
              {t.star>0 && <span style={{ position:'absolute', top:-4, right:-6, background:'rgba(245,200,66,0.18)', borderRadius:10, fontSize:9, color:'#F5C842', padding:'1px 4px', fontFamily:"'DM Mono',monospace" }}>★{t.star}</span>}
              {t.badge>0 && !t.alert && !t.star && <span style={{ position:'absolute', top:-4, right:-7, background:'rgba(255,255,255,0.1)', borderRadius:10, fontSize:9, color:'#666', padding:'1px 4px', fontFamily:"'DM Mono',monospace" }}>{t.badge}</span>}
            </div>
            <p style={{ margin:'2px 0 0', fontSize:9, fontFamily:"'DM Mono',monospace", color:tab===t.id?'#F5A623':'#333' }}>{t.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
