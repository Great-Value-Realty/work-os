import { useState, useEffect, useContext, createContext } from "react";

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    id:"dark", label:"Dark", icon:"🌙",
    bg:"#0A0A0C", bgSub:"#0D0D0F", bgCard:"rgba(255,255,255,0.045)",
    bgCardHover:"rgba(255,255,255,0.06)", bgInput:"rgba(255,255,255,0.06)",
    bgPanel:"rgba(255,255,255,0.04)", bgChip:"rgba(255,255,255,0.08)",
    border:"rgba(255,255,255,0.08)", borderSub:"rgba(255,255,255,0.05)",
    borderSide:"rgba(255,255,255,0.06)", borderInput:"rgba(255,255,255,0.1)",
    text:"#E0E0E0", textSub:"#666", textMuted:"#444", textDim:"#2A2A2A",
    textHeading:"#F0F0F0", textNav:"#777",
    navBg:"rgba(10,10,12,0.97)", headerGrad:"linear-gradient(180deg,rgba(245,166,35,0.04) 0%,transparent 100%)",
    statBg:"rgba(255,255,255,0.04)", statBorder:"rgba(255,255,255,0.06)",
    pillActive:"rgba(255,255,255,0.1)", pillInactive:"rgba(255,255,255,0.04)",
    pillText:"#F0F0F0", pillTextInactive:"#555",
    btnSecBg:"rgba(255,255,255,0.05)", btnSecBorder:"rgba(255,255,255,0.08)", btnSecText:"#555",
    updateBg:"rgba(255,255,255,0.04)", updateBorder:"rgba(255,255,255,0.07)", updateText:"#999",
    updatePlaceholder:"#2A2A2A", todayBg:"rgba(0,0,0,0.3)", todayBorder:"rgba(255,255,255,0.05)",
    modalBg:"#141416", modalBorder:"rgba(255,255,255,0.08)",
    numpadBg:"rgba(255,255,255,0.05)", numpadBorder:"rgba(255,255,255,0.07)",
    pinDot:"rgba(255,255,255,0.08)", pinDotBorder:"rgba(255,255,255,0.12)",
    loginCardBg:(c)=>`${c}08`,
  },
  light: {
    id:"light", label:"Light", icon:"☀️",
    bg:"#F5F5F7", bgSub:"#FFFFFF", bgCard:"#FFFFFF",
    bgCardHover:"#FAFAFA", bgInput:"#FFFFFF",
    bgPanel:"#F0F0F2", bgChip:"rgba(0,0,0,0.06)",
    border:"rgba(0,0,0,0.09)", borderSub:"rgba(0,0,0,0.06)",
    borderSide:"rgba(0,0,0,0.08)", borderInput:"rgba(0,0,0,0.12)",
    text:"#1A1A1A", textSub:"#777", textMuted:"#999", textDim:"#CCC",
    textHeading:"#111111", textNav:"#888",
    navBg:"rgba(245,245,247,0.97)", headerGrad:"linear-gradient(180deg,rgba(245,166,35,0.06) 0%,transparent 100%)",
    statBg:"#FFFFFF", statBorder:"rgba(0,0,0,0.07)",
    pillActive:"rgba(0,0,0,0.08)", pillInactive:"rgba(0,0,0,0.04)",
    pillText:"#111", pillTextInactive:"#999",
    btnSecBg:"rgba(0,0,0,0.04)", btnSecBorder:"rgba(0,0,0,0.09)", btnSecText:"#888",
    updateBg:"rgba(0,0,0,0.03)", updateBorder:"rgba(0,0,0,0.08)", updateText:"#666",
    updatePlaceholder:"#CCC", todayBg:"rgba(0,0,0,0.04)", todayBorder:"rgba(0,0,0,0.06)",
    modalBg:"#FFFFFF", modalBorder:"rgba(0,0,0,0.1)",
    numpadBg:"rgba(0,0,0,0.04)", numpadBorder:"rgba(0,0,0,0.08)",
    pinDot:"rgba(0,0,0,0.1)", pinDotBorder:"rgba(0,0,0,0.15)",
    loginCardBg:(c)=>`${c}12`,
  },
};

const ThemeCtx = createContext(THEMES.dark);
const useT = () => useContext(ThemeCtx);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const USERS = {
  payas:  { id:"payas",  name:"Payas",  pin:"1234", role:"Owner", avatar:"P", color:"#F5A623", tabs:["capture","todo","ea","del","approvals"], rights:{todo:true,ea:true,del:true,approvals:true,capture:true,transfer:true,delete:true,star:true,approve:true} },
  varsha: { id:"varsha", name:"Varsha", pin:"5678", role:"EA",    avatar:"V", color:"#4A9EFF", tabs:["ea","del"],                                         rights:{todo:false,ea:true,del:true,approvals:false,capture:false,transfer:false,delete:false,star:false,approve:false} },
};
const TODO_STATUS = { schedule:{label:"Scheduled",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},waiting:{label:"Waiting",color:"#9B8AFF",bg:"rgba(155,138,255,0.13)"},someday:{label:"Someday",color:"#50C8A8",bg:"rgba(80,200,168,0.13)"},done:{label:"Done ✓",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"} };
const EA_STATUS   = { todo:{label:"To Do",color:"#888",bg:"rgba(136,136,136,0.12)"},"in-progress":{label:"In Progress",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},scheduled:{label:"Scheduled",color:"#50C8A8",bg:"rgba(80,200,168,0.13)"},waiting:{label:"Waiting",color:"#9B8AFF",bg:"rgba(155,138,255,0.13)"},done:{label:"Done ✓",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"} };
const DEL_STATUS  = { todo:{label:"To Do",color:"#888",bg:"rgba(136,136,136,0.12)"},"in-progress":{label:"In Progress",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},"need-help":{label:"Need Help",color:"#FF7A7A",bg:"rgba(255,77,77,0.13)"},done:{label:"Done ✓",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"} };

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const today=new Date();
const dStr=d=>{const x=new Date(today);x.setDate(x.getDate()+d);return x.toISOString().split("T")[0];};
const SEED_TASKS=[
  {id:"t1",list:"todo",text:"DWALL & Capcite Mobilisation",update:"Steel order pending",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"MON",time:"10:00",followUpCount:2,createdAt:dStr(-5)},
  {id:"t2",list:"todo",text:"Project team + revenue team audit",update:"Pull numbers before meeting",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"TUE",time:"09:00",followUpCount:0,createdAt:dStr(-2)},
  {id:"t3",list:"todo",text:"Review & approve all DDs",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"WED",time:"11:00",followUpCount:1,createdAt:dStr(-10)},
  {id:"t4",list:"todo",text:"Billion dollar strategy",update:"People crazy enough to think they can change the world",delegate:"",status:"todo",bci:"someday",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-15)},
  {id:"t5",list:"todo",text:"EC & mining — follow up RS Sharma",update:"Supreme Court result expected soon",delegate:"RS Sharma",status:"in-progress",bci:"waiting",starred:false,followUp:true,nextFollowUp:dStr(0),day:"",time:"",followUpCount:4,createdAt:dStr(-20)},
  {id:"e1",list:"ea",text:"AOP Formalise draft and plan",update:"Draft due Friday — chase Kapil",delegate:"Varsha → Kapil",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:dStr(0),day:"TUE",time:"10:00",followUpCount:3,createdAt:dStr(-8)},
  {id:"e2",list:"ea",text:"Schedule Marketing & Capital meeting",update:"Adhvika, Kanshika, Bhushan, Amit, Shubhodeep",delegate:"Varsha",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:dStr(2),day:"WED",time:"09:00",followUpCount:0,createdAt:dStr(-3)},
  {id:"e3",list:"ea",text:"Brand credibility presentation — investor",update:"Pitch and refine before next investor call",delegate:"Varsha → Shubhodeep",status:"in-progress",bci:"waiting",starred:false,followUp:false,nextFollowUp:dStr(-1),day:"",time:"",followUpCount:5,createdAt:dStr(-12)},
  {id:"e4",list:"ea",text:"Europe visa — Payas + MA + PA",update:"",delegate:"Varsha → Reena",status:"todo",bci:"waiting",starred:false,followUp:false,nextFollowUp:dStr(3),day:"",time:"",followUpCount:1,createdAt:dStr(-6)},
  {id:"e5",list:"ea",text:"Subsequent meeting Munish ji — Finesta",update:"Speak 2nd June",delegate:"Varsha",status:"scheduled",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"THU",time:"11:00",followUpCount:2,createdAt:dStr(-4)},
  {id:"d1",list:"del",text:"Unconditional RERA followup",update:"Follow-up call needed this week",delegate:"Vijay ji",status:"in-progress",bci:"schedule",starred:true,followUp:false,nextFollowUp:dStr(0),day:"MON",time:"09:30",followUpCount:3,createdAt:dStr(-14)},
  {id:"d2",list:"del",text:"PMC + structure estimation",update:"Additional points — check progress",delegate:"Shailesh & Anurag",status:"in-progress",bci:"waiting",starred:true,followUp:false,nextFollowUp:dStr(1),day:"",time:"",followUpCount:2,createdAt:dStr(-9)},
  {id:"d3",list:"del",text:"Legal file compliance",update:"Stuck — needs your input",delegate:"Khushboo",status:"need-help",bci:"waiting",starred:true,followUp:false,nextFollowUp:dStr(-2),day:"",time:"",followUpCount:1,createdAt:dStr(-7)},
  {id:"d4",list:"del",text:"Quality assurance plan",update:"",delegate:"Arvind",status:"todo",bci:"waiting",starred:false,followUp:false,nextFollowUp:dStr(5),day:"",time:"",followUpCount:0,createdAt:dStr(-3)},
  {id:"d5",list:"del",text:"LMS first training video",update:"Video received ✓",delegate:"Khushmeet",status:"done",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:2,createdAt:dStr(-18)},
  {id:"d6",list:"del",text:"Board of Directors outreach",update:"Korn Ferry, Spencer Stuart, Egon Zehnder",delegate:"Varsha",status:"todo",bci:"someday",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-2)},
];
const SEED_QC=[
  {id:"qc1",text:"Steel order finalisation",ts:Date.now()-86400000*2},
  {id:"qc2",text:"Gram scuba photo uploads",ts:Date.now()-3600000*5},
  {id:"qc3",text:"Buy sunglasses",ts:Date.now()-3600000*2},
  {id:"qc4",text:"Send Sachin performance mail",ts:Date.now()-600000},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const daysSince=d=>{if(!d)return null;return Math.floor((Date.now()-new Date(d).getTime())/86400000);};
const agingColor=d=>{if(d===null)return"#999";if(d<=3)return"#4CAF50";if(d<=7)return"#F5A623";if(d<=14)return"#FF9944";return"#FF4D4D";};
const uid=()=>"id_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);

function AgingBadge({createdAt}){
  const d=daysSince(createdAt); if(d===null)return null;
  const c=agingColor(d);
  return <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${c}18`,color:c,fontFamily:"'DM Mono',monospace",border:`1px solid ${c}30`,whiteSpace:"nowrap"}}>{d===0?"Today":`${d}d`}</span>;
}
function FUBadge({count}){
  if(!count||count===0)return null;
  return <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(155,138,255,0.15)",color:"#9B8AFF",fontFamily:"'DM Mono',monospace",border:"1px solid rgba(155,138,255,0.25)",whiteSpace:"nowrap"}}>🔁 {count}</span>;
}
function Chip({label,color,bg}){return <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:bg,color,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{label}</span>;}

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({theme,setThemeName}){
  const T=useT();
  const order=["dark","light"];
  return(
    <div style={{display:"flex",gap:2,background:T.bgPanel,border:`1px solid ${T.border}`,borderRadius:20,padding:3}}>
      {order.map(id=>{
        const th=THEMES[id];
        const active=theme.id===id;
        return(
          <button key={id} onClick={()=>setThemeName(id)} style={{padding:"5px 12px",borderRadius:16,border:"none",cursor:"pointer",background:active?"#F5A623":"transparent",color:active?"#000":T.textMuted,fontSize:12,transition:"all 0.2s",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:14}}>{th.icon}</span>
            <span style={{fontSize:10}}>{th.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── UPDATE FIELD ─────────────────────────────────────────────────────────────
function UpdateField({value,onChange}){
  const T=useT();
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  const save=()=>{onChange(draft);setEditing(false);};
  return editing?(
    <div style={{marginTop:8}}>
      <textarea value={draft} onChange={e=>setDraft(e.target.value)} autoFocus rows={3}
        style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"8px 10px",color:T.text,fontSize:13,resize:"none",boxSizing:"border-box",lineHeight:1.5}}/>
      <div style={{display:"flex",gap:8,marginTop:6}}>
        <button onClick={()=>setEditing(false)} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
        <button onClick={save} style={{flex:2,padding:"7px",borderRadius:9,border:"none",background:"#F5A623",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
      </div>
    </div>
  ):(
    <div onClick={()=>setEditing(true)} style={{marginTop:6,background:T.updateBg,borderRadius:9,padding:"8px 10px",cursor:"text",border:`1px dashed ${T.updateBorder}`,minHeight:32}}>
      {value?<p style={{margin:0,fontSize:12,color:T.updateText,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{value}</p>
            :<p style={{margin:0,fontSize:11,color:T.updatePlaceholder}}>Tap to add update…</p>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin,theme,setThemeName}){
  const T=useT();
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const handlePin=d=>{
    if(pin.length>=4)return;
    const next=pin+d;setPin(next);setErr("");
    if(next.length===4){
      if(next===USERS[sel].pin){setTimeout(()=>onLogin(USERS[sel]),150);}
      else{setTimeout(()=>{setPin("");setErr("Incorrect PIN");},400);}
    }
  };
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",fontFamily:"'DM Sans',sans-serif",transition:"background 0.3s"}}>
      {/* Theme toggle top right */}
      <div style={{position:"absolute",top:24,right:24}}>
        <ThemeToggle theme={theme} setThemeName={setThemeName}/>
      </div>
      <p style={{margin:"0 0 4px",fontSize:10,color:"#F5A623",fontFamily:"'DM Mono',monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS</p>
      <h1 style={{margin:"0 0 48px",fontSize:26,fontWeight:600,color:T.textHeading,letterSpacing:-0.5}}>{sel?"Enter PIN":"Who's signing in?"}</h1>
      {!sel?(
        <div style={{display:"flex",gap:16,width:"100%",maxWidth:340}}>
          {Object.values(USERS).map(u=>(
            <button key={u.id} onClick={()=>{setSel(u.id);setPin("");setErr("");}} style={{flex:1,padding:"28px 16px",borderRadius:22,border:`1.5px solid ${u.color}35`,background:T.loginCardBg(u.color),cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:14,transition:"all 0.2s"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:`${u.color}20`,border:`2px solid ${u.color}45`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:u.color}}>{u.avatar}</div>
              <div style={{textAlign:"center"}}>
                <p style={{margin:0,fontSize:16,fontWeight:600,color:T.textHeading}}>{u.name}</p>
                <p style={{margin:"3px 0 0",fontSize:10,color:T.textSub,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:280}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:`${USERS[sel].color}20`,border:`2px solid ${USERS[sel].color}45`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:USERS[sel].color,marginBottom:10}}>{USERS[sel].avatar}</div>
          <p style={{margin:"0 0 32px",fontSize:15,color:T.textSub}}>{USERS[sel].name}</p>
          <div style={{display:"flex",gap:16,marginBottom:8}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?USERS[sel].color:T.pinDot,border:`1.5px solid ${i<pin.length?USERS[sel].color:T.pinDotBorder}`,transition:"all 0.15s",boxShadow:i<pin.length?`0 0 8px ${USERS[sel].color}70`:"none"}}/>)}
          </div>
          <p style={{margin:"0 0 24px",fontSize:11,color:err?"#FF7A7A":T.textMuted,fontFamily:"'DM Mono',monospace",minHeight:16}}>{err||" "}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%",marginBottom:20}}>
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
              <button key={i} onClick={()=>{if(d==="⌫"){setPin(p=>p.slice(0,-1));setErr("");}else if(d!=="")handlePin(String(d));}}
                style={{padding:"16px",borderRadius:14,border:`1px solid ${T.numpadBorder}`,background:d===""?"transparent":T.numpadBg,color:d==="⌫"?T.textSub:T.text,fontSize:d==="⌫"?18:20,fontWeight:500,cursor:d===""?"default":"pointer",fontFamily:"'DM Mono',monospace"}}>{d}</button>
            ))}
          </div>
          <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer"}}>← Back</button>
        </div>
      )}
    </div>
  );
}

// ─── TODAY PANEL ──────────────────────────────────────────────────────────────
function TodayPanel({tasks,onStatusChange,onDone}){
  const T=useT();
  const todayStr=new Date().toISOString().split("T")[0];
  const due=tasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=todayStr&&t.status!=="done");
  if(!due.length)return null;
  return(
    <div style={{margin:"0 16px 14px",background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.25)",borderRadius:14,padding:"12px 14px"}}>
      <p style={{margin:"0 0 10px",fontSize:11,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>📋 Today's Follow-ups ({due.length})</p>
      {due.map(t=>{
        const smap=t.list==="ea"?EA_STATUS:DEL_STATUS;
        return(
          <div key={t.id} style={{background:T.todayBg,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1px solid ${T.todayBorder}`}}>
            <p style={{margin:0,fontSize:13,color:T.text}}>{t.text}</p>
            <p style={{margin:"2px 0 6px",fontSize:11,color:T.textSub}}>→ {t.delegate}</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(smap).map(([k,v])=>(
                <button key={k} onClick={()=>k==="done"?onDone(t.id,t.list):onStatusChange(t.id,k)}
                  style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:t.status===k?v.bg:T.bgChip,color:t.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TODO CARD ────────────────────────────────────────────────────────────────
function TodoCard({task,onUpdate,onBciChange,onTransfer,onDelete,canTransfer,canDelete}){
  const T=useT();
  const [open,setOpen]=useState(false);
  const isDone=task.bci==="done";
  const bci=TODO_STATUS[task.bci]||TODO_STATUS.schedule;
  return(
    <div style={{background:isDone?T.bgPanel:T.bgCard,border:`1px solid ${isDone?"rgba(76,175,80,0.15)":T.border}`,borderLeft:`3px solid ${bci.color}`,borderRadius:13,marginBottom:8,overflow:"hidden",opacity:isDone?0.6:1,transition:"background 0.3s"}}>
      <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
        <button onClick={()=>onBciChange(task.id,isDone?"schedule":"done")} style={{flexShrink:0,width:22,height:22,borderRadius:"50%",marginTop:2,border:isDone?"none":`1.5px solid ${T.textMuted}`,background:isDone?"#4CAF50":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",transition:"all 0.15s",boxShadow:isDone?"0 0 8px rgba(76,175,80,0.4)":"none"}}>{isDone?"✓":""}</button>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>!isDone&&setOpen(!open)}>
          <p style={{margin:0,fontSize:14,color:isDone?T.textMuted:T.text,lineHeight:1.4,textDecoration:isDone?"line-through":"none"}}>{task.text}</p>
          {task.followUp&&task.delegate&&<span style={{fontSize:11,color:"#F5A623",fontFamily:"'DM Mono',monospace",marginTop:3,display:"inline-block"}}>👀 {task.delegate}</span>}
          <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
            <Chip label={bci.label} color={bci.color} bg={bci.bg}/>
            {!isDone&&<AgingBadge createdAt={task.createdAt}/>}
            <FUBadge count={task.followUpCount}/>
            {task.day&&!isDone&&<span style={{fontSize:10,color:T.textSub,fontFamily:"'DM Mono',monospace"}}>{task.day} {task.time}</span>}
            {task.update&&!open&&<span style={{fontSize:10,color:T.textMuted}}>💬</span>}
          </div>
        </div>
        {!isDone&&<button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>{open?"▲":"▼"}</button>}
      </div>
      {open&&!isDone&&(
        <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
          <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Bucket</p>
          <div style={{display:"flex",gap:6}}>
            {Object.entries(TODO_STATUS).filter(([k])=>k!=="done").map(([k,v])=>(
              <button key={k} onClick={()=>onBciChange(task.id,k)} style={{flex:1,padding:"7px 4px",borderRadius:10,border:"none",cursor:"pointer",background:task.bci===k?v.bg:T.bgPanel,color:task.bci===k?v.color:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:task.bci===k?`1.5px solid ${v.color}50`:"none"}}>{v.label}</button>
            ))}
          </div>
          <p style={{margin:"10px 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Update</p>
          <UpdateField value={task.update} onChange={v=>onUpdate(task.id,v)}/>
          {canTransfer&&(
            <>
              <p style={{margin:"10px 0 5px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Transfer to</p>
              <div style={{display:"flex",gap:6}}>
                {[{id:"ea",icon:"🎯",label:"EA"},{id:"del",icon:"🔁",label:"Delegated"}].map(o=>(
                  <button key={o.id} onClick={()=>onTransfer(task.id,o.id)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{o.icon} {o.label}</button>
                ))}
                {canDelete&&<button onClick={()=>onDelete(task.id)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.06)",color:"#FF7A7A",fontSize:11,cursor:"pointer"}}>✕</button>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EA CARD ──────────────────────────────────────────────────────────────────
function EaCard({task,onUpdate,onStatusChange,onTransfer,onDone,canTransfer}){
  const T=useT();
  const [open,setOpen]=useState(false);
  const sm=EA_STATUS[task.status]||EA_STATUS.todo;
  const todayStr=new Date().toISOString().split("T")[0];
  const due=task.nextFollowUp&&task.nextFollowUp<=todayStr&&task.status!=="done";
  return(
    <div style={{background:T.bgCard,border:due?"1px solid rgba(245,166,35,0.3)":`1px solid ${T.border}`,borderLeft:`3px solid ${due?"#F5A623":sm.color}`,borderRadius:13,marginBottom:8,overflow:"hidden",transition:"background 0.3s"}}>
      <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>setOpen(!open)}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
            <p style={{margin:0,fontSize:14,color:T.text,lineHeight:1.4,flex:1}}>{task.text}</p>
            {due&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(245,166,35,0.15)",color:"#F5A623",fontFamily:"'DM Mono',monospace",flexShrink:0,border:"1px solid rgba(245,166,35,0.3)"}}>📋 Due</span>}
          </div>
          <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>→ {task.delegate}</p>
          <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
            <Chip label={sm.label} color={sm.color} bg={sm.bg}/>
            <AgingBadge createdAt={task.createdAt}/>
            <FUBadge count={task.followUpCount}/>
            {task.nextFollowUp&&<Chip label={`📅 ${task.nextFollowUp}`} color="#F5A623" bg="rgba(245,166,35,0.08)"/>}
            {task.update&&!open&&<span style={{fontSize:10,color:T.textMuted}}>💬</span>}
          </div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>{open?"▲":"▼"}</button>
      </div>
      {open&&(
        <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
          <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Status</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {Object.entries(EA_STATUS).map(([k,v])=>(
              <button key={k} onClick={()=>k==="done"?onDone(task.id,"ea"):onStatusChange(task.id,k)}
                style={{padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",background:task.status===k?v.bg:T.bgPanel,color:task.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:task.status===k?`1px solid ${v.color}50`:"none"}}>{v.label}</button>
            ))}
          </div>
          <p style={{margin:"10px 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Update</p>
          <UpdateField value={task.update} onChange={v=>onUpdate(task.id,v)}/>
          {canTransfer&&(
            <>
              <p style={{margin:"10px 0 5px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Transfer to</p>
              <div style={{display:"flex",gap:6}}>
                {[{id:"todo",icon:"👤",label:"My Tasks"},{id:"del",icon:"🔁",label:"Delegated"}].map(o=>(
                  <button key={o.id} onClick={()=>onTransfer(task.id,o.id)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{o.icon} {o.label}</button>
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
function DelCard({task,onUpdate,onStatusChange,onStar,onTransfer,onDone,canStar,canTransfer}){
  const T=useT();
  const [open,setOpen]=useState(false);
  const [editDate,setEditDate]=useState(false);
  const [dateDraft,setDateDraft]=useState(task.nextFollowUp||"");
  const sm=DEL_STATUS[task.status]||DEL_STATUS.todo;
  const todayStr=new Date().toISOString().split("T")[0];
  const due=task.nextFollowUp&&task.nextFollowUp<=todayStr&&task.status!=="done";
  return(
    <div style={{background:task.starred?"rgba(255,200,60,0.05)":T.bgCard,border:task.starred?"1px solid rgba(255,200,60,0.28)":due?"1px solid rgba(245,166,35,0.3)":`1px solid ${T.border}`,borderLeft:`3px solid ${due?"#F5A623":sm.color}`,borderRadius:13,marginBottom:8,overflow:"hidden",transition:"background 0.3s"}}>
      <div style={{padding:"11px 13px",display:"flex",gap:8,alignItems:"flex-start"}}>
        {canStar&&<button onClick={()=>onStar(task.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:17,padding:"1px 0",flexShrink:0,color:task.starred?"#F5C842":T.textDim,filter:task.starred?"drop-shadow(0 0 5px #F5C84290)":"none",transition:"all 0.15s"}}>★</button>}
        {!canStar&&task.starred&&<span style={{fontSize:16,color:"#F5C842",flexShrink:0}}>★</span>}
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>setOpen(!open)}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
            <p style={{margin:0,fontSize:14,color:T.text,lineHeight:1.4,flex:1}}>{task.text}</p>
            {due&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(245,166,35,0.15)",color:"#F5A623",fontFamily:"'DM Mono',monospace",flexShrink:0,border:"1px solid rgba(245,166,35,0.3)"}}>📋 Due</span>}
          </div>
          <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>→ {task.delegate}</p>
          <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
            <Chip label={sm.label} color={sm.color} bg={sm.bg}/>
            <AgingBadge createdAt={task.createdAt}/>
            <FUBadge count={task.followUpCount}/>
            {task.nextFollowUp&&<Chip label={`📅 ${task.nextFollowUp}`} color="#F5A623" bg="rgba(245,166,35,0.08)"/>}
            {task.update&&!open&&<span style={{fontSize:10,color:T.textMuted}}>💬</span>}
          </div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>{open?"▲":"▼"}</button>
      </div>
      {open&&(
        <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
          <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Status</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {Object.entries(DEL_STATUS).map(([k,v])=>(
              <button key={k} onClick={()=>k==="done"?onDone(task.id,"del"):onStatusChange(task.id,k)}
                style={{padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",background:task.status===k?v.bg:T.bgPanel,color:task.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:task.status===k?`1px solid ${v.color}50`:"none"}}>{v.label}</button>
            ))}
          </div>
          <p style={{margin:"10px 0 5px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Next Follow-up</p>
          {editDate?(
            <div style={{display:"flex",gap:8}}>
              <input type="date" value={dateDraft} onChange={e=>setDateDraft(e.target.value)} style={{flex:1,background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:9,padding:"8px 10px",color:T.text,fontSize:13,fontFamily:"'DM Mono',monospace"}}/>
              <button onClick={()=>{onUpdate(task.id,task.update,dateDraft);setEditDate(false);}} style={{padding:"8px 14px",borderRadius:9,border:"none",background:"#F5A623",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Set</button>
              <button onClick={()=>setEditDate(false)} style={{padding:"8px 10px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>✕</button>
            </div>
          ):(
            <div onClick={()=>setEditDate(true)} style={{background:"rgba(245,166,35,0.06)",borderRadius:9,padding:"8px 10px",cursor:"pointer",border:"1px dashed rgba(245,166,35,0.2)"}}>
              {task.nextFollowUp?<p style={{margin:0,fontSize:12,color:"#F5A623",fontFamily:"'DM Mono',monospace"}}>📅 {task.nextFollowUp}</p>:<p style={{margin:0,fontSize:11,color:T.textDim}}>Tap to set date…</p>}
            </div>
          )}
          <p style={{margin:"10px 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Update</p>
          <UpdateField value={task.update} onChange={v=>onUpdate(task.id,v,task.nextFollowUp)}/>
          {canTransfer&&(
            <>
              <p style={{margin:"10px 0 5px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Transfer to</p>
              <div style={{display:"flex",gap:6}}>
                {[{id:"todo",icon:"👤",label:"My Tasks"},{id:"ea",icon:"🎯",label:"EA List"}].map(o=>(
                  <button key={o.id} onClick={()=>onTransfer(task.id,o.id)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{o.icon} {o.label}</button>
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
function ApprovalCard({task,onApprove,onReject}){
  const T=useT();
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:"rgba(76,175,80,0.05)",border:"1px solid rgba(76,175,80,0.2)",borderLeft:"3px solid #4CAF50",borderRadius:13,marginBottom:8,overflow:"hidden"}}>
      <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <div style={{flex:1}}>
          <p style={{margin:0,fontSize:14,color:T.text,lineHeight:1.4}}>{task.text}</p>
          <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>→ {task.delegate} · from {task.fromList==="ea"?"EA":"Delegation"}</p>
          {task.update&&<p style={{margin:"4px 0 0",fontSize:12,color:T.textSub}}>{task.update}</p>}
        </div>
        <Chip label="Pending ✓" color="#4CAF50" bg="rgba(76,175,80,0.12)"/>
      </div>
      {open&&(
        <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`,display:"flex",gap:8,paddingTop:12}}>
          <button onClick={()=>onApprove(task.id)} style={{flex:2,padding:"10px",borderRadius:11,border:"none",background:"#4CAF50",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Approve & Close</button>
          <button onClick={()=>onReject(task.id)} style={{flex:1,padding:"10px",borderRadius:11,border:"1px solid rgba(255,77,77,0.3)",background:"rgba(255,77,77,0.08)",color:"#FF7A7A",fontSize:13,cursor:"pointer"}}>↩ Back</button>
        </div>
      )}
    </div>
  );
}

// ─── QUICK CAPTURE ────────────────────────────────────────────────────────────
function QuickCapture({items,onAdd,onDelete,onRoute}){
  const T=useT();
  const [newText,setNewText]=useState("");
  const [routing,setRouting]=useState(null);
  const [rList,setRList]=useState("todo");
  const [rDel,setRDel]=useState("");
  const now=Date.now();
  const isOld=ts=>now-ts>86400000;
  const age=ts=>{const h=Math.round((now-ts)/3600000);return h<24?`${h}h ago`:`${Math.round(h/24)}d ago`;};
  const add=()=>{if(!newText.trim())return;onAdd(newText.trim());setNewText("");};
  const confirm=()=>{onRoute(routing,rList,rDel);setRouting(null);setRDel("");};
  const LISTS=[{id:"todo",icon:"👤",label:"My Tasks",color:"#F5A623"},{id:"ea",icon:"🎯",label:"EA List",color:"#4A9EFF"},{id:"del",icon:"🔁",label:"Delegated",color:"#9B8AFF"}];
  return(
    <div style={{padding:"0 16px"}}>
      {routing&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
            <p style={{margin:"0 0 4px",fontSize:10,color:T.textSub,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>Add to which list?</p>
            <p style={{margin:"0 0 18px",fontSize:14,color:T.text,lineHeight:1.4}}>{routing.text}</p>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {LISTS.map(l=>(
                <button key={l.id} onClick={()=>setRList(l.id)} style={{flex:1,padding:"11px 4px",borderRadius:12,border:"none",cursor:"pointer",background:rList===l.id?`${l.color}18`:T.bgPanel,color:rList===l.id?l.color:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:rList===l.id?`1.5px solid ${l.color}50`:"none"}}>
                  <div style={{fontSize:18}}>{l.icon}</div><div style={{marginTop:4}}>{l.label}</div>
                </button>
              ))}
            </div>
            {rList!=="todo"&&<input value={rDel} onChange={e=>setRDel(e.target.value)} placeholder="Delegate name" style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:14}}/>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setRouting(null)} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={confirm} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add →</button>
            </div>
          </div>
        </div>
      )}
      <div style={{background:"rgba(245,166,35,0.05)",border:"1px dashed rgba(245,166,35,0.22)",borderRadius:14,padding:14,marginBottom:14}}>
        <p style={{margin:"0 0 8px",fontSize:11,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>⚡ Quick Capture</p>
        <div style={{display:"flex",gap:8}}>
          <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Capture anything instantly…" style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14}}/>
          <button onClick={add} style={{background:"#F5A623",border:"none",borderRadius:10,padding:"10px 18px",color:"#000",fontWeight:700,fontSize:17,cursor:"pointer"}}>+</button>
        </div>
      </div>
      {items.filter(i=>isOld(i.ts)).length>0&&<p style={{fontSize:11,color:"#FF7A7A",margin:"0 0 10px",fontFamily:"'DM Mono',monospace"}}>⚠ {items.filter(i=>isOld(i.ts)).length} items older than 24h</p>}
      {items.length===0?<div style={{textAlign:"center",padding:"40px 0",color:T.textDim}}><p style={{fontSize:28}}>✓</p><p style={{fontSize:12}}>Inbox zero</p></div>
      :items.map(item=>(
        <div key={item.id} style={{background:isOld(item.ts)?"rgba(255,77,77,0.06)":T.bgCard,border:`1px solid ${isOld(item.ts)?"rgba(255,77,77,0.2)":T.border}`,borderRadius:12,padding:"11px 13px",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{flex:1}}>
              <p style={{margin:0,fontSize:13,color:T.text,lineHeight:1.4}}>{item.text}</p>
              <p style={{margin:"3px 0 0",fontSize:10,color:isOld(item.ts)?"#FF7A7A":T.textMuted,fontFamily:"'DM Mono',monospace"}}>{isOld(item.ts)?"⚠ ":""}{age(item.ts)}</p>
            </div>
            <button onClick={()=>onDelete(item.id)} style={{background:"none",border:"none",color:T.textMuted,fontSize:14,cursor:"pointer",padding:"2px 6px"}}>✕</button>
          </div>
          <button onClick={()=>setRouting(item)} style={{width:"100%",marginTop:9,padding:"8px",borderRadius:9,border:"none",background:T.bgPanel,color:T.textSub,fontSize:12,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Add to list → 👤 🎯 🔁</button>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  // Detect system preference on first load
  const prefersDark=typeof window!=="undefined"&&window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [themeName,setThemeName]=useState(prefersDark?"dark":"light");
  const theme=THEMES[themeName]||THEMES.dark;
  const T=theme;

  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("capture");
  const [tasks,setTasks]=useState(SEED_TASKS);
  const [approvals,setApprovals]=useState([]);
  const [qc,setQc]=useState(SEED_QC);
  const [toast,setToast]=useState(null);
  const [todoFilter,setTodoFilter]=useState("all");
  const [eaFilter,setEaFilter]=useState("all");
  const [delFilter,setDelFilter]=useState("all");
  const [eaSort,setEaSort]=useState("asc");
  const [delSort,setDelSort]=useState("asc");

  const fire=msg=>{setToast(msg);setTimeout(()=>setToast(null),2000);};

  if(!user) return(
    <ThemeCtx.Provider value={T}>
      <LoginScreen onLogin={u=>{setUser(u);setTab(u.tabs[0]);}} theme={theme} setThemeName={setThemeName}/>
    </ThemeCtx.Provider>
  );

  const R=user.rights;
  const todayStr=new Date().toISOString().split("T")[0];

  const updateTask=(id,changes)=>setTasks(prev=>prev.map(t=>{
    if(t.id!==id)return t;
    const isUpdateChange="update"in changes&&changes.update!==t.update&&(changes.update||"").trim()!=="";
    return{...t,...changes,followUpCount:isUpdateChange?(t.followUpCount||0)+1:(t.followUpCount||0)};
  }));
  const deleteTask=id=>{setTasks(prev=>prev.filter(t=>t.id!==id));fire("Deleted");};
  const transferTask=(id,toList)=>{
    setTasks(prev=>prev.map(t=>t.id===id?{...t,list:toList,...(toList==="todo"?{bci:"schedule"}:{})}:t));
    fire(`Moved to ${toList==="todo"?"My Tasks":toList==="ea"?"EA List":"Delegation"}`);
  };
  const markDone=(id,fromList)=>{
    const task=tasks.find(t=>t.id===id);if(!task)return;
    const approval={id:uid(),text:task.text,delegate:task.delegate||"",update:task.update||"",fromList};
    setTasks(prev=>prev.filter(t=>t.id!==id));
    setApprovals(prev=>[approval,...prev]);
    setTab("approvals");fire("Moved to Approvals ✓");
  };
  const approve=id=>{setApprovals(prev=>prev.filter(a=>a.id!==id));fire("Approved ✓");};
  const reject=id=>{
    const a=approvals.find(x=>x.id===id);if(!a)return;
    const task={id:uid(),list:a.fromList,text:a.text,update:(a.update||"")+" [Sent back]",delegate:a.delegate||"",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:new Date().toISOString()};
    setApprovals(prev=>prev.filter(x=>x.id!==id));setTasks(prev=>[task,...prev]);fire("Sent back ↩");
  };
  const addQC=text=>setQc(prev=>[{id:uid(),text,ts:Date.now()},...prev]);
  const delQC=id=>setQc(prev=>prev.filter(i=>i.id!==id));
  const routeQC=(item,list,del)=>{
    delQC(item.id);
    const task={id:uid(),list,text:item.text,update:"",delegate:del||"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:new Date().toISOString()};
    setTasks(prev=>[task,...prev]);fire(`Added to ${list==="todo"?"My Tasks":list==="ea"?"EA List":"Delegation"}`);
  };

  const applyFilter=(items,f)=>{
    if(f==="all")return items;
    if(f==="starred")return items.filter(t=>t.starred);
    if(f==="due-today")return items.filter(t=>t.nextFollowUp&&t.nextFollowUp<=todayStr&&t.status!=="done");
    return items.filter(t=>t.status===f||t.bci===f);
  };
  const applySort=(items,dir)=>[...items].sort((a,b)=>{
    const da=a.nextFollowUp||"9999";const db2=b.nextFollowUp||"9999";
    return dir==="asc"?da.localeCompare(db2):db2.localeCompare(da);
  });

  const todoItems=tasks.filter(t=>t.list==="todo");
  const eaItems=tasks.filter(t=>t.list==="ea");
  const delItems=tasks.filter(t=>t.list==="del");
  const todoCounts={schedule:todoItems.filter(t=>t.bci==="schedule").length,waiting:todoItems.filter(t=>t.bci==="waiting").length,someday:todoItems.filter(t=>t.bci==="someday").length,done:todoItems.filter(t=>t.bci==="done").length};
  const delStarCount=delItems.filter(t=>t.starred).length;
  const eaDue=eaItems.filter(t=>t.nextFollowUp&&t.nextFollowUp<=todayStr&&t.status!=="done").length;
  const delDue=delItems.filter(t=>t.nextFollowUp&&t.nextFollowUp<=todayStr&&t.status!=="done").length;
  const filteredEa=applySort(applyFilter(eaItems,eaFilter),eaSort);
  const filteredDel=applySort([...applyFilter(delItems,delFilter).filter(t=>t.starred),...applyFilter(delItems,delFilter).filter(t=>!t.starred)],delSort);

  const ALL_TABS=[
    {id:"capture",icon:"⚡",label:"Capture",badge:qc.length,alert:qc.filter(i=>Date.now()-i.ts>86400000).length>0},
    {id:"todo",icon:"👤",label:"My Tasks",badge:todoItems.length},
    {id:"ea",icon:"🎯",label:"EA",badge:eaItems.length,alert:eaDue>0},
    {id:"del",icon:"🔁",label:"Delegated",badge:delItems.length,star:delStarCount,alert:delDue>0},
    {id:"approvals",icon:"✅",label:"Approvals",badge:approvals.length,alert:approvals.length>0},
  ];
  const TABS=ALL_TABS.filter(t=>user.tabs.includes(t.id));

  const emptyState=<div style={{textAlign:"center",padding:"36px 0",color:T.textDim}}><p style={{fontSize:28}}>✓</p><p style={{fontSize:12}}>Nothing here</p></div>;

  return(
    <ThemeCtx.Provider value={T}>
      <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",transition:"background 0.3s"}}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg);}}
          *{box-sizing:border-box;}
          @media(min-width:768px){
            .side-nav{display:flex!important;}
            .bottom-nav{display:none!important;}
            .content-area{margin-left:220px!important;}
            .hbar{margin-left:220px!important;}
            .cinner{max-width:720px!important;margin:0 auto!important;}
          }
          @media(max-width:767px){
            .side-nav{display:none!important;}
            .bottom-nav{display:flex!important;}
            .content-area{margin-left:0!important;}
          }
        `}</style>

        {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"10px 20px",fontSize:13,color:T.text,zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",whiteSpace:"nowrap"}}>{toast}</div>}

        {/* DESKTOP SIDEBAR */}
        <div className="side-nav" style={{position:"fixed",left:0,top:0,bottom:0,width:220,background:T.bgSub,borderRight:`1px solid ${T.borderSide}`,display:"none",flexDirection:"column",padding:"28px 0",zIndex:100,transition:"background 0.3s"}}>
          <div style={{padding:"0 20px 16px"}}>
            <p style={{margin:0,fontSize:9,color:"#F5A623",fontFamily:"'DM Mono',monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS</p>
            <p style={{margin:"2px 0 0",fontSize:18,fontWeight:600,color:T.textHeading}}>Task Manager</p>
          </div>
          {/* Theme toggle in sidebar */}
          <div style={{padding:"0 12px 20px"}}>
            <ThemeToggle theme={theme} setThemeName={setThemeName}/>
          </div>
          <div style={{margin:"0 12px 20px",padding:"10px 12px",background:`${user.color}0A`,border:`1px solid ${user.color}25`,borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`${user.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:user.color,flexShrink:0}}>{user.avatar}</div>
            <div>
              <p style={{margin:0,fontSize:13,fontWeight:600,color:T.textHeading}}>{user.name}</p>
              <p style={{margin:0,fontSize:9,color:T.textSub,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{user.role}</p>
            </div>
          </div>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",background:tab===t.id?`${T.bg}90`:"transparent",border:"none",borderLeft:tab===t.id?"3px solid #F5A623":"3px solid transparent",cursor:"pointer",width:"100%",textAlign:"left",transition:"all 0.15s"}}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <span style={{flex:1,fontSize:13,color:tab===t.id?"#F5A623":T.textNav}}>{t.label}</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {t.alert&&<span style={{width:7,height:7,borderRadius:"50%",background:t.id==="approvals"?"#4CAF50":"#F5A623",boxShadow:`0 0 6px ${t.id==="approvals"?"#4CAF50":"#F5A623"}90`}}/>}
                {t.star>0&&<span style={{fontSize:9,color:"#F5C842",fontFamily:"'DM Mono',monospace"}}>★{t.star}</span>}
                {t.badge>0&&!t.alert&&<span style={{fontSize:10,color:T.textMuted,background:T.bgChip,padding:"1px 6px",borderRadius:10,fontFamily:"'DM Mono',monospace"}}>{t.badge}</span>}
              </div>
            </button>
          ))}
          <div style={{marginTop:"auto",padding:"0 12px 12px"}}>
            <button onClick={()=>setUser(null)} style={{width:"100%",padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>← Sign out</button>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="hbar" style={{padding:"52px 20px 14px",borderBottom:`1px solid ${T.borderSub}`,background:T.headerGrad,transition:"background 0.3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{margin:0,fontSize:10,color:"#F5A623",fontFamily:"'DM Mono',monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS</p>
              <h1 style={{margin:"2px 0 0",fontSize:22,fontWeight:600,color:T.textHeading,letterSpacing:-0.5}}>Task Manager</h1>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {/* Compact theme toggle in header */}
              <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:14,cursor:"pointer"}}>
                {theme.id==="dark"?"☀️":"🌙"}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:7,background:`${user.color}12`,border:`1px solid ${user.color}30`,borderRadius:20,padding:"5px 10px 5px 7px"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`${user.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:user.color}}>{user.avatar}</div>
                <p style={{margin:0,fontSize:12,fontWeight:600,color:T.textHeading}}>{user.name}</p>
              </div>
              <button onClick={()=>setUser(null)} style={{background:T.btnSecBg,border:`1px solid ${T.btnSecBorder}`,borderRadius:20,padding:"6px 10px",color:T.btnSecText,fontSize:11,cursor:"pointer"}}>Out</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:14}}>
            {[
              {label:"My Tasks",val:todoItems.length,color:"#F5A623",show:R.todo},
              {label:"EA List",val:eaItems.length,color:"#4A9EFF",show:R.ea},
              {label:"Delegated",val:delItems.length,color:"#9B8AFF",show:R.del,star:delStarCount},
              {label:"Approvals",val:approvals.length,color:approvals.length>0?"#4CAF50":"#888",warn:approvals.length>0,show:R.approvals},
            ].filter(s=>s.show).map(s=>(
              <div key={s.label} style={{flex:1,background:s.warn?"rgba(76,175,80,0.08)":T.statBg,border:`1px solid ${s.warn?"rgba(76,175,80,0.2)":T.statBorder}`,borderRadius:10,padding:"7px 5px",textAlign:"center",transition:"background 0.3s"}}>
                <p style={{margin:0,fontSize:16,fontWeight:700,color:s.color,fontFamily:"'DM Mono',monospace"}}>{s.val}</p>
                {s.star>0&&<p style={{margin:0,fontSize:9,color:"#F5C842"}}>★{s.star}</p>}
                <p style={{margin:0,fontSize:8,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.4}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="content-area" style={{flex:1,paddingTop:14,paddingBottom:110}}>
          <div className="cinner" style={{width:"100%"}}>

            {tab==="capture"&&R.capture&&<QuickCapture items={qc} onAdd={addQC} onDelete={delQC} onRoute={routeQC}/>}

            {tab==="todo"&&(
              <div style={{padding:"0 16px"}}>
                <div style={{display:"flex",gap:6,marginBottom:12}}>
                  {Object.entries(TODO_STATUS).map(([k,v])=>(
                    <button key={k} onClick={()=>setTodoFilter(todoFilter===k?"all":k)} style={{flex:1,padding:"8px 4px",borderRadius:11,border:"none",cursor:"pointer",background:todoFilter===k?v.bg:T.bgPanel,color:todoFilter===k?v.color:T.textDim,fontSize:10,fontFamily:"'DM Mono',monospace",outline:todoFilter===k?`1.5px solid ${v.color}50`:"none",transition:"background 0.2s"}}>
                      <div style={{fontSize:16}}>{k==="schedule"?"📅":k==="waiting"?"⏳":k==="someday"?"💤":"✓"}</div>
                      <div style={{marginTop:2}}>{todoCounts[k]}</div>
                      <div style={{fontSize:9,opacity:0.7}}>{v.label}</div>
                    </button>
                  ))}
                </div>
                {applyFilter(todoItems,todoFilter).map(task=>(
                  <TodoCard key={task.id} task={task} onUpdate={(id,v)=>updateTask(id,{update:v})} onBciChange={(id,bci)=>updateTask(id,{bci})} onTransfer={(id,dest)=>transferTask(id,dest)} onDelete={deleteTask} canTransfer={R.transfer} canDelete={R.delete}/>
                ))}
                {!applyFilter(todoItems,todoFilter).length&&emptyState}
              </div>
            )}

            {tab==="ea"&&(
              <div>
                <TodayPanel tasks={[...eaItems,...delItems]} onStatusChange={(id,st)=>updateTask(id,{status:st})} onDone={markDone}/>
                <div style={{padding:"0 16px"}}>
                  <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
                    <div style={{display:"flex",gap:5,flex:1,overflowX:"auto"}}>
                      {[{id:"all",label:"All"},{id:"due-today",label:"📋 Due"},...Object.entries(EA_STATUS).map(([k,v])=>({id:k,label:v.label}))].map(f=>(
                        <button key={f.id} onClick={()=>setEaFilter(f.id)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"none",background:eaFilter===f.id?T.pillActive:T.pillInactive,color:eaFilter===f.id?f.id==="due-today"?"#F5A623":"#4A9EFF":f.id==="due-today"?"#F5A623":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{f.label}</button>
                      ))}
                    </div>
                    <button onClick={()=>setEaSort(s=>s==="asc"?"desc":"asc")} style={{flexShrink:0,padding:"5px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>📅 {eaSort==="asc"?"↑":"↓"}</button>
                  </div>
                  {filteredEa.map(task=>(<EaCard key={task.id} task={task} onUpdate={(id,v)=>updateTask(id,{update:v})} onStatusChange={(id,st)=>updateTask(id,{status:st})} onTransfer={(id,dest)=>transferTask(id,dest)} onDone={markDone} canTransfer={R.transfer}/>))}
                  {!filteredEa.length&&emptyState}
                </div>
              </div>
            )}

            {tab==="del"&&(
              <div style={{padding:"0 16px"}}>
                <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
                  <div style={{display:"flex",gap:5,flex:1,overflowX:"auto"}}>
                    {[{id:"all",label:"All"},{id:"due-today",label:"📋 Due"},{id:"starred",label:"★"},{id:"need-help",label:"⚠ Help"},...Object.entries(DEL_STATUS).filter(([k])=>k!=="need-help").map(([k,v])=>({id:k,label:v.label}))].map(f=>(
                      <button key={f.id} onClick={()=>setDelFilter(f.id)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"none",background:delFilter===f.id?T.pillActive:T.pillInactive,color:delFilter===f.id?"#9B8AFF":f.id==="need-help"?"#FF7A7A":f.id==="due-today"?"#F5A623":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{f.label}</button>
                    ))}
                  </div>
                  <button onClick={()=>setDelSort(s=>s==="asc"?"desc":"asc")} style={{flexShrink:0,padding:"5px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>📅 {delSort==="asc"?"↑":"↓"}</button>
                </div>
                {filteredDel.map(task=>(<DelCard key={task.id} task={task} onUpdate={(id,v,nf)=>updateTask(id,{update:v,nextFollowUp:nf??task.nextFollowUp})} onStatusChange={(id,st)=>updateTask(id,{status:st})} onStar={id=>updateTask(id,{starred:!tasks.find(t=>t.id===id)?.starred})} onTransfer={(id,dest)=>transferTask(id,dest)} onDone={markDone} canStar={R.star} canTransfer={R.transfer}/>))}
                {!filteredDel.length&&emptyState}
              </div>
            )}

            {tab==="approvals"&&R.approvals&&(
              <div style={{padding:"0 16px"}}>
                <div style={{background:"rgba(76,175,80,0.07)",border:"1px solid rgba(76,175,80,0.18)",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
                  <p style={{margin:0,fontSize:11,color:"#4CAF50",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>✅ Approval Queue</p>
                  <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>Tasks marked done — approve to close or send back.</p>
                </div>
                {approvals.length===0?<div style={{textAlign:"center",padding:"40px 0",color:T.textDim}}><p style={{fontSize:28}}>✓</p><p style={{fontSize:12}}>Nothing to approve</p></div>
                :approvals.map(task=><ApprovalCard key={task.id} task={task} onApprove={approve} onReject={reject}/>)}
              </div>
            )}


          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:T.navBg,backdropFilter:"blur(24px)",borderTop:`1px solid ${T.borderSub}`,padding:"10px 4px 30px",display:"none",gap:1,zIndex:100,transition:"background 0.3s"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"4px 1px",borderRadius:10}}>
              <div style={{position:"relative",display:"inline-block"}}>
                <span style={{fontSize:19}}>{t.icon}</span>
                {t.alert&&<span style={{position:"absolute",top:-2,right:-4,width:7,height:7,background:t.id==="approvals"?"#4CAF50":"#F5A623",borderRadius:"50%",boxShadow:`0 0 6px ${t.id==="approvals"?"#4CAF50":"#F5A623"}90`}}/>}
                {t.star>0&&<span style={{position:"absolute",top:-4,right:-6,background:"rgba(245,200,66,0.18)",borderRadius:10,fontSize:9,color:"#F5C842",padding:"1px 4px",fontFamily:"'DM Mono',monospace"}}>★{t.star}</span>}
                {t.badge>0&&!t.alert&&!t.star&&<span style={{position:"absolute",top:-4,right:-7,background:T.bgChip,borderRadius:10,fontSize:9,color:T.textMuted,padding:"1px 4px",fontFamily:"'DM Mono',monospace"}}>{t.badge}</span>}
              </div>
              <p style={{margin:"2px 0 0",fontSize:8,fontFamily:"'DM Mono',monospace",color:tab===t.id?"#F5A623":T.textDim}}>{t.label}</p>
            </button>
          ))}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
