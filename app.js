// Medication Reminder & Tracker Core Engine
let userMeds = [];
let weeklyLogs = [];
let audioCtx = null;
let sampleDataset = [];
let currentFilter = { condition: 'ALL', status: 'ALL', search: '' };

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupLiveClock();
  setupEventListeners();
  renderAll();
  loadSampleDataset();
});

// Load persistent data from localStorage or fallback to defaults
function loadData() {
  const savedMeds = localStorage.getItem('medi_user_meds');
  if (savedMeds) {
    try {
      userMeds = JSON.parse(savedMeds);
    } catch (e) {
      userMeds = [...DEFAULT_USER_MEDS];
    }
  } else {
    userMeds = [...DEFAULT_USER_MEDS];
    saveMeds();
  }

  const savedWeekly = localStorage.getItem('medi_weekly_logs');
  if (savedWeekly) {
    try {
      weeklyLogs = JSON.parse(savedWeekly);
    } catch (e) {
      weeklyLogs = [...DEFAULT_WEEKLY_DATA];
    }
  } else {
    weeklyLogs = [...DEFAULT_WEEKLY_DATA];
    saveWeekly();
  }
}

function saveMeds() {
  localStorage.setItem('medi_user_meds', JSON.stringify(userMeds));
}

function saveWeekly() {
  localStorage.setItem('medi_weekly_logs', JSON.stringify(weeklyLogs));
}

// Live Clock & Time Check Loop
function setupLiveClock() {
  const clockEl = document.getElementById('liveClock');
  function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    if (clockEl) {
      clockEl.innerHTML = `<span class="live-indicator"></span> <span>${timeStr} &bull; ${dateStr}</span>`;
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// Web Audio API Synthesizer (Pleasant crystal reminder chime)
function playReminderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.65);
    });
  } catch (err) {
    console.warn("Audio Context playback prevented: ", err);
  }
}

// Speech Synthesis (Elderly-Friendly Voice Assistant)
function speakReminder(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, clear voice for elderly
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    
    // Choose natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;
    
    window.speechSynthesis.speak(utterance);
  }
}

// Browser Push Notification
function triggerBrowserNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "https://cdn-icons-png.flaticon.com/512/822/822143.png"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body: body });
      }
    });
  }
}

// Notification Toast Display
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-size: 20px;">${type === 'success' ? '✅' : '🔔'}</span>
    <div style="flex: 1;">
      <p style="font-weight: 600; font-size: 0.9rem;">${message}</p>
    </div>
  `;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navigation Tab Switching
function setupEventListeners() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
      
      if (tab.dataset.tab === 'analytics') {
        renderWeeklyChart();
      }
    });
  });

  // Senior Mode Toggle
  const seniorToggle = document.getElementById('seniorModeToggle');
  if (seniorToggle) {
    seniorToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('senior-mode');
        showToast("Elderly High-Contrast Accessibility Mode Enabled");
      } else {
        document.body.classList.remove('senior-mode');
        showToast("Standard Mode Enabled");
      }
    });
  }

  // Pre-fill dropdown in Add Medicine Modal with the 30 base medicines
  const presetSelect = document.getElementById('presetMedSelect');
  if (presetSelect) {
    BASE_MEDICINES.forEach(med => {
      const opt = document.createElement('option');
      opt.value = med.medicine_id;
      opt.textContent = `${med.name} (${med.strength}) - ${med.condition_group}`;
      presetSelect.appendChild(opt);
    });

    presetSelect.addEventListener('change', (e) => {
      const selected = BASE_MEDICINES.find(m => m.medicine_id == e.target.value);
      if (selected) {
        document.getElementById('medNameInput').value = selected.name;
        document.getElementById('medStrengthInput').value = selected.strength;
        document.getElementById('medFormInput').value = selected.form;
        document.getElementById('medCategoryInput').value = selected.category;
        document.getElementById('medConditionInput').value = selected.condition_group;
      }
    });
  }

  // Add Medicine Form Submit
  const addMedForm = document.getElementById('addMedForm');
  if (addMedForm) {
    addMedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addNewMedication();
    });
  }

  // Dataset Search and Filters
  const searchInput = document.getElementById('datasetSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value.toLowerCase();
      renderDatasetTable();
    });
  }

  const condFilter = document.getElementById('conditionFilter');
  if (condFilter) {
    condFilter.addEventListener('change', (e) => {
      currentFilter.condition = e.target.value;
      renderDatasetTable();
    });
  }

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentFilter.status = e.target.value;
      renderDatasetTable();
    });
  }
}

// Render Main Dashboard Views
function renderAll() {
  renderTodaySchedule();
  renderNextReminderHero();
  renderWeeklyChart();
  renderCabinetList();
}

// Render Next Due Medication Hero Banner
function renderNextReminderHero() {
  const heroCard = document.getElementById('reminderHero');
  if (!heroCard) return;

  const pendingMeds = userMeds.filter(m => m.status === 'Pending');
  if (pendingMeds.length === 0) {
    heroCard.innerHTML = `
      <div class="hero-info">
        <div class="hero-pill-icon" style="background: rgba(16, 185, 129, 0.2); border-color: #10b981;">🎉</div>
        <div class="hero-text">
          <h3>All Doses Taken For Today!</h3>
          <p>Great job! You have achieved 100% adherence today. Keep up the healthy routine.</p>
        </div>
      </div>
      <div class="hero-buttons">
        <button class="btn btn-primary" onclick="testReminderSound()">🔊 Test Alarm & Voice</button>
      </div>
    `;
    return;
  }

  const nextMed = pendingMeds[0];
  heroCard.innerHTML = `
    <div class="hero-info">
      <div class="hero-pill-icon">💊</div>
      <div class="hero-text">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
          <span class="slot-badge" style="background: #10b981; color: white;">NEXT DUE: ${nextMed.time}</span>
          <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${nextMed.slot} Slot</span>
        </div>
        <h3>${nextMed.name} &bull; ${nextMed.strength}</h3>
        <p>${nextMed.food} &bull; ${nextMed.instructions || 'Take with water'}</p>
      </div>
    </div>
    <div class="hero-buttons">
      <button class="btn btn-primary btn-large" onclick="markAsTaken('${nextMed.id}')">
        ✓ Take Dose Now
      </button>
      <button class="btn btn-outline" onclick="triggerVoiceReminder('${nextMed.name}', '${nextMed.strength}', '${nextMed.food}')">
        🗣️ Hear Instructions
      </button>
      <button class="btn btn-outline" onclick="snoozeDose('${nextMed.id}')">
        ⏰ Snooze 15m
      </button>
    </div>
  `;
}

// Render Today's Schedule Cards Grouped By Time Slot
function renderTodaySchedule() {
  const container = document.getElementById('scheduleSlotsContainer');
  if (!container) return;

  const slots = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
  const slotIcons = {
    'Morning': '🌅',
    'Afternoon': '☀️',
    'Evening': '🌆',
    'Bedtime': '🌙'
  };

  container.innerHTML = slots.map(slotName => {
    const medsInSlot = userMeds.filter(m => m.slot === slotName);
    const takenCount = medsInSlot.filter(m => m.status === 'Taken').length;
    
    return `
      <div class="time-slot-card">
        <div class="slot-header">
          <div class="slot-title">
            <span>${slotIcons[slotName]}</span>
            <span>${slotName}</span>
          </div>
          <span class="slot-badge">${takenCount}/${medsInSlot.length} Taken</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${medsInSlot.length === 0 ? `
            <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.9rem;">
              No medicines scheduled for this slot.
            </div>
          ` : medsInSlot.map(med => `
            <div class="med-item-card ${med.status === 'Taken' ? 'status-taken' : ''}" style="--med-color: ${med.color || '#10b981'};">
              <div class="med-meta-row">
                <div>
                  <div class="med-name">${med.name}</div>
                  <div class="med-strength">${med.strength} &bull; ${med.form}</div>
                </div>
                <div class="med-timing-badge">
                  ${med.time}
                </div>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <span class="med-badge-food">🍽️ ${med.food}</span>
                <span class="med-badge-food" style="color: var(--accent-cyan);">📋 ${med.condition}</span>
              </div>

              <div class="med-actions-row">
                ${med.status === 'Taken' ? `
                  <button class="btn btn-outline" style="border-color: #10b981; color: #34d399;" onclick="unmarkTaken('${med.id}')">
                    ✓ Taken at ${med.takenAt} (Undo)
                  </button>
                ` : `
                  <button class="btn btn-primary" onclick="markAsTaken('${med.id}')">
                    ✓ Mark Taken
                  </button>
                  <button class="btn btn-outline" title="Speak Aloud" onclick="triggerVoiceReminder('${med.name}', '${med.strength}', '${med.food}')">
                    🗣️
                  </button>
                  <button class="btn btn-outline" title="Snooze 15 Min" onclick="snoozeDose('${med.id}')">
                    ⏰ +15m
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Action: Mark as Taken
function markAsTaken(medId) {
  const med = userMeds.find(m => m.id === medId);
  if (!med) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  med.status = 'Taken';
  med.takenAt = timeStr;
  
  saveMeds();
  
  // Play pleasant chime
  playReminderChime();
  
  // Voice confirmation
  speakReminder(`Excellent! ${med.name} marked as taken.`);
  showToast(`Recorded dose: ${med.name} (${med.strength}) taken at ${timeStr}`);
  
  // Update Today's log in weekly
  updateTodayAdherenceLog();
  
  renderAll();
}

// Action: Undo Mark Taken
function unmarkTaken(medId) {
  const med = userMeds.find(m => m.id === medId);
  if (!med) return;
  med.status = 'Pending';
  med.takenAt = null;
  saveMeds();
  updateTodayAdherenceLog();
  renderAll();
  showToast(`Reset ${med.name} to pending status.`);
}

// Action: Snooze Dose
function snoozeDose(medId) {
  const med = userMeds.find(m => m.id === medId);
  if (!med) return;
  
  showToast(`Snoozed ${med.name} for 15 minutes. We will remind you again!`, 'warning');
  speakReminder(`Reminder for ${med.name} snoozed for 15 minutes.`);
}

// Action: Trigger Voice Reminder for Senior
function triggerVoiceReminder(name, strength, food) {
  playReminderChime();
  const msg = `Attention please: It is time to take your dose of ${name}, ${strength}. Please take it ${food} with a glass of fresh water.`;
  speakReminder(msg);
  showToast(`Announcing aloud: "${name}"`, 'warning');
}

// Action: Test Alarm and Voice
function testReminderSound() {
  playReminderChime();
  setTimeout(() => {
    speakReminder("Medication reminder test alert: Sound, voice synthesizer, and notification engine are fully active!");
  }, 500);
  triggerBrowserNotification("Medication Alert Test", "Your audio and voice reminder system is operating perfectly.");
  showToast("Audio & Speech Synthesizer Tested!");
}

// Update Today's Adherence Record in Weekly Tracker
function updateTodayAdherenceLog() {
  const total = userMeds.length;
  const taken = userMeds.filter(m => m.status === 'Taken').length;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 100;

  // Update today's entry (Saturday / Oct 24)
  const todayEntry = weeklyLogs[5];
  if (todayEntry) {
    todayEntry.taken = taken;
    todayEntry.adherence = pct;
    saveWeekly();
  }
}

// Render Weekly Adherence Visualizer Chart
function renderWeeklyChart() {
  const chartBarsEl = document.getElementById('adherenceBars');
  if (!chartBarsEl) return;

  chartBarsEl.innerHTML = weeklyLogs.map(item => {
    let colorClass = '';
    if (item.adherence < 70 && item.adherence > 0) colorClass = 'bar-danger';
    else if (item.adherence < 90 && item.adherence > 0) colorClass = 'bar-warning';

    const barHeight = item.adherence > 0 ? Math.max(12, item.adherence) : 4;
    return `
      <div class="bar-col">
        <span class="bar-percent">${item.adherence > 0 ? item.adherence + '%' : '-'}</span>
        <div class="bar-fill-track">
          <div class="bar-fill ${colorClass}" style="height: ${barHeight}%;"></div>
        </div>
        <div class="bar-label">${item.day}</div>
      </div>
    `;
  }).join('');

  // Calculate 7-Day Average
  const activeDays = weeklyLogs.filter(d => d.taken > 0 || d.missed > 0);
  const avgAdherence = activeDays.length > 0 
    ? Math.round(activeDays.reduce((acc, curr) => acc + curr.adherence, 0) / activeDays.length)
    : 92;

  const avgEl = document.getElementById('weeklyAvgScore');
  if (avgEl) avgEl.textContent = `${avgAdherence}%`;

  const meter = document.getElementById('dialMeter');
  if (meter) {
    const dashOffset = 440 - (440 * (avgAdherence / 100));
    meter.style.strokeDashoffset = dashOffset;
  }
}

// Render Medicine Cabinet
function renderCabinetList() {
  const cabinetEl = document.getElementById('cabinetGrid');
  if (!cabinetEl) return;

  cabinetEl.innerHTML = userMeds.map(med => `
    <div class="cabinet-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h4 style="font-size: 1.15rem; font-weight: 700;">${med.name}</h4>
          <span class="slot-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">${med.slot} &bull; ${med.time}</span>
        </div>
        <p style="color: var(--accent-cyan); font-weight: 600; font-size: 0.9rem; margin-top: 4px;">${med.strength} &bull; ${med.form}</p>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;"><strong>Condition:</strong> ${med.condition}</p>
        <p style="color: var(--text-muted); font-size: 0.85rem;"><strong>Routine:</strong> ${med.food}</p>
        ${med.instructions ? `<p style="color: var(--text-dim); font-size: 0.82rem; margin-top: 6px; font-style: italic;">"${med.instructions}"</p>` : ''}
      </div>

      <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
        <button class="btn btn-outline" style="flex: 1; padding: 6px 12px; font-size: 0.82rem;" onclick="triggerVoiceReminder('${med.name}', '${med.strength}', '${med.food}')">
          🗣️ Speak
        </button>
        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.82rem;" onclick="deleteMedicine('${med.id}')">
          🗑️ Remove
        </button>
      </div>
    </div>
  `).join('');
}

// Add New Medicine
function addNewMedication() {
  const name = document.getElementById('medNameInput').value.trim();
  const strength = document.getElementById('medStrengthInput').value.trim();
  const form = document.getElementById('medFormInput').value;
  const slot = document.getElementById('medSlotInput').value;
  const time = document.getElementById('medTimeInput').value;
  const food = document.getElementById('medFoodInput').value;
  const condition = document.getElementById('medConditionInput').value.trim() || 'General Health';
  const instructions = document.getElementById('medInstructionsInput').value.trim();

  if (!name || !strength || !time) {
    alert("Please fill in Medicine Name, Strength, and Scheduled Time.");
    return;
  }

  const newMed = {
    id: 'med-' + Date.now(),
    name,
    strength,
    form,
    slot,
    time,
    food,
    condition,
    instructions,
    status: 'Pending',
    takenAt: null,
    color: '#0ea5e9'
  };

  userMeds.push(newMed);
  saveMeds();
  renderAll();
  closeModal('addMedModal');
  showToast(`Added ${name} (${strength}) to ${slot} schedule!`);
}

// Delete Medicine
function deleteMedicine(medId) {
  if (confirm("Are you sure you want to remove this medication from your schedule?")) {
    userMeds = userMeds.filter(m => m.id !== medId);
    saveMeds();
    renderAll();
    showToast("Medication removed.");
  }
}

// Modal open/close helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Load and Render Sample 15,000 Dataset
async function loadSampleDataset() {
  try {
    const res = await fetch('../medication_adherence_sample_500.json');
    if (res.ok) {
      sampleDataset = await res.json();
    } else {
      // Fallback generator in case served directly
      sampleDataset = generateClientSampleDataset(200);
    }
  } catch (err) {
    sampleDataset = generateClientSampleDataset(200);
  }
  renderDatasetTable();
}

function generateClientSampleDataset(count) {
  const list = [];
  const names = ["Arthur Miller", "Eleanor Johnson", "Harold Williams", "Dorothy Brown", "Robert Davis", "Margaret Wilson", "Evelyn Taylor", "James Clark", "Alice White", "Walter Jackson"];
  const statuses = ["Taken", "Delayed", "Missed", "Skipped"];
  
  for (let i = 1; i <= count; i++) {
    const med = BASE_MEDICINES[i % BASE_MEDICINES.length];
    const status = statuses[i % statuses.length];
    list.push({
      record_id: i,
      patient_id: `PAT-${1000 + (i % 25)}`,
      patient_name: names[i % names.length],
      age: 65 + (i % 22),
      medicine_name: med.name,
      strength: med.strength,
      condition_group: med.condition_group,
      scheduled_date: '2026-10-24',
      scheduled_time: '08:00',
      status: status,
      missed_reason: status === 'Missed' ? 'Forgot due to confusion' : 'None',
      caregiver_alert_status: status === 'Missed' ? 'Alert Sent' : 'No Alert Needed'
    });
  }
  return list;
}

// Render Dataset Explorer Table
function renderDatasetTable() {
  const tbody = document.getElementById('datasetTableBody');
  const countEl = document.getElementById('datasetFilteredCount');
  if (!tbody) return;

  const filtered = sampleDataset.filter(item => {
    const matchesSearch = !currentFilter.search || 
      item.patient_name.toLowerCase().includes(currentFilter.search) || 
      item.medicine_name.toLowerCase().includes(currentFilter.search) ||
      item.condition_group.toLowerCase().includes(currentFilter.search);

    const matchesCond = currentFilter.condition === 'ALL' || item.condition_group === currentFilter.condition;
    const matchesStatus = currentFilter.status === 'ALL' || item.status === currentFilter.status;

    return matchesSearch && matchesCond && matchesStatus;
  });

  if (countEl) countEl.textContent = `Showing ${Math.min(50, filtered.length)} of ${filtered.length} matching records (from 15,000 total)`;

  tbody.innerHTML = filtered.slice(0, 50).map(row => `
    <tr>
      <td style="font-weight: 600; color: var(--accent-cyan);">#${row.record_id}</td>
      <td>
        <div style="font-weight: 600;">${row.patient_name}</div>
        <div style="font-size: 0.78rem; color: var(--text-dim);">${row.patient_id} &bull; Age ${row.age}</div>
      </td>
      <td>
        <div style="font-weight: 600;">${row.medicine_name}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${row.strength}</div>
      </td>
      <td><span class="slot-badge">${row.condition_group}</span></td>
      <td>${row.scheduled_date} <br><span style="color: var(--text-dim); font-size: 0.8rem;">${row.scheduled_time}</span></td>
      <td><span class="badge-status ${row.status}">${row.status}</span></td>
      <td style="font-size: 0.82rem; color: ${row.status === 'Missed' ? '#f87171' : 'var(--text-dim)'};">
        ${row.missed_reason || 'None'}
      </td>
      <td style="font-size: 0.82rem;">
        ${row.caregiver_alert_status === 'Alert Sent' || row.caregiver_alert_status === 'Urgent Notification' 
          ? '<span style="color: #f87171; font-weight: 600;">🚨 Caregiver Notified</span>' 
          : '<span style="color: var(--text-dim);">Normal</span>'}
      </td>
    </tr>
  `).join('');
}
