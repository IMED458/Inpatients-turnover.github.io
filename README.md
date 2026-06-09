<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>პაციენტთა ბრუნვა</title>
  <link rel="icon" type="image/png" href="tm_center_logo12.png">
  <script src="/_sdk/element_sdk.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics-compat.js"></script>
  <style>
    body { margin:0; padding:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#f5f5f5; }
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
    .btn-logout { background:#7f8c8d; }
    .btn:hover { opacity:0.9; }
    .table-container { background:white; padding:20px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); overflow-x:auto; position:relative; }
    table { width:100%; border-collapse:collapse; border:3px solid #2c5f2d; }
    th { background:#2c5f2d; color:white; padding:12px 8px; text-align:center; cursor:default; user-select:none; }
    td { padding:8px; border:1px solid #d0d0d0; text-align:center; }
    td:first-child { background:#dae8fc; text-align:left; padding-left:12px; font-weight:500; }
    td:nth-child(2),td:nth-child(3),td:nth-child(4),td:nth-child(5) { background:#fff4e6; }
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
    input[type="password"],input[type="text"] { width:100%; padding:12px; margin:15px 0; border:1px solid #ddd; border-radius:4px; font-size:16px; box-sizing:border-box; }
    .extra-fields { margin-top:20px; padding:20px; background:#f9f9f9; border-radius:8px; }
    .extra-fields textarea { width:100%; height:80px; padding:10px; border:1px solid #ddd; border-radius:4px; resize:vertical; box-sizing:border-box; }
    .statusline { text-align:center; color:#666; font-size:12px; margin:6px 0 0 0; }
    .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.08); }
    .dot { width:10px; height:10px; border-radius:50%; background:#FF9800; }
    .ok { background:#4CAF50 !important; }
    .bad { background:#F44336 !important; }
    .overlay { position:absolute; inset:0; background:rgba(255,255,255,0.7); display:none; align-items:center; justify-content:center; font-weight:700; color:#2c3e50; }
    .overlay.show { display:flex; }
    .admin-panel { max-width:1100px; margin:0 auto 16px auto; background:white; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.1); padding:16px; display:none; }
    .admin-panel-header { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
    .admin-panel-title { font-weight:800; color:#2c3e50; font-size:16px; }
    .admin-panel-controls { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    .select { padding:10px 12px; border:1px solid #ddd; border-radius:8px; background:white; font-weight:600; color:#2c3e50; cursor:pointer; }
    .stats-grid { display:grid; grid-template-columns:repeat(3,minmax(180px,1fr)); gap:12px; }
    .stat-card { border:1px solid #eee; border-radius:10px; padding:14px; background:#fafafa; }
    .stat-label { color:#666; font-size:12px; margin-bottom:6px; }
    .stat-value { font-size:28px; font-weight:800; color:#2c3e50; }
    .stat-sub { margin-top:6px; color:#888; font-size:12px; }
    .small-note { color:#777; font-size:12px; margin-top:10px; }

    /* Admin tabs */
    .admin-tabs { display:flex; gap:4px; margin-bottom:14px; border-bottom:2px solid #eee; padding-bottom:4px; }
    .admin-tab-btn { padding:8px 18px; border:none; border-radius:6px 6px 0 0; background:#f0f0f0; color:#555; font-weight:600; cursor:pointer; font-size:14px; }
    .admin-tab-btn.active { background:#2c5f2d; color:white; }
    .admin-tab-pane { display:none; }
    .admin-tab-pane.active { display:block; }

    /* User management */
    .user-mgmt-toolbar { display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
    .user-table { width:100%; border-collapse:collapse; font-size:13px; }
    .user-table th { background:#2c5f2d; color:white; padding:8px 10px; text-align:left; }
    .user-table td { padding:7px 10px; border:1px solid #e0e0e0; vertical-align:middle; }
    .user-table tr:hover td { background:#f5f5f5; }
    .badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; }
    .badge-active { background:#e8f5e9; color:#2e7d32; }
    .badge-inactive { background:#ffebee; color:#c62828; }
    .badge-temp { background:#fff3e0; color:#e65100; }
    .badge-perm { background:#e3f2fd; color:#1565c0; }
    .btn-sm { padding:4px 10px; font-size:12px; border:none; border-radius:4px; cursor:pointer; color:white; font-weight:600; }
    .btn-sm-edit { background:#1976d2; }
    .btn-sm-pass { background:#f57c00; }
    .btn-sm-toggle { background:#7b1fa2; }
    .btn-sm-del { background:#c62828; }
    .dept-user-info { background:#e8f4fd; border:1px solid #b3d7f0; border-radius:6px; padding:8px 14px; margin-bottom:12px; font-size:13px; color:#1565c0; }

    /* Modals */
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:2000; padding:16px; }
    .modal-backdrop.show { display:flex; }
    .modal-card { width:100%; max-width:520px; background:#fff; border-radius:10px; box-shadow:0 20px 50px rgba(0,0,0,0.25); padding:18px; }
    .modal-card h3 { margin:0 0 14px 0; color:#2c3e50; }
    .modal-card p { color:#555; font-size:14px; margin:0 0 14px 0; }
    .modal-grid { display:grid; gap:10px; }
    .modal-grid label { font-size:14px; color:#2c3e50; font-weight:600; }
    .modal-grid select,.modal-grid input { width:100%; border:1px solid #d0d0d0; border-radius:6px; padding:9px 10px; font-size:14px; box-sizing:border-box; }
    .modal-actions { margin-top:14px; display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; }
    .btn-cancel { background:#7f8c8d; }
    .save-indicator { margin-top:8px; font-size:12px; color:#666; text-align:center; }
    .save-indicator strong { color:#2c3e50; }
    .temp-pw-display { background:#fff3e0; border:1px solid #ffcc80; border-radius:6px; padding:12px; margin-top:10px; text-align:center; }
    .temp-pw-display .pw-value { font-size:22px; font-weight:800; color:#e65100; letter-spacing:2px; margin:6px 0; }
    .temp-pw-display p { color:#795548; font-size:13px; margin:0; }

    /* Auth view redesign */
    body.auth-mode { background:#edf2fb; color:#1a365d; overflow-x:hidden; }
    body.auth-mode .page-wrapper { padding-left:0; padding-right:0; }
    body.auth-mode::before,body.auth-mode::after { content:''; position:fixed; pointer-events:none; border-radius:50%; filter:blur(56px); z-index:0; }
    body.auth-mode::before { width:640px; height:640px; right:-200px; top:-220px; background:rgba(147,197,253,0.45); animation:decorPulse 7s ease-in-out infinite; }
    body.auth-mode::after { width:560px; height:560px; left:-180px; bottom:-200px; background:rgba(129,140,248,0.35); }
    @keyframes decorPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.08);opacity:0.45} }
    #authView { width:100%; max-width:448px; margin:0 auto; height:calc(100vh - 40px); min-height:calc(100vh - 40px); padding:10px 0 28px 0; box-sizing:border-box; position:relative; z-index:1; display:flex; flex-direction:column; justify-content:flex-start; gap:16px; text-align:center; background:transparent; box-shadow:none; border-radius:0; }
    #logo { max-width:300px; width:min(300px,100%); height:auto; margin:0 auto 10px auto; display:block; object-fit:contain; background:transparent; }
    .auth-brand { text-align:center; margin-bottom:2px; }
    .auth-card { position:relative; text-align:left; background:rgba(255,255,255,0.94); border-radius:2.5rem; padding:40px; border:1px solid rgba(255,255,255,0.95); box-shadow:0 30px 52px rgba(30,64,175,0.14); overflow:hidden; }
    .auth-card-corner { position:absolute; top:0; right:0; width:126px; height:126px; border-bottom-left-radius:92px; background:rgba(219,234,254,0.65); pointer-events:none; }
    .auth-card-title { margin:0 0 22px 0; font-size:clamp(26px,4vw,34px); color:#1e3a8a; font-weight:800; letter-spacing:-0.01em; display:flex; align-items:center; gap:10px; }
    .auth-card-title-icon { width:30px; height:30px; stroke:#3b82f6; flex:0 0 30px; }
    .auth-label { display:block; margin:0 0 10px 6px; color:rgba(30,64,175,0.72); font-weight:700; letter-spacing:0.01em; font-size:14px; }
    #authView #username,#authView #password { width:100%; margin:0; height:56px; padding:0 18px; border-radius:16px; border:2px solid transparent; background:rgba(239,246,255,0.86); color:#1e3a8a; font-size:18px; font-weight:700; letter-spacing:0.05em; box-sizing:border-box; outline:none; transition:border-color .2s,background-color .2s; }
    #authView #username { letter-spacing:0.01em; margin-bottom:14px; }
    #authView #username:focus,#authView #password:focus { border-color:#60a5fa; background:#fff; }
    .auth-login-btn { width:100%; margin-top:18px; height:56px; border-radius:16px; padding:0 20px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 14px 22px rgba(37,99,235,0.35); font-size:18px; letter-spacing:0.01em; transition:transform .2s,box-shadow .2s,filter .2s; display:inline-flex; align-items:center; justify-content:center; gap:10px; }
    .auth-login-btn:hover { transform:translateY(-2px); box-shadow:0 18px 24px rgba(37,99,235,0.4); filter:brightness(1.03); }
    .auth-login-arrow { display:inline-block; font-size:22px; transform:translateX(0); transition:transform .25s; }
    .auth-login-btn:hover .auth-login-arrow { transform:translateX(4px); }
    .auth-statusline { margin-top:16px; text-align:center; font-size:13px; }
    .auth-statusline .pill { border:1px solid rgba(191,219,254,0.9); background:rgba(255,255,255,0.95); box-shadow:0 6px 14px rgba(30,64,175,0.08); }
    .phonebook-link { text-decoration:none; color:inherit; display:block; margin-top:auto; padding-top:54px; width:100%; transition:transform .3s; }
    .phonebook-link:hover { transform:translateY(-5px); }
    .phonebook-card { position:relative; border-radius:32px; overflow:hidden; background:linear-gradient(135deg,#2563eb,#4338ca); border:1px solid rgba(255,255,255,0.2); box-shadow:0 24px 42px rgba(37,99,235,0.3); width:100%; max-width:410px; margin:0 auto; padding:20px; box-sizing:border-box; display:flex; align-items:center; gap:12px; text-align:left; isolation:isolate; }
    .phonebook-ring { position:absolute; left:-44px; bottom:-40px; width:170px; height:170px; border:16px solid rgba(255,255,255,0.42); border-radius:50%; pointer-events:none; z-index:0; animation:ringPulse 4s ease-in-out infinite; }
    @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.1} 50%{transform:scale(1.5);opacity:0.32} }
    .phonebook-icon-wrap { position:relative; z-index:1; width:58px; height:58px; flex:0 0 58px; border-radius:16px; background:rgba(255,255,255,0.22); border:1px solid rgba(255,255,255,0.32); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition:transform .3s; }
    .phonebook-link:hover .phonebook-icon-wrap { transform:scale(1.1); }
    .phonebook-icon-wrap svg { width:30px; height:30px; stroke:#fff; }
    .phonebook-copy { position:relative; z-index:1; flex:1; min-width:0; }
    .phonebook-copy h3 { margin:0; color:#fff; font-size:24px; line-height:1.1; font-weight:800; letter-spacing:-0.01em; }
    .phonebook-copy p { margin:8px 0 0 0; color:rgba(219,234,254,0.9); font-size:13px; font-weight:500; }
    .phonebook-arrow-wrap { position:relative; z-index:1; width:40px; height:40px; flex:0 0 40px; border-radius:50%; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.28); display:flex; align-items:center; justify-content:center; }
    .phonebook-arrow-wrap svg { width:20px; height:20px; stroke:#fff; animation:arrowSlide 1.5s ease-in-out infinite; }
    @keyframes arrowSlide { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
    @media(max-width:700px) { #authView{min-height:auto;padding:14px 0} .auth-card{border-radius:30px;padding:26px 18px 22px} .auth-card-title{font-size:clamp(22px,7vw,30px);margin-bottom:18px} .auth-login-btn{font-size:17px} .phonebook-card{border-radius:24px;padding:16px} .phonebook-copy h3{font-size:clamp(18px,5vw,22px)} .phonebook-copy p{font-size:12px} .stats-grid{grid-template-columns:1fr} }
    @media(max-width:540px) { #authView{max-width:100%;width:100%;height:auto;min-height:100dvh;padding:calc(env(safe-area-inset-top) + 10px) 12px calc(env(safe-area-inset-bottom) + 14px);justify-content:flex-start;gap:14px} #logo{width:min(240px,82vw);margin-bottom:6px} .auth-card{border-radius:28px;padding:24px 16px 18px} .auth-card-corner{width:92px;height:92px;border-bottom-left-radius:70px} .auth-card-title{font-size:clamp(32px,8vw,42px);margin-bottom:16px} #authView #username,#authView #password{height:52px;font-size:17px;border-radius:14px} #authView #username{margin-bottom:12px} .auth-login-btn{height:52px;border-radius:14px;margin-top:14px;font-size:17px} .phonebook-link{margin-top:auto;padding-top:16px} .phonebook-card{width:100%;max-width:none;border-radius:24px;padding:14px;gap:8px} }
    @media(max-width:390px) { #authView{padding-left:8px;padding-right:8px;gap:12px} #logo{width:min(210px,78vw)} .auth-card{border-radius:24px;padding:20px 14px 16px} .auth-card-title{font-size:clamp(28px,7.6vw,34px)} #authView #username,#authView #password,.auth-login-btn{height:50px} .phonebook-link{padding-top:12px} .phonebook-card{border-radius:20px;padding:12px;gap:8px} }
    @media print { .controls,#authView,#calendarView,.statusline,.admin-panel,.save-indicator{display:none !important} #tableView{display:block !important} .page-wrapper{padding:0;background:white} body{background:white} .table-container{box-shadow:none;padding:0;overflow:visible} .overlay{display:none !important} table{border:2px solid #222} th{background:#2c5f2d !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} td:first-child{background:#dae8fc !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} td:nth-child(2),td:nth-child(3),td:nth-child(4),td:nth-child(5){background:#fff4e6 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} td:nth-child(6){background:#ffe6f0 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} td:nth-child(7){background:#ffeb99 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} .total-row td{background:#e8f5e9 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} .total-row td:first-child{background:#c8e6c9 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact} .extra-fields{margin-top:16px;border:1px solid #ddd;background:#fff !important;box-shadow:none;padding:12px;page-break-inside:avoid} .extra-fields textarea{height:auto;min-height:60px;border:1px solid #ccc} }
  </style>
</head>
<body>
  <div class="page-wrapper">

    <!-- ========== LOGIN VIEW ========== -->
    <div id="authView">
      <div class="auth-brand">
        <img src="tm_center_logo_transparent.png" alt="TM Center Logo" id="logo">
      </div>
      <div class="auth-card">
        <div class="auth-card-corner"></div>
        <h2 class="auth-card-title">
          <svg class="auth-card-title-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <path d="M10 17l5-5-5-5"></path>
            <path d="M15 12H3"></path>
          </svg>
          ავტორიზაცია
        </h2>
        <label class="auth-label" for="username">მომხმარებელი</label>
        <input type="text" id="username" placeholder="მომხმარებლის სახელი" autocomplete="username" spellcheck="false">
        <label class="auth-label" for="password">პაროლი</label>
        <input type="password" id="password" placeholder="••••••••" autocomplete="current-password">
        <button class="btn btn-nav auth-login-btn" id="loginBtn" type="button">
          შესვლა <span class="auth-login-arrow">→</span>
        </button>
        <div class="statusline auth-statusline">
          <span class="pill">
            <span class="dot" id="fbDot"></span>
            <span id="fbText">Firebase: შემოწმება...</span>
          </span>
        </div>
      </div>
      <a class="phonebook-link" href="https://phone.imed.com.ge/" target="_blank" rel="noopener noreferrer">
        <div class="phonebook-card">
          <div class="phonebook-ring"></div>
          <div class="phonebook-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.77 19.77 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.77 19.77 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.64 2.61a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.47-1.3a2 2 0 0 1 2.11-.45c.83.3 1.71.52 2.61.64A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div class="phonebook-copy">
            <h3>ექიმების სატელეფონო წიგნი</h3>
            <p>კლინიკის შიდა დირექტორია</p>
          </div>
          <div class="phonebook-arrow-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path><path d="m13 5 7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </a>
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
        <button class="btn btn-logout" id="logoutBtnCal" type="button">გამოსვლა</button>
      </div>
      <div class="calendar-container" id="calendarContainer"></div>
    </div>

    <!-- ========== TABLE VIEW ========== -->
    <div id="tableView" style="display:none;">
      <div class="header">
        <h1>პაციენტთა ბრუნვა</h1>
        <h2>Inpatients turnover — <span id="selectedDate">--.--.--</span></h2>
        <div class="statusline">
          <span class="pill">
            <span class="dot" id="fbDot2"></span>
            <span id="fbText2">Firebase: შემოწმება...</span>
          </span>
        </div>
        <div class="save-indicator" id="saveIndicator">შენახვა: <strong>—</strong></div>
      </div>

      <!-- Admin panel (tabbed) -->
      <div class="admin-panel" id="adminPanel">
        <div class="admin-tabs">
          <button class="admin-tab-btn active" data-tab="stats" id="tabBtnStats">სტატისტიკა</button>
          <button class="admin-tab-btn" data-tab="users" id="tabBtnUsers">იუზერების მართვა</button>
        </div>

        <!-- Stats tab -->
        <div class="admin-tab-pane active" id="tabStats">
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

        <!-- User management tab -->
        <div class="admin-tab-pane" id="tabUsers">
          <div class="user-mgmt-toolbar">
            <button class="btn btn-nav" id="createUserBtn" type="button">+ ახალი იუზერი</button>
          </div>
          <div style="overflow-x:auto;">
            <table class="user-table">
              <thead>
                <tr>
                  <th>მომხმარებელი</th>
                  <th>განყოფილება</th>
                  <th>სტატუსი</th>
                  <th>პაროლის ტიპი</th>
                  <th>შექმნილია</th>
                  <th>განახლდა</th>
                  <th>მოქმედება</th>
                </tr>
              </thead>
              <tbody id="userTableBody">
                <tr><td colspan="7" style="text-align:center;color:#999;">იტვირთება...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Dept user info bar -->
      <div class="dept-user-info" id="deptUserInfo" style="display:none;max-width:1100px;margin:0 auto 10px auto;"></div>

      <!-- Controls -->
      <div class="controls">
        <button class="btn btn-export" id="exportBtn" type="button">Export PDF</button>
        <button class="btn btn-nav" id="prevDayBtn" type="button">წინა დღე</button>
        <button class="btn btn-nav" id="nextDayBtn" type="button">შემდეგი დღე</button>
        <button class="btn btn-calendar" id="showCalendarBtn" type="button">კალენდარი</button>
        <button class="btn btn-block" id="adminButton" type="button" style="display:none;"></button>
        <button class="btn btn-nav" id="changePasswordBtn" type="button" style="display:none;">პაროლის შეცვლა</button>
        <button class="btn btn-logout" id="logoutBtn" type="button">გამოსვლა</button>
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

  <!-- ===== FIRST-LOGIN PASSWORD CHANGE MODAL ===== -->
  <div class="modal-backdrop" id="firstLoginModal" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-modal="true">
      <h3>🔒 პაროლის განახლება სავალდებულოა</h3>
      <p>პირველი შესვლისთვის საჭიროა მუდმივი პაროლის დაყენება. ერთჯერადი პაროლი გაუქმდება.</p>
      <div class="modal-grid">
        <label for="flNewPw">ახალი პაროლი (მინ. 6 სიმბოლო)</label>
        <input type="password" id="flNewPw" autocomplete="new-password">
        <label for="flConfirmPw">გაიმეორე ახალი პაროლი</label>
        <input type="password" id="flConfirmPw" autocomplete="new-password">
      </div>
      <div class="modal-actions">
        <button class="btn btn-nav" id="flSaveBtn" type="button">პაროლის შენახვა</button>
      </div>
    </div>
  </div>

  <!-- ===== ADMIN PASSWORD CHANGE MODAL ===== -->
  <div class="modal-backdrop" id="passwordModal" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="passwordModalTitle">
      <h3 id="passwordModalTitle">პაროლის ცვლილება</h3>
      <div class="modal-grid">
        <label for="passwordScope">ცვლილების ტიპი</label>
        <select id="passwordScope">
          <option value="admin">მხოლოდ ადმინის პაროლი</option>
          <option value="all">ყველა მომხმარებლის პაროლი (user)</option>
        </select>
        <label for="currentAdminPassword">მიმდინარე ადმინის პაროლი</label>
        <input type="password" id="currentAdminPassword" autocomplete="current-password">
        <label for="newPasswordModal">ახალი პაროლი</label>
        <input type="password" id="newPasswordModal" autocomplete="new-password">
        <label for="confirmPasswordModal">გაიმეორე ახალი პაროლი</label>
        <input type="password" id="confirmPasswordModal" autocomplete="new-password">
      </div>
      <div class="modal-actions">
        <button class="btn btn-cancel" id="cancelPasswordChangeBtn" type="button">გაუქმება</button>
        <button class="btn btn-nav" id="savePasswordChangeBtn" type="button">შენახვა</button>
      </div>
    </div>
  </div>

  <!-- ===== USER CREATE / EDIT MODAL ===== -->
  <div class="modal-backdrop" id="userModal" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-modal="true">
      <h3 id="userModalTitle">ახალი იუზერი</h3>
      <div class="modal-grid">
        <label for="umUsername">მომხმარებლის სახელი</label>
        <input type="text" id="umUsername" autocomplete="off" spellcheck="false">
        <label for="umDept">განყოფილება</label>
        <select id="umDept"></select>
        <label for="umTempPw" id="umTempPwLabel">ერთჯერადი პაროლი</label>
        <input type="text" id="umTempPw" autocomplete="off" placeholder="ჩაწერეთ ერთჯერადი პაროლი">
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px;">
          <input type="checkbox" id="umActive" checked style="width:auto;margin:0;"> აქტიური
        </label>
      </div>
      <div class="modal-actions">
        <button class="btn btn-cancel" id="cancelUserBtn" type="button">გაუქმება</button>
        <button class="btn btn-nav" id="saveUserBtn" type="button">შენახვა</button>
      </div>
    </div>
  </div>

  <!-- ===== TEMP PASSWORD DISPLAY MODAL ===== -->
  <div class="modal-backdrop" id="tempPwModal" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-modal="true">
      <h3>✅ იუზერი შეიქმნა</h3>
      <p>შემდეგი ერთჯერადი პაროლი გადაეცით მომხმარებელს. პირველი შესვლისას მოეთხოვება მის შეცვლა:</p>
      <div class="temp-pw-display">
        <div class="pw-value" id="tempPwValue">—</div>
        <p>მომხმარებელი: <strong id="tempPwUsername">—</strong></p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-nav" id="closeTempPwBtn" type="button">დახურვა</button>
      </div>
    </div>
  </div>

  <!-- ===== RESET PASSWORD MODAL ===== -->
  <div class="modal-backdrop" id="resetPwModal" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-modal="true">
      <h3>პაროლის განახლება</h3>
      <p id="resetPwInfo"></p>
      <div class="modal-grid">
        <label for="resetPwValue">ახალი ერთჯერადი პაროლი</label>
        <input type="text" id="resetPwValue" autocomplete="off">
      </div>
      <div class="modal-actions">
        <button class="btn btn-cancel" id="cancelResetPwBtn" type="button">გაუქმება</button>
        <button class="btn btn-nav" id="saveResetPwBtn" type="button">შენახვა</button>
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
      ['fbDot','fbText','fbDot2','fbText2'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id.includes('Dot')) { el.classList.remove('ok','bad'); el.classList.add(ok ? 'ok' : 'bad'); }
        else el.textContent = text;
      });
    }

    function setSaveIndicator(text) {
      const el = document.getElementById('saveIndicator');
      if (el) el.innerHTML = `შენახვა: <strong>${text}</strong>`;
    }

    function initFirebase() {
      try {
        if (!fbInited) { firebase.initializeApp(firebaseConfig); fbInited = true; }
        try { if (firebase.analytics) firebase.analytics(); } catch(e) { console.warn('Analytics:', e); }
        db = firebase.firestore();
        setFbStatus(false, "Firebase: შემოწმება...");
        db.collection('_meta').doc('ping').get()
          .then(() => setFbStatus(true, "Firebase: დაკავშირებულია ✓"))
          .catch(() => setFbStatus(false, "Firebase: ვერ დაუკავშირდა ✗"));
      } catch(e) {
        console.error("Firebase init error:", e);
        setFbStatus(false, "Firebase: ვერ დაუკავშირდა ✗");
      }
    }

    // ==========================================================
    // SHA-256 UTILITY (Web Crypto API)
    // ==========================================================
    async function sha256(str) {
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
      } catch(e) {
        console.warn('SHA-256 fallback:', e);
        // Simple fallback (not cryptographically secure, for environments without Web Crypto)
        let hash = 0;
        for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
        return 'fb_' + Math.abs(hash).toString(16).padStart(8,'0');
      }
    }

    // ==========================================================
    // STATE VARIABLES
    // ==========================================================
    let selectedDate = new Date();
    let currentYear = selectedDate.getFullYear();
    let isAdmin = false;
    let isLocked = false;
    let currentUser = null; // { id, username, role, allowedDepartments, mustChangePassword, active }

    const AUTH_STORE_KEY = 'inpatientsAuth_v1';
    const SESSION_KEY = 'inpatients_session_v2';
    const DEFAULT_AUTH = { admin: 'admin1', user: 'htmc' };
    let authCache = { ...DEFAULT_AUTH };

    const BASE_DEPTS = [
      "ზრდასრულთა ემერჯენსი","ქირურგია","რეანიმაცია","კარდიორეანიმაცია","ბავშვთა ემერჯენსი","ბავშვთა რეანიმაცია",
      "ნევროლოგია","ნეიროქირურგია","ნეირორეანიმაცია","თორაკოქირურგია","ტრავმატოლოგია","ანგიოქირურგია",
      "ყბა-სახის ქირურგია","უროლოგია","ბავშვთა ქირურგია","პედიატრია","ბავშვთა ონკოჰემატოლოგია","ნეფროლოგია",
      "ჰეპატოლოგია","ინფექციური","შინაგანი მედიცინა","კარდიოლოგია","ონკოჰემატოლოგია 1","ონკოჰემატოლოგია 2",
      "გინეკოლოგია","ძვლის ტვინის გადანერგვა","მამოლოგია","ოფთალმოლოგია"
    ];
    const ADMISSION_DEPTS_ONLY = new Set(["ზრდასრულთა ემერჯენსი","ბავშვთა ემერჯენსი"]);
    const deptOrder = [...BASE_DEPTS];
    let dataByDept = new Map();
    let isCurrentlyEditing = false;
    let currentEditingCell = null;
    let unsubscribeDay = null;
    let saveChain = Promise.resolve();
    let saveTimeout = null;
    const extraFieldState = {
      responsiblePerson: { dirty: false, lastRemoteValue: '' },
      urgentOperations: { dirty: false, lastRemoteValue: '' }
    };
    let usersCache = []; // cached list of dept users
    let editingUserId = null; // for user modal

    // ==========================================================
    // PERMISSION HELPERS
    // ==========================================================
    function canWriteDept(dept) {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      return Array.isArray(currentUser.allowedDepartments) && currentUser.allowedDepartments.includes(dept);
    }

    function canWriteNow() {
      return isAdmin || !isLocked;
    }

    function canEditCell(field, dept) {
      if (!canWriteNow()) return false;
      if (field === 'initial' && !isAdmin) return false;
      if (!isAdmin && !canWriteDept(dept)) return false;
      return true;
    }

    // ==========================================================
    // HELPER FUNCTIONS
    // ==========================================================
    function showOverlay(on) {
      const el = document.getElementById('loadingOverlay');
      if (el) el.classList.toggle('show', !!on);
    }

    function showToast(msg, duration = 2200) {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style = 'position:fixed;top:20px;right:20px;background:#333;color:white;padding:15px 25px;border-radius:5px;z-index:9999;max-width:320px;word-break:break-word;';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), duration);
    }

    function setView(view) {
      document.getElementById('authView').style.display = view === 'auth' ? 'block' : 'none';
      document.getElementById('calendarView').style.display = view === 'calendar' ? 'block' : 'none';
      document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
      document.body.classList.toggle('auth-mode', view === 'auth');
    }

    function formatDate(d) {
      const day = String(d.getDate()).padStart(2,'0');
      const month = String(d.getMonth()+1).padStart(2,'0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    }

    function getDocId(date) { return formatDate(date).replace(/\./g,'-'); }

    function dateMinusOneDay(dateObj) {
      const d = new Date(dateObj); d.setDate(d.getDate()-1); return d;
    }

    function safeDeptKey(s) { return String(s || '').trim(); }

    function getExtraFieldIds() { return ['responsiblePerson','urgentOperations']; }

    function getExtraFieldValue(fieldId) {
      const el = document.getElementById(fieldId); return el ? el.value || '' : '';
    }

    function setExtraFieldValue(fieldId, value, options = {}) {
      const el = document.getElementById(fieldId);
      if (!el) return;
      const normalized = value || '';
      const state = extraFieldState[fieldId];
      const isFocused = document.activeElement === el;
      if (!options.force && state && (state.dirty || isFocused)) return;
      el.value = normalized;
      if (state) { state.lastRemoteValue = normalized; state.dirty = false; }
    }

    function markExtraFieldDirty(fieldId) {
      const state = extraFieldState[fieldId]; if (state) state.dirty = true;
    }

    function hasDirtyExtraFields() {
      return getExtraFieldIds().some(id => !!extraFieldState[id]?.dirty);
    }

    function syncExtraFieldAfterSave(fieldId, savedValue) {
      const el = document.getElementById(fieldId);
      const state = extraFieldState[fieldId];
      if (!el || !state) return;
      const normalized = savedValue || '';
      state.lastRemoteValue = normalized;
      if ((el.value || '') === normalized) state.dirty = false;
    }

    function computeFinal(v) {
      return (+v.initial||0)+(+v.admission||0)-(+v.discharge||0)-(+v.transfer||0)-(+v.mortality||0);
    }

    function formatTs(ts) {
      if (!ts) return '—';
      let d;
      if (ts.toDate) d = ts.toDate();
      else if (typeof ts === 'string') d = new Date(ts);
      else d = new Date(ts);
      if (isNaN(d)) return '—';
      return d.toLocaleDateString('ka-GE', { year:'numeric', month:'2-digit', day:'2-digit' });
    }

    // ==========================================================
    // AUTH PASSWORDS (admin plaintext, backward compat)
    // ==========================================================
    function getAuthPasswords() {
      try {
        const raw = localStorage.getItem(AUTH_STORE_KEY);
        if (!raw) return { ...DEFAULT_AUTH };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_AUTH };
        return { admin: String(parsed.admin || DEFAULT_AUTH.admin), user: String(parsed.user || DEFAULT_AUTH.user) };
      } catch { return { ...DEFAULT_AUTH }; }
    }

    function saveAuthPasswords(auth) {
      try { localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(auth)); } catch(e) { console.warn('localStorage save error:', e); }
    }

    async function loadAuthPasswords(forceRemote = false) {
      if (!forceRemote) { authCache = { ...getAuthPasswords() }; }
      if (!db) return { ...authCache };
      try {
        const snap = await db.collection('settings').doc('auth').get();
        if (snap.exists) {
          const data = snap.data() || {};
          const remoteAuth = {
            admin: String(data.admin || authCache.admin || DEFAULT_AUTH.admin),
            user: String(data.user || authCache.user || DEFAULT_AUTH.user)
          };
          authCache = remoteAuth;
          saveAuthPasswords(remoteAuth);
          return { ...remoteAuth };
        }
      } catch(e) { console.warn('Auth load fallback:', e); }
      return { ...authCache };
    }

    async function persistAuthPasswords(auth) {
      const next = { admin: String(auth.admin || DEFAULT_AUTH.admin), user: String(auth.user || DEFAULT_AUTH.user) };
      authCache = next;
      saveAuthPasswords(next);
      if (!db) return;
      try { await db.collection('settings').doc('auth').set(next, { merge: true }); }
      catch(e) { console.error('Auth save error:', e); }
    }

    // ==========================================================
    // SESSION PERSISTENCE
    // ==========================================================
    function saveSession(user) {
      try { localStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, savedAt: Date.now() })); }
      catch(e) { console.warn('Session save error:', e); }
    }

    function loadSession() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        // Session expires after 12 hours
        if (!s || !s.savedAt || (Date.now() - s.savedAt) > 12 * 3600 * 1000) return null;
        return s;
      } catch { return null; }
    }

    function clearSession() {
      try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
    }

    // ==========================================================
    // USER MANAGEMENT - FIRESTORE CRUD
    // ==========================================================
    async function loadUsers() {
      if (!db) return [];
      try {
        const snap = await db.collection('users').get();
        usersCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return usersCache;
      } catch(e) {
        console.error('Load users error:', e);
        return [];
      }
    }

    async function saveUserToFirestore(userObj) {
      if (!db) throw new Error('Firebase not connected');
      const now = firebase.firestore.FieldValue.serverTimestamp();
      if (userObj.id) {
        const { id, ...data } = userObj;
        data.updatedAt = now;
        await db.collection('users').doc(id).set(data, { merge: true });
        return id;
      } else {
        const { id: _id, ...data } = userObj;
        data.createdAt = now;
        data.updatedAt = now;
        const ref = await db.collection('users').add(data);
        return ref.id;
      }
    }

    async function deleteUserFromFirestore(userId) {
      if (!db) throw new Error('Firebase not connected');
      await db.collection('users').doc(userId).delete();
    }

    // Find user by username in Firestore
    async function findUserByUsername(username) {
      if (!db) return null;
      try {
        const snap = await db.collection('users').where('username','==',username).limit(1).get();
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
      } catch(e) {
        console.error('Find user error:', e);
        return null;
      }
    }

    // ==========================================================
    // AUTHENTICATION
    // ==========================================================
    async function checkPassword() {
      const username = (document.getElementById('username').value || '').trim();
      const password = (document.getElementById('password').value || '').trim();

      if (!username) { showToast('მომხმარებლის სახელი სავალდებულოა'); return; }
      if (!password) { showToast('პაროლი სავალდებულოა'); return; }

      const btn = document.getElementById('loginBtn');
      btn.disabled = true;
      btn.textContent = 'შემოწმება...';

      try {
        // ---- ADMIN LOGIN ----
        if (username.toLowerCase() === 'admin') {
          const auth = await loadAuthPasswords(true);
          if (password === auth.admin) {
            currentUser = { id:'admin', username:'admin', role:'admin', allowedDepartments: [...BASE_DEPTS], mustChangePassword: false, active: true };
            isAdmin = true;
            saveSession(currentUser);
            afterLogin();
            return;
          } else {
            showToast('არასწორი პაროლი');
            return;
          }
        }

        // ---- DEPARTMENT USER LOGIN ----
        const user = await findUserByUsername(username);
        if (!user) { showToast('მომხმარებელი ვერ მოიძებნა'); return; }
        if (!user.active) { showToast('ეს ანგარიში დეაქტივირებულია'); return; }

        const passwordHash = await sha256(password);

        // Check temp password first (one-time)
        if (user.passwordType === 'temporary' && user.tempPasswordHash && user.tempPasswordHash === passwordHash) {
          currentUser = { ...user };
          isAdmin = false;
          // Show first-login password change
          openFirstLoginModal();
          return;
        }

        // Check permanent password
        if (user.passwordHash && user.passwordHash === passwordHash) {
          if (user.mustChangePassword) {
            currentUser = { ...user };
            isAdmin = false;
            openFirstLoginModal();
            return;
          }
          currentUser = { ...user };
          isAdmin = false;
          saveSession(currentUser);
          afterLogin();
          return;
        }

        showToast('არასწორი პაროლი');
      } catch(e) {
        console.error('Login error:', e);
        showToast('შესვლა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'შესვლა <span class="auth-login-arrow">→</span>';
      }
    }

    function afterLogin() {
      updateDeptUserInfo();
      setView('calendar');
      currentYear = selectedDate.getFullYear();
      renderCalendar(currentYear);
      showToast(isAdmin ? 'ადმინი ✓' : `შესვლა ✓ (${currentUser.allowedDepartments?.join(', ')})`);
    }

    function logout() {
      clearSession();
      currentUser = null;
      isAdmin = false;
      isLocked = false;
      dataByDept = new Map();
      detachLiveListener();
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      setView('auth');
    }

    function updateDeptUserInfo() {
      const bar = document.getElementById('deptUserInfo');
      if (!bar) return;
      if (!currentUser || currentUser.role === 'admin') {
        bar.style.display = 'none';
        return;
      }
      const depts = currentUser.allowedDepartments || [];
      bar.style.display = 'block';
      bar.innerHTML = `<strong>თქვენი განყოფილება:</strong> ${depts.join(', ')} &nbsp;|&nbsp; <strong>მომხმარებელი:</strong> ${currentUser.username}`;
    }

    // ==========================================================
    // FIRST LOGIN PASSWORD CHANGE
    // ==========================================================
    function openFirstLoginModal() {
      document.getElementById('flNewPw').value = '';
      document.getElementById('flConfirmPw').value = '';
      const m = document.getElementById('firstLoginModal');
      m.classList.add('show');
      m.setAttribute('aria-hidden','false');
      document.getElementById('flNewPw').focus();
    }

    function closeFirstLoginModal() {
      const m = document.getElementById('firstLoginModal');
      m.classList.remove('show');
      m.setAttribute('aria-hidden','true');
    }

    async function handleFirstLoginSave() {
      const newPw = document.getElementById('flNewPw').value;
      const confirmPw = document.getElementById('flConfirmPw').value;

      if (!newPw || newPw.length < 6) { showToast('პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'); return; }
      if (newPw !== confirmPw) { showToast('პაროლები არ ემთხვევა'); return; }

      const btn = document.getElementById('flSaveBtn');
      btn.disabled = true;
      btn.textContent = 'ინახება...';

      try {
        const hash = await sha256(newPw);
        await db.collection('users').doc(currentUser.id).update({
          passwordHash: hash,
          tempPasswordHash: firebase.firestore.FieldValue.delete(),
          passwordType: 'permanent',
          mustChangePassword: false,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        currentUser.passwordHash = hash;
        currentUser.tempPasswordHash = null;
        currentUser.passwordType = 'permanent';
        currentUser.mustChangePassword = false;
        closeFirstLoginModal();
        saveSession(currentUser);
        afterLogin();
        showToast('პაროლი წარმატებით დაყენდა ✓');
      } catch(e) {
        console.error('First login save error:', e);
        showToast('პაროლის შენახვა ვერ მოხერხდა');
      } finally {
        btn.disabled = false;
        btn.textContent = 'პაროლის შენახვა';
      }
    }

    // ==========================================================
    // ADMIN PASSWORD CHANGE MODAL
    // ==========================================================
    function openPasswordChangeModal() {
      const modal = document.getElementById('passwordModal');
      if (!modal) return;
      modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
      document.getElementById('passwordScope').value = 'admin';
      document.getElementById('currentAdminPassword').value = '';
      document.getElementById('newPasswordModal').value = '';
      document.getElementById('confirmPasswordModal').value = '';
      document.getElementById('currentAdminPassword').focus();
    }

    function closePasswordChangeModal() {
      const modal = document.getElementById('passwordModal');
      if (!modal) return;
      modal.classList.remove('show'); modal.setAttribute('aria-hidden','true');
    }

    async function changePasswordByAdminChoice() {
      if (!isAdmin) return;
      const scope = document.getElementById('passwordScope').value;
      const auth = await loadAuthPasswords(true);
      const currentAdminPass = document.getElementById('currentAdminPassword').value;
      if (currentAdminPass !== auth.admin) { showToast('ადმინის მიმდინარე პაროლი არასწორია'); return; }
      const newPass = document.getElementById('newPasswordModal').value;
      if (!newPass || newPass.length < 4) { showToast('ახალი პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო'); return; }
      if (newPass !== document.getElementById('confirmPasswordModal').value) { showToast('პაროლები არ ემთხვევა'); return; }
      if (scope === 'admin') { auth.admin = newPass; }
      else { auth.user = newPass; }
      await persistAuthPasswords(auth);
      closePasswordChangeModal();
      showToast(scope === 'admin' ? 'ადმინის პაროლი შეიცვალა' : 'user პაროლი შეიცვალა');
    }

    // ==========================================================
    // USER MANAGEMENT UI
    // ==========================================================
    async function renderUserManagement() {
      const tbody = document.getElementById('userTableBody');
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">იტვირთება...</td></tr>';
      await loadUsers();
      if (usersCache.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">იუზერები ვერ მოიძებნა. შექმენით ახალი.</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      usersCache.forEach(u => {
        const tr = document.createElement('tr');
        const depts = Array.isArray(u.allowedDepartments) ? u.allowedDepartments.join(', ') : '—';
        tr.innerHTML = `
          <td><strong>${u.username || '—'}</strong></td>
          <td style="font-size:12px;">${depts}</td>
          <td><span class="badge ${u.active ? 'badge-active' : 'badge-inactive'}">${u.active ? 'აქტიური' : 'არააქტიური'}</span></td>
          <td><span class="badge ${u.passwordType === 'temporary' ? 'badge-temp' : 'badge-perm'}">${u.passwordType === 'temporary' ? 'ერთჯერადი' : 'მუდმივი'}</span></td>
          <td style="font-size:12px;">${formatTs(u.createdAt)}</td>
          <td style="font-size:12px;">${formatTs(u.updatedAt)}</td>
          <td>
            <button class="btn-sm btn-sm-edit" onclick="openUserModal('${u.id}')">რედ.</button>
            <button class="btn-sm btn-sm-pass" onclick="openResetPwModal('${u.id}')">პაროლი</button>
            <button class="btn-sm btn-sm-toggle" onclick="toggleUserActive('${u.id}',${!u.active})">${u.active ? 'დეაქტ.' : 'აქტივ.'}</button>
            <button class="btn-sm btn-sm-del" onclick="confirmDeleteUser('${u.id}')">წაშლა</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function openUserModal(userId = null) {
      editingUserId = userId;
      const title = document.getElementById('userModalTitle');
      const umDept = document.getElementById('umDept');

      // Populate department select
      umDept.innerHTML = '';
      BASE_DEPTS.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        umDept.appendChild(opt);
      });

      if (userId) {
        const u = usersCache.find(x => x.id === userId);
        if (!u) return;
        title.textContent = 'იუზერის რედაქტირება';
        document.getElementById('umUsername').value = u.username || '';
        const dept = Array.isArray(u.allowedDepartments) ? u.allowedDepartments[0] : '';
        if (dept) umDept.value = dept;
        document.getElementById('umTempPw').value = '';
        document.getElementById('umTempPwLabel').textContent = 'ახალი ერთჯერადი პაროლი (ცარიელი = არ შეცვალო)';
        document.getElementById('umActive').checked = !!u.active;
      } else {
        title.textContent = 'ახალი იუზერი';
        document.getElementById('umUsername').value = '';
        document.getElementById('umTempPw').value = '';
        document.getElementById('umTempPwLabel').textContent = 'ერთჯერადი პაროლი';
        document.getElementById('umActive').checked = true;
      }

      const m = document.getElementById('userModal');
      m.classList.add('show'); m.setAttribute('aria-hidden','false');
      document.getElementById('umUsername').focus();
    }

    function closeUserModal() {
      const m = document.getElementById('userModal');
      m.classList.remove('show'); m.setAttribute('aria-hidden','true');
      editingUserId = null;
    }

    async function saveUserFromModal() {
      const username = (document.getElementById('umUsername').value || '').trim();
      const dept = document.getElementById('umDept').value;
      const tempPw = (document.getElementById('umTempPw').value || '').trim();
      const active = document.getElementById('umActive').checked;

      if (!username) { showToast('მომხმარებლის სახელი სავალდებულოა'); return; }
      if (username.toLowerCase() === 'admin') { showToast('"admin" სახელი დაკავებულია'); return; }
      if (!dept) { showToast('განყოფილება სავალდებულოა'); return; }

      const btn = document.getElementById('saveUserBtn');
      btn.disabled = true; btn.textContent = 'ინახება...';

      try {
        let userObj = {};

        if (editingUserId) {
          // Edit existing
          const existing = usersCache.find(x => x.id === editingUserId);
          userObj = { id: editingUserId, ...existing };
          userObj.username = username;
          userObj.allowedDepartments = [dept];
          userObj.active = active;

          if (tempPw) {
            // Check uniqueness of username (excluding this user)
            const dup = usersCache.find(x => x.username === username && x.id !== editingUserId);
            if (dup) { showToast(`სახელი "${username}" უკვე გამოყენებულია`); return; }
            userObj.tempPasswordHash = await sha256(tempPw);
            userObj.passwordType = 'temporary';
            userObj.mustChangePassword = true;
          }
        } else {
          // New user
          if (!tempPw) { showToast('ერთჯერადი პაროლი სავალდებულოა'); return; }
          const dup = usersCache.find(x => x.username === username);
          if (dup) { showToast(`სახელი "${username}" უკვე გამოყენებულია`); return; }
          userObj = {
            username,
            role: 'department_user',
            allowedDepartments: [dept],
            tempPasswordHash: await sha256(tempPw),
            passwordHash: null,
            passwordType: 'temporary',
            mustChangePassword: true,
            active
          };
        }

        await saveUserToFirestore(userObj);
        closeUserModal();
        await renderUserManagement();
        showToast(editingUserId ? 'იუზერი განახლდა ✓' : 'იუზერი შეიქმნა ✓');

        if (!editingUserId && tempPw) {
          // Show temp password display
          document.getElementById('tempPwValue').textContent = tempPw;
          document.getElementById('tempPwUsername').textContent = username;
          const tm = document.getElementById('tempPwModal');
          tm.classList.add('show'); tm.setAttribute('aria-hidden','false');
        }
      } catch(e) {
        console.error('Save user error:', e);
        showToast('შენახვა ვერ მოხერხდა: ' + e.message);
      } finally {
        btn.disabled = false; btn.textContent = 'შენახვა';
      }
    }

    async function toggleUserActive(userId, newActive) {
      try {
        await db.collection('users').doc(userId).update({
          active: newActive,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await renderUserManagement();
        showToast(newActive ? 'იუზერი გააქტიურდა' : 'იუზერი დეაქტივირდა');
      } catch(e) {
        console.error('Toggle active error:', e);
        showToast('მოქმედება ვერ შესრულდა');
      }
    }

    async function confirmDeleteUser(userId) {
      const u = usersCache.find(x => x.id === userId);
      if (!u) return;
      if (!confirm(`წაიშალოს იუზერი "${u.username}"?`)) return;
      try {
        await deleteUserFromFirestore(userId);
        await renderUserManagement();
        showToast('იუზერი წაიშალა');
      } catch(e) {
        console.error('Delete user error:', e);
        showToast('წაშლა ვერ მოხერხდა');
      }
    }

    let resetPwUserId = null;
    function openResetPwModal(userId) {
      const u = usersCache.find(x => x.id === userId);
      if (!u) return;
      resetPwUserId = userId;
      document.getElementById('resetPwInfo').textContent = `მომხმარებელი: "${u.username}" — ახალი ერთჯერადი პაროლი:`;
      document.getElementById('resetPwValue').value = '';
      const m = document.getElementById('resetPwModal');
      m.classList.add('show'); m.setAttribute('aria-hidden','false');
      document.getElementById('resetPwValue').focus();
    }

    function closeResetPwModal() {
      const m = document.getElementById('resetPwModal');
      m.classList.remove('show'); m.setAttribute('aria-hidden','true');
      resetPwUserId = null;
    }

    async function saveResetPassword() {
      if (!resetPwUserId) return;
      const newPw = (document.getElementById('resetPwValue').value || '').trim();
      if (!newPw || newPw.length < 4) { showToast('პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო'); return; }
      const btn = document.getElementById('saveResetPwBtn');
      btn.disabled = true; btn.textContent = 'ინახება...';
      try {
        const hash = await sha256(newPw);
        await db.collection('users').doc(resetPwUserId).update({
          tempPasswordHash: hash,
          passwordType: 'temporary',
          mustChangePassword: true,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        const u = usersCache.find(x => x.id === resetPwUserId);
        closeResetPwModal();
        await renderUserManagement();
        showToast('ახალი ერთჯერადი პაროლი დაყენდა ✓');
        if (u) {
          document.getElementById('tempPwValue').textContent = newPw;
          document.getElementById('tempPwUsername').textContent = u.username;
          const tm = document.getElementById('tempPwModal');
          tm.classList.add('show'); tm.setAttribute('aria-hidden','false');
        }
      } catch(e) {
        console.error('Reset pw error:', e);
        showToast('პაროლის შეცვლა ვერ მოხერხდა');
      } finally {
        btn.disabled = false; btn.textContent = 'შენახვა';
      }
    }

    // ==========================================================
    // ADMIN PANEL / LOCK BUTTON
    // ==========================================================
    function updateLockButton() {
      const btn = document.getElementById('adminButton');
      const passBtn = document.getElementById('changePasswordBtn');
      const panel = document.getElementById('adminPanel');
      if (!isAdmin) {
        if (btn) btn.style.display = 'none';
        if (passBtn) passBtn.style.display = 'none';
        if (panel) panel.style.display = 'none';
        return;
      }
      if (btn) { btn.style.display = 'inline-block'; btn.textContent = isLocked ? 'განბლოკვა' : 'დაბლოკვა'; }
      if (passBtn) passBtn.style.display = 'inline-block';
      if (panel) panel.style.display = 'block';
    }

    function setTextareasDisabled() {
      const disabled = !canWriteNow();
      document.getElementById('responsiblePerson').disabled = disabled;
      document.getElementById('urgentOperations').disabled = disabled;
    }

    async function toggleLock() {
      if (!isAdmin) return;
      await commitOpenEditorAndSave();
      isLocked = !isLocked;
      updateLockButton(); setTextareasDisabled(); renderTable();
      await flushPendingSaveNow();
      showToast(isLocked ? 'დღე დაიბლოკა' : 'დღე განიბლოკა');
    }

    // ==========================================================
    // EDITOR COMMIT FUNCTIONS
    // ==========================================================
    function commitOpenEditorToState() {
      const input = document.querySelector('#tableBody input');
      if (!input) { isCurrentlyEditing = false; currentEditingCell = null; return false; }
      const td = input.closest('td');
      if (!td) { isCurrentlyEditing = false; currentEditingCell = null; return false; }
      const dept = safeDeptKey(td.dataset.dept);
      const field = td.dataset.field;
      if (!dept || !field) { isCurrentlyEditing = false; currentEditingCell = null; return false; }
      const base = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0, initialEdited:false };
      const val = Math.max(0, parseInt(input.value,10) || 0);
      const next = { ...base, [field]: val };
      if (field === 'initial' && isAdmin) next.initialEdited = true;
      dataByDept.set(dept, next);
      isCurrentlyEditing = false; currentEditingCell = null;
      renderTable(); return true;
    }

    async function commitOpenEditorAndSave() {
      const changed = commitOpenEditorToState();
      if (changed || hasDirtyExtraFields() || !!saveTimeout) await flushPendingSaveNow();
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
      } catch(e) { console.error('Read error:', e); return null; }
    }

    function normalizeRowsFromDoc(docData) {
      const rows = Array.isArray(docData?.rows) ? docData.rows : [];
      return rows.map(r => ({
        dept: safeDeptKey(r.dept), initial: +r.initial||0, admission: +r.admission||0,
        discharge: +r.discharge||0, transfer: +r.transfer||0, mortality: +r.mortality||0, initialEdited: !!r.initialEdited
      })).filter(r => r.dept);
    }

    function exportPayloadForSave() {
      const rows = deptOrder.map(dept => {
        const v = dataByDept.get(dept) || {};
        return { dept, initial: +v.initial||0, admission: +v.admission||0, discharge: +v.discharge||0, transfer: +v.transfer||0, mortality: +v.mortality||0, initialEdited: !!v.initialEdited };
      });
      return { rows, responsible: getExtraFieldValue('responsiblePerson'), urgent: getExtraFieldValue('urgentOperations'), locked: !!isLocked };
    }

    // ==========================================================
    // SAVE FUNCTION - with department permission check
    // ==========================================================
    async function saveAllData() {
      if (!db || !canWriteNow()) return;
      const docId = getDocId(selectedDate);
      const payload = exportPayloadForSave();
      const responsibleDirty = !!extraFieldState.responsiblePerson?.dirty;
      const urgentDirty = !!extraFieldState.urgentOperations?.dirty;
      setSaveIndicator('ინახება...');

      try {
        const existingSnap = await db.collection('dailyData').doc(docId).get();
        let finalResponsible = payload.responsible;
        let finalUrgent = payload.urgent;
        let finalRows = payload.rows;

        if (existingSnap.exists) {
          const existing = existingSnap.data() || {};

          // Protect extra fields
          if (existing.responsible && !payload.responsible && !responsibleDirty) {
            finalResponsible = existing.responsible;
          }
          if (existing.urgent && !payload.urgent && !urgentDirty) {
            finalUrgent = existing.urgent;
          }

          // For department users: merge only their departments' data
          if (!isAdmin && currentUser && currentUser.role === 'department_user') {
            const allowedSet = new Set(currentUser.allowedDepartments || []);
            const existingRows = normalizeRowsFromDoc(existing);
            const existingMap = new Map(existingRows.map(r => [r.dept, r]));
            // Merge: use existing data for non-allowed depts, use our data for allowed depts
            finalRows = deptOrder.map(dept => {
              if (allowedSet.has(dept)) {
                return payload.rows.find(r => r.dept === dept) || existingMap.get(dept) || { dept, initial:0, admission:0, discharge:0, transfer:0, mortality:0, initialEdited:false };
              } else {
                return existingMap.get(dept) || { dept, initial:0, admission:0, discharge:0, transfer:0, mortality:0, initialEdited:false };
              }
            });
          }
        }

        await db.collection('dailyData').doc(docId).set({
          rows: finalRows,
          responsible: finalResponsible,
          urgent: finalUrgent,
          locked: payload.locked,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        setSaveIndicator('შენახულია ✓');
        syncExtraFieldAfterSave('responsiblePerson', finalResponsible);
        syncExtraFieldAfterSave('urgentOperations', finalUrgent);
        console.log('✅ Saved:', docId);
      } catch(e) {
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
          saveTimeout = null;
          saveChain = saveChain.then(() => saveAllData()).then(resolve).catch(err => { console.error('Save chain error:', err); resolve(); });
        }, 800);
      });
    }

    function flushPendingSaveNow() {
      if (!db || !canWriteNow()) return Promise.resolve();
      if (saveTimeout) { clearTimeout(saveTimeout); saveTimeout = null; }
      saveChain = saveChain.then(() => saveAllData()).catch(err => { console.error('Immediate save error:', err); });
      return saveChain;
    }

    // ==========================================================
    // LIVE LISTENER
    // ==========================================================
    function detachLiveListener() {
      if (typeof unsubscribeDay === 'function') { try { unsubscribeDay(); } catch(e) {} }
      unsubscribeDay = null;
    }

    function attachLiveListener() {
      if (!db) return;
      detachLiveListener();
      const docId = getDocId(selectedDate);
      unsubscribeDay = db.collection('dailyData').doc(docId).onSnapshot(
        { includeMetadataChanges: true },
        snap => {
          if (!snap.exists) return;
          const d = snap.data() || {};
          const fromCache = !!snap.metadata.fromCache;
          const pending = !!snap.metadata.hasPendingWrites;
          setFbStatus(true, pending ? "Firebase: ინახება..." : (fromCache ? "Firebase: ქეშიდან" : "Firebase: სინქრონიზებულია ✓"));
          if (!pending) setSaveIndicator('შენახულია ✓');
          if (isCurrentlyEditing || document.querySelector('#tableBody input')) return;
          if (pending) return;
          applyDayDocToState(d);
        },
        err => { console.error("Listener error:", err); setFbStatus(false, "Firebase: შეცდომა ✗"); }
      );
    }

    function applyDayDocToState(doc) {
      const rows = normalizeRowsFromDoc(doc);
      const map = new Map(); rows.forEach(r => map.set(r.dept, r));
      const next = new Map();
      deptOrder.forEach(dept => {
        const r = map.get(dept);
        next.set(dept, { initial: r?r.initial:0, admission: r?r.admission:0, discharge: r?r.discharge:0, transfer: r?r.transfer:0, mortality: r?r.mortality:0, initialEdited: r?!!r.initialEdited:false });
      });
      dataByDept = next;
      isLocked = !!doc?.locked;
      setExtraFieldValue('responsiblePerson', doc?.responsible || '');
      setExtraFieldValue('urgentOperations', doc?.urgent || '');
      updateLockButton(); setTextareasDisabled(); renderTable();
    }

    function buildStateFromPrevAndToday(prevDoc, todayDoc) {
      const prevRows = normalizeRowsFromDoc(prevDoc);
      const todayRows = normalizeRowsFromDoc(todayDoc);
      const prevFinal = new Map(); prevRows.forEach(r => prevFinal.set(r.dept, computeFinal(r)));
      const todayMap = new Map(); todayRows.forEach(r => todayMap.set(r.dept, r));
      const next = new Map();
      deptOrder.forEach(dept => {
        const saved = todayMap.get(dept);
        let initialVal = 0, initialEdited = false;
        if (saved && saved.initialEdited) { initialVal = saved.initial; initialEdited = true; }
        else if (prevFinal.has(dept)) { initialVal = prevFinal.get(dept) || 0; }
        else { initialVal = saved ? saved.initial : 0; initialEdited = saved ? !!saved.initialEdited : false; }
        next.set(dept, { initial: initialVal, admission: saved?saved.admission:0, discharge: saved?saved.discharge:0, transfer: saved?saved.transfer:0, mortality: saved?saved.mortality:0, initialEdited });
      });
      dataByDept = next;
      isLocked = !!todayDoc?.locked;
      setExtraFieldValue('responsiblePerson', todayDoc?.responsible || '', { force: true });
      setExtraFieldValue('urgentOperations', todayDoc?.urgent || '', { force: true });
      updateLockButton(); setTextareasDisabled(); renderTable();
    }

    async function loadAllData() {
      if (!db) return;
      document.getElementById('selectedDate').textContent = formatDate(selectedDate);
      showOverlay(true); setSaveIndicator('—');
      try {
        attachLiveListener();
        const prevDate = dateMinusOneDay(selectedDate);
        const [prevDoc, todayDoc] = await Promise.all([readDayDoc(prevDate), readDayDoc(selectedDate)]);
        buildStateFromPrevAndToday(prevDoc, todayDoc);
        if (!todayDoc) await saveAllData();
        if (isAdmin) {
          const m = selectedDate.getMonth(), y = selectedDate.getFullYear();
          setStatsSelectors(m, y); await computeMonthlyStats(y, m);
        }
      } catch(e) {
        console.error('❌ Load error:', e);
        showToast('ჩატვირთვა ვერ მოხერხდა');
      } finally { showOverlay(false); }
    }

    // ==========================================================
    // RENDER TABLE
    // ==========================================================
    function renderTable() {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';
      for (const dept of deptOrder) {
        const v = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0 };
        const final = computeFinal(v);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dept}</td>
          <td class="${canEditCell('initial',dept) ? 'editable' : ''}" data-dept="${dept}" data-field="initial">${v.initial}</td>
          <td class="${canEditCell('admission',dept) ? 'editable' : ''}" data-dept="${dept}" data-field="admission">${v.admission}</td>
          <td class="${canEditCell('discharge',dept) ? 'editable' : ''}" data-dept="${dept}" data-field="discharge">${v.discharge}</td>
          <td class="${canEditCell('transfer',dept) ? 'editable' : ''}" data-dept="${dept}" data-field="transfer">${v.transfer}</td>
          <td class="${canEditCell('mortality',dept) ? 'editable' : ''}" data-dept="${dept}" data-field="mortality">${v.mortality}</td>
          <td>${final}</td>
        `;
        tbody.appendChild(tr);
      }
      const totals = deptOrder.reduce((a, dept) => {
        const v = dataByDept.get(dept) || {};
        a.initial+=v.initial||0; a.admission+=v.admission||0; a.discharge+=v.discharge||0;
        a.transfer+=v.transfer||0; a.mortality+=v.mortality||0; a.final+=computeFinal(v); return a;
      }, { initial:0, admission:0, discharge:0, transfer:0, mortality:0, final:0 });
      const totalRow = document.createElement('tr');
      totalRow.className = 'total-row';
      totalRow.innerHTML = `<td>სულ</td><td>${totals.initial}</td><td>${totals.admission}</td><td>${totals.discharge}</td><td>${totals.transfer}</td><td>${totals.mortality}</td><td>${totals.final}</td>`;
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
        if (isCurrentlyEditing && currentEditingCell !== cell) await commitOpenEditorAndSave();
        if (cell.querySelector('input')) return;
        const dept = safeDeptKey(cell.dataset.dept);
        const field = cell.dataset.field;
        if (!dept || !field || !canEditCell(field, dept)) {
          if (!canWriteDept(dept)) showToast('თქვენ არ გაქვთ ამ განყოფილების მონაცემების შეცვლის უფლება');
          return;
        }
        const base = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0 };
        const input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.value = base[field] || 0;
        cell.textContent = ''; cell.appendChild(input);
        isCurrentlyEditing = true; currentEditingCell = cell;
        input.focus(); input.select();
        const commit = async () => {
          const val = Math.max(0, parseInt(input.value,10) || 0);
          const latest = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0 };
          const next = { ...latest, [field]: val };
          if (field === 'initial' && isAdmin) next.initialEdited = true;
          dataByDept.set(dept, next);
          isCurrentlyEditing = false; currentEditingCell = null;
          renderTable(); await flushPendingSaveNow();
        };
        input.addEventListener('blur', commit, { once: true });
        input.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
          if (ev.key === 'Escape') { isCurrentlyEditing = false; currentEditingCell = null; renderTable(); }
        });
      });
      document.addEventListener('mousedown', async e => {
        if (!e.target.closest('#dataTable') && isCurrentlyEditing) await commitOpenEditorAndSave();
      });
    }

    function setupExtraFields() {
      getExtraFieldIds().forEach(id => {
        const el = document.getElementById(id);
        let timeout;
        el.addEventListener('input', () => {
          if (!canWriteNow()) return;
          markExtraFieldDirty(id);
          clearTimeout(timeout);
          timeout = setTimeout(() => enqueueSaveNow(), 1500);
        });
        el.addEventListener('blur', async () => {
          clearTimeout(timeout);
          if (!canWriteNow() || !extraFieldState[id]?.dirty) return;
          await flushPendingSaveNow();
        });
      });
    }

    // ==========================================================
    // CALENDAR
    // ==========================================================
    function renderCalendar(year) {
      document.getElementById('calendarTitle').textContent = `${year} წლის კალენდარი`;
      const container = document.getElementById('calendarContainer');
      container.innerHTML = '';
      const months = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
      const today = new Date();
      for (let m = 0; m < 12; m++) {
        const div = document.createElement('div'); div.className = 'month';
        div.innerHTML = `<h3>${months[m]} ${year}</h3>`;
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ'].forEach(d => { const th = document.createElement('th'); th.textContent = d; headRow.appendChild(th); });
        thead.appendChild(headRow); table.appendChild(thead);
        const tbody = document.createElement('tbody');
        let firstDay = new Date(year, m, 1).getDay();
        firstDay = firstDay === 0 ? 7 : firstDay;
        const daysInMonth = new Date(year, m+1, 0).getDate();
        let day = 1;
        for (let r = 0; r < 6; r++) {
          const tr = document.createElement('tr');
          for (let c = 1; c <= 7; c++) {
            const td = document.createElement('td');
            if ((r === 0 && c < firstDay) || day > daysInMonth) { td.className = 'empty'; }
            else {
              const clickDay = day; td.textContent = day;
              if (year === today.getFullYear() && m === today.getMonth() && day === today.getDate()) td.classList.add('today');
              td.addEventListener('click', async () => {
                await commitOpenEditorAndSave();
                selectedDate = new Date(year, m, clickDay);
                setView('table'); await loadAllData();
              });
              day++;
            }
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
          if (day > daysInMonth) break;
        }
        table.appendChild(tbody); div.appendChild(table); container.appendChild(div);
      }
    }

    // ==========================================================
    // ADMIN MONTHLY STATISTICS
    // ==========================================================
    const monthNames = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];

    function setStatsSelectors(month, year) {
      const mSel = document.getElementById('statsMonth');
      const ySel = document.getElementById('statsYear');
      if (mSel && mSel.options.length === 0) monthNames.forEach((n,i) => { const o = document.createElement('option'); o.value=i; o.textContent=n; mSel.appendChild(o); });
      if (ySel && ySel.options.length === 0) { const base = new Date().getFullYear(); for (let y=base-3;y<=base+3;y++) { const o=document.createElement('option'); o.value=y; o.textContent=y; ySel.appendChild(o); } }
      if (mSel) mSel.value = month;
      if (ySel) ySel.value = year;
    }

    async function computeMonthlyStats(year, month) {
      if (!db) return;
      const days = new Date(year, month+1, 0).getDate();
      let adm = 0, dis = 0, mor = 0;
      const ids = [];
      for (let d=1;d<=days;d++) ids.push(getDocId(new Date(year,month,d)));
      for (let i=0;i<ids.length;i+=10) {
        const chunk = ids.slice(i,i+10);
        const snaps = await Promise.all(chunk.map(id => db.collection('dailyData').doc(id).get().catch(()=>null)));
        snaps.forEach(snap => {
          if (!snap || !snap.exists) return;
          (snap.data().rows||[]).forEach(r => {
            const dept = safeDeptKey(r.dept);
            if (ADMISSION_DEPTS_ONLY.has(dept)) adm += +r.admission||0;
            dis += +r.discharge||0; mor += +r.mortality||0;
          });
        });
      }
      document.getElementById('statAdmission').textContent = adm;
      document.getElementById('statDischarge').textContent = dis;
      document.getElementById('statMortality').textContent = mor;
      const note = document.getElementById('statsNote');
      if (note) note.textContent = `სტატისტიკა: ${monthNames[month]} ${year}`;
    }

    // ==========================================================
    // ADMIN TABS
    // ==========================================================
    function setupAdminTabs() {
      document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const tab = btn.dataset.tab;
          document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
          if (tab === 'users') await renderUserManagement();
        });
      });
    }

    // ==========================================================
    // SETUP
    // ==========================================================
    function setupUI() {
      initFirebase();
      loadAuthPasswords();
      setSaveIndicator('—');

      // Login
      document.getElementById('loginBtn').onclick = checkPassword;
      document.getElementById('username').onkeydown = e => { if (e.key === 'Enter') document.getElementById('password').focus(); };
      document.getElementById('password').onkeydown = e => { if (e.key === 'Enter') checkPassword(); };

      // Logout buttons
      document.getElementById('logoutBtn').onclick = logout;
      document.getElementById('logoutBtnCal').onclick = logout;

      // Calendar nav
      document.getElementById('prevYearBtn').onclick = () => { currentYear--; renderCalendar(currentYear); };
      document.getElementById('nextYearBtn').onclick = () => { currentYear++; renderCalendar(currentYear); };

      // Table controls
      document.getElementById('exportBtn').onclick = async () => { await commitOpenEditorAndSave(); window.print(); };
      document.getElementById('prevDayBtn').onclick = async () => { await commitOpenEditorAndSave(); selectedDate.setDate(selectedDate.getDate()-1); await loadAllData(); };
      document.getElementById('nextDayBtn').onclick = async () => { await commitOpenEditorAndSave(); selectedDate.setDate(selectedDate.getDate()+1); await loadAllData(); };
      document.getElementById('showCalendarBtn').onclick = async () => { await commitOpenEditorAndSave(); setView('calendar'); renderCalendar(currentYear); };
      document.getElementById('adminButton').onclick = toggleLock;
      document.getElementById('changePasswordBtn').onclick = openPasswordChangeModal;
      document.getElementById('cancelPasswordChangeBtn').onclick = closePasswordChangeModal;
      document.getElementById('savePasswordChangeBtn').onclick = changePasswordByAdminChoice;
      document.getElementById('passwordModal').onclick = e => { if (e.target.id === 'passwordModal') closePasswordChangeModal(); };

      // First-login modal
      document.getElementById('flSaveBtn').onclick = handleFirstLoginSave;

      // User management
      document.getElementById('createUserBtn').onclick = () => openUserModal(null);
      document.getElementById('cancelUserBtn').onclick = closeUserModal;
      document.getElementById('saveUserBtn').onclick = saveUserFromModal;
      document.getElementById('userModal').onclick = e => { if (e.target.id === 'userModal') closeUserModal(); };
      document.getElementById('closeTempPwBtn').onclick = () => {
        const m = document.getElementById('tempPwModal');
        m.classList.remove('show'); m.setAttribute('aria-hidden','true');
      };
      document.getElementById('cancelResetPwBtn').onclick = closeResetPwModal;
      document.getElementById('saveResetPwBtn').onclick = saveResetPassword;
      document.getElementById('resetPwModal').onclick = e => { if (e.target.id === 'resetPwModal') closeResetPwModal(); };

      // Admin stats
      const refreshBtn = document.getElementById('refreshStatsBtn');
      if (refreshBtn) refreshBtn.onclick = async () => {
        if (!isAdmin) return;
        await computeMonthlyStats(parseInt(document.getElementById('statsYear').value), parseInt(document.getElementById('statsMonth').value));
      };
      ['statsMonth','statsYear'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onchange = async () => {
          if (!isAdmin) return;
          await computeMonthlyStats(parseInt(document.getElementById('statsYear').value), parseInt(document.getElementById('statsMonth').value));
        };
      });

      setupAdminTabs();
      setupTableEditing();
      setupExtraFields();

      window.onbeforeunload = () => {
        if (isCurrentlyEditing) commitOpenEditorToState();
        if (hasDirtyExtraFields() || saveTimeout) flushPendingSaveNow();
        detachLiveListener();
      };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && (hasDirtyExtraFields() || saveTimeout || isCurrentlyEditing)) {
          if (isCurrentlyEditing) commitOpenEditorToState();
          flushPendingSaveNow();
        }
      });
      window.addEventListener('pagehide', () => {
        if (hasDirtyExtraFields() || saveTimeout || isCurrentlyEditing) {
          if (isCurrentlyEditing) commitOpenEditorToState();
          flushPendingSaveNow();
        }
      });

      setView('auth');
    }

    window.onload = setupUI;
  </script>
</body>
</html>
