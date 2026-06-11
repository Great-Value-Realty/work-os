import { useState, useEffect, useContext, createContext, useCallback } from "react";
import { supabase } from "./supabase";

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    id:"dark",label:"Dark",icon:"🌙",
    bg:"#0A0A0C",bgSub:"#0D0D0F",bgCard:"rgba(255,255,255,0.045)",
    bgInput:"rgba(255,255,255,0.06)",bgPanel:"rgba(255,255,255,0.04)",bgChip:"rgba(255,255,255,0.08)",
    border:"rgba(255,255,255,0.08)",borderSub:"rgba(255,255,255,0.05)",borderSide:"rgba(255,255,255,0.06)",borderInput:"rgba(255,255,255,0.1)",
    text:"#E0E0E0",textSub:"#666",textMuted:"#444",textDim:"#2A2A2A",textHeading:"#F0F0F0",textNav:"#777",
    navBg:"rgba(10,10,12,0.97)",headerGrad:"linear-gradient(180deg,rgba(245,166,35,0.04) 0%,transparent 100%)",
    statBg:"rgba(255,255,255,0.04)",statBorder:"rgba(255,255,255,0.06)",
    pillActive:"rgba(255,255,255,0.1)",pillInactive:"rgba(255,255,255,0.04)",
    btnSecBg:"rgba(255,255,255,0.05)",btnSecBorder:"rgba(255,255,255,0.08)",btnSecText:"#555",
    updateBg:"rgba(255,255,255,0.04)",updateBorder:"rgba(255,255,255,0.07)",updateText:"#999",updatePlaceholder:"#2A2A2A",
    todayBg:"rgba(0,0,0,0.3)",todayBorder:"rgba(255,255,255,0.05)",
    modalBg:"#141416",modalBorder:"rgba(255,255,255,0.08)",
    numpadBg:"rgba(255,255,255,0.05)",numpadBorder:"rgba(255,255,255,0.07)",
    pinDot:"rgba(255,255,255,0.08)",pinDotBorder:"rgba(255,255,255,0.12)",
    loginCardBg:(c)=>`${c}08`,
    schedSlotBg:"rgba(255,255,255,0.03)",schedSlotBorder:"rgba(255,255,255,0.05)",
    schedFree:"rgba(255,255,255,0.015)",schedFreeBorder:"1px dashed rgba(255,255,255,0.06)",
    dailyActualBg:"rgba(80,200,168,0.08)",
  },
  light: {
    id:"light",label:"Light",icon:"☀️",
    bg:"#F5F5F7",bgSub:"#FFFFFF",bgCard:"#FFFFFF",
    bgInput:"#FFFFFF",bgPanel:"#F0F0F2",bgChip:"rgba(0,0,0,0.06)",
    border:"rgba(0,0,0,0.09)",borderSub:"rgba(0,0,0,0.06)",borderSide:"rgba(0,0,0,0.08)",borderInput:"rgba(0,0,0,0.12)",
    text:"#1A1A1A",textSub:"#777",textMuted:"#999",textDim:"#CCC",textHeading:"#111111",textNav:"#888",
    navBg:"rgba(245,245,247,0.97)",headerGrad:"linear-gradient(180deg,rgba(245,166,35,0.06) 0%,transparent 100%)",
    statBg:"#FFFFFF",statBorder:"rgba(0,0,0,0.07)",
    pillActive:"rgba(0,0,0,0.08)",pillInactive:"rgba(0,0,0,0.04)",
    btnSecBg:"rgba(0,0,0,0.04)",btnSecBorder:"rgba(0,0,0,0.09)",btnSecText:"#888",
    updateBg:"rgba(0,0,0,0.03)",updateBorder:"rgba(0,0,0,0.08)",updateText:"#666",updatePlaceholder:"#CCC",
    todayBg:"rgba(0,0,0,0.04)",todayBorder:"rgba(0,0,0,0.06)",
    modalBg:"#FFFFFF",modalBorder:"rgba(0,0,0,0.1)",
    numpadBg:"rgba(0,0,0,0.04)",numpadBorder:"rgba(0,0,0,0.08)",
    pinDot:"rgba(0,0,0,0.1)",pinDotBorder:"rgba(0,0,0,0.15)",
    loginCardBg:(c)=>`${c}12`,
    schedSlotBg:"rgba(0,0,0,0.02)",schedSlotBorder:"rgba(0,0,0,0.05)",
    schedFree:"rgba(0,0,0,0.01)",schedFreeBorder:"1px dashed rgba(0,0,0,0.08)",
    dailyActualBg:"rgba(80,200,168,0.07)",
  },
};

const ThemeCtx=createContext(THEMES.dark);
const useT=()=>useContext(ThemeCtx);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const USERS={
  payas: {id:"payas",name:"Payas",pin:"1234",role:"Owner",avatar:"P",color:"#F5A623",tabs:["inbox","myday","ea","del","approvals","recurring"],rights:{todo:true,ea:true,del:true,approvals:true,capture:true,transfer:true,delete:true,star:true,approve:true,schedule:true,life:true,recurring:true}},
  varsha:{id:"varsha",name:"Varsha",pin:"5678",role:"EA",avatar:"V",color:"#4A9EFF",tabs:["ea","del","recurring"],rights:{todo:false,ea:true,del:true,approvals:false,capture:false,transfer:false,delete:false,star:false,approve:false,schedule:false,recurring:true}},
};
const TODO_STATUS={schedule:{label:"Scheduled",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},waiting:{label:"Waiting",color:"#9B8AFF",bg:"rgba(155,138,255,0.13)"},someday:{label:"Someday",color:"#50C8A8",bg:"rgba(80,200,168,0.13)"},done:{label:"Done ✓",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"}};
const EA_STATUS={todo:{label:"To Do",color:"#888",bg:"rgba(136,136,136,0.12)"},"in-progress":{label:"In Progress",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},scheduled:{label:"Scheduled",color:"#50C8A8",bg:"rgba(80,200,168,0.13)"},waiting:{label:"Waiting",color:"#9B8AFF",bg:"rgba(155,138,255,0.13)"},done:{label:"Done ✓",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"}};
const DEL_STATUS={todo:{label:"To Do",color:"#888",bg:"rgba(136,136,136,0.12)"},"in-progress":{label:"In Progress",color:"#4A9EFF",bg:"rgba(74,158,255,0.13)"},"need-help":{label:"Need Help",color:"#FF7A7A",bg:"rgba(255,77,77,0.13)"},done:{label:"Done ✓",color:"#4CAF50",bg:"rgba(76,175,80,0.13)"}};
const BATCHES={meetings:{label:"Meetings",icon:"🤝",color:"#4A9EFF"},docs:{label:"Docs / Approvals",icon:"📄",color:"#9B8AFF"},followups:{label:"Follow-ups",icon:"🔁",color:"#F5A623"},personal:{label:"Personal",icon:"🧍",color:"#50C8A8"}};
const DAYS=["MON","TUE","WED","THU","FRI","SAT"];
const TIMES=["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const today=new Date();
const dStr=d=>{const x=new Date(today);x.setDate(x.getDate()+d);return x.toISOString().split("T")[0];};

const SEED_TASKS=[
  // ── MY TO-DO (schedule) ──
  {id:"t1",list:"todo",text:"DWALL & Capcite Mobilisation",update:"Scheduled",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"MON",time:"10:00",followUpCount:0,createdAt:dStr(-3),batch:"meetings"},
  {id:"t2",list:"todo",text:"Gram scuba photo uploads",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"personal"},
  {id:"t3",list:"todo",text:"Tougher bar and gym visit",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"personal"},
  {id:"t4",list:"todo",text:"Forecast weekly",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"docs"},
  {id:"t5",list:"todo",text:"Appraisal sheet fill in",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"docs"},
  {id:"t6",list:"todo",text:"Buy sunglasses + running & gym shoes",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"personal"},
  {id:"t7",list:"todo",text:"Project team audit + revenue team audit",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"TUE",time:"09:00",followUpCount:0,createdAt:dStr(-2),batch:"meetings"},
  {id:"t8",list:"todo",text:"Slab cycle time review",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"meetings"},
  {id:"t9",list:"todo",text:"Sanat reply",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"followups"},
  {id:"t10",list:"todo",text:"Why is Samarth doing work on pen drive?",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"meetings"},
  {id:"t11",list:"todo",text:"Send Sachin lack of performance mail",update:"",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"docs"},
  {id:"t12",list:"todo",text:"Review & approve all DDs (Anitesh architect coordination)",update:"Communicated to Varsha",delegate:"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"WED",time:"11:00",followUpCount:1,createdAt:dStr(-5),batch:"docs"},
  // ── MY TO-DO (waiting) ──
  {id:"t13",list:"todo",text:"EC & mining — follow up RS Sharma",update:"Supreme Court — result expected soon. Last follow-up 10th June",delegate:"RS Sharma",status:"in-progress",bci:"waiting",starred:false,followUp:true,nextFollowUp:"2026-06-10",day:"",time:"",followUpCount:4,createdAt:dStr(-20),batch:"followups"},
  {id:"t14",list:"todo",text:"AOA Management — Maintenance & Handover, FAR negotiation, DWALL paintwork, DR case, Defamation case",update:"Delegated Anurag & Sharma",delegate:"Anurag / Sharma",status:"in-progress",bci:"waiting",starred:false,followUp:true,nextFollowUp:"",day:"",time:"",followUpCount:2,createdAt:dStr(-10),batch:"followups"},
  {id:"t15",list:"todo",text:"NSCI Bill vs Ledger analysis",update:"Check again vis-à-vis Kuldeep's mail",delegate:"Varsha",status:"in-progress",bci:"waiting",starred:false,followUp:true,nextFollowUp:"",day:"",time:"",followUpCount:1,createdAt:dStr(-7),batch:"docs"},
  {id:"t16",list:"todo",text:"PHD membership — discuss again, last date end of June",update:"",delegate:"Varsha",status:"todo",bci:"waiting",starred:false,followUp:true,nextFollowUp:"2026-06-30",day:"",time:"",followUpCount:0,createdAt:dStr(-5),batch:"meetings"},
  // ── MY TO-DO (someday) ──
  {id:"t17",list:"todo",text:"Billion dollar strategy — people crazy enough to think they can change the world are the ones who actually do it",update:"",delegate:"",status:"todo",bci:"someday",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-15),batch:"personal"},
  {id:"t18",list:"todo",text:"Plan a vacation for July",update:"",delegate:"",status:"todo",bci:"someday",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-8),batch:"personal"},
  {id:"t19",list:"todo",text:"Pants alteration",update:"",delegate:"",status:"todo",bci:"someday",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-5),batch:"personal"},

  // ── EA LIST ──
  {id:"e1",list:"ea",text:"AOP Formalise draft and plan",update:"Delegated to Kapil",delegate:"Varsha → Kapil",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"TUE",time:"10:00",followUpCount:3,createdAt:dStr(-8),batch:"docs"},
  {id:"e2",list:"ea",text:"Schedule Marketing & Capital meeting",update:"Attendees: Adhvika, Kanshika, Bhushan, Amit, Shubhodeep",delegate:"Varsha",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"WED",time:"09:00",followUpCount:0,createdAt:dStr(-3),batch:"meetings"},
  {id:"e3",list:"ea",text:"Brand credibility presentation — investor pitch",update:"Delegated to Shubhodeep — pitch and refine",delegate:"Varsha → Shubhodeep",status:"in-progress",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:5,createdAt:dStr(-12),batch:"docs"},
  {id:"e4",list:"ea",text:"Europe visa — Payas + MA + PA",update:"Delegated to Reena",delegate:"Varsha → Reena",status:"in-progress",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:1,createdAt:dStr(-6),batch:"docs"},
  {id:"e5",list:"ea",text:"Subsequent meeting Munish ji — Finesta Wealth",update:"Speak 2nd June",delegate:"Varsha",status:"scheduled",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"THU",time:"11:00",followUpCount:2,createdAt:dStr(-4),batch:"meetings"},
  {id:"e6",list:"ea",text:"Make MIS for each department live",update:"Scheduled via Functional Meetings",delegate:"Varsha → Dept heads",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:1,createdAt:dStr(-6),batch:"docs"},
  {id:"e7",list:"ea",text:"VDS Vendor Management System — onboarding to rating",update:"Delegated to NJ",delegate:"Varsha → NJ",status:"in-progress",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-5),batch:"docs"},
  {id:"e8",list:"ea",text:"Order ergonomic chair without armrest + laptop stand",update:"Laptop stand done ✓. Chair shortlisted.",delegate:"Varsha",status:"in-progress",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:1,createdAt:dStr(-7),batch:"personal"},
  {id:"e9",list:"ea",text:"Physio appointment",update:"First week of June",delegate:"Varsha",status:"scheduled",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-3),batch:"personal"},
  {id:"e10",list:"ea",text:"Rima Sachdeva meeting (Ex Confluence employee)",update:"",delegate:"Varsha",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"meetings"},
  {id:"e11",list:"ea",text:"AI course — apply for suitable weekend course (outskill.com). Block calendar. Ask Kaleem & Neeraj to apply too.",update:"Both registered — taking course in June",delegate:"Varsha",status:"done",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-15),batch:"personal"},
  {id:"e12",list:"ea",text:"Shift Amit to ground office + combine cabin for Payas",update:"",delegate:"Varsha → Amit",status:"todo",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-4),batch:"meetings"},
  {id:"e13",list:"ea",text:"Jaipur sinus doctor — contact Raju (Doc PA), carry CT scan",update:"Hospital shut — no access to doctor currently",delegate:"Varsha",status:"need-help",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:1,createdAt:dStr(-10),batch:"personal"},
  {id:"e14",list:"ea",text:"Board of Directors — Korn Ferry, Spencer Stuart, Egon Zehnder",update:"Due date August 2026 — Varsha to set meetings",delegate:"Varsha",status:"in-progress",bci:"waiting",starred:false,followUp:false,nextFollowUp:"2026-08-31",day:"",time:"",followUpCount:0,createdAt:dStr(-5),batch:"meetings"},
  {id:"e15",list:"ea",text:"IKEA ₹30 lac coupon — REMINDER ONLY",update:"Only for reminder purpose",delegate:"Varsha",status:"todo",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"personal"},
  {id:"e16",list:"ea",text:"Quotation for Nexon EV Car (for Arvind ji)",update:"Jasdeep (Parvinder's guy) shared the quotation",delegate:"Varsha",status:"done",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-8),batch:"personal"},

  // ── DELEGATION LIST ──
  {id:"d1",list:"del",text:"Indoor facility provision in Ekanam & DWALL without touching existing basement",update:"",delegate:"Prabhjot Kaur",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-05-18",day:"",time:"",followUpCount:0,createdAt:dStr(-24),batch:"docs",phone:"89299 76088"},
  {id:"d2",list:"del",text:"All future and unused inventory sale",update:"",delegate:"Ashish",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-05-25",day:"",time:"",followUpCount:0,createdAt:dStr(-17),batch:"docs",phone:"9560144299"},
  {id:"d3",list:"del",text:"Library / bookshelf in the new office design",update:"",delegate:"Prabhjot Kaur",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-05-30",day:"",time:"",followUpCount:0,createdAt:dStr(-12),batch:"docs",phone:"89299 76088"},
  {id:"d4",list:"del",text:"Pashupati land drawing + convert to plotted development",update:"",delegate:"Prabhjot Kaur",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-05-30",day:"",time:"",followUpCount:0,createdAt:dStr(-12),batch:"docs",phone:"89299 76088"},
  {id:"d5",list:"del",text:"Water body contract — feedback on DD landscape drawings",update:"",delegate:"Prabhjot Kaur",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-05-31",day:"",time:"",followUpCount:0,createdAt:dStr(-11),batch:"docs",phone:"89299 76088"},
  {id:"d6",list:"del",text:"Green building update",update:"",delegate:"Prabhjot Kaur",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-01",day:"",time:"",followUpCount:0,createdAt:dStr(-10),batch:"docs",phone:"89299 76088"},
  {id:"d7",list:"del",text:"Green building submission",update:"",delegate:"Prabhjot Kaur",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-01",day:"",time:"",followUpCount:0,createdAt:dStr(-10),batch:"docs",phone:"89299 76088"},
  {id:"d8",list:"del",text:"Schedule HR executive — train & make first LMS training video",update:"Video received ✓",delegate:"Khushmeet",status:"done",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-02",day:"",time:"",followUpCount:1,createdAt:dStr(-9),batch:"docs",phone:"8299274822"},
  {id:"d9",list:"del",text:"Vilasa bank loan — coordinate with Manish",update:"",delegate:"Ranjeet Bhalla",status:"in-progress",bci:"schedule",starred:true,followUp:false,nextFollowUp:"2026-06-05",day:"",time:"",followUpCount:0,createdAt:dStr(-6),batch:"docs",phone:"98999 32429"},
  {id:"d10",list:"del",text:"Naala cover",update:"",delegate:"RS Sharma",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-09",day:"",time:"",followUpCount:0,createdAt:dStr(-5),batch:"docs",phone:"97182 22020"},
  {id:"d11",list:"del",text:"Complete sample flat order by 6th",update:"",delegate:"Nidhi Jain",status:"in-progress",bci:"schedule",starred:true,followUp:false,nextFollowUp:"2026-06-10",day:"",time:"",followUpCount:0,createdAt:dStr(-4),batch:"docs",phone:"95602 71114"},
  {id:"d12",list:"del",text:"Sell the one flat we have in Sharnam",update:"",delegate:"Ranjeet Bhalla",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-11",day:"",time:"",followUpCount:0,createdAt:dStr(-3),batch:"meetings",phone:"98999 32429"},
  {id:"d13",list:"del",text:"Naresh FNF update",update:"",delegate:"Nidhi Jain",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-15",day:"",time:"",followUpCount:0,createdAt:dStr(-3),batch:"docs",phone:"95602 71114"},
  {id:"d14",list:"del",text:"Check and resolve Rohit Kakkar Eternia brokerage issue",update:"",delegate:"Ranjeet Bhalla",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-29",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"followups",phone:"98999 32429"},
  {id:"d15",list:"del",text:"Yoga Air company (Vivek can connect) — fresh air for Ekanam Clubhouse",update:"",delegate:"Prabhjot Kaur",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-30",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"meetings",phone:"89299 76088"},
  {id:"d16",list:"del",text:"Knox club gym + Green Cafe tie-up + Life Yoga for Ekanam — healthy living",update:"",delegate:"Nidhi Jain",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-30",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"meetings",phone:"95602 71114"},
  {id:"d17",list:"del",text:"Physical inventory audit of store — find external consultant",update:"",delegate:"Nidhi Jain",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-30",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"docs",phone:"95602 71114"},
  {id:"d18",list:"del",text:"Find physical inventory stock audit firm not currently working with us",update:"",delegate:"Nidhi Jain",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-30",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"docs",phone:"95602 71114"},
  {id:"d19",list:"del",text:"Interior Design named brand proposal for sales offer",update:"",delegate:"Nidhi Jain",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"2026-06-30",day:"",time:"",followUpCount:0,createdAt:dStr(-2),batch:"docs",phone:"95602 71114"},
  {id:"d20",list:"del",text:"Set up Payas's meeting with capital vertical — top 4 companies for fund raise",update:"",delegate:"Amit Goel",status:"todo",bci:"someday",starred:true,followUp:false,nextFollowUp:"2026-07-31",day:"",time:"",followUpCount:0,createdAt:dStr(-1),batch:"meetings",phone:"99100 97856"},
  {id:"d21",list:"del",text:"Unconditional RERA follow-up",update:"",delegate:"Vijay ji",status:"in-progress",bci:"schedule",starred:true,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:2,createdAt:dStr(-14),batch:"followups",phone:""},
  {id:"d22",list:"del",text:"PMC + structure estimation — additional points",update:"Check progress",delegate:"Shailesh & Anurag",status:"in-progress",bci:"waiting",starred:true,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:2,createdAt:dStr(-9),batch:"docs",phone:""},
  {id:"d23",list:"del",text:"Quality assurance plan",update:"",delegate:"Arvind",status:"todo",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-3),batch:"docs",phone:""},
  {id:"d24",list:"del",text:"Legal file compliance",update:"",delegate:"Khushboo",status:"todo",bci:"waiting",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:dStr(-3),batch:"docs",phone:""},
];
const SEED_QC=[
  {id:"qc1",text:"Gram scuba photo uploads",ts:Date.now()-86400000*2},
  {id:"qc2",text:"Unconditional RERA — followup Vijay ji",ts:Date.now()-3600000*3},
  {id:"qc3",text:"Forecast weekly",ts:Date.now()-3600000*1},
];

// ── Varsha recurring tasks (weekly/monthly tracker) ──────────────────────────
const SEED_VARSHA_RECURRING=[
  {id:"vr1",task:"Schedule meetings per meeting sheet",frequency:"Weekly",weeks:{W1:"done",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr2",task:"MIS Calls",frequency:"Weekly",weeks:{W1:"done",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr3",task:"Ask Anurag to follow up — AOA weekly meeting + MOM actions",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr4",task:"Update monthly cases on calendar per Legal team changes",frequency:"Monthly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr5",task:"Schedule IC Meeting weekly (Amit, Ranjeet, Goldee, Pranjal, Manoj Sir)",frequency:"Weekly",weeks:{W1:"done",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr6",task:"Project Meeting MoM",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr7",task:"Weekly Report — CRM",frequency:"Weekly",weeks:{W1:"received",W2:"received",W3:"",W4:"",W5:""}},
  {id:"vr8",task:"Weekly Report — Quality",frequency:"Weekly",weeks:{W1:"received",W2:"received",W3:"",W4:"",W5:""}},
  {id:"vr9",task:"Weekly Escalation — HR",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
  {id:"vr10",task:"CEO Dashboard & Department Dashboard",frequency:"Weekly",weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}},
];

// Seed daily log — tracks planned vs actually done for today
const todayDay=DAYS[today.getDay()===0?6:today.getDay()-1];
const SEED_DAILY={
  [todayDay]: TIMES.map(t=>({time:t,planned:"",actual:""}))
};
DAYS.filter(d=>d!==todayDay).forEach(d=>{SEED_DAILY[d]=TIMES.map(t=>({time:t,planned:"",actual:""}));});
// Pre-fill some planned slots to demo
["09:00","10:00","11:00","14:00","16:00"].forEach((t,i)=>{
  const row=SEED_DAILY[todayDay].find(r=>r.time===t);
  if(row){
    const labels=["8AM standup + quick capture review","DWALL site call — Capcite decision","Project team audit prep","Follow-ups: Vijay ji + RS Sharma","Docs: approve DDs + sign weekly file"];
    const done=["8AM standup done ✓","DWALL call — steel order confirmed","Audit pulled, numbers ready","Vijay ji — called, update noted","3 of 4 docs approved"];
    row.planned=labels[i];
    if(i<3)row.actual=done[i];
  }
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const daysSince=d=>{if(!d)return null;return Math.floor((Date.now()-new Date(d).getTime())/86400000);};
const agingColor=d=>{if(d===null)return"#999";if(d<=3)return"#4CAF50";if(d<=7)return"#F5A623";if(d<=14)return"#FF9944";return"#FF4D4D";};
const uid=()=>"id_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
const dbSync = {
  upsertTask: async (t) => {
    if (!supabase) return;
    await supabase.from('tasks').upsert({ id:t.id,list:t.list,text:t.text,update_note:t.update||'',delegate:t.delegate||'',status:t.status||'todo',bci:t.bci||'schedule',starred:!!t.starred,follow_up:!!t.followUp,next_follow_up:t.nextFollowUp||'',day:t.day||'',time:t.time||'',follow_up_count:t.followUpCount||0,created_at:t.createdAt||new Date().toISOString(),updated_at:new Date().toISOString() });
  },
  deleteTask: async (id) => { if (supabase) await supabase.from('tasks').delete().eq('id',id); },
  upsertApproval: async (a) => { if (!supabase) return; await supabase.from('approvals').upsert({ id:a.id,text:a.text,delegate:a.delegate||'',update_note:a.update||'',from_list:a.fromList,approved_at:new Date().toISOString() }); },
  deleteApproval: async (id) => { if (supabase) await supabase.from('approvals').delete().eq('id',id); },
  addCapture: async (item) => { if (supabase) await supabase.from('quick_capture').insert({ id:item.id,text:item.text }); },
  deleteCapture: async (id) => { if (supabase) await supabase.from('quick_capture').delete().eq('id',id); },
};
const rowToTask = r => ({ id:r.id,list:r.list,text:r.text,update:r.update_note,delegate:r.delegate,status:r.status,bci:r.bci,starred:r.starred,followUp:r.follow_up,nextFollowUp:r.next_follow_up,day:r.day,time:r.time,followUpCount:r.follow_up_count||0,createdAt:r.created_at });
const rowToApproval = r => ({ id:r.id,text:r.text,delegate:r.delegate,update:r.update_note,fromList:r.from_list });
const rowToCapture  = r => ({ id:r.id,text:r.text,ts:new Date(r.created_at).getTime() });

const fmtTime=t=>{if(!t)return"";const[h,m]=t.split(":").map(Number);return`${h%12||12}:${String(m).padStart(2,"0")}${h>=12?"pm":"am"}`;};

function AgingBadge({createdAt}){
  const d=daysSince(createdAt);if(d===null)return null;
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
  return(
    <div style={{display:"flex",gap:2,background:T.bgPanel,border:`1px solid ${T.border}`,borderRadius:20,padding:3}}>
      {["dark","light"].map(id=>{
        const th=THEMES[id];const active=theme.id===id;
        return <button key={id} onClick={()=>setThemeName(id)} style={{padding:"5px 12px",borderRadius:16,border:"none",cursor:"pointer",background:active?"#F5A623":"transparent",color:active?"#000":T.textMuted,fontSize:12,transition:"all 0.2s",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14}}>{th.icon}</span><span style={{fontSize:10}}>{th.label}</span></button>;
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
      <textarea value={draft} onChange={e=>setDraft(e.target.value)} autoFocus rows={3} style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"8px 10px",color:T.text,fontSize:13,resize:"none",boxSizing:"border-box",lineHeight:1.5}}/>
      <div style={{display:"flex",gap:8,marginTop:6}}>
        <button onClick={()=>setEditing(false)} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
        <button onClick={save} style={{flex:2,padding:"7px",borderRadius:9,border:"none",background:"#F5A623",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
      </div>
    </div>
  ):(
    <div onClick={()=>setEditing(true)} style={{marginTop:6,background:T.updateBg,borderRadius:9,padding:"8px 10px",cursor:"text",border:`1px dashed ${T.updateBorder}`,minHeight:32}}>
      {value?<p style={{margin:0,fontSize:12,color:T.updateText,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{value}</p>:<p style={{margin:0,fontSize:11,color:T.updatePlaceholder}}>Tap to add update…</p>}
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
      <div style={{position:"absolute",top:24,right:24}}><ThemeToggle theme={theme} setThemeName={setThemeName}/></div>
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
function TodayPanel({tasks,onStatusChange,onDone,onDateChange}){
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
            <p style={{margin:"2px 0 4px",fontSize:11,color:T.textSub}}>→ {t.delegate}</p>
            {/* Date change row */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",flexShrink:0}}>📅 Next:</span>
              <input
                type="date"
                value={t.nextFollowUp||""}
                onChange={e=>onDateChange(t.id,e.target.value)}
                style={{flex:1,background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:8,padding:"4px 8px",color:t.nextFollowUp&&t.nextFollowUp<todayStr?"#FF7A7A":"#F5A623",fontSize:12,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}
              />
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(smap).map(([k,v])=>(
                <button key={k} onClick={()=>k==="done"?onDone(t.id,t.list):onStatusChange(t.id,k)}
                  style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:t.status===k?v.bg:T.bgChip,color:t.status===k?v.color:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{v.label}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TASK CARDS ───────────────────────────────────────────────────────────────
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
            {task.day&&!isDone&&<span style={{fontSize:10,color:T.textSub,fontFamily:"'DM Mono',monospace"}}>{task.day} {fmtTime(task.time)}</span>}
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
          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}><p style={{margin:0,fontSize:11,color:T.textSub}}>→ {task.delegate}</p>{task.phone&&<span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>· {task.phone}</span>}</div>
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
          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}><p style={{margin:0,fontSize:11,color:T.textSub}}>→ {task.delegate}</p>{task.phone&&<span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>· {task.phone}</span>}</div>
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
            {rList!=="todo"&&<input value={rDel} onChange={e=>setRDel(e.target.value)} placeholder="Delegate name" style={{width:"100%",background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:14}}/>}
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

// ─── TIMELINE VIEW ───────────────────────────────────────────────────────────
function TimelineView({selDay,setSelDay,scheduledTasks,logForDay,accuracy,doneRows,filledRows,onMarkDone,onEdit,onAddSlot,T,todayDay}){
  // Timeline: 8am–7pm, each hour = 60px height, 30min = 30px
  const START_HOUR=8;
  const END_HOUR=19;
  const PX_PER_MIN=1.1; // pixels per minute
  const TOTAL_MIN=(END_HOUR-START_HOUR)*60;
  const TOTAL_H=TOTAL_MIN*PX_PER_MIN;
  const HOUR_H=60*PX_PER_MIN;

  const hours=Array.from({length:END_HOUR-START_HOUR+1},(_,i)=>START_HOUR+i);

  // Current time indicator
  const now=new Date();
  const isToday=selDay===todayDay;
  const nowMin=(now.getHours()-START_HOUR)*60+now.getMinutes();
  const nowTop=nowMin*PX_PER_MIN;
  const showNow=isToday&&nowMin>=0&&nowMin<=TOTAL_MIN;

  // Convert time string "HH:MM" to minutes from START_HOUR
  const toMin=t=>{if(!t)return 0;const[h,m]=t.split(":").map(Number);return(h-START_HOUR)*60+m;};

  // Get tasks for selected day with pixel positions
  const dayTasks=scheduledTasks
    .filter(t=>t.day===selDay)
    .map(t=>{
      const startMin=toMin(t.time);
      const top=startMin*PX_PER_MIN;
      const h=HOUR_H; // default 1hr block
      const logRow=logForDay.find(r=>r.time===t.time);
      return{...t,top,height:h,done:logRow?.done||false,logRow};
    })
    .filter(t=>t.top>=0&&t.top<TOTAL_H);

  // Detect overlaps — assign column lanes
  const lanes=[];
  const taskWithLane=dayTasks.map(task=>{
    let lane=0;
    while(lanes[lane]&&lanes[lane]>task.top){lane++;}
    lanes[lane]=task.top+task.height+4;
    return{...task,lane};
  });
  const maxLane=Math.max(0,...taskWithLane.map(t=>t.lane))+1;
  const LANE_W=maxLane>1?`calc((100% - 48px) / ${maxLane})`:"calc(100% - 52px)";

  // Batch colour lookup
  const batchOf=t=>BATCHES[t.batch]||BATCHES.meetings;

  return(
    <div>
      {resetConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
          <div style={{background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:360,textAlign:"center"}}>
            <p style={{fontSize:28,margin:"0 0 8px"}}>🔄</p>
            <p style={{margin:"0 0 6px",fontSize:16,fontWeight:600,color:T.text}}>New week?</p>
            <p style={{margin:"0 0 24px",fontSize:13,color:T.textSub,lineHeight:1.5}}>This will reset all session counts to zero. Your activities stay — only the progress clears.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setResetConfirm(false)} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setUnwindItems(prev=>prev.map(i=>({...i,done:0})));setResetConfirm(false);}} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#50C8A8",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>↺ Reset week</button>
            </div>
          </div>
        </div>
      )}
      {/* Day picker */}
      <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",scrollbarWidth:"none"}}>
        {DAYS.map(d=>(
          <button key={d} onClick={()=>setSelDay(d)} style={{flexShrink:0,padding:"7px 12px",borderRadius:10,border:`1.5px solid ${selDay===d?"#F5A623":T.border}`,background:selDay===d?"rgba(245,166,35,0.1)":T.bgPanel,color:selDay===d?"#F5A623":d===todayDay?"#F5A623":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:d===todayDay?700:400}}>
            {d}{d===todayDay?" ★":""}
          </button>
        ))}
      </div>

      {/* Accuracy pill */}
      {accuracy!==null&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"9px 14px"}}>
          <div style={{width:40,height:40,borderRadius:"50%",border:`3px solid ${accuracy>=75?"#4CAF50":accuracy>=50?"#F5A623":"#FF7A7A"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:700,color:accuracy>=75?"#4CAF50":accuracy>=50?"#F5A623":"#FF7A7A",fontFamily:"'DM Mono',monospace"}}>{accuracy}%</span>
          </div>
          <div>
            <p style={{margin:0,fontSize:13,fontWeight:600,color:T.text}}>Schedule accuracy</p>
            <p style={{margin:0,fontSize:11,color:T.textSub}}>{doneRows.length}/{filledRows.length} done · {dayTasks.length} task{dayTasks.length!==1?"s":""} scheduled</p>
          </div>
          <button onClick={()=>onAddSlot("09:00")} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:11,cursor:"pointer",flexShrink:0}}>+ Add</button>
        </div>
      )}

      {/* Timeline canvas */}
      <div style={{position:"relative",background:T.bgCard,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:16}}>
        <div style={{position:"relative",height:TOTAL_H+24,marginLeft:48}}>

          {/* Hour grid lines + labels */}
          {hours.map(h=>{
            const top=(h-START_HOUR)*HOUR_H;
            return(
              <div key={h} style={{position:"absolute",top,left:-48,right:0,pointerEvents:"none"}}>
                <div style={{position:"absolute",left:0,top:0,width:42,textAlign:"right",paddingRight:8}}>
                  <span style={{fontSize:9,color:T.textMuted,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{h%12||12}{h>=12?"pm":"am"}</span>
                </div>
                <div style={{position:"absolute",left:42,right:0,top:0,height:"1px",background:T.borderSub}}/>
                {/* 30-min dotted line */}
                <div style={{position:"absolute",left:42,right:0,top:HOUR_H/2,height:"1px",background:T.borderSub,opacity:0.4,borderTop:`1px dashed ${T.borderSub}`}}/>
              </div>
            );
          })}

          {/* Current time line */}
          {showNow&&(
            <div style={{position:"absolute",top:nowTop,left:-48,right:0,zIndex:10,pointerEvents:"none"}}>
              <div style={{position:"absolute",left:0,top:-1,width:42,textAlign:"right",paddingRight:6}}>
                <span style={{fontSize:8,color:"#FF4D4D",fontFamily:"'DM Mono',monospace",fontWeight:700}}>{`${now.getHours()%12||12}:${String(now.getMinutes()).padStart(2,"0")}${now.getHours()>=12?"p":"a"}`}</span>
              </div>
              <div style={{position:"absolute",left:42,right:0,top:0,height:"2px",background:"#FF4D4D",boxShadow:"0 0 6px #FF4D4D80"}}/>
              <div style={{position:"absolute",left:40,top:-4,width:8,height:8,borderRadius:"50%",background:"#FF4D4D",boxShadow:"0 0 6px #FF4D4D"}}/>
            </div>
          )}

          {/* Task blocks */}
          {taskWithLane.map(task=>{
            const b=batchOf(task);
            const own=task.list==="todo"?"👤":task.list==="ea"?"🎯":"🔁";
            const isDone=task.done;
            const laneOffset=task.lane*(100/maxLane);
            return(
              <div key={task.id}
                style={{
                  position:"absolute",
                  top:task.top+2,
                  left:task.lane*(parseInt(LANE_W)+4),
                  width:`calc(${LANE_W} - 4px)`,
                  height:task.height-4,
                  background:isDone?`${b.color}15`:`${b.color}22`,
                  border:`1.5px solid ${isDone?b.color+"40":b.color+"70"}`,
                  borderLeft:`3px solid ${isDone?b.color+"60":b.color}`,
                  borderRadius:8,
                  padding:"5px 8px",
                  cursor:"pointer",
                  overflow:"hidden",
                  transition:"all 0.2s",
                  zIndex:5,
                  display:"flex",
                  flexDirection:"column",
                  justifyContent:"space-between",
                  opacity:isDone?0.65:1,
                }}
              >
                <div style={{display:"flex",alignItems:"flex-start",gap:4}}>
                  <span style={{fontSize:9,flexShrink:0}}>{b.icon}</span>
                  <p style={{margin:0,fontSize:11,color:isDone?T.textSub:T.text,lineHeight:1.3,fontWeight:500,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",textDecoration:isDone?"line-through":"none",flex:1}}>
                    {task.text}{task.recurring&&<span style={{fontSize:9,color:"#9B8AFF",marginLeft:3}}>🔁</span>}
                  </p>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
                  <span style={{fontSize:8,color:isDone?"#50C8A8":T.textSub,fontFamily:"'DM Mono',monospace"}}>{fmtTime(task.time)} {own}</span>
                  {!isDone?(
                    <button onClick={e=>{e.stopPropagation();onMarkDone(task.time);}}
                      style={{fontSize:8,padding:"2px 6px",borderRadius:8,border:`1px solid rgba(80,200,168,0.5)`,background:"rgba(80,200,168,0.15)",color:"#50C8A8",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontWeight:700,whiteSpace:"nowrap"}}>
                      Done ✓
                    </button>
                  ):(
                    <span style={{fontSize:12}}>✅</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty slot tap areas — show + on hover */}
          {hours.slice(0,-1).map(h=>{
            const top=(h-START_HOUR)*HOUR_H;
            const time=`${String(h).padStart(2,"0")}:00`;
            const hasTask=taskWithLane.some(t=>t.time===time);
            return !hasTask?(
              <div key={`empty-${h}`}
                onClick={()=>onAddSlot(time)}
                style={{position:"absolute",top:top+2,left:0,right:0,height:HOUR_H-4,cursor:"pointer",zIndex:2,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,opacity:0,transition:"opacity 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                onMouseLeave={e=>e.currentTarget.style.opacity="0"}
              >
                <span style={{fontSize:9,color:T.textMuted,fontFamily:"'DM Mono',monospace",background:T.bgPanel,padding:"2px 8px",borderRadius:10,border:`1px solid ${T.border}`}}>+ add</span>
              </div>
            ):null;
          })}
        </div>
      </div>

      <p style={{margin:"4px 0 0",fontSize:11,color:T.textMuted,textAlign:"center",fontStyle:"italic"}}>The only failure in scheduling is the failure to schedule</p>
    </div>
  );
}

// ─── SCHEDULE TAB — BCI Weekly + Daily ────────────────────────────────────────
function ScheduleTab({tasks,setTasks,dailyLog,setDailyLog}){
  const T=useT();
  const [view,setView]=useState("weekly");
  const [selDay,setSelDay]=useState(todayDay);
  const [batchFilter,setBatchFilter]=useState("all");

  // Weekly edit modal state
  const [editModal,setEditModal]=useState(null);
  // editModal = { task } | { isNew: true, day, time } | null

  // Daily slot "done" confirmation state
  const [doneModal,setDoneModal]=useState(null); // {time}
  const [doneVal,setDoneVal]=useState("");
  const [plannedEdit,setPlannedEdit]=useState(null); // {time}
  const [plannedVal,setPlannedVal]=useState("");

  // Recurring task modal
  const [recurModal,setRecurModal]=useState(false);
  const [recurForm,setRecurForm]=useState({text:"",batch:"meetings",time:"09:00",days:[],repeat:"weekly"});

  // Google Calendar sync state
  const [gcalConnected,setGcalConnected]=useState(false);
  const [syncLog,setSyncLog]=useState([]);

  const scheduledTasks=tasks.filter(t=>t.day&&t.bci==="schedule"&&t.status!=="done");
  const unscheduled=tasks.filter(t=>!t.day&&t.bci==="schedule"&&t.list==="todo"&&t.status!=="done");
  const allSchedulable=tasks.filter(t=>t.bci==="schedule"&&t.status!=="done"&&!t.day);

  const byDay=DAYS.reduce((a,d)=>{
    a[d]=scheduledTasks
      .filter(t=>t.day===d&&(batchFilter==="all"||t.batch===batchFilter))
      .sort((a,b)=>(a.time||"99:99").localeCompare(b.time||"99:99"));
    return a;
  },{});

  const logForDay=dailyLog[selDay]||TIMES.map(t=>({time:t,planned:"",actual:"",done:false}));

  const filledRows=logForDay.filter(r=>r.planned);
  const doneRows=filledRows.filter(r=>r.done);
  const accuracy=filledRows.length>0?Math.round((doneRows.length/filledRows.length)*100):null;

  // Save planned slot
  const savePlanned=(time,val)=>{
    setDailyLog(prev=>{
      const rows=[...(prev[selDay]||TIMES.map(t=>({time:t,planned:"",actual:"",done:false})))];
      const idx=rows.findIndex(r=>r.time===time);
      if(idx>=0)rows[idx]={...rows[idx],planned:val};
      return{...prev,[selDay]:rows};
    });
    setPlannedEdit(null);
  };

  // Mark slot as done with actual text
  const markSlotDone=(time,actualText)=>{
    setDailyLog(prev=>{
      const rows=[...(prev[selDay]||TIMES.map(t=>({time:t,planned:"",actual:"",done:false})))];
      const idx=rows.findIndex(r=>r.time===time);
      if(idx>=0)rows[idx]={...rows[idx],actual:actualText,done:true};
      return{...prev,[selDay]:rows};
    });
    setDoneModal(null);setDoneVal("");
  };

  // Save weekly task edit
  const saveTaskEdit=(form)=>{
    if(form.isNew){
      const t={id:uid(),list:"todo",text:form.text,update:"",delegate:form.delegate||"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:form.day,time:form.time,followUpCount:0,createdAt:new Date().toISOString(),batch:form.batch,recurring:form.recurring||false,recurDays:form.recurDays||[]};
      setTasks(prev=>[t,...prev]);
    } else {
      setTasks(prev=>prev.map(t=>t.id===form.id?{...t,...form}:t));
    }
    setEditModal(null);
    // Mirror to Google Calendar if connected
    if(gcalConnected){
      setSyncLog(prev=>[{text:`Synced "${form.text}" to Google Calendar`,ts:Date.now()},...prev.slice(0,4)]);
    }
  };

  const removeFromWeek=(taskId)=>{
    setTasks(prev=>prev.map(t=>t.id===taskId?{...t,day:"",time:""}:t));
  };

  // Google Calendar mock sync — mirror EA + Delegation scheduled tasks
  const handleGcalSync=()=>{
    setGcalConnected(true);
    const eaDelScheduled=tasks.filter(t=>(t.list==="ea"||t.list==="del")&&t.day&&t.bci==="schedule");
    setSyncLog(eaDelScheduled.map(t=>({text:`→ Synced to GCal: "${t.text}" on ${t.day} ${t.time}`,ts:Date.now()})));
  };

  // Add recurring task instances
  const saveRecurring=()=>{
    const newTasks=recurForm.days.map(day=>({
      id:uid(),list:"todo",text:recurForm.text,update:"",delegate:"",status:"todo",bci:"schedule",
      starred:false,followUp:false,nextFollowUp:"",day,time:recurForm.time,followUpCount:0,
      createdAt:new Date().toISOString(),batch:recurForm.batch,recurring:true,recurDays:recurForm.days,
    }));
    setTasks(prev=>[...prev,...newTasks]);
    setRecurModal(false);
    setRecurForm({text:"",batch:"meetings",time:"09:00",days:[],repeat:"weekly"});
  };

  return(
    <div style={{padding:"0 16px"}}>

      {/* Edit / New Task Modal */}
      {editModal&&(
        <TaskEditModal
          task={editModal.isNew?{text:"",batch:"meetings",time:"09:00",day:editModal.day||"MON",delegate:"",list:"todo",recurring:false,recurDays:[]}:editModal.task}
          isNew={!!editModal.isNew}
          allTasks={tasks.filter(t=>t.bci==="schedule"&&t.status!=="done"&&!t.day)}
          onSave={saveTaskEdit}
          onClose={()=>setEditModal(null)}
          T={T}/>
      )}

      {/* Done confirmation modal */}
      {doneModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
            <p style={{margin:"0 0 4px",fontSize:10,color:"#50C8A8",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>Mark done — {fmtTime(doneModal.time)}</p>
            <p style={{margin:"0 0 4px",fontSize:14,color:T.text,fontWeight:600}}>{logForDay.find(r=>r.time===doneModal.time)?.planned}</p>
            <p style={{margin:"0 0 14px",fontSize:12,color:T.textSub}}>What actually happened? (optional)</p>
            <input value={doneVal} onChange={e=>setDoneVal(e.target.value)} placeholder="e.g. Done ✓ · or note what changed…"
              autoFocus onKeyDown={e=>e.key==="Enter"&&markSlotDone(doneModal.time,doneVal||logForDay.find(r=>r.time===doneModal.time)?.planned+" ✓")}
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"12px 14px",color:T.text,fontSize:14,boxSizing:"border-box",marginBottom:14}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setDoneModal(null);setDoneVal("");}} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>markSlotDone(doneModal.time,doneVal||logForDay.find(r=>r.time===doneModal.time)?.planned+" ✓")}
                style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#50C8A8",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Mark Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring task modal */}
      {recurModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`,maxHeight:"80vh",overflowY:"auto"}}>
            <p style={{margin:"0 0 16px",fontSize:13,color:"#9B8AFF",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>🔁 Add Recurring Task</p>
            <input value={recurForm.text} onChange={e=>setRecurForm(p=>({...p,text:e.target.value}))} placeholder="Task name"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:14,boxSizing:"border-box",marginBottom:10}}/>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <select value={recurForm.batch} onChange={e=>setRecurForm(p=>({...p,batch:e.target.value}))}
                style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}>
                {Object.entries(BATCHES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <select value={recurForm.time} onChange={e=>setRecurForm(p=>({...p,time:e.target.value}))}
                style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}>
                {TIMES.map(t=><option key={t} value={t}>{fmtTime(t)}</option>)}
              </select>
            </div>
            <p style={{margin:"0 0 8px",fontSize:11,color:T.textSub}}>Repeat on which days?</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {DAYS.map(d=>{
                const sel=recurForm.days.includes(d);
                return <button key={d} onClick={()=>setRecurForm(p=>({...p,days:sel?p.days.filter(x=>x!==d):[...p.days,d]}))}
                  style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${sel?"#9B8AFF":T.border}`,background:sel?"rgba(155,138,255,0.15)":"transparent",color:sel?"#9B8AFF":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{d}</button>;
              })}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setRecurModal(false)} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={saveRecurring} disabled={!recurForm.text||!recurForm.days.length}
                style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:recurForm.text&&recurForm.days.length?"#9B8AFF":"#333",color:recurForm.text&&recurForm.days.length?"#fff":T.textMuted,fontSize:13,fontWeight:700,cursor:"pointer"}}>Add to {recurForm.days.length} day{recurForm.days.length!==1?"s":""}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.2)",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <p style={{margin:0,fontSize:11,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>📅 BCI Scheduling</p>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setRecurModal(true)} style={{padding:"5px 10px",borderRadius:20,border:"1px solid rgba(155,138,255,0.3)",background:"rgba(155,138,255,0.1)",color:"#9B8AFF",fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>🔁 Recurring</button>
            <button onClick={()=>gcalConnected?setSyncLog([]):handleGcalSync()}
              style={{padding:"5px 10px",borderRadius:20,border:`1px solid ${gcalConnected?"rgba(74,158,255,0.3)":"rgba(255,255,255,0.1)"}`,background:gcalConnected?"rgba(74,158,255,0.12)":"rgba(255,255,255,0.05)",color:gcalConnected?"#4A9EFF":T.textSub,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
              {gcalConnected?"✓ GCal synced":"G Sync GCal"}
            </button>
          </div>
        </div>
        {unscheduled.length>0&&<p style={{margin:"6px 0 0",fontSize:11,color:"#FF7A7A"}}>⚠ {unscheduled.length} unscheduled — what you don't schedule won't get done</p>}
        {syncLog.length>0&&(
          <div style={{marginTop:8,background:"rgba(74,158,255,0.06)",borderRadius:8,padding:"8px 10px"}}>
            {syncLog.slice(0,3).map((l,i)=><p key={i} style={{margin:"2px 0",fontSize:10,color:"#4A9EFF"}}>{l.text}</p>)}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"weekly",label:"📅 Weekly",desc:"Edit & batch"},{id:"daily",label:"🗓 Daily",desc:"Plan vs Done"},{id:"timeline",label:"⏱ Timeline",desc:"Visual day"}].map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`1.5px solid ${view===v.id?"#F5A623":T.border}`,background:view===v.id?"rgba(245,166,35,0.1)":T.bgPanel,cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
            <p style={{margin:0,fontSize:11,color:view===v.id?"#F5A623":T.text,fontWeight:600}}>{v.label}</p>
            <p style={{margin:"2px 0 0",fontSize:9,color:T.textMuted}}>{v.desc}</p>
          </button>
        ))}
      </div>

      {/* ══ WEEKLY VIEW ══ */}
      {view==="weekly"&&(
        <>
          <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",scrollbarWidth:"none",alignItems:"center"}}>
            {[{id:"all",label:"All"},...Object.entries(BATCHES).map(([k,v])=>({id:k,label:`${v.icon} ${v.label}`}))].map(b=>(
              <button key={b.id} onClick={()=>setBatchFilter(b.id)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"none",background:batchFilter===b.id?T.pillActive:T.pillInactive,color:batchFilter===b.id?T.text:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{b.label}</button>
            ))}
          </div>

          {DAYS.map(day=>{
            const dayTasks=byDay[day];
            const isTodayDay=day===todayDay;
            return(
              <div key={day} style={{marginBottom:14}}>
                {/* Day header */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:10,color:isTodayDay?"#F5A623":T.textSub,fontFamily:"'DM Mono',monospace",letterSpacing:1.5,fontWeight:isTodayDay?700:400}}>{day}{isTodayDay?" · TODAY":""}</span>
                  <span style={{fontSize:10,color:T.textDim,fontFamily:"'DM Mono',monospace"}}>{dayTasks.length} task{dayTasks.length!==1?"s":""}</span>
                  <button onClick={()=>setEditModal({isNew:true,day,time:"09:00"})}
                    style={{marginLeft:"auto",padding:"3px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>+ Add</button>
                </div>

                {dayTasks.length===0?(
                  <div onClick={()=>setEditModal({isNew:true,day,time:"09:00"})}
                    style={{border:T.schedFreeBorder,borderRadius:10,padding:"10px 13px",fontSize:11,color:T.textDim,background:T.schedFree,cursor:"pointer"}}>
                    Free — tap to add task
                  </div>
                ):(
                  dayTasks.map(task=>{
                    const b=BATCHES[task.batch]||BATCHES.meetings;
                    const own=task.list==="todo"?"👤":task.list==="ea"?"🎯":"🔁";
                    return(
                      <div key={task.id} style={{background:T.bgCard,border:`1px solid ${b.color}20`,borderLeft:`3px solid ${b.color}`,borderRadius:11,padding:"9px 12px",marginBottom:5,display:"flex",gap:10,alignItems:"center",transition:"background 0.3s"}}>
                        <span style={{fontSize:10,color:T.textSub,fontFamily:"'DM Mono',monospace",minWidth:36,flexShrink:0}}>{fmtTime(task.time)}</span>
                        <span style={{fontSize:11,flexShrink:0}}>{b.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{margin:0,fontSize:13,color:T.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.text}{task.recurring&&<span style={{fontSize:10,color:"#9B8AFF",marginLeft:5}}>🔁</span>}</p>
                          {task.delegate&&<p style={{margin:"2px 0 0",fontSize:10,color:T.textSub}}>→ {task.delegate}</p>}
                        </div>
                        <span style={{fontSize:11,flexShrink:0}}>{own}</span>
                        {/* Edit & remove buttons */}
                        <button onClick={()=>setEditModal({task})}
                          style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>✏️</button>
                        <button onClick={()=>removeFromWeek(task.id)}
                          style={{background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>✕</button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}

          {/* Unscheduled pool */}
          {unscheduled.length>0&&(
            <div style={{marginTop:4,background:"rgba(255,77,77,0.05)",border:"1px solid rgba(255,77,77,0.15)",borderRadius:14,padding:"12px 14px"}}>
              <p style={{margin:"0 0 6px",fontSize:11,color:"#FF7A7A",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>⚠ Not scheduled ({unscheduled.length})</p>
              {unscheduled.map(task=>(
                <div key={task.id} style={{background:T.bgPanel,borderRadius:10,padding:"8px 12px",marginBottom:5,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
                  <p style={{margin:0,fontSize:13,color:T.text,flex:1}}>{task.text}</p>
                  <AgingBadge createdAt={task.createdAt}/>
                  <button onClick={()=>setEditModal({task:{...task,day:"MON",time:"09:00"}})}
                    style={{padding:"4px 10px",borderRadius:20,border:"none",background:"rgba(245,166,35,0.15)",color:"#F5A623",fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>Schedule →</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ DAILY VIEW ══ */}
      {view==="daily"&&(
        <>
          {/* Day picker */}
          <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",scrollbarWidth:"none"}}>
            {DAYS.map(d=>(
              <button key={d} onClick={()=>setSelDay(d)} style={{flexShrink:0,padding:"7px 12px",borderRadius:10,border:`1.5px solid ${selDay===d?"#F5A623":T.border}`,background:selDay===d?"rgba(245,166,35,0.1)":T.bgPanel,color:selDay===d?"#F5A623":d===todayDay?"#F5A623":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:d===todayDay?700:400}}>
                {d}{d===todayDay?" ★":""}
              </button>
            ))}
          </div>

          {/* Accuracy ring */}
          {accuracy!==null&&(
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px"}}>
              <div style={{width:46,height:46,borderRadius:"50%",border:`3px solid ${accuracy>=75?"#4CAF50":accuracy>=50?"#F5A623":"#FF7A7A"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:700,color:accuracy>=75?"#4CAF50":accuracy>=50?"#F5A623":"#FF7A7A",fontFamily:"'DM Mono',monospace"}}>{accuracy}%</span>
              </div>
              <div>
                <p style={{margin:0,fontSize:13,fontWeight:600,color:T.text}}>Schedule accuracy</p>
                <p style={{margin:0,fontSize:11,color:T.textSub}}>{doneRows.length} of {filledRows.length} planned slots done</p>
              </div>
            </div>
          )}

          {/* Daily grid */}
          <div style={{background:T.bgCard,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:10}}>
            {/* Column headers */}
            <div style={{display:"grid",gridTemplateColumns:"52px 1fr 80px",background:T.bgPanel,borderBottom:`1px solid ${T.border}`,padding:"8px 12px 8px 0",gap:0}}>
              <span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",paddingLeft:12}}>TIME</span>
              <span style={{fontSize:10,color:"#4A9EFF",fontFamily:"'DM Mono',monospace",paddingLeft:8}}>PLANNED</span>
              <span style={{fontSize:10,color:"#50C8A8",fontFamily:"'DM Mono',monospace",paddingLeft:8}}>DONE</span>
            </div>

            {logForDay.map((row,idx)=>{
              const isHalf=row.time.endsWith("30");
              const isEditP=plannedEdit===row.time;
              // Find task scheduled for this slot today
              const linkedTask=scheduledTasks.find(t=>t.day===selDay&&t.time===row.time);
              const displayText=row.planned||(linkedTask?linkedTask.text:"");

              return(
                <div key={row.time} style={{display:"grid",gridTemplateColumns:"52px 1fr 80px",gap:0,borderBottom:idx<logForDay.length-1?`1px solid ${T.borderSub}`:"none",minHeight:42,background:row.done?"rgba(80,200,168,0.06)":"transparent",transition:"background 0.2s"}}>
                  {/* Time */}
                  <div style={{padding:"10px 4px 10px 12px",display:"flex",alignItems:"center"}}>
                    <span style={{fontSize:10,color:isHalf?T.textDim:T.textSub,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtTime(row.time)}</span>
                  </div>

                  {/* Planned — tap to edit */}
                  <div style={{padding:"6px 8px",borderLeft:`1px solid ${T.borderSub}`,cursor:"text",display:"flex",alignItems:"center"}}
                    onClick={()=>{if(!isEditP){setPlannedEdit(row.time);setPlannedVal(displayText);}}}>
                    {isEditP?(
                      <input autoFocus value={plannedVal} onChange={e=>setPlannedVal(e.target.value)}
                        onBlur={()=>savePlanned(row.time,plannedVal)}
                        onKeyDown={e=>{if(e.key==="Enter")savePlanned(row.time,plannedVal);if(e.key==="Escape")setPlannedEdit(null);}}
                        style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid #4A9EFF`,color:T.text,fontSize:12,padding:"2px 0",outline:"none"}}/>
                    ):(
                      <p style={{margin:0,fontSize:12,color:row.done?"#50C8A8":displayText?T.text:T.textDim,lineHeight:1.4,textDecoration:row.done?"line-through":"none",opacity:row.done?0.7:1}}>
                        {displayText||"—"}{linkedTask&&!row.planned&&<span style={{fontSize:9,color:T.textDim,marginLeft:4}}>↑ from tasks</span>}
                      </p>
                    )}
                  </div>

                  {/* Done button — only shows if there's a planned item */}
                  <div style={{borderLeft:`1px solid ${T.borderSub}`,display:"flex",alignItems:"center",justifyContent:"center",padding:"4px 6px"}}>
                    {displayText&&!row.done?(
                      <button onClick={()=>{setDoneModal({time:row.time});setDoneVal("");}}
                        style={{padding:"5px 8px",borderRadius:9,border:"1.5px solid rgba(80,200,168,0.4)",background:"rgba(80,200,168,0.1)",color:"#50C8A8",fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",fontWeight:600}}>
                        Done ✓
                      </button>
                    ):row.done?(
                      <span style={{fontSize:16,filter:"drop-shadow(0 0 4px #50C8A890)"}}>✅</span>
                    ):null}
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{margin:"6px 0 0",fontSize:11,color:T.textMuted,textAlign:"center",fontStyle:"italic"}}>The only failure in scheduling is the failure to schedule</p>
        </>
      )}

      {/* ══ TIMELINE VIEW ══ */}
      {view==="timeline"&&(
        <TimelineView
          selDay={selDay}
          setSelDay={setSelDay}
          scheduledTasks={scheduledTasks}
          logForDay={logForDay}
          accuracy={accuracy}
          doneRows={doneRows}
          filledRows={filledRows}
          onMarkDone={(time)=>{setDoneModal({time});setDoneVal("");}}
          onEdit={(task)=>setEditModal({task})}
          onAddSlot={(time)=>setEditModal({isNew:true,day:selDay,time})}
          T={T}
          todayDay={todayDay}
        />
      )}
    </div>
  );
}

// ─── TASK EDIT MODAL ─────────────────────────────────────────────────────────
function TaskEditModal({task,isNew,allTasks,onSave,onClose,T}){
  const [form,setForm]=useState({...task});
  const [pickFromTodo,setPickFromTodo]=useState(false);

  const set=k=>v=>setForm(p=>({...p,[k]:v}));

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
      <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"20px 20px 44px",border:`1px solid ${T.modalBorder}`,maxHeight:"85vh",overflowY:"auto"}}>
        <p style={{margin:"0 0 16px",fontSize:12,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>
          {isNew?"➕ Add to Week":"✏️ Edit Scheduled Task"}
        </p>

        {/* Pick from unscheduled to-do tasks */}
        {isNew&&allTasks.length>0&&(
          <div style={{marginBottom:12}}>
            <button onClick={()=>setPickFromTodo(!pickFromTodo)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${T.border}`,background:pickFromTodo?"rgba(245,166,35,0.1)":"transparent",color:pickFromTodo?"#F5A623":T.textMuted,fontSize:11,cursor:"pointer",fontFamily:"'DM Mono',monospace",marginBottom:pickFromTodo?10:0}}>
              {pickFromTodo?"▲ Hide":"👤 Pick from My Tasks"}
            </button>
            {pickFromTodo&&(
              <div style={{background:T.bgPanel,borderRadius:10,border:`1px solid ${T.border}`,maxHeight:160,overflowY:"auto"}}>
                {allTasks.map(t=>(
                  <button key={t.id} onClick={()=>{setForm(p=>({...p,text:t.text,batch:t.batch||"meetings",id:t.id}));setPickFromTodo(false);}}
                    style={{display:"block",width:"100%",padding:"9px 14px",textAlign:"left",background:"none",border:"none",borderBottom:`1px solid ${T.borderSub}`,color:T.text,fontSize:13,cursor:"pointer"}}>
                    {t.text}<span style={{fontSize:10,color:T.textMuted,marginLeft:6}}>{BATCHES[t.batch]?.icon}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <input value={form.text} onChange={e=>set("text")(e.target.value)} placeholder="Task name…"
          style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:14,boxSizing:"border-box",marginBottom:10}}/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div>
            <p style={{margin:"0 0 5px",fontSize:10,color:T.textMuted}}>Day</p>
            <select value={form.day} onChange={e=>set("day")(e.target.value)}
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}>
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <p style={{margin:"0 0 5px",fontSize:10,color:T.textMuted}}>Time</p>
            <select value={form.time} onChange={e=>set("time")(e.target.value)}
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}>
              {TIMES.map(t=><option key={t} value={t}>{fmtTime(t)}</option>)}
            </select>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div>
            <p style={{margin:"0 0 5px",fontSize:10,color:T.textMuted}}>Batch type</p>
            <select value={form.batch||"meetings"} onChange={e=>set("batch")(e.target.value)}
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}>
              {Object.entries(BATCHES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <div>
            <p style={{margin:"0 0 5px",fontSize:10,color:T.textMuted}}>List</p>
            <select value={form.list||"todo"} onChange={e=>set("list")(e.target.value)}
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}>
              <option value="todo">👤 My Tasks</option>
              <option value="ea">🎯 EA List</option>
              <option value="del">🔁 Delegated</option>
            </select>
          </div>
        </div>

        <input value={form.delegate||""} onChange={e=>set("delegate")(e.target.value)} placeholder="Delegate (optional)"
          style={{width:"100%",background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:14}}/>

        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave({...form,isNew})} disabled={!form.text}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:form.text?"#F5A623":"#333",color:form.text?"#000":T.textMuted,fontSize:13,fontWeight:700,cursor:form.text?"pointer":"default"}}>
            {isNew?"Add to Schedule":"Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

// ─── LIFE PLANNER ─────────────────────────────────────────────────────────────
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SPORT_COLORS={"Golf":"#50C8A8","Horse Riding":"#F5A623","Badminton":"#4A9EFF","Swimming":"#9B8AFF","Running":"#FF7A7A","Cycling":"#FFD166","Tennis":"#06D6A0","Yoga":"#EF476F","Other":"#888"};
const HOLIDAY_TYPES={adventure:{label:"Adventure",icon:"🏔",color:"#F5A623"},spiritual:{label:"Spiritual",icon:"🕌",color:"#9B8AFF"},city:{label:"City",icon:"🏙",color:"#4A9EFF"},festival:{label:"Festival",icon:"🎉",color:"#50C8A8"},beach:{label:"Beach",icon:"🏖",color:"#FF7A7A"},ski:{label:"Ski",icon:"⛷",color:"#50C8A8"}};
const PEOPLE_TAGS={Solo:"#F5A623",Family:"#4A9EFF",Friends:"#50C8A8",Network:"#9B8AFF"};
const HOBBY_TAGS={Sport:"#F5A623",Write:"#4A9EFF",Game:"#9B8AFF",Chill:"#50C8A8",Outing:"#FF7A7A"};

const SEED_UNWIND=[
  {id:"u1",text:"Golf",target:3,unit:"sessions/week",category:"Sport",people:"Solo",done:1,color:"#50C8A8"},
  {id:"u2",text:"Horse riding",target:1,unit:"session",category:"Sport",people:"Solo",done:0,color:"#F5A623"},
  {id:"u3",text:"Badminton + swimming with family",target:1,unit:"session/week",category:"Sport",people:"Family",done:0,color:"#4A9EFF"},
  {id:"u4",text:"Sunday evening golf course with friends",target:1,unit:"session/week",category:"Outing",people:"Friends",done:0,color:"#9B8AFF"},
  {id:"u5",text:"Saturday chill with friends",target:1,unit:"session/week",category:"Chill",people:"Friends",done:0,color:"#FF7A7A"},
  {id:"u6",text:"Scuba diving refresher",target:1,unit:"this month",category:"Sport",people:"Solo",done:0,color:"#50C8A8"},
];

const SEED_HOLIDAYS=[
  {id:"h1",month:"Jan",plan:"Japan ski",type:"ski",people:"Friends",status:"done",notes:"Niseko — booked"},
  {id:"h2",month:"Mar",plan:"Vrindavan",type:"spiritual",people:"Family",status:"done",notes:""},
  {id:"h3",month:"May",plan:"Scuba course",type:"adventure",people:"Solo",status:"done",notes:"PADI refresher"},
  {id:"h4",month:"Jul",plan:"Europe trip",type:"city",people:"Family",status:"planned",notes:"Visa in progress — Reena handling"},
  {id:"h5",month:"Sep",plan:"",type:"adventure",people:"Solo",status:"empty",notes:""},
  {id:"h6",month:"Nov",plan:"",type:"festival",people:"Friends",status:"empty",notes:""},
];

const SEED_BUCKET=[
  {id:"b1",text:"Skydiving",category:"adventure",priority:"someday",done:false},
  {id:"b2",text:"Learn to play guitar",category:"hobby",priority:"someday",done:false},
  {id:"b3",text:"Trek to Everest base camp",category:"adventure",priority:"2025",done:false},
  {id:"b4",text:"Write a book",category:"hobby",priority:"someday",done:false},
  {id:"b5",text:"Watch Aurora Borealis",category:"travel",priority:"2025",done:false},
  {id:"b6",text:"Deep sea fishing",category:"adventure",priority:"someday",done:false},
];

function LifePlanner({unwindItemsProp,setUnwindItemsProp,holidaysProp,setHolidaysProp,bucketProp,setBucketProp}){
  const T=useT();
  const [subTab,setSubTab]=useState("unwind");
  const [_unwI,_setUnwI]=useState(SEED_UNWIND);
  const [_hols,_setHols]=useState(SEED_HOLIDAYS);
  const [_buck,_setBuck]=useState(SEED_BUCKET);
  const unwindItems=unwindItemsProp||_unwI;
  const setUnwindItems=setUnwindItemsProp||_setUnwI;
  const holidays=holidaysProp||_hols;
  const setHolidays=setHolidaysProp||_setHols;
  const bucket=bucketProp||_buck;
  const setBucket=setBucketProp||_setBuck;
  const [editUnwind,setEditUnwind]=useState(null);
  const [editHol,setEditHol]=useState(null);
  const [newBucket,setNewBucket]=useState("");
  const [addingUnwind,setAddingUnwind]=useState(false);
  const [resetConfirm,setResetConfirm]=useState(false);
  const [newUnwind,setNewUnwind]=useState({text:"",target:1,unit:"sessions/week",category:"Sport",people:"Solo"});

  // ── Unwind sub-section ──
  const totalProgress=unwindItems.reduce((a,i)=>a+(i.done||0),0);
  const totalTarget=unwindItems.reduce((a,i)=>a+i.target,0);
  const overallPct=totalTarget>0?Math.min(100,Math.round((totalProgress/totalTarget)*100)):0;

  const tagColor=(map,key)=>map[key]||"#888";

  const UnwindCard=({item,onUpdate,onDelete})=>{
    const [open,setOpen]=useState(false);
    const pct=item.target>0?Math.min(100,Math.round(((item.done||0)/item.target)*100)):0;
    const pplColor=tagColor(PEOPLE_TAGS,item.people);
    const hobColor=tagColor(HOBBY_TAGS,item.category);
    return(
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderLeft:`3px solid ${item.color||"#F5A623"}`,borderRadius:13,marginBottom:9,overflow:"hidden",transition:"background 0.3s"}}>
        <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
          {/* Done toggle */}
          <button onClick={()=>onUpdate(item.id,{done:item.done>0?0:item.target})}
            style={{flexShrink:0,width:22,height:22,borderRadius:"50%",marginTop:2,border:pct>=100?"none":`1.5px solid ${T.textMuted}`,background:pct>=100?"#4CAF50":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",transition:"all 0.15s",boxShadow:pct>=100?"0 0 8px rgba(76,175,80,0.4)":"none"}}>{pct>=100?"✓":""}</button>
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>setOpen(!open)}>
            <p style={{margin:0,fontSize:14,color:pct>=100?T.textMuted:T.text,lineHeight:1.4,textDecoration:pct>=100?"line-through":"none"}}>{item.text}</p>
            <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${pplColor}18`,color:pplColor,fontFamily:"'DM Mono',monospace",border:`1px solid ${pplColor}30`}}>{item.people}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${hobColor}18`,color:hobColor,fontFamily:"'DM Mono',monospace",border:`1px solid ${hobColor}30`}}>{item.category}</span>
              <span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{item.done||0}/{item.target} {item.unit}</span>
            </div>
            {/* Progress bar */}
            <div style={{marginTop:8,height:4,borderRadius:2,background:T.bgPanel,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:item.color||"#F5A623",borderRadius:2,transition:"width 0.4s"}}/>
            </div>
          </div>
          <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>{open?"▲":"▼"}</button>
        </div>
        {open&&(
          <div style={{padding:"0 13px 13px",borderTop:`1px solid ${T.borderSub}`}}>
            <p style={{margin:"10px 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Sessions done this week</p>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>onUpdate(item.id,{done:Math.max(0,(item.done||0)-1)})} style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <div style={{flex:1,textAlign:"center"}}>
                <span style={{fontSize:24,fontWeight:700,color:item.color||"#F5A623",fontFamily:"'DM Mono',monospace"}}>{item.done||0}</span>
                <span style={{fontSize:13,color:T.textMuted}}> / {item.target}</span>
              </div>
              <button onClick={()=>onUpdate(item.id,{done:Math.min(item.target+2,(item.done||0)+1)})} style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button onClick={()=>setEditUnwind(item)} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer"}}>✏ Edit</button>
              <button onClick={()=>onDelete(item.id)} style={{padding:"7px 14px",borderRadius:9,border:"1px solid rgba(255,77,77,0.2)",background:"rgba(255,77,77,0.06)",color:"#FF7A7A",fontSize:11,cursor:"pointer"}}>✕</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Holiday card ──
  const HolidayCard=({item,onUpdate})=>{
    const ht=HOLIDAY_TYPES[item.type]||HOLIDAY_TYPES.adventure;
    const pplColor=tagColor(PEOPLE_TAGS,item.people);
    const isEmpty=!item.plan;
    return(
      <div style={{background:isEmpty?T.bgPanel:T.bgCard,border:`1px solid ${isEmpty?T.borderSub:T.border}`,borderLeft:`3px solid ${isEmpty?T.textDim:ht.color}`,borderRadius:12,marginBottom:8,padding:"11px 13px",display:"flex",gap:10,alignItems:"center",cursor:"pointer",transition:"background 0.3s"}}
        onClick={()=>setEditHol(item)}>
        <div style={{minWidth:32,textAlign:"center"}}>
          <p style={{margin:0,fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{item.month}</p>
          <p style={{margin:"2px 0 0",fontSize:18}}>{ht.icon}</p>
        </div>
        <div style={{flex:1}}>
          {isEmpty
            ?<p style={{margin:0,fontSize:13,color:T.textDim,fontStyle:"italic"}}>Tap to plan…</p>
            :<p style={{margin:0,fontSize:14,color:item.status==="done"?T.textMuted:T.text,textDecoration:item.status==="done"?"line-through":"none",fontWeight:item.status==="planned"?500:400}}>{item.plan}</p>
          }
          {!isEmpty&&(
            <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${ht.color}18`,color:ht.color,fontFamily:"'DM Mono',monospace"}}>{ht.label}</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${pplColor}18`,color:pplColor,fontFamily:"'DM Mono',monospace"}}>{item.people}</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:item.status==="done"?"rgba(76,175,80,0.12)":item.status==="planned"?"rgba(74,158,255,0.12)":T.bgPanel,color:item.status==="done"?"#4CAF50":item.status==="planned"?"#4A9EFF":T.textMuted,fontFamily:"'DM Mono',monospace"}}>{item.status==="done"?"✓ Done":item.status==="planned"?"Planned":"TBD"}</span>
            </div>
          )}
          {item.notes&&<p style={{margin:"4px 0 0",fontSize:11,color:T.textSub}}>{item.notes}</p>}
        </div>
        <span style={{fontSize:12,color:T.textDim}}>›</span>
      </div>
    );
  };

  // ── Edit modals ──
  const UnwindEditModal=({item,onSave,onClose})=>{
    const [form,setForm]=useState({...item});
    const colors=Object.values(SPORT_COLORS);
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
        <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
          <p style={{margin:"0 0 16px",fontSize:14,fontWeight:600,color:T.text}}>{item.id?"Edit activity":"New activity"}</p>
          {[{label:"Activity",key:"text",type:"text"},{label:"Target (number)",key:"target",type:"number"},{label:"Unit (e.g. sessions/week)",key:"unit",type:"text"}].map(f=>(
            <div key={f.key} style={{marginBottom:10}}>
              <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>{f.label}</p>
              <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:f.type==="number"?Number(e.target.value):e.target.value}))}
                style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
          ))}
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Category</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(HOBBY_TAGS).map(([k,c])=><button key={k} onClick={()=>setForm(p=>({...p,category:k}))} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",background:form.category===k?`${c}20`:T.bgPanel,color:form.category===k?c:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:form.category===k?`1.5px solid ${c}50`:"none"}}>{k}</button>)}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>People</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(PEOPLE_TAGS).map(([k,c])=><button key={k} onClick={()=>setForm(p=>({...p,people:k}))} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",background:form.people===k?`${c}20`:T.bgPanel,color:form.people===k?c:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:form.people===k?`1.5px solid ${c}50`:"none"}}>{k}</button>)}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Colour</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {colors.map(c=><button key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",border:form.color===c?"3px solid white":"2px solid transparent",background:c,cursor:"pointer",boxShadow:form.color===c?`0 0 8px ${c}80`:"none"}}/>)}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>onSave(form)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  const HolEditModal=({item,onSave,onClose})=>{
    const [form,setForm]=useState({...item});
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
        <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
          <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Holiday — {item.month}</p>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Plan / Destination</p>
            <input value={form.plan} onChange={e=>setForm(p=>({...p,plan:e.target.value}))} placeholder="e.g. Japan ski, Goa beach…"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Type</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(HOLIDAY_TYPES).map(([k,v])=><button key={k} onClick={()=>setForm(p=>({...p,type:k}))} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",background:form.type===k?`${v.color}20`:T.bgPanel,color:form.type===k?v.color:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:form.type===k?`1.5px solid ${v.color}50`:"none"}}>{v.icon} {v.label}</button>)}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>With</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.entries(PEOPLE_TAGS).map(([k,c])=><button key={k} onClick={()=>setForm(p=>({...p,people:k}))} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",background:form.people===k?`${c}20`:T.bgPanel,color:form.people===k?c:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:form.people===k?`1.5px solid ${c}50`:"none"}}>{k}</button>)}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Status</p>
            <div style={{display:"flex",gap:5}}>
              {["planned","done","empty"].map(s=><button key={s} onClick={()=>setForm(p=>({...p,status:s}))} style={{flex:1,padding:"7px 4px",borderRadius:10,border:"none",cursor:"pointer",background:form.status===s?"rgba(245,166,35,0.15)":T.bgPanel,color:form.status===s?"#F5A623":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:form.status===s?"1.5px solid rgba(245,166,35,0.5)":"none"}}>{s==="empty"?"TBD":s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Notes</p>
            <input value={form.notes||""} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Visa, booking status, ideas…"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>onSave(form)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  const doneCount=holidays.filter(h=>h.status==="done").length;
  const plannedCount=holidays.filter(h=>h.status==="planned").length;
  const unwindDoneCount=unwindItems.filter(i=>(i.done||0)>=i.target).length;

  const SUB_TABS=[
    {id:"unwind",label:"Unwind",icon:"🧘",desc:"Weekly"},
    {id:"holidays",label:"Holidays",icon:"✈️",desc:"Yearly"},
    {id:"bucket",label:"Bucket",icon:"⭐",desc:"Life"},
  ];

  return(
    <div style={{padding:"0 16px"}}>
      {editUnwind&&<UnwindEditModal item={editUnwind} onSave={form=>{setUnwindItems(prev=>prev.map(i=>i.id===form.id?form:i));setEditUnwind(null);}} onClose={()=>setEditUnwind(null)}/>}
      {editHol&&<HolEditModal item={editHol} onSave={form=>{setHolidays(prev=>prev.map(h=>h.id===form.id?form:h));setEditHol(null);}} onClose={()=>setEditHol(null)}/>}
      {addingUnwind&&<UnwindEditModal item={{id:uid(),...newUnwind,done:0,color:"#F5A623"}} onSave={form=>{setUnwindItems(prev=>[...prev,form]);setAddingUnwind(false);}} onClose={()=>setAddingUnwind(false)}/>}

      {/* Header card */}
      <div style={{background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.2)",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
        <p style={{margin:"0 0 2px",fontSize:10,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:2}}>Life Planner</p>
        <p style={{margin:"0 0 12px",fontSize:18,fontWeight:600,color:T.textHeading}}>Work Hard. Live Well.</p>
        <div style={{display:"flex",gap:8}}>
          {[
            {label:"Unwind done",val:`${unwindDoneCount}/${unwindItems.length}`,color:"#50C8A8"},
            {label:"Holidays done",val:`${doneCount}`,color:"#F5A623"},
            {label:"Planned",val:`${plannedCount}`,color:"#4A9EFF"},
          ].map(s=>(
            <div key={s.label} style={{flex:1,background:T.bgPanel,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <p style={{margin:0,fontSize:18,fontWeight:700,color:s.color,fontFamily:"'DM Mono',monospace"}}>{s.val}</p>
              <p style={{margin:0,fontSize:8,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sub tab switcher */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {SUB_TABS.map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:subTab===t.id?"1.5px solid rgba(245,166,35,0.4)":"1px solid transparent",background:subTab===t.id?"rgba(245,166,35,0.1)":T.bgPanel,cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{fontSize:18}}>{t.icon}</div>
            <div style={{fontSize:12,color:subTab===t.id?"#F5A623":T.textSub,marginTop:2,fontWeight:subTab===t.id?600:400}}>{t.label}</div>
            <div style={{fontSize:9,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ── UNWIND TAB ── */}
      {subTab==="unwind"&&(
        <div>
          {/* People + hobby tag legend */}
          <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
            {Object.entries(PEOPLE_TAGS).map(([k,c])=><span key={k} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${c}14`,color:c,fontFamily:"'DM Mono',monospace"}}>{k}</span>)}
            <span style={{fontSize:10,color:T.textDim,padding:"2px 0"}}>·</span>
            {Object.entries(HOBBY_TAGS).map(([k,c])=><span key={k} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${c}14`,color:c,fontFamily:"'DM Mono',monospace"}}>{k}</span>)}
          </div>
          {/* Weekly progress */}
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <p style={{margin:0,fontSize:11,color:T.textSub}}>This week's progress</p>
              <span style={{fontSize:13,fontWeight:700,color:overallPct>=80?"#4CAF50":overallPct>=50?"#F5A623":"#FF7A7A",fontFamily:"'DM Mono',monospace"}}>{overallPct}%</span>
            </div>
            <div style={{height:6,borderRadius:3,background:T.bgPanel,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${overallPct}%`,background:overallPct>=80?"#4CAF50":overallPct>=50?"#F5A623":"#FF7A7A",borderRadius:3,transition:"width 0.5s"}}/>
            </div>
            <p style={{margin:"6px 0 0",fontSize:10,color:T.textMuted}}>{totalProgress} of {totalTarget} total sessions done</p>
          </div>
          {unwindItems.map(item=>(
            <UnwindCard key={item.id} item={item}
              onUpdate={(id,changes)=>setUnwindItems(prev=>prev.map(i=>i.id===id?{...i,...changes}:i))}
              onDelete={id=>setUnwindItems(prev=>prev.filter(i=>i.id!==id))}/>
          ))}
          <button onClick={()=>setAddingUnwind(true)} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer",marginTop:4}}>+ Add activity</button>
        </div>
      )}

      {/* ── HOLIDAYS TAB ── */}
      {subTab==="holidays"&&(
        <div>
          {/* Frequency goal */}
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{margin:0,fontSize:12,color:T.textSub}}>Frequency goal</p>
                <p style={{margin:"2px 0 0",fontSize:16,fontWeight:700,color:"#F5A623",fontFamily:"'DM Mono',monospace"}}>4x per year</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{margin:0,fontSize:22,fontWeight:700,color:doneCount>=4?"#4CAF50":doneCount>=2?"#F5A623":"#9B8AFF",fontFamily:"'DM Mono',monospace"}}>{doneCount}/4</p>
                <p style={{margin:0,fontSize:10,color:T.textMuted}}>done</p>
              </div>
            </div>
            <div style={{marginTop:10,height:6,borderRadius:3,background:T.bgPanel,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,(doneCount/4)*100)}%`,background:doneCount>=4?"#4CAF50":"#F5A623",borderRadius:3,transition:"width 0.5s"}}/>
            </div>
            {/* Type pills */}
            <div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>
              {Object.entries(HOLIDAY_TYPES).map(([k,v])=><span key={k} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${v.color}14`,color:v.color,fontFamily:"'DM Mono',monospace"}}>{v.icon} {v.label}</span>)}
            </div>
          </div>
          {holidays.map(h=><HolidayCard key={h.id} item={h} onUpdate={(updated)=>setHolidays(prev=>prev.map(x=>x.id===updated.id?updated:x))}/>)}
          <button onClick={()=>{const newH={id:uid(),month:"Dec",plan:"",type:"adventure",people:"Family",status:"empty",notes:""};setHolidays(prev=>[...prev,newH]);setEditHol(newH);}} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer",marginTop:4}}>+ Add month</button>
        </div>
      )}

      {/* ── BUCKET LIST TAB ── */}
      {subTab==="bucket"&&(
        <div>
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <p style={{margin:"0 0 2px",fontSize:12,color:T.textSub}}>Life bucket list</p>
            <p style={{margin:0,fontSize:13,color:T.text,lineHeight:1.5}}>Things to do before you die. Big, small, wild.</p>
          </div>
          {/* Add item */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <input value={newBucket} onChange={e=>setNewBucket(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newBucket.trim()){setBucket(prev=>[{id:uid(),text:newBucket.trim(),category:"adventure",priority:"someday",done:false},...prev]);setNewBucket("");}}}
              placeholder="Add to bucket list…"
              style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13}}/>
            <button onClick={()=>{if(newBucket.trim()){setBucket(prev=>[{id:uid(),text:newBucket.trim(),category:"adventure",priority:"someday",done:false},...prev]);setNewBucket("");}}}
              style={{background:"#F5A623",border:"none",borderRadius:10,padding:"10px 18px",color:"#000",fontWeight:700,fontSize:16,cursor:"pointer"}}>+</button>
          </div>
          {/* Group by priority */}
          {["2025","someday"].map(pri=>{
            const items=bucket.filter(b=>b.priority===pri);
            if(!items.length)return null;
            return(
              <div key={pri} style={{marginBottom:16}}>
                <p style={{margin:"0 0 8px",fontSize:10,color:pri==="2025"?"#F5A623":T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>{pri==="2025"?"🎯 This Year":"💭 Someday"}</p>
                {items.map(b=>(
                  <div key={b.id} style={{background:b.done?T.bgPanel:T.bgCard,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 14px",marginBottom:7,display:"flex",gap:10,alignItems:"center",opacity:b.done?0.55:1,transition:"all 0.2s"}}>
                    <button onClick={()=>setBucket(prev=>prev.map(x=>x.id===b.id?{...x,done:!x.done}:x))}
                      style={{width:22,height:22,borderRadius:"50%",border:b.done?"none":`1.5px solid ${T.textMuted}`,background:b.done?"#4CAF50":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",flexShrink:0,transition:"all 0.15s",boxShadow:b.done?"0 0 6px rgba(76,175,80,0.4)":"none"}}>{b.done?"✓":""}</button>
                    <p style={{margin:0,fontSize:13,color:b.done?T.textMuted:T.text,flex:1,textDecoration:b.done?"line-through":"none"}}>{b.text}</p>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <button onClick={()=>setBucket(prev=>prev.map(x=>x.id===b.id?{...x,priority:x.priority==="2025"?"someday":"2025"}:x))} style={{fontSize:10,padding:"2px 8px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textMuted,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{b.priority==="2025"?"→ Someday":"→ 2025"}</button>
                      <button onClick={()=>setBucket(prev=>prev.filter(x=>x.id!==b.id))} style={{background:"none",border:"none",color:T.textDim,fontSize:14,cursor:"pointer",padding:"0 2px"}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {bucket.filter(b=>b.done).length>0&&(
            <div style={{marginTop:8}}>
              <p style={{margin:"0 0 8px",fontSize:10,color:"#4CAF50",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>✓ Completed</p>
              {bucket.filter(b=>b.done).map(b=>(
                <div key={b.id} style={{background:T.bgPanel,border:`1px solid ${T.borderSub}`,borderRadius:11,padding:"9px 14px",marginBottom:6,display:"flex",gap:10,alignItems:"center",opacity:0.5}}>
                  <span style={{fontSize:14,color:"#4CAF50"}}>✓</span>
                  <p style={{margin:0,fontSize:13,color:T.textMuted,flex:1,textDecoration:"line-through"}}>{b.text}</p>
                  <button onClick={()=>setBucket(prev=>prev.map(x=>x.id===b.id?{...x,done:false}:x))} style={{background:"none",border:"none",color:T.textDim,fontSize:11,cursor:"pointer"}}>undo</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── MY DAY TAB (Work Tasks + Life Planner combined) ─────────────────────────
function MyDayTab({todoItems,todoFilter,setTodoFilter,todoCounts,applyFilter,updateTask,transferTask,deleteTask,R,emptyState,unwindItems,setUnwindItems,holidays,setHolidays,bucket,setBucket}){
  const T=useT();
  const [lifeOpen,setLifeOpen]=useState(true);
  const [goalsOpen,setGoalsOpen]=useState(false);

  // ── Unwind progress ──
  const totalDone=unwindItems.reduce((a,i)=>a+(i.done||0),0);
  const totalTarget=unwindItems.reduce((a,i)=>a+i.target,0);
  const overallPct=totalTarget>0?Math.min(100,Math.round((totalDone/totalTarget)*100)):0;
  const unwindDoneCount=unwindItems.filter(i=>(i.done||0)>=i.target).length;
  const doneHols=holidays.filter(h=>h.status==="done").length;
  const bucketDone=bucket.filter(b=>b.done).length;

  const [editUnwind,setEditUnwind]=useState(null);
  const [addingUnwind,setAddingUnwind]=useState(false);
  const [resetConfirm,setResetConfirm]=useState(false);
  const [editHol,setEditHol]=useState(null);
  const [newBucket,setNewBucket]=useState("");

  const tagColor=(map,key)=>map[key]||"#888";

  // ── Unwind card (compact inline version) ──
  const UnwindRow=({item})=>{
    const pct=item.target>0?Math.min(100,Math.round(((item.done||0)/item.target)*100)):0;
    const pplColor=tagColor(PEOPLE_TAGS,item.people);
    return(
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderLeft:`3px solid ${item.color||"#50C8A8"}`,borderRadius:11,marginBottom:7,padding:"10px 12px",display:"flex",gap:10,alignItems:"center",transition:"background 0.3s"}}>
        <button onClick={()=>setUnwindItems(prev=>prev.map(i=>i.id===item.id?{...i,done:pct>=100?0:item.target}:i))}
          style={{flexShrink:0,width:22,height:22,borderRadius:"50%",border:pct>=100?"none":`1.5px solid ${T.textMuted}`,background:pct>=100?"#4CAF50":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",transition:"all 0.15s",boxShadow:pct>=100?"0 0 8px rgba(76,175,80,0.4)":"none"}}>{pct>=100?"✓":""}</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <p style={{margin:0,fontSize:13,color:pct>=100?T.textMuted:T.text,flex:1,textDecoration:pct>=100?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.text}</p>
            <span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",flexShrink:0}}>{item.done||0}/{item.target}</span>
          </div>
          <div style={{marginTop:5,height:3,borderRadius:2,background:T.bgPanel,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:item.color||"#50C8A8",borderRadius:2,transition:"width 0.4s"}}/>
          </div>
          <div style={{display:"flex",gap:5,marginTop:5}}>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:`${pplColor}14`,color:pplColor,fontFamily:"'DM Mono',monospace"}}>{item.people}</span>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:T.bgPanel,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{item.category}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          <button onClick={()=>setUnwindItems(prev=>prev.map(i=>i.id===item.id?{...i,done:Math.max(0,(i.done||0)-1)}:i))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.text,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
          <button onClick={()=>setUnwindItems(prev=>prev.map(i=>i.id===item.id?{...i,done:Math.min(i.target+2,(i.done||0)+1)}:i))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.text,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          {pct>=100&&<button onClick={()=>setUnwindItems(prev=>prev.filter(i=>i.id!==item.id))} title="Remove done activity" style={{width:24,height:24,borderRadius:6,border:"1px solid rgba(255,77,77,0.25)",background:"rgba(255,77,77,0.08)",color:"#FF7A7A",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
        </div>
      </div>
    );
  };

  // ── Edit modals ──
  const UnwindEditModal=({item,onSave,onClose})=>{
    const [form,setForm]=useState({...item});
    const colors=["#50C8A8","#F5A623","#4A9EFF","#9B8AFF","#FF7A7A","#FFD166","#06D6A0","#EF476F"];
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
        <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
          <p style={{margin:"0 0 14px",fontSize:14,fontWeight:600,color:T.text}}>{item.id&&unwindItems.find(x=>x.id===item.id)?"Edit activity":"New activity"}</p>
          <input value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value}))} placeholder="Activity name"
            style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{flex:1}}>
              <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Target</p>
              <input type="number" value={form.target} onChange={e=>setForm(p=>({...p,target:Number(e.target.value)}))}
                style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div style={{flex:2}}>
              <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Unit</p>
              <input value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}
                style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Category & People</p>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
              {Object.entries(HOBBY_TAGS).map(([k,c])=><button key={k} onClick={()=>setForm(p=>({...p,category:k}))} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:form.category===k?`${c}20`:T.bgPanel,color:form.category===k?c:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:form.category===k?`1.5px solid ${c}50`:"none"}}>{k}</button>)}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {Object.entries(PEOPLE_TAGS).map(([k,c])=><button key={k} onClick={()=>setForm(p=>({...p,people:k}))} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:form.people===k?`${c}20`:T.bgPanel,color:form.people===k?c:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:form.people===k?`1.5px solid ${c}50`:"none"}}>{k}</button>)}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Colour</p>
            <div style={{display:"flex",gap:8}}>{colors.map(c=><button key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{width:26,height:26,borderRadius:"50%",border:form.color===c?"3px solid white":"2px solid transparent",background:c,cursor:"pointer",boxShadow:form.color===c?`0 0 8px ${c}80`:"none"}}/>)}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>onSave(form)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  const HolEditModal=({item,onSave,onClose})=>{
    const [form,setForm]=useState({...item});
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
        <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
          <p style={{margin:"0 0 4px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Holiday — {item.month}</p>
          <input value={form.plan} onChange={e=>setForm(p=>({...p,plan:e.target.value}))} placeholder="Plan / destination…"
            style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:10}}/>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Type</p>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {Object.entries(HOLIDAY_TYPES).map(([k,v])=><button key={k} onClick={()=>setForm(p=>({...p,type:k}))} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:form.type===k?`${v.color}20`:T.bgPanel,color:form.type===k?v.color:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:form.type===k?`1.5px solid ${v.color}50`:"none"}}>{v.icon} {v.label}</button>)}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>With</p>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {Object.entries(PEOPLE_TAGS).map(([k,c])=><button key={k} onClick={()=>setForm(p=>({...p,people:k}))} style={{padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",background:form.people===k?`${c}20`:T.bgPanel,color:form.people===k?c:T.textMuted,fontSize:10,fontFamily:"'DM Mono',monospace",outline:form.people===k?`1.5px solid ${c}50`:"none"}}>{k}</button>)}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Status</p>
            <div style={{display:"flex",gap:5}}>
              {["planned","done","empty"].map(s=><button key={s} onClick={()=>setForm(p=>({...p,status:s}))} style={{flex:1,padding:"7px 4px",borderRadius:10,border:"none",cursor:"pointer",background:form.status===s?"rgba(245,166,35,0.15)":T.bgPanel,color:form.status===s?"#F5A623":T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:form.status===s?"1.5px solid rgba(245,166,35,0.5)":"none"}}>{s==="empty"?"TBD":s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
            </div>
          </div>
          <input value={form.notes||""} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Notes…"
            style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:14}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>onSave(form)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#F5A623",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div>
      {resetConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
          <div style={{background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:360,textAlign:"center"}}>
            <p style={{fontSize:28,margin:"0 0 8px"}}>🔄</p>
            <p style={{margin:"0 0 6px",fontSize:16,fontWeight:600,color:T.text}}>New week?</p>
            <p style={{margin:"0 0 24px",fontSize:13,color:T.textSub,lineHeight:1.5}}>This will reset all session counts to zero. Your activities stay — only the progress clears.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setResetConfirm(false)} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setUnwindItems(prev=>prev.map(i=>({...i,done:0})));setResetConfirm(false);}} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#50C8A8",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>↺ Reset week</button>
            </div>
          </div>
        </div>
      )}
      {editUnwind&&<UnwindEditModal item={editUnwind} onSave={form=>{setUnwindItems(prev=>prev.map(i=>i.id===form.id?form:i));setEditUnwind(null);}} onClose={()=>setEditUnwind(null)}/>}
      {addingUnwind&&<UnwindEditModal item={{id:uid(),text:"",target:1,unit:"sessions/week",category:"Sport",people:"Solo",done:0,color:"#50C8A8"}} onSave={form=>{setUnwindItems(prev=>[...prev,form]);setAddingUnwind(false);}} onClose={()=>setAddingUnwind(false)}/>}
      {editHol&&<HolEditModal item={editHol} onSave={form=>{setHolidays(prev=>prev.map(h=>h.id===form.id?form:h));setEditHol(null);}} onClose={()=>setEditHol(null)}/>}

      {/* ── SECTION 1: WORK TASKS ── */}
      <div style={{padding:"0 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <p style={{margin:0,fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>💼 Work Tasks</p>
        </div>
        {/* Filter pills — All + each bucket */}
        <div style={{display:"flex",gap:5,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
          {[
            {id:"all",    label:"All",       icon:"◉",  color:"#F5A623", count:todoItems.filter(t=>t.bci!=="done").length},
            {id:"schedule",label:"Scheduled",icon:"📅", color:"#4A9EFF", count:todoCounts.schedule},
            {id:"waiting", label:"Waiting",  icon:"⏳", color:"#9B8AFF", count:todoCounts.waiting},
            {id:"someday", label:"Someday",  icon:"💤", color:"#50C8A8", count:todoCounts.someday},
            {id:"done",    label:"Done",     icon:"✓",  color:"#4CAF50", count:todoCounts.done},
          ].map(f=>(
            <button key={f.id} onClick={()=>setTodoFilter(f.id)} style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,border:"none",cursor:"pointer",background:todoFilter===f.id?`${f.color}18`:T.bgPanel,color:todoFilter===f.id?f.color:T.textMuted,fontSize:11,fontFamily:"'DM Mono',monospace",outline:todoFilter===f.id?`1.5px solid ${f.color}40`:"none",transition:"all 0.15s"}}>
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span style={{background:todoFilter===f.id?`${f.color}25`:T.bgChip,color:todoFilter===f.id?f.color:T.textMuted,borderRadius:10,padding:"0 5px",fontSize:10}}>{f.count}</span>
            </button>
          ))}
        </div>
        {/* All view: grouped by Schedule → Waiting → Someday */}
        {todoFilter==="all"?(
          <div>
            {[
              {bci:"schedule",label:"📅 Scheduled",color:"#4A9EFF"},
              {bci:"waiting", label:"⏳ Waiting",  color:"#9B8AFF"},
              {bci:"someday", label:"💤 Someday",  color:"#50C8A8"},
            ].map(group=>{
              const grouped=todoItems.filter(t=>t.bci===group.bci);
              if(!grouped.length)return null;
              return(
                <div key={group.bci} style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{height:1,width:12,background:group.color,borderRadius:1}}/>
                    <p style={{margin:0,fontSize:10,color:group.color,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>{group.label}</p>
                    <div style={{flex:1,height:1,background:T.borderSub}}/>
                    <span style={{fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{grouped.length}</span>
                  </div>
                  {grouped.map(task=>(
                    <TodoCard key={task.id} task={task} onUpdate={(id,v)=>updateTask(id,{update:v})} onBciChange={(id,bci)=>updateTask(id,{bci})} onTransfer={(id,dest)=>transferTask(id,dest)} onDelete={deleteTask} canTransfer={R.transfer} canDelete={R.delete}/>
                  ))}
                </div>
              );
            })}
            {todoItems.filter(t=>t.bci!=="done").length===0&&emptyState}
          </div>
        ):(
          <div>
            {applyFilter(todoItems,todoFilter).map(task=>(
              <TodoCard key={task.id} task={task} onUpdate={(id,v)=>updateTask(id,{update:v})} onBciChange={(id,bci)=>updateTask(id,{bci})} onTransfer={(id,dest)=>transferTask(id,dest)} onDelete={deleteTask} canTransfer={R.transfer} canDelete={R.delete}/>
            ))}
            {!applyFilter(todoItems,todoFilter).length&&emptyState}
          </div>
        )}
      </div>

      {/* ── DIVIDER ── */}
      <div style={{margin:"20px 16px 0",height:1,background:T.borderSub}}/>

      {/* ── SECTION 2: WEEKLY UNWIND ── */}
      <div style={{padding:"0 16px"}}>
        <button onClick={()=>setLifeOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"16px 0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <p style={{margin:0,fontSize:10,color:"#50C8A8",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>🧘 Weekly Unwind</p>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:overallPct>=80?"rgba(76,175,80,0.12)":overallPct>=50?"rgba(245,166,35,0.12)":"rgba(255,77,77,0.1)",color:overallPct>=80?"#4CAF50":overallPct>=50?"#F5A623":"#FF7A7A",fontFamily:"'DM Mono',monospace"}}>{overallPct}%</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={e=>{e.stopPropagation();setResetConfirm(true);}} style={{fontSize:11,padding:"4px 10px",borderRadius:20,border:"1px solid rgba(80,200,168,0.3)",background:"rgba(80,200,168,0.08)",color:"#50C8A8",cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>↺ New week</button>
            <span style={{fontSize:13,color:T.textMuted}}>{lifeOpen?"▲":"▼"}</span>
          </div>
        </button>

        {lifeOpen&&(
          <div>
            {/* Overall progress bar */}
            <div style={{height:4,borderRadius:2,background:T.bgPanel,overflow:"hidden",marginBottom:12}}>
              <div style={{height:"100%",width:`${overallPct}%`,background:overallPct>=80?"#4CAF50":overallPct>=50?"#F5A623":"#FF7A7A",borderRadius:2,transition:"width 0.5s"}}/>
            </div>
            {/* Tags legend */}
            <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
              {Object.entries(PEOPLE_TAGS).map(([k,c])=><span key={k} style={{fontSize:9,padding:"1px 7px",borderRadius:10,background:`${c}14`,color:c,fontFamily:"'DM Mono',monospace"}}>{k}</span>)}
              <span style={{fontSize:9,color:T.textDim}}>·</span>
              {Object.entries(HOBBY_TAGS).map(([k,c])=><span key={k} style={{fontSize:9,padding:"1px 7px",borderRadius:10,background:`${c}14`,color:c,fontFamily:"'DM Mono',monospace"}}>{k}</span>)}
            </div>
            {unwindItems.map(item=><UnwindRow key={item.id} item={item}/>)}
            <button onClick={()=>setAddingUnwind(true)} style={{width:"100%",padding:"9px",borderRadius:10,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer",marginTop:2}}>+ Add activity</button>
          </div>
        )}
      </div>

      {/* ── SECTION 3: LIFE GOALS (collapsed by default) ── */}
      <div style={{padding:"0 16px",paddingBottom:20}}>
        <button onClick={()=>setGoalsOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"16px 0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <p style={{margin:0,fontSize:10,color:"#9B8AFF",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>✨ Life Goals</p>
            <div style={{display:"flex",gap:5}}>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(245,166,35,0.1)",color:"#F5A623",fontFamily:"'DM Mono',monospace"}}>✈️ {doneHols}/4</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(155,138,255,0.1)",color:"#9B8AFF",fontFamily:"'DM Mono',monospace"}}>⭐ {bucketDone}/{bucket.length}</span>
            </div>
          </div>
          <span style={{fontSize:13,color:T.textMuted}}>{goalsOpen?"▲":"▼"}</span>
        </button>

        {goalsOpen&&(
          <div>
            {/* Holidays mini list */}
            <p style={{margin:"0 0 8px",fontSize:10,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>✈️ Holidays — goal 4x/year</p>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
              {holidays.map((h,i)=>{
                const ht=HOLIDAY_TYPES[h.type]||HOLIDAY_TYPES.adventure;
                const isEmpty=!h.plan;
                return(
                  <div key={h.id} onClick={()=>setEditHol(h)} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",borderBottom:i<holidays.length-1?`1px solid ${T.borderSub}`:"none",cursor:"pointer"}}>
                    <span style={{fontSize:11,color:T.textMuted,fontFamily:"'DM Mono',monospace",minWidth:26,flexShrink:0}}>{h.month}</span>
                    <span style={{fontSize:14,flexShrink:0}}>{ht.icon}</span>
                    <p style={{margin:0,fontSize:12,color:isEmpty?T.textDim:h.status==="done"?T.textMuted:T.text,flex:1,fontStyle:isEmpty?"italic":"normal",textDecoration:h.status==="done"?"line-through":"none"}}>{isEmpty?"Tap to plan…":h.plan}</p>
                    {!isEmpty&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:10,background:h.status==="done"?"rgba(76,175,80,0.12)":"rgba(74,158,255,0.12)",color:h.status==="done"?"#4CAF50":"#4A9EFF",fontFamily:"'DM Mono',monospace",flexShrink:0}}>{h.status==="done"?"✓":h.status==="planned"?"Planned":"TBD"}</span>}
                  </div>
                );
              })}
            </div>

            {/* Bucket list mini */}
            <p style={{margin:"0 0 8px",fontSize:10,color:"#9B8AFF",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>⭐ Bucket List</p>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={newBucket} onChange={e=>setNewBucket(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newBucket.trim()){setBucket(prev=>[{id:uid(),text:newBucket.trim(),category:"adventure",priority:"someday",done:false},...prev]);setNewBucket("");}}}
                placeholder="Add to bucket list…"
                style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:12}}/>
              <button onClick={()=>{if(newBucket.trim()){setBucket(prev=>[{id:uid(),text:newBucket.trim(),category:"adventure",priority:"someday",done:false},...prev]);setNewBucket("");}}}
                style={{background:"#9B8AFF",border:"none",borderRadius:10,padding:"9px 14px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>+</button>
            </div>
            {bucket.filter(b=>!b.done).map(b=>(
              <div key={b.id} style={{display:"flex",gap:9,alignItems:"center",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",marginBottom:6}}>
                <button onClick={()=>setBucket(prev=>prev.map(x=>x.id===b.id?{...x,done:true}:x))} style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${T.textMuted}`,background:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}/>
                <p style={{margin:0,fontSize:12,color:T.text,flex:1}}>{b.text}</p>
                <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:b.priority==="2025"?"rgba(245,166,35,0.12)":T.bgPanel,color:b.priority==="2025"?"#F5A623":T.textMuted,fontFamily:"'DM Mono',monospace",cursor:"pointer"}} onClick={()=>setBucket(prev=>prev.map(x=>x.id===b.id?{...x,priority:x.priority==="2025"?"someday":"2025"}:x))}>{b.priority==="2025"?"2025":"someday"}</span>
                <button onClick={()=>setBucket(prev=>prev.filter(x=>x.id!==b.id))} style={{background:"none",border:"none",color:T.textDim,fontSize:13,cursor:"pointer"}}>✕</button>
              </div>
            ))}
            {bucket.filter(b=>b.done).length>0&&(
              <p style={{margin:"8px 0 4px",fontSize:9,color:"#4CAF50",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>✓ Done</p>
            )}
            {bucket.filter(b=>b.done).map(b=>(
              <div key={b.id} style={{display:"flex",gap:9,alignItems:"center",background:T.bgPanel,border:`1px solid ${T.borderSub}`,borderRadius:10,padding:"8px 12px",marginBottom:5,opacity:0.5}}>
                <span style={{fontSize:12,color:"#4CAF50"}}>✓</span>
                <p style={{margin:0,fontSize:12,color:T.textMuted,flex:1,textDecoration:"line-through"}}>{b.text}</p>
                <button onClick={()=>setBucket(prev=>prev.map(x=>x.id===b.id?{...x,done:false}:x))} style={{background:"none",border:"none",color:T.textDim,fontSize:10,cursor:"pointer"}}>undo</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── EA QUICK ADD ─────────────────────────────────────────────────────────────
function EaQuickAdd({onAdd}){
  const T=useT();
  const [text,setText]=useState("");
  const [delegate,setDelegate]=useState("");
  const [expanded,setExpanded]=useState(false);

  const submit=(list)=>{
    if(!text.trim())return;
    onAdd(text.trim(),delegate.trim(),list);
    setText("");setDelegate("");setExpanded(false);
  };

  return(
    <div style={{padding:"0 16px 12px"}}>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:13,overflow:"hidden",transition:"background 0.3s"}}>
        {/* Collapsed: just a single tap bar */}
        {!expanded?(
          <button onClick={()=>setExpanded(true)} style={{width:"100%",padding:"11px 14px",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
            <span style={{fontSize:16,opacity:0.5}}>+</span>
            <span style={{fontSize:13,color:T.textMuted}}>Add task to My Tasks or Delegation…</span>
          </button>
        ):(
          <div style={{padding:"12px 14px"}}>
            <input
              value={text} onChange={e=>setText(e.target.value)} autoFocus
              onKeyDown={e=>e.key==="Escape"&&setExpanded(false)}
              placeholder="Task description…"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:8}}
            />
            <input
              value={delegate} onChange={e=>setDelegate(e.target.value)}
              placeholder="Delegate / person name (optional)"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:10}}
            />
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setExpanded(false)} style={{padding:"9px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>submit("todo")} style={{flex:1,padding:"9px 8px",borderRadius:10,border:"none",background:"rgba(245,166,35,0.15)",color:"#F5A623",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span>👤</span> My Tasks
              </button>
              <button onClick={()=>submit("del")} style={{flex:1,padding:"9px 8px",borderRadius:10,border:"none",background:"rgba(155,138,255,0.15)",color:"#9B8AFF",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span>🔁</span> Delegated
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── VARSHA RECURRING TRACKER ────────────────────────────────────────────────
const WEEK_STATUS={
  done:    {label:"Done",     color:"#4CAF50", bg:"rgba(76,175,80,0.15)"},
  received:{label:"Received", color:"#4A9EFF", bg:"rgba(74,158,255,0.15)"},
  pending: {label:"Pending",  color:"#FF7A7A", bg:"rgba(255,77,77,0.15)"},
  "":      {label:"—",        color:"#444",    bg:"transparent"},
};
const WEEKS=["W1","W2","W3","W4","W5"];

function VarshaRecurring(){
  const T=useT();
  const [items,setItems]=useState(SEED_VARSHA_RECURRING);
  const [cycleLabel,setCycleLabel]=useState("June 2026");
  const [editCycle,setEditCycle]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [newTask,setNewTask]=useState("");
  const [newFreq,setNewFreq]=useState("Weekly");
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [resetConfirm,setResetConfirm]=useState(false);

  const addItem=()=>{
    if(!newTask.trim())return;
    setItems(prev=>[...prev,{id:uid(),task:newTask.trim(),frequency:newFreq,weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}}]);
    setNewTask("");setShowAdd(false);
  };
  const deleteItem=id=>{setItems(prev=>prev.filter(i=>i.id!==id));setConfirmDelete(null);};
  const cycleWeeks=()=>{setItems(prev=>prev.map(i=>({...i,weeks:{W1:"",W2:"",W3:"",W4:"",W5:""}})));setResetConfirm(false);};
  const setWeek=(id,week,val)=>setItems(prev=>prev.map(i=>i.id===id?{...i,weeks:{...i.weeks,[week]:val}}:i));
  const nextStatus=cur=>{const order=["","done","received","pending"];return order[(order.indexOf(cur)+1)%order.length];};

  const weeklyItems=items.filter(i=>i.frequency==="Weekly");
  const monthlyItems=items.filter(i=>i.frequency==="Monthly");

  const StatusCell=({id,week,value})=>{
    const s=WEEK_STATUS[value]||WEEK_STATUS[""];
    return(
      <button onClick={()=>setWeek(id,week,nextStatus(value))}
        style={{flex:1,minWidth:0,padding:"5px 2px",borderRadius:8,border:"none",cursor:"pointer",
          background:s.bg,color:s.color,fontSize:9,fontFamily:"'DM Mono',monospace",
          textAlign:"center",transition:"all 0.15s",lineHeight:1.2}}>
        {value?s.label:"—"}
      </button>
    );
  };

  const TaskSection=({title,color,sectionItems,freq})=>(
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{height:1,width:10,background:color,borderRadius:1}}/>
        <p style={{margin:0,fontSize:10,color,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5}}>{title}</p>
        <div style={{flex:1,height:1,background:T.borderSub}}/>
        <button onClick={()=>{setNewFreq(freq);setShowAdd(true);}}
          style={{fontSize:10,padding:"3px 10px",borderRadius:20,border:`1px solid ${color}40`,background:`${color}10`,color,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
          + Add
        </button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <div style={{flex:"0 0 auto",width:"45%"}}/>
        {WEEKS.map(w=><div key={w} style={{flex:1,textAlign:"center",fontSize:9,color:T.textMuted,fontFamily:"'DM Mono',monospace"}}>{w}</div>)}
        <div style={{width:22}}/>
      </div>
      {sectionItems.length===0&&(
        <div style={{textAlign:"center",padding:"16px 0",color:T.textDim}}>
          <p style={{fontSize:12,margin:0}}>No tasks yet — tap + Add</p>
        </div>
      )}
      {sectionItems.map(item=>{
        const doneCount=WEEKS.filter(w=>item.weeks[w]==="done"||item.weeks[w]==="received").length;
        return(
          <div key={item.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:11,padding:"9px 10px",marginBottom:7,transition:"background 0.3s"}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{flex:"0 0 auto",width:"45%",paddingRight:6}}>
                <p style={{margin:0,fontSize:11.5,color:T.text,lineHeight:1.35}}>{item.task}</p>
                <div style={{display:"flex",gap:5,marginTop:4,alignItems:"center"}}>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:item.frequency==="Weekly"?"rgba(74,158,255,0.12)":"rgba(155,138,255,0.12)",color:item.frequency==="Weekly"?"#4A9EFF":"#9B8AFF",fontFamily:"'DM Mono',monospace"}}>{item.frequency}</span>
                  {doneCount>0&&<span style={{fontSize:9,color:"#4CAF50",fontFamily:"'DM Mono',monospace"}}>{doneCount}✓</span>}
                </div>
              </div>
              {WEEKS.map(w=><StatusCell key={w} id={item.id} week={w} value={item.weeks[w]}/>)}
              <button onClick={()=>setConfirmDelete(item.id)}
                style={{width:22,height:22,flexShrink:0,borderRadius:6,border:"1px solid rgba(255,77,77,0.25)",background:"rgba(255,77,77,0.07)",color:"#FF7A7A",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return(
    <div style={{padding:"0 16px"}}>

      {/* Add modal */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",maxWidth:600,margin:"0 auto",background:T.modalBg,borderRadius:"20px 20px 0 0",padding:"22px 20px 44px",border:`1px solid ${T.modalBorder}`}}>
            <p style={{margin:"0 0 14px",fontSize:14,fontWeight:600,color:T.text}}>Add recurring task</p>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} autoFocus
              onKeyDown={e=>e.key==="Enter"&&addItem()}
              placeholder="Task name…"
              style={{width:"100%",background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,boxSizing:"border-box",marginBottom:12}}/>
            <p style={{margin:"0 0 8px",fontSize:10,color:T.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Frequency</p>
            <div style={{display:"flex",gap:8,marginBottom:18}}>
              {["Weekly","Monthly"].map(f=>(
                <button key={f} onClick={()=>setNewFreq(f)} style={{flex:1,padding:"10px",borderRadius:11,border:"none",cursor:"pointer",
                  background:newFreq===f?(f==="Weekly"?"rgba(74,158,255,0.15)":"rgba(155,138,255,0.15)"):T.bgPanel,
                  color:newFreq===f?(f==="Weekly"?"#4A9EFF":"#9B8AFF"):T.textMuted,
                  fontSize:13,fontWeight:newFreq===f?600:400,
                  outline:newFreq===f?`1.5px solid ${f==="Weekly"?"#4A9EFF":"#9B8AFF"}40`:"none"}}>
                  {f==="Weekly"?"🔁 Weekly":"📅 Monthly"}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setShowAdd(false);setNewTask("");}} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={addItem} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#4A9EFF",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add task</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
          <div style={{background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:360,textAlign:"center"}}>
            <p style={{fontSize:26,margin:"0 0 8px"}}>🗑</p>
            <p style={{margin:"0 0 6px",fontSize:15,fontWeight:600,color:T.text}}>Delete this task?</p>
            <p style={{margin:"0 0 22px",fontSize:12,color:T.textSub,lineHeight:1.4}}>{items.find(i=>i.id===confirmDelete)?.task}</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>deleteItem(confirmDelete)} style={{flex:2,padding:"11px",borderRadius:12,border:"none",background:"#FF4D4D",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm */}
      {resetConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
          <div style={{background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:360,textAlign:"center"}}>
            <p style={{fontSize:26,margin:"0 0 8px"}}>🔄</p>
            <p style={{margin:"0 0 6px",fontSize:15,fontWeight:600,color:T.text}}>Start new cycle?</p>
            <p style={{margin:"0 0 22px",fontSize:12,color:T.textSub}}>All week statuses clear. Tasks stay.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setResetConfirm(false)} style={{flex:1,padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              <button onClick={cycleWeeks} style={{flex:2,padding:"11px",borderRadius:12,border:"none",background:"#4A9EFF",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>↺ Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:"rgba(74,158,255,0.07)",border:"1px solid rgba(74,158,255,0.2)",borderRadius:14,padding:"12px 14px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{margin:"0 0 2px",fontSize:10,color:"#4A9EFF",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:2}}>Recurring Tracker</p>
            {editCycle
              ?<input value={cycleLabel} onChange={e=>setCycleLabel(e.target.value)} onBlur={()=>setEditCycle(false)} autoFocus
                  style={{background:T.bgInput,border:`1px solid ${T.borderInput}`,borderRadius:8,padding:"4px 8px",color:T.text,fontSize:14,fontWeight:600,width:140}}/>
              :<p style={{margin:0,fontSize:16,fontWeight:600,color:T.textHeading,cursor:"pointer"}} onClick={()=>setEditCycle(true)}>{cycleLabel} <span style={{fontSize:11,color:T.textMuted}}>✏</span></p>
            }
          </div>
          <button onClick={()=>setResetConfirm(true)}
            style={{padding:"7px 12px",borderRadius:10,border:"1px solid rgba(74,158,255,0.3)",background:"rgba(74,158,255,0.08)",color:"#4A9EFF",fontSize:11,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
            ↺ New cycle
          </button>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
          {Object.entries(WEEK_STATUS).filter(([k])=>k!=="").map(([k,v])=>(
            <span key={k} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:v.bg,color:v.color,fontFamily:"'DM Mono',monospace"}}>{v.label}</span>
          ))}
          <span style={{fontSize:10,color:T.textMuted}}>· tap cell to cycle</span>
        </div>
      </div>

      <TaskSection title="Weekly Tasks"  color="#4A9EFF" sectionItems={weeklyItems}  freq="Weekly"/>
      <TaskSection title="Monthly Tasks" color="#9B8AFF" sectionItems={monthlyItems} freq="Monthly"/>
    </div>
  );
}



// ─── DATA PANEL (Export / Import) ────────────────────────────────────────────
function DataPanel({tasks,setTasks,onClose}){
  const T=useT();
  const [mode,setMode]=useState("export"); // "export" | "import"
  const [importing,setImporting]=useState(false);
  const [importResult,setImportResult]=useState(null);
  const [error,setError]=useState("");

  // ── EXPORT ──
  const exportToExcel=()=>{
    const XLSX=window.XLSX;
    if(!XLSX){setError("Excel library not loaded. Check internet connection.");return;}

    const wb=XLSX.utils.book_new();

    // Sheet 1: My Tasks
    const todoRows=tasks.filter(t=>t.list==="todo").map(t=>({
      ID:t.id, Task:t.text, Bucket:t.bci, Status:t.status,
      Delegate:t.delegate||"", Update:t.update||"",
      FollowUp:t.followUp?"Yes":"No", NextFollowUpDate:t.nextFollowUp||"",
      Day:t.day||"", Time:t.time||"", FollowUpCount:t.followUpCount||0,
      CreatedAt:t.createdAt||"", Starred:t.starred?"Yes":"No",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(todoRows.length?todoRows:[{Task:"No tasks"}]), "My Tasks");

    // Sheet 2: EA List
    const eaRows=tasks.filter(t=>t.list==="ea").map(t=>({
      ID:t.id, Task:t.text, Status:t.status,
      Delegate:t.delegate||"", Update:t.update||"",
      NextFollowUpDate:t.nextFollowUp||"", FollowUpCount:t.followUpCount||0,
      CreatedAt:t.createdAt||"",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eaRows.length?eaRows:[{Task:"No tasks"}]), "EA List");

    // Sheet 3: Delegation
    const delRows=tasks.filter(t=>t.list==="del").map(t=>({
      ID:t.id, Task:t.text, Delegate:t.delegate||"",
      Phone:t.phone||"", Status:t.status,
      Starred:t.starred?"Yes":"No", Update:t.update||"",
      NextFollowUpDate:t.nextFollowUp||"", FollowUpCount:t.followUpCount||0,
      CreatedAt:t.createdAt||"",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(delRows.length?delRows:[{Task:"No tasks"}]), "Delegation");

    // Sheet 4: All (for reference / editing template)
    const allRows=tasks.map(t=>({
      ID:t.id, List:t.list, Task:t.text, Bucket:t.bci, Status:t.status,
      Delegate:t.delegate||"", Phone:t.phone||"", Update:t.update||"",
      FollowUp:t.followUp?"Yes":"No", NextFollowUpDate:t.nextFollowUp||"",
      Day:t.day||"", Time:t.time||"", FollowUpCount:t.followUpCount||0,
      Starred:t.starred?"Yes":"No", CreatedAt:t.createdAt||"",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allRows.length?allRows:[{Task:"No tasks"}]), "All Tasks");

    XLSX.writeFile(wb, `WorkOS_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ── IMPORT ──
  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const XLSX=window.XLSX;
    if(!XLSX){setError("Excel library not loaded.");return;}
    setImporting(true);setError("");setImportResult(null);

    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const wb=XLSX.read(ev.target.result,{type:"array"});
        const allSheet=wb.Sheets["All Tasks"];
        if(!allSheet){
          // Try reading each sheet separately
          const newTasks=[];
          const listMap={"My Tasks":"todo","EA List":"ea","Delegation":"del"};
          ["My Tasks","EA List","Delegation"].forEach(sheetName=>{
            const sh=wb.Sheets[sheetName];
            if(!sh)return;
            const rows=XLSX.utils.sheet_to_json(sh);
            rows.forEach(row=>{
              if(!row.Task||row.Task==="No tasks")return;
              newTasks.push({
                id:row.ID||uid(),
                list:listMap[sheetName]||"todo",
                text:String(row.Task||""),
                bci:row.Bucket||"schedule",
                status:row.Status||"todo",
                delegate:String(row.Delegate||""),
                phone:String(row.Phone||""),
                update:String(row.Update||""),
                followUp:row.FollowUp==="Yes",
                nextFollowUp:String(row.NextFollowUpDate||""),
                day:String(row.Day||""),
                time:String(row.Time||""),
                followUpCount:Number(row.FollowUpCount)||0,
                starred:row.Starred==="Yes",
                createdAt:String(row.CreatedAt||new Date().toISOString()),
              });
            });
          });
          setImportResult({count:newTasks.length,tasks:newTasks});
        } else {
          // Use All Tasks sheet (most complete)
          const rows=XLSX.utils.sheet_to_json(allSheet);
          const newTasks=rows.filter(r=>r.Task&&r.Task!=="No tasks").map(row=>({
            id:row.ID||uid(),
            list:row.List||"todo",
            text:String(row.Task||""),
            bci:row.Bucket||"schedule",
            status:row.Status||"todo",
            delegate:String(row.Delegate||""),
            phone:String(row.Phone||""),
            update:String(row.Update||""),
            followUp:row.FollowUp==="Yes",
            nextFollowUp:String(row.NextFollowUpDate||""),
            day:String(row.Day||""),
            time:String(row.Time||""),
            followUpCount:Number(row.FollowUpCount)||0,
            starred:row.Starred==="Yes",
            createdAt:String(row.CreatedAt||new Date().toISOString()),
          }));
          setImportResult({count:newTasks.length,tasks:newTasks});
        }
      }catch(err){
        setError("Could not read file: "+err.message);
      }
      setImporting(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value=""; // reset input
  };

  const confirmImport=()=>{
    if(!importResult)return;
    setTasks(importResult.tasks);
    setImportResult(null);
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      {/* Load SheetJS from CDN */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"/>
      <div style={{width:"100%",maxWidth:540,background:T.modalBg,borderRadius:"20px 20px 0 0",border:`1px solid ${T.modalBorder}`,maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <p style={{margin:0,fontSize:10,color:"#F5A623",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:2}}>Data Manager</p>
            <p style={{margin:"2px 0 0",fontSize:17,fontWeight:600,color:T.textHeading}}>Export / Import</p>
          </div>
          <button onClick={onClose} style={{background:T.bgPanel,border:`1px solid ${T.border}`,borderRadius:10,padding:"6px 12px",color:T.textMuted,fontSize:13,cursor:"pointer"}}>✕ Close</button>
        </div>

        {/* Mode tabs */}
        <div style={{display:"flex",gap:8,padding:"16px 20px 0",flexShrink:0}}>
          {[{id:"export",icon:"⬇",label:"Export to Excel"},{id:"import",icon:"⬆",label:"Import from Excel"}].map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);setImportResult(null);setError("");}} style={{flex:1,padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:mode===m.id?"rgba(245,166,35,0.15)":T.bgPanel,color:mode===m.id?"#F5A623":T.textMuted,fontSize:13,fontWeight:mode===m.id?600:400,outline:mode===m.id?"1.5px solid rgba(245,166,35,0.4)":"none",transition:"all 0.15s"}}>
              <span style={{marginRight:6}}>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{padding:"16px 20px 32px",overflowY:"auto"}}>

          {mode==="export"&&(
            <div>
              <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 16px",marginBottom:14}}>
                <p style={{margin:"0 0 8px",fontSize:13,color:T.text,fontWeight:500}}>What gets exported</p>
                {[
                  {sheet:"My Tasks",desc:`${tasks.filter(t=>t.list==="todo").length} tasks — schedule, waiting, someday`},
                  {sheet:"EA List",desc:`${tasks.filter(t=>t.list==="ea").length} tasks — all EA items`},
                  {sheet:"Delegation",desc:`${tasks.filter(t=>t.list==="del").length} tasks — all delegated items with phone numbers`},
                  {sheet:"All Tasks",desc:"Combined sheet — edit this one for reimport"},
                ].map(s=>(
                  <div key={s.sheet} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.borderSub}`}}>
                    <span style={{fontSize:11,fontWeight:600,color:"#50C8A8",fontFamily:"'DM Mono',monospace",minWidth:90}}>{s.sheet}</span>
                    <span style={{fontSize:12,color:T.textSub}}>{s.desc}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.2)",borderRadius:12,padding:"12px 14px",marginBottom:16}}>
                <p style={{margin:"0 0 4px",fontSize:12,color:"#F5A623",fontWeight:500}}>💡 Editing tip</p>
                <p style={{margin:0,fontSize:12,color:T.textSub,lineHeight:1.5}}>Edit the <strong style={{color:T.text}}>"All Tasks"</strong> sheet — it has every field. When importing back, the app reads that sheet first. Don't change the column headers.</p>
              </div>
              <button onClick={exportToExcel} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:"#F5A623",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                ⬇ Download Excel
              </button>
            </div>
          )}

          {mode==="import"&&(
            <div>
              {!importResult?(
                <>
                  <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 16px",marginBottom:14}}>
                    <p style={{margin:"0 0 8px",fontSize:13,color:T.text,fontWeight:500}}>Import rules</p>
                    {[
                      "Export first, edit the file, then import back",
                      "Use the 'All Tasks' sheet — it has all fields",
                      "Don't rename or remove column headers",
                      "List column: use todo, ea, or del",
                      "Bucket column: schedule, waiting, or someday",
                      "Import replaces all current tasks",
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<5?`1px solid ${T.borderSub}`:"none"}}>
                        <span style={{fontSize:11,color:"#9B8AFF",fontFamily:"'DM Mono',monospace",minWidth:16}}>{i+1}.</span>
                        <span style={{fontSize:12,color:T.textSub}}>{r}</span>
                      </div>
                    ))}
                  </div>
                  {error&&<p style={{fontSize:12,color:"#FF7A7A",margin:"0 0 12px",padding:"8px 12px",background:"rgba(255,77,77,0.08)",borderRadius:8}}>{error}</p>}
                  <label style={{display:"block",width:"100%",padding:"36px 20px",borderRadius:13,border:`2px dashed ${T.border}`,background:T.bgPanel,textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}>
                    <input type="file" accept=".xlsx,.xls" onChange={handleFile} style={{display:"none"}}/>
                    <p style={{margin:"0 0 6px",fontSize:28}}>{importing?"⏳":"📂"}</p>
                    <p style={{margin:0,fontSize:14,color:T.text,fontWeight:500}}>{importing?"Reading file…":"Tap to choose Excel file"}</p>
                    <p style={{margin:"4px 0 0",fontSize:11,color:T.textMuted}}>.xlsx or .xls</p>
                  </label>
                </>
              ):(
                <div>
                  <div style={{background:"rgba(76,175,80,0.07)",border:"1px solid rgba(76,175,80,0.25)",borderRadius:13,padding:"16px",marginBottom:14,textAlign:"center"}}>
                    <p style={{margin:"0 0 4px",fontSize:26}}>✓</p>
                    <p style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:"#4CAF50"}}>File read successfully</p>
                    <p style={{margin:0,fontSize:13,color:T.textSub}}>{importResult.count} tasks found</p>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    {[
                      {list:"todo",label:"My Tasks",color:"#F5A623"},
                      {list:"ea",  label:"EA List", color:"#4A9EFF"},
                      {list:"del", label:"Delegated",color:"#9B8AFF"},
                    ].map(l=>{
                      const n=importResult.tasks.filter(t=>t.list===l.list).length;
                      return(
                        <div key={l.list} style={{flex:1,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                          <p style={{margin:0,fontSize:18,fontWeight:700,color:l.color,fontFamily:"'DM Mono',monospace"}}>{n}</p>
                          <p style={{margin:0,fontSize:10,color:T.textMuted}}>{l.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{background:"rgba(255,77,77,0.07)",border:"1px solid rgba(255,77,77,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                    <p style={{margin:0,fontSize:12,color:"#FF7A7A"}}>⚠ This will replace all current tasks. This cannot be undone.</p>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setImportResult(null)} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
                    <button onClick={confirmImport} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#4CAF50",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Import & Replace</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const prefersDark=typeof window!=="undefined"&&window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [themeName,setThemeName]=useState(prefersDark?"dark":"light");
  const theme=THEMES[themeName]||THEMES.dark;
  const T=theme;

  const [user,setUser]=useState(null);
  const [showData,setShowData]=useState(false);
  const [tab,setTab]=useState("capture");
  const [tasks,setTasks]=useState(SEED_TASKS);
  const [approvals,setApprovals]=useState([]);
  const [unwindItems,setUnwindItems]=useState(SEED_UNWIND);
  const [holidays,setHolidays]=useState(SEED_HOLIDAYS);
  const [bucket,setBucket]=useState(SEED_BUCKET);
  const [qc,setQc]=useState(SEED_QC);

  // ── Supabase load + realtime ──────────────────────────────────────────────
  const loadFromDB = useCallback(async () => {
    if (!supabase) return;
    const [{ data: tData }, { data: aData }, { data: cData }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at'),
      supabase.from('approvals').select('*').order('approved_at', { ascending: false }),
      supabase.from('quick_capture').select('*').order('created_at', { ascending: false }),
    ]);
    if (tData) setTasks(tData.map(rowToTask));
    if (aData) setApprovals(aData.map(rowToApproval));
    if (cData) setQc(cData.map(rowToCapture));
  }, []);

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  useEffect(() => {
    if (!supabase) return;
    const ch = supabase.channel('workos-rt')
      .on('postgres_changes',{event:'*',schema:'public',table:'tasks'},loadFromDB)
      .on('postgres_changes',{event:'*',schema:'public',table:'approvals'},loadFromDB)
      .on('postgres_changes',{event:'*',schema:'public',table:'quick_capture'},loadFromDB)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadFromDB]);

  const [dailyLog,setDailyLog]=useState(SEED_DAILY);
  const [toast,setToast]=useState(null);
  const [todoFilter,setTodoFilter]=useState("all");
  const [eaFilter,setEaFilter]=useState("all");
  const [delFilter,setDelFilter]=useState("all");
  const [eaSort,setEaSort]=useState("asc");
  const [delSort,setDelSort]=useState("asc");

  const fire=msg=>{setToast(msg);setTimeout(()=>setToast(null),2000);};

  if(!user)return(
    <ThemeCtx.Provider value={T}>
      <LoginScreen onLogin={u=>{setUser(u);setTab(u.tabs[0]);}} theme={theme} setThemeName={setThemeName}/>
    </ThemeCtx.Provider>
  );

  const R=user.rights;
  const todayStr=new Date().toISOString().split("T")[0];

  const updateTask=(id,changes)=>setTasks(prev=>{
    const next=prev.map(t=>{
      if(t.id!==id)return t;
      const isUpdateChange="update"in changes&&changes.update!==t.update&&(changes.update||"").trim()!=="";
      return{...t,...changes,followUpCount:isUpdateChange?(t.followUpCount||0)+1:(t.followUpCount||0)};
    });
    const updated=next.find(t=>t.id===id);
    if(updated)dbSync.upsertTask(updated);
    return next;
  });
  const deleteTask=id=>{setTasks(prev=>prev.filter(t=>t.id!==id));dbSync.deleteTask(id);fire("Deleted");};
  const transferTask=(id,toList)=>{
    setTasks(prev=>{
      const next=prev.map(t=>t.id===id?{...t,list:toList,...(toList==="todo"?{bci:"schedule"}:{})}:t);
      const updated=next.find(t=>t.id===id);
      if(updated)dbSync.upsertTask(updated);
      return next;
    });
    fire(`Moved to ${toList==="todo"?"My Tasks":toList==="ea"?"EA List":"Delegation"}`);
  };
  const markDone=(id,fromList)=>{
    const task=tasks.find(t=>t.id===id);if(!task)return;
    const approval={id:uid(),text:task.text,delegate:task.delegate||"",update:task.update||"",fromList};
    setTasks(prev=>prev.filter(t=>t.id!==id));
    setApprovals(prev=>[approval,...prev]);
    dbSync.deleteTask(id);
    dbSync.upsertApproval(approval);
    setTab("approvals");fire("Moved to Approvals ✓");
  };
  const approve=id=>{setApprovals(prev=>prev.filter(a=>a.id!==id));dbSync.deleteApproval(id);fire("Approved ✓");};
  const reject=id=>{
    const a=approvals.find(x=>x.id===id);if(!a)return;
    const task={id:uid(),list:a.fromList,text:a.text,update:(a.update||"")+" [Sent back]",delegate:a.delegate||"",status:"in-progress",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:new Date().toISOString(),batch:"meetings"};
    setApprovals(prev=>prev.filter(x=>x.id!==id));setTasks(prev=>[task,...prev]);fire("Sent back ↩");
  };
  const addQC=text=>{const item={id:uid(),text,ts:Date.now()};setQc(prev=>[item,...prev]);dbSync.addCapture(item);};
  const delQC=id=>{setQc(prev=>prev.filter(i=>i.id!==id));dbSync.deleteCapture(id);};
  const routeQC=(item,list,del)=>{
    delQC(item.id);
    const task={id:uid(),list,text:item.text,update:"",delegate:del||"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:new Date().toISOString(),batch:"meetings"};
    setTasks(prev=>[task,...prev]);
    dbSync.upsertTask(task);
    fire(`Added to ${list==="todo"?"My Tasks":list==="ea"?"EA List":"Delegation"}`);
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
  const unscheduledCount=tasks.filter(t=>!t.day&&t.bci==="schedule"&&t.list==="todo"&&t.status!=="done").length;

  const ALL_TABS=[
    {id:"inbox",icon:"⚡",label:"Inbox",badge:qc.length,alert:qc.filter(i=>Date.now()-i.ts>86400000).length>0},
    {id:"myday",icon:"👤",label:"My Day",badge:todoItems.length},
    {id:"ea",icon:"🎯",label:"EA",badge:eaItems.length,alert:eaDue>0},
    {id:"del",icon:"🔁",label:"Delegated",badge:delItems.length,star:delStarCount,alert:delDue>0},
    {id:"approvals",icon:"✅",label:"Approvals",badge:approvals.length,alert:approvals.length>0},
    {id:"recurring",icon:"🔄",label:"Recurring"},
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

        {showData&&R.approve&&<DataPanel tasks={tasks} setTasks={setTasks} onClose={()=>setShowData(false)}/>}
        {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.modalBg,border:`1px solid ${T.modalBorder}`,borderRadius:20,padding:"10px 20px",fontSize:13,color:T.text,zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",whiteSpace:"nowrap"}}>{toast}</div>}

        {/* DESKTOP SIDEBAR */}
        <div className="side-nav" style={{position:"fixed",left:0,top:0,bottom:0,width:220,background:T.bgSub,borderRight:`1px solid ${T.borderSide}`,display:"none",flexDirection:"column",padding:"28px 0",zIndex:100,transition:"background 0.3s"}}>
          <div style={{padding:"0 20px 16px"}}>
            <p style={{margin:0,fontSize:9,color:"#F5A623",fontFamily:"'DM Mono',monospace",letterSpacing:2.5,textTransform:"uppercase"}}>Work OS</p>
            <p style={{margin:"2px 0 0",fontSize:18,fontWeight:600,color:T.textHeading}}>Task Manager</p>
          </div>
          <div style={{padding:"0 12px 12px"}}><ThemeToggle theme={theme} setThemeName={setThemeName}/></div>
          {R.approve&&<div style={{padding:"0 12px 8px"}}>
            <button onClick={()=>setShowData(true)} style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:11,cursor:"pointer",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:8}}>
              <span>📊</span><span>Export / Import</span>
            </button>
          </div>}
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
                {t.alert&&<span style={{width:7,height:7,borderRadius:"50%",background:t.id==="approvals"?"#4CAF50":t.id==="schedule"?"#FF7A7A":"#F5A623",boxShadow:`0 0 6px ${t.id==="approvals"?"#4CAF50":t.id==="schedule"?"#FF7A7A":"#F5A623"}90`}}/>}
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
              <button onClick={()=>setThemeName(n=>n==="dark"?"light":"dark")} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${T.border}`,background:T.bgPanel,color:T.textSub,fontSize:14,cursor:"pointer"}}>{theme.id==="dark"?"☀️":"🌙"}</button>
              <div style={{display:"flex",alignItems:"center",gap:7,background:`${user.color}12`,border:`1px solid ${user.color}30`,borderRadius:20,padding:"5px 10px 5px 7px"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`${user.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:user.color}}>{user.avatar}</div>
                <p style={{margin:0,fontSize:12,fontWeight:600,color:T.textHeading}}>{user.name}</p>
              </div>
              {R.approve&&<button onClick={()=>setShowData(true)} style={{background:T.bgPanel,border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 10px",color:T.textSub,fontSize:13,cursor:"pointer"}}>📊</button>}
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

            {tab==="inbox"&&R.capture&&<QuickCapture items={qc} onAdd={addQC} onDelete={delQC} onRoute={routeQC}/>}

            {tab==="myday"&&(
              <MyDayTab
                todoItems={todoItems} todoFilter={todoFilter} setTodoFilter={setTodoFilter} todoCounts={todoCounts}
                applyFilter={applyFilter} updateTask={updateTask} transferTask={transferTask} deleteTask={deleteTask}
                R={R} emptyState={emptyState}
                unwindItems={unwindItems} setUnwindItems={setUnwindItems}
                holidays={holidays} setHolidays={setHolidays}
                bucket={bucket} setBucket={setBucket}
              />
            )}

            {tab==="ea"&&(
              <div>
                <TodayPanel tasks={[...eaItems,...delItems]} onStatusChange={(id,st)=>updateTask(id,{status:st})} onDone={markDone} onDateChange={(id,date)=>updateTask(id,{nextFollowUp:date})}/>
                <EaQuickAdd onAdd={(text,delegate,list)=>{
                  const task={id:uid(),list,text,update:"",delegate:delegate||"",status:"todo",bci:"schedule",starred:false,followUp:false,nextFollowUp:"",day:"",time:"",followUpCount:0,createdAt:new Date().toISOString()};
                  setTasks(prev=>[task,...prev]);
                  fire(`Added to ${list==="todo"?"My Tasks":"Delegation"}`);
                }}/>
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

            {tab==="recurring"&&R.recurring&&<VarshaRecurring/>}

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
                {t.alert&&<span style={{position:"absolute",top:-2,right:-4,width:7,height:7,background:t.id==="approvals"?"#4CAF50":t.id==="schedule"?"#FF7A7A":"#F5A623",borderRadius:"50%",boxShadow:`0 0 6px ${t.id==="approvals"?"#4CAF50":t.id==="schedule"?"#FF7A7A":"#F5A623"}90`}}/>}
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
