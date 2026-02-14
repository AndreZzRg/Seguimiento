/* =============================================================
   IETS — Gestión Integral — Application Logic
   ============================================================= */

let S = { user: null, page: 'dashboard' };

/* ---- Helpers ---- */
function avH(u, sz = 26) {
  return `<div class="av" style="width:${sz}px;height:${sz}px;font-size:${sz * .4}px;background:${u.color}">${u.avatar}</div>`;
}

function toast(t, m) {
  const d = document.createElement('div');
  d.className = `toast ${t}`;
  d.textContent = m;
  document.getElementById('toastC').appendChild(d);
  setTimeout(() => d.remove(), 3000);
}

function openModal(h) {
  document.getElementById('mdlC').innerHTML = h;
  document.getElementById('modal').classList.add('on');
}
function closeModal() { document.getElementById('modal').classList.remove('on'); }

function stBadge(s) {
  const m = { 'Cumplida': 'b-green', 'Cumplida parcialmente': 'b-purple', 'En progreso': 'b-blue', 'No cumplida': 'b-red', 'Sin iniciar': 'b-muted', 'No aplica': 'b-muted' };
  return `<span class="badge ${m[s] || 'b-muted'}">${s}</span>`;
}

function progHTML(v) {
  const c = v >= 80 ? 'var(--green)' : v >= 40 ? 'var(--yellow)' : 'var(--red)';
  return `<div class="prog"><div class="prog-bar"><div class="prog-fill" style="width:${v}%;background:${c}"></div></div><span class="prog-txt">${v}%</span></div>`;
}

function priBadge(p) {
  return p === 'Alta' ? '<span class="badge b-red">Alta</span>' : p === 'Media' ? '<span class="badge b-yellow">Media</span>' : '<span class="badge b-green">Baja</span>';
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function filterTbl(q, id) {
  document.querySelectorAll('#' + id + ' tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function exportData() {
  toast('i', 'Generando archivo...');
  setTimeout(() => toast('s', 'Archivo exportado'), 1000);
}

/* ============================================================
   AUTH
   ============================================================ */
function doLogin() {
  const uid = parseInt(document.getElementById('demoUser').value);
  S.user = DB.getUser(uid);
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').classList.add('on');
  document.getElementById('uNm').textContent = S.user.name;
  document.getElementById('uRl').textContent = S.user.role + ' · ' + S.user.position;
  document.getElementById('uAv').textContent = S.user.avatar;
  document.getElementById('uAv').style.background = S.user.color;
  buildNav();
  go('dashboard');
  toast('s', 'Bienvenido/a, ' + S.user.name.split(' ')[0]);
}

function doLogout() {
  S.user = null;
  document.getElementById('app').classList.remove('on');
  document.getElementById('loginScreen').style.display = 'flex';
}

/* ============================================================
   NAVIGATION
   ============================================================ */
const NAV = [
  { s: 'Principal', items: [{ id: 'dashboard', ic: '📊', l: 'Dashboard' }, { id: 'activities', ic: '📋', l: 'Mis Actividades', badge: true }, { id: 'meetings', ic: '🤝', l: 'Reuniones 1:1 / N-1' }] },
  { s: 'Organización', items: [{ id: 'objectives', ic: '🎯', l: 'Objetivos de Valor' }, { id: 'processes', ic: '⚙️', l: 'Procesos' }, { id: 'org', ic: '🏢', l: 'Dependencias' }] },
  { s: 'Gestión', items: [{ id: 'all-acts', ic: '📁', l: 'Todas las Actividades', r: ['Administrador', 'Gestor', 'Lector'] }, { id: 'users', ic: '👥', l: 'Usuarios', r: ['Administrador', 'Gestor', 'Lector'] }, { id: 'evals', ic: '📝', l: 'Evaluaciones', r: ['Administrador', 'Gestor', 'Lector'] }, { id: 'ranking', ic: '🏆', l: 'Ranking', r: ['Administrador', 'Gestor', 'Lector'] }, { id: 'reports', ic: '📈', l: 'Informes', r: ['Administrador', 'Gestor', 'Lector'] }] },
  { s: 'Sistema', items: [{ id: 'settings', ic: '⚙️', l: 'Configuración', r: ['Administrador'] }, { id: 'alerts', ic: '🔔', l: 'Notificaciones' }] }
];

function buildNav() {
  let h = '';
  NAV.forEach(sec => {
    h += `<div class="sb-lbl">${sec.s}</div>`;
    sec.items.forEach(it => {
      if (it.r && !it.r.includes(S.user.role)) return;
      const bd = it.badge ? `<span class="sb-badge" id="bdg-${it.id}">0</span>` : '';
      h += `<div class="sb-it" data-pg="${it.id}" onclick="go('${it.id}')"><span class="ic">${it.ic}</span>${it.l}${bd}</div>`;
    });
  });
  document.getElementById('sbMenu').innerHTML = h;
}

function go(pg) {
  S.page = pg;
  document.querySelectorAll('.sb-it').forEach(n => n.classList.toggle('on', n.dataset.pg === pg));
  const T = {
    dashboard: ['Dashboard', 'Resumen general'],
    activities: ['Mis Actividades', 'Estado de tus actividades asignadas'],
    meetings: ['Reuniones 1:1 / N-1', 'Reuniones individuales y de equipo'],
    objectives: ['Objetivos de Valor', 'Objetivos estratégicos, operativos y misionales'],
    processes: ['Procesos', 'Mapa de procesos institucionales'],
    org: ['Dependencias', 'Estructura organizacional'],
    users: ['Usuarios', 'Gestión de usuarios y roles del sistema'],
    'all-acts': ['Todas las Actividades', 'Vista consolidada'],
    evals: ['Evaluaciones', 'Evaluaciones trimestrales con lógica jerárquica'],
    ranking: ['Ranking', 'Clasificación por desempeño'],
    reports: ['Informes', 'Métricas e indicadores'],
    settings: ['Configuración', 'Parámetros del sistema'],
    alerts: ['Notificaciones', 'Historial de alertas']
  };
  const [t, st] = T[pg] || ['', ''];
  document.getElementById('pgT').textContent = t;
  document.getElementById('pgS').textContent = st;
  const canCreate = ['Administrador', 'Gestor'].includes(S.user.role);
  document.getElementById('hdActs').innerHTML = canCreate
    ? `<button class="btn btn-s btn-sm" onclick="exportData()">📥 Exportar</button><button class="btn btn-p btn-sm" onclick="openActForm()">+ Actividad</button>`
    : `<button class="btn btn-s btn-sm" onclick="exportData()">📥 Exportar</button>`;
  render();
  document.getElementById('sidebar').classList.remove('open');
}

function render() {
  const c = document.getElementById('pageContainer');
  const fn = {
    dashboard: rDash, activities: rMyActs, meetings: rMeets,
    objectives: rObjs, processes: rProcs, org: rOrg,
    users: rUsers, 'all-acts': rAllActs, evals: rEvals,
    ranking: rRanking, reports: rReports, settings: rSettings, alerts: rAlerts
  };
  c.innerHTML = fn[S.page] ? fn[S.page]() : '';
  const b = document.getElementById('bdg-activities');
  if (b) {
    const myActs = DB.getActivitiesByUser(S.user.id);
    b.textContent = myActs.filter(a => !['Cumplida', 'No aplica'].includes(a.status)).length;
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function rDash() {
  const stats = DB.getActivityStats();
  const total = stats.total, done = stats.done, prog = stats.inProgress, fail = stats.failed;
  const avgP = Math.round(stats.avgProgress);
  const objs = DB.getObjectives();
  const objAvg = objs.length ? Math.round(objs.reduce((s, o) => s + DB.calcObjProgress(o.id), 0) / objs.length) : 0;

  const acts = DB.getActivities();
  let chart = '', labels = '';
  for (let w = 1; w <= 8; w++) {
    const wa = acts.filter(a => a.week === w);
    const wt = wa.length || 1;
    const wd = wa.filter(a => a.status === 'Cumplida').length;
    const p = Math.round(wd / wt * 100);
    const c = p >= 70 ? 'var(--green)' : p >= 40 ? 'var(--yellow)' : 'var(--red)';
    const h = Math.max(p, 4);
    chart += `<div style="flex:1;background:${c};height:${h}%;border-radius:4px 4px 0 0;min-width:20px;position:relative;cursor:default" title="S${w}: ${p}%"><span style="position:absolute;bottom:calc(100%+2px);left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:var(--text2)">${p}%</span></div>`;
    labels += `<span style="flex:1;text-align:center;font-size:9px;color:var(--text3);font-weight:600">S${w}</span>`;
  }

  let rows = '';
  acts.slice(0, 8).forEach(a => {
    const u = DB.getUser(a.responsible);
    const dr = a.dragged ? '<span class="badge b-yellow" style="font-size:9px;padding:1px 5px">arrastrada</span>' : '';
    rows += `<tr><td style="max-width:200px"><span style="font-weight:600">${esc(a.description).substring(0, 50)}${a.description.length > 50 ? '...' : ''}</span> ${dr}</td><td><b>S${a.week}</b></td><td>${u ? esc(u.name.split(' ')[0]) : '—'}</td><td>${stBadge(a.status)}</td><td>${progHTML(a.progress)}</td><td><button class="btn btn-g btn-sm" onclick="viewAct(${a.id})">👁</button><button class="btn btn-g btn-sm" onclick="editAct(${a.id})">✏️</button></td></tr>`;
  });

  return `<div class="st-grid">
    <div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">📋</div><div class="st-v">${total}</div><div class="st-l">Total Actividades</div></div>
    <div class="st"><div class="st-ic" style="background:var(--green-bg);color:var(--green)">✓</div><div class="st-v">${done}</div><div class="st-l">Cumplidas (${total ? Math.round(done / total * 100) : 0}%)</div></div>
    <div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">⟳</div><div class="st-v">${prog}</div><div class="st-l">En Progreso</div></div>
    <div class="st"><div class="st-ic" style="background:var(--red-bg);color:var(--red)">!</div><div class="st-v">${fail}</div><div class="st-l">No Cumplidas</div></div>
    <div class="st"><div class="st-ic" style="background:var(--purple-bg);color:var(--purple)">%</div><div class="st-v">${avgP}%</div><div class="st-l">Avance Promedio</div></div>
    <div class="st"><div class="st-ic" style="background:var(--teal-bg);color:var(--teal)">🎯</div><div class="st-v">${objAvg}%</div><div class="st-l">Avance Objetivos</div></div>
  </div>
  <div class="g2" style="margin-bottom:16px">
    <div class="card"><div class="card-h"><h3>Cumplimiento por Semana</h3></div><div class="card-b"><div style="display:flex;align-items:flex-end;gap:5px;height:100px">${chart}</div><div style="display:flex;gap:5px;margin-top:4px">${labels}</div></div></div>
    <div class="card"><div class="card-h"><h3>Objetivos de Valor</h3><button class="btn btn-g btn-sm" onclick="go('objectives')">Ver →</button></div><div class="card-b">${objs.slice(0, 4).map(o => {
      const op = DB.calcObjProgress(o.id);
      return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:600">${esc(o.name).substring(0, 35)}...</span><span style="font-weight:700">${op}%</span></div>${progHTML(op)}</div>`;
    }).join('')}</div></div>
  </div>
  <div class="card"><div class="card-h"><h3>Actividades Recientes</h3><input class="search" placeholder="Buscar..." oninput="filterTbl(this.value,'dTbl')"></div><div class="tw"><table><thead><tr><th>Actividad</th><th>Sem.</th><th>Resp.</th><th>Estado</th><th>Avance</th><th>Acc.</th></tr></thead><tbody id="dTbl">${rows}</tbody></table></div></div>`;
}

/* ============================================================
   MIS ACTIVIDADES
   ============================================================ */
function rMyActs() {
  const acts = DB.getActivitiesByUser(S.user.id);
  let rows = '';
  acts.forEach(a => {
    const o = a.objective_id ? DB.getObjective(a.objective_id) : null;
    const p = a.process_id ? DB.getProcess(a.process_id) : null;
    const dr = a.dragged ? '<span class="badge b-yellow" style="font-size:9px;padding:1px 5px">🔄</span>' : '';
    rows += `<tr><td style="font-weight:600;color:var(--accent)">${esc(a.month)}</td><td>S${a.week}</td><td style="max-width:180px"><span style="font-weight:500">${esc(a.description).substring(0, 45)}...</span>${dr}</td><td>${stBadge(a.status)}</td><td>${progHTML(a.progress)}</td><td>${priBadge(a.priority)}</td><td style="font-size:11px;color:var(--teal)">${o ? esc(o.name).substring(0, 20) + '...' : '—'}</td><td style="font-size:11px;color:var(--text3)">${p ? esc(p.code) : '—'}</td><td style="max-width:100px;font-size:11px">${esc(a.observations || '—')}</td><td style="max-width:80px;font-size:11px;color:var(--yellow)">${esc(a.pending || '—')}</td><td><button class="btn btn-g btn-sm" onclick="editAct(${a.id})">⚡</button><button class="btn btn-g btn-sm" onclick="viewAct(${a.id})">👁</button></td></tr>`;
  });
  if (!rows) rows = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text3)">No tienes actividades asignadas.</td></tr>`;
  return `<div class="card"><div class="card-h"><h3>Mis Actividades</h3></div><div class="tw"><table><thead><tr><th>Mes</th><th>Sem.</th><th>Actividad</th><th>Estado</th><th>Avance</th><th>Pri.</th><th>Objetivo</th><th>Proceso</th><th>Obs.</th><th>Pend.</th><th>Acc.</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

/* ============================================================
   REUNIONES — with restored avatar interface
   ============================================================ */
function rMeets() {
  const canC = ['Administrador', 'Gestor'].includes(S.user.role);
  const meets = DB.getMeetings();

  function renderMeetCard(m) {
    const leader = DB.getUser(m.leader);
    const stB = m.status === 'Completada' ? '<span class="badge b-green">Completada</span>' : '<span class="badge b-yellow">Pendiente</span>';
    const items = m.items.map(it => `<li><span class="chk ${it.done ? 'on' : ''}" onclick="toggleMeetItem(${it.id})">${it.done ? '✓' : ''}</span><span style="${it.done ? 'text-decoration:line-through;color:var(--text3)' : ''}">${esc(it.text)}</span></li>`).join('');

    let avatarSection = '';
    if (m.type === '1:1' && m.participants.length) {
      const collab = m.participants[0];
      avatarSection = `<div class="meet-avatar-pair">
        ${leader ? avH(leader, 42) : ''}
        <span class="meet-arrow">⟷</span>
        ${avH(collab, 42)}
        <div class="meet-pair-info">
          <div class="names">${leader ? esc(leader.name) : ''} → ${esc(collab.name)}</div>
          <div class="roles">${leader ? esc(leader.position) : ''} · ${esc(collab.position)}</div>
        </div>
        ${stB}
      </div>`;
    } else {
      const teamAvatars = m.participants.map(p => avH(p, 30)).join('');
      avatarSection = `<div class="meet-team-header">
        <div class="meet-leader-av">${leader ? avH(leader, 42) : ''}</div>
        <div class="meet-team-avatars">${teamAvatars}</div>
        <div class="meet-team-info">
          <div class="team-name">${esc(m.title)}</div>
          <div class="team-meta">${m.participants.length} participantes · 📅 ${m.date}</div>
        </div>
        ${stB}
      </div>`;
    }

    return `<div class="meet">
      ${avatarSection}
      ${m.type === '1:1' ? `<h4>${esc(m.title)}</h4><div style="font-size:11px;color:var(--text3);margin-bottom:6px">📅 ${m.date}</div>` : ''}
      <ul class="meet-items">${items}</ul>
      ${m.notes ? `<div style="margin-top:8px;font-size:11px;color:var(--text2);background:var(--bg);padding:8px;border-radius:6px">💬 ${esc(m.notes)}</div>` : ''}
      <div style="margin-top:8px;display:flex;gap:4px">
        <button class="btn btn-g btn-sm" onclick="editMeet(${m.id})">✏️ Editar</button>
        <button class="btn btn-g btn-sm" onclick="deleteMeet(${m.id})" style="color:var(--red)">🗑</button>
      </div>
    </div>`;
  }

  const oneOnOnes = meets.filter(m => m.type === '1:1').map(renderMeetCard).join('');
  const teamMeets = meets.filter(m => m.type === 'N-1').map(renderMeetCard).join('');

  return `${canC ? `<div style="display:flex;gap:6px;margin-bottom:14px"><button class="btn btn-p btn-sm" onclick="openMeetForm('1:1')">+ Reunión 1:1</button><button class="btn btn-s btn-sm" onclick="openMeetForm('N-1')">+ Reunión N-1</button></div>` : ''}
  <div class="tabs"><div class="tab on" onclick="switchTab(this,'t11')">🤝 1:1 One-on-One</div><div class="tab" onclick="switchTab(this,'tN1')">👥 N-1 Equipo</div></div>
  <div class="tab-sec on" id="t11"><p style="font-size:12px;color:var(--text3);margin-bottom:10px">Reuniones individuales líder-colaborador para feedback y desarrollo.</p><div class="g3">${oneOnOnes || '<p style="color:var(--text3);padding:20px;text-align:center">No hay reuniones 1:1</p>'}</div></div>
  <div class="tab-sec" id="tN1"><p style="font-size:12px;color:var(--text3);margin-bottom:10px">Reuniones de equipo con reportes directos (N-1).</p><div class="g3">${teamMeets || '<p style="color:var(--text3);padding:20px;text-align:center">No hay reuniones N-1</p>'}</div></div>`;
}

function switchTab(el, secId) {
  el.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  const container = el.closest('.pg-ct') || document.getElementById('pageContainer');
  container.querySelectorAll('.tab-sec').forEach(s => s.classList.remove('on'));
  document.getElementById(secId).classList.add('on');
}

function toggleMeetItem(itemId) {
  DB.toggleMeetingItem(itemId);
  render();
}

function deleteMeet(id) {
  if (!confirm('¿Eliminar esta reunión?')) return;
  DB.deleteMeeting(id);
  toast('s', 'Reunión eliminada');
  render();
}

/* ============================================================
   OBJETIVOS
   ============================================================ */
function rObjs() {
  const canC = ['Administrador', 'Gestor'].includes(S.user.role);
  const types = ['Estratégico', 'Operativo', 'Misional'];
  let h = canC ? `<button class="btn btn-p btn-sm" onclick="openObjForm()" style="margin-bottom:14px">+ Nuevo Objetivo</button>` : '';
  types.forEach(type => {
    const objs = DB.getObjectives().filter(o => o.type === type);
    h += `<h3 style="font-size:14px;margin:16px 0 8px;color:var(--text2)">🎯 ${type}s (${objs.length})</h3>`;
    objs.forEach(o => {
      const prog = DB.calcObjProgress(o.id);
      const dept = DB.getDept(o.dept);
      const owner = DB.getUser(o.owner);
      const linked = DB.getActivitiesByObjective(o.id);
      const priCls = o.priority === 'Alta' ? 'pri-a' : o.priority === 'Media' ? 'pri-m' : 'pri-b';
      h += `<div class="obj ${priCls}"><h4>${esc(o.name)}</h4><div class="obj-meta">${priBadge(o.priority)} <span class="badge b-blue">${dept ? esc(dept.name).substring(0, 25) : ''}</span> <span class="badge b-muted">${esc(o.quarter)}</span></div>${progHTML(prog)}<div style="margin-top:6px;font-size:11px;color:var(--text3)">${owner ? '👤 ' + esc(owner.name) : ''} · 📎 ${linked.length} actividad${linked.length !== 1 ? 'es' : ''}</div>${canC ? `<div style="margin-top:6px"><button class="btn btn-g btn-sm" onclick="editObj(${o.id})">✏️</button><button class="btn btn-g btn-sm" onclick="deleteObj(${o.id})" style="color:var(--red)">🗑</button></div>` : ''}</div>`;
    });
  });
  return h;
}

function deleteObj(id) {
  const linked = DB.getActivitiesByObjective(id);
  if (linked.length) { toast('e', 'No se puede eliminar: tiene actividades vinculadas'); return; }
  if (!confirm('¿Eliminar objetivo?')) return;
  DB.deleteObjective(id);
  toast('s', 'Objetivo eliminado');
  render();
}

/* ============================================================
   PROCESOS
   ============================================================ */
function rProcs() {
  return `<div class="g3">${DB.getProcesses().map(p => {
    const dept = DB.getDept(p.dept);
    const linked = DB.getActivitiesByProcess(p.id);
    return `<div class="card"><div class="card-b"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">${dept ? dept.icon : '⚙️'}</span><div><div style="font-weight:700;font-size:13px">${esc(p.name)}</div><span style="font-size:11px;color:var(--text3)">${esc(p.code)} · ${dept ? esc(dept.name) : ''}</span></div><span class="badge b-green" style="margin-left:auto">${esc(p.status)}</span></div><p style="font-size:12px;color:var(--text2);margin-bottom:8px">${esc(p.description)}</p><div style="font-size:11px;color:var(--text3)">📎 ${linked.length} actividad${linked.length !== 1 ? 'es' : ''}</div>${linked.slice(0, 3).map(a => `<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)">• ${esc(a.description).substring(0, 40)}... ${stBadge(a.status)}</div>`).join('')}</div></div>`;
  }).join('')}</div>`;
}

/* ============================================================
   DEPENDENCIAS (ORG TREE)
   ============================================================ */
function rOrg() {
  const topDepts = DB.getDepts().filter(d => d.parent === null);
  function rTree(dept, lvl) {
    lvl = lvl || 0;
    const children = DB.getDepts().filter(d => d.parent === dept.id);
    const dUsers = DB.getUsersByDept(dept.id);
    const allIds = [dept.id, ...DB.getChildDeptIds(dept.id)];
    const totalU = DB.getUsers().filter(u => allIds.includes(u.dept)).length;
    let userH = '';
    if (dUsers.length) {
      userH = `<div class="dept-users">${dUsers.map(u => {
        const ua = DB.getActivitiesByUser(u.id);
        const avg = ua.length ? Math.round(ua.reduce((s, a) => s + a.progress, 0) / ua.length) : 0;
        const c = avg >= 70 ? 'var(--green)' : avg >= 40 ? 'var(--yellow)' : 'var(--red)';
        return `<div class="u-card" onclick="viewUser(${u.id})">${avH(u, 28)}<div style="flex:1;min-width:0"><div class="u-nm">${esc(u.name)}</div><div class="u-pos">${esc(u.position)}</div><span class="badge b-blue" style="font-size:9px;padding:1px 5px;margin-top:2px">${esc(u.role)}</span></div><div class="u-pct" style="color:${c}">${avg}%</div></div>`;
      }).join('')}</div>`;
    }
    return `<div class="dept-block" style="margin-left:${lvl * 16}px"><div class="dept-head"><span class="d-icon">${dept.icon}</span><div class="d-info"><h4>${esc(dept.name)}</h4><span>${esc(dept.type)} · ${totalU} persona${totalU !== 1 ? 's' : ''}</span></div><div class="d-count">${totalU}</div></div>${userH}${children.map(c => rTree(c, lvl + 1)).join('')}</div>`;
  }
  return topDepts.map(d => rTree(d)).join('');
}

/* ============================================================
   USUARIOS (GRID)
   ============================================================ */
function rUsers() {
  const isAdmin = S.user.role === 'Administrador';
  const users = DB.getUsers();
  const depts = DB.getDepts();
  const roles = ['Administrador', 'Gestor', 'Lector', 'Usuario'];

  const grouped = {};
  users.forEach(u => { if (!grouped[u.dept]) grouped[u.dept] = []; grouped[u.dept].push(u); });

  const totalUsers = users.length;
  const byRole = {};
  roles.forEach(r => byRole[r] = users.filter(u => u.role === r).length);
  const allActs = DB.getActivities();
  const globalAvg = allActs.length ? Math.round(allActs.reduce((s, a) => s + a.progress, 0) / allActs.length) : 0;

  let h = `<div class="st-grid" style="margin-bottom:20px">
    <div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">👥</div><div class="st-v">${totalUsers}</div><div class="st-l">Total Usuarios</div></div>
    <div class="st"><div class="st-ic" style="background:var(--red-bg);color:var(--red)">🛡️</div><div class="st-v">${byRole['Administrador'] || 0}</div><div class="st-l">Administradores</div></div>
    <div class="st"><div class="st-ic" style="background:var(--green-bg);color:var(--green)">📋</div><div class="st-v">${byRole['Gestor'] || 0}</div><div class="st-l">Gestores</div></div>
    <div class="st"><div class="st-ic" style="background:var(--purple-bg);color:var(--purple)">👁️</div><div class="st-v">${byRole['Lector'] || 0}</div><div class="st-l">Lectores</div></div>
    <div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">👤</div><div class="st-v">${byRole['Usuario'] || 0}</div><div class="st-l">Usuarios</div></div>
    <div class="st"><div class="st-ic" style="background:var(--teal-bg);color:var(--teal)">📊</div><div class="st-v">${globalAvg}%</div><div class="st-l">Avance Global</div></div>
  </div>
  <div class="filters" style="margin-bottom:16px">
    <label>Filtrar:</label>
    <select onchange="filterUC()" id="ufDept"><option value="">Todas las dependencias</option>${depts.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select>
    <select onchange="filterUC()" id="ufRole"><option value="">Todos los roles</option>${roles.map(r => `<option value="${r}">${r}</option>`).join('')}</select>
    <input class="search" id="ufSearch" placeholder="Buscar usuario..." oninput="filterUC()">
  </div>`;

  depts.forEach(dept => {
    const du = grouped[dept.id];
    if (!du || !du.length) return;
    h += `<div class="dept-group" data-dept="${dept.id}"><div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><span style="font-size:16px">${dept.icon}</span><h3 style="font-size:14px;font-weight:700">${esc(dept.name)}</h3><span class="badge b-muted">${du.length}</span></div><div class="ug">`;
    du.forEach(u => {
      const ua = DB.getActivitiesByUser(u.id);
      const total = ua.length;
      const done = ua.filter(a => a.status === 'Cumplida').length;
      const pend = ua.filter(a => !['Cumplida', 'No aplica'].includes(a.status)).length;
      const avg = total ? Math.round(ua.reduce((s, a) => s + a.progress, 0) / total) : 0;
      const evals = DB.getEvalByUser(u.id);
      const ev = evals.length ? evals[0] : null;
      const evS = ev ? DB.calcEvalScore(ev) : null;
      const roleSel = isAdmin ? `<select onchange="chRole(${u.id},this.value)" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;background:#fff">${roles.map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>` : `<span class="badge b-blue">${esc(u.role)}</span>`;
      h += `<div class="uc" data-uid="${u.id}" data-role="${u.role}" data-name="${u.name.toLowerCase()}" data-dept="${u.dept}">
        <div class="uc-head"><div class="av uc-av" style="background:${u.color}">${u.avatar}</div><div class="uc-info"><h4>${esc(u.name)}</h4><p>${esc(u.position)}</p><p style="font-size:10px;color:var(--text4)">${esc(u.email)}</p></div></div>
        <div class="uc-dept">${dept.icon} ${esc(dept.name)}</div>
        <div class="uc-stats"><div class="uc-stat"><div class="num" style="color:var(--accent)">${total}</div><div class="lbl">Actividades</div></div><div class="uc-stat"><div class="num" style="color:var(--green)">${done}</div><div class="lbl">Cumplidas</div></div><div class="uc-stat"><div class="num" style="color:var(--yellow)">${pend}</div><div class="lbl">Pendientes</div></div></div>
        <div style="margin-bottom:10px">${progHTML(avg)}</div>
        ${evS !== null ? `<div style="font-size:11px;color:var(--text3);margin-bottom:10px">📝 Evaluación: <b style="color:${evS >= 80 ? 'var(--green)' : evS >= 60 ? 'var(--yellow)' : 'var(--red)'}">${evS}/100</b></div>` : ''}
        <div class="uc-foot">${roleSel}<button class="btn btn-g btn-sm" onclick="viewUser(${u.id})">Ver perfil →</button></div>
      </div>`;
    });
    h += `</div></div>`;
  });
  return h;
}

function chRole(uid, newRole) {
  const users = DB.getUsers();
  const u = users.find(x => x.id === uid);
  if (!u) return;
  if (u.role === 'Administrador' && newRole !== 'Administrador') {
    if (users.filter(x => x.role === 'Administrador').length <= 1) {
      toast('e', 'Debe existir al menos 1 Administrador');
      render();
      return;
    }
  }
  DB.changeUserRole(uid, newRole);
  toast('s', `Rol de ${u.name.split(' ')[0]} → ${newRole}`);
  render();
}

function filterUC() {
  const df = document.getElementById('ufDept').value;
  const rf = document.getElementById('ufRole').value;
  const sf = (document.getElementById('ufSearch').value || '').toLowerCase();
  document.querySelectorAll('.uc').forEach(c => {
    let show = true;
    if (df && c.dataset.dept !== df) show = false;
    if (rf && c.dataset.role !== rf) show = false;
    if (sf && !c.dataset.name.includes(sf)) show = false;
    c.style.display = show ? '' : 'none';
  });
  document.querySelectorAll('.dept-group').forEach(g => {
    g.style.display = g.querySelectorAll('.uc:not([style*="display: none"])').length ? '' : 'none';
  });
}

/* ============================================================
   TODAS LAS ACTIVIDADES
   ============================================================ */
function rAllActs() {
  const acts = DB.getActivities();
  let rows = '';
  acts.forEach(a => {
    const u = DB.getUser(a.responsible);
    const dept = u ? DB.getDept(u.dept) : null;
    const o = a.objective_id ? DB.getObjective(a.objective_id) : null;
    const dr = a.dragged ? '<span class="badge b-yellow" style="font-size:9px;padding:1px 5px">🔄</span>' : '';
    rows += `<tr><td style="font-weight:600;color:var(--accent)">${esc(a.month)}</td><td>S${a.week}</td><td style="max-width:160px">${esc(a.description).substring(0, 45)}...${dr}</td><td>${u ? esc(u.name.split(' ')[0]) : '—'}</td><td style="font-size:11px">${dept ? esc(dept.name).substring(0, 18) : '—'}</td><td>${stBadge(a.status)}</td><td>${progHTML(a.progress)}</td><td style="font-size:11px">${o ? esc(o.name).substring(0, 18) + '...' : '—'}</td><td><button class="btn btn-g btn-sm" onclick="viewAct(${a.id})">👁</button><button class="btn btn-g btn-sm" onclick="editAct(${a.id})">✏️</button><button class="btn btn-g btn-sm" onclick="deleteAct(${a.id})" style="color:var(--red)">🗑</button></td></tr>`;
  });
  return `<div class="card"><div class="card-h"><h3>Todas las Actividades (${acts.length})</h3><input class="search" placeholder="Buscar..." oninput="filterTbl(this.value,'aTbl')"></div><div class="tw"><table><thead><tr><th>Mes</th><th>Sem.</th><th>Actividad</th><th>Resp.</th><th>Dependencia</th><th>Estado</th><th>Avance</th><th>Objetivo</th><th>Acc.</th></tr></thead><tbody id="aTbl">${rows}</tbody></table></div></div>`;
}

/* ============================================================
   EVALUACIONES — Hierarchical permissions, auto-fill, edit
   ============================================================ */
function rEvals() {
  const canC = ['Administrador', 'Gestor'].includes(S.user.role);
  const dimL = { cumplimiento: 'Cumplimiento', calidad: 'Calidad', puntualidad: 'Puntualidad', colaboracion: 'Colaboración', iniciativa: 'Iniciativa' };

  // Which users can this person evaluate?
  const evaluatable = DB.getEvaluatableUsers(S.user.id);
  const canCreateEval = evaluatable.length > 0;

  let h = '';
  if (canCreateEval) {
    h += `<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn btn-p btn-sm" onclick="openEvalForm()">+ Nueva Evaluación</button>
      <span style="font-size:11px;color:var(--text3);align-self:center">Puede evaluar a: ${evaluatable.map(u => esc(u.name.split(' ')[0])).join(', ')}</span>
    </div>`;
  }

  h += `<div class="g3">${DB.getEvaluations().map(ev => {
    const u = DB.getUser(ev.user_id);
    const dept = u ? DB.getDept(u.dept) : null;
    const by = DB.getUser(ev.evaluated_by);
    const score = DB.calcEvalScore(ev);
    const c = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)';
    const canEdit = DB.canEditEvaluation(S.user.id, ev);
    const autoTag = ev.auto_filled ? '<span class="ev-auto-tag">⚡ Auto-calculado</span>' : '';

    const dimBars = Object.keys(dimL).map(k => {
      const v = ev[k];
      const dc = v >= 80 ? 'var(--green)' : v >= 60 ? 'var(--yellow)' : 'var(--red)';
      return `<div class="ev-dim"><span>${dimL[k]}</span><div class="prog-bar" style="flex:1"><div class="prog-fill" style="width:${v}%;background:${dc}"></div></div><span style="font-size:11px;font-weight:700;min-width:24px;text-align:right">${v}</span></div>`;
    }).join('');

    return `<div class="ev">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        ${u ? avH(u, 34) : ''}
        <div style="flex:1"><div style="font-weight:700">${u ? esc(u.name) : ''}</div><div style="font-size:11px;color:var(--text3)">${u ? esc(u.position) : ''} · ${dept ? esc(dept.name).substring(0, 20) : ''}</div></div>
        <div style="text-align:right"><div class="ev-score" style="color:${c}">${score}</div><div style="font-size:10px;color:var(--text3)">/100</div></div>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">📅 ${esc(ev.period)} · ${esc(ev.type)} · Por: ${by ? esc(by.name.split(' ')[0]) : ''} ${autoTag}</div>
      ${dimBars}
      ${ev.comments ? `<div style="margin-top:8px;font-size:11px;color:var(--text2);background:var(--bg);padding:8px;border-radius:6px">💬 ${esc(ev.comments)}</div>` : ''}
      <div style="margin-top:8px;display:flex;gap:4px">
        ${canEdit ? `<button class="btn btn-g btn-sm" onclick="editEval(${ev.id})">✏️ Editar</button>` : ''}
        ${canEdit ? `<button class="btn btn-g btn-sm" onclick="deleteEval(${ev.id})" style="color:var(--red)">🗑 Eliminar</button>` : ''}
        ${!canEdit && canC ? `<span style="font-size:10px;color:var(--text4);align-self:center">Solo lectura</span>` : ''}
      </div>
    </div>`;
  }).join('')}</div>`;

  return h;
}

function deleteEval(id) {
  if (!confirm('¿Eliminar evaluación?')) return;
  DB.deleteEvaluation(id);
  toast('s', 'Evaluación eliminada');
  render();
}

/* ============================================================
   RANKING
   ============================================================ */
function rRanking() {
  const users = DB.getUsers();
  const evals = DB.getEvaluations();
  const rd = users.map(u => {
    const ua = DB.getActivitiesByUser(u.id);
    const actAvg = ua.length ? Math.round(ua.reduce((s, a) => s + a.progress, 0) / ua.length) : 0;
    const ev = evals.find(e => e.user_id === u.id);
    const evScore = ev ? DB.calcEvalScore(ev) : 0;
    const comp = Math.round(actAvg * .6 + evScore * .4);
    const dept = DB.getDept(u.dept);
    return { u, actAvg, evScore, comp, dept };
  }).sort((a, b) => b.comp - a.comp);

  const indH = rd.map((r, i) => {
    const pc = i === 0 ? 'rk-1' : i === 1 ? 'rk-2' : i === 2 ? 'rk-3' : 'rk-n';
    const c = r.comp >= 80 ? 'var(--green)' : r.comp >= 60 ? 'var(--yellow)' : 'var(--red)';
    return `<div class="rank-it"><div class="rank-pos ${pc}">${i + 1}</div>${avH(r.u, 30)}<div class="r-info"><div class="r-nm">${esc(r.u.name)}</div><div class="r-dept">${esc(r.u.position)} · ${r.dept ? esc(r.dept.name).substring(0, 25) : ''}</div></div><div style="text-align:center;min-width:50px"><div style="font-size:13px;font-weight:700">${r.actAvg}%</div><div style="font-size:9px;color:var(--text3)">Activ.</div></div><div style="text-align:center;min-width:50px"><div style="font-size:13px;font-weight:700">${r.evScore || '—'}</div><div style="font-size:9px;color:var(--text3)">Eval.</div></div><div class="r-score" style="color:${c}">${r.comp}</div></div>`;
  }).join('');

  const deptData = DB.getDepts().filter(d => ['Subdirección', 'Coordinación', 'Jefatura'].includes(d.type));
  const deptRd = deptData.map(dept => {
    const uIds = DB.getUsersByDept(dept.id).map(u => u.id);
    const da = DB.getActivities().filter(a => uIds.includes(a.responsible));
    const avg = da.length ? Math.round(da.reduce((s, a) => s + a.progress, 0) / da.length) : 0;
    return { dept, avg, cnt: uIds.length };
  }).sort((a, b) => b.avg - a.avg);

  const deptH = deptRd.map((r, i) => {
    const pc = i < 3 ? ['rk-1', 'rk-2', 'rk-3'][i] : 'rk-n';
    const c = r.avg >= 70 ? 'var(--green)' : r.avg >= 40 ? 'var(--yellow)' : 'var(--red)';
    return `<div class="rank-it"><div class="rank-pos ${pc}">${i + 1}</div><span style="font-size:16px">${r.dept.icon}</span><div class="r-info"><div class="r-nm">${esc(r.dept.name)}</div><div class="r-dept">${esc(r.dept.type)} · ${r.cnt} personas</div></div><div class="r-score" style="color:${c}">${r.avg}%</div></div>`;
  }).join('');

  return `<div class="tabs"><div class="tab on" onclick="switchTab(this,'rkInd')">👤 Individual</div><div class="tab" onclick="switchTab(this,'rkDept')">🏢 Por Dependencia</div></div>
  <div class="tab-sec on" id="rkInd"><div class="card"><div class="card-h"><h3>🏆 Ranking Individual</h3><span style="font-size:11px;color:var(--text3)">60% actividades + 40% evaluación</span></div>${indH}</div></div>
  <div class="tab-sec" id="rkDept"><div class="card"><div class="card-h"><h3>🏢 Ranking por Dependencia</h3></div>${deptH}</div></div>`;
}

/* ============================================================
   INFORMES
   ============================================================ */
function rReports() {
  const stats = DB.getActivityStats();
  const total = stats.total, done = stats.done;
  const acts = DB.getActivities();
  const dragged = acts.filter(a => a.dragged).length;
  const objs = DB.getObjectives();
  const objAvg = objs.length ? Math.round(objs.reduce((s, o) => s + DB.calcObjProgress(o.id), 0) / objs.length) : 0;
  const activeU = new Set(acts.map(a => a.responsible)).size;

  let bars = '';
  DB.getUsers().forEach(u => {
    const ua = DB.getActivitiesByUser(u.id);
    if (!ua.length) return;
    const avg = Math.round(ua.reduce((s, a) => s + a.progress, 0) / ua.length);
    const c = avg >= 70 ? 'var(--green)' : avg >= 40 ? 'var(--yellow)' : 'var(--red)';
    bars += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="min-width:100px;font-size:12px;font-weight:600">${esc(u.name.split(' ')[0])}</span><div style="flex:1;height:18px;background:var(--bg2);border-radius:4px;overflow:hidden"><div style="width:${avg}%;height:100%;background:${c};border-radius:4px"></div></div><span style="font-size:12px;font-weight:700;min-width:34px">${avg}%</span></div>`;
  });

  return `<div class="st-grid"><div class="st"><div class="st-v" style="color:var(--green)">${total ? Math.round(done / total * 100) : 0}%</div><div class="st-l">Tasa Cumplimiento</div></div><div class="st"><div class="st-v" style="color:var(--yellow)">${total ? Math.round(dragged / total * 100) : 0}%</div><div class="st-l">Tasa Arrastre</div></div><div class="st"><div class="st-v" style="color:var(--teal)">${objAvg}%</div><div class="st-l">Avance Objetivos</div></div><div class="st"><div class="st-v" style="color:var(--accent)">${activeU}</div><div class="st-l">Usuarios Activos</div></div></div>
  <div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Avance por Colaborador</h3></div><div class="card-b">${bars}</div></div>
  <div style="display:flex;gap:8px"><button class="btn btn-s" onclick="exportData()">📥 PDF</button><button class="btn btn-s" onclick="exportData()">📊 Excel</button><button class="btn btn-p" onclick="toast('s','Informe enviado a destinatarios')">📧 Enviar Informe</button></div>`;
}

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
function rSettings() {
  return `<div class="set-sec"><h3>📧 Informes</h3><div class="fg"><label>Destinatarios</label><div class="tag-wrap" id="tagRecipients"><div class="tag">adriana.robayo@iets.org.co <span class="tx" onclick="this.parentElement.remove()">✕</span></div><div class="tag">valentina.acosta@iets.org.co <span class="tx" onclick="this.parentElement.remove()">✕</span></div><input placeholder="Agregar correo..." onkeydown="if(event.key==='Enter'){event.preventDefault();const t=document.createElement('div');t.className='tag';t.innerHTML=this.value+' <span class=tx onclick=this.parentElement.remove()>✕</span>';this.parentElement.insertBefore(t,this);this.value='';}"></div></div></div>
  <div class="set-sec"><h3>🔔 Alertas</h3>
  <div class="tgl-row"><div><div class="tl">Recordatorio viernes 3 PM</div><div class="td">Recordar actualizar actividades</div></div><div class="tgl on" onclick="this.classList.toggle('on')"></div></div>
  <div class="tgl-row"><div><div class="tl">Alerta inactividad</div><div class="td">Sin login en día hábil</div></div><div class="tgl on" onclick="this.classList.toggle('on')"></div></div>
  <div class="tgl-row"><div><div class="tl">Resumen lunes 7 AM</div><div class="td">Resumen semanal cada lunes</div></div><div class="tgl on" onclick="this.classList.toggle('on')"></div></div></div>
  <div class="set-sec"><h3>🗑️ Datos</h3><p style="font-size:12px;color:var(--text2);margin-bottom:10px">Restablecer todos los datos a los valores iniciales (demo).</p><button class="btn btn-d btn-sm" onclick="resetData()">Restablecer datos</button></div>
  <button class="btn btn-p" onclick="toast('s','Configuración guardada')" style="margin-top:6px">💾 Guardar</button>`;
}

/* ============================================================
   NOTIFICACIONES
   ============================================================ */
function rAlerts() {
  const notifs = [
    { t: 'i', text: '2 nuevas actividades asignadas para semana 7.', time: 'Hace 1h' },
    { t: 'w', text: 'Recordatorio: actualice actividades antes del viernes.', time: 'Hoy 3 PM' },
    { t: 's', text: 'Informe semanal enviado exitosamente.', time: 'Viernes 5 PM' },
    { t: 'e', text: 'Carlos Méndez sin login en 2 días hábiles.', time: 'Ayer' },
    { t: 'i', text: 'Reunión 1:1 con Laura completada.', time: 'Hace 3 días' },
    { t: 's', text: 'Objetivo "Modernización TIC" al 65%.', time: 'Hace 4 días' }
  ];
  return `<div class="card"><div class="card-h"><h3>🔔 Notificaciones</h3></div><div class="card-b">${notifs.map(n => {
    const c = { i: 'var(--accent)', w: 'var(--yellow)', s: 'var(--green)', e: 'var(--red)' };
    return `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><div style="width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0;background:${c[n.t]}"></div><div><div style="font-size:13px">${esc(n.text)}</div><div style="font-size:11px;color:var(--text3)">${esc(n.time)}</div></div></div>`;
  }).join('')}</div></div>`;
}

/* ============================================================
   FORM: ACTIVITY (CREATE/EDIT)
   ============================================================ */
function openActForm(editId) {
  const a = editId ? DB.getActivity(editId) : null;
  const isEdit = !!a;
  const users = DB.getUsers();
  const objs = DB.getObjectives();
  const procs = DB.getProcesses();

  const uOpts = users.map(u => `<option value="${u.id}" ${a && a.responsible === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('');
  const oOpts = `<option value="">— Sin vincular —</option>` + objs.map(o => `<option value="${o.id}" ${a && a.objective_id === o.id ? 'selected' : ''}>${esc(o.name).substring(0, 50)}</option>`).join('');
  const pOpts = `<option value="">— Sin vincular —</option>` + procs.map(p => `<option value="${p.id}" ${a && a.process_id === p.id ? 'selected' : ''}>${esc(p.code)} — ${esc(p.name)}</option>`).join('');
  const months = 'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre'.split(',');
  const mOpts = months.map(m => `<option value="${m}" ${a && a.month === m || (!a && m === 'Febrero') ? 'selected' : ''}>${m}</option>`).join('');
  const wOpts = Array.from({ length: 52 }, (_, i) => `<option value="${i + 1}" ${a && a.week === i + 1 || (!a && i + 1 === 7) ? 'selected' : ''}>${i + 1}</option>`).join('');
  const stOpts = 'Sin iniciar,En progreso,Cumplida,Cumplida parcialmente,No cumplida,No aplica'.split(',').map(s => `<option ${a && a.status === s ? 'selected' : ''}>${s}</option>`).join('');
  const priOpts = 'Alta,Media,Baja'.split(',').map(p => `<option ${a && a.priority === p || (!a && p === 'Media') ? 'selected' : ''}>${p}</option>`).join('');

  openModal(`<div class="mdl-hd"><h3>${isEdit ? 'Editar' : 'Nueva'} Actividad</h3><button class="mdl-x" onclick="closeModal()">✕</button></div>
  <div class="mdl-bd">
    <div class="fr"><div class="fg"><label>Mes <span class="req">*</span></label><select class="fsel" id="fM">${mOpts}</select></div><div class="fg"><label>Semana <span class="req">*</span></label><select class="fsel" id="fW">${wOpts}</select></div></div>
    <div class="fg"><label>Actividad <span class="req">*</span></label><textarea class="fta" id="fD" maxlength="500">${a ? esc(a.description) : ''}</textarea></div>
    <div class="fr"><div class="fg"><label>Responsable <span class="req">*</span></label><select class="fsel" id="fR">${uOpts}</select></div><div class="fg"><label>Prioridad</label><select class="fsel" id="fPri">${priOpts}</select></div></div>
    <div class="fr"><div class="fg"><label>Objetivo vinculado</label><select class="fsel" id="fO">${oOpts}</select></div><div class="fg"><label>Proceso vinculado</label><select class="fsel" id="fP">${pOpts}</select></div></div>
    <div class="fr"><div class="fg"><label>Estado</label><select class="fsel" id="fSt">${stOpts}</select></div><div class="fg"><label>Avance %</label><div class="range-wrap"><input type="range" id="fPr" min="0" max="100" step="5" value="${a ? a.progress : 0}" oninput="document.getElementById('fPrV').textContent=this.value+'%'"><span class="rv" id="fPrV">${a ? a.progress : 0}%</span></div></div></div>
    <div class="fg"><label>Fecha límite</label><input type="date" class="fi" id="fDl" value="${a ? a.deadline || '' : ''}"></div>
    <div class="fr"><div class="fg"><label>Observaciones</label><textarea class="fta" id="fObs" rows="2">${a ? esc(a.observations || '') : ''}</textarea></div><div class="fg"><label>Pendientes</label><textarea class="fta" id="fPe" rows="2">${a ? esc(a.pending || '') : ''}</textarea></div></div>
  </div>
  <div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveAct(${editId || 'null'})">${isEdit ? 'Actualizar' : 'Guardar'}</button></div>`);
}

function editAct(id) { openActForm(id); }

function saveAct(editId) {
  const desc = document.getElementById('fD').value.trim();
  if (!desc) { toast('e', 'La descripción es obligatoria'); return; }
  const prog = parseInt(document.getElementById('fPr').value);
  const status = document.getElementById('fSt').value;
  if (prog === 100 && status !== 'Cumplida') { toast('w', '100% → Estado ajustado a Cumplida'); document.getElementById('fSt').value = 'Cumplida'; }
  if (prog === 0 && status === 'Cumplida') { toast('e', '0% no puede ser Cumplida'); return; }

  const data = {
    month: document.getElementById('fM').value,
    week: parseInt(document.getElementById('fW').value),
    description: desc,
    responsible: parseInt(document.getElementById('fR').value),
    assigned_by: S.user.id,
    status: document.getElementById('fSt').value,
    progress: parseInt(document.getElementById('fPr').value),
    priority: document.getElementById('fPri').value,
    objective_id: parseInt(document.getElementById('fO').value) || null,
    process_id: parseInt(document.getElementById('fP').value) || null,
    deadline: document.getElementById('fDl').value,
    observations: document.getElementById('fObs').value.trim(),
    pending: document.getElementById('fPe').value.trim(),
    dragged: false
  };

  if (editId) {
    DB.updateActivity(editId, data);
    toast('s', 'Actividad actualizada');
  } else {
    DB.createActivity(data);
    toast('s', 'Actividad creada');
  }
  closeModal();
  render();
}

function viewAct(id) {
  const a = DB.getActivity(id);
  if (!a) return;
  const u = DB.getUser(a.responsible);
  const by = DB.getUser(a.assigned_by);
  const o = a.objective_id ? DB.getObjective(a.objective_id) : null;
  const p = a.process_id ? DB.getProcess(a.process_id) : null;
  const dept = u ? DB.getDept(u.dept) : null;
  openModal(`<div class="mdl-hd"><h3>Detalle #${a.id}</h3><button class="mdl-x" onclick="closeModal()">✕</button></div>
  <div class="mdl-bd">
    <div class="d-row"><span class="d-label">Periodo</span><span>${esc(a.month)} — Semana ${a.week}</span></div>
    <div class="d-row"><span class="d-label">Actividad</span><span>${esc(a.description)}</span></div>
    <div class="d-row"><span class="d-label">Responsable</span><span>${u ? esc(u.name) : ''} ${dept ? '(' + esc(dept.name).substring(0, 20) + ')' : ''}</span></div>
    <div class="d-row"><span class="d-label">Asignada por</span><span>${by ? esc(by.name) : ''}</span></div>
    <div class="d-row"><span class="d-label">Estado</span><span>${stBadge(a.status)}</span></div>
    <div class="d-row"><span class="d-label">Avance</span><span>${progHTML(a.progress)}</span></div>
    <div class="d-row"><span class="d-label">Objetivo</span><span style="color:var(--teal)">${o ? esc(o.name) : 'Sin vincular'}</span></div>
    <div class="d-row"><span class="d-label">Proceso</span><span>${p ? esc(p.code) + ' — ' + esc(p.name) : 'Sin vincular'}</span></div>
    <div class="d-row"><span class="d-label">Fecha límite</span><span>${a.deadline || 'Sin definir'}</span></div>
    <div class="d-row"><span class="d-label">Observaciones</span><span>${esc(a.observations || '—')}</span></div>
    <div class="d-row" style="border-bottom:none"><span class="d-label">Pendientes</span><span style="color:var(--yellow)">${esc(a.pending || '—')}</span></div>
  </div>
  <div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cerrar</button><button class="btn btn-p" onclick="closeModal();editAct(${a.id})">✏️ Editar</button></div>`);
}

function deleteAct(id) {
  if (!confirm('¿Eliminar actividad #' + id + '?')) return;
  DB.deleteActivity(id);
  toast('s', 'Actividad eliminada');
  render();
}

/* ============================================================
   FORM: MEETING
   ============================================================ */
function openMeetForm(type, editId) {
  const m = editId ? DB.getMeeting(editId) : null;
  const users = DB.getUsers();
  const uOpts = users.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('');
  const isN1 = type === 'N-1';

  openModal(`<div class="mdl-hd"><h3>${m ? 'Editar' : 'Nueva'} Reunión ${type}</h3><button class="mdl-x" onclick="closeModal()">✕</button></div>
  <div class="mdl-bd">
    <div class="fg"><label>Título <span class="req">*</span></label><input class="fi" id="mT" value="${m ? esc(m.title) : ''}"></div>
    <div class="fr"><div class="fg"><label>Líder</label><select class="fsel" id="mL">${uOpts}</select></div>
    <div class="fg"><label>${isN1 ? 'Participantes (ctrl+click)' : 'Colaborador'}</label><select class="fsel" id="mP" ${isN1 ? 'multiple style="min-height:80px"' : ''}>${uOpts}</select></div></div>
    <div class="fr"><div class="fg"><label>Fecha</label><input type="date" class="fi" id="mDt" value="${m ? m.date : ''}"></div>
    <div class="fg"><label>Estado</label><select class="fsel" id="mSt"><option ${m && m.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option><option ${m && m.status === 'Completada' ? 'selected' : ''}>Completada</option></select></div></div>
    <div class="fg"><label>Puntos de agenda (uno por línea)</label><textarea class="fta" id="mIt" rows="4">${m ? m.items.map(i => i.text).join('\n') : ''}</textarea></div>
    <div class="fg"><label>Notas</label><textarea class="fta" id="mN" rows="2">${m ? esc(m.notes || '') : ''}</textarea></div>
  </div>
  <div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveMeet('${type}',${editId || 'null'})">${m ? 'Actualizar' : 'Guardar'}</button></div>`);

  if (m) {
    setTimeout(() => {
      document.getElementById('mL').value = m.leader;
      if (!isN1 && m.participants.length) {
        document.getElementById('mP').value = m.participants[0].id;
      } else if (isN1) {
        const sel = document.getElementById('mP');
        m.participants.forEach(p => {
          const opt = sel.querySelector(`option[value="${p.id}"]`);
          if (opt) opt.selected = true;
        });
      }
    }, 30);
  }
}

function editMeet(id) {
  const m = DB.getMeeting(id);
  if (m) openMeetForm(m.type, id);
}

function saveMeet(type, editId) {
  const title = document.getElementById('mT').value.trim();
  if (!title) { toast('e', 'Título obligatorio'); return; }
  const sel = document.getElementById('mP');
  const itemTexts = document.getElementById('mIt').value.split('\n').filter(l => l.trim());
  const items = itemTexts.map(t => ({ text: t.trim(), d: 0 }));

  const data = {
    type,
    title,
    leader: parseInt(document.getElementById('mL').value),
    participants: type === '1:1' ? [parseInt(sel.value)] : Array.from(sel.selectedOptions).map(o => parseInt(o.value)),
    date: document.getElementById('mDt').value,
    status: document.getElementById('mSt').value,
    notes: document.getElementById('mN').value.trim(),
    items,
    replaceItems: true
  };

  if (editId) {
    DB.updateMeeting(editId, data);
    toast('s', 'Reunión actualizada');
  } else {
    DB.createMeeting(data);
    toast('s', 'Reunión creada');
  }
  closeModal();
  render();
}

/* ============================================================
   FORM: OBJECTIVE
   ============================================================ */
function openObjForm(editId) {
  const o = editId ? DB.getObjective(editId) : null;
  const depts = DB.getDepts();
  const users = DB.getUsers();
  const dOpts = depts.map(d => `<option value="${d.id}" ${o && o.dept === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
  const uOpts = users.map(u => `<option value="${u.id}" ${o && o.owner === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('');

  openModal(`<div class="mdl-hd"><h3>${o ? 'Editar' : 'Nuevo'} Objetivo</h3><button class="mdl-x" onclick="closeModal()">✕</button></div>
  <div class="mdl-bd">
    <div class="fg"><label>Nombre <span class="req">*</span></label><textarea class="fta" id="oN" rows="2">${o ? esc(o.name) : ''}</textarea></div>
    <div class="fr3"><div class="fg"><label>Tipo</label><select class="fsel" id="oT"><option ${o && o.type === 'Estratégico' ? 'selected' : ''}>Estratégico</option><option ${o && o.type === 'Operativo' ? 'selected' : ''}>Operativo</option><option ${o && o.type === 'Misional' ? 'selected' : ''}>Misional</option></select></div>
    <div class="fg"><label>Prioridad</label><select class="fsel" id="oPr"><option ${o && o.priority === 'Alta' ? 'selected' : ''}>Alta</option><option ${o && o.priority === 'Media' || !o ? 'selected' : ''}>Media</option><option ${o && o.priority === 'Baja' ? 'selected' : ''}>Baja</option></select></div>
    <div class="fg"><label>Trimestre</label><select class="fsel" id="oQ"><option ${o && o.quarter === 'Q1' ? 'selected' : ''}>Q1</option><option ${o && o.quarter === 'Q1-Q2' ? 'selected' : ''}>Q1-Q2</option><option ${o && o.quarter === 'Q1-Q3' ? 'selected' : ''}>Q1-Q3</option><option ${o && o.quarter === 'Q1-Q4' ? 'selected' : ''}>Q1-Q4</option></select></div></div>
    <div class="fr"><div class="fg"><label>Dependencia</label><select class="fsel" id="oD">${dOpts}</select></div><div class="fg"><label>Responsable</label><select class="fsel" id="oO">${uOpts}</select></div></div>
  </div>
  <div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveObj(${editId || 'null'})">${o ? 'Actualizar' : 'Guardar'}</button></div>`);
}

function editObj(id) { openObjForm(id); }

function saveObj(editId) {
  const name = document.getElementById('oN').value.trim();
  if (!name) { toast('e', 'Nombre obligatorio'); return; }
  const data = {
    name,
    type: document.getElementById('oT').value,
    priority: document.getElementById('oPr').value,
    quarter: document.getElementById('oQ').value,
    dept: document.getElementById('oD').value,
    owner: parseInt(document.getElementById('oO').value)
  };
  if (editId) {
    DB.updateObjective(editId, data);
    toast('s', 'Objetivo actualizado');
  } else {
    DB.createObjective(data);
    toast('s', 'Objetivo creado');
  }
  closeModal();
  render();
}

/* ============================================================
   FORM: EVALUATION (CREATE/EDIT with auto-fill & hierarchy)
   ============================================================ */
function openEvalForm(editId) {
  const ev = editId ? DB.getEvaluation(editId) : null;
  const isEdit = !!ev;
  const evaluatable = DB.getEvaluatableUsers(S.user.id);

  if (!evaluatable.length && !isEdit) {
    toast('e', 'No tiene usuarios asignados para evaluar');
    return;
  }

  const uOpts = isEdit
    ? `<option value="${ev.user_id}" selected>${esc(DB.getUser(ev.user_id).name)}</option>`
    : evaluatable.map(u => `<option value="${u.id}">${esc(u.name)} — ${esc(u.position)}</option>`).join('');

  openModal(`<div class="mdl-hd"><h3>${isEdit ? 'Editar' : 'Nueva'} Evaluación</h3><button class="mdl-x" onclick="closeModal()">✕</button></div>
  <div class="mdl-bd">
    <div class="fr"><div class="fg"><label>Colaborador</label><select class="fsel" id="evU" ${isEdit ? 'disabled' : ''} onchange="autoFillEvalPreview()">${uOpts}</select></div><div class="fg"><label>Periodo</label><input class="fi" id="evP" value="${ev ? esc(ev.period) : 'Q1 2026'}" ${isEdit ? 'readonly' : ''}></div></div>
    <div class="fg"><label>Tipo</label><select class="fsel" id="evT"><option ${ev && ev.type === 'Trimestral' || !ev ? 'selected' : ''}>Trimestral</option><option ${ev && ev.type === 'Semanal' ? 'selected' : ''}>Semanal</option></select></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 8px">
      <p style="font-size:12px;font-weight:700;color:var(--text2)">Dimensiones (0-100)</p>
      <button class="btn btn-teal btn-sm" type="button" onclick="autoFillEval()">⚡ Auto-rellenar desde actividades</button>
    </div>
    <div id="autoFillMsg" style="display:none;margin-bottom:8px;padding:8px;background:var(--teal-bg);border:1px solid #A7F3D0;border-radius:6px;font-size:11px;color:var(--teal)"></div>
    <div class="fr"><div class="fg"><label>Cumplimiento (25%)</label><div class="range-wrap"><input type="range" id="evD1" min="0" max="100" value="${ev ? ev.cumplimiento : 75}" oninput="document.getElementById('evD1V').textContent=this.value"><span class="rv" id="evD1V">${ev ? ev.cumplimiento : 75}</span></div></div>
    <div class="fg"><label>Calidad (25%)</label><div class="range-wrap"><input type="range" id="evD2" min="0" max="100" value="${ev ? ev.calidad : 75}" oninput="document.getElementById('evD2V').textContent=this.value"><span class="rv" id="evD2V">${ev ? ev.calidad : 75}</span></div></div></div>
    <div class="fr"><div class="fg"><label>Puntualidad (20%)</label><div class="range-wrap"><input type="range" id="evD3" min="0" max="100" value="${ev ? ev.puntualidad : 75}" oninput="document.getElementById('evD3V').textContent=this.value"><span class="rv" id="evD3V">${ev ? ev.puntualidad : 75}</span></div></div>
    <div class="fg"><label>Colaboración (15%)</label><div class="range-wrap"><input type="range" id="evD4" min="0" max="100" value="${ev ? ev.colaboracion : 75}" oninput="document.getElementById('evD4V').textContent=this.value"><span class="rv" id="evD4V">${ev ? ev.colaboracion : 75}</span></div></div></div>
    <div class="fg"><label>Iniciativa (15%)</label><div class="range-wrap"><input type="range" id="evD5" min="0" max="100" value="${ev ? ev.iniciativa : 75}" oninput="document.getElementById('evD5V').textContent=this.value"><span class="rv" id="evD5V">${ev ? ev.iniciativa : 75}</span></div></div>
    <div class="fg"><label>Comentarios</label><textarea class="fta" id="evComm" rows="2" placeholder="Observaciones del evaluador...">${ev ? esc(ev.comments || '') : ''}</textarea></div>
  </div>
  <div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveEval(${editId || 'null'})">${isEdit ? 'Actualizar' : 'Guardar'}</button></div>`);
}

function editEval(id) { openEvalForm(id); }

function autoFillEval() {
  const uid = parseInt(document.getElementById('evU').value);
  if (!uid) { toast('e', 'Seleccione un colaborador primero'); return; }
  const auto = DB.calcAutoEval(uid);
  const u = DB.getUser(uid);

  document.getElementById('evD1').value = auto.cumplimiento;
  document.getElementById('evD1V').textContent = auto.cumplimiento;
  document.getElementById('evD2').value = auto.calidad;
  document.getElementById('evD2V').textContent = auto.calidad;
  document.getElementById('evD3').value = auto.puntualidad;
  document.getElementById('evD3V').textContent = auto.puntualidad;
  document.getElementById('evD4').value = auto.colaboracion;
  document.getElementById('evD4V').textContent = auto.colaboracion;
  document.getElementById('evD5').value = auto.iniciativa;
  document.getElementById('evD5V').textContent = auto.iniciativa;

  const msg = document.getElementById('autoFillMsg');
  const acts = DB.getActivitiesByUser(uid);
  msg.style.display = 'block';
  msg.innerHTML = `⚡ Valores calculados para <b>${esc(u.name)}</b> basado en ${acts.length} actividades y reuniones. Ajuste manualmente si lo requiere.`;

  toast('s', 'Dimensiones auto-calculadas desde datos reales');
}

function autoFillEvalPreview() {
  // When user selection changes, show a hint
  const uid = parseInt(document.getElementById('evU').value);
  if (!uid) return;
  const acts = DB.getActivitiesByUser(uid);
  const msg = document.getElementById('autoFillMsg');
  if (acts.length) {
    msg.style.display = 'block';
    msg.innerHTML = `Este usuario tiene ${acts.length} actividades. Use "Auto-rellenar" para calcular dimensiones automáticamente.`;
  } else {
    msg.style.display = 'block';
    msg.innerHTML = `Este usuario no tiene actividades registradas. Los valores se llenarán con valores base.`;
  }
}

function saveEval(editId) {
  const data = {
    user_id: parseInt(document.getElementById('evU').value),
    period: document.getElementById('evP').value,
    type: document.getElementById('evT').value,
    cumplimiento: parseInt(document.getElementById('evD1').value) || 0,
    calidad: parseInt(document.getElementById('evD2').value) || 0,
    puntualidad: parseInt(document.getElementById('evD3').value) || 0,
    colaboracion: parseInt(document.getElementById('evD4').value) || 0,
    iniciativa: parseInt(document.getElementById('evD5').value) || 0,
    evaluated_by: S.user.id,
    date: new Date().toISOString().split('T')[0],
    comments: document.getElementById('evComm').value.trim(),
    auto_filled: document.getElementById('autoFillMsg').style.display !== 'none' ? 1 : 0
  };

  if (editId) {
    DB.updateEvaluation(editId, data);
    toast('s', 'Evaluación actualizada');
  } else {
    DB.createEvaluation(data);
    toast('s', 'Evaluación registrada');
  }
  closeModal();
  render();
}

/* ============================================================
   USER PROFILE MODAL
   ============================================================ */
function viewUser(uid) {
  const u = DB.getUser(uid);
  if (!u) return;
  const dept = DB.getDept(u.dept);
  const acts = DB.getActivitiesByUser(uid);
  const avg = acts.length ? Math.round(acts.reduce((s, a) => s + a.progress, 0) / acts.length) : 0;
  const done = acts.filter(a => a.status === 'Cumplida').length;
  const pend = acts.filter(a => !['Cumplida', 'No aplica'].includes(a.status)).length;
  const evals = DB.getEvalByUser(uid);
  const ev = evals.length ? evals[0] : null;
  const evScore = ev ? DB.calcEvalScore(ev) : '—';

  // Recent meetings for this user
  const meetings = DB.getMeetingsForUser(uid);
  const meetSection = meetings.length ? `<div style="margin-top:12px"><p style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">Reuniones recientes</p>${meetings.slice(0, 3).map(m => {
    const mt = DB.getMeeting(m.id);
    return `<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--border)">${mt.type === '1:1' ? '🤝' : '👥'} ${esc(mt.title)} · ${mt.status === 'Completada' ? '✅' : '⏳'} ${mt.date}</div>`;
  }).join('')}</div>` : '';

  openModal(`<div class="mdl-hd"><h3>Perfil</h3><button class="mdl-x" onclick="closeModal()">✕</button></div>
  <div class="mdl-bd"><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">${avH(u, 48)}<div><div style="font-weight:700;font-size:16px">${esc(u.name)}</div><div style="font-size:12px;color:var(--text2)">${esc(u.position)}</div><div style="font-size:11px;color:var(--text3)">${esc(u.email)}</div></div></div>
  <div style="display:flex;gap:4px;margin-bottom:14px"><span class="badge b-blue">${esc(u.role)}</span><span class="badge b-muted">${dept ? esc(dept.name) : ''}</span></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px"><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--accent)">${acts.length}</div><div style="font-size:9px;color:var(--text3)">Total</div></div><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--green)">${done}</div><div style="font-size:9px;color:var(--text3)">Cumplidas</div></div><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--yellow)">${pend}</div><div style="font-size:9px;color:var(--text3)">Pendientes</div></div><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--accent)">${avg}%</div><div style="font-size:9px;color:var(--text3)">Avance</div></div></div>
  ${ev ? `<p style="font-size:12px;font-weight:700;margin-bottom:6px">Evaluación ${esc(ev.period)}: <span style="color:var(--accent)">${evScore}/100</span></p>` : ''}
  ${meetSection}</div>
  <div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>`);
}

/* ============================================================
   UTILITIES
   ============================================================ */
function resetData() {
  if (!confirm('¿Restablecer todos los datos? Se perderán todos los cambios.')) return;
  DB.reset();
  toast('s', 'Datos restablecidos');
  render();
}

/* ============================================================
   INIT
   ============================================================ */
async function initApp() {
  try {
    await DB.init();
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
  } catch (e) {
    console.error('Error initializing database:', e);
    document.getElementById('loadingScreen').querySelector('.loading-inner').innerHTML =
      '<p style="color:var(--red)">Error al cargar la base de datos.<br>Verifique su conexión a internet.</p>';
  }
}

window.addEventListener('DOMContentLoaded', initApp);
