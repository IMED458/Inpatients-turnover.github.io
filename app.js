// ============================================================
// INPATIENTS TURNOVER — APPLICATION LOGIC
// ============================================================

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
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
    return 'fb_' + Math.abs(hash).toString(16).padStart(8,'0');
  }
}

// ==========================================================
// STATE VARIABLES
// ==========================================================
let selectedDate = new Date();
let currentYear  = selectedDate.getFullYear();
let isAdmin  = false;
let isLocked = false;
let currentUser = null; // { id, username, role, allowedDepartments, mustChangePassword, active }

const AUTH_STORE_KEY = 'inpatientsAuth_v1';
const SESSION_KEY    = 'inpatients_session_v2';
const DEFAULT_AUTH   = { admin: 'admin1', user: 'htmc' };
let authCache = { ...DEFAULT_AUTH };

const BASE_DEPTS = [
  "ზრდასრულთა ემერჯენსი","ქირურგია","რეანიმაცია","კარდიორეანიმაცია",
  "ბავშვთა ემერჯენსი","ბავშვთა რეანიმაცია","ნევროლოგია","ნეიროქირურგია",
  "ნეირორეანიმაცია","თორაკოქირურგია","ტრავმატოლოგია","ანგიოქირურგია",
  "ყბა-სახის ქირურგია","უროლოგია","ბავშვთა ქირურგია","პედიატრია",
  "ბავშვთა ონკოჰემატოლოგია","ნეფროლოგია","ჰეპატოლოგია","ინფექციური",
  "შინაგანი მედიცინა","კარდიოლოგია","ონკოჰემატოლოგია 1","ონკოჰემატოლოგია 2",
  "გინეკოლოგია","ძვლის ტვინის გადანერგვა","მამოლოგია","ოფთალმოლოგია"
];
const ADMISSION_DEPTS_ONLY = new Set(["ზრდასრულთა ემერჯენსი","ბავშვთა ემერჯენსი"]);
const deptOrder = [...BASE_DEPTS];

let dataByDept = new Map();
let isCurrentlyEditing = false;
let currentEditingCell = null;
let unsubscribeDay = null;
let saveChain  = Promise.resolve();
let saveTimeout = null;

const extraFieldState = {
  responsiblePerson: { dirty: false, lastRemoteValue: '' },
  urgentOperations:  { dirty: false, lastRemoteValue: '' }
};

let usersCache    = [];
let editingUserId = null;
let resetPwUserId = null;

// ==========================================================
// PERMISSION HELPERS
// ==========================================================
function canWriteDept(dept) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return Array.isArray(currentUser.allowedDepartments) && currentUser.allowedDepartments.includes(dept);
}

function canWriteNow() { return isAdmin || !isLocked; }

function canEditCell(field, dept) {
  if (!canWriteNow()) return false;
  if (field === 'initial' && !isAdmin) return false;
  if (!isAdmin && !canWriteDept(dept)) return false;
  return true;
}

// ==========================================================
// HELPERS
// ==========================================================
function showOverlay(on) {
  const el = document.getElementById('loadingOverlay');
  if (el) el.classList.toggle('show', !!on);
}

function showToast(msg, duration = 2500) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;top:20px;right:20px;background:#333;color:white;padding:15px 25px;border-radius:5px;z-index:9999;max-width:320px;word-break:break-word;font-family:inherit;';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

function setView(view) {
  document.getElementById('authView').style.display    = view === 'auth'     ? 'block' : 'none';
  document.getElementById('calendarView').style.display = view === 'calendar' ? 'block' : 'none';
  document.getElementById('tableView').style.display   = view === 'table'    ? 'block' : 'none';
  document.body.classList.toggle('auth-mode', view === 'auth');
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getFullYear()).slice(-2)}`;
}

function getDocId(date) { return formatDate(date).replace(/\./g,'-'); }

function dateMinusOneDay(dateObj) {
  const d = new Date(dateObj); d.setDate(d.getDate()-1); return d;
}

function safeDeptKey(s) { return String(s || '').trim(); }

function getExtraFieldIds() { return ['responsiblePerson','urgentOperations']; }

function getExtraFieldValue(id) {
  const el = document.getElementById(id); return el ? el.value || '' : '';
}

function setExtraFieldValue(id, value, options = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const normalized = value || '';
  const state = extraFieldState[id];
  const isFocused = document.activeElement === el;
  if (!options.force && state && (state.dirty || isFocused)) return;
  el.value = normalized;
  if (state) { state.lastRemoteValue = normalized; state.dirty = false; }
}

function markExtraFieldDirty(id) {
  const s = extraFieldState[id]; if (s) s.dirty = true;
}

function hasDirtyExtraFields() {
  return getExtraFieldIds().some(id => !!extraFieldState[id]?.dirty);
}

function syncExtraFieldAfterSave(id, savedValue) {
  const el = document.getElementById(id);
  const state = extraFieldState[id];
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
  return isNaN(d) ? '—' : d.toLocaleDateString('ka-GE', { year:'numeric', month:'2-digit', day:'2-digit' });
}

// ==========================================================
// AUTH PASSWORDS (admin — plaintext, backward compat)
// ==========================================================
function getAuthPasswords() {
  try {
    const raw = localStorage.getItem(AUTH_STORE_KEY);
    if (!raw) return { ...DEFAULT_AUTH };
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return { ...DEFAULT_AUTH };
    return { admin: String(p.admin || DEFAULT_AUTH.admin), user: String(p.user || DEFAULT_AUTH.user) };
  } catch { return { ...DEFAULT_AUTH }; }
}

function saveAuthPasswords(auth) {
  try { localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(auth)); } catch(e) { console.warn('localStorage error:', e); }
}

async function loadAuthPasswords(forceRemote = false) {
  if (!forceRemote) authCache = { ...getAuthPasswords() };
  if (!db) return { ...authCache };
  try {
    const snap = await db.collection('settings').doc('auth').get();
    if (snap.exists) {
      const d = snap.data() || {};
      const r = {
        admin: String(d.admin || authCache.admin || DEFAULT_AUTH.admin),
        user:  String(d.user  || authCache.user  || DEFAULT_AUTH.user)
      };
      authCache = r; saveAuthPasswords(r); return { ...r };
    }
  } catch(e) { console.warn('Auth load fallback:', e); }
  return { ...authCache };
}

async function persistAuthPasswords(auth) {
  const next = {
    admin: String(auth.admin || DEFAULT_AUTH.admin),
    user:  String(auth.user  || DEFAULT_AUTH.user)
  };
  authCache = next; saveAuthPasswords(next);
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

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
}

// ==========================================================
// USER MANAGEMENT — FIRESTORE CRUD
// ==========================================================
async function loadUsers() {
  if (!db) return [];
  try {
    const snap = await db.collection('users').get();
    usersCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return usersCache;
  } catch(e) { console.error('Load users error:', e); return []; }
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
    data.createdAt = now; data.updatedAt = now;
    const ref = await db.collection('users').add(data);
    return ref.id;
  }
}

async function deleteUserFromFirestore(userId) {
  if (!db) throw new Error('Firebase not connected');
  await db.collection('users').doc(userId).delete();
}

async function findUserByUsername(username) {
  if (!db) return null;
  try {
    const snap = await db.collection('users').where('username','==',username).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch(e) { console.error('Find user error:', e); return null; }
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
  btn.innerHTML = 'შემოწმება...';

  try {
    // --- ADMIN ---
    if (username.toLowerCase() === 'admin') {
      const auth = await loadAuthPasswords(true);
      if (password === auth.admin) {
        currentUser = { id:'admin', username:'admin', role:'admin', allowedDepartments:[...BASE_DEPTS], mustChangePassword:false, active:true };
        isAdmin = true;
        saveSession(currentUser);
        afterLogin();
        return;
      }
      showToast('არასწორი პაროლი');
      return;
    }

    // --- DEPARTMENT USER ---
    const user = await findUserByUsername(username);
    if (!user) { showToast('მომხმარებელი ვერ მოიძებნა'); return; }
    if (!user.active) { showToast('ეს ანგარიში დეაქტივირებულია'); return; }

    const passwordHash = await sha256(password);

    // Temp (one-time) password
    if (user.passwordType === 'temporary' && user.tempPasswordHash && user.tempPasswordHash === passwordHash) {
      currentUser = { ...user };
      isAdmin = false;
      openFirstLoginModal();
      return;
    }

    // Permanent password
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
    showToast('შესვლა ვერ მოხერხდა. სცადეთ ხელახლა.');
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
  showToast(isAdmin ? 'ადმინი ✓' : `შესვლა ✓ — ${currentUser.allowedDepartments?.join(', ')}`);
}

function logout() {
  clearSession();
  currentUser = null; isAdmin = false; isLocked = false;
  dataByDept = new Map();
  detachLiveListener();
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  setView('auth');
}

function updateDeptUserInfo() {
  const bar = document.getElementById('deptUserInfo');
  if (!bar) return;
  if (!currentUser || currentUser.role === 'admin') { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  bar.innerHTML = `<strong>თქვენი განყოფილება:</strong> ${(currentUser.allowedDepartments||[]).join(', ')} &nbsp;|&nbsp; <strong>მომხმარებელი:</strong> ${currentUser.username}`;
}

// ==========================================================
// FIRST-LOGIN PASSWORD CHANGE
// ==========================================================
function openFirstLoginModal() {
  document.getElementById('flNewPw').value = '';
  document.getElementById('flConfirmPw').value = '';
  const m = document.getElementById('firstLoginModal');
  m.classList.add('show'); m.setAttribute('aria-hidden','false');
  document.getElementById('flNewPw').focus();
}

function closeFirstLoginModal() {
  const m = document.getElementById('firstLoginModal');
  m.classList.remove('show'); m.setAttribute('aria-hidden','true');
}

async function handleFirstLoginSave() {
  const newPw     = document.getElementById('flNewPw').value;
  const confirmPw = document.getElementById('flConfirmPw').value;

  if (!newPw || newPw.length < 6) { showToast('პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'); return; }
  if (newPw !== confirmPw) { showToast('პაროლები არ ემთხვევა'); return; }

  const btn = document.getElementById('flSaveBtn');
  btn.disabled = true; btn.textContent = 'ინახება...';
  try {
    const hash = await sha256(newPw);
    await db.collection('users').doc(currentUser.id).update({
      passwordHash:     hash,
      tempPasswordHash: firebase.firestore.FieldValue.delete(),
      passwordType:     'permanent',
      mustChangePassword: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    currentUser.passwordHash      = hash;
    currentUser.tempPasswordHash  = null;
    currentUser.passwordType      = 'permanent';
    currentUser.mustChangePassword = false;
    closeFirstLoginModal();
    saveSession(currentUser);
    afterLogin();
    showToast('პაროლი წარმატებით დაყენდა ✓');
  } catch(e) {
    console.error('First login save error:', e);
    showToast('პაროლის შენახვა ვერ მოხერხდა');
  } finally {
    btn.disabled = false; btn.textContent = 'პაროლის შენახვა';
  }
}

// ==========================================================
// ADMIN PASSWORD CHANGE MODAL
// ==========================================================
function openPasswordChangeModal() {
  const m = document.getElementById('passwordModal');
  if (!m) return;
  m.classList.add('show'); m.setAttribute('aria-hidden','false');
  document.getElementById('passwordScope').value = 'admin';
  ['currentAdminPassword','newPasswordModal','confirmPasswordModal'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('currentAdminPassword').focus();
}

function closePasswordChangeModal() {
  const m = document.getElementById('passwordModal');
  if (!m) return;
  m.classList.remove('show'); m.setAttribute('aria-hidden','true');
}

async function changePasswordByAdminChoice() {
  if (!isAdmin) return;
  const scope = document.getElementById('passwordScope').value;
  const auth  = await loadAuthPasswords(true);
  if (document.getElementById('currentAdminPassword').value !== auth.admin) {
    showToast('ადმინის მიმდინარე პაროლი არასწორია'); return;
  }
  const newPass = document.getElementById('newPasswordModal').value;
  if (!newPass || newPass.length < 4) { showToast('ახალი პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო'); return; }
  if (newPass !== document.getElementById('confirmPasswordModal').value) { showToast('პაროლები არ ემთხვევა'); return; }
  if (scope === 'admin') auth.admin = newPass; else auth.user = newPass;
  await persistAuthPasswords(auth);
  closePasswordChangeModal();
  showToast(scope === 'admin' ? 'ადმინის პაროლი შეიცვალა ✓' : 'user პაროლი შეიცვალა ✓');
}

// ==========================================================
// USER MANAGEMENT UI
// ==========================================================
async function renderUserManagement() {
  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:16px;">იტვირთება...</td></tr>';
  await loadUsers();
  if (!usersCache.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:16px;">იუზერები ვერ მოიძებნა. შექმენით ახალი.</td></tr>';
    return;
  }
  tbody.innerHTML = '';
  usersCache.forEach(u => {
    const depts = Array.isArray(u.allowedDepartments) ? u.allowedDepartments.join(', ') : '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${u.username || '—'}</strong></td>
      <td style="font-size:12px;">${depts}</td>
      <td><span class="badge ${u.active ? 'badge-active' : 'badge-inactive'}">${u.active ? 'აქტიური' : 'არააქტიური'}</span></td>
      <td><span class="badge ${u.passwordType === 'temporary' ? 'badge-temp' : 'badge-perm'}">${u.passwordType === 'temporary' ? 'ერთჯერადი' : 'მუდმივი'}</span></td>
      <td style="font-size:12px;">${formatTs(u.createdAt)}</td>
      <td style="font-size:12px;">${formatTs(u.updatedAt)}</td>
      <td>
        <button class="btn-sm btn-sm-edit"   onclick="openUserModal('${u.id}')">რედ.</button>
        <button class="btn-sm btn-sm-pass"   onclick="openResetPwModal('${u.id}')">პაროლი</button>
        <button class="btn-sm btn-sm-toggle" onclick="toggleUserActive('${u.id}',${!u.active})">${u.active ? 'დეაქტ.' : 'აქტივ.'}</button>
        <button class="btn-sm btn-sm-del"    onclick="confirmDeleteUser('${u.id}')">წაშლა</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function openUserModal(userId = null) {
  editingUserId = userId;
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
    document.getElementById('userModalTitle').textContent = 'იუზერის რედაქტირება';
    document.getElementById('umUsername').value = u.username || '';
    const dept = Array.isArray(u.allowedDepartments) ? u.allowedDepartments[0] : '';
    if (dept) umDept.value = dept;
    document.getElementById('umTempPw').value = '';
    document.getElementById('umTempPwLabel').textContent = 'ახალი ერთჯერადი პაროლი (ცარიელი = არ შეცვალო)';
    document.getElementById('umActive').checked = !!u.active;
  } else {
    document.getElementById('userModalTitle').textContent = 'ახალი იუზერი';
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
  const dept     = document.getElementById('umDept').value;
  const tempPw   = (document.getElementById('umTempPw').value || '').trim();
  const active   = document.getElementById('umActive').checked;

  if (!username) { showToast('მომხმარებლის სახელი სავალდებულოა'); return; }
  if (username.toLowerCase() === 'admin') { showToast('"admin" სახელი დაკავებულია'); return; }
  if (!dept) { showToast('განყოფილება სავალდებულოა'); return; }

  const btn = document.getElementById('saveUserBtn');
  btn.disabled = true; btn.textContent = 'ინახება...';
  try {
    let userObj = {};
    if (editingUserId) {
      const existing = usersCache.find(x => x.id === editingUserId);
      userObj = { id: editingUserId, ...existing, username, allowedDepartments: [dept], active };
      if (tempPw) {
        const dup = usersCache.find(x => x.username === username && x.id !== editingUserId);
        if (dup) { showToast(`სახელი "${username}" უკვე გამოყენებულია`); return; }
        userObj.tempPasswordHash = await sha256(tempPw);
        userObj.passwordType     = 'temporary';
        userObj.mustChangePassword = true;
      }
    } else {
      if (!tempPw) { showToast('ერთჯერადი პაროლი სავალდებულოა'); return; }
      const dup = usersCache.find(x => x.username === username);
      if (dup) { showToast(`სახელი "${username}" უკვე გამოყენებულია`); return; }
      userObj = {
        username, role: 'department_user', allowedDepartments: [dept],
        tempPasswordHash: await sha256(tempPw), passwordHash: null,
        passwordType: 'temporary', mustChangePassword: true, active
      };
    }

    await saveUserToFirestore(userObj);
    closeUserModal();
    await renderUserManagement();
    showToast(editingUserId ? 'იუზერი განახლდა ✓' : 'იუზერი შეიქმნა ✓');

    if (!editingUserId && tempPw) {
      document.getElementById('tempPwValue').textContent   = tempPw;
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
    showToast(newActive ? 'იუზერი გააქტიურდა ✓' : 'იუზერი დეაქტივირდა');
  } catch(e) { console.error('Toggle error:', e); showToast('მოქმედება ვერ შესრულდა'); }
}

async function confirmDeleteUser(userId) {
  const u = usersCache.find(x => x.id === userId);
  if (!u || !confirm(`წაიშალოს იუზერი "${u.username}"?`)) return;
  try {
    await deleteUserFromFirestore(userId);
    await renderUserManagement();
    showToast('იუზერი წაიშალა');
  } catch(e) { console.error('Delete error:', e); showToast('წაშლა ვერ მოხერხდა'); }
}

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
      tempPasswordHash: hash, passwordType: 'temporary', mustChangePassword: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const u = usersCache.find(x => x.id === resetPwUserId);
    closeResetPwModal();
    await renderUserManagement();
    showToast('ახალი ერთჯერადი პაროლი დაყენდა ✓');
    if (u) {
      document.getElementById('tempPwValue').textContent   = newPw;
      document.getElementById('tempPwUsername').textContent = u.username;
      const tm = document.getElementById('tempPwModal');
      tm.classList.add('show'); tm.setAttribute('aria-hidden','false');
    }
  } catch(e) { console.error('Reset pw error:', e); showToast('პაროლის შეცვლა ვერ მოხერხდა'); }
  finally { btn.disabled = false; btn.textContent = 'შენახვა'; }
}

// ==========================================================
// ADMIN PANEL LOCK/UNLOCK
// ==========================================================
function updateLockButton() {
  const btn    = document.getElementById('adminButton');
  const passBtn= document.getElementById('changePasswordBtn');
  const panel  = document.getElementById('adminPanel');
  if (!isAdmin) {
    if (btn)    btn.style.display    = 'none';
    if (passBtn) passBtn.style.display = 'none';
    if (panel)  panel.style.display  = 'none';
    return;
  }
  if (btn)    { btn.style.display = 'inline-block'; btn.textContent = isLocked ? 'განბლოკვა' : 'დაბლოკვა'; }
  if (passBtn)  passBtn.style.display  = 'inline-block';
  if (panel)    panel.style.display    = 'block';
}

function setTextareasDisabled() {
  const d = !canWriteNow();
  document.getElementById('responsiblePerson').disabled = d;
  document.getElementById('urgentOperations').disabled  = d;
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
// EDITOR COMMIT
// ==========================================================
function commitOpenEditorToState() {
  const input = document.querySelector('#tableBody input');
  if (!input) { isCurrentlyEditing = false; currentEditingCell = null; return false; }
  const td = input.closest('td');
  if (!td)   { isCurrentlyEditing = false; currentEditingCell = null; return false; }
  const dept  = safeDeptKey(td.dataset.dept);
  const field = td.dataset.field;
  if (!dept || !field) { isCurrentlyEditing = false; currentEditingCell = null; return false; }
  const base = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0, initialEdited:false };
  const val  = Math.max(0, parseInt(input.value,10) || 0);
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
// FIRESTORE READ / WRITE
// ==========================================================
async function readDayDoc(dateObj) {
  if (!db) return null;
  try {
    const snap = await db.collection('dailyData').doc(getDocId(dateObj)).get();
    return snap.exists ? snap.data() : null;
  } catch(e) { console.error('Read error:', e); return null; }
}

function normalizeRowsFromDoc(docData) {
  const rows = Array.isArray(docData?.rows) ? docData.rows : [];
  return rows.map(r => ({
    dept: safeDeptKey(r.dept), initial: +r.initial||0, admission: +r.admission||0,
    discharge: +r.discharge||0, transfer: +r.transfer||0, mortality: +r.mortality||0,
    initialEdited: !!r.initialEdited
  })).filter(r => r.dept);
}

function exportPayloadForSave() {
  const rows = deptOrder.map(dept => {
    const v = dataByDept.get(dept) || {};
    return { dept, initial:+v.initial||0, admission:+v.admission||0, discharge:+v.discharge||0, transfer:+v.transfer||0, mortality:+v.mortality||0, initialEdited:!!v.initialEdited };
  });
  return { rows, responsible: getExtraFieldValue('responsiblePerson'), urgent: getExtraFieldValue('urgentOperations'), locked: !!isLocked };
}

// ==========================================================
// SAVE — with department-merge protection
// ==========================================================
async function saveAllData() {
  if (!db || !canWriteNow()) return;
  const docId   = getDocId(selectedDate);
  const payload = exportPayloadForSave();
  const respDirty  = !!extraFieldState.responsiblePerson?.dirty;
  const urgDirty   = !!extraFieldState.urgentOperations?.dirty;
  setSaveIndicator('ინახება...');
  try {
    const existingSnap = await db.collection('dailyData').doc(docId).get();
    let finalResponsible = payload.responsible;
    let finalUrgent      = payload.urgent;
    let finalRows        = payload.rows;

    if (existingSnap.exists) {
      const existing = existingSnap.data() || {};

      // Never replace a non-empty field with empty unless user explicitly cleared it
      if (existing.responsible && !payload.responsible && !respDirty) finalResponsible = existing.responsible;
      if (existing.urgent      && !payload.urgent      && !urgDirty)  finalUrgent      = existing.urgent;

      // Department users: merge — only update their own rows, keep others from DB
      if (!isAdmin && currentUser?.role === 'department_user') {
        const allowed      = new Set(currentUser.allowedDepartments || []);
        const existingRows = normalizeRowsFromDoc(existing);
        const existingMap  = new Map(existingRows.map(r => [r.dept, r]));
        finalRows = deptOrder.map(dept => {
          if (allowed.has(dept)) return payload.rows.find(r => r.dept === dept) || existingMap.get(dept) || { dept, initial:0, admission:0, discharge:0, transfer:0, mortality:0, initialEdited:false };
          return existingMap.get(dept) || { dept, initial:0, admission:0, discharge:0, transfer:0, mortality:0, initialEdited:false };
        });
      }
    }

    await db.collection('dailyData').doc(docId).set({
      rows: finalRows, responsible: finalResponsible, urgent: finalUrgent,
      locked: payload.locked, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    setSaveIndicator('შენახულია ✓');
    syncExtraFieldAfterSave('responsiblePerson', finalResponsible);
    syncExtraFieldAfterSave('urgentOperations',  finalUrgent);
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
  saveChain = saveChain.then(() => saveAllData()).catch(err => { console.error('Flush save error:', err); });
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
  unsubscribeDay = db.collection('dailyData').doc(getDocId(selectedDate)).onSnapshot(
    { includeMetadataChanges: true },
    snap => {
      if (!snap.exists) return;
      const d = snap.data() || {};
      const pending   = !!snap.metadata.hasPendingWrites;
      const fromCache = !!snap.metadata.fromCache;
      setFbStatus(true, pending ? "Firebase: ინახება..." : (fromCache ? "Firebase: ქეშიდან" : "Firebase: სინქრონიზებულია ✓"));
      if (!pending) setSaveIndicator('შენახულია ✓');
      if (isCurrentlyEditing || document.querySelector('#tableBody input') || pending) return;
      applyDayDocToState(d);
    },
    err => { console.error("Listener error:", err); setFbStatus(false, "Firebase: შეცდომა ✗"); }
  );
}

function applyDayDocToState(doc) {
  const rows = normalizeRowsFromDoc(doc);
  const map  = new Map(); rows.forEach(r => map.set(r.dept, r));
  const next = new Map();
  deptOrder.forEach(dept => {
    const r = map.get(dept);
    next.set(dept, { initial:r?r.initial:0, admission:r?r.admission:0, discharge:r?r.discharge:0, transfer:r?r.transfer:0, mortality:r?r.mortality:0, initialEdited:r?!!r.initialEdited:false });
  });
  dataByDept = next;
  isLocked   = !!doc?.locked;
  setExtraFieldValue('responsiblePerson', doc?.responsible || '');
  setExtraFieldValue('urgentOperations',  doc?.urgent      || '');
  updateLockButton(); setTextareasDisabled(); renderTable();
}

function buildStateFromPrevAndToday(prevDoc, todayDoc) {
  const prevRows = normalizeRowsFromDoc(prevDoc);
  const todayRows= normalizeRowsFromDoc(todayDoc);
  const prevFinal= new Map(); prevRows.forEach(r => prevFinal.set(r.dept, computeFinal(r)));
  const todayMap = new Map(); todayRows.forEach(r => todayMap.set(r.dept, r));
  const next = new Map();
  deptOrder.forEach(dept => {
    const saved = todayMap.get(dept);
    let initialVal = 0, initialEdited = false;
    if (saved?.initialEdited)      { initialVal = saved.initial; initialEdited = true; }
    else if (prevFinal.has(dept))  { initialVal = prevFinal.get(dept) || 0; }
    else                           { initialVal = saved ? saved.initial : 0; initialEdited = saved ? !!saved.initialEdited : false; }
    next.set(dept, { initial:initialVal, admission:saved?saved.admission:0, discharge:saved?saved.discharge:0, transfer:saved?saved.transfer:0, mortality:saved?saved.mortality:0, initialEdited });
  });
  dataByDept = next;
  isLocked   = !!todayDoc?.locked;
  setExtraFieldValue('responsiblePerson', todayDoc?.responsible || '', { force: true });
  setExtraFieldValue('urgentOperations',  todayDoc?.urgent      || '', { force: true });
  updateLockButton(); setTextareasDisabled(); renderTable();
}

async function loadAllData() {
  if (!db) return;
  document.getElementById('selectedDate').textContent = formatDate(selectedDate);
  showOverlay(true); setSaveIndicator('—');
  try {
    attachLiveListener();
    const [prevDoc, todayDoc] = await Promise.all([readDayDoc(dateMinusOneDay(selectedDate)), readDayDoc(selectedDate)]);
    buildStateFromPrevAndToday(prevDoc, todayDoc);
    if (!todayDoc) await saveAllData();
    if (isAdmin) {
      const m = selectedDate.getMonth(), y = selectedDate.getFullYear();
      setStatsSelectors(m, y); await computeMonthlyStats(y, m);
    }
  } catch(e) {
    console.error('❌ Load error:', e); showToast('ჩატვირთვა ვერ მოხერხდა');
  } finally { showOverlay(false); }
}

// ==========================================================
// RENDER TABLE
// ==========================================================
function renderTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  for (const dept of deptOrder) {
    const v     = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0 };
    const final = computeFinal(v);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${dept}</td>
      <td class="${canEditCell('initial',dept)   ? 'editable':''}" data-dept="${dept}" data-field="initial">${v.initial}</td>
      <td class="${canEditCell('admission',dept) ? 'editable':''}" data-dept="${dept}" data-field="admission">${v.admission}</td>
      <td class="${canEditCell('discharge',dept) ? 'editable':''}" data-dept="${dept}" data-field="discharge">${v.discharge}</td>
      <td class="${canEditCell('transfer',dept)  ? 'editable':''}" data-dept="${dept}" data-field="transfer">${v.transfer}</td>
      <td class="${canEditCell('mortality',dept) ? 'editable':''}" data-dept="${dept}" data-field="mortality">${v.mortality}</td>
      <td>${final}</td>`;
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
    const dept  = safeDeptKey(cell.dataset.dept);
    const field = cell.dataset.field;
    if (!dept || !field || !canEditCell(field, dept)) {
      if (dept && !canWriteDept(dept)) showToast('თქვენ არ გაქვთ ამ განყოფილების მონაცემების შეცვლის უფლება');
      return;
    }
    const base  = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0 };
    const input = document.createElement('input');
    input.type = 'number'; input.min = '0'; input.value = base[field] || 0;
    cell.textContent = ''; cell.appendChild(input);
    isCurrentlyEditing = true; currentEditingCell = cell;
    input.focus(); input.select();
    const commit = async () => {
      const val    = Math.max(0, parseInt(input.value,10) || 0);
      const latest = dataByDept.get(dept) || { initial:0, admission:0, discharge:0, transfer:0, mortality:0 };
      const next   = { ...latest, [field]: val };
      if (field === 'initial' && isAdmin) next.initialEdited = true;
      dataByDept.set(dept, next);
      isCurrentlyEditing = false; currentEditingCell = null;
      renderTable(); await flushPendingSaveNow();
    };
    input.addEventListener('blur',    commit, { once: true });
    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter')  { ev.preventDefault(); commit(); }
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
const monthNames = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];

function renderCalendar(year) {
  document.getElementById('calendarTitle').textContent = `${year} წლის კალენდარი`;
  const container = document.getElementById('calendarContainer');
  container.innerHTML = '';
  const today = new Date();
  for (let m = 0; m < 12; m++) {
    const div = document.createElement('div'); div.className = 'month';
    div.innerHTML = `<h3>${monthNames[m]} ${year}</h3>`;
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ'].forEach(d => {
      const th = document.createElement('th'); th.textContent = d; headRow.appendChild(th);
    });
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
        if ((r === 0 && c < firstDay) || day > daysInMonth) {
          td.className = 'empty';
        } else {
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
  for (let d = 1; d <= days; d++) ids.push(getDocId(new Date(year, month, d)));
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i+10);
    const snaps = await Promise.all(chunk.map(id => db.collection('dailyData').doc(id).get().catch(() => null)));
    snaps.forEach(snap => {
      if (!snap || !snap.exists) return;
      (snap.data().rows || []).forEach(r => {
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
      const paneId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
      document.getElementById(paneId).classList.add('active');
      if (tab === 'users') await renderUserManagement();
    });
  });
}

// ==========================================================
// MAIN SETUP
// ==========================================================
function setupUI() {
  initFirebase();
  loadAuthPasswords();
  setSaveIndicator('—');

  // Login
  document.getElementById('loginBtn').onclick = checkPassword;
  document.getElementById('username').onkeydown = e => { if (e.key === 'Enter') document.getElementById('password').focus(); };
  document.getElementById('password').onkeydown = e => { if (e.key === 'Enter') checkPassword(); };

  // Logout
  document.getElementById('logoutBtn').onclick    = logout;
  document.getElementById('logoutBtnCal').onclick = logout;

  // Calendar navigation
  document.getElementById('prevYearBtn').onclick = () => { currentYear--; renderCalendar(currentYear); };
  document.getElementById('nextYearBtn').onclick = () => { currentYear++; renderCalendar(currentYear); };

  // Table controls
  document.getElementById('exportBtn').onclick = async () => { await commitOpenEditorAndSave(); window.print(); };
  document.getElementById('prevDayBtn').onclick = async () => { await commitOpenEditorAndSave(); selectedDate.setDate(selectedDate.getDate()-1); await loadAllData(); };
  document.getElementById('nextDayBtn').onclick = async () => { await commitOpenEditorAndSave(); selectedDate.setDate(selectedDate.getDate()+1); await loadAllData(); };
  document.getElementById('showCalendarBtn').onclick = async () => { await commitOpenEditorAndSave(); setView('calendar'); renderCalendar(currentYear); };
  document.getElementById('adminButton').onclick   = toggleLock;
  document.getElementById('changePasswordBtn').onclick = openPasswordChangeModal;
  document.getElementById('cancelPasswordChangeBtn').onclick = closePasswordChangeModal;
  document.getElementById('savePasswordChangeBtn').onclick   = changePasswordByAdminChoice;
  document.getElementById('passwordModal').onclick = e => { if (e.target.id === 'passwordModal') closePasswordChangeModal(); };

  // First-login modal
  document.getElementById('flSaveBtn').onclick = handleFirstLoginSave;

  // User management
  document.getElementById('createUserBtn').onclick  = () => openUserModal(null);
  document.getElementById('cancelUserBtn').onclick  = closeUserModal;
  document.getElementById('saveUserBtn').onclick    = saveUserFromModal;
  document.getElementById('userModal').onclick = e => { if (e.target.id === 'userModal') closeUserModal(); };
  document.getElementById('closeTempPwBtn').onclick = () => {
    const m = document.getElementById('tempPwModal');
    m.classList.remove('show'); m.setAttribute('aria-hidden','true');
  };
  document.getElementById('cancelResetPwBtn').onclick = closeResetPwModal;
  document.getElementById('saveResetPwBtn').onclick   = saveResetPassword;
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

  // Page lifecycle — save before navigating away
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
