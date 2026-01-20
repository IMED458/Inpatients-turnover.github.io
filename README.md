<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>პაციენტთა ბრუნვა</title>
  <link rel="icon" type="image/png" href="tm_center_logo12.png">
  <script src="/_sdk/element_sdk.js"></script>
  <!-- Firebase (Compat) -->
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics-compat.js"></script>
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: #f5f5f5; 
    }
    .page-wrapper { 
      padding: 20px; 
      min-height: 100vh; 
    }
    .header { 
      text-align: center; 
      margin-bottom: 16px; 
    }
    .header h1 { 
      font-size: 24px; 
      color: #2c3e50; 
      margin: 0; 
    }
    .header h2 { 
      font-size: 18px; 
      color: #34495e; 
      margin: 6px 0 0 0; 
    }
    .controls { 
      text-align: center; 
      margin: 16px 0; 
      display: flex; 
      gap: 10px; 
      justify-content: center; 
      flex-wrap: wrap; 
    }
    .btn { 
      padding: 10px 20px; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer; 
      font-weight: bold; 
      color: white; 
    }
    .btn-export { background: #2196F3; }
    .btn-nav { background: #4CAF50; }
    .btn-calendar { background: #FF9800; }
    .btn-block { background: #F44336; }
    .btn:hover { opacity: 0.9; }
    
    .table-container { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      overflow-x: auto; 
      position: relative; 
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      border: 3px solid #2c5f2d; 
    }
    th { 
      background: #2c5f2d; 
      color: white; 
      padding: 12px 8px; 
      text-align: center; 
      cursor: default; 
      user-select: none; 
    }
    td { 
      padding: 8px; 
      border: 1px solid #d0d0d0; 
      text-align: center; 
    }
    td:first-child { 
      background: #dae8fc; 
      text-align: left; 
      padding-left: 12px; 
      font-weight: 500; 
    }
    td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5) { 
      background: #fff4e6; 
    }
    td:nth-child(6) { 
      background: #ffe6f0; 
    }
    td:nth-child(7) { 
      background: #ffeb99; 
      font-weight: bold; 
    }
    .total-row td { 
      background: #e8f5e9 !important; 
      font-weight: bold; 
    }
    .total-row td:first-child { 
      background: #c8e6c9 !important; 
    }
    
    .editable { 
      cursor: pointer; 
    }
    .editable:hover { 
      outline: 2px solid #4CAF50; 
      outline-offset: -2px; 
    }
    .editable input { 
      width: 100%; 
      border: 2px solid #4CAF50; 
      padding: 4px; 
      text-align: center; 
      box-sizing: border-box; 
    }
    
    .calendar-container { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 20px; 
      justify-content: center; 
    }
    .month { 
      background: white; 
      padding: 15px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      width: 300px; 
    }
    .month h3 { 
      text-align: center; 
      margin: 0 0 10px 0; 
    }
    .month table { 
      width: 100%; 
      border-collapse: collapse; 
      border: 2px solid #3498db; 
    }
    .month th { 
      background: #3498db; 
      color: white; 
      padding: 6px; 
      cursor: default; 
    }
    .month td { 
      padding: 8px; 
      border: 1px solid #ddd; 
      cursor: pointer; 
      text-align: center; 
    }
    .month td.empty { 
      background: #f5f5f5; 
      cursor: default; 
    }
    .today { 
      background: red !important; 
      color: white; 
      font-weight: bold; 
    }
    
    #authView { 
      max-width: 500px; 
      margin: 50px auto; 
      text-align: center; 
      background: white; 
      padding: 40px; 
      border-radius: 8px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
    }
    #logo { 
      max-width: 300px; 
      margin-bottom: 20px; 
    }
    input[type="password"] { 
      width: 100%; 
      padding: 12px; 
      margin: 15px 0; 
      border: 1px solid #ddd; 
      border-radius: 4px; 
      font-size: 16px; 
      box-sizing: border-box; 
    }
    
    .extra-fields { 
      margin-top: 20px; 
      padding: 20px; 
      background: #f9f9f9; 
      border-radius: 8px; 
    }
    .extra-fields textarea { 
      width: 100%; 
      height: 80px; 
      padding: 10px; 
      border: 1px solid #ddd; 
      border-radius: 4px; 
      resize: vertical; 
      box-sizing: border-box; 
    }
    
    .statusline { 
      text-align: center; 
      color: #666; 
      font-size: 12px; 
      margin: 6px 0 0 0; 
    }
    .pill { 
      display: inline-flex; 
      align-items: center; 
      gap: 8px; 
      padding: 6px 10px; 
      border-radius: 999px; 
      background: #fff; 
      box-shadow: 0 1px 2px rgba(0,0,0,0.08); 
    }
    .dot { 
      width: 10px; 
      height: 10px; 
      border-radius: 50%; 
      background: #FF9800; 
    }
    .ok { background: #4CAF50 !important; }
    .bad { background: #F44336 !important; }
    
    .overlay {
      position: absolute; 
      inset: 0; 
      background: rgba(255,255,255,0.7);
      display: none; 
      align-items: center; 
      justify-content: center;
      font-weight: 700; 
      color: #2c3e50;
    }
    .overlay.show { display: flex; }
    
    .admin-panel {
      max-width: 1100px;
      margin: 0 auto 16px auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 16px;
      display: none;
    }
    .admin-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .admin-panel-title {
      font-weight: 800;
      color: #2c3e50;
      font-size: 16px;
    }
    .admin-panel-controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .select {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-weight: 600;
      color: #2c3e50;
      cursor: pointer;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(180px, 1fr));
      gap: 12px;
    }
    .stat-card {
      border: 1px solid #eee;
      border-radius: 10px;
      padding: 14px;
      background: #fafafa;
    }
    .stat-label { 
      color: #666; 
      font-size: 12px; 
      margin-bottom: 6px; 
    }
    .stat-value { 
      font-size: 28px; 
      font-weight: 800; 
      color: #2c3e50; 
    }
    .stat-sub { 
      margin-top: 6px; 
      color: #888; 
      font-size: 12px; 
    }
    .small-note { 
      color: #777; 
      font-size: 12px; 
      margin-top: 10px; 
    }
    .save-indicator { 
      margin-top: 8px; 
      font-size: 12px; 
      color: #666; 
      text-align: center; 
    }
    .save-indicator strong { 
      color: #2c3e50; 
    }
    
    @media (max-width: 700px) { 
      .stats-grid { 
        grid-template-columns: 1fr; 
      } 
    }
    
    @media print {
      .controls, #authView, #calendarView, .statusline, .admin-panel, .save-indicator { 
        display: none !important; 
      }
      #tableView { 
        display: block !important; 
      }
      .page-wrapper { 
        padding: 0; 
        background: white; 
      }
      body { 
        background: white; 
      }
      .table-container { 
        box-shadow: none; 
        padding: 0; 
        overflow: visible; 
      }
      .overlay { 
        display: none !important; 
      }
      table { 
        border: 2px solid #222; 
      }
      th { 
        background: #2c5f2d !important; 
        color: #fff !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      td:first-child { 
        background: #dae8fc !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5) { 
        background: #fff4e6 !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      td:nth-child(6) { 
        background: #ffe6f0 !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      td:nth-child(7) { 
        background: #ffeb99 !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      .total-row td { 
        background: #e8f5e9 !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      .total-row td:first-child { 
        background: #c8e6c9 !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      .extra-fields { 
        margin-top: 16px; 
        border: 1px solid #ddd; 
        background: #fff !important; 
        box-shadow: none; 
        padding: 12px; 
        page-break-inside: avoid; 
      }
      .extra-fields textarea { 
        height: auto; 
        min-height: 60px; 
        border: 1px solid #ccc; 
      }
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    <!-- ========== LOGIN VIEW ========== -->
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

    <!-- ========== CALENDAR VIEW ========== -->
    <div id="calendarView" style="display:none;">
      <div class="header">
        <h1>პაციენტთა ბრუნვა</h1>
        <h2 id="calendarTitle">2026 წლის კალენდარი</h2>
      </div>
      <div class="controls">
        <button class="btn btn-nav" id="prevYearBtn" type="button">წინა წელი</button>
        <button class="btn btn-nav" id="nextYearBtn" type="button">შემდეგი წელი</button>
      </div>
      <div class="calendar-container" id="calendarContainer"></div>
    </div>

    <!-- ========== TABLE VIEW ========== -->
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
        <div class="save-indicator" id="saveIndicator">შენახვა: <strong>—</strong></div>
      </div>

      <!-- Admin statistics panel -->
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
            <div class="stat-sub">მხოლოდ: ზრდასრულთა ემერჯენსი + ბავშვთა ემერჯენსი</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">თვეში გაწერილი (Discharge)</div>
            <div class="stat-value" id="statDischarge">—</div>
            <div class="stat-sub">ჯამი ყველა დეპარტამენტზე</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">თვეში გარდაცვლილი (Mortality)</div>
            <div class="stat-value" id="statMortality">—</div>
            <div class="stat-sub">ჯამი ყველა დეპარტამენტზე</div>
          </div>
        </div>
        <div class="small-note" id="statsNote"></div>
      </div>

      <!-- Control buttons -->
      <div class="controls">
        <button class="btn btn-export" id="exportBtn" type="button">Export PDF</button>
        <button class="btn btn-nav" id="prevDayBtn" type="button">წინა დღე</button>
        <button class="btn btn-nav" id="nextDayBtn" type="button">შემდეგი დღე</button>
        <button class="btn btn-calendar" id="showCalendarBtn" type="button">კალენდარი</button>
        <button class="btn btn-block" id="adminButton" type="button" style="display:none;"></button>
      </div>

      <!-- Data table -->
      <div class="table-container">
        <div class="overlay" id="loadingOverlay">იტვირთება...</div>
        <table id="dataTable">
          <thead>
            <tr>
              <th>დეპარტამენტი</th>
              <th>საწყისი</th>
              <th>შემოსვლა</th>
              <th>გაწერა</th>
              <th>გადასვლა</th>
              <th>ლეტალობა</th>
              <th>საბოლოო</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>

      <!-- Extra text fields -->
      <div class="extra-fields">
        <label><strong>პასუხისმგებელი მორიგე:</strong></label><br>
        <textarea id="responsiblePerson"></textarea><br><br>
        <label><strong>ურგენტული ოპერაციები:</strong></label><br>
        <textarea id="urgentOperations"></textarea>
      </div>
    </div>
  </div>

  <script>
    // ==========================================================
    // FIREBASE CONFIGURATION
    // ==========================================================
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
    let fbInited = false;

    function setFbStatus(ok, text) {
      const elements = ['fbDot', 'fbText', 'fbDot2', 'fbText2'];
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id.includes('Dot')) {
          el.classList.remove('ok', 'bad');
          el.classList.add(ok ? 'ok' : 'bad');
        } else {
          el.textContent = text;
        }
      });
    }

    function setSaveIndicator(text) {
      const el = document.getElementById('saveIndicator');
      if (el) el.innerHTML = `შენახვა: <strong>${text}</strong>`;
    }

    function initFirebase() {
      try {
        if (!fbInited) {
          firebase.initializeApp(firebaseConfig);
          fbInited = true;
        }
        try {
          if (firebase.analytics) firebase.analytics();
        } catch (e) {
          console.warn('Analytics init warning:', e);
        }
        db = firebase.firestore();
        setFbStatus(false, "Firebase: შემოწმება...");
        db.collection('_meta').doc('ping').get()
          .then(() => setFbStatus(true, "Firebase: დაკავშირებულია ✓"))
          .catch(() => setFbStatus(false, "Firebase: ვერ დაუკავშირდა ✗"));
      } catch (e) {
        console.error("Firebase init error:", e);
        setFbStatus(false, "Firebase: ვერ დაუკავშირდა ✗");
      }
    }

    // ==========================================================
    // STATE VARIABLES
    // ==========================================================
    let selectedDate = new Date();
    let currentYear = selectedDate.getFullYear();
    let isAdmin = false;
    let isLocked = false;

    // Department list - fixed order, never changes
    const BASE_DEPTS = [
      "ზრდასრულთა ემერჯენსი","ქირურგია","რეანიმაცია","კარდიორეანიმაცია","ბავშვთა ემერჯენსი","ბავშვთა რეანიმაცია",
      "ნევროლოგია","ნეიროქირურგია","ნეირორეანიმაცია","თორაკოქირურგია","ტრავმატოლოგია","ანგიოქირურგია",
      "ყბა-სახის ქირურგია","უროლოგია","ბავშვთა ქირურგია","პედიატრია","ბავშვთა ონკოჰემატოლოგია","ნეფროლოგია",
      "ჰეპატოლოგია","ინფექციური","შინაგანი მედიცინა","კარდიოლოგია","ონკოჰემატოლოგია 1","ონკოჰემატოლოგია 2",
      "გინეკოლოგია","ძვლის ტვინის გადანერგვა","მამოლოგია","ოფთალმოლოგია"
    ];
    
    const ADMISSION_DEPTS_ONLY = new Set(["ზრდასრულთა ემერჯენსი", "ბავშვთა ემერჯენსი"]);
    const deptOrder = [...BASE_DEPTS];
    let dataByDept = new Map();

    // Editing state tracking
    let isCurrentlyEditing = false;
    let currentEditingCell = null;

    // Firebase listener
    let unsubscribeDay = null;

    // Save queue
    let saveChain = Promise.resolve();
    let saveTimeout = null;

    // ==========================================================
    // HELPER FUNCTIONS
    // ==========================================================
    function showOverlay(on) {
      const el = document.getElementById('loadingOverlay');
      if (el) el.classList.toggle('show', !!on);
    }

    function showToast(msg) {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style = 'position:fixed;top:20px;right:20px;background:#333;color:white;padding:15px 25px;border-radius:5px;z-index:1000;';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2200);
    }

    function setView(view) {
      document.getElementById('authView').style.display = view === 'auth' ? 'block' : 'none';
      document.getElementById('calendarView').style.display = view === 'calendar' ? 'block' : 'none';
      document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
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
      const d = new Date(dateObj);
      d.setDate(d.getDate() - 1);
      return d;
    }

    function safeDeptKey(s) { 
      return String(s || '').trim(); 
    }

    function computeFinal(v) {
      return (+v.initial || 0) + (+v.admission || 0) - (+v.discharge || 0) - (+v.transfer || 0) - (+v.mortality || 0);
    }

    function canWriteNow() { 
      return isAdmin || !isLocked; 
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
        if (btn) btn.style.display = 'none';
        if (panel) panel.style.display = 'none';
        return;
      }
      
      if (btn) {
        btn.style.display = 'inline-block';
        btn.textContent = isLocked ? 'განბლოკვა' : 'დაბლოკვა';
      }
      if (panel) panel.style.display = 'block';
    }

    function setTextareasDisabled() {
      const disabled = !canWriteNow();
      document.getElementById('responsiblePerson').disabled = disabled;
      document.getElementById('urgentOperations').disabled = disabled;
    }

    // ==========================================================
    // EDITOR COMMIT FUNCTIONS
    // ==========================================================
    function commitOpenEditorToState() {
      const input = document.querySelector('#tableBody input');
      if (!input) {
        isCurrentlyEditing = false;
        currentEditingCell = null;
        return false;
      }
      
      const td = input.closest('td');
      if (!td) {
        isCurrentlyEditing = false;
        currentEditingCell = null;
        return false;
      }
      
      const dept = safeDeptKey(td.dataset.dept);
      const field = td.dataset.field;
      if (!dept || !field) {
        isCurrentlyEditing = false;
        currentEditingCell = null;
        return false;
      }
      
      const base = dataByDept.get(dept) || { 
        initial: 0, 
        admission: 0, 
        discharge: 0, 
        transfer: 0, 
        mortality: 0, 
        initialEdited: false 
      };
      
      const val = Math.max(0, parseInt(input.value, 10) || 0);
      const next = { ...base, [field]: val };
      if (field === 'initial' && isAdmin) next.initialEdited = true;
      
      dataByDept.set(dept, next);
      isCurrentlyEditing = false;
      currentEditingCell = null;
      
      renderTable();
      return true;
    }

    async function commitOpenEditorAndSave() {
      const changed = commitOpenEditorToState();
      if (changed) {
        await enqueueSaveNow();
      }
    }

    // ==========================================================
    // FIRESTORE READ/WRITE
    // ==========================================================
    async function readDayDoc(dateObj) {
      if (!db) return null;
      const id = getDocId(dateObj);
      try {
        const snap = await db.collection('dailyData').doc(id).get();
        return snap.exists ? snap.data() : null;
      } catch (e) {
        console.error('Read error:', e);
        return null;
      }
    }

    function normalizeRowsFromDoc(docData) {
      const rows = Array.isArray(docData?.rows) ? docData.rows : [];
      return rows.map(r => ({
        dept: safeDeptKey(r.dept),
        initial: +r.initial || 0,
        admission: +r.admission || 0,
        discharge: +r.discharge || 0,
        transfer: +r.transfer || 0,
        mortality: +r.mortality || 0,
        initialEdited: !!r.initialEdited
      })).filter(r => r.dept);
    }

    function exportPayloadForSave() {
      const rows = deptOrder.map(dept => {
        const v = dataByDept.get(dept) || {};
        return {
          dept,
          initial: +v.initial || 0,
          admission: +v.admission || 0,
          discharge: +v.discharge || 0,
          transfer: +v.transfer || 0,
          mortality: +v.mortality || 0,
          initialEdited: !!v.initialEdited
        };
      });
      
      return {
        rows,
        responsible: document.getElementById('responsiblePerson').value || '',
        urgent: document.getElementById('urgentOperations').value || '',
        locked: !!isLocked
      };
    }

    // ==========================================================
    // SAVE FUNCTION - CRITICAL PROTECTION AGAINST DATA LOSS
    // ==========================================================
    async function saveAllData() {
      if (!db || !canWriteNow()) return;
      
      const docId = getDocId(selectedDate);
      const payload = exportPayloadForSave();
      
      setSaveIndicator('ინახება...');
      
      try {
        // ✅ CRITICAL: Read existing document first
        const existingSnap = await db.collection('dailyData').doc(docId).get();
        
        let finalResponsible = payload.responsible;
        let finalUrgent = payload.urgent;
        
        // ✅ PROTECTION: Never replace non-empty with empty
        if (existingSnap.exists) {
          const existing = existingSnap.data() || {};
          
          if (existing.responsible && !payload.responsible) {
            finalResponsible = existing.responsible;
            console.log('🛡️ Protected: kept existing responsible field');
          }
          
          if (existing.urgent && !payload.urgent) {
            finalUrgent = existing.urgent;
            console.log('🛡️ Protected: kept existing urgent field');
          }
        }
        
        // Save to Firebase
        await db.collection('dailyData').doc(docId).set({
          rows: payload.rows,
          responsible: finalResponsible,
          urgent: finalUrgent,
          locked: payload.locked,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        setSaveIndicator('შენახულია ✓');
        console.log('✅ Saved successfully:', docId, {
          rows: payload.rows.length,
          responsible: finalResponsible ? 'yes' : 'empty',
          urgent: finalUrgent ? 'yes' : 'empty'
        });
        
      } catch (e) {
        console.error('❌ Save error:', e);
        setSaveIndicator('შეცდომა ✗');
        showToast('შენახვა ვერ მოხერხდა');
      }
    }

    function enqueueSaveNow() {
      if (!db || !canWriteNow()) return Promise.resolve();
      
      if (saveTimeout) clearTimeout(saveTimeout);
      
      return new Promise(resolve => {
        saveTimeout = setTimeout(() => {
          saveChain = saveChain
            .then(() => saveAllData())
            .then(resolve)
            .catch(err => {
              console.error('Save chain error:', err);
              resolve();
            });
        }, 800);
      });
    }

    // ==========================================================
    // FIRESTORE LIVE LISTENER
    // ==========================================================
    function detachLiveListener() {
      if (typeof unsubscribeDay === 'function') {
        try {
          unsubscribeDay();
        } catch (e) {
          console.warn('Detach listener error:', e);
        }
      }
      unsubscribeDay = null;
    }

    function attachLiveListener() {
      if (!db) return;
      detachLiveListener();
      
      const docId = getDocId(selectedDate);
      
      unsubscribeDay = db.collection('dailyData').doc(docId).onSnapshot(
        { includeMetadataChanges: true },
        snap => {
          if (!snap.exists) {
            console.log('📄 Document does not exist yet:', docId);
            return;
          }
          
          const d = snap.data() || {};
          const fromCache = !!snap.metadata.fromCache;
          const pending = !!snap.metadata.hasPendingWrites;
          
          // Update Firebase status
          setFbStatus(
            true, 
            pending 
              ? "Firebase: ინახება..." 
              : (fromCache ? "Firebase: ქეშიდან" : "Firebase: სინქრონიზებულია ✓")
          );
          
          if (!pending) {
            setSaveIndicator('შენახულია ✓');
          }
          
          // ✅ CRITICAL: Don't apply updates while user is editing
          if (isCurrentlyEditing || document.querySelector('#tableBody input')) {
            console.log('⚠️ User is editing, skipping remote update');
            return;
          }
          
          // ✅ CRITICAL: Don't apply our own pending writes
          if (pending) {
            console.log('⏳ Pending write, not applying');
            return;
          }
          
          console.log('📥 Applying remote data from Firebase');
          applyDayDocToState(d);
        },
        err => {
          console.error("Live listener error:", err);
          setFbStatus(false, "Firebase: შეცდომა ✗");
        }
      );
    }

    // ==========================================================
    // APPLY REMOTE DATA - CRITICAL PROTECTION
    // ==========================================================
    function applyDayDocToState(doc) {
      const rows = normalizeRowsFromDoc(doc);
      const map = new Map();
      rows.forEach(r => map.set(r.dept, r));
      
      const next = new Map();
      deptOrder.forEach(dept => {
        const r = map.get(dept);
        next.set(dept, {
          initial: r ? r.initial : 0,
          admission: r ? r.admission : 0,
          discharge: r ? r.discharge : 0,
          transfer: r ? r.transfer : 0,
          mortality: r ? r.mortality : 0,
          initialEdited: r ? !!r.initialEdited : false
        });
      });
      
      dataByDept = next;
      isLocked = !!doc?.locked;
      
      // ✅ CRITICAL: NEVER overwrite textareas with empty strings
      const rpField = document.getElementById('responsiblePerson');
      const uoField = document.getElementById('urgentOperations');
      const remoteResp = doc?.responsible || '';
      const remoteUrg = doc?.urgent || '';
      
      // Only update if remote has data OR local is already empty
      if (remoteResp || !rpField.value) {
        rpField.value = remoteResp;
      } else {
        console.log('🛡️ Protected: keeping local responsible value (remote is empty)');
      }
      
      if (remoteUrg || !uoField.value) {
        uoField.value = remoteUrg;
      } else {
        console.log('🛡️ Protected: keeping local urgent value (remote is empty)');
      }
      
      updateLockButton();
      setTextareasDisabled();
      renderTable();
    }

    // ==========================================================
    // BUILD STATE FROM PREVIOUS AND TODAY
    // ==========================================================
    function buildStateFromPrevAndToday(prevDoc, todayDoc) {
      const prevRows = normalizeRowsFromDoc(prevDoc);
      const todayRows = normalizeRowsFromDoc(todayDoc);
      
      const prevFinal = new Map();
      prevRows.forEach(r => prevFinal.set(r.dept, computeFinal(r)));
      
      const todayMap = new Map();
      todayRows.forEach(r => todayMap.set(r.dept, r));
      
      const next = new Map();
      deptOrder.forEach(dept => {
        const saved = todayMap.get(dept);
        let initialVal = 0;
        let initialEdited = false;
        
        if (saved && saved.initialEdited) {
          // Admin manually edited initial
          initialVal = saved.initial;
          initialEdited = true;
        } else if (prevFinal.has(dept)) {
          // Use previous day's final
          initialVal = prevFinal.get(dept) || 0;
          initialEdited = false;
        } else {
          // Fallback
          initialVal = saved ? saved.initial : 0;
          initialEdited = saved ? !!saved.initialEdited : false;
        }
        
        next.set(dept, {
          initial: initialVal,
          admission: saved ? saved.admission : 0,
          discharge: saved ? saved.discharge : 0,
          transfer: saved ? saved.transfer : 0,
          mortality: saved ? saved.mortality : 0,
          initialEdited: initialEdited
        });
      });
      
      dataByDept = next;
      isLocked = !!todayDoc?.locked;
      
      // Set textareas from today's doc
      document.getElementById('responsiblePerson').value = todayDoc?.responsible || '';
      document.getElementById('urgentOperations').value = todayDoc?.urgent || '';
      
      updateLockButton();
      setTextareasDisabled();
      renderTable();
    }

    // ==========================================================
    // LOAD ALL DATA FOR SELECTED DATE
    // ==========================================================
    async function loadAllData() {
      if (!db) return;
      
      document.getElementById('selectedDate').textContent = formatDate(selectedDate);
      showOverlay(true);
      setSaveIndicator('—');
      
      try {
        // Attach live listener first
        attachLiveListener();
        
        const prevDate = dateMinusOneDay(selectedDate);
        const [prevDoc, todayDoc] = await Promise.all([
          readDayDoc(prevDate),
          readDayDoc(selectedDate)
        ]);
        
        console.log('📂 Loaded documents:', {
          prev: prevDoc ? 'exists' : 'not found',
          today: todayDoc ? 'exists' : 'not found'
        });
        
        buildStateFromPrevAndToday(prevDoc, todayDoc);
        
        // Only save if document doesn't exist
        if (!todayDoc) {
          console.log('💾 Creating new document for:', getDocId(selectedDate));
          await saveAllData();
        } else {
          console.log('✓ Document already exists, loaded successfully');
        }
        
        // Load admin stats if admin
        if (isAdmin) {
          const m = selectedDate.getMonth();
          const y = selectedDate.getFullYear();
          setStatsSelectors(m, y);
          await computeMonthlyStats(y, m);
        }
        
      } catch (e) {
        console.error('❌ Load error:', e);
        showToast('ჩატვირთვა ვერ მოხერხდა');
      } finally {
        showOverlay(false);
      }
    }

    // ==========================================================
    // RENDER TABLE
    // ==========================================================
    function renderTable() {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';
      
      // Render each department row
      for (const dept of deptOrder) {
        const v = dataByDept.get(dept) || { 
          initial: 0, 
          admission: 0, 
          discharge: 0, 
          transfer: 0, 
          mortality: 0 
        };
        const final = computeFinal(v);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dept}</td>
          <td class="${canEditCell('initial') ? 'editable' : ''}" data-dept="${dept}" data-field="initial">${v.initial}</td>
          <td class="${canEditCell('admission') ? 'editable' : ''}" data-dept="${dept}" data-field="admission">${v.admission}</td>
          <td class="${canEditCell('discharge') ? 'editable' : ''}" data-dept="${dept}" data-field="discharge">${v.discharge}</td>
          <td class="${canEditCell('transfer') ? 'editable' : ''}" data-dept="${dept}" data-field="transfer">${v.transfer}</td>
          <td class="${canEditCell('mortality') ? 'editable' : ''}" data-dept="${dept}" data-field="mortality">${v.mortality}</td>
          <td>${final}</td>
        `;
        tbody.appendChild(tr);
      }
      
      // Calculate and render totals row
      const totals = deptOrder.reduce((a, dept) => {
        const v = dataByDept.get(dept) || {};
        a.initial += v.initial || 0;
        a.admission += v.admission || 0;
        a.discharge += v.discharge || 0;
        a.transfer += v.transfer || 0;
        a.mortality += v.mortality || 0;
        a.final += computeFinal(v);
        return a;
      }, { 
        initial: 0, 
        admission: 0, 
        discharge: 0, 
        transfer: 0, 
        mortality: 0, 
        final: 0 
      });
      
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

    // ==========================================================
    // TABLE EDITING
    // ==========================================================
    function setupTableEditing() {
      const tbody = document.getElementById('tableBody');
      
      tbody.addEventListener('click', async e => {
        const cell = e.target.closest('td');
        if (!cell || !cell.classList.contains('editable')) return;
        
        // If editing another cell, commit it first
        if (isCurrentlyEditing && currentEditingCell !== cell) {
          await commitOpenEditorAndSave();
        }
        
        if (cell.querySelector('input')) return;
        
        const dept = safeDeptKey(cell.dataset.dept);
        const field = cell.dataset.field;
        if (!dept || !field || !canEditCell(field)) return;
        
        const base = dataByDept.get(dept) || { 
          initial: 0, 
          admission: 0, 
          discharge: 0, 
          transfer: 0, 
          mortality: 0 
        };
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = base[field] || 0;
        
        cell.textContent = '';
        cell.appendChild(input);
        
        isCurrentlyEditing = true;
        currentEditingCell = cell;
        
        input.focus();
        input.select();
        
        const commit = async () => {
          const val = Math.max(0, parseInt(input.value, 10) || 0);
          const latest = dataByDept.get(dept) || { 
            initial: 0, 
            admission: 0, 
            discharge: 0, 
            transfer: 0, 
            mortality: 0 
          };
          const next = { ...latest, [field]: val };
          if (field === 'initial' && isAdmin) next.initialEdited = true;
          
          dataByDept.set(dept, next);
          isCurrentlyEditing = false;
          currentEditingCell = null;
          
          renderTable();
          await enqueueSaveNow();
        };
        
        input.addEventListener('blur', commit, { once: true });
        input.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') { 
            ev.preventDefault(); 
            commit(); 
          }
          if (ev.key === 'Escape') { 
            isCurrentlyEditing = false; 
            currentEditingCell = null;
            renderTable(); 
          }
        });
      });
      
      // Click outside table
      document.addEventListener('mousedown', async e => {
        const isInsideTable = !!e.target.closest('#dataTable');
        if (!isInsideTable && isCurrentlyEditing) {
          await commitOpenEditorAndSave();
        }
      });
    }

    // ==========================================================
    // TEXTAREA EDITING
    // ==========================================================
    function setupExtraFields() {
      const fields = ['responsiblePerson', 'urgentOperations'];
      
      fields.forEach(id => {
        const el = document.getElementById(id);
        let timeout;
        
        el.addEventListener('input', () => {
          if (!canWriteNow()) return;
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            enqueueSaveNow();
          }, 1500);
        });
      });
    }

    // ==========================================================
    // ADMIN LOCK/UNLOCK
    // ==========================================================
    async function toggleLock() {
      if (!isAdmin) return;
      
      await commitOpenEditorAndSave();
      
      isLocked = !isLocked;
      updateLockButton();
      setTextareasDisabled();
      renderTable();
      
      await enqueueSaveNow();
      showToast(isLocked ? 'დღე დაიბლოკა' : 'დღე განიბლოკა');
    }

    // ==========================================================
    // CALENDAR RENDERING
    // ==========================================================
    function renderCalendar(year) {
      document.getElementById('calendarTitle').textContent = `${year} წლის კალენდარი`;
      const container = document.getElementById('calendarContainer');
      container.innerHTML = '';
      
      const months = [
        'იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი',
        'ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'
      ];
      const today = new Date();
      
      for (let m = 0; m < 12; m++) {
        const div = document.createElement('div');
        div.className = 'month';
        div.innerHTML = `<h3>${months[m]} ${year}</h3>`;
        
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        
        ['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ'].forEach(d => {
          const th = document.createElement('th');
          th.textContent = d;
          headRow.appendChild(th);
        });
        
        thead.appendChild(headRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        // ✅ FIXED: Correct firstDay calculation
        let firstDay = new Date(year, m, 1).getDay();
        // Convert Sunday (0) to 7, keep Monday-Saturday as 1-6
        firstDay = firstDay === 0 ? 7 : firstDay;
        
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        let day = 1;
        
        for (let r = 0; r < 6; r++) {
          const tr = document.createElement('tr');
          
          for (let c = 1; c <= 7; c++) {
            const td = document.createElement('td');
            
            if ((r === 0 && c < firstDay) || day > daysInMonth) {
              td.className = 'empty';
            } else {
              const clickDay = day;
              td.textContent = day;
              
              if (year === today.getFullYear() && 
                  m === today.getMonth() && 
                  day === today.getDate()) {
                td.classList.add('today');
              }
              
              td.addEventListener('click', async () => {
                await commitOpenEditorAndSave();
                selectedDate = new Date(year, m, clickDay);
                setView('table');
                await loadAllData();
              });
              
              day++;
            }
            tr.appendChild(td);
          }
          
          tbody.appendChild(tr);
          if (day > daysInMonth) break;
        }
        
        table.appendChild(tbody);
        div.appendChild(table);
        container.appendChild(div);
      }
    }

    // ==========================================================
    // ADMIN MONTHLY STATISTICS
    // ==========================================================
    const monthNames = [
      'იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი',
      'ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'
    ];

    function setStatsSelectors(month, year) {
      const mSel = document.getElementById('statsMonth');
      const ySel = document.getElementById('statsYear');
      
      if (mSel && mSel.options.length === 0) {
        monthNames.forEach((n, i) => {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = n;
          mSel.appendChild(opt);
        });
      }
      
      if (ySel && ySel.options.length === 0) {
        const base = new Date().getFullYear();
        for (let y = base - 3; y <= base + 3; y++) {
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          ySel.appendChild(opt);
        }
      }
      
      if (mSel) mSel.value = month;
      if (ySel) ySel.value = year;
    }

    async function computeMonthlyStats(year, month) {
      if (!db) return;
      
      const days = new Date(year, month + 1, 0).getDate();
      let adm = 0, dis = 0, mor = 0;
      
      const ids = [];
      for (let d = 1; d <= days; d++) {
        ids.push(getDocId(new Date(year, month, d)));
      }
      
      // Batch fetch (10 at a time)
      for (let i = 0; i < ids.length; i += 10) {
        const chunk = ids.slice(i, i + 10);
        const snaps = await Promise.all(
          chunk.map(id => db.collection('dailyData').doc(id).get().catch(() => null))
        );
        
        snaps.forEach(snap => {
          if (!snap || !snap.exists) return;
          const rows = snap.data().rows || [];
          
          rows.forEach(r => {
            const dept = safeDeptKey(r.dept);
            if (ADMISSION_DEPTS_ONLY.has(dept)) {
              adm += +r.admission || 0;
            }
            dis += +r.discharge || 0;
            mor += +r.mortality || 0;
          });
        });
      }
      
      document.getElementById('statAdmission').textContent = adm;
      document.getElementById('statDischarge').textContent = dis;
      document.getElementById('statMortality').textContent = mor;
      
      const note = document.getElementById('statsNote');
      if (note) {
        note.textContent = `სტატისტიკა: ${monthNames[month]} ${year}`;
      }
    }

    // ==========================================================
    // AUTHENTICATION
    // ==========================================================
    function checkPassword() {
      const pass = document.getElementById('password').value.trim();
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

    // ==========================================================
    // UI SETUP AND EVENT HANDLERS
    // ==========================================================
    function setupUI() {
      initFirebase();
      setSaveIndicator('—');
      
      // Login
      document.getElementById('loginBtn').onclick = checkPassword;
      document.getElementById('password').onkeydown = e => {
        if (e.key === 'Enter') checkPassword();
      };
      
      // Calendar navigation
      document.getElementById('prevYearBtn').onclick = () => { 
        currentYear--; 
        renderCalendar(currentYear); 
      };
      document.getElementById('nextYearBtn').onclick = () => { 
        currentYear++; 
        renderCalendar(currentYear); 
      };
      
      // Table view controls
      document.getElementById('exportBtn').onclick = async () => {
        await commitOpenEditorAndSave();
        window.print();
      };
      
      document.getElementById('prevDayBtn').onclick = async () => {
        await commitOpenEditorAndSave();
        selectedDate.setDate(selectedDate.getDate() - 1);
        await loadAllData();
      };
      
      document.getElementById('nextDayBtn').onclick = async () => {
        await commitOpenEditorAndSave();
        selectedDate.setDate(selectedDate.getDate() + 1);
        await loadAllData();
      };
      
      document.getElementById('showCalendarBtn').onclick = async () => {
        await commitOpenEditorAndSave();
        setView('calendar');
        renderCalendar(currentYear);
      };
      
      document.getElementById('adminButton').onclick = toggleLock;
      
      // Admin stats controls
      const refreshBtn = document.getElementById('refreshStatsBtn');
      if (refreshBtn) {
        refreshBtn.onclick = async () => {
          if (!isAdmin) return;
          const y = parseInt(document.getElementById('statsYear').value);
          const m = parseInt(document.getElementById('statsMonth').value);
          await computeMonthlyStats(y, m);
        };
      }
      
      ['statsMonth', 'statsYear'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.onchange = async () => {
            if (!isAdmin) return;
            const y = parseInt(document.getElementById('statsYear').value);
            const m = parseInt(document.getElementById('statsMonth').value);
            await computeMonthlyStats(y, m);
          };
        }
      });
      
      // Setup editing handlers
      setupTableEditing();
      setupExtraFields();
      
      // Before unload - save any pending changes
      window.onbeforeunload = () => {
        if (isCurrentlyEditing) {
          commitOpenEditorToState();
        }
        detachLiveListener();
      };
      
      // Start with auth view
      setView('auth');
    }

    // Initialize when page loads
    window.onload = setupUI;
  </script>
</body>
</html>


