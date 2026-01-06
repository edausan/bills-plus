let bills = JSON.parse(localStorage.getItem('bills')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

function save() {
  localStorage.setItem('bills', JSON.stringify(bills));
  localStorage.setItem('history', JSON.stringify(history));
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
    amount: billAmount.value,
    due: billDue.value,
    icon: billIcon.value || "💳",
    status: "Unpaid"
  });
  save();
  render();
}

function cycleStatus(bill) {
  if (bill.status === "Unpaid") bill.status = "Paid";
  else if (bill.status === "Paid") {
    bill.status = "Overdue";
    history.push({ ...bill, paidDate: new Date().toLocaleDateString() });
  }
  else bill.status = "Unpaid";

  save();
  render();
}

function render() {
  renderAdmin();
  renderBills();
  renderHistory();
}

function renderAdmin() {
  adminList.innerHTML = "";
  bills.forEach((b, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${b.icon} ${b.name} - ₱${b.amount}
      <button onclick="bills.splice(${i},1); save(); render()">❌</button>`;
    adminList.appendChild(li);
  });
}

function renderBills() {
  billsContainer.innerHTML = "";
  bills
    .sort((a,b) => new Date(a.due) - new Date(b.due))
    .forEach(b => {
      const card = document.createElement("div");
      card.className = `bill-card status-${b.status}`;
      card.onclick = () => cycleStatus(b);
      card.innerHTML = `
        <h3>${b.icon} ${b.name}</h3>
        <p>₱${b.amount}</p>
        <p>Due: ${b.due}</p>
        <strong>${b.status}</strong>
      `;
      billsContainer.appendChild(card);
    });
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.name} - ₱${h.amount} (${h.paidDate})`;
    historyList.appendChild(li);
  });
}

render();
