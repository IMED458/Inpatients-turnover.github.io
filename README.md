<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>პაციენტთა ბრუნვა</title>

  <script src="/_sdk/element_sdk.js"></script>

  <!-- Firebase (Compat) -->
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

    .table-container { background:white; padding:20px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); overflow-x:auto; position:relative; }
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

    .statusline { text-align:center; color:#666; font-size:12px; margin:6px 0 0 0; }
    .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.08); }
    .dot { width:10px; height:10px; border-radius:50%; background:#FF9800; }
    .ok { background:#4CAF50 !important; }
    .bad { background:#F44336 !important; }

    .overlay {
      position:absolute; inset:0; background:rgba(255,255,255,0.7);
      display:none; align-items:center; justify-content:center;
      font-weight:700; color:#2c3e50;
    }
    .overlay.show { display:flex; }

    /* Admin statistics panel */
    .admin-panel {
      max-width:1100px;
      margin: 0 auto 16px auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 16px;
      display:none;
    }
    .admin-panel-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 10px;
      flex-wrap:wrap;
      margin-bottom:12px;
    }
    .admin-panel-title {
      font-weight: 800;
      color:#2c3e50;
      font-size:16px;
    }
    .admin-panel-controls {
      display:flex;
      gap: 8px;
      flex-wrap:wrap;
      align-items:center;
    }
    .select {
      padding:10px 12px;
      border:1px solid #ddd;
      border-radius:8px;
      background:white;
      font-weight:600;
      color:#2c3e50;
      cursor:pointer;
    }
    .stats-grid {
      display:grid;
      grid-template-columns: repeat(3, minmax(180px, 1fr));
      gap: 12px;
    }
    .stat-card {
      border:1px solid #eee;
      border-radius: 10px;
      padding: 14px;
      background: #fafafa;
    }
    .stat-label { color:#666; font-size:12px; margin-bottom:6px; }
    .stat-value { font-size:28px; font-weight:800; color:#2c3e50; }
    .stat-sub { margin-top:6px; color:#888; font-size:12px; }
    .small-note { color:#777; font-size:12px; margin-top:10px; }

    @media (max-width: 700px) {
      .stats-grid { grid-template-columns: 1fr; }
    }

    @media print {
      .controls, #authView, #calendarView, .statusline, .admin-panel { display:none !important; }
      #tableView { display:block !important; }
      .page-wrapper { padding:0; background:white; }
      body { background:white; }
      .table-container { box-shadow:none; padding:0; overflow:visible; }
      .overlay { display:none !important; }
      table { border:2px solid #222; }
      th { background:#2c5f2d !important; color:#fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      td:first-child { background:#dae8fc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5) { background:#fff4e6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      td:nth-child(6) { background:#ffe6f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      td:nth-child(7) { background:#ffeb99 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .total-row td { background:#e8f5e9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .total-row td:first-child { background:#c8e6c9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .extra-fields { margin-top:16px; border:1px solid #ddd; background:#fff !important; box-shadow:none; padding:12px; page-break-inside: avoid; }
      .extra-fields textarea { height:auto; min-height:60px; border:1px solid #ccc; }
    }
  </style>
</head>

<body>
  <div class="page-wrapper">

    <!-- Login -->
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
    </div>

    <!-- Calendar -->
    <div id="calendarView" style="display:none;">
      <div class="header">
        <h1>პაციენტთა ბრუნვა</h1>
        <h2 id="calendarTitle">2025 წლის კალენდარი</h2>
      </div>
      <div class="controls">
        <button class="btn btn-nav" id="prevYearBtn" type="button">წინა წელი</button>
        <button class="btn btn-nav" id="nextYearBtn" type="button">შემდეგი წელი</button>
      </div>
      <div class="calendar-container" id="calendarContainer"></div>
    </div>

    <!-- Table -->
    <div id="tableView" style="display:none;">
      <div class="header">
        <h1>პაციენტთა ბრუნვა</h1>
        <h2>Inpatients turnover - <span id="selectedDate">--.--.--</span></h2>

        <div class="statusline">
          <span class="pill">
            <span class="dot" id="fbDot2"></span>
            <span id="fbText2">Firebase: შემოწმება...</span>
          </span>
        </div>
      </div>

      <!-- Admin statistics (visible only for admin) -->
      <div class="admin-panel" id="adminPanel">
        <div class="admin-panel-header">
          <div class="admin-panel-title">სტატისტიკა (თვე)</div>
          <div class="admin-panel-controls">
            <select class="select" id="statsMonth"></select>
            <select class="select" id="statsYear"></select>
            <button class="btn btn-nav" id="refreshStatsBtn" type="button">განახლება</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">თვეში შემოსული (Admission)</div>
            <div class="stat-value" id="statAdmission">—</div>
            <div class="stat-sub" id="statAdmissionSub">მხოლოდ: ზრდასრულთა ემერჯენსი + ბავშვთა ემერჯენსი</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">თვეში გაწერილი (Discharge)</div>
            <div class="stat-value" id="statDischarge">—</div>
            <div class="stat-sub" id="statDischargeSub">ჯამი ყველა დეპარტამენტზე</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">თვეში გარდაცვლილი (Mortality)</div>
            <div class="stat-value" id="statMortality">—</div>
            <div class="stat-sub" id="statMortalitySub">ჯამი ყველა დეპარტამენტზე</div>
          </div>
        </div>

        <div class="small-note" id="statsNote"></div>
      </div>

      <div class="controls">
        <button class="btn btn-export" id="exportBtn" type="button">Export PDF</button>
        <button class="btn btn-nav" id="prevDayBtn" type="button">წინა დღე</button>
        <button class="btn btn-nav" id="nextDayBtn" type="button">შემდეგი დღე</button>
        <button class="btn btn-calendar" id="showCalendarBtn" type="button">კალენდარი</button>
        <button class="btn btn-block" id="adminButton" type="button" style="display:none;"></button>
      </div>

      <div class="table-container">
        <div class="overlay" id="loadingOverlay">იტვირთება...</div>

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
    // Firebase
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

    function initFirebase() {
      try {
        firebase.initializeApp(firebaseConfig);
        try { if (firebase.analytics) firebase.analytics(); } catch (e) {}
        db = firebase.firestore();

        try { db.enablePersistence({ synchronizeTabs:true }).catch(() => {}); } catch (e) {}

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
    // State
    // =========================
    let selectedDate = new Date();
    let currentYear = selectedDate.getFullYear();
    let isAdmin = false;
    let isLocked = false;
    let sortDirection = {};
    let currentData = [];
    let pendingSaveTimer = null;
    let isSaving = false;

    // =========================
    // Helpers
    // =========================
    function showOverlay(on) {
      const el = document.getElementById('loadingOverlay');
      if (!el) return;
      el.classList.toggle('show', !!on);
    }

    function showToast(msg) {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style = 'position:fixed;top:20px;right:20px;background:#333;color:white;padding:15px 25px;border-radius:5px;z-index:1000;';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2200);
    }

    function setView(view) {
      document.getElementById('authView').style.display = (view === 'auth') ? 'block' : 'none';
      document.getElementById('calendarView').style.display = (view === 'calendar') ? 'block' : 'none';
      document.getElementById('tableView').style.display = (view === 'table') ? 'block' : 'none';
    }

    function formatDate(d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    }

    function getDocId(date) {
      return formatDate(date).replace(/\./g, '-');
    }

    function dateMinusOneDay(dateObj) {
      const d = new Date(dateObj.getTime());
      d.setDate(d.getDate() - 1);
      return d;
    }

    function computeFinal(row) {
      return (+row.initial||0) + (+row.admission||0) - (+row.discharge||0) - (+row.transfer||0) - (+row.mortality||0);
    }

    function canWriteNow() {
      return !isLocked || isAdmin;
    }

    function canEditCell(field) {
      if (!canWriteNow()) return false;
      if (field === 'initial' && !isAdmin) return false;
      return true;
    }

    function updateLockButton() {
      const btn = document.getElementById('adminButton');
      const panel = document.getElementById('adminPanel');

      if (!isAdmin) {
        btn.style.display = 'none';
        if (panel) panel.style.display = 'none';
        return;
      }

      btn.style.display = 'inline-block';
      btn.textContent = isLocked ? 'განბლოკვა' : 'დაბლოკვა';
      if (panel) panel.style.display = 'block';
    }

    function setTextareasDisabled() {
      const disabled = !canWriteNow();
      document.getElementById('responsiblePerson').disabled = disabled;
      document.getElementById('urgentOperations').disabled = disabled;
    }

    // =========================
    // Cache (instant load)
    // =========================
    function cacheKeyForDate(d) { return `inpatients_cache_${getDocId(d)}`; }

    function saveCacheForDate(d, payload) {
      try { localStorage.setItem(cacheKeyForDate(d), JSON.stringify(payload)); } catch(e) {}
    }

    function loadCacheForDate(d) {
      try {
        const raw = localStorage.getItem(cacheKeyForDate(d));
        return raw ? JSON.parse(raw) : null;
      } catch(e) { return null; }
    }

    function applyPayloadToUI(payload) {
      if (!payload) return;

      currentData = Array.isArray(payload.rows) ? payload.rows : [];
      currentData = currentData.map(r => ({
        dept: String(r.dept ?? ''),
        initial: +r.initial || 0,
        admission: +r.admission || 0,
        discharge: +r.discharge || 0,
        transfer: +r.transfer || 0,
        mortality: +r.mortality || 0,
        final: +r.final || 0
      }));

      isLocked = !!payload.locked;

      document.getElementById('responsiblePerson').value = payload.responsible || '';
      document.getElementById('urgentOperations').value = payload.urgent || '';

      updateLockButton();
      setTextareasDisabled();
      renderTable();
    }

    // =========================
    // Firestore I/O
    // =========================
    async function readDayDoc(dateObj) {
      const id = getDocId(dateObj);
      const snap = await db.collection('dailyData').doc(id).get();
      if (!snap.exists) return null;
      const d = snap.data() || {};
      return {
        rows: Array.isArray(d.rows) ? d.rows : [],
        responsible: d.responsible || '',
        urgent: d.urgent || '',
        locked: !!d.locked
      };
    }

    function buildDeptListFromSources(todayDoc, prevDoc) {
      if (todayDoc && Array.isArray(todayDoc.rows) && todayDoc.rows.length) {
        return todayDoc.rows.map(r => String(r.dept ?? '')).filter(Boolean);
      }
      if (prevDoc && Array.isArray(prevDoc.rows) && prevDoc.rows.length) {
        return prevDoc.rows.map(r => String(r.dept ?? '')).filter(Boolean);
      }
      return [
        "ზრდასრულთა ემერჯენსი","ქირურგია","რეანიმაცია","კარდიორეანიმაცია","ბავშვთა ემერჯენსი","ბავშვთა რეანიმაცია",
        "ნევროლოგია","ნეიროქირურგია","ნეირორეანიმაცია","თორაკოქირურგია","ტრავმატოლოგია","ანგიოქირურგია",
        "ყბა-სახის ქირურგია","უროლოგია","ბავშვთა ქირურგია","პედიატრია","ბავშვთა ონკოჰემატოლოგია","ნეფროლოგია",
        "ჰეპატოლოგია","ინფექციური","შინაგანი მედიცინა","კარდიოლოგია","ონკოჰემატოლოგია 1","ონკოჰემატოლოგია 2",
        "გინეკოლოგია","ძვლის ტვინის გადანერგვა","მამოლოგია","ოფთალმოლოგია"
      ];
    }

    function mapPrevFinal(prevDoc) {
      const m = new Map();
      if (!prevDoc || !Array.isArray(prevDoc.rows)) return m;
      prevDoc.rows.forEach(r => {
        const dept = String(r.dept ?? '');
        if (!dept) return;
        m.set(dept, (+r.final || 0));
      });
      return m;
    }

    function mapTodayRows(todayDoc) {
      const m = new Map();
      if (!todayDoc || !Array.isArray(todayDoc.rows)) return m;
      todayDoc.rows.forEach(r => {
        const dept = String(r.dept ?? '');
        if (!dept) return;
        m.set(dept, r);
      });
      return m;
    }

    function composeRowsForceInitial(depts, prevFinalMap, todayMap) {
      return depts.map(dept => {
        const saved = todayMap.get(dept) || {};
        const initial = prevFinalMap.has(dept) ? (+prevFinalMap.get(dept) || 0) : (+saved.initial || 0);

        const row = {
          dept,
          initial,
          admission: +saved.admission || 0,
          discharge: +saved.discharge || 0,
          transfer: +saved.transfer || 0,
          mortality: +saved.mortality || 0,
          final: 0
        };
        row.final = computeFinal(row);
        return row;
      });
    }

    function scheduleSave() {
      if (!db) return;
      if (pendingSaveTimer) clearTimeout(pendingSaveTimer);
      pendingSaveTimer = setTimeout(saveAllData, 300);
    }

    async function saveAllData() {
      if (!db) return;
      if (!canWriteNow()) return;
      if (isSaving) return;
      isSaving = true;

      const docId = getDocId(selectedDate);

      try {
        await db.collection('dailyData').doc(docId).set({
          rows: currentData,
          responsible: document.getElementById('responsiblePerson').value || '',
          urgent: document.getElementById('urgentOperations').value || '',
          locked: !!isLocked
        }, { merge:true });

        saveCacheForDate(selectedDate, {
          rows: currentData,
          responsible: document.getElementById('responsiblePerson').value || '',
          urgent: document.getElementById('urgentOperations').value || '',
          locked: !!isLocked
        });

      } catch (e) {
        console.warn('Save error:', e);
        showToast('შენახვა ვერ მოხერხდა');
      } finally {
        isSaving = false;
      }
    }

    // =========================
    // Load logic
    // =========================
    async function loadAllData() {
      if (!db) return;

      document.getElementById('selectedDate').textContent = formatDate(selectedDate);

      const cached = loadCacheForDate(selectedDate);
      if (cached) applyPayloadToUI(cached);
      else { currentData = []; renderTable(); }

      showOverlay(true);

      try {
        const prevDate = dateMinusOneDay(selectedDate);
        const [prevDoc, todayDoc] = await Promise.all([
          readDayDoc(prevDate),
          readDayDoc(selectedDate)
        ]);

        const depts = buildDeptListFromSources(todayDoc, prevDoc);
        const prevFinalMap = mapPrevFinal(prevDoc);
        const todayMap = mapTodayRows(todayDoc);

        const rows = composeRowsForceInitial(depts, prevFinalMap, todayMap);

        isLocked = todayDoc ? !!todayDoc.locked : false;

        document.getElementById('responsiblePerson').value = todayDoc ? (todayDoc.responsible || '') : '';
        document.getElementById('urgentOperations').value = todayDoc ? (todayDoc.urgent || '') : '';

        currentData = rows;

        updateLockButton();
        setTextareasDisabled();
        renderTable();

        if (canWriteNow()) await saveAllData();

        saveCacheForDate(selectedDate, {
          rows: currentData,
          responsible: document.getElementById('responsiblePerson').value || '',
          urgent: document.getElementById('urgentOperations').value || '',
          locked: !!isLocked
        });

        if (isAdmin) {
          const month = selectedDate.getMonth();
          const year = selectedDate.getFullYear();
          setStatsSelectors(month, year);
          await computeMonthlyStats(year, month);
        }

      } catch (e) {
        console.warn('Load error:', e);
        showToast('ჩატვირთვა ვერ მოხერხდა');
      } finally {
        showOverlay(false);
      }
    }

    // =========================
    // Render & editing
    // =========================
    function renderTable() {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';

      if (!currentData || !currentData.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="7" style="text-align:center;color:#666;padding:18px;">მონაცემები არ არის ნაჩვენები (იტვირთება...)</td>`;
        tbody.appendChild(tr);
        return;
      }

      for (let i = 0; i < currentData.length; i++) {
        const row = currentData[i];

        const clsInitial   = canEditCell('initial')   ? 'editable' : '';
        const clsAdmission = canEditCell('admission') ? 'editable' : '';
        const clsDischarge = canEditCell('discharge') ? 'editable' : '';
        const clsTransfer  = canEditCell('transfer')  ? 'editable' : '';
        const clsMortality = canEditCell('mortality') ? 'editable' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.dept}</td>
          <td class="${clsInitial}" data-index="${i}" data-field="initial">${row.initial}</td>
          <td class="${clsAdmission}" data-index="${i}" data-field="admission">${row.admission}</td>
          <td class="${clsDischarge}" data-index="${i}" data-field="discharge">${row.discharge}</td>
          <td class="${clsTransfer}" data-index="${i}" data-field="transfer">${row.transfer}</td>
          <td class="${clsMortality}" data-index="${i}" data-field="mortality">${row.mortality}</td>
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

    function setupTableEditing() {
      const tbody = document.getElementById('tableBody');

      tbody.addEventListener('click', (e) => {
        const cell = e.target.closest('td');
        if (!cell) return;
        if (!cell.classList.contains('editable')) return;

        const idx = cell.dataset.index;
        const field = cell.dataset.field;
        if (idx === undefined || !field) return;
        if (!canEditCell(field)) return;
        if (cell.querySelector('input')) return;

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

      rp.addEventListener('input', () => { if (!canWriteNow()) return; scheduleSave(); });
      uo.addEventListener('input', () => { if (!canWriteNow()) return; scheduleSave(); });
    }

    // =========================
    // Admin lock
    // =========================
    async function toggleLock() {
      if (!isAdmin) return;
      isLocked = !isLocked;
      updateLockButton();
      setTextareasDisabled();
      renderTable();
      await saveAllData();
      showToast(isLocked ? 'დღე დაიბლოკა' : 'დღე განიბლოკა');
    }

    // =========================
    // Calendar navigation
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

        const firstDay = new Date(year, m, 1).getDay();
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        let dayNum = 1;

        for (let r = 0; r < 6; r++) {
          const tr = document.createElement('tr');

          for (let c = 0; c < 7; c++) {
            const td = document.createElement('td');

            if (r === 0 && c < firstDay) td.className = 'empty';
            else if (dayNum > daysInMonth) td.className = 'empty';
            else {
              const clickedDay = dayNum;
              td.textContent = clickedDay;

              if (year === today.getFullYear() && m === today.getMonth() && clickedDay === today.getDate()) {
                td.classList.add('today');
              }

              td.addEventListener('click', () => {
                selectedDate = new Date(year, m, clickedDay);
                document.getElementById('selectedDate').textContent = formatDate(selectedDate);
                setView('table');
                loadAllData();
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

    function prevDay() {
      selectedDate.setDate(selectedDate.getDate() - 1);
      document.getElementById('selectedDate').textContent = formatDate(selectedDate);
      loadAllData();
    }

    function nextDay() {
      selectedDate.setDate(selectedDate.getDate() + 1);
      document.getElementById('selectedDate').textContent = formatDate(selectedDate);
      loadAllData();
    }

    function exportPDF() { window.print(); }

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
      scheduleSave();
    }

    // =========================
    // Admin monthly statistics
    // =========================
    const monthNames = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];

    // Departments for admission-only stats
    const ADMISSION_DEPTS_ONLY = new Set(["ზრდასრულთა ემერჯენსი", "ბავშვთა ემერჯენსი"]);

    function setStatsSelectors(monthIndex, yearVal) {
      const monthSel = document.getElementById('statsMonth');
      const yearSel = document.getElementById('statsYear');
      if (!monthSel || !yearSel) return;

      if (!monthSel.options.length) {
        monthNames.forEach((m, i) => {
          const opt = document.createElement('option');
          opt.value = String(i);
          opt.textContent = m;
          monthSel.appendChild(opt);
        });
      }

      if (!yearSel.options.length) {
        const base = new Date().getFullYear();
        for (let y = base - 3; y <= base + 3; y++) {
          const opt = document.createElement('option');
          opt.value = String(y);
          opt.textContent = String(y);
          yearSel.appendChild(opt);
        }
      }

      monthSel.value = String(monthIndex);
      yearSel.value = String(yearVal);
    }

    function setStatsLoading(on) {
      const a = document.getElementById('statAdmission');
      const d = document.getElementById('statDischarge');
      const m = document.getElementById('statMortality');
      if (!a || !d || !m) return;
      if (on) { a.textContent = '...'; d.textContent = '...'; m.textContent = '...'; }
    }

    async function computeMonthlyStats(year, monthIndex) {
      if (!db) return;
      setStatsLoading(true);

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      let totalAdmission = 0;  // ONLY 2 depts
      let totalDischarge = 0;  // ALL depts
      let totalMortality = 0;  // ALL depts

      const ids = [];
      for (let day = 1; day <= daysInMonth; day++) {
        ids.push(getDocId(new Date(year, monthIndex, day)));
      }

      const batchSize = 10;
      for (let i = 0; i < ids.length; i += batchSize) {
        const chunk = ids.slice(i, i + batchSize);
        const snaps = await Promise.all(
          chunk.map(id => db.collection('dailyData').doc(id).get().catch(() => null))
        );

        snaps.forEach(snap => {
          if (!snap || !snap.exists) return;
          const data = snap.data() || {};
          const rows = Array.isArray(data.rows) ? data.rows : [];

          for (const r of rows) {
            const dept = String(r.dept || '');
            // admission: ONLY ER depts
            if (ADMISSION_DEPTS_ONLY.has(dept)) {
              totalAdmission += (+r.admission || 0);
            }
            // discharge + mortality: ALL depts
            totalDischarge += (+r.discharge || 0);
            totalMortality += (+r.mortality || 0);
          }
        });
      }

      document.getElementById('statAdmission').textContent = String(totalAdmission);
      document.getElementById('statDischarge').textContent = String(totalDischarge);
      document.getElementById('statMortality').textContent = String(totalMortality);

      const note = document.getElementById('statsNote');
      if (note) {
        note.textContent =
          `სტატისტიკა: ${monthNames[monthIndex]} ${year} — Admission ითვლის მხოლოდ: ზრდასრულთა ემერჯენსი + ბავშვთა ემერჯენსი; Discharge/Mortality ითვლის ყველა დეპარტამენტზე.`;
      }
    }

    // =========================
    // Auth (password gate only)
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
    // UI wiring
    // =========================
    function setupUI() {
      initFirebase();

      document.getElementById('loginBtn').addEventListener('click', checkPassword);
      document.getElementById('password').addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPassword(); });

      document.getElementById('prevYearBtn').addEventListener('click', () => { currentYear--; renderCalendar(currentYear); });
      document.getElementById('nextYearBtn').addEventListener('click', () => { currentYear++; renderCalendar(currentYear); });

      document.getElementById('exportBtn').addEventListener('click', () => window.print());
      document.getElementById('prevDayBtn').addEventListener('click', prevDay);
      document.getElementById('nextDayBtn').addEventListener('click', nextDay);
      document.getElementById('showCalendarBtn').addEventListener('click', () => { setView('calendar'); renderCalendar(currentYear); });

      document.getElementById('adminButton').addEventListener('click', toggleLock);

      document.querySelectorAll('#dataTable thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(parseInt(th.dataset.col, 10)));
      });

      // Admin stats events
      const monthSel = document.getElementById('statsMonth');
      const yearSel = document.getElementById('statsYear');
      const refreshBtn = document.getElementById('refreshStatsBtn');

      if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
          if (!isAdmin) return;
          await computeMonthlyStats(parseInt(yearSel.value, 10), parseInt(monthSel.value, 10));
        });
      }
      if (monthSel) {
        monthSel.addEventListener('change', async () => {
          if (!isAdmin) return;
          await computeMonthlyStats(parseInt(yearSel.value, 10), parseInt(monthSel.value, 10));
        });
      }
      if (yearSel) {
        yearSel.addEventListener('change', async () => {
          if (!isAdmin) return;
          await computeMonthlyStats(parseInt(yearSel.value, 10), parseInt(monthSel.value, 10));
        });
      }

      setupTableEditing();
      setupExtraFields();

      setView('auth');
    }

    window.addEventListener('load', setupUI);
  </script>
</body>
</html>
