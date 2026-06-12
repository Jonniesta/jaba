let counts = {
  follow: 0,
  communication: 0,
  transition: 0,
  group: 0
};

let trialNumber = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sessionDate").valueAsDate = new Date();
  loadHistory();
  updateDashboard();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
});

function changeCount(id, amount) {
  counts[id] += amount;

  if (counts[id] < 0) {
    counts[id] = 0;
  }

  document.getElementById(id).textContent = counts[id];
  updateDashboard();
}

function addTrial() {
  trialNumber++;

  const trialList = document.getElementById("trialList");

  const trial = document.createElement("div");
  trial.className = "trial";
  trial.innerHTML = `
    <h3>Trial ${trialNumber}</h3>

    <label>Target</label>
    <input class="trialTarget" type="text" placeholder="Target skill" />

    <div class="trial-row">
      <div>
        <label>Result</label>
        <select class="trialResult" onchange="updateDashboard()">
          <option value="">Select</option>
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="N/A">N/A</option>
        </select>
      </div>

      <div>
        <label>Prompt Level</label>
        <select class="trialPrompt">
          <option value="">Select</option>
          <option>Independent</option>
          <option>Gestural</option>
          <option>Verbal</option>
          <option>Model</option>
          <option>Partial Physical</option>
          <option>Full Physical</option>
        </select>
      </div>
    </div>
  `;

  trialList.appendChild(trial);
}

function updateDashboard() {
  const total =
    counts.follow +
    counts.communication +
    counts.transition +
    counts.group;

  document.getElementById("totalCount").textContent = total;

  const results = Array.from(document.querySelectorAll(".trialResult"))
    .map(select => select.value)
    .filter(value => value === "+" || value === "-");

  const correct = results.filter(value => value === "+").length;

  const accuracy = results.length
    ? Math.round((correct / results.length) * 100)
    : 0;

  document.getElementById("accuracy").textContent = accuracy + "%";

  const sessions = getSessions();
  document.getElementById("savedCount").textContent = sessions.length;
}

function saveSession() {
  const trials = Array.from(document.querySelectorAll(".trial")).map(trial => {
    return {
      target: trial.querySelector(".trialTarget").value,
      result: trial.querySelector(".trialResult").value,
      prompt: trial.querySelector(".trialPrompt").value
    };
  });

  const session = {
    id: Date.now(),
    clientName: document.getElementById("clientName").value,
    sessionDate: document.getElementById("sessionDate").value,
    therapistName: document.getElementById("therapistName").value,
    counts: { ...counts },
    trials,
    dtt: {
      respondsName: document.getElementById("respondsName").value,
      whQuestion: document.getElementById("whQuestion").value,
      imitatesAction: document.getElementById("imitatesAction").value
    },
    emotion: {
      emotionIdentified: document.getElementById("emotionIdentified").value,
      communicationLevel: document.getElementById("communicationLevel").value
    },
    notes: document.getElementById("notes").value
  };

  const sessions = getSessions();
  sessions.push(session);

  localStorage.setItem("abaSessions", JSON.stringify(sessions));

  alert("Session saved.");
  loadHistory();
  updateDashboard();
}

function getSessions() {
  return JSON.parse(localStorage.getItem("abaSessions")) || [];
}

function loadHistory() {
  const sessions = getSessions();
  const history = document.getElementById("history");

  history.innerHTML = "";

  if (sessions.length === 0) {
    history.innerHTML = "<p>No sessions saved yet.</p>";
    return;
  }

  sessions
    .slice()
    .reverse()
    .forEach(session => {
      const item = document.createElement("div");
      item.className = "history-item";

      item.innerHTML = `
        <strong>${session.clientName || "Unnamed Client"}</strong><br>
        Date: ${session.sessionDate || "No date"}<br>
        Therapist: ${session.therapistName || "No therapist"}<br>
        Trials: ${session.trials.length}<br>
        <button onclick="deleteSession(${session.id})" class="danger">Delete</button>
      `;

      history.appendChild(item);
    });

  updateDashboard();
}

function deleteSession(id) {
  const sessions = getSessions().filter(session => session.id !== id);
  localStorage.setItem("abaSessions", JSON.stringify(sessions));
  loadHistory();
  updateDashboard();
}

function exportCSV() {
  const sessions = getSessions();

  if (sessions.length === 0) {
    alert("No sessions to export.");
    return;
  }

  let csv = "Client,Date,Therapist,Follow Directions,Communication,Transitions,Group Instruction,Notes\n";

  sessions.forEach(session => {
    csv += [
      session.clientName,
      session.sessionDate,
      session.therapistName,
      session.counts.follow,
      session.counts.communication,
      session.counts.transition,
      session.counts.group,
      `"${session.notes.replace(/"/g, '""')}"`
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "aba-sessions.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function clearForm() {
  if (!confirm("Clear current form? Saved sessions will stay.")) {
    return;
  }

  document.getElementById("clientName").value = "";
  document.getElementById("sessionDate").valueAsDate = new Date();
  document.getElementById("therapistName").value = "";
  document.getElementById("notes").value = "";

  document.getElementById("respondsName").value = "";
  document.getElementById("whQuestion").value = "";
  document.getElementById("imitatesAction").value = "";
  document.getElementById("emotionIdentified").value = "";
  document.getElementById("communicationLevel").value = "";

  counts = {
    follow: 0,
    communication: 0,
    transition: 0,
    group: 0
  };

  Object.keys(counts).forEach(id => {
    document.getElementById(id).textContent = "0";
  });

  document.getElementById("trialList").innerHTML = "";
  trialNumber = 0;

  updateDashboard();
}
