const state = {
  user: JSON.parse(localStorage.getItem("carelinkUser") || "null"),
  events: JSON.parse(localStorage.getItem("carelinkEvents") || "[]"),
  users: JSON.parse(localStorage.getItem("carelinkUsers") || "[]"),
  online: navigator.onLine,
  lowBandwidth: localStorage.getItem("carelinkLowBandwidth") === "1"
};

const $ = id => document.getElementById(id);
function save() {
  localStorage.setItem("carelinkUser", JSON.stringify(state.user));
  localStorage.setItem("carelinkEvents", JSON.stringify(state.events));
  localStorage.setItem("carelinkUsers", JSON.stringify(state.users));
}
function toast(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2600); }
function setNetwork() {
  state.online=navigator.onLine; $("networkDot").className="dot "+(state.online?"online":"offline"); $("networkText").textContent=state.online?"Online":"Offline";
  if($("patientConnection")) $("patientConnection").textContent=state.online?"Good":"Offline";
  if($("chwSync")) $("chwSync").textContent=state.online?"Synced":"Pending sync";
}
function setLowBandwidth(on) { state.lowBandwidth=on; document.body.classList.toggle("low-bandwidth",on); localStorage.setItem("carelinkLowBandwidth",on?"1":"0"); $("lowBandwidthBtn").textContent=on?"Standard mode":"Low-bandwidth mode"; toast(on?"Low-bandwidth mode enabled":"Standard mode enabled"); }
function addEvent(title,detail) { state.events.unshift({date:new Date().toLocaleString(),title,detail}); save(); renderTimeline(); }
function renderTimeline() {
  const list=state.events.length?state.events:[{date:"Today · 9:10 AM",title:"Profile created",detail:"CareLink demo account ready."},{date:"Today · 9:20 AM",title:"Clinic connected",detail:"Community health worker verified your registration."}];
  $("timeline").innerHTML=list.slice(0,8).map(e=>`<div class="event"><small>${e.date}</small><div><strong>${e.title}</strong><div class="muted">${e.detail}</div></div></div>`).join("");
}
function renderQueues() {
  $("patientQueue").innerHTML=[["Musa Bello","Fever / headache","Awaiting review"],["Aisha Ibrahim","Antenatal follow-up","Scheduled 11:30 AM"],["John Peter","Blood pressure follow-up","Pending referral"],["Fatima Umar","Child health","Needs doctor review"]].map(x=>`<div class="queue-item"><div><strong>${x[0]}</strong><small>${x[1]}</small></div><span class="pill">${x[2]}</span></div>`).join("");
  $("doctorQueue").innerHTML=[["Aisha Ibrahim","Antenatal follow-up","Priority"],["John Peter","BP follow-up","Routine"],["Fatima Umar","Child health","Priority"],["Musa Bello","Fever / headache","Routine"]].map(x=>`<div class="queue-item"><div><strong>${x[0]}</strong><small>${x[1]}</small></div><span class="pill">${x[2]}</span></div>`).join("");
}
function showDashboard() {
  $("loginView").classList.remove("active"); $("dashboardView").classList.add("active"); $("welcomeTitle").textContent=`Welcome, ${state.user.name}`;
  $("roleSubtitle").textContent={patient:"Patient portal · Book care and track your follow-ups.",chw:"Community health worker portal · Capture and coordinate rural cases.",doctor:"Doctor portal · Review remote consultation requests."}[state.user.role];
  ["patient","chw","doctor"].forEach(r=>$(`${r}Dashboard`).classList.toggle("hidden",state.user.role!==r)); renderTimeline(); renderQueues();
}
function logout(){state.user=null; save(); $("dashboardView").classList.remove("active"); $("loginView").classList.add("active"); showAuth("signin");}
function showAuth(mode){ const signIn=mode==="signin"; $("signInForm").classList.toggle("hidden",!signIn); $("signUpForm").classList.toggle("hidden",signIn); $("signInTab").classList.toggle("active",signIn); $("signUpTab").classList.toggle("active",!signIn); }

$("signInTab").addEventListener("click",()=>showAuth("signin"));
$("signUpTab").addEventListener("click",()=>showAuth("signup"));
$("signInForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=$("signInEmail").value.trim().toLowerCase(), password=$("signInPassword").value;
  const user=state.users.find(u=>u.email===email && u.password===password);
  if(!user) return toast("Incorrect email or password. Please sign up first.");
  state.user={name:user.name,email:user.email,phone:user.phone,age:user.age,role:user.role}; state.events=[]; save(); showDashboard(); toast("Signed in successfully.");
});
$("signUpForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("signUpName").value.trim(), email=$("signUpEmail").value.trim().toLowerCase(), phone=$("signUpPhone").value.trim(), age=Number($("signUpAge").value), role=$("signUpRole").value, password=$("signUpPassword").value, confirm=$("signUpConfirmPassword").value;
  if(password!==confirm) return toast("Passwords do not match.");
  if(age<1 || age>120) return toast("Please enter a valid age.");
  if(state.users.some(u=>u.email===email)) return toast("An account with this email already exists.");
  const user={name,email,phone,age,role,password}; state.users.push(user); state.user={name,email,phone,age,role}; state.events=[]; save(); showDashboard(); toast("Account created successfully.");
});
$("logoutBtn").addEventListener("click",logout);
$("lowBandwidthBtn").addEventListener("click",()=>setLowBandwidth(!state.lowBandwidth));
$("bookBtn").addEventListener("click",()=>{const service=$("serviceSelect").value,time=$("timeSelect").value;addEvent("Consultation requested",`${service} · ${time}`);toast(state.online?"Consultation request sent.":"Saved offline. It will sync when connected.");});
$("checkinBtn").addEventListener("click",()=>{const text=$("symptomInput").value.trim();if(!text)return toast("Please enter a short check-in.");addEvent("Check-in saved",text);$("symptomInput").value="";toast(state.online?"Check-in saved for review.":"Check-in saved offline.");});
$("syncBtn").addEventListener("click",()=>{if(!state.online)return toast("Still offline — nothing was uploaded.");toast("Local records synchronized.");});
$("addPatientBtn").addEventListener("click",()=>toast("Demo registration form opened. Add a real database in Phase 2."));
window.addEventListener("online",setNetwork); window.addEventListener("offline",setNetwork);
setNetwork(); setLowBandwidth(state.lowBandwidth); if(state.user) showDashboard(); else showAuth("signin");
