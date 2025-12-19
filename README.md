<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inpatient Calendar - 2025</title>

  <script src="/_sdk/element_sdk.js"></script>

  <!-- ✅ Firebase (Compat) — მუშაობს პირდაპირ <script> გარემოში, module/import-ის გარეშე -->
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics-compat.js"></script>

  <style>
    body { margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f5f5f5; }
    .page-wrapper { padding:20px; min-height:100vh; }
    .header { text-align:center; margin-bottom:16px; }
    .header h1 { font-size:24px; color:#2c3e50; margin:0; }
    .header h2 { font-size:18px; color:#34495e; margin:6px 0 0 0; }

    .controls { text-align:center; margin:16px 0; display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    .btn { padding:10px 20px; border:none; border-radius:5px; cursor:pointer; font-weight:bold; color:white; }
    .btn-export { background:#2196F3; }
    .btn-nav { background:#4CAF50; }
    .btn-calendar { background:#FF9800; }
    .btn-block { background:#F44336; }
    .btn:hover { opacity:0.9; }

    .table-container { background:white; padding:20px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); overflow-x:auto; }
    table { width:100%; border-collapse:collapse; border:3px solid #2c5f2d; }
    th { background:#2c5f2d; color:white; padding:12px 8px; text-align:center; cursor:pointer; user-select:none; }
    td { padding:8px; border:1px solid #d0d0d0; text-align:center; }
    td:first-child { background:#dae8fc; text-align:left; padding-left:12px; font-weight:500; }
    td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5) { background:#fff4e6; }
    td:nth-child(6) { background:#ffe6f0; }
    td:nth-child(7) { background:#ffeb99; font-weight:bold; }

    .total-row td { background:#e8f5e9 !important; font-weight:bold; }
    .total-row td:first-child { background:#c8e6c9 !important; }

    .editable { cursor:pointer; }
    .editable:hover { outline:2px solid #4CAF50; outline-offset:-2px; }
    .editable input { width:100%; border:2px solid #4CAF50; padding:4px; text-align:center; box-sizing:border-box; }

    .calendar-container { display:flex; flex-wrap:wrap; gap:20px; justify-content:center; }
    .month { background:white; padding:15px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); width:300px; }
    .month h3 { text-align:center; margin:0 0 10px 0; }
    .month table { width:100%; border-collapse:collapse; border:2px solid #3498db; }
    .month th { background:#3498db; color:white; padding:6px; cursor:default; }
    .month td { padding:8px; border:1px solid #ddd; cursor:pointer; text-align:center; }
    .month td.empty { background:#f5f5f5; cursor:default; }
    .today { background:red !important; color:white; font-weight:bold; }

    #authView { max-width:500px; margin:50px auto; text-align:center; background:white; padding:40px; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.15); }
    #logo { max-width:300px; margin-bottom:20px; }
    input[type="password"] { width:100%; padding:12px; margin:15px 0; border:1px solid #ddd; border-radius:4px; font-size:16px; box-sizing:border-box; }

    .extra-fields { margin-top:20px; padding:20px; background:#f9f9f9; border-radius:8px; }
    .extra-fields textarea { width:100%; height:80px; padding:10px; border:1px solid #ddd; border-radius:4px; resize:vertical; box-sizing:border-box; }

    /* ✅ Firebase connection badge */
    .statusline { text-align:center; color:#666; font-size:12px; margin:6px 0 0 0; }
    .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.08); }
    .dot { width:10px; height:10px; border-radius:50%; background:#FF9800; } /* default loading */
    .ok { background:#4CAF50 !important; }
    .bad { background:#F44336 !important; }

    @media print {
      .controls, .extra-fields, #authView, #calendarView, .statusline { display:none !important; }
      #tableView { display:block !important; }
      .table-container { box-shadow:none; padding:0; }
      .page-wrapper { padding:0; }
    }
  </style>
</head>

<body>
  <div class="page-wrapper">

    <!-- პაროლის შესვლა + ლოგო -->
    <div id="authView">
      <img src="tm_center_logo.png" alt="TM Center Logo" id="logo">
      <h2>შესვლა</h2>
      <input type="password" id="password" placeholder="პაროლი">
      <button class="btn btn-nav" id="loginBtn" type="button">შესვლა</button>

      <div class="statusline" style="margin-top:14px;">
        <span class="pill">
          <span class="dot" id="fbDot"></span>
          <span id="fbText">Firebase: შემოწმება...</span>
        </span>
      </div>

      <p style="color:#666;font-size:13px;margin-top:14px;">
        User: <b>htmc</b> • Admin: <b>admin1</b>
      </p>
    </div>

    <!-- კალენდარი -->
    <div id="calendarView" style="display:none;">
      <div class="header">
        <h1>ინფექციურ-კლინიკური დეპარტამენტი</h1>
        <h2 id="calendarTitle">2025 წლის კალენდარი</h2>
      </div>
      <div class="controls">
        <button class="btn btn-nav" id="prevYearBtn" type="button">წინა წელი</button>
        <button class="btn btn-nav" id="nextYearBtn" type="button">შემდეგი წელი</button>
      </div>
      <div class="calendar-container" id="calendarContainer"></div>
    </div>

    <!-- ცხრილი -->
    <div id="tableView" style="display:none;">
      <div class="header">
        <h1>ინფექციურ-კლინიკური დეპარტამენტი</h1>
        <h2>Inpatients turnover - <span id="selectedDate">--.--.--</span></h2>
        <div class="statusline">
          <span class="pill">
            <span class="dot" id="fbDot2"></span>
            <span id="fbText2">Firebase: შემოწმება...</span>
          </span>
        </div>
      </div>

      <div class="controls">
        <button class="btn btn-export" id="exportBtn" type="button">Export PDF</button>
        <button class="btn btn-nav" id="prevDayBtn" type="button">წინა დღე</button>
        <button class="btn btn-nav" id="nextDayBtn" type="button">შემდეგი დღე</button>
        <button class="btn btn-calendar" id="showCalendarBtn" type="button">კალენდარი</button>
        <button class="btn btn-block" id="adminButton" type="button" style="display:none;"></button>
      </div>

      <div class="table-container">
        <table id="dataTable">
          <thead>
            <tr>
              <th data-col="0">დეპარტამენტი</th>
              <th data-col="1">საწყისი</th>
              <th data-col="2">შემოსვლა</th>
              <th data-col="3">გაწერა</th>
              <th data-col="4">გადასვლა</th>
              <th data-col="5">ლეტალობა</th>
              <th data-col="6">საბოლოო</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>

      <div class="extra-fields">
        <label><strong>პასუხისმგებელი მორიგე:</strong></label><br>
        <textarea id="responsiblePerson"></textarea><br><br>
        <label><strong>ურგენტული ოპერაციები:</strong></label><br>
        <textarea id="urgentOperations"></textarea>
      </div>
    </div>
  </div>

  <script>
    // =========================
    // ✅ Firebase config (შენი მონაცემებით)
    // =========================
    const firebaseConfig = {
      apiKey: "AIzaSyDJv8Jn4eJhpj2k1STTtzv6RAnU4pa1crg",
      authDomain: "inpatients-turnover.firebaseapp.com",
      projectId: "inpatients-turnover",
      storageBucket: "inpatients-turnover.firebasestorage.app",
      messagingSenderId: "1064730454016",
      appId: "1:1064730454016:web:dc3d23a938b100e3c150e5",
      measurementId: "G-52MZWTGQ69"
    };

    let db = null;

    function setFbStatus(ok, text) {
      const dot1 = document.getElementById('fbDot');
      const txt1 = document.getElementById('fbText');
      const dot2 = document.getElementById('fbDot2');
      const txt2 = document.getElementById('fbText2');

      if (dot1) { dot1.classList.remove('ok','bad'); dot1.classList.add(ok ? 'ok' : 'bad'); }
      if (txt1) txt1.textContent = text;

      if (dot2) { dot2.classList.remove('ok','bad'); dot2.classList.add(ok ? 'ok' : 'bad'); }
      if (txt2) txt2.textContent = text;
    }

    // Firebase init + quick connectivity check
    function initFirebase() {
      try {
        firebase.initializeApp(firebaseConfig);

        // analytics optional (თუ არ იმუშავებს, არ ვაჩერებთ საიტს)
        try {
          if (firebase.analytics) firebase.analytics();
        } catch (e) {}

        db = firebase.firestore();

        // ✅ Firestore local cache -> სწრაფი გახდება მეორე გახსნიდან და ოფლაინშიც ნახავს
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
        } catch (e) {}

        // ✅ Fast "connected?" indicator:
        // Firestore SDK შეიძლება init-ზე OK იყოს, მაგრამ rules/ქსელი მაინც აჭედავდეს.
        // ამიტომ ვაკეთებთ ერთ "ping" read-ს.
        setFbStatus(false, "Firebase: შემოწმება...");
        db.collection('_meta').doc('ping').get()
          .then(() => setFbStatus(true, "Firebase: დაკავშირებულია ✓"))
          .catch((err) => {
            console.warn("Firebase ping error:", err);
            setFbStatus(false, "Firebase: ვერ დაუკავშირდა ✗");
          });

      } catch (e) {
        console.warn("Firebase init error:", e);
        db = null;
        setFbStatus(false, "Firebase: ვერ დაუკავშირდა ✗");
      }
    }

    // =========================
    // Default rows (მაშინვე გამოსაჩენად)
    // =========================
    const defaultData = [
      {dept:"ზრდასრულთა ემერჯენსი", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ქირურგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"რეანიმაცია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"კარდიორეანიმაცია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ბავშვთა ემერჯენსი", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ბავშვთა რეანიმაცია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ნევროლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ნეიროქირურგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ნეირორეანიმაცია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"თორაკოქირურგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ტრავმატოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ანგიოქირურგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ყბა-სახის ქირურგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"უროლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ბავშვთა ქირურგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"პედიატრია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ბავშვთა ონკოჰემატოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ნეფროლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ჰეპატოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ინფექციური", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"შინაგანი მედიცინა", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"კარდიოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ონკოჰემატოლოგია 1", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ონკოჰემატოლოგია 2", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"გინეკოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ძვლის ტვინის გადანერგვა", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"მამოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0},
      {dept:"ოფთალმოლოგია", initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0}
    ];

    // =========================
    // State
    // =========================
    let currentData = [];
    let selectedDate = new Date(2025, 11, 19);
    let currentYear = 2025;

    let isAdmin = false;
    let isLocked = false;

    let sortDirection = {};
    let pendingSaveTimer = null;
    let isSaving = false;

    // =========================
    // Helpers
    // =========================
    function deepClone(x) { return JSON.parse(JSON.stringify(x)); }

    function formatDate(d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    }

    function getDocId(date) { return formatDate(date).replace(/\./g, '-'); } // dd-mm-yy

    function computeFinal(row) {
      const initial = +row.initial || 0;
      const admission = +row.admission || 0;
      const discharge = +row.discharge || 0;
      const transfer = +row.transfer || 0;
      const mortality = +row.mortality || 0;
      return initial + admission - discharge - transfer - mortality;
    }

    function canEdit() { return isAdmin || !isLocked; }

    function setView(view) {
      document.getElementById('authView').style.display = (view === 'auth') ? 'block' : 'none';
      document.getElementById('calendarView').style.display = (view === 'calendar') ? 'block' : 'none';
      document.getElementById('tableView').style.display = (view === 'table') ? 'block' : 'none';
    }

    function showToast(msg) {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style = 'position:fixed;top:20px;right:20px;background:#333;color:white;padding:15px 25px;border-radius:5px;z-index:1000;';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    }

    // =========================
    // FAST LOAD: show default immediately (instant), then overwrite from Firestore
    // =========================
    function showInstantDefaultTable() {
      currentData = deepClone(defaultData).map(r => {
        r.final = computeFinal(r);
        return r;
      });

      // conservative defaults before real doc
      isLocked = false;
      updateLockButton();

      document.getElementById('selectedDate').textContent = formatDate(selectedDate);

      const rp = document.getElementById('responsiblePerson');
      const uo = document.getElementById('urgentOperations');
      rp.value = '';
      uo.value = '';
      rp.disabled = false;
      uo.disabled = false;

      renderTable();
    }

    async function loadAllData() {
      // 1) instant default (no wait)
      showInstantDefaultTable();

      // 2) no firebase -> stop
      if (!db) return;

      const docId = getDocId(selectedDate);

      try {
        const doc = await db.collection('dailyData').doc(docId).get();

        if (!doc.exists) {
          // keep default
          isLocked = false;
          updateLockButton();
          return;
        }

        const d = doc.data() || {};
        const rows = Array.isArray(d.rows) ? d.rows : deepClone(defaultData);

        currentData = rows.map(r => {
          const row = {
            dept: r.dept ?? '',
            initial: +r.initial || 0,
            admission: +r.admission || 0,
            discharge: +r.discharge || 0,
            transfer: +r.transfer || 0,
            mortality: +r.mortality || 0,
            final: 0
          };
          row.final = computeFinal(row);
          return row;
        });

        isLocked = !!d.locked;

        document.getElementById('responsiblePerson').value = d.responsible || '';
        document.getElementById('urgentOperations').value = d.urgent || '';

        const disabled = isLocked && !isAdmin;
        document.getElementById('responsiblePerson').disabled = disabled;
        document.getElementById('urgentOperations').disabled = disabled;

        updateLockButton();
        renderTable();
      } catch (e) {
        console.warn('Load error:', e);
      }
    }

    function scheduleSave() {
      if (!db) return;
      if (!canEdit()) return;
      if (pendingSaveTimer) clearTimeout(pendingSaveTimer);
      pendingSaveTimer = setTimeout(saveAllData, 300);
    }

    async function saveAllData() {
      if (!db) return;
      if (!canEdit()) return;
      if (isSaving) return;

      isSaving = true;
      const docId = getDocId(selectedDate);

      try {
        await db.collection('dailyData').doc(docId).set({
          rows: currentData,
          responsible: document.getElementById('responsiblePerson').value || '',
          urgent: document.getElementById('urgentOperations').value || '',
          locked: isLocked
        }, { merge:true });

        showToast('შენახულია ✓');
      } catch (e) {
        console.warn('Save error:', e);
        showToast('შენახვა ვერ მოხერხდა');
      } finally {
        isSaving = false;
      }
    }

    // =========================
    // Render table
    // =========================
    function renderTable() {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';

      const editableClass = canEdit() ? 'editable' : '';

      for (let i = 0; i < currentData.length; i++) {
        const row = currentData[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.dept}</td>
          <td class="${editableClass}" data-index="${i}" data-field="initial">${row.initial}</td>
          <td class="${editableClass}" data-index="${i}" data-field="admission">${row.admission}</td>
          <td class="${editableClass}" data-index="${i}" data-field="discharge">${row.discharge}</td>
          <td class="${editableClass}" data-index="${i}" data-field="transfer">${row.transfer}</td>
          <td class="${editableClass}" data-index="${i}" data-field="mortality">${row.mortality}</td>
          <td>${row.final}</td>
        `;
        tbody.appendChild(tr);
      }

      const totals = currentData.reduce((acc, r) => {
        acc.initial += +r.initial || 0;
        acc.admission += +r.admission || 0;
        acc.discharge += +r.discharge || 0;
        acc.transfer += +r.transfer || 0;
        acc.mortality += +r.mortality || 0;
        acc.final += +r.final || 0;
        return acc;
      }, {initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0});

      const totalRow = document.createElement('tr');
      totalRow.className = 'total-row';
      totalRow.innerHTML = `
        <td>სულ</td>
        <td>${totals.initial}</td>
        <td>${totals.admission}</td>
        <td>${totals.discharge}</td>
        <td>${totals.transfer}</td>
        <td>${totals.mortality}</td>
        <td>${totals.final}</td>
      `;
      tbody.appendChild(totalRow);
    }

    // =========================
    // Editing (event delegation)
    // =========================
    function setupTableEditing() {
      const tbody = document.getElementById('tableBody');

      tbody.addEventListener('click', (e) => {
        const cell = e.target.closest('td');
        if (!cell) return;
        if (!cell.classList.contains('editable')) return;
        if (!canEdit()) return;
        if (cell.querySelector('input')) return;

        const idx = cell.dataset.index;
        const field = cell.dataset.field;
        if (idx === undefined || !field) return;

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = (cell.textContent || '0').trim();

        cell.textContent = '';
        cell.appendChild(input);
        input.focus();
        input.select();

        const commit = () => {
          const val = Math.max(0, parseInt(input.value, 10) || 0);
          currentData[idx][field] = val;
          currentData[idx].final = computeFinal(currentData[idx]);
          renderTable();
          scheduleSave();
        };

        input.addEventListener('blur', commit, { once:true });
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
          if (ev.key === 'Escape') { renderTable(); }
        });
      });
    }

    function setupExtraFields() {
      const rp = document.getElementById('responsiblePerson');
      const uo = document.getElementById('urgentOperations');
      rp.addEventListener('input', () => { if (canEdit()) scheduleSave(); });
      uo.addEventListener('input', () => { if (canEdit()) scheduleSave(); });
    }

    // =========================
    // Admin lock
    // =========================
    function updateLockButton() {
      const btn = document.getElementById('adminButton');
      if (!isAdmin) { btn.style.display = 'none'; return; }
      btn.style.display = 'inline-block';
      btn.textContent = isLocked ? 'განბლოკვა' : 'დაბლოკვა';
    }

    function toggleLock() {
      if (!isAdmin) return;

      isLocked = !isLocked;
      updateLockButton();
      renderTable();

      const disabled = isLocked && !isAdmin;
      document.getElementById('responsiblePerson').disabled = disabled;
      document.getElementById('urgentOperations').disabled = disabled;

      saveAllData();
    }

    // =========================
    // Auth
    // =========================
    function checkPassword() {
      const pass = (document.getElementById('password').value || '').trim();
      isAdmin = (pass === 'admin1');

      if (pass === 'htmc' || isAdmin) {
        setView('calendar');
        currentYear = selectedDate.getFullYear();
        renderCalendar(currentYear);
        showToast(isAdmin ? 'ადმინი ✓' : 'შესვლა ✓');
      } else {
        alert('არასწორი პაროლი');
      }
    }

    // =========================
    // Calendar
    // =========================
    function renderCalendar(year) {
      document.getElementById('calendarTitle').textContent = `${year} წლის კალენდარი`;
      const container = document.getElementById('calendarContainer');
      container.innerHTML = '';

      const months = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
      const today = new Date();

      for (let m = 0; m < 12; m++) {
        const div = document.createElement('div');
        div.className = 'month';
        div.innerHTML = `<h3>${months[m]} ${year}</h3>`;

        const table = document.createElement('table');

        const headRow = document.createElement('tr');
        ['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ'].forEach(d => {
          const th = document.createElement('th');
          th.textContent = d;
          headRow.appendChild(th);
        });

        const thead = document.createElement('thead');
        thead.appendChild(headRow);
        const tbody = document.createElement('tbody');

        const firstDay = new Date(year, m, 1).getDay(); // 0..6
        const daysInMonth = new Date(year, m + 1, 0).getDate();

        let dayNum = 1;

        for (let r = 0; r < 6; r++) {
          const tr = document.createElement('tr');

          for (let c = 0; c < 7; c++) {
            const td = document.createElement('td');

            if (r === 0 && c < firstDay) {
              td.className = 'empty';
            } else if (dayNum > daysInMonth) {
              td.className = 'empty';
            } else {
              const clickedDay = dayNum; // closure fix
              td.textContent = clickedDay;

              if (year === today.getFullYear() && m === today.getMonth() && clickedDay === today.getDate()) {
                td.classList.add('today');
              }

              td.addEventListener('click', () => {
                selectedDate = new Date(year, m, clickedDay);
                setView('table');
                loadAllData(); // instant default -> then fetch
              });

              dayNum++;
            }
            tr.appendChild(td);
          }

          tbody.appendChild(tr);
          if (dayNum > daysInMonth) break;
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        div.appendChild(table);
        container.appendChild(div);
      }
    }

    function showCalendar() { setView('calendar'); renderCalendar(currentYear); }
    function prevYear() { currentYear--; renderCalendar(currentYear); }
    function nextYear() { currentYear++; renderCalendar(currentYear); }

    function prevDay() { selectedDate.setDate(selectedDate.getDate() - 1); loadAllData(); }
    function nextDay() { selectedDate.setDate(selectedDate.getDate() + 1); loadAllData(); }

    function exportPDF() { window.print(); }

    // =========================
    // Sorting
    // =========================
    function sortTable(col) {
      sortDirection[col] = (sortDirection[col] === 'asc') ? 'desc' : 'asc';
      const dir = sortDirection[col];

      currentData.sort((a, b) => {
        let A, B;
        if (col === 0) { A = (a.dept || '').toLowerCase(); B = (b.dept || '').toLowerCase(); }
        if (col === 1) { A = +a.initial || 0; B = +b.initial || 0; }
        if (col === 2) { A = +a.admission || 0; B = +b.admission || 0; }
        if (col === 3) { A = +a.discharge || 0; B = +b.discharge || 0; }
        if (col === 4) { A = +a.transfer || 0; B = +b.transfer || 0; }
        if (col === 5) { A = +a.mortality || 0; B = +b.mortality || 0; }
        if (col === 6) { A = +a.final || 0; B = +b.final || 0; }
        if (A === B) return 0;
        return (dir === 'asc') ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
      });

      renderTable();
    }

    // =========================
    // UI wiring
    // =========================
    function setupUI() {
      initFirebase(); // ✅ start connection test immediately

      document.getElementById('loginBtn').addEventListener('click', checkPassword);
      document.getElementById('password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkPassword();
      });

      document.getElementById('prevYearBtn').addEventListener('click', prevYear);
      document.getElementById('nextYearBtn').addEventListener('click', nextYear);

      document.getElementById('exportBtn').addEventListener('click', exportPDF);
      document.getElementById('prevDayBtn').addEventListener('click', prevDay);
      document.getElementById('nextDayBtn').addEventListener('click', nextDay);
      document.getElementById('showCalendarBtn').addEventListener('click', showCalendar);

      document.getElementById('adminButton').addEventListener('click', toggleLock);

      document.querySelectorAll('#dataTable thead th').forEach(th => {
        th.addEventListener('click', () => {
          const col = parseInt(th.dataset.col, 10);
          sortTable(col);
        });
      });

      setupTableEditing();
      setupExtraFields();

      setView('auth');
    }

    window.addEventListener('load', setupUI);
  </script>
</body>
</html>
