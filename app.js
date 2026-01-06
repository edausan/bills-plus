let bills = JSON.parse(localStorage.getItem('bills')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
let dark = JSON.parse(localStorage.getItem('dark')) || false;

if (dark) document.body.classList.add('dark');

function save() {
  localStorage.setItem('bills', JSON.stringify(bills));
  localStorage.setItem('history', JSON.stringify(history));
  localStorage.setItem('dark', JSON.stringify(dark));
}

function toggleDark() {
  dark = !dark;
  document.body.classList.toggle('dark');
  save();
}

function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(tab).classList.remove('hidden');
  render();
}

function addBill() {
  bills.push({
    id: Date.now(),
    name: billName.value,
    amount: Number(billAmount.value),
    due: billDue.value,
    icon: billIcon.value || "💳",
    status: "Unpaid",
    month: billDue.value.slice(0,7) // YYYY-MM
  });
  save();
  render();
}

function updateOverdue() {
  const today = new Date().toISOString().split("T")[0];
  bills.forEach(b => {
    if (b.status === "Unpaid" && b.due < today) {
      b.status = "Overdue";
    }
  });
}

function cycleStatus(b) {
  if (b.status === "Unpaid" || b.status === "Overdue") {
    b.status = "Paid";
    history.push({ ...b, paidDate: new Date().toLocaleDateString() });
  } else {
    b.status = "Unpaid";
  }
  save();
  render();
}

function render() {
  updateOverdue();
  renderAdmin();
  renderBills();
  renderHistory();
}

function renderAdmin() {
  adminList.innerHTML = "";
  bills.forEach((b, i) => {
    adminList.innerHTML += `
      <li>
        ${b.icon} ${b.name}
        <button onclick="bills.splice(${i},1); save(); render()">❌</button>
      </li>`;
  });
}

function renderBills() {
  billsContainer.innerHTML = "";

  const unpaidTotal = bills
    .filter(b => b.status !== "Paid")
    .reduce((s,b)=>s+b.amount,0);

  summary.innerHTML = `
    <h3>Monthly Outlook</h3>
    <strong>₱${unpaidTotal.toLocaleString()}</strong> pending
  `;

  bills
    .sort((a,b)=>new Date(a.due)-new Date(b.due))
    .forEach(b=>{
      billsContainer.innerHTML += `
        <div class="bill-card status-${b.status}" onclick="cycleStatus(${JSON.stringify(b)})">
          <h3>${b.icon} ${b.name}</h3>
          <p>₱${b.amount.toLocaleString()}</p>
          <p>Due: ${b.due}</p>
          <strong>${b.status}</strong>
        </div>`;
    });

  const filtered = bills.filter(b => b.month === selectedMonth);

}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(h=>{
    historyList.innerHTML += `
      <li>${h.icon} ${h.name} – ₱${h.amount} (${h.paidDate})</li>`;
  });
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function checkDueNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const today = new Date();
  bills.forEach(b => {
    if (b.status !== "Paid") {
      const due = new Date(b.due);
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

      if (diff === 1 && !b.notified) {
        new Notification("Bills+ Reminder", {
          body: `${b.name} is due tomorrow (₱${b.amount})`,
        });
        b.notified = true;
      }
    }
  });

  save();
}

let selectedMonth = new Date().toISOString().slice(0,7);

function renderMonthTabs() {
  const monthTabs = document.getElementById('monthTabs')
  const months = [...new Set(bills.map(b => b.month))];
  monthTabs.innerHTML = "";

  months.forEach(m => {
    const btn = document.createElement("button");
    btn.textContent = m;
    if (m === selectedMonth) btn.classList.add("active");
    btn.onclick = () => {
      selectedMonth = m;
      renderBills();
    };
    monthTabs.appendChild(btn);
  });
}

function clearHistory() {
  if (confirm("Clear payment history? This cannot be undone.")) {
    history = [];
    save();
    render();
  }
}




render();
requestNotificationPermission();
checkDueNotifications();

