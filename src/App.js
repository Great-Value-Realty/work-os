import { useState, useContext, createContext } from "react";
import { supabase } from "./supabase";

const DARK = {
  bg:"#0A0A0C",bgSub:"#0D0D0F",bgCard:"rgba(255,255,255,0.05)",bgPanel:"rgba(255,255,255,0.04)",
  bgInput:"rgba(255,255,255,0.07)",bgChip:"rgba(255,255,255,0.08)",border:"rgba(255,255,255,0.09)",
  borderSub:"rgba(255,255,255,0.05)",borderInput:"rgba(255,255,255,0.12)",
  text:"#E2E2E2",textSub:"#666",textMuted:"#444",textDim:"#282828",textHeading:"#F0F0F0",
  navBg:"rgba(10,10,12,0.97)",modalBg:"#141416",modalBorder:"rgba(255,255,255,0.09)",
  statBg:"rgba(255,255,255,0.04)",statBorder:"rgba(255,255,255,0.06)",
  todayBg:"rgba(0,0,0,0.3)",todayBorder:"rgba(255,255,255,0.05)",
  pinDot:"rgba(255,255,255,0.09)",pinDotBorder:"rgba(255,255,255,0.13)",
};
const LIGHT = {
  bg:"#F4F4F7",bgSub:"#FFFFFF",bgCard:"#FFFFFF",bgPanel:"#EBEBEE",
  bgInput:"#FFFFFF",bgChip:"rgba(0,0,0,0.06)",border:"rgba(0,0,0,0.09)",
  borderSub:"rgba(0,0,0,0.06)",borderInput:"rgba(0,0,0,0.13)",
  text:"#1A1A1A",textSub:"#777",textMuted:"#999",textDim:"#CCC",textHeading:"#111",
  navBg:"rgba(244,244,247,0.97)",modalBg:"#FFFFFF",modalBorder:"rgba(0,0,0,0.1)",
  statBg:"#FFFFFF",statBorder:"rgba(0,0,0,0.07)",
  todayBg:"rgba(0,0,0,0.04)",todayBorder:"rgba(0,0,0,0.06)",
  pinDot:"rgba(0,0,0,0.1)",pinDotBorder:"rgba(0,0,0,0.15)",
};
const TC = createContext(DARK);
const useT = () => useContext(TC);

const USERS = {
  payas:  {id:"payas", name:"Payas", pin:process.env.REACT_APP_PIN_PAYAS||"1234",role:"Owner",avatar:"P",color:"#F5A623",tabs:["inbox","myday","ea","del","approvals"]},
  varsha: {id:"varsha",name:"Varsha",pin:process.env.REACT_APP_PIN_VARSHA||"5678",role:"EA",   avatar:"V",color:"#4A9EFF",tabs:["ea","del"]},
};
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const uid=()=>"x"+Math.random().toString(36).slice(2,9);
const todayStr=()=>new Date().toISOString().split("T")[0];
const dStr=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split("T")[0];};
const agingColor=d=>d===null?"#555":d<=3?"#4CAF50":d<=7?"#F5A623":d<=14?"#FF9944":"#FF4D4D";
const daysSince=s=>s?Math.floor((Date.now()-new Date(s).getTime())/86400000):null;

const PEOPLE_TAGS={Solo:"#F5A623",Family:"#4A9EFF",Friends:"#50C8A8",Network:"#9B8AFF"};
const HOBBY_TAGS={Sport:"#F5A623",Write:"#4A9EFF",Game:"#9B8AFF",Chill:"#50C8A8",Outing:"#FF7A7A"};
const HOL_TYPES={
  adventure:{label:"Adventure",icon:"\u{1F3D4}",color:"#F5A623"},
  spiritual:{label:"Spiritual",icon:"\u{1F54C}",color:"#9B8AFF"},
  city:{label:"City",icon:"\u{1F3D9}",color:"#4A9EFF"},
  festival:{label:"Festival",icon:"\u{1F389}",color:"#50C8A8"},
  beach:{label:"Beach",icon:"\u{1F3D6}",color:"#FF7A7A"},
  ski:{label:"Ski",icon:"\u26F7",color:"#50C8A8"},
};
const EA_STATUS={
  todo:{label:"To Do",color:"#888",bg:"rgba(136,136,136,0.12)"},
  "in-progress":{label:"In Progress",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},
  scheduled:{label:"Scheduled",color:"#50C8A8",bg:"rgba(80,200,168,0.13)"},
  waiting:{label:"Waiting",color:"#9B8AFF",bg:"rgba(155,138,255,0.13)"},
  done:{label:"Done \u2713",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"},
};
const DEL_STATUS={
  todo:{label:"To Do",color:"#888",bg:"rgba(136,136,136,0.12)"},
  "in-progress":{label:"In Progress",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},
  "need-help":{label:"Need Help",color:"#FF7A7A",bg:"rgba(255,77,77,0.13)"},
  done:{label:"Done \u2713",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"},
};
const TODO_BCI={
  schedule:{label:"Scheduled",icon:"\u{1F4C5}",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},
  waiting:{label:"Waiting",icon:"\u23F3",color:"#9B8AFF",bg:"rgba(155,138,255,0.13)"},
  someday:{label:"Someday",icon:"\u{1F4A4}",color:"#50C8A8",bg:"rgba(80,200,168,0.13)"},
  done:{label:"Done",icon:"\u2713",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"},
};
const WEEK_STATUS={
  "":{label:"--",color:"#444",bg:"transparent"},
  done:{label:"Done",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"},
  received:{label:"Recv",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},
  pending:{label:"Pend",color:"#FF7A7A",bg:"rgba(255,77,77,0.13)"},
};
const WEEKS=["W1","W2","W3","W4","W5"];

// SEED DATA
const INIT_TODO=[
  {id:"t1",text:"DWALL & Capcite Mobilisation",bci:"schedule",update:"Steel order pending",followUp:false,delegate:"",followUpCount:2,createdAt:dStr(-5)},
  {id:"t2",text:"Project team + revenue team audit",bci:"schedule",update:"Pull numbers first",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-2)},
  {id:"t3",text:"Review & approve all DDs",bci:"schedule",update:"",followUp:false,delegate:"",followUpCount:1,createdAt:dStr(-10)},
  {id:"t4",text:"Appraisal sheet fill in",bci:"schedule",update:"",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-3)},
  {id:"t5",text:"Sanat reply",bci:"schedule",update:"",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-1)},
  {id:"t6",text:"Billion dollar strategy",bci:"someday",update:"People crazy enough to think they can change the world",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-15)},
  {id:"t7",text:"EC & mining - follow up RS Sharma",bci:"waiting",update:"Supreme Court - next FU 10th June",followUp:true,delegate:"RS Sharma",followUpCount:4,createdAt:dStr(-20),nextFollowUp:dStr(0)},
  {id:"t8",text:"AOA Management - follow up Anurag",bci:"waiting",update:"Structure, STP, Facade",followUp:true,delegate:"Anurag/Sharma",followUpCount:2,createdAt:dStr(-12)},
  {id:"t9",text:"Buy sunglasses",bci:"someday",update:"",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-4)},
  {id:"t10",text:"Running shoes + gym shoes",bci:"someday",update:"",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-4)},
  {id:"t11",text:"Slab cycle time",bci:"schedule",update:"",followUp:false,delegate:"",followUpCount:0,createdAt:dStr(-3)},
];
const INIT_EA=[
  {id:"e1",text:"AOP Formalise draft and plan",delegate:"Varsha to Kapil",status:"in-progress",update:"Draft due Friday",nextFollowUp:dStr(0),followUpCount:3,createdAt:dStr(-8)},
  {id:"e2",text:"Schedule Marketing & Capital meeting",delegate:"Varsha",status:"todo",update:"Adhvika, Kanshika, Bhushan, Amit, Shubhodeep",nextFollowUp:dStr(2),followUpCount:0,createdAt:dStr(-3)},
  {id:"e3",text:"Brand credibility presentation - investor",delegate:"Varsha to Shubhodeep",status:"in-progress",update:"Pitch and refine before next investor call",nextFollowUp:dStr(-1),followUpCount:5,createdAt:dStr(-12)},
  {id:"e4",text:"Europe visa - Payas + MA + PA",delegate:"Varsha to Reena",status:"waiting",update:"",nextFollowUp:dStr(3),followUpCount:1,createdAt:dStr(-6)},
  {id:"e5",text:"Subsequent meeting Munish ji - Finesta",delegate:"Varsha",status:"scheduled",update:"Speak 2nd June",nextFollowUp:"",followUpCount:2,createdAt:dStr(-4)},
  {id:"e6",text:"VDS Vendor management system",delegate:"Varsha to NJ",status:"todo",update:"",nextFollowUp:"",followUpCount:0,createdAt:dStr(-5)},
  {id:"e7",text:"Board of Directors - Korn Ferry, Spencer Stuart, Egon Zehnder",delegate:"Varsha",status:"todo",update:"Due August",nextFollowUp:"",followUpCount:0,createdAt:dStr(-10)},
  {id:"e8",text:"Order ergonomic chair without armrest",delegate:"Varsha",status:"in-progress",update:"Laptop stand done. Chair shortlisted.",nextFollowUp:"",followUpCount:1,createdAt:dStr(-7)},
  {id:"e9",text:"NSCI Bill vs Ledger analysis",delegate:"Varsha",status:"todo",update:"Check vis-a-vis Kuldeep mail",nextFollowUp:"",followUpCount:0,createdAt:dStr(-6)},
  {id:"e10",text:"Rima Sachdeva meeting",delegate:"Varsha",status:"todo",update:"",nextFollowUp:"",followUpCount:0,createdAt:dStr(-2)},
  {id:"e11",text:"PHD membership - discuss, last date end June",delegate:"Varsha",status:"todo",update:"",nextFollowUp:"",followUpCount:0,createdAt:dStr(-5)},
  {id:"e12",text:"Physio appointment",delegate:"Varsha",status:"todo",update:"First week of June",nextFollowUp:"",followUpCount:0,createdAt:dStr(-8)},
  {id:"e13",text:"Schedule IC Meeting weekly - Amit, Ranjeet, Goldee, Pranjal, Manoj",delegate:"Varsha",status:"todo",update:"",nextFollowUp:"",followUpCount:0,createdAt:dStr(-3)},
];
const INIT_DEL=[
  {id:"d1",text:"Indoor facility provision Ekanam & DWALL without touching existing basement",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"in-progress",starred:true,update:"",nextFollowUp:"2026-05-18",followUpCount:3,createdAt:dStr(-28)},
  {id:"d2",text:"All future and unused inventory sale",delegate:"Ashish",phone:"9560144299",status:"todo",starred:false,update:"",nextFollowUp:"2026-05-25",followUpCount:0,createdAt:dStr(-20)},
  {id:"d3",text:"Library/bookshelf in new office design",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"todo",starred:false,update:"",nextFollowUp:"2026-05-30",followUpCount:0,createdAt:dStr(-15)},
  {id:"d4",text:"Pashupati land drawing + plotted development",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"in-progress",starred:true,update:"",nextFollowUp:"2026-05-30",followUpCount:1,createdAt:dStr(-15)},
  {id:"d5",text:"Water body contract feedback on DD landscape drawings",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"todo",starred:false,update:"",nextFollowUp:"2026-05-31",followUpCount:0,createdAt:dStr(-14)},
  {id:"d6",text:"Green building update",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-01",followUpCount:0,createdAt:dStr(-13)},
  {id:"d7",text:"Green building submission",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-01",followUpCount:0,createdAt:dStr(-13)},
  {id:"d8",text:"Vilasa bank loan - coordinate with Manish",delegate:"Ranjeet Bhalla",phone:"98999 32429",status:"in-progress",starred:true,update:"",nextFollowUp:"2026-06-05",followUpCount:1,createdAt:dStr(-9)},
  {id:"d9",text:"Naala cover",delegate:"RS Sharma",phone:"97182 22020",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-09",followUpCount:0,createdAt:dStr(-5)},
  {id:"d10",text:"Complete sample flat order by 6th",delegate:"Nidhi Jain",phone:"95602 71114",status:"todo",starred:true,update:"",nextFollowUp:"2026-06-10",followUpCount:0,createdAt:dStr(-4)},
  {id:"d11",text:"Sell one flat we have in Sharnam",delegate:"Ranjeet Bhalla",phone:"98999 32429",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-11",followUpCount:0,createdAt:dStr(-3)},
  {id:"d12",text:"Naresh FNF update",delegate:"Nidhi Jain",phone:"95602 71114",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-15",followUpCount:0,createdAt:dStr(-2)},
  {id:"d13",text:"Check and resolve Rohit Kakkar Eternia brokerage issue",delegate:"Ranjeet Bhalla",phone:"98999 32429",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-29",followUpCount:0,createdAt:dStr(-1)},
  {id:"d14",text:"Yoga Air company for Ekanam Clubhouse fresh air",delegate:"Prabhjot Kaur",phone:"89299 76088",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-30",followUpCount:0,createdAt:dStr(-1)},
  {id:"d15",text:"Knox for club gym + green tie-up cafe + yoga for Ekanam",delegate:"Nidhi Jain",phone:"95602 71114",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-30",followUpCount:0,createdAt:dStr(-1)},
  {id:"d16",text:"Physical inventory audit of store - find consultant",delegate:"Nidhi Jain",phone:"95602 71114",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-30",followUpCount:0,createdAt:dStr(-1)},
  {id:"d17",text:"Interior Design Named Brand proposal for sales offer",delegate:"Nidhi Jain",phone:"95602 71114",status:"todo",starred:false,update:"",nextFollowUp:"2026-06-30",followUpCount:0,createdAt:dStr(-1)},
  {id:"d18",text:"Set up Payas meeting with capital vertical - top 4 for Fund raise",delegate:"Amit Goel",phone:"99100 97856",status:"todo",starred:true,update:"",nextFollowUp:"2026-07-31",followUpCount:0,createdAt:dStr(-1)},
  {id:"d19",text:"PMC + structure estimation",delegate:"Shailesh & Anurag",phone:"",status:"in-progress",starred:true,update:"Additional points - check progress",nextFollowUp:dStr(2),followUpCount:2,createdAt:dStr(-9)},
  {id:"d20",text:"Legal file compliance",delegate:"Khushboo",phone:"",status:"need-help",starred:true,update:"Stuck - needs your input",nextFollowUp:dStr(-2),followUpCount:1,createdAt:dStr(-7)},
  {id:"d21",text:"Make MIS for each dept live",delegate:"Varsha - Depts",phone:"",status:"in-progress",starred:false,update:"Functional meetings scheduled",nextFollowUp:"",followUpCount:1,createdAt:dStr(-10)},
  {id:"d22",text:"Quality assurance plan",delegate:"Arvind",phone:"",status:"todo",starred:false,update:"",nextFollowUp:dStr(5),followUpCount:0,createdAt:dStr(-3)},
  {id:"d23",text:"LMS first training video",delegate:"Khushmeet",phone:"82992 74822",status:"done",starred:false,update:"Video received",nextFollowUp:"",followUpCount:2,createdAt:dStr(-18)},
  {id:"d24",text:"Unconditional RERA followup",delegate:"Vijay ji",phone:"",status:"in-progress",starred:true,update:"Follow-up call needed",nextFollowUp:dStr(0),followUpCount:3,createdAt:dStr(-14)},
];
const INIT_QC=[
  {id:"qc1",text:"Gram scuba photo uploads",ts:Date.now()-86400000*2},
  {id:"qc2",text:"Forecast weekly",ts:Date.now()-3600000*5},
  {id:"qc3",text:"Send Sachin performance mail",ts:Date.now()-600000},
];
const INIT_UNWIND=[
  {id:"u1",text:"Golf",target:3,unit:"sessions/week",category:"Sport",people:"Solo",done:1,color:"#50C8A8"},
  {id:"u2",text:"Horse riding",target:1,unit:"session",category:"Sport",people:"Solo",done:0,color:"#F5A623"},
  {id:"u3",text:"Badminton + swimming with family",target:1,unit:"session/week",category:"Sport",people:"Family",done:0,color:"#4A9EFF"},
  {id:"u4",text:"Sunday evening golf with friends",target:1,unit:"session/week",category:"Outing",people:"Friends",done:0,color:"#9B8AFF"},
  {id:"u5",text:"Saturday chill with friends",target:1,unit:"session/week",category:"Chill",people:"Friends",done:0,color:"#FF7A7A"},
];
const INIT_HOLIDAYS=[
  {id:"h1",month:"Jan",plan:"Japan ski",type:"ski",people:"Friends",status:"done",notes:"Niseko - done"},
  {id:"h2",month:"Mar",plan:"Vrindavan",type:"spiritual",people:"Family",status:"done",notes:""},
  {id:"h3",month:"May",plan:"Scuba course",type:"adventure",people:"Solo",status:"done",notes:"PADI refresher"},
  {id:"h4",month:"Jul",plan:"Europe trip",type:"city",people:"Family",status:"planned",notes:"Visa in progress - Reena"},
  {id:"h5",month:"Sep",plan:"",type:"adventure",people:"Solo",status:"empty",notes:""},
  {id:"h6",month:"Nov",plan:"",type:"festival",people:"Friends",status:"empty",notes:""},
];
const INIT_BUCKET=[
  {id:"b1",text:"Trek to Everest base camp",priority:"2026",done:false},
  {id:"b2",text:"Watch Aurora Borealis",priority:"2026",done:false},
  {id:"b3",text:"Skydiving",priority:"someday",done:false},
  {id:"b4",text:"Learn to play guitar",priority:"someday",done:false},
  {id:"b5",text:"Write a book",priority:"someday",done:false},
  {id:"b6",text:"Deep sea fishing",priority:"someday",done:false},
];
const INIT_RECURRING=[
  {id:"r1",task:"Schedule meetings per meeting sheet",frequency:"Weekly",weeks:{W1:"done",W2:"",W3:"",W4:"",W5:""}},
  {id:"r2",task:"MIS Calls",frequency:"Weekly",weeks:{W1:"done",W2:"",W3:"",W4:"",W5:""}},
  {id:"r3",task:"AOA follow-up - weekly meeting & MOM",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"r4",task:"Update monthly cases on calendar",frequency:"Monthly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"r5",task:"Schedule IC Meeting weekly",frequency:"Weekly",weeks:{W1:"done",W2:"",W3:"",W4:"",W5:""}},
  {id:"r6",task:"Project Meeting MoM",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"r7",task:"Weekly Report - CRM",frequency:"Weekly",weeks:{W1:"received",W2:"received",W3:"",W4:"",W5:""}},
  {id:"r8",task:"Weekly Report - Quality",frequency:"Weekly",weeks:{W1:"received",W2:"received",W3:"",W4:"",W5:""}},
  {id:"r9",task:"Weekly Escalation - HR",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"r10",task:"CEO Dashboard & Department Dashboard",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
];

// SMALL UI
function Chip({label,color,bg}){return <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:bg,color,fontFamily:"monospace",whiteSpace:"nowrap"}}>{label}</span>;}
function AgingBadge({createdAt}){const d=daysSince(createdAt);if(d===null)return null;const c=agingColor(d);return <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}30`,fontFamily:"monospace",whiteSpace:"nowrap"}}>{d===0?"Today":`${d}d`}</span>;}
function FUBadge({count}){if(!count)return null;return <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(155,138,255,0.15)",color:"#9B8AFF",border:"1px solid rgba(155,138,255,0.25)",fontFamily:"monospace"}}>x{count}</span>;}

function UpdateField({value,onChange}){
  const T=useT();
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(value);
  if(editing)return(
    <div style={{marginTop:8}}>
      <textarea value={draft} onChange={e=>setDraft(e.target.value)} autoFocus rows={3}
        style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"8px 10px",color:T.text,fontSize:12,resize:"none",boxSizing:"border-box",lineHeight:1.5}}/>
      <div style={{display:"flex",gap:8,marginTop:6}}>
        <button onClick={()=>setEditing(false)} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
        <button onClick={()=>{onChange(draft);setEditing(false);}} style={{flex:2,padding:"7px",borderRadius:9,border:"none",background:"#F5A623",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
      </div>
    </div>
  );
  return(
    <div onClick={()=>{setDraft(value);setEditing(true);}} style={{marginTop:6,background:T.bgPanel,borderRadius:9,padding:"8px 10px",cursor:"text",border:`1px dashed ${T.border}`,minHeight:32}}>
      {value?<p style={{margin:0,fontSize:12,color:T.textSub,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{value}</p>:<p style={{margin:0,fontSize:11,color:T.textDim}}>Tap to add update...</p>}
    </div>
  );
}

function Modal({title,onClose,onSave,children}){
  const T=useT();
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
      <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
        {title&&<p style={{margin:"0 0 16px",fontSize:14,fontWeight:600,color:T.text}}>{title}</p>}
        {children}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          {onSave&&<button onClick={onSave} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save</button>}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({icon,title,subtitle,onConfirm,onCancel,confirmLabel,confirmColor}){
  const T=useT();
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:360,textAlign:"center"}}>
        {icon&&<p style={{fontSize:28,margin:"0 0 8px"}}>{icon}</p>}
        <p style={{margin:"0 0 6px",fontSize:15,fontWeight:600,color:T.text}}>{title}</p>
        {subtitle&&<p style={{margin:"0 0 22px",fontSize:12,color:T.textSub,lineHeight:1.5}}>{subtitle}</p>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:2,padding:"11px",borderRadius:12,border:"none",background:confirmColor||"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>{confirmLabel||"Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

// LOGIN
function Login({onLogin,theme,toggleTheme}){
  const T=useT();
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const tryPin=d=>{
    if(pin.length>=4)return;
    const next=pin+d;setPin(next);setErr("");
    if(next.length===4){
      if(next===USERS[sel].pin)setTimeout(()=>onLogin(USERS[sel]),150);
      else setTimeout(()=>{setPin("");setErr("Incorrect PIN");},350);
    }
  };
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",transition:"background 0.3s"}}>
      <button onClick={toggleTheme} style={{position:"absolute",top:24,right:24,padding:"6px 14px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:14,cursor:"pointer"}}>{theme==="dark"?"Sun":"Moon"}</button>
      <p style={{margin:"0 0 4px",fontSize:10,color:"#F5A623",fontFamily:"monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS - GVR</p>
      <h1 style={{margin:"0 0 44px",fontSize:26,fontWeight:600,color:T.textHeading}}>{sel?"Enter PIN":"Who's signing in?"}</h1>
      {!sel?(
        <div style={{display:"flex",gap:16,width:"100%",maxWidth:340}}>
          {Object.values(USERS).map(u=>(
            <button key={u.id} onClick={()=>{setSel(u.id);setPin("");setErr("");}}
              style={{flex:1,padding:"28px 16px",borderRadius:20,border:`1.5px solid ${u.color}35`,background:`${u.color}08`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:`${u.color}20`,border:`2px solid ${u.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:u.color}}>{u.avatar}</div>
              <div style={{textAlign:"center"}}>
                <p style={{margin:0,fontSize:15,fontWeight:600,color:T.textHeading}}>{u.name}</p>
                <p style={{margin:"3px 0 0",fontSize:10,color:T.textSub,fontFamily:"monospace",textTransform:"uppercase"}}>{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:280}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:`${USERS[sel].color}20`,border:`2px solid ${USERS[sel].color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:USERS[sel].color,marginBottom:10}}>{USERS[sel].avatar}</div>
          <p style={{margin:"0 0 28px",color:T.textSub}}>{USERS[sel].name}</p>
          <div style={{display:"flex",gap:14,marginBottom:8}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<pin.length?USERS[sel].color:T.pinDot,border:`1.5px solid ${i<pin.length?USERS[sel].color:T.pinDotBorder}`,transition:"all 0.15s",boxShadow:i<pin.length?`0 0 8px ${USERS[sel].color}70`:"none"}}/>)}
          </div>
          <p style={{margin:"0 0 22px",fontSize:11,color:err?"#FF7A7A":T.textMuted,fontFamily:"monospace",minHeight:16}}>{err||" "}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%",marginBottom:18}}>
            {[1,2,3,4,5,6,7,8,9,"",0,"<"].map((d,i)=>(
              <button key={i} onClick={()=>d==="<"?setPin(p=>p.slice(0,-1)):d!==""?tryPin(String(d)):null}
                style={{padding:"15px",borderRadius:13,border:`1px solid ${T.border}`,background:d===""?"transparent":T.bgPanel,color:d==="<"?T.textSub:T.text,fontSize:d==="<"?17:19,fontWeight:500,cursor:d===""?"default":"pointer"}}>{d}</button>
            ))}
          </div>
          <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Back</button>
        </div>
      )}
    </div>
  );
}

// TODAY PANEL
function TodayPanel({eaTasks,delTasks,onEaStatus,onDelStatus,onEaDone,onDelDone,onDateChange}){
  const T=useT();
  const today=todayStr();
  const eaDue=eaTasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=today&&t.status!=="done");
  const delDue=delTasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=today&&t.status!=="done");
  const all=[...eaDue.map(t=>({...t,_k:"ea"})),...delDue.map(t=>({...t,_k:"del"}))];
  if(!all.length)return null;
  return(
    <div style={{margin:"0 16px 14px",background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.25)",borderRadius:14,padding:"12px 14px"}}>
      <p style={{margin:"0 0 10px",fontSize:11,color:"#F5A623",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Today Follow-ups ({all.length})</p>
      {all.map(t=>{
        const sm=t._k==="ea"?EA_STATUS:DEL_STATUS;
        return(
          <div key={t.id} style={{background:T.todayBg,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1px solid ${T.todayBorder}`}}>
            <p style={{margin:0,fontSize:13,color:T.text}}>{t.text}</p>
            <p style={{margin:"2px 0 6px",fontSize:11,color:T.textSub}}>to {t.delegate}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:10,color:T.textMuted,fontFamily:"monospace",flexShrink:0}}>Next:</span>
              <input type="date" value={t.nextFollowUp||""} onChange={e=>onDateChange(t.id,t._k,e.target.value)}
                style={{flex:1,background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:8,padding:"4px 8px",color:"#F5A623",fontSize:12,fontFamily:"monospace"}}/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(sm).map(([k,v])=>(
                <button key={k} onClick={()=>{if(k==="done"){t._k==="ea"?onEaDone(t.id):onDelDone(t.id);}else{t._k==="ea"?onEaStatus(t.id,k):onDelStatus(t.id,k);}}}
                  style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:t.status===k?v.bg:T.bgChip,color:t.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"monospace"}}>{v.label}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// INBOX TAB
function InboxTab({items,onAdd,onDelete,onRoute}){
  const T=useT();
  const [text,setText]=useState("");
  const [routing,setRouting]=useState(null);
  const [rList,setRList]=useState("todo");
  const [rDel,setRDel]=useState("");
  const now=Date.now();
  const isOld=ts=>now-ts>86400000;
  const age=ts=>{const h=Math.round((now-ts)/3600000);return h<24?`${h}h ago`:`${Math.round(h/24)}d ago`;};
  const add=()=>{if(!text.trim())return;onAdd(text.trim());setText("");};
  const confirm=()=>{onRoute(routing,rList,rDel);setRouting(null);setRDel("");};
  const LISTS=[{id:"todo",icon:"Me",label:"My Day",color:"#F5A623"},{id:"ea",icon:"EA",label:"EA List",color:"#4A9EFF"},{id:"del",icon:"Del",label:"Delegated",color:"#9B8AFF"}];
  return(
    <div style={{padding:"0 16px"}}>
      {routing&&(
        <Modal title="Add to which list?" onClose={()=>setRouting(null)} onSave={confirm}>
          <p style={{margin:"0 0 14px",fontSize:14,color:T.text}}>{routing.text}</p>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {LISTS.map(l=>(
              <button key={l.id} onClick={()=>setRList(l.id)} style={{flex:1,padding:"11px 4px",borderRadius:12,border:"none",cursor:"pointer",background:rList===l.id?`${l.color}18`:T.bgPanel,color:rList===l.id?l.color:T.textMuted,fontSize:11,fontFamily:"monospace",outline:rList===l.id?`1.5px solid ${l.color}50`:"none"}}>
                <div style={{fontSize:13,fontWeight:700}}>{l.icon}</div><div style={{marginTop:4}}>{l.label}</div>
              </button>
            ))}
          </div>
          {rList!=="todo"&&<input value={rDel} onChange={e=>setRDel(e.target.value)} placeholder="Delegate name (optional)" style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>}
        </Modal>
      )}
      <div style={{background:"rgba(245,166,35,0.05)",border:"1px dashed rgba(245,166,35,0.22)",borderRadius:14,padding:14,marginBottom:14}}>
        <p style={{margin:"0 0 8px",fontSize:11,color:"#F5A623",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Quick Capture</p>
        <div style={{display:"flex",gap:8}}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Capture anything instantly..."
            style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14}}/>
          <button onClick={add} style={{background:"#F5A623",border:"none",borderRadius:10,padding:"10px 18px",color:"#000",fontWeight:700,fontSize:17,cursor:"pointer"}}>+</button>
        </div>
      </div>
      {items.filter(i=>isOld(i.ts)).length>0&&<p style={{fontSize:11,color:"#FF7A7A",margin:"0 0 10px",fontFamily:"monospace"}}>Warning: {items.filter(i=>isOld(i.ts)).length} items older than 24h</p>}
      {items.length===0?<div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:28}}>ok</p><p style={{fontSize:12,color:T.textMuted}}>Inbox zero</p></div>
      :items.map(item=>(
        <div key={item.id} style={{background:isOld(item.ts)?"rgba(255,77,77,0.06)":T.bgCard,border:`1px solid ${isOld(item.ts)?"rgba(255,77,77,0.2)":T.border}`,borderRadius:12,padding:"11px 13px",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{flex:1}}>
              <p style={{margin:0,fontSize:13,color:T.text}}>{item.text}</p>
              <p style={{margin:"3px 0 0",fontSize:10,color:isOld(item.ts)?"#FF7A7A":T.textMuted,fontFamily:"monospace"}}>{age(item.ts)}</p>
            </div>
            <button onClick={()=>onDelete(item.id)} style={{background:"none",border:"none",color:T.textMuted,fontSize:14,cursor:"pointer"}}>x</button>
          </div>
          <button onClick={()=>setRouting(item)} style={{width:"100%",marginTop:9,padding:"8px",borderRadius:9,border:"none",background:T.bgPanel,color:T.textSub,fontSize:12,fontFamily:"monospace",cursor:"pointer"}}>Add to list</button>
        </div>
      ))}
    </div>
  );
}

// RECURRING TRACKER
function RecurringTracker(){
  const T=useT();
  const [items,setItems]=useState(INIT_RECURRING);
  const [cycle,setCycle]=useState("June 2026");
  const [editCycle,setEditCycle]=useState(false);
  const [resetConfirm,setResetConfirm]=useState(false);
  const [addOpen,setAddOpen]=useState(false);
  const [addText,setAddText]=useState("");
  const [addFreq,setAddFreq]=useState("Weekly");
  const [deleteId,setDeleteId]=useState(null);

  const nextStatus=cur=>{const o=["","done","received","pending"];return o[(o.indexOf(cur)+1)%o.length];};
  const setWeek=(id,w,v)=>setItems(p=>p.map(i=>i.id===id?{...i,weeks:{...i.weeks,[w]:v}}:i));
  const addItem=()=>{if(!addText.trim())return;setItems(p=>[...p,{id:uid(),task:addText.trim(),frequency:addFreq,weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}}]);setAddText("");setAddOpen(false);};

  const Cell=({id,week,value})=>{
    const s=WEEK_STATUS[value]||WEEK_STATUS[""];
    return <button onClick={()=>setWeek(id,week,nextStatus(value))} style={{flex:1,minWidth:0,padding:"5px 1px",borderRadius:7,border:"none",cursor:"pointer",background:s.bg,color:s.color,fontSize:8,fontFamily:"monospace",textAlign:"center"}}>{value?s.label:"--"}</button>;
  };

  const Section=({title,color,freq})=>{
    const sec=items.filter(i=>i.frequency===freq);
    return(
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <p style={{margin:0,fontSize:10,color,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{title}</p>
          <div style={{flex:1,height:1,background:T.borderSub}}/>
          <button onClick={()=>{setAddFreq(freq);setAddOpen(true);}} style={{fontSize:10,padding:"2px 10px",borderRadius:20,border:`1px solid ${color}40`,background:`${color}10`,color,cursor:"pointer",fontFamily:"monospace"}}>+ Add</button>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:5}}>
          <div style={{flex:"0 0 auto",width:"44%"}}/>
          {WEEKS.map(w=><div key={w} style={{flex:1,textAlign:"center",fontSize:9,color:T.textMuted,fontFamily:"monospace"}}>{w}</div>)}
          <div style={{width:22}}/>
        </div>
        {sec.length===0&&<p style={{fontSize:12,color:T.textDim,textAlign:"center",padding:"8px 0"}}>None yet</p>}
        {sec.map(item=>{
          const dc=WEEKS.filter(w=>item.weeks[w]==="done"||item.weeks[w]==="received").length;
          return(
            <div key={item.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px",marginBottom:6}}>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <div style={{flex:"0 0 auto",width:"44%",paddingRight:4}}>
                  <p style={{margin:0,fontSize:11,color:T.text,lineHeight:1.3}}>{item.task}</p>
                  {dc>0&&<span style={{fontSize:9,color:"#4CAF50",fontFamily:"monospace"}}>{dc} done</span>}
                </div>
                {WEEKS.map(w=><Cell key={w} id={item.id} week={w} value={item.weeks[w]}/>)}
                <button onClick={()=>setDeleteId(item.id)} style={{width:22,height:22,flexShrink:0,borderRadius:5,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.07)",color:"#FF7A7A",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>x</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return(
    <div>
      {resetConfirm&&<ConfirmModal icon="Reset" title="Start new cycle?" subtitle="All week statuses clear. Tasks stay." onConfirm={()=>{setItems(p=>p.map(i=>({...i,weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}})));setResetConfirm(false);}} onCancel={()=>setResetConfirm(false)} confirmLabel="Reset" confirmColor="#4A9EFF"/>}
      {deleteId&&<ConfirmModal icon="Del" title="Delete task?" subtitle={items.find(i=>i.id===deleteId)?.task} onConfirm={()=>{setItems(p=>p.filter(i=>i.id!==deleteId));setDeleteId(null);}} onCancel={()=>setDeleteId(null)} confirmLabel="Delete" confirmColor="#FF4D4D"/>}
      {addOpen&&(
        <Modal title="Add recurring task" onClose={()=>setAddOpen(false)} onSave={addItem}>
          <input value={addText} onChange={e=>setAddText(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="Task name..."
            style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}>
            {["Weekly","Monthly"].map(f=>(
              <button key={f} onClick={()=>setAddFreq(f)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:addFreq===f?(f==="Weekly"?"rgba(74,158,255,0.15)":"rgba(155,138,255,0.15)"):T.bgPanel,color:addFreq===f?(f==="Weekly"?"#4A9EFF":"#9B8AFF"):T.textMuted,fontSize:13,fontWeight:addFreq===f?600:400}}>{f}</button>
            ))}
          </div>
        </Modal>
      )}
      <div style={{background:"rgba(74,158,255,0.07)",border:"1px solid rgba(74,158,255,0.18)",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            {editCycle?<input value={cycle} onChange={e=>setCycle(e.target.value)} onBlur={()=>setEditCycle(false)} autoFocus style={{background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:8,padding:"4px 8px",color:T.text,fontSize:14,fontWeight:600,width:140}}/>
            :<p style={{margin:0,fontSize:14,fontWeight:600,color:T.textHeading,cursor:"pointer"}} onClick={()=>setEditCycle(true)}>{cycle} (edit)</p>}
            <p style={{margin:"4px 0 0",fontSize:10,color:T.textMuted,fontFamily:"monospace"}}>Tap cell to cycle: -- / Done / Recv / Pend</p>
          </div>
          <button onClick={()=>setResetConfirm(true)} style={{padding:"6px 12px",borderRadius:10,border:"1px solid rgba(74,158,255,0.3)",background:"rgba(74,158,255,0.08)",color:"#4A9EFF",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>New cycle</button>
        </div>
      </div>
      <Section title="Weekly Tasks" color="#4A9EFF" freq="Weekly"/>
      <Section title="Monthly Tasks" color="#9B8AFF" freq="Monthly"/>
    </div>
  );
}

// MY DAY TAB
function MyDayTab({todos,setTodos,eaTasks,setEaTasks,delTasks,setDelTasks,isOwner}){
  const T=useT();
  const [filter,setFilter]=useState("all");
  const [addOpen,setAddOpen]=useState(false);
  const [addText,setAddText]=useState("");
  const [addBci,setAddBci]=useState("schedule");
  const [holidays,setHolidays]=useState(INIT_HOLIDAYS);
  const [bucket,setBucket]=useState(INIT_BUCKET);
  const [holOpen,setHolOpen]=useState(true);
  const [bucketOpen,setBucketOpen]=useState(true);
  const [editHol,setEditHol]=useState(null);
  const [holForm,setHolForm]=useState(null);
  const [newBucket,setNewBucket]=useState("");
  const [unwindItems,setUnwindItems]=useState(INIT_UNWIND);
  const [unwindOpen,setUnwindOpen]=useState(true);
  const [resetConfirm,setResetConfirm]=useState(false);
  const [addingUnwind,setAddingUnwind]=useState(false);
  const [newUnwind,setNewUnwind]=useState({text:"",target:1,unit:"sessions/week",category:"Sport",people:"Solo",color:"#50C8A8"});

  const counts={schedule:todos.filter(t=>t.bci==="schedule").length,waiting:todos.filter(t=>t.bci==="waiting").length,someday:todos.filter(t=>t.bci==="someday").length,done:todos.filter(t=>t.bci==="done").length};
  const doneHols=holidays.filter(h=>h.status==="done").length;
  const bucketDone=bucket.filter(b=>b.done).length;
  const totalDone=unwindItems.reduce((a,i)=>a+(i.done||0),0);
  const totalTarget=unwindItems.reduce((a,i)=>a+i.target,0);
  const uPct=totalTarget>0?Math.min(100,Math.round((totalDone/totalTarget)*100)):0;
  const uPctColor=uPct>=80?"#4CAF50":uPct>=50?"#F5A623":"#FF7A7A";

  const updTodo=(id,ch)=>setTodos(p=>p.map(t=>t.id===id?{...t,...ch}:t));
  const delTodo=id=>setTodos(p=>p.filter(t=>t.id!==id));

  const addTask=()=>{
    if(!addText.trim())return;
    setTodos(p=>[{id:uid(),text:addText.trim(),bci:addBci,update:"",followUp:false,delegate:"",followUpCount:0,createdAt:todayStr()},...p]);
    setAddText("");setAddOpen(false);
  };

  const filtered=filter==="all"?todos.filter(t=>t.bci!=="done"):todos.filter(t=>t.bci===filter);
  const grouped=filter==="all"?[
    {bci:"schedule",label:"Scheduled",color:"#4A9EFF",items:todos.filter(t=>t.bci==="schedule")},
    {bci:"waiting",label:"Waiting",color:"#9B8AFF",items:todos.filter(t=>t.bci==="waiting")},
    {bci:"someday",label:"Someday",color:"#50C8A8",items:todos.filter(t=>t.bci==="someday")},
  ]:null;

  const TodoCard=({task})=>{
    const [open,setOpen]=useState(false);
    const isDone=task.bci==="done";
    const bci=TODO_BCI[task.bci]||TODO_BCI.schedule;
    return(
      <div style={{background:isDone?T.bgPanel:T.bgCard,border:`1px solid ${isDone?"rgba(76,175,80,0.15)":T.border}`,borderLeft:`3px solid ${bci.color}`,borderRadius:12,marginBottom:8,overflow:"hidden",opacity:isDone?0.6:1}}>
        <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
          <button onClick={()=>updTodo(task.id,{bci:isDone?"schedule":"done"})} style={{flexShrink:0,width:22,height:22,borderRadius:"50%",marginTop:2,border:isDone?"none":`1.5px solid ${T.textMuted}`,background:isDone?"#4CAF50":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",boxShadow:isDone?"0 0 8px rgba(76,175,80,0.4)":"none"}}>{isDone?"v":""}</button>
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>!isDone&&setOpen(o=>!o)}>
            <p style={{margin:0,fontSize:14,color:isDone?T.textMuted:T.text,textDecoration:isDone?"line-through":"none",lineHeight:1.4}}>{task.text}</p>
            <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
              <Chip label={bci.label} color={bci.color} bg={bci.bg}/>
              <AgingBadge createdAt={task.createdAt}/>
              <FUBadge count={task.followUpCount}/>
              {task.update&&!open&&<span style={{fontSize:10,color:T.textMuted}}>note</span>}
            </div>
          </div>
          {!isDone&&<button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer",padding:"2px 4px"}}>{open?"^":"v"}</button>}
        </div>
        {open&&!isDone&&(
          <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
            <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Bucket</p>
            <div style={{display:"flex",gap:6}}>
              {Object.entries(TODO_BCI).filter(([k])=>k!=="done").map(([k,v])=>(
                <button key={k} onClick={()=>updTodo(task.id,{bci:k})} style={{flex:1,padding:"7px 4px",borderRadius:10,border:"none",cursor:"pointer",background:task.bci===k?v.bg:T.bgPanel,color:task.bci===k?v.color:T.textMuted,fontSize:10,fontFamily:"monospace",outline:task.bci===k?`1.5px solid ${v.color}50`:"none"}}>{v.label}</button>
              ))}
            </div>
            <p style={{margin:"10px 0 4px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Update</p>
            <UpdateField value={task.update} onChange={v=>updTodo(task.id,{update:v,followUpCount:(task.followUpCount||0)+1})}/>
            {isOwner&&(
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={()=>{setEaTasks(p=>[{id:uid(),text:task.text,delegate:"",status:"todo",update:task.update||"",nextFollowUp:"",followUpCount:0,createdAt:todayStr()},...p]);delTodo(task.id);}} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>EA</button>
                <button onClick={()=>{setDelTasks(p=>[{id:uid(),text:task.text,delegate:"",phone:"",status:"todo",starred:false,update:task.update||"",nextFollowUp:"",followUpCount:0,createdAt:todayStr()},...p]);delTodo(task.id);}} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>Del</button>
                <button onClick={()=>delTodo(task.id)} style={{padding:"7px 12px",borderRadius:9,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.06)",color:"#FF7A7A",fontSize:11,cursor:"pointer"}}>Del</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return(
    <div>
      {editHol&&holForm&&(
        <Modal title="Edit Holiday" onClose={()=>{setEditHol(null);setHolForm(null);}} onSave={()=>{setHolidays(p=>p.map(h=>h.id===holForm.id?holForm:h));setEditHol(null);setHolForm(null);}}>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div>
              <p style={{margin:"0 0 4px",fontSize:10,color:"#888",fontFamily:"monospace",textTransform:"uppercase"}}>Month</p>
              <select value={holForm.month||""} onChange={e=>setHolForm(p=>({...p,month:e.target.value}))} style={{background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,cursor:"pointer",minWidth:80}}>
                <option value="">Pick</option>
                {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <p style={{margin:"0 0 4px",fontSize:10,color:"#888",fontFamily:"monospace",textTransform:"uppercase"}}>Plan</p>
              <input value={holForm.plan} onChange={e=>setHolForm(p=>({...p,plan:e.target.value}))} placeholder="e.g. Japan ski..." style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
          </div>
          <p style={{margin:"0 0 6px",fontSize:10,color:"#888",fontFamily:"monospace",textTransform:"uppercase"}}>Type</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
            {Object.entries(HOL_TYPES).map(([k,v])=>(
              <button key={k} onClick={()=>setHolForm(p=>({...p,type:k}))} style={{padding:"5px 10px",borderRadius:20,border:"none",cursor:"pointer",background:holForm.type===k?`${v.color}20`:T.bgPanel,color:holForm.type===k?v.color:T.textMuted,fontSize:11,fontFamily:"monospace",outline:holForm.type===k?`1.5px solid ${v.color}50`:"none"}}>{v.label}</button>
            ))}
          </div>
          <p style={{margin:"0 0 6px",fontSize:10,color:"#888",fontFamily:"monospace",textTransform:"uppercase"}}>With</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
            {Object.entries(PEOPLE_TAGS).map(([k,c])=>(
              <button key={k} onClick={()=>setHolForm(p=>({...p,people:k}))} style={{padding:"5px 10px",borderRadius:20,border:"none",cursor:"pointer",background:holForm.people===k?`${c}20`:T.bgPanel,color:holForm.people===k?c:T.textMuted,fontSize:11,fontFamily:"monospace"}}>{k}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {["planned","done","empty"].map(s=>(
              <button key={s} onClick={()=>setHolForm(p=>({...p,status:s}))} style={{flex:1,padding:"8px 4px",borderRadius:10,border:"none",cursor:"pointer",background:holForm.status===s?"rgba(245,166,35,0.15)":T.bgPanel,color:holForm.status===s?"#F5A623":T.textMuted,fontSize:11,fontFamily:"monospace"}}>{s==="empty"?"TBD":s}</button>
            ))}
          </div>
          <input value={holForm.notes||""} onChange={e=>setHolForm(p=>({...p,notes:e.target.value}))} placeholder="Notes..." style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
        </Modal>
      )}
      {addingUnwind&&(
        <Modal title="Add activity" onClose={()=>setAddingUnwind(false)} onSave={()=>{setUnwindItems(p=>[...p,{id:uid(),...newUnwind,done:0}]);setAddingUnwind(false);setNewUnwind({text:"",target:1,unit:"sessions/week",category:"Sport",people:"Solo",color:"#50C8A8"});}}>
          <input value={newUnwind.text} onChange={e=>setNewUnwind(p=>({...p,text:e.target.value}))} placeholder="Activity name..." style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input type="number" value={newUnwind.target} onChange={e=>setNewUnwind(p=>({...p,target:Number(e.target.value)}))} style={{width:60,background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 8px",color:T.text,fontSize:13}}/>
            <input value={newUnwind.unit} onChange={e=>setNewUnwind(p=>({...p,unit:e.target.value}))} placeholder="unit" style={{flex:1,background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}/>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {Object.entries(HOBBY_TAGS).map(([k,c])=><button key={k} onClick={()=>setNewUnwind(p=>({...p,category:k}))} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:newUnwind.category===k?`${c}20`:T.bgPanel,color:newUnwind.category===k?c:T.textMuted,fontSize:10,fontFamily:"monospace"}}>{k}</button>)}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {Object.entries(PEOPLE_TAGS).map(([k,c])=><button key={k} onClick={()=>setNewUnwind(p=>({...p,people:k}))} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:newUnwind.people===k?`${c}20`:T.bgPanel,color:newUnwind.people===k?c:T.textMuted,fontSize:10,fontFamily:"monospace"}}>{k}</button>)}
          </div>
        </Modal>
      )}
      {resetConfirm&&<ConfirmModal icon="Reset" title="New week?" subtitle="Session counts reset to zero. Activities stay." onConfirm={()=>{setUnwindItems(p=>p.map(i=>({...i,done:0})));setResetConfirm(false);}} onCancel={()=>setResetConfirm(false)} confirmLabel="Reset" confirmColor="#50C8A8"/>}

      {/* Reminders */}
      <div style={{padding:"14px 16px 0"}}>
        <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
          {[{icon:"Book",label:"Read",color:"#4A9EFF"},{icon:"Brain",label:"Learn",color:"#9B8AFF"},{icon:"Build",label:"Build",color:"#F5A623"},{icon:"$",label:"Earn",color:"#4CAF50"},{icon:"Give",label:"Give",color:"#50C8A8"}].map(r=>(
            <div key={r.label} style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:20,background:`${r.color}10`,border:`1px solid ${r.color}22`}}>
              <span style={{fontSize:11,fontWeight:600,color:r.color,fontFamily:"monospace"}}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick add */}
      <div style={{padding:"10px 16px 4px"}}>
        {!addOpen?(
          <button onClick={()=>setAddOpen(true)} style={{width:"100%",padding:"10px 14px",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:18,color:T.textDim}}>+</span>
            <span style={{fontSize:13,color:T.textMuted}}>Add task to My Day...</span>
          </button>
        ):(
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
            <input value={addText} onChange={e=>setAddText(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")addTask();if(e.key==="Escape")setAddOpen(false);}} placeholder="Task name..."
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:9,padding:"9px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:10}}/>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {Object.entries(TODO_BCI).filter(([k])=>k!=="done").map(([k,v])=>(
                <button key={k} onClick={()=>setAddBci(k)} style={{flex:1,padding:"6px 4px",borderRadius:9,border:"none",cursor:"pointer",background:addBci===k?v.bg:T.bgPanel,color:addBci===k?v.color:T.textDim,fontSize:10,fontFamily:"monospace",outline:addBci===k?`1.5px solid ${v.color}40`:"none"}}>{v.label}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setAddOpen(false)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
              <button onClick={addTask} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#F5A623",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add to My Day</button>
            </div>
          </div>
        )}
      </div>

      {/* Work Tasks */}
      <div style={{padding:"14px 16px 0"}}>
        <p style={{margin:"0 0 10px",fontSize:10,color:"#F5A623",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Work Tasks</p>
        <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",scrollbarWidth:"none"}}>
          {[{id:"all",label:"All",color:"#F5A623"},...Object.entries(TODO_BCI).map(([k,v])=>({id:k,label:v.label,color:v.color,count:counts[k]}))].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",background:filter===f.id?`${f.color}18`:T.bgPanel,color:filter===f.id?f.color:T.textMuted,fontSize:11,fontFamily:"monospace",outline:filter===f.id?`1.5px solid ${f.color}35`:"none"}}>{f.label}{f.count!==undefined?` (${f.count})`:""}</button>
          ))}
        </div>
        {grouped?grouped.map(g=>g.items.length?(
          <div key={g.bci} style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:g.color}}/>
              <p style={{margin:0,fontSize:10,color:g.color,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>{g.label}</p>
              <div style={{flex:1,height:1,background:T.borderSub}}/>
              <span style={{fontSize:10,color:T.textMuted,fontFamily:"monospace"}}>{g.items.length}</span>
            </div>
            {g.items.map(t=><TodoCard key={t.id} task={t}/>)}
          </div>
        ):null):(filtered.map(t=><TodoCard key={t.id} task={t}/>))}
        {((grouped&&todos.filter(t=>t.bci!=="done").length===0)||(!grouped&&filtered.length===0))&&<div style={{textAlign:"center",padding:"28px 0",color:T.textDim}}><p style={{fontSize:12}}>Nothing here</p></div>}
      </div>

      {/* Unwind */}
      <div style={{padding:"0 16px"}}>
        <div style={{height:1,background:T.borderSub,margin:"20px 0 0"}}/>
        <button onClick={()=>setUnwindOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"14px 0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <p style={{margin:0,fontSize:10,color:"#50C8A8",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Weekly Unwind</p>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${uPctColor}14`,color:uPctColor,fontFamily:"monospace"}}>{uPct}%</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={e=>{e.stopPropagation();setResetConfirm(true);}} style={{fontSize:10,padding:"3px 10px",borderRadius:20,border:"1px solid rgba(80,200,168,0.3)",background:"rgba(80,200,168,0.08)",color:"#50C8A8",cursor:"pointer",fontFamily:"monospace"}}>New week</button>
            <span style={{fontSize:12,color:T.textMuted}}>{unwindOpen?"^":"v"}</span>
          </div>
        </button>
        {unwindOpen&&(
          <>
            <div style={{height:4,borderRadius:2,background:T.bgPanel,overflow:"hidden",marginBottom:12}}>
              <div style={{height:"100%",width:`${uPct}%`,background:uPctColor,borderRadius:2}}/>
            </div>
            {unwindItems.map(item=>{
              const ip=item.target>0?Math.min(100,Math.round(((item.done||0)/item.target)*100)):0;
              const pplC=PEOPLE_TAGS[item.people]||"#888";
              return(
                <div key={item.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderLeft:`3px solid ${item.color}`,borderRadius:11,marginBottom:7,padding:"10px 12px",display:"flex",gap:10,alignItems:"center"}}>
                  <button onClick={()=>setUnwindItems(p=>p.map(i=>i.id===item.id?{...i,done:ip>=100?0:item.target}:i))} style={{flexShrink:0,width:22,height:22,borderRadius:"50%",border:ip>=100?"none":`1.5px solid ${T.textMuted}`,background:ip>=100?"#4CAF50":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",boxShadow:ip>=100?"0 0 8px rgba(76,175,80,0.4)":"none"}}>{ip>=100?"v":""}</button>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <p style={{margin:0,fontSize:13,color:ip>=100?T.textMuted:T.text,flex:1,textDecoration:ip>=100?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.text}</p>
                      <span style={{fontSize:10,color:T.textMuted,fontFamily:"monospace",flexShrink:0}}>{item.done||0}/{item.target}</span>
                    </div>
                    <div style={{marginTop:5,height:3,borderRadius:2,background:T.bgPanel,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${ip}%`,background:item.color,borderRadius:2}}/>
                    </div>
                    <div style={{display:"flex",gap:5,marginTop:4}}>
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:`${pplC}14`,color:pplC,fontFamily:"monospace"}}>{item.people}</span>
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:T.bgPanel,color:T.textMuted,fontFamily:"monospace"}}>{item.category}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>setUnwindItems(p=>p.map(i=>i.id===item.id?{...i,done:Math.max(0,(i.done||0)-1)}:i))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.text,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                    <button onClick={()=>setUnwindItems(p=>p.map(i=>i.id===item.id?{...i,done:Math.min(item.target+2,(i.done||0)+1)}:i))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.text,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    {ip>=100&&<button onClick={()=>setUnwindItems(p=>p.filter(i=>i.id!==item.id))} style={{width:24,height:24,borderRadius:6,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.06)",color:"#FF7A7A",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>}
                  </div>
                </div>
              );
            })}
            <button onClick={()=>setAddingUnwind(true)} style={{width:"100%",padding:"9px",borderRadius:10,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer",marginTop:2}}>+ Add activity</button>
          </>
        )}
      </div>

      {/* Holidays */}
      <div style={{padding:"0 16px"}}>
        <div style={{height:1,background:T.borderSub,margin:"20px 0 0"}}/>
        <button onClick={()=>setHolOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"14px 0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <p style={{margin:0,fontSize:10,color:"#F5A623",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Holidays</p>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:doneHols>=4?"rgba(76,175,80,0.12)":"rgba(245,166,35,0.1)",color:doneHols>=4?"#4CAF50":"#F5A623",fontFamily:"monospace"}}>{doneHols}/4</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={e=>{e.stopPropagation();const n={id:uid(),month:"",plan:"",type:"adventure",people:"Family",status:"empty",notes:""};setHolidays(p=>[...p,n]);setEditHol(n);setHolForm(n);}} style={{fontSize:11,padding:"4px 11px",borderRadius:20,border:"1px solid rgba(245,166,35,0.3)",background:"rgba(245,166,35,0.08)",color:"#F5A623",cursor:"pointer",fontFamily:"monospace"}}>+ Add</button>
            <span style={{fontSize:12,color:T.textMuted}}>{holOpen?"^":"v"}</span>
          </div>
        </button>
        {holOpen&&holidays.map(h=>{
          const ht=HOL_TYPES[h.type]||HOL_TYPES.adventure;
          return(
            <div key={h.id} style={{background:!h.plan?T.bgPanel:T.bgCard,border:`1px solid ${!h.plan?T.borderSub:T.border}`,borderLeft:`3px solid ${!h.plan?T.textDim:ht.color}`,borderRadius:12,marginBottom:8,padding:"10px 13px",display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,cursor:"pointer",minWidth:0}} onClick={()=>{setEditHol(h);setHolForm({...h});}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {h.month&&<span style={{fontSize:10,color:"#F5A623",fontFamily:"monospace",fontWeight:600,flexShrink:0}}>{h.month}</span>}
                  <p style={{margin:0,fontSize:13,color:!h.plan?T.textDim:h.status==="done"?T.textMuted:T.text,textDecoration:h.status==="done"?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{!h.plan?"Tap to plan...":h.plan}</p>
                </div>
                {h.plan&&<div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:`${ht.color}14`,color:ht.color,fontFamily:"monospace"}}>{ht.label}</span>
                  {h.people&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:T.bgPanel,color:T.textMuted,fontFamily:"monospace"}}>{h.people}</span>}
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:h.status==="done"?"rgba(76,175,80,0.12)":h.status==="planned"?"rgba(74,158,255,0.12)":T.bgPanel,color:h.status==="done"?"#4CAF50":h.status==="planned"?"#4A9EFF":T.textMuted,fontFamily:"monospace"}}>{h.status==="done"?"Done":h.status==="planned"?"Planned":"TBD"}</span>
                  {h.notes&&<span style={{fontSize:9,color:T.textMuted}}>{h.notes}</span>}
                </div>}
              </div>
              <button onClick={()=>setHolidays(p=>p.filter(x=>x.id!==h.id))} style={{width:24,height:24,borderRadius:6,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.06)",color:"#FF7A7A",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
            </div>
          );
        })}
      </div>

      {/* Bucket */}
      <div style={{padding:"0 16px",paddingBottom:24}}>
        <div style={{height:1,background:T.borderSub,margin:"20px 0 0"}}/>
        <button onClick={()=>setBucketOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"14px 0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <p style={{margin:0,fontSize:10,color:"#9B8AFF",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Bucket List</p>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(155,138,255,0.1)",color:"#9B8AFF",fontFamily:"monospace"}}>{bucketDone}/{bucket.length}</span>
          </div>
          <span style={{fontSize:12,color:T.textMuted}}>{bucketOpen?"^":"v"}</span>
        </button>
        {bucketOpen&&(
          <>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={newBucket} onChange={e=>setNewBucket(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newBucket.trim()){setBucket(p=>[{id:uid(),text:newBucket.trim(),priority:"someday",done:false},...p]);setNewBucket("");}}} placeholder="Add to bucket list..." style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13}}/>
              <button onClick={()=>{if(newBucket.trim()){setBucket(p=>[{id:uid(),text:newBucket.trim(),priority:"someday",done:false},...p]);setNewBucket("");}}} style={{background:"#9B8AFF",border:"none",borderRadius:10,padding:"9px 16px",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer"}}>+</button>
            </div>
            {bucket.filter(b=>!b.done).map(b=>(
              <div key={b.id} style={{display:"flex",gap:9,alignItems:"center",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 12px",marginBottom:7}}>
                <button onClick={()=>setBucket(p=>p.map(x=>x.id===b.id?{...x,done:true}:x))} style={{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${T.textMuted}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
                <p style={{margin:0,fontSize:13,color:T.text,flex:1}}>{b.text}</p>
                <button onClick={()=>setBucket(p=>p.map(x=>x.id===b.id?{...x,priority:x.priority==="2026"?"someday":"2026"}:x))} style={{fontSize:9,padding:"2px 8px",borderRadius:10,border:`1px solid ${T.border}`,background:b.priority==="2026"?"rgba(245,166,35,0.12)":T.bgPanel,color:b.priority==="2026"?"#F5A623":T.textMuted,fontFamily:"monospace",cursor:"pointer",flexShrink:0}}>{b.priority==="2026"?"2026":"Someday"}</button>
                <button onClick={()=>setBucket(p=>p.filter(x=>x.id!==b.id))} style={{width:22,height:22,borderRadius:6,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.06)",color:"#FF7A7A",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
              </div>
            ))}
            {bucket.filter(b=>b.done).length>0&&(
              <>
                <p style={{margin:"10px 0 6px",fontSize:9,color:"#4CAF50",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Done</p>
                {bucket.filter(b=>b.done).map(b=>(
                  <div key={b.id} style={{display:"flex",gap:9,alignItems:"center",background:T.bgPanel,border:`1px solid ${T.borderSub}`,borderRadius:10,padding:"8px 12px",marginBottom:5,opacity:0.55}}>
                    <span style={{fontSize:13,color:"#4CAF50"}}>v</span>
                    <p style={{margin:0,fontSize:12,color:T.textMuted,flex:1,textDecoration:"line-through"}}>{b.text}</p>
                    <button onClick={()=>setBucket(p=>p.map(x=>x.id===b.id?{...x,done:false}:x))} style={{background:"none",border:"none",color:T.textMuted,fontSize:11,cursor:"pointer"}}>undo</button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// EA TAB
function EaTab({tasks,setTasks,delTasks,setDelTasks,todos,setTodos,approvals,setApprovals,setTab,isOwner}){
  const T=useT();
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("asc");
  const [addOpen,setAddOpen]=useState(false);
  const [addText,setAddText]=useState("");
  const [addDelegate,setAddDelegate]=useState("");
  const [addDest,setAddDest]=useState("ea");
  const [recurOpen,setRecurOpen]=useState(false);

  const today=todayStr();
  const upd=(id,ch)=>setTasks(p=>p.map(t=>t.id===id?{...t,...ch}:t));
  const updDel=(id,ch)=>setDelTasks(p=>p.map(t=>t.id===id?{...t,...ch}:t));

  const markDone=id=>{
    const task=tasks.find(t=>t.id===id);if(!task)return;
    setTasks(p=>p.filter(t=>t.id!==id));
    setApprovals(p=>[{...task,id:uid(),fromList:"ea"},...p]);
    setTab("approvals");
  };

  const addTask=()=>{
    if(!addText.trim())return;
    const base={text:addText.trim(),delegate:addDelegate.trim(),update:"",nextFollowUp:"",followUpCount:0,createdAt:todayStr()};
    if(addDest==="ea"){setTasks(p=>[{id:uid(),...base,status:"todo"},...p]);}
    else if(addDest==="todo"){setTodos(p=>[{id:uid(),...base,bci:"schedule",followUp:false},...p]);}
    else{setDelTasks(p=>[{id:uid(),...base,status:"todo",starred:false,phone:""},...p]);}
    setAddText("");setAddDelegate("");setAddOpen(false);
  };

  const filtered=(()=>{
    let r=filter==="all"?tasks:filter==="due-today"?tasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=today&&t.status!=="done"):tasks.filter(t=>t.status===filter);
    return [...r].sort((a,b)=>{const da=a.nextFollowUp||"9999",db=b.nextFollowUp||"9999";return sort==="asc"?da.localeCompare(db):db.localeCompare(da);});
  })();

  const Card=({task})=>{
    const [open,setOpen]=useState(false);
    const sm=EA_STATUS[task.status]||EA_STATUS.todo;
    const due=task.nextFollowUp&&task.nextFollowUp<=today&&task.status!=="done";
    return(
      <div style={{background:T.bgCard,border:due?"1px solid rgba(245,166,35,0.3)":`1px solid ${T.border}`,borderLeft:`3px solid ${due?"#F5A623":sm.color}`,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
        <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
            <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <p style={{margin:0,fontSize:14,color:T.text,lineHeight:1.4,flex:1}}>{task.text}</p>
              {due&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(245,166,35,0.15)",color:"#F5A623",fontFamily:"monospace",flexShrink:0}}>Due</span>}
            </div>
            <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>to {task.delegate}</p>
            <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
              <Chip label={sm.label} color={sm.color} bg={sm.bg}/>
              <AgingBadge createdAt={task.createdAt}/>
              <FUBadge count={task.followUpCount}/>
              {task.nextFollowUp&&<Chip label={task.nextFollowUp} color="#F5A623" bg="rgba(245,166,35,0.08)"/>}
              {task.update&&!open&&<span style={{fontSize:10,color:T.textMuted}}>note</span>}
            </div>
          </div>
          <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>{open?"^":"v"}</button>
        </div>
        {open&&(
          <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
            <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Status</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(EA_STATUS).map(([k,v])=>(
                <button key={k} onClick={()=>k==="done"?markDone(task.id):upd(task.id,{status:k})} style={{padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",background:task.status===k?v.bg:T.bgPanel,color:task.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"monospace",outline:task.status===k?`1px solid ${v.color}50`:"none"}}>{v.label}</button>
              ))}
            </div>
            <p style={{margin:"10px 0 4px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Next Follow-up</p>
            <input type="date" value={task.nextFollowUp||""} onChange={e=>upd(task.id,{nextFollowUp:e.target.value})} style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:9,padding:"8px 10px",color:"#F5A623",fontSize:12,fontFamily:"monospace",boxSizing:"border-box",marginBottom:8}}/>
            <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Update</p>
            <UpdateField value={task.update} onChange={v=>upd(task.id,{update:v,followUpCount:(task.followUpCount||0)+1})}/>
            {isOwner&&(
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <button onClick={()=>{setTodos(p=>[{id:uid(),text:task.text,delegate:task.delegate||"",bci:"schedule",update:task.update||"",followUp:false,followUpCount:0,createdAt:todayStr()},...p]);setTasks(p=>p.filter(t=>t.id!==task.id));}} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>My Day</button>
                <button onClick={()=>{setDelTasks(p=>[{id:uid(),text:task.text,delegate:task.delegate||"",phone:"",status:"todo",starred:false,update:task.update||"",nextFollowUp:"",followUpCount:0,createdAt:todayStr()},...p]);setTasks(p=>p.filter(t=>t.id!==task.id));}} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>Del</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return(
    <div>
      <TodayPanel eaTasks={tasks} delTasks={delTasks}
        onEaStatus={(id,st)=>upd(id,{status:st})}
        onDelStatus={(id,st)=>updDel(id,{status:st})}
        onEaDone={markDone}
        onDelDone={id=>{const t=delTasks.find(x=>x.id===id);if(!t)return;setDelTasks(p=>p.filter(x=>x.id!==id));setApprovals(p=>[{...t,id:uid(),fromList:"del"},...p]);setTab("approvals");}}
        onDateChange={(id,k,date)=>k==="ea"?upd(id,{nextFollowUp:date}):updDel(id,{nextFollowUp:date})}
      />
      <div style={{padding:"0 16px"}}>
        {/* Quick add */}
        {!addOpen?(
          <button onClick={()=>setAddOpen(true)} style={{width:"100%",padding:"10px 14px",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:12}}>
            <span style={{fontSize:18,color:T.textDim}}>+</span>
            <span style={{fontSize:13,color:T.textMuted}}>Add task to EA / My Day / Delegated...</span>
          </button>
        ):(
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <input value={addText} onChange={e=>setAddText(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")addTask();if(e.key==="Escape")setAddOpen(false);}} placeholder="Task description..."
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:9,padding:"9px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:8}}/>
            <input value={addDelegate} onChange={e=>setAddDelegate(e.target.value)} placeholder="Delegate name (optional)"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:9,padding:"9px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:8}}/>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {[{id:"ea",label:"EA List",color:"#4A9EFF"},{id:"todo",label:"My Day",color:"#F5A623"},{id:"del",label:"Delegated",color:"#9B8AFF"}].map(l=>(
                <button key={l.id} onClick={()=>setAddDest(l.id)} style={{flex:1,padding:"7px 4px",borderRadius:9,border:"none",cursor:"pointer",background:addDest===l.id?`${l.color}18`:T.bgPanel,color:addDest===l.id?l.color:T.textMuted,fontSize:10,fontFamily:"monospace",outline:addDest===l.id?`1.5px solid ${l.color}40`:"none"}}>{l.label}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setAddOpen(false)} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
              <button onClick={addTask} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#4A9EFF",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add</button>
            </div>
          </div>
        )}
        {/* Filters */}
        <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
          <div style={{display:"flex",gap:5,flex:1,overflowX:"auto",scrollbarWidth:"none"}}>
            {[{id:"all",label:"All"},{id:"due-today",label:"Due Today"},...Object.entries(EA_STATUS).map(([k,v])=>({id:k,label:v.label}))].map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"none",background:filter===f.id?"rgba(74,158,255,0.12)":T.bgPanel,color:filter===f.id?"#4A9EFF":f.id==="due-today"?"#F5A623":T.textMuted,fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>{f.label}</button>
            ))}
          </div>
          <button onClick={()=>setSort(s=>s==="asc"?"desc":"asc")} style={{flexShrink:0,padding:"5px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer",fontFamily:"monospace",whiteSpace:"nowrap"}}>{sort==="asc"?"Date asc":"Date desc"}</button>
        </div>
        {filtered.map(t=><Card key={t.id} task={t}/>)}
        {!filtered.length&&<div style={{textAlign:"center",padding:"36px 0",color:T.textDim}}><p style={{fontSize:12}}>Nothing here</p></div>}
        {/* Recurring tracker */}
        <div style={{marginTop:20,borderTop:`1px solid ${T.borderSub}`,paddingTop:16}}>
          <button onClick={()=>setRecurOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",marginBottom:recurOpen?12:0}}>
            <p style={{margin:0,fontSize:10,color:"#4A9EFF",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Recurring Tracker</p>
            <span style={{fontSize:12,color:T.textMuted}}>{recurOpen?"^":"v"}</span>
          </button>
          {recurOpen&&<RecurringTracker/>}
        </div>
      </div>
    </div>
  );
}

// DEL TAB
function DelTab({tasks,setTasks,todos,setTodos,eaTasks,setEaTasks,approvals,setApprovals,setTab,isOwner}){
  const T=useT();
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("asc");
  const today=todayStr();
  const upd=(id,ch)=>setTasks(p=>p.map(t=>t.id===id?{...t,...ch}:t));
  const markDone=id=>{
    const task=tasks.find(t=>t.id===id);if(!task)return;
    setTasks(p=>p.filter(t=>t.id!==id));
    setApprovals(p=>[{...task,id:uid(),fromList:"del"},...p]);
    setTab("approvals");
  };
  const filtered=(()=>{
    let r=filter==="all"?tasks:filter==="starred"?tasks.filter(t=>t.starred):filter==="due-today"?tasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=today&&t.status!=="done"):filter==="need-help"?tasks.filter(t=>t.status==="need-help"):tasks.filter(t=>t.status===filter);
    r=[...r].sort((a,b)=>{const da=a.nextFollowUp||"9999",db=b.nextFollowUp||"9999";return sort==="asc"?da.localeCompare(db):db.localeCompare(da);});
    return [...r.filter(t=>t.starred),...r.filter(t=>!t.starred)];
  })();
  const Card=({task})=>{
    const [open,setOpen]=useState(false);
    const [editDate,setEditDate]=useState(false);
    const sm=DEL_STATUS[task.status]||DEL_STATUS.todo;
    const due=task.nextFollowUp&&task.nextFollowUp<=today&&task.status!=="done";
    return(
      <div style={{background:task.starred?"rgba(255,200,60,0.05)":T.bgCard,border:task.starred?"1px solid rgba(255,200,60,0.25)":due?"1px solid rgba(245,166,35,0.3)":`1px solid ${T.border}`,borderLeft:`3px solid ${due?"#F5A623":sm.color}`,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
        <div style={{padding:"11px 13px",display:"flex",gap:8,alignItems:"flex-start"}}>
          {isOwner&&<button onClick={()=>upd(task.id,{starred:!task.starred})} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"1px 0",flexShrink:0,color:task.starred?"#F5C842":T.textDim}}>*</button>}
          {!isOwner&&task.starred&&<span style={{fontSize:16,color:"#F5C842",flexShrink:0}}>*</span>}
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
            <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <p style={{margin:0,fontSize:14,color:T.text,lineHeight:1.4,flex:1}}>{task.text}</p>
              {due&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(245,166,35,0.15)",color:"#F5A623",fontFamily:"monospace",flexShrink:0}}>Due</span>}
            </div>
            <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>to {task.delegate}{task.phone?` - ${task.phone}`:""}</p>
            <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
              <Chip label={sm.label} color={sm.color} bg={sm.bg}/>
              <AgingBadge createdAt={task.createdAt}/>
              <FUBadge count={task.followUpCount}/>
              {task.nextFollowUp&&<Chip label={task.nextFollowUp} color="#F5A623" bg="rgba(245,166,35,0.08)"/>}
              {task.update&&!open&&<span style={{fontSize:10,color:T.textMuted}}>note</span>}
            </div>
          </div>
          <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>{open?"^":"v"}</button>
        </div>
        {open&&(
          <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
            <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Status</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(DEL_STATUS).map(([k,v])=>(
                <button key={k} onClick={()=>k==="done"?markDone(task.id):upd(task.id,{status:k})} style={{padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",background:task.status===k?v.bg:T.bgPanel,color:task.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"monospace",outline:task.status===k?`1px solid ${v.color}50`:"none"}}>{v.label}</button>
              ))}
            </div>
            <p style={{margin:"10px 0 5px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Next Follow-up</p>
            {editDate?(
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input type="date" defaultValue={task.nextFollowUp||""} onBlur={e=>{upd(task.id,{nextFollowUp:e.target.value});setEditDate(false);}} autoFocus style={{flex:1,background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:9,padding:"8px 10px",color:T.text,fontSize:12}}/>
                <button onClick={()=>setEditDate(false)} style={{padding:"8px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>x</button>
              </div>
            ):(
              <div onClick={()=>setEditDate(true)} style={{background:"rgba(245,166,35,0.06)",borderRadius:9,padding:"8px 10px",cursor:"pointer",border:"1px dashed rgba(245,166,35,0.2)",marginBottom:8}}>
                {task.nextFollowUp?<p style={{margin:0,fontSize:12,color:"#F5A623",fontFamily:"monospace"}}>{task.nextFollowUp}</p>:<p style={{margin:0,fontSize:11,color:T.textDim}}>Tap to set date...</p>}
              </div>
            )}
            <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1}}>Update</p>
            <UpdateField value={task.update} onChange={v=>upd(task.id,{update:v,followUpCount:(task.followUpCount||0)+1})}/>
            {isOwner&&(
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <button onClick={()=>{setTodos(p=>[{id:uid(),text:task.text,delegate:task.delegate||"",bci:"schedule",update:task.update||"",followUp:false,followUpCount:0,createdAt:todayStr()},...p]);setTasks(p=>p.filter(t=>t.id!==task.id));}} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>My Day</button>
                <button onClick={()=>{setEaTasks(p=>[{id:uid(),text:task.text,delegate:task.delegate||"",status:"todo",update:task.update||"",nextFollowUp:"",followUpCount:0,createdAt:todayStr()},...p]);setTasks(p=>p.filter(t=>t.id!==task.id));}} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>EA</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  return(
    <div style={{padding:"0 16px"}}>
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <div style={{display:"flex",gap:5,flex:1,overflowX:"auto",scrollbarWidth:"none"}}>
          {[{id:"all",label:"All"},{id:"due-today",label:"Due Today"},{id:"starred",label:"Starred"},{id:"need-help",label:"Need Help"},...Object.entries(DEL_STATUS).filter(([k])=>k!=="need-help").map(([k,v])=>({id:k,label:v.label}))].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"none",background:filter===f.id?"rgba(155,138,255,0.12)":T.bgPanel,color:filter===f.id?"#9B8AFF":f.id==="need-help"?"#FF7A7A":f.id==="due-today"?"#F5A623":T.textMuted,fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>{f.label}</button>
          ))}
        </div>
        <button onClick={()=>setSort(s=>s==="asc"?"desc":"asc")} style={{flexShrink:0,padding:"5px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer",fontFamily:"monospace",whiteSpace:"nowrap"}}>{sort==="asc"?"Date asc":"Date desc"}</button>
      </div>
      {filtered.map(t=><Card key={t.id} task={t}/>)}
      {!filtered.length&&<div style={{textAlign:"center",padding:"36px 0",color:T.textDim}}><p style={{fontSize:12}}>Nothing here</p></div>}
    </div>
  );
}

// APPROVALS TAB
function ApprovalsTab({approvals,setApprovals,setTodos,setEaTasks,setDelTasks}){
  const T=useT();
  const approve=id=>setApprovals(p=>p.filter(a=>a.id!==id));
  const reject=id=>{
    const a=approvals.find(x=>x.id===id);if(!a)return;
    const task={id:uid(),text:a.text,update:(a.update||"")+" [Sent back]",delegate:a.delegate||"",status:"in-progress",nextFollowUp:"",followUpCount:0,createdAt:todayStr()};
    setApprovals(p=>p.filter(x=>x.id!==id));
    if(a.fromList==="ea")setEaTasks(p=>[task,...p]);
    else setDelTasks(p=>[{...task,starred:false,phone:a.phone||""},...p]);
  };
  return(
    <div style={{padding:"0 16px"}}>
      <div style={{background:"rgba(76,175,80,0.07)",border:"1px solid rgba(76,175,80,0.18)",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
        <p style={{margin:0,fontSize:11,color:"#4CAF50",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Approval Queue</p>
        <p style={{margin:"3px 0 0",fontSize:11,color:T.textSub}}>Tasks marked done - approve to close or send back.</p>
      </div>
      {approvals.length===0?<div style={{textAlign:"center",padding:"40px 0",color:T.textDim}}><p style={{fontSize:12}}>Nothing to approve</p></div>
      :approvals.map(a=>(
        <div key={a.id} style={{background:"rgba(76,175,80,0.05)",border:"1px solid rgba(76,175,80,0.2)",borderLeft:"3px solid #4CAF50",borderRadius:12,marginBottom:8,padding:"11px 13px"}}>
          <p style={{margin:0,fontSize:14,color:T.text}}>{a.text}</p>
          <p style={{margin:"3px 0 6px",fontSize:11,color:T.textSub}}>to {a.delegate} - from {a.fromList==="ea"?"EA":"Delegation"}</p>
          {a.update&&<p style={{margin:"0 0 8px",fontSize:12,color:T.textSub}}>{a.update}</p>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>approve(a.id)} style={{flex:2,padding:"9px",borderRadius:10,border:"none",background:"#4CAF50",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Approve and Close</button>
            <button onClick={()=>reject(a.id)} style={{flex:1,padding:"9px",borderRadius:10,border:"1px solid rgba(255,77,77,0.3)",background:"rgba(255,77,77,0.08)",color:"#FF7A7A",fontSize:12,cursor:"pointer"}}>Send Back</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// MAIN APP
export default function App(){
  const [theme,setTheme]=useState("dark");
  const T=theme==="dark"?DARK:LIGHT;
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("inbox");
  const [todos,setTodos]=useState(INIT_TODO);
  const [eaTasks,setEaTasks]=useState(INIT_EA);
  const [delTasks,setDelTasks]=useState(INIT_DEL);
  const [approvals,setApprovals]=useState([]);
  const [qc,setQc]=useState(INIT_QC);
  const [toast,setToast]=useState(null);

  const fire=msg=>{setToast(msg);setTimeout(()=>setToast(null),2000);};
  const login=u=>{setUser(u);setTab(u.tabs[0]);};
  const logout=()=>{setUser(null);setTab("inbox");};

  if(!user)return<TC.Provider value={T}><Login onLogin={login} theme={theme} toggleTheme={()=>setTheme(t=>t==="dark"?"light":"dark")}/></TC.Provider>;

  const isOwner=user.id==="payas";
  const today=todayStr();

  const routeQC=(item,list,delegate)=>{
    setQc(p=>p.filter(i=>i.id!==item.id));
    const base={text:item.text,delegate:delegate||"",update:"",followUpCount:0,createdAt:todayStr()};
    if(list==="todo"){setTodos(p=>[{id:uid(),...base,bci:"schedule",followUp:false},...p]);setTab("myday");}
    else if(list==="ea"){setEaTasks(p=>[{id:uid(),...base,status:"todo",nextFollowUp:""},...p]);setTab("ea");}
    else{setDelTasks(p=>[{id:uid(),...base,phone:"",status:"todo",starred:false,nextFollowUp:""},...p]);setTab("del");}
    fire("Added!");
  };

  const todoCount=todos.filter(t=>t.bci!=="done").length;
  const eaDue=eaTasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=today&&t.status!=="done").length;
  const delDue=delTasks.filter(t=>t.nextFollowUp&&t.nextFollowUp<=today&&t.status!=="done").length;
  const delStar=delTasks.filter(t=>t.starred).length;
  const qcOld=qc.filter(i=>Date.now()-i.ts>86400000).length;

  const ALL_TABS=[
    {id:"inbox",icon:"In",label:"Inbox",badge:qc.length,alert:qcOld>0},
    {id:"myday",icon:"Me",label:"My Day",badge:todoCount},
    {id:"ea",icon:"EA",label:"EA",badge:eaTasks.length,alert:eaDue>0},
    {id:"del",icon:"Del",label:"Delegated",badge:delTasks.length,alert:delDue>0,star:delStar},
    {id:"approvals",icon:"Ok",label:"Approvals",badge:approvals.length,alert:approvals.length>0},
  ];
  const TABS=ALL_TABS.filter(t=>user.tabs.includes(t.id));

  return(
    <TC.Provider value={T}>
      <div style={{minHeight:"100vh",background:T.bg,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column",transition:"background 0.3s"}}>
        <style>{`*{box-sizing:border-box;}::-webkit-scrollbar{display:none;}
          @media(min-width:768px){.snav{display:flex!important;}.bnav{display:none!important;}.cont{margin-left:220px!important;}.hdr{margin-left:220px!important;}.inr{max-width:720px!important;margin:0 auto!important;}}
          @media(max-width:767px){.snav{display:none!important;}.bnav{display:flex!important;}.cont{margin-left:0!important;}}
        `}</style>

        {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"10px 20px",fontSize:13,color:T.text,zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",whiteSpace:"nowrap"}}>{toast}</div>}

        {/* SIDEBAR */}
        <div className="snav" style={{position:"fixed",left:0,top:0,bottom:0,width:220,background:T.bgSub||T.bgCard,borderRight:`1px solid ${T.border}`,display:"none",flexDirection:"column",padding:"28px 0",zIndex:100}}>
          <div style={{padding:"0 20px 16px"}}>
            <p style={{margin:0,fontSize:9,color:"#F5A623",fontFamily:"monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS</p>
            <p style={{margin:"2px 0 0",fontSize:18,fontWeight:600,color:T.textHeading}}>GVR</p>
          </div>
          <div style={{padding:"0 12px 16px"}}>
            <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{width:"100%",padding:"7px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:13,cursor:"pointer"}}>{theme==="dark"?"Light mode":"Dark mode"}</button>
          </div>
          <div style={{margin:"0 12px 20px",padding:"10px 12px",background:`${user.color}0A`,border:`1px solid ${user.color}25`,borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`${user.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:user.color,flexShrink:0}}>{user.avatar}</div>
            <div>
              <p style={{margin:0,fontSize:13,fontWeight:600,color:T.textHeading}}>{user.name}</p>
              <p style={{margin:0,fontSize:9,color:T.textSub,fontFamily:"monospace",textTransform:"uppercase"}}>{user.role}</p>
            </div>
          </div>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",background:tab===t.id?"rgba(245,166,35,0.08)":"transparent",border:"none",borderLeft:tab===t.id?"3px solid #F5A623":"3px solid transparent",cursor:"pointer",width:"100%",textAlign:"left"}}>
              <span style={{fontSize:13,fontWeight:700,color:tab===t.id?"#F5A623":T.textSub,fontFamily:"monospace",minWidth:24}}>{t.icon}</span>
              <span style={{flex:1,fontSize:13,color:tab===t.id?"#F5A623":T.textSub}}>{t.label}</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {t.alert&&<span style={{width:7,height:7,borderRadius:"50%",background:t.id==="approvals"?"#4CAF50":"#F5A623",boxShadow:`0 0 6px ${t.id==="approvals"?"#4CAF50":"#F5A623"}90`}}/>}
                {t.star>0&&<span style={{fontSize:9,color:"#F5C842",fontFamily:"monospace"}}>{t.star}*</span>}
                {t.badge>0&&!t.alert&&<span style={{fontSize:10,color:T.textMuted,background:T.bgChip,padding:"1px 6px",borderRadius:10,fontFamily:"monospace"}}>{t.badge}</span>}
              </div>
            </button>
          ))}
          <div style={{marginTop:"auto",padding:"0 12px 12px"}}>
            <button onClick={logout} style={{width:"100%",padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer",fontFamily:"monospace"}}>Sign out</button>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="hdr" style={{padding:"50px 20px 14px",borderBottom:`1px solid ${T.borderSub}`,background:T.bg}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{margin:0,fontSize:10,color:"#F5A623",fontFamily:"monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS - GVR</p>
              <h1 style={{margin:"2px 0 0",fontSize:22,fontWeight:600,color:T.textHeading}}>{TABS.find(t=>t.id===tab)?.label||"Dashboard"}</h1>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:12,cursor:"pointer"}}>{theme==="dark"?"Light":"Dark"}</button>
              <div style={{display:"flex",alignItems:"center",gap:7,background:`${user.color}12`,border:`1px solid ${user.color}30`,borderRadius:20,padding:"5px 10px 5px 7px"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`${user.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:user.color}}>{user.avatar}</div>
                <p style={{margin:0,fontSize:12,fontWeight:600,color:T.textHeading}}>{user.name}</p>
              </div>
              <button onClick={logout} style={{background:T.bgPanel,border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 10px",color:T.textSub,fontSize:11,cursor:"pointer"}}>Out</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:14}}>
            {[
              {label:"My Day",val:todoCount,color:"#F5A623",show:isOwner},
              {label:"EA",val:eaTasks.length,color:"#4A9EFF",show:true},
              {label:"Del",val:delTasks.length,color:"#9B8AFF",show:true,star:delStar},
              {label:"Approv",val:approvals.length,color:approvals.length>0?"#4CAF50":"#555",warn:approvals.length>0,show:isOwner},
            ].filter(s=>s.show).map(s=>(
              <div key={s.label} style={{flex:1,background:s.warn?"rgba(76,175,80,0.08)":T.statBg,border:`1px solid ${s.warn?"rgba(76,175,80,0.2)":T.statBorder}`,borderRadius:10,padding:"7px 5px",textAlign:"center"}}>
                <p style={{margin:0,fontSize:16,fontWeight:700,color:s.color,fontFamily:"monospace"}}>{s.val}</p>
                {s.star>0&&<p style={{margin:0,fontSize:9,color:"#F5C842"}}>{s.star} starred</p>}
                <p style={{margin:0,fontSize:8,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.4}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="cont" style={{flex:1,paddingTop:14,paddingBottom:110}}>
          <div className="inr" style={{width:"100%"}}>
            {tab==="inbox"&&isOwner&&<InboxTab items={qc} onAdd={t=>setQc(p=>[{id:uid(),text:t,ts:Date.now()},...p])} onDelete={id=>setQc(p=>p.filter(i=>i.id!==id))} onRoute={routeQC}/>}
            {tab==="myday"&&isOwner&&<MyDayTab todos={todos} setTodos={setTodos} eaTasks={eaTasks} setEaTasks={setEaTasks} delTasks={delTasks} setDelTasks={setDelTasks} isOwner={isOwner}/>}
            {tab==="ea"&&<EaTab tasks={eaTasks} setTasks={setEaTasks} delTasks={delTasks} setDelTasks={setDelTasks} todos={todos} setTodos={setTodos} approvals={approvals} setApprovals={setApprovals} setTab={setTab} isOwner={isOwner}/>}
            {tab==="del"&&<DelTab tasks={delTasks} setTasks={setDelTasks} todos={todos} setTodos={setTodos} eaTasks={eaTasks} setEaTasks={setEaTasks} approvals={approvals} setApprovals={setApprovals} setTab={setTab} isOwner={isOwner}/>}
            {tab==="approvals"&&isOwner&&<ApprovalsTab approvals={approvals} setApprovals={setApprovals} setTodos={setTodos} setEaTasks={setEaTasks} setDelTasks={setDelTasks}/>}
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div className="bnav" style={{position:"fixed",bottom:0,left:0,right:0,background:T.navBg,backdropFilter:"blur(24px)",borderTop:`1px solid ${T.borderSub}`,padding:"10px 4px 30px",display:"none",gap:1,zIndex:100}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"4px 1px",borderRadius:10}}>
              <div style={{position:"relative",display:"inline-block"}}>
                <span style={{fontSize:13,fontWeight:700,color:tab===t.id?"#F5A623":T.textMuted,fontFamily:"monospace"}}>{t.icon}</span>
                {t.alert&&<span style={{position:"absolute",top:-2,right:-4,width:7,height:7,background:t.id==="approvals"?"#4CAF50":"#F5A623",borderRadius:"50%"}}/>}
                {t.star>0&&<span style={{position:"absolute",top:-4,right:-6,background:"rgba(245,200,66,0.18)",borderRadius:10,fontSize:9,color:"#F5C842",padding:"1px 4px",fontFamily:"monospace"}}>{t.star}</span>}
                {t.badge>0&&!t.alert&&!t.star&&<span style={{position:"absolute",top:-4,right:-7,background:T.bgChip,borderRadius:10,fontSize:9,color:T.textMuted,padding:"1px 4px",fontFamily:"monospace"}}>{t.badge}</span>}
              </div>
              <p style={{margin:"2px 0 0",fontSize:8,fontFamily:"monospace",color:tab===t.id?"#F5A623":T.textDim}}>{t.label}</p>
            </button>
          ))}
        </div>
      </div>
    </TC.Provider>
  );
}
