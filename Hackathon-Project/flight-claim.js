// Extracted JS from flight-claim.html

// ── TAB SWITCHING ──
function switchTab(el, panelId) {
  if ((panelId === 'tab-docs' || panelId === 'tab-review') && !validateFlightForm()) {
    return;
  }
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(panelId).classList.add('active');
  if (panelId === 'tab-review') populateReview();
}

function switchTabById(panelId) {
  if ((panelId === 'tab-docs' || panelId === 'tab-review') && !validateFlightForm()) {
    return;
  }
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  const idx = ['tab-flight', 'tab-docs', 'tab-review'].indexOf(panelId);
  panels.forEach(p => p.classList.remove('active'));
  tabs.forEach(t => t.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
  tabs[idx].classList.add('active');
  if (panelId === 'tab-review') populateReview();
}

// ── FORM VALIDATION ──
function validateField(input) {
  const id = input.id;
  const errEl = document.getElementById(id + 'Err');
  if (!errEl) return;
  if (!input.value.trim()) {
    input.classList.add('error');
    errEl.textContent = 'This field is required.';
  } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    input.classList.add('error');
    errEl.textContent = 'Enter a valid email address.';
  } else if (id === 'flightNo') {
    const flightRegex = /^[A-Z0-9]{2,3}-?\d{1,4}$/i;
    if (!flightRegex.test(input.value.trim())) {
      input.classList.add('error');
      errEl.textContent = 'Enter a valid flight number.';
      return;
    }
    input.classList.remove('error');
    errEl.textContent = '';
  } else {
    input.classList.remove('error');
    errEl.textContent = '';
  }
}

function validateFlightForm() {
  const required = ['passengerName', 'email', 'flightNo', 'depDate', 'depAirport', 'arrAirport', 'delayHours'];
  let valid = true;

  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      valid = false;
      if (el) {
        el.classList.add('error');
        const errEl = document.getElementById(id + 'Err');
        if (errEl) errEl.textContent = 'This field is required.';
      }
    }
  });

  const email = document.getElementById('email');
  if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    valid = false;
    email.classList.add('error');
    document.getElementById('emailErr').textContent = 'Enter a valid email address.';
  }

  const flightNo = document.getElementById('flightNo');
  const flightRegex = /^[A-Z0-9]{2,3}-?\d{1,4}$/i;
  if (flightNo && flightNo.value.trim() && !flightRegex.test(flightNo.value.trim())) {
    valid = false;
    flightNo.classList.add('error');
    document.getElementById('flightNoErr').textContent = 'Enter a valid flight number.';
  }

  if (!valid) {
    showToast('Please complete all required fields.');
  }
  return valid;
}

// ── FILE UPLOAD ──
let uploadedFiles = [];

function handleFiles(files) {
  if (uploadedFiles.length >= 5) {
    showToast('Maximum 5 files allowed.');
    return;
  }

  Array.from(files).forEach(f => {
    if (uploadedFiles.length >= 5) {
      showToast('Maximum 5 files allowed.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showToast('❌ ' + f.name + ' exceeds 5MB limit.');
      return;
    }
    uploadedFiles.push(f);
  });

  renderFiles();
}

function renderFiles() {
  const list = document.getElementById('fileList');
  list.innerHTML = uploadedFiles.map((f, i) => `
    <div class="file-item">
      <span>✓</span>
      <span class="file-name">${f.name}</span>
      <span style="font-size:0.78rem;color:var(--muted)">${(f.size / 1024).toFixed(0)} KB</span>
      <button onclick="removeFile(${i})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:0.85rem">✕</button>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:100%"></div></div>
  `).join('');
}

function removeFile(i) {
  uploadedFiles.splice(i, 1);
  renderFiles();
}

function dragOver(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.add('drag');
}

function dragLeave() {
  document.getElementById('uploadZone').classList.remove('drag');
}

function dropFile(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag');
  handleFiles(e.dataTransfer.files);
}

// ── REVIEW POPULATE ──
function populateReview() {
  const fields = {
    'Passenger': document.getElementById('passengerName')?.value || '—',
    'Email': document.getElementById('email')?.value || '—',
    'Flight No': document.getElementById('flightNo')?.value || '—',
    'Departure Date': document.getElementById('depDate')?.value || '—',
    'Departure': document.getElementById('depAirport')?.value || '—',
    'Arrival': document.getElementById('arrAirport')?.value || '—',
    'Delay': document.getElementById('delayHours')?.value || '—',
    'Reason': document.getElementById('delayReason')?.value || '—',
    'Documents': uploadedFiles.length + ' file(s) attached',
  };
  document.getElementById('reviewData').innerHTML =
    Object.entries(fields).map(([k, v]) =>
      `<div style="display:flex;gap:1rem;padding:0.4rem 0;border-bottom:1px solid rgba(30,45,69,0.4)">
        <span style="min-width:130px;color:var(--muted);font-size:0.82rem">${k}</span>
        <span style="font-weight:500">${v}</span>
      </div>`
    ).join('');
}

// ── SUBMIT CLAIM ──
function submitClaim() {
  if (!validateFlightForm()) {
    switchTabById('tab-flight');
    return;
  }

  const name = document.getElementById('passengerName')?.value?.trim();
  const flightNo = document.getElementById('flightNo')?.value?.trim() || 'Unknown';
  const depAirport = document.getElementById('depAirport')?.value?.trim() || '';
  const arrAirport = document.getElementById('arrAirport')?.value?.trim() || '';
  const id = 'CLM-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

  const claimData = {
    passenger: name,
    flight: flightNo,
    route: depAirport && arrAirport ? `${depAirport} → ${arrAirport}` : '',
    status: 'Under Review',
    submittedAt: new Date().toISOString(),
  };

  localStorage.setItem(id, JSON.stringify(claimData));
  showToast('✅ Claim ' + id + ' submitted successfully! Check Status tab to track.');

  setTimeout(() => {
    document.getElementById('trackId').value = id;
    trackClaim();
  }, 1500);
}

// ── ELIGIBILITY CHECKER ──
function checkEligibility() {
  const route = document.getElementById('routeType').value;
  const delay = document.getElementById('delayType').value;
  const dist = document.getElementById('distance').value;
  const resp = document.getElementById('responsibility').value;
  const box = document.getElementById('eligResult');

  if (!route || !delay || !dist || !resp) {
    showToast('⚠ Please fill all eligibility fields.');
    return;
  }

  if (resp === 'no') {
    box.className = 'result-box deny show';
    document.getElementById('eligTitle').textContent = '✗ Not Eligible';
    document.getElementById('eligAmount').textContent = '€0';
    document.getElementById('eligNote').textContent =
      'Extraordinary circumstances (e.g. severe weather, ATC strikes) exempt airlines from EU261 compensation obligations.';
    return;
  }

  if (route === 'intl' && resp === 'unsure') {
    box.className = 'result-box deny show';
    document.getElementById('eligTitle').textContent = '⚠ Possibly Not Eligible';
    document.getElementById('eligAmount').textContent = 'Review Needed';
    document.getElementById('eligNote').textContent =
      'Non-EU routes may not fall under EU261. Consult DOT guidelines or submit a claim for manual review.';
    return;
  }

  let amount = 0;
  if (delay === '2h') {
    amount = 0;
  } else if (delay === '3h' || delay === 'cancel') {
    if (dist === '1500') amount = 250;
    else if (dist === '3500') amount = 400;
    else amount = 600;
  } else if (delay === '4h' || delay === 'denied') {
    if (dist === '1500') amount = 250;
    else if (dist === '3500') amount = 400;
    else amount = 600;
  }

  if (amount === 0) {
    box.className = 'result-box deny show';
    document.getElementById('eligTitle').textContent = '✗ Below Threshold';
    document.getElementById('eligAmount').textContent = '€0';
    document.getElementById('eligNote').textContent =
      'EU261 requires arrival delay of 3+ hours. A 2-hour delay does not qualify for monetary compensation, though care rights (meals, refreshments) may apply.';
  } else {
    box.className = 'result-box show';
    document.getElementById('eligTitle').textContent = '✓ You Are Eligible!';
    document.getElementById('eligAmount').textContent = '€' + amount;
    document.getElementById('eligNote').textContent =
      'Under EU261/2004, you are entitled to €' + amount + ' compensation. File your claim above with supporting documents.';
  }
}

// ── CLAIM TRACKER ──
function trackClaim() {
  const id = document.getElementById('trackId').value.trim();
  if (!id) {
    showToast('⚠ Enter a claim ID to track.');
    document.getElementById('trackerResult').style.display = 'none';
    return;
  }

  const claimData = JSON.parse(localStorage.getItem(id) || 'null');
  if (!claimData) {
    showToast('⚠ No claim found with that ID.');
    document.getElementById('trackerResult').style.display = 'none';
    return;
  }

  document.getElementById('trackerResult').style.display = 'block';
  document.getElementById('trackClaimId').textContent = id;
  document.getElementById('trackPassenger').textContent = claimData.passenger || 'Passenger';
  document.getElementById('trackFlight').textContent = claimData.flight || 'Unknown';
}

// ── ADMIN ACTIONS ──
function updateStatus(btn, status) {
  const row = btn.closest('tr');
  const badge = row.querySelector('.status-badge');
  if (status === 'approved') {
    badge.className = 'status-badge approved';
    badge.textContent = '● Approved';
    showToast('✅ Claim approved & queued for payment.');
  } else {
    badge.className = 'status-badge rejected';
    badge.textContent = '● Rejected';
    showToast('❌ Claim rejected. Notification sent to passenger.');
  }
  btn.closest('td').innerHTML = '<button class="action-btn" onclick="viewDetails(this)">View</button>';
}

function viewDetails(btn) {
  const row = btn.closest('tr');
  const cells = row.querySelectorAll('td');
  showToast('📋 ' + cells[1].textContent + ' — ' + cells[2].textContent + ' — ' + cells[6].querySelector('.status-badge').textContent.trim());
}

// ── TOAST NOTIFICATION ──
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

// ── ON DOM READY ──
document.addEventListener('DOMContentLoaded', () => {
  const d = document.getElementById('depDate');
  if (d) d.max = new Date().toISOString().split('T')[0];
});
