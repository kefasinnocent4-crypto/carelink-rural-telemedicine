const state = {
  user: JSON.parse(localStorage.getItem("carelinkUser") || "null"),
  events: JSON.parse(localStorage.getItem("carelinkEvents") || "[]"),
  online: navigator.onLine,
  lowBandwidth: localStorage.getItem("carelinkLowBandwidth") === "1"
};

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem("carelinkUser", JSON.stringify(state.user));
  localStorage.setItem("carelinkEvents", JSON.stringify(state.events));
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

function setNetwork() {
  state.online = navigator.onLine;
  $("networkDot").className = "dot " + (state.online ? "online" : "offline");
  $("networkText").textContent = state.online ? "Online" : "Offline";
  $("patientConnection").textContent = state.online ? "Good" : "Offline";
  $("chwSync").textContent = state.online ? "Synced" : "Pending sync";
}

function setLowBandwidth(on) {
  state.lowBandwidth = on;
  document.body.classList.toggle("low-bandwidth", on);
  localStorage.setItem("carelinkLowBandwidth", on ? "1" : "0");
  $("lowBandwidthBtn").textContent = on ? "Standard mode" : "Low-bandwidth mode";
  toast(on ? "Low-bandwidth mode enabled" : "Standard mode enabled");
}

function addEvent(title, detail) {
  state.events.unshift({date:new Date().toLocaleString(), title, detail});
  save();
  renderTimeline();
}

function renderTimeline() {
  const list = state.events.length ? state.events : [
    {date:"Today · 9:10 AM",title:"Profile created",detail:"CareLink demo account ready."},
    {date:"Today · 9:20 AM",title:"Clinic connected",detail:"Community health worker verified your registration."}
  ];
  $("timeline").innerHTML = list.slice(0,8).map(e =>
    `<div class="event"><small>${e.date}</small><div><strong>${e.title}</strong><div class="muted">${e.detail}</div></div></div>`
  ).join("");
}

function renderQueues() {
  $("patientQueue").innerHTML = [
    ["Musa Bello","Fever / headache","Awaiting review"],
    ["Aisha Ibrahim","Antenatal follow-up","Scheduled 11:30 AM"],
    ["John Peter","Blood pressure follow-up","Pending referral"],
    ["Fatima Umar","Child health","Needs doctor review"]
  ].map(x => `<div class="queue-item"><div><strong>${x[0]}</strong><small>${x[1]}</small></div><span class="pill">${x[2]}</span></div>`).join("");

  $("doctorQueue").innerHTML = [
    ["Aisha Ibrahim","Antenatal follow-up","Priority"],
    ["John Peter","BP follow-up","Routine"],
    ["Fatima Umar","Child health","Priority"],
    ["Musa Bello","Fever / headache","Routine"]
  ].map(x => `<div class="queue-item"><div><strong>${x[0]}</strong><small>${x[1]}</small></div><span class="pill">${x[2]}</span></div>`).join("");
}

function showDashboard() {
  $("loginView").classList.remove("active");
  $("dashboardView").classList.add("active");
  $("welcomeTitle").textContent = `Welcome, ${state.user.name}`;
  $("roleSubtitle").textContent = {
    patient:"Patient portal · Book care and track your follow-ups.",
    chw:"Community health worker portal · Capture and coordinate rural cases.",
    doctor:"Doctor portal · Review remote consultation requests."
  }[state.user.role];

  ["patient","chw","doctor"].forEach(r => {
    $(`${r}Dashboard`).classList.toggle("hidden", state.user.role !== r);
  });
  renderTimeline();
  renderQueues();
}

function login() {
  const name = $("nameInput").value.trim() || "Demo User";
  state.user = {name, role:$("roleInput").value};
  state.events = [];
  save();
  showDashboard();
}

function logout() {
  state.user = null;
  save();
  $("dashboardView").classList.remove("active");
  $("loginView").classList.add("active");
}

$("loginBtn").addEventListener("click", login);
$("logoutBtn").addEventListener("click", logout);
$("lowBandwidthBtn").addEventListener("click", () => setLowBandwidth(!state.lowBandwidth));

$("bookBtn").addEventListener("click", () => {
  const service = $("serviceSelect").value;
  const time = $("timeSelect").value;
  addEvent("Consultation requested", `${service} · ${time}`);
  toast(state.online ? "Consultation request sent." : "Saved offline. It will sync when connected.");
});

$("checkinBtn").addEventListener("click", () => {
  const text = $("symptomInput").value.trim();
  if (!text) return toast("Please enter a short check-in.");
  addEvent("Check-in saved", text);
  $("symptomInput").value = "";
  toast(state.online ? "Check-in saved for review." : "Check-in saved offline.");
});

$("syncBtn").addEventListener("click", () => {
  if (!state.online) return toast("Still offline — nothing was uploaded.");
  toast("Local records synchronized.");
});

$("addPatientBtn").addEventListener("click", () => {
  toast("Demo registration form opened. Add a real database in Phase 2.");
});

window.addEventListener("online", setNetwork);
window.addEventListener("offline", setNetwork);

setNetwork();
setLowBandwidth(state.lowBandwidth);
if (state.user) showDashboard();
