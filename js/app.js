/* =============================================================
   IETS — Gestión Integral — Application Logic v2
   Full CRUD modules for all entities
   ============================================================= */

let S = { user: null, page: 'dashboard' };

/* ---- Helpers ---- */
function avH(u, sz) {
  sz = sz || 26;
  return '<div class="av" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.4)+'px;background:'+(u.color||'#2563EB')+'">'+(u.avatar||'?')+'</div>';
}
function toast(t, m) { const d = document.createElement('div'); d.className = 'toast ' + t; d.textContent = m; document.getElementById('toastC').appendChild(d); setTimeout(function(){d.remove()},3000); }
function openModal(h) { document.getElementById('mdlC').innerHTML = h; document.getElementById('modal').classList.add('on'); }
function closeModal() { document.getElementById('modal').classList.remove('on'); }
function stBadge(s) { const m = {'Cumplida':'b-green','Cumplida parcialmente':'b-purple','En progreso':'b-blue','No cumplida':'b-red','Sin iniciar':'b-muted','No aplica':'b-muted'}; return '<span class="badge '+(m[s]||'b-muted')+'">'+s+'</span>'; }
function progHTML(v) { const c = v>=80?'var(--green)':v>=40?'var(--yellow)':'var(--red)'; return '<div class="prog"><div class="prog-bar"><div class="prog-fill" style="width:'+v+'%;background:'+c+'"></div></div><span class="prog-txt">'+v+'%</span></div>'; }
function priBadge(p) { return p==='Alta'?'<span class="badge b-red">Alta</span>':p==='Media'?'<span class="badge b-yellow">Media</span>':'<span class="badge b-green">Baja</span>'; }
function E(s) { if(s===null||s===undefined) return ''; const d=document.createElement('div'); d.textContent=String(s); return d.innerHTML; }
function filterTbl(q,id) { document.querySelectorAll('#'+id+' tr').forEach(function(r){r.style.display=r.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';}); }
function $(id) { return document.getElementById(id); }
function $v(id) { const el=$(id); return el ? (el.value||'').trim() : ''; }

/* ============================================================
   AUTH
   ============================================================ */
function doLogin() {
  const uid = parseInt($('demoUser').value);
  S.user = DB.getUser(uid);
  $('loginScreen').style.display='none';
  $('app').classList.add('on');
  $('uNm').textContent=S.user.name;
  $('uRl').textContent=S.user.role+' · '+S.user.position;
  $('uAv').textContent=S.user.avatar;
  $('uAv').style.background=S.user.color;
  buildNav(); go('dashboard');
  toast('s','Bienvenido/a, '+S.user.name.split(' ')[0]);
}
function doLogout() { S.user=null; $('app').classList.remove('on'); $('loginScreen').style.display='flex'; }

/* ============================================================
   NAVIGATION
   ============================================================ */
const NAV=[
  {s:'Principal',items:[{id:'dashboard',ic:'📊',l:'Dashboard'},{id:'activities',ic:'📋',l:'Mis Actividades',badge:true},{id:'meetings',ic:'🤝',l:'Reuniones 1:1 / N-1'}]},
  {s:'Organización',items:[{id:'objectives',ic:'🎯',l:'Objetivos'},{id:'processes',ic:'⚙️',l:'Procesos'},{id:'org',ic:'🏢',l:'Dependencias'}]},
  {s:'Gestión',items:[{id:'all-acts',ic:'📁',l:'Todas Actividades',r:['Administrador','Gestor','Lector']},{id:'users',ic:'👥',l:'Usuarios',r:['Administrador','Gestor','Lector']},{id:'evals',ic:'📝',l:'Evaluaciones',r:['Administrador','Gestor','Lector']},{id:'ranking',ic:'🏆',l:'Ranking',r:['Administrador','Gestor','Lector']},{id:'reports',ic:'📈',l:'Informes',r:['Administrador','Gestor','Lector']}]},
  {s:'Sistema',items:[{id:'settings',ic:'⚙️',l:'Configuración',r:['Administrador']},{id:'alerts',ic:'🔔',l:'Notificaciones'}]}
];

function buildNav() {
  let h='';
  NAV.forEach(function(sec){
    h+='<div class="sb-lbl">'+sec.s+'</div>';
    sec.items.forEach(function(it){
      if(it.r&&!it.r.includes(S.user.role)) return;
      const bd=it.badge?'<span class="sb-badge" id="bdg-'+it.id+'">0</span>':'';
      h+='<div class="sb-it" data-pg="'+it.id+'" onclick="go(\''+it.id+'\')"><span class="ic">'+it.ic+'</span>'+it.l+bd+'</div>';
    });
  });
  $('sbMenu').innerHTML=h;
}

function go(pg) {
  S.page=pg;
  document.querySelectorAll('.sb-it').forEach(function(n){n.classList.toggle('on',n.dataset.pg===pg);});
  const T={dashboard:['Dashboard','Resumen general'],activities:['Mis Actividades','Tus actividades asignadas'],meetings:['Reuniones','Reuniones 1:1 y N-1'],objectives:['Objetivos','Estratégicos, operativos y misionales'],processes:['Procesos','Mapa de procesos institucionales'],org:['Dependencias','Estructura organizacional'],users:['Usuarios','Gestión de usuarios y roles'],'all-acts':['Actividades','Vista consolidada de actividades'],evals:['Evaluaciones','Evaluaciones con lógica jerárquica'],ranking:['Ranking','Clasificación por desempeño'],reports:['Informes','Métricas e indicadores'],settings:['Configuración','Parámetros del sistema'],alerts:['Notificaciones','Historial de alertas']};
  const info=T[pg]||['',''];
  $('pgT').textContent=info[0];
  $('pgS').textContent=info[1];
  const canC=['Administrador','Gestor'].includes(S.user.role);
  let hda='<button class="btn btn-s btn-sm" onclick="doExport()">📥 Exportar</button>';
  if(canC) hda+='<button class="btn btn-p btn-sm" onclick="openActForm()">+ Actividad</button>';
  $('hdActs').innerHTML=hda;
  render();
  $('sidebar').classList.remove('open');
}

function render() {
  const fn={dashboard:rDash,activities:rMyActs,meetings:rMeets,objectives:rObjs,processes:rProcs,org:rOrg,users:rUsers,'all-acts':rAllActs,evals:rEvals,ranking:rRanking,reports:rReports,settings:rSettings,alerts:rAlerts};
  $('pageContainer').innerHTML=fn[S.page]?fn[S.page]():'';
  const b=$('bdg-activities');
  if(b){const my=DB.getActivitiesByUser(S.user.id);b.textContent=my.filter(function(a){return !['Cumplida','No aplica'].includes(a.status);}).length;}
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function rDash() {
  const stats=DB.getActivityStats(); const total=stats.total,done=stats.done,prog=stats.inProgress,fail=stats.failed;
  const avgP=Math.round(stats.avgProgress);
  const objs=DB.getObjectives(); const objAvg=objs.length?Math.round(objs.reduce(function(s,o){return s+DB.calcObjProgress(o.id);},0)/objs.length):0;
  const acts=DB.getActivities();
  let chart='',labels='';
  for(let w=1;w<=8;w++){const wa=acts.filter(function(a){return a.week===w;});const wt=wa.length||1;const wd=wa.filter(function(a){return a.status==='Cumplida';}).length;const p=Math.round(wd/wt*100);const c=p>=70?'var(--green)':p>=40?'var(--yellow)':'var(--red)';chart+='<div style="flex:1;background:'+c+';height:'+Math.max(p,4)+'%;border-radius:4px 4px 0 0;min-width:20px;position:relative" title="S'+w+': '+p+'%"><span style="position:absolute;bottom:calc(100%+2px);left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:var(--text2)">'+p+'%</span></div>';labels+='<span style="flex:1;text-align:center;font-size:9px;color:var(--text3);font-weight:600">S'+w+'</span>';}
  let rows='';
  acts.slice(0,8).forEach(function(a){const u=DB.getUser(a.responsible);const dr=a.dragged?'<span class="badge b-yellow" style="font-size:9px;padding:1px 5px">arrastrada</span>':'';rows+='<tr><td style="max-width:200px"><span style="font-weight:600">'+E(a.description).substring(0,50)+'</span> '+dr+'</td><td><b>S'+a.week+'</b></td><td>'+(u?E(u.name.split(' ')[0]):'—')+'</td><td>'+stBadge(a.status)+'</td><td>'+progHTML(a.progress)+'</td><td><button class="btn btn-g btn-sm" onclick="viewAct('+a.id+')">👁</button><button class="btn btn-g btn-sm" onclick="editAct('+a.id+')">✏️</button></td></tr>';});
  return '<div class="st-grid"><div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">📋</div><div class="st-v">'+total+'</div><div class="st-l">Total Actividades</div></div><div class="st"><div class="st-ic" style="background:var(--green-bg);color:var(--green)">✓</div><div class="st-v">'+done+'</div><div class="st-l">Cumplidas ('+(total?Math.round(done/total*100):0)+'%)</div></div><div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">⟳</div><div class="st-v">'+prog+'</div><div class="st-l">En Progreso</div></div><div class="st"><div class="st-ic" style="background:var(--red-bg);color:var(--red)">!</div><div class="st-v">'+fail+'</div><div class="st-l">No Cumplidas</div></div><div class="st"><div class="st-ic" style="background:var(--purple-bg);color:var(--purple)">%</div><div class="st-v">'+avgP+'%</div><div class="st-l">Avance Promedio</div></div><div class="st"><div class="st-ic" style="background:var(--teal-bg);color:var(--teal)">🎯</div><div class="st-v">'+objAvg+'%</div><div class="st-l">Avance Objetivos</div></div></div>'+
  '<div class="g2" style="margin-bottom:16px"><div class="card"><div class="card-h"><h3>Cumplimiento Semanal</h3></div><div class="card-b"><div style="display:flex;align-items:flex-end;gap:5px;height:100px">'+chart+'</div><div style="display:flex;gap:5px;margin-top:4px">'+labels+'</div></div></div><div class="card"><div class="card-h"><h3>Objetivos</h3><button class="btn btn-g btn-sm" onclick="go(\'objectives\')">Ver →</button></div><div class="card-b">'+objs.slice(0,4).map(function(o){const op=DB.calcObjProgress(o.id);return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:600">'+E(o.name).substring(0,35)+'...</span><span style="font-weight:700">'+op+'%</span></div>'+progHTML(op)+'</div>';}).join('')+'</div></div></div>'+
  '<div class="card"><div class="card-h"><h3>Actividades Recientes</h3><input class="search" placeholder="Buscar..." oninput="filterTbl(this.value,\'dTbl\')"></div><div class="tw"><table><thead><tr><th>Actividad</th><th>Sem.</th><th>Resp.</th><th>Estado</th><th>Avance</th><th>Acc.</th></tr></thead><tbody id="dTbl">'+rows+'</tbody></table></div></div>';
}

/* ============================================================
   MIS ACTIVIDADES
   ============================================================ */
function rMyActs() {
  const acts=DB.getActivitiesByUser(S.user.id);
  let rows='';
  acts.forEach(function(a){const o=a.objective_id?DB.getObjective(a.objective_id):null;const p=a.process_id?DB.getProcess(a.process_id):null;const dr=a.dragged?'<span class="badge b-yellow" style="font-size:9px;padding:1px 5px">🔄</span>':'';
    rows+='<tr><td style="font-weight:600;color:var(--accent)">'+E(a.month)+'</td><td>S'+a.week+'</td><td style="max-width:180px"><span style="font-weight:500">'+E(a.description).substring(0,45)+'</span>'+dr+'</td><td>'+stBadge(a.status)+'</td><td>'+progHTML(a.progress)+'</td><td>'+priBadge(a.priority)+'</td><td style="font-size:11px;color:var(--teal)">'+(o?E(o.name).substring(0,20):'—')+'</td><td style="font-size:11px">'+(p?E(p.code):'—')+'</td><td style="max-width:80px;font-size:11px">'+E(a.observations||'—')+'</td><td><button class="btn btn-g btn-sm" onclick="editAct('+a.id+')">✏️</button><button class="btn btn-g btn-sm" onclick="viewAct('+a.id+')">👁</button></td></tr>';});
  if(!rows) rows='<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text3)">No tienes actividades asignadas.</td></tr>';
  return '<div class="card"><div class="card-h"><h3>Mis Actividades ('+acts.length+')</h3></div><div class="tw"><table><thead><tr><th>Mes</th><th>Sem.</th><th>Actividad</th><th>Estado</th><th>Avance</th><th>Pri.</th><th>Objetivo</th><th>Proc.</th><th>Obs.</th><th>Acc.</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}

/* ============================================================
   REUNIONES — Avatar interface
   ============================================================ */
function rMeets() {
  const canC=['Administrador','Gestor'].includes(S.user.role);
  const meets=DB.getMeetings();
  function mc(m){
    const leader=DB.getUser(m.leader);
    const stB=m.status==='Completada'?'<span class="badge b-green">Completada</span>':'<span class="badge b-yellow">Pendiente</span>';
    const items=m.items.map(function(it){return '<li><span class="chk '+(it.done?'on':'')+'" onclick="toggleMeetItem('+it.id+')">'+(it.done?'✓':'')+'</span><span style="'+(it.done?'text-decoration:line-through;color:var(--text3)':'')+'">'+E(it.text)+'</span></li>';}).join('');
    let avSec='';
    if(m.type==='1:1'&&m.participants.length){
      const col=m.participants[0];
      avSec='<div class="meet-avatar-pair">'+(leader?avH(leader,42):'')+'<span class="meet-arrow">⟷</span>'+avH(col,42)+'<div class="meet-pair-info"><div class="names">'+(leader?E(leader.name):'')+' → '+E(col.name)+'</div><div class="roles">'+(leader?E(leader.position):'')+' · '+E(col.position)+'</div></div>'+stB+'</div>';
    }else{
      const tAv=m.participants.map(function(p){return avH(p,30);}).join('');
      avSec='<div class="meet-team-header"><div class="meet-leader-av">'+(leader?avH(leader,42):'')+'</div><div class="meet-team-avatars">'+tAv+'</div><div class="meet-team-info"><div class="team-name">'+E(m.title)+'</div><div class="team-meta">'+m.participants.length+' participantes · 📅 '+m.date+'</div></div>'+stB+'</div>';
    }
    return '<div class="meet">'+avSec+(m.type==='1:1'?'<h4>'+E(m.title)+'</h4><div style="font-size:11px;color:var(--text3);margin-bottom:6px">📅 '+m.date+'</div>':'')+'<ul class="meet-items">'+items+'</ul>'+(m.notes?'<div style="margin-top:8px;font-size:11px;color:var(--text2);background:var(--bg);padding:8px;border-radius:6px">💬 '+E(m.notes)+'</div>':'')+'<div style="margin-top:8px;display:flex;gap:4px"><button class="btn btn-g btn-sm" onclick="editMeet('+m.id+')">✏️ Editar</button><button class="btn btn-g btn-sm" onclick="deleteMeet('+m.id+')" style="color:var(--red)">🗑</button></div></div>';
  }
  const o11=meets.filter(function(m){return m.type==='1:1';}).map(mc).join('')||'<p style="color:var(--text3);padding:20px;text-align:center">No hay reuniones 1:1</p>';
  const oN1=meets.filter(function(m){return m.type==='N-1';}).map(mc).join('')||'<p style="color:var(--text3);padding:20px;text-align:center">No hay reuniones N-1</p>';
  return (canC?'<div style="display:flex;gap:6px;margin-bottom:14px"><button class="btn btn-p btn-sm" onclick="openMeetForm(\'1:1\')">+ Reunión 1:1</button><button class="btn btn-s btn-sm" onclick="openMeetForm(\'N-1\')">+ Reunión N-1</button></div>':'')+
  '<div class="tabs"><div class="tab on" onclick="switchTab(this,\'t11\')">🤝 1:1 One-on-One</div><div class="tab" onclick="switchTab(this,\'tN1\')">👥 N-1 Equipo</div></div>'+
  '<div class="tab-sec on" id="t11"><div class="g3">'+o11+'</div></div><div class="tab-sec" id="tN1"><div class="g3">'+oN1+'</div></div>';
}
function switchTab(el,secId){el.parentElement.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});el.classList.add('on');var ct=el.closest('.pg-ct')||$('pageContainer');ct.querySelectorAll('.tab-sec').forEach(function(s){s.classList.remove('on');});$(secId).classList.add('on');}
function toggleMeetItem(itemId){DB.toggleMeetingItem(itemId);render();}
function deleteMeet(id){if(!confirm('¿Eliminar esta reunión?'))return;DB.deleteMeeting(id);toast('s','Reunión eliminada');render();}

/* ============================================================
   OBJETIVOS — Full CRUD
   ============================================================ */
function rObjs() {
  const canC=['Administrador','Gestor'].includes(S.user.role);
  const types=['Estratégico','Operativo','Misional'];
  let h=canC?'<button class="btn btn-p btn-sm" onclick="openObjForm()" style="margin-bottom:14px">+ Nuevo Objetivo</button>':'';
  types.forEach(function(type){
    const objs=DB.getObjectives().filter(function(o){return o.type===type;});
    h+='<h3 style="font-size:14px;margin:16px 0 8px;color:var(--text2)">🎯 '+type+'s ('+objs.length+')</h3>';
    objs.forEach(function(o){
      const prog=DB.calcObjProgress(o.id);const dept=DB.getDept(o.dept);const owner=DB.getUser(o.owner);const linked=DB.getActivitiesByObjective(o.id);
      const priCls=o.priority==='Alta'?'pri-a':o.priority==='Media'?'pri-m':'pri-b';
      h+='<div class="obj '+priCls+'"><h4>'+E(o.name)+'</h4><div class="obj-meta">'+priBadge(o.priority)+' <span class="badge b-blue">'+(dept?E(dept.name).substring(0,25):'')+'</span> <span class="badge b-muted">'+E(o.quarter)+'</span></div>'+progHTML(prog)+'<div style="margin-top:6px;font-size:11px;color:var(--text3)">'+(owner?'👤 '+E(owner.name):'')+'  · 📎 '+linked.length+' actividad'+(linked.length!==1?'es':'')+'</div>'+(canC?'<div style="margin-top:6px"><button class="btn btn-g btn-sm" onclick="editObj('+o.id+')">✏️ Editar</button><button class="btn btn-g btn-sm" onclick="deleteObj('+o.id+')" style="color:var(--red)">🗑</button></div>':'')+'</div>';
    });
  });
  return h;
}
function deleteObj(id){const l=DB.getActivitiesByObjective(id);if(l.length){toast('e','No se puede eliminar: tiene '+l.length+' actividades vinculadas');return;}if(!confirm('¿Eliminar objetivo?'))return;DB.deleteObjective(id);toast('s','Objetivo eliminado');render();}

/* ============================================================
   PROCESOS — Full CRUD
   ============================================================ */
function rProcs() {
  const canC=['Administrador','Gestor'].includes(S.user.role);
  let h=canC?'<button class="btn btn-p btn-sm" onclick="openProcForm()" style="margin-bottom:14px">+ Nuevo Proceso</button>':'';
  h+='<div class="g3">'+DB.getProcesses().map(function(p){
    const dept=DB.getDept(p.dept);const linked=DB.getActivitiesByProcess(p.id);
    return '<div class="card"><div class="card-b"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">'+(dept?dept.icon:'⚙️')+'</span><div><div style="font-weight:700;font-size:13px">'+E(p.name)+'</div><span style="font-size:11px;color:var(--text3)">'+E(p.code)+' · '+(dept?E(dept.name):'')+'</span></div><span class="badge b-green" style="margin-left:auto">'+E(p.status)+'</span></div><p style="font-size:12px;color:var(--text2);margin-bottom:8px">'+E(p.description)+'</p><div style="font-size:11px;color:var(--text3)">📎 '+linked.length+' actividad'+(linked.length!==1?'es':'')+'</div>'+linked.slice(0,3).map(function(a){return '<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)">• '+E(a.description).substring(0,40)+'... '+stBadge(a.status)+'</div>';}).join('')+(canC?'<div style="margin-top:8px;display:flex;gap:4px"><button class="btn btn-g btn-sm" onclick="editProc('+p.id+')">✏️ Editar</button><button class="btn btn-g btn-sm" onclick="deleteProc('+p.id+')" style="color:var(--red)">🗑</button></div>':'')+'</div></div>';
  }).join('')+'</div>';
  return h;
}

/* ============================================================
   DEPENDENCIAS
   ============================================================ */
function rOrg() {
  const canC=S.user.role==='Administrador';
  const topDepts=DB.getDepts().filter(function(d){return d.parent===null;});
  let h=canC?'<button class="btn btn-p btn-sm" onclick="openDeptForm()" style="margin-bottom:14px">+ Nueva Dependencia</button>':'';
  function rTree(dept,lvl){
    lvl=lvl||0;
    const children=DB.getDepts().filter(function(d){return d.parent===dept.id;});
    const dUsers=DB.getUsersByDept(dept.id);
    const allIds=[dept.id].concat(DB.getChildDeptIds(dept.id));
    const totalU=DB.getUsers().filter(function(u){return allIds.includes(u.dept);}).length;
    let userH='';
    if(dUsers.length){
      userH='<div class="dept-users">'+dUsers.map(function(u){
        const ua=DB.getActivitiesByUser(u.id);const avg=ua.length?Math.round(ua.reduce(function(s,a){return s+a.progress;},0)/ua.length):0;const c=avg>=70?'var(--green)':avg>=40?'var(--yellow)':'var(--red)';
        return '<div class="u-card" onclick="viewUser('+u.id+')">'+avH(u,28)+'<div style="flex:1;min-width:0"><div class="u-nm">'+E(u.name)+'</div><div class="u-pos">'+E(u.position)+'</div><span class="badge b-blue" style="font-size:9px;padding:1px 5px;margin-top:2px">'+E(u.role)+'</span></div><div class="u-pct" style="color:'+c+'">'+avg+'%</div></div>';
      }).join('')+'</div>';
    }
    let editBtn=canC?'<button class="btn btn-g btn-sm" onclick="event.stopPropagation();editDept(\''+dept.id+'\')" style="margin-left:8px">✏️</button>':'';
    return '<div class="dept-block" style="margin-left:'+lvl*16+'px"><div class="dept-head"><span class="d-icon">'+dept.icon+'</span><div class="d-info"><h4>'+E(dept.name)+'</h4><span>'+E(dept.type)+' · '+totalU+' persona'+(totalU!==1?'s':'')+'</span></div><div class="d-count">'+totalU+'</div>'+editBtn+'</div>'+userH+children.map(function(c){return rTree(c,lvl+1);}).join('')+'</div>';
  }
  h+=topDepts.map(function(d){return rTree(d);}).join('');
  return h;
}

/* ============================================================
   USUARIOS — Full CRUD management
   ============================================================ */
function rUsers() {
  const isAdmin=S.user.role==='Administrador';
  const isManager=['Administrador','Gestor'].includes(S.user.role);
  const users=DB.getUsers();const depts=DB.getDepts();
  const roles=['Administrador','Gestor','Lector','Usuario'];
  const grouped={};users.forEach(function(u){if(!grouped[u.dept])grouped[u.dept]=[];grouped[u.dept].push(u);});
  const totalUsers=users.length;const byRole={};roles.forEach(function(r){byRole[r]=users.filter(function(u){return u.role===r;}).length;});
  const allActs=DB.getActivities();const globalAvg=allActs.length?Math.round(allActs.reduce(function(s,a){return s+a.progress;},0)/allActs.length):0;

  let h='<div class="st-grid" style="margin-bottom:20px"><div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">👥</div><div class="st-v">'+totalUsers+'</div><div class="st-l">Total Usuarios</div></div><div class="st"><div class="st-ic" style="background:var(--red-bg);color:var(--red)">🛡️</div><div class="st-v">'+(byRole['Administrador']||0)+'</div><div class="st-l">Administradores</div></div><div class="st"><div class="st-ic" style="background:var(--green-bg);color:var(--green)">📋</div><div class="st-v">'+(byRole['Gestor']||0)+'</div><div class="st-l">Gestores</div></div><div class="st"><div class="st-ic" style="background:var(--accent-bg);color:var(--accent)">👤</div><div class="st-v">'+(byRole['Usuario']||0)+'</div><div class="st-l">Usuarios</div></div><div class="st"><div class="st-ic" style="background:var(--teal-bg);color:var(--teal)">📊</div><div class="st-v">'+globalAvg+'%</div><div class="st-l">Avance Global</div></div></div>';

  if(isAdmin) h+='<button class="btn btn-p btn-sm" onclick="openUserForm()" style="margin-bottom:14px">+ Nuevo Usuario</button> ';
  h+='<div class="filters" style="margin-bottom:16px"><label>Filtrar:</label><select onchange="filterUC()" id="ufDept"><option value="">Todas las dependencias</option>'+depts.map(function(d){return '<option value="'+d.id+'">'+E(d.name)+'</option>';}).join('')+'</select><select onchange="filterUC()" id="ufRole"><option value="">Todos los roles</option>'+roles.map(function(r){return '<option value="'+r+'">'+r+'</option>';}).join('')+'</select><input class="search" id="ufSearch" placeholder="Buscar usuario..." oninput="filterUC()"></div>';

  depts.forEach(function(dept){
    const du=grouped[dept.id];if(!du||!du.length)return;
    h+='<div class="dept-group" data-dept="'+dept.id+'"><div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><span style="font-size:16px">'+dept.icon+'</span><h3 style="font-size:14px;font-weight:700">'+E(dept.name)+'</h3><span class="badge b-muted">'+du.length+'</span></div><div class="ug">';
    du.forEach(function(u){
      const ua=DB.getActivitiesByUser(u.id);const total=ua.length;const done=ua.filter(function(a){return a.status==='Cumplida';}).length;const pend=ua.filter(function(a){return !['Cumplida','No aplica'].includes(a.status);}).length;const avg=total?Math.round(ua.reduce(function(s,a){return s+a.progress;},0)/total):0;
      const evals=DB.getEvalByUser(u.id);const ev=evals.length?evals[0]:null;const evS=ev?DB.calcEvalScore(ev):null;
      const roleSel=isAdmin?'<select onchange="chRole('+u.id+',this.value)" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;background:#fff">'+roles.map(function(r){return '<option value="'+r+'" '+(u.role===r?'selected':'')+'>'+r+'</option>';}).join('')+'</select>':'<span class="badge b-blue">'+E(u.role)+'</span>';
      h+='<div class="uc" data-uid="'+u.id+'" data-role="'+u.role+'" data-name="'+u.name.toLowerCase()+'" data-dept="'+u.dept+'"><div class="uc-head"><div class="av uc-av" style="background:'+u.color+'">'+u.avatar+'</div><div class="uc-info"><h4>'+E(u.name)+'</h4><p>'+E(u.position)+'</p><p style="font-size:10px;color:var(--text4)">'+E(u.email)+'</p></div></div><div class="uc-dept">'+dept.icon+' '+E(dept.name)+'</div><div class="uc-stats"><div class="uc-stat"><div class="num" style="color:var(--accent)">'+total+'</div><div class="lbl">Actividades</div></div><div class="uc-stat"><div class="num" style="color:var(--green)">'+done+'</div><div class="lbl">Cumplidas</div></div><div class="uc-stat"><div class="num" style="color:var(--yellow)">'+pend+'</div><div class="lbl">Pendientes</div></div></div><div style="margin-bottom:10px">'+progHTML(avg)+'</div>'+(evS!==null?'<div style="font-size:11px;color:var(--text3);margin-bottom:10px">📝 Eval: <b style="color:'+(evS>=80?'var(--green)':evS>=60?'var(--yellow)':'var(--red)')+'">'+evS+'/100</b></div>':'')+'<div class="uc-foot">'+roleSel+'<div style="display:flex;gap:4px"><button class="btn btn-g btn-sm" onclick="viewUser('+u.id+')">👁</button>'+(isAdmin?'<button class="btn btn-g btn-sm" onclick="editUser('+u.id+')">✏️</button><button class="btn btn-g btn-sm" onclick="deleteUser('+u.id+')" style="color:var(--red)">🗑</button>':'')+'</div></div></div>';
    });
    h+='</div></div>';
  });
  return h;
}
function chRole(uid,newRole){const users=DB.getUsers();const u=users.find(function(x){return x.id===uid;});if(!u)return;if(u.role==='Administrador'&&newRole!=='Administrador'){if(users.filter(function(x){return x.role==='Administrador';}).length<=1){toast('e','Debe existir al menos 1 Administrador');render();return;}}DB.changeUserRole(uid,newRole);toast('s','Rol de '+u.name.split(' ')[0]+' → '+newRole);render();}
function filterUC(){const df=$v('ufDept');const rf=$v('ufRole');const sf=$v('ufSearch').toLowerCase();document.querySelectorAll('.uc').forEach(function(c){let show=true;if(df&&c.dataset.dept!==df)show=false;if(rf&&c.dataset.role!==rf)show=false;if(sf&&!c.dataset.name.includes(sf))show=false;c.style.display=show?'':'none';});document.querySelectorAll('.dept-group').forEach(function(g){g.style.display=g.querySelectorAll('.uc:not([style*="display: none"])').length?'':'none';});}

/* ============================================================
   TODAS LAS ACTIVIDADES
   ============================================================ */
function rAllActs() {
  const acts=DB.getActivities();
  let rows='';
  acts.forEach(function(a){const u=DB.getUser(a.responsible);const dept=u?DB.getDept(u.dept):null;const o=a.objective_id?DB.getObjective(a.objective_id):null;const dr=a.dragged?'<span class="badge b-yellow" style="font-size:9px;padding:1px 5px">🔄</span>':'';
    rows+='<tr><td style="font-weight:600;color:var(--accent)">'+E(a.month)+'</td><td>S'+a.week+'</td><td style="max-width:160px">'+E(a.description).substring(0,45)+'...'+dr+'</td><td>'+(u?E(u.name.split(' ')[0]):'—')+'</td><td style="font-size:11px">'+(dept?E(dept.name).substring(0,18):'—')+'</td><td>'+stBadge(a.status)+'</td><td>'+progHTML(a.progress)+'</td><td style="font-size:11px">'+(o?E(o.name).substring(0,18)+'...':'—')+'</td><td><button class="btn btn-g btn-sm" onclick="viewAct('+a.id+')">👁</button><button class="btn btn-g btn-sm" onclick="editAct('+a.id+')">✏️</button><button class="btn btn-g btn-sm" onclick="deleteAct('+a.id+')" style="color:var(--red)">🗑</button></td></tr>';});
  return '<div class="card"><div class="card-h"><h3>Todas las Actividades ('+acts.length+')</h3><input class="search" placeholder="Buscar..." oninput="filterTbl(this.value,\'aTbl\')"></div><div class="tw"><table><thead><tr><th>Mes</th><th>Sem.</th><th>Actividad</th><th>Resp.</th><th>Dep.</th><th>Estado</th><th>Avance</th><th>Objetivo</th><th>Acc.</th></tr></thead><tbody id="aTbl">'+rows+'</tbody></table></div></div>';
}

/* ============================================================
   EVALUACIONES — Hierarchical, editable, auto-fill
   ============================================================ */
function rEvals() {
  const dimL={cumplimiento:'Cumplimiento',calidad:'Calidad',puntualidad:'Puntualidad',colaboracion:'Colaboración',iniciativa:'Iniciativa'};
  const evaluatable=DB.getEvaluatableUsers(S.user.id);
  let h='';
  if(evaluatable.length){
    h+='<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap"><button class="btn btn-p btn-sm" onclick="openEvalForm()">+ Nueva Evaluación</button><span style="font-size:11px;color:var(--text3);align-self:center">Puede evaluar: '+evaluatable.map(function(u){return E(u.name.split(' ')[0]);}).join(', ')+'</span></div>';
  }
  h+='<div class="g3">'+DB.getEvaluations().map(function(ev){
    const u=DB.getUser(ev.user_id);const dept=u?DB.getDept(u.dept):null;const by=DB.getUser(ev.evaluated_by);
    const score=DB.calcEvalScore(ev);const c=score>=80?'var(--green)':score>=60?'var(--yellow)':'var(--red)';
    const canEdit=DB.canEditEvaluation(S.user.id,ev);
    const autoTag=ev.auto_filled?'<span class="ev-auto-tag">⚡ Auto</span>':'';
    const dimBars=Object.keys(dimL).map(function(k){const v=ev[k];const dc=v>=80?'var(--green)':v>=60?'var(--yellow)':'var(--red)';return '<div class="ev-dim"><span>'+dimL[k]+'</span><div class="prog-bar" style="flex:1"><div class="prog-fill" style="width:'+v+'%;background:'+dc+'"></div></div><span style="font-size:11px;font-weight:700;min-width:24px;text-align:right">'+v+'</span></div>';}).join('');
    return '<div class="ev"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'+(u?avH(u,34):'')+'<div style="flex:1"><div style="font-weight:700">'+(u?E(u.name):'')+'</div><div style="font-size:11px;color:var(--text3)">'+(u?E(u.position):'')+' · '+(dept?E(dept.name).substring(0,20):'')+'</div></div><div style="text-align:right"><div class="ev-score" style="color:'+c+'">'+score+'</div><div style="font-size:10px;color:var(--text3)">/100</div></div></div><div style="font-size:11px;color:var(--text3);margin-bottom:10px">📅 '+E(ev.period)+' · '+E(ev.type)+' · Por: '+(by?E(by.name.split(' ')[0]):'')+' '+autoTag+'</div>'+dimBars+(ev.comments?'<div style="margin-top:8px;font-size:11px;color:var(--text2);background:var(--bg);padding:8px;border-radius:6px">💬 '+E(ev.comments)+'</div>':'')+'<div style="margin-top:8px;display:flex;gap:4px">'+(canEdit?'<button class="btn btn-g btn-sm" onclick="editEval('+ev.id+')">✏️ Editar</button><button class="btn btn-g btn-sm" onclick="deleteEval('+ev.id+')" style="color:var(--red)">🗑</button>':'<span style="font-size:10px;color:var(--text4);align-self:center">Solo lectura</span>')+'</div></div>';
  }).join('')+'</div>';
  return h;
}
function deleteEval(id){if(!confirm('¿Eliminar evaluación?'))return;DB.deleteEvaluation(id);toast('s','Evaluación eliminada');render();}

/* ============================================================
   RANKING
   ============================================================ */
function rRanking() {
  const users=DB.getUsers();const evals=DB.getEvaluations();
  const rd=users.map(function(u){const ua=DB.getActivitiesByUser(u.id);const actAvg=ua.length?Math.round(ua.reduce(function(s,a){return s+a.progress;},0)/ua.length):0;const ev=evals.find(function(e){return e.user_id===u.id;});const evScore=ev?DB.calcEvalScore(ev):0;const comp=Math.round(actAvg*.6+evScore*.4);const dept=DB.getDept(u.dept);return {u:u,actAvg:actAvg,evScore:evScore,comp:comp,dept:dept};}).sort(function(a,b){return b.comp-a.comp;});
  const indH=rd.map(function(r,i){const pc=i===0?'rk-1':i===1?'rk-2':i===2?'rk-3':'rk-n';const c=r.comp>=80?'var(--green)':r.comp>=60?'var(--yellow)':'var(--red)';return '<div class="rank-it"><div class="rank-pos '+pc+'">'+(i+1)+'</div>'+avH(r.u,30)+'<div class="r-info"><div class="r-nm">'+E(r.u.name)+'</div><div class="r-dept">'+E(r.u.position)+' · '+(r.dept?E(r.dept.name).substring(0,25):'')+'</div></div><div style="text-align:center;min-width:50px"><div style="font-size:13px;font-weight:700">'+r.actAvg+'%</div><div style="font-size:9px;color:var(--text3)">Activ.</div></div><div style="text-align:center;min-width:50px"><div style="font-size:13px;font-weight:700">'+(r.evScore||'—')+'</div><div style="font-size:9px;color:var(--text3)">Eval.</div></div><div class="r-score" style="color:'+c+'">'+r.comp+'</div></div>';}).join('');
  const deptRd=DB.getDepts().filter(function(d){return ['Subdirección','Coordinación','Jefatura'].includes(d.type);}).map(function(dept){const uIds=DB.getUsersByDept(dept.id).map(function(u){return u.id;});const da=DB.getActivities().filter(function(a){return uIds.includes(a.responsible);});const avg=da.length?Math.round(da.reduce(function(s,a){return s+a.progress;},0)/da.length):0;return {dept:dept,avg:avg,cnt:uIds.length};}).sort(function(a,b){return b.avg-a.avg;});
  const deptH=deptRd.map(function(r,i){const pc=i<3?['rk-1','rk-2','rk-3'][i]:'rk-n';const c=r.avg>=70?'var(--green)':r.avg>=40?'var(--yellow)':'var(--red)';return '<div class="rank-it"><div class="rank-pos '+pc+'">'+(i+1)+'</div><span style="font-size:16px">'+r.dept.icon+'</span><div class="r-info"><div class="r-nm">'+E(r.dept.name)+'</div><div class="r-dept">'+E(r.dept.type)+' · '+r.cnt+' personas</div></div><div class="r-score" style="color:'+c+'">'+r.avg+'%</div></div>';}).join('');
  return '<div class="tabs"><div class="tab on" onclick="switchTab(this,\'rkInd\')">👤 Individual</div><div class="tab" onclick="switchTab(this,\'rkDept\')">🏢 Por Dependencia</div></div><div class="tab-sec on" id="rkInd"><div class="card"><div class="card-h"><h3>🏆 Ranking Individual</h3><span style="font-size:11px;color:var(--text3)">60% actividades + 40% evaluación</span></div>'+indH+'</div></div><div class="tab-sec" id="rkDept"><div class="card"><div class="card-h"><h3>🏢 Ranking por Dependencia</h3></div>'+deptH+'</div></div>';
}

/* ============================================================
   INFORMES
   ============================================================ */
function rReports() {
  const stats=DB.getActivityStats();const total=stats.total,done=stats.done;const acts=DB.getActivities();const dragged=acts.filter(function(a){return a.dragged;}).length;const objs=DB.getObjectives();const objAvg=objs.length?Math.round(objs.reduce(function(s,o){return s+DB.calcObjProgress(o.id);},0)/objs.length):0;const activeU=new Set(acts.map(function(a){return a.responsible;})).size;
  let bars='';DB.getUsers().forEach(function(u){const ua=DB.getActivitiesByUser(u.id);if(!ua.length)return;const avg=Math.round(ua.reduce(function(s,a){return s+a.progress;},0)/ua.length);const c=avg>=70?'var(--green)':avg>=40?'var(--yellow)':'var(--red)';bars+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="min-width:100px;font-size:12px;font-weight:600">'+E(u.name.split(' ')[0])+'</span><div style="flex:1;height:18px;background:var(--bg2);border-radius:4px;overflow:hidden"><div style="width:'+avg+'%;height:100%;background:'+c+';border-radius:4px"></div></div><span style="font-size:12px;font-weight:700;min-width:34px">'+avg+'%</span></div>';});
  return '<div class="st-grid"><div class="st"><div class="st-v" style="color:var(--green)">'+(total?Math.round(done/total*100):0)+'%</div><div class="st-l">Tasa Cumplimiento</div></div><div class="st"><div class="st-v" style="color:var(--yellow)">'+(total?Math.round(dragged/total*100):0)+'%</div><div class="st-l">Tasa Arrastre</div></div><div class="st"><div class="st-v" style="color:var(--teal)">'+objAvg+'%</div><div class="st-l">Avance Objetivos</div></div><div class="st"><div class="st-v" style="color:var(--accent)">'+activeU+'</div><div class="st-l">Usuarios Activos</div></div></div><div class="card" style="margin-bottom:14px"><div class="card-h"><h3>Avance por Colaborador</h3></div><div class="card-b">'+bars+'</div></div><div style="display:flex;gap:8px"><button class="btn btn-s" onclick="doExport()">📥 Exportar CSV</button><button class="btn btn-p" onclick="toast(\'s\',\'Informe enviado\')">📧 Enviar</button></div>';
}

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
function rSettings() {
  return '<div class="set-sec"><h3>📧 Informes</h3><div class="fg"><label>Destinatarios</label><div class="tag-wrap" id="tagRecipients"><div class="tag">adriana.robayo@iets.org.co <span class="tx" onclick="this.parentElement.remove()">✕</span></div><div class="tag">valentina.acosta@iets.org.co <span class="tx" onclick="this.parentElement.remove()">✕</span></div><input placeholder="Agregar correo..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();var t=document.createElement(\'div\');t.className=\'tag\';t.innerHTML=this.value+\' <span class=tx onclick=this.parentElement.remove()>✕</span>\';this.parentElement.insertBefore(t,this);this.value=\'\';}"></div></div></div><div class="set-sec"><h3>🔔 Alertas</h3><div class="tgl-row"><div><div class="tl">Recordatorio viernes 3 PM</div><div class="td">Recordar actualizar actividades</div></div><div class="tgl on" onclick="this.classList.toggle(\'on\')"></div></div><div class="tgl-row"><div><div class="tl">Alerta inactividad</div><div class="td">Sin login en día hábil</div></div><div class="tgl on" onclick="this.classList.toggle(\'on\')"></div></div></div><div class="set-sec"><h3>🗑️ Datos</h3><p style="font-size:12px;color:var(--text2);margin-bottom:10px">Restablecer todos los datos demo.</p><button class="btn btn-d btn-sm" onclick="resetData()">Restablecer datos</button></div><button class="btn btn-p" onclick="toast(\'s\',\'Configuración guardada\')" style="margin-top:6px">💾 Guardar</button>';
}

/* ============================================================
   NOTIFICACIONES
   ============================================================ */
function rAlerts() {
  const notifs=[{t:'i',text:'2 nuevas actividades asignadas para semana 7.',time:'Hace 1h'},{t:'w',text:'Recordatorio: actualice actividades antes del viernes.',time:'Hoy 3 PM'},{t:'s',text:'Informe semanal enviado exitosamente.',time:'Viernes 5 PM'},{t:'e',text:'Carlos Méndez sin login en 2 días hábiles.',time:'Ayer'},{t:'i',text:'Reunión 1:1 con Laura completada.',time:'Hace 3 días'}];
  return '<div class="card"><div class="card-h"><h3>🔔 Notificaciones</h3></div><div class="card-b">'+notifs.map(function(n){const c={i:'var(--accent)',w:'var(--yellow)',s:'var(--green)',e:'var(--red)'};return '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><div style="width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0;background:'+c[n.t]+'"></div><div><div style="font-size:13px">'+E(n.text)+'</div><div style="font-size:11px;color:var(--text3)">'+E(n.time)+'</div></div></div>';}).join('')+'</div></div>';
}

/* ============================================================
   FORM: USER (CREATE/EDIT) — FULL CRUD
   ============================================================ */
function openUserForm(editId) {
  const u=editId?DB.getUser(editId):null;
  const depts=DB.getDepts();const roles=['Administrador','Gestor','Lector','Usuario'];
  const colors=['#2563EB','#0D9488','#DC2626','#D97706','#7C3AED','#EC4899','#EA580C','#F43F5E','#059669'];
  const dOpts=depts.map(function(d){return '<option value="'+d.id+'" '+(u&&u.dept===d.id?'selected':'')+'>'+E(d.name)+'</option>';}).join('');
  const rOpts=roles.map(function(r){return '<option value="'+r+'" '+(u&&u.role===r?'selected':'')+'>'+r+'</option>';}).join('');
  const cOpts=colors.map(function(c){return '<option value="'+c+'" '+(u&&u.color===c?'selected':'')+' style="background:'+c+';color:#fff">'+c+'</option>';}).join('');
  openModal('<div class="mdl-hd"><h3>'+(u?'Editar':'Nuevo')+' Usuario</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="fg"><label>Nombre completo <span class="req">*</span></label><input class="fi" id="uName" value="'+(u?E(u.name):'')+'"></div><div class="fr"><div class="fg"><label>Email <span class="req">*</span></label><input class="fi" id="uEmail" type="email" value="'+(u?E(u.email):'')+'"></div><div class="fg"><label>Cargo</label><input class="fi" id="uPos" value="'+(u?E(u.position):'')+'"></div></div><div class="fr"><div class="fg"><label>Dependencia <span class="req">*</span></label><select class="fsel" id="uDept">'+dOpts+'</select></div><div class="fg"><label>Rol</label><select class="fsel" id="uRole">'+rOpts+'</select></div></div><div class="fg"><label>Color del avatar</label><select class="fsel" id="uColor">'+cOpts+'</select></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveUser('+(editId||'null')+')">'+(u?'Actualizar':'Crear')+'</button></div>');
}
function editUser(id){openUserForm(id);}
function saveUser(editId) {
  const name=$v('uName');const email=$v('uEmail');
  if(!name){toast('e','El nombre es obligatorio');return;}
  if(!email){toast('e','El email es obligatorio');return;}
  const data={name:name,email:email,position:$v('uPos'),dept:$v('uDept'),role:$v('uRole'),color:$v('uColor')};
  if(editId){DB.updateUser(editId,data);toast('s','Usuario actualizado');}
  else{DB.createUser(data);toast('s','Usuario creado');}
  closeModal();render();
}
function deleteUser(id) {
  const u=DB.getUser(id);if(!u)return;
  if(u.id===S.user.id){toast('e','No puedes eliminarte a ti mismo');return;}
  if(u.role==='Administrador'&&DB.getUsers().filter(function(x){return x.role==='Administrador';}).length<=1){toast('e','Debe existir al menos 1 Administrador');return;}
  if(!confirm('¿Eliminar a '+u.name+'?'))return;
  const res=DB.deleteUser(id);
  if(res.ok){toast('s','Usuario eliminado');render();}
  else{toast('e','No se puede eliminar: '+res.reason);}
}

/* ============================================================
   FORM: ACTIVITY (CREATE/EDIT)
   ============================================================ */
function openActForm(editId) {
  const a=editId?DB.getActivity(editId):null;
  const users=DB.getUsers();const objs=DB.getObjectives();const procs=DB.getProcesses();
  const uOpts=users.map(function(u){return '<option value="'+u.id+'" '+(a&&a.responsible===u.id?'selected':'')+'>'+E(u.name)+'</option>';}).join('');
  const oOpts='<option value="">— Sin vincular —</option>'+objs.map(function(o){return '<option value="'+o.id+'" '+(a&&a.objective_id===o.id?'selected':'')+'>'+E(o.name).substring(0,50)+'</option>';}).join('');
  const pOpts='<option value="">— Sin vincular —</option>'+procs.map(function(p){return '<option value="'+p.id+'" '+(a&&a.process_id===p.id?'selected':'')+'>'+E(p.code)+' — '+E(p.name)+'</option>';}).join('');
  const months='Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre'.split(',');
  const mOpts=months.map(function(m){return '<option value="'+m+'" '+(a&&a.month===m||(!a&&m==='Febrero')?'selected':'')+'>'+m+'</option>';}).join('');
  const wOpts=Array.from({length:52},function(_,i){return '<option value="'+(i+1)+'" '+(a&&a.week===i+1||(!a&&i+1===7)?'selected':'')+'>'+(i+1)+'</option>';}).join('');
  const stOpts='Sin iniciar,En progreso,Cumplida,Cumplida parcialmente,No cumplida,No aplica'.split(',').map(function(s){return '<option '+(a&&a.status===s?'selected':'')+'>'+s+'</option>';}).join('');
  const priOpts='Alta,Media,Baja'.split(',').map(function(p){return '<option '+(a&&a.priority===p||(!a&&p==='Media')?'selected':'')+'>'+p+'</option>';}).join('');
  openModal('<div class="mdl-hd"><h3>'+(a?'Editar':'Nueva')+' Actividad</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="fr"><div class="fg"><label>Mes <span class="req">*</span></label><select class="fsel" id="fM">'+mOpts+'</select></div><div class="fg"><label>Semana <span class="req">*</span></label><select class="fsel" id="fW">'+wOpts+'</select></div></div><div class="fg"><label>Actividad <span class="req">*</span></label><textarea class="fta" id="fD" maxlength="500">'+(a?E(a.description):'')+'</textarea></div><div class="fr"><div class="fg"><label>Responsable <span class="req">*</span></label><select class="fsel" id="fR">'+uOpts+'</select></div><div class="fg"><label>Prioridad</label><select class="fsel" id="fPri">'+priOpts+'</select></div></div><div class="fr"><div class="fg"><label>Objetivo</label><select class="fsel" id="fO">'+oOpts+'</select></div><div class="fg"><label>Proceso</label><select class="fsel" id="fP">'+pOpts+'</select></div></div><div class="fr"><div class="fg"><label>Estado</label><select class="fsel" id="fSt">'+stOpts+'</select></div><div class="fg"><label>Avance %</label><div class="range-wrap"><input type="range" id="fPr" min="0" max="100" step="5" value="'+(a?a.progress:0)+'" oninput="$(\'fPrV\').textContent=this.value+\'%\'"><span class="rv" id="fPrV">'+(a?a.progress:0)+'%</span></div></div></div><div class="fg"><label>Fecha límite</label><input type="date" class="fi" id="fDl" value="'+(a?a.deadline||'':'')+'"></div><div class="fr"><div class="fg"><label>Observaciones</label><textarea class="fta" id="fObs" rows="2">'+(a?E(a.observations||''):'')+'</textarea></div><div class="fg"><label>Pendientes</label><textarea class="fta" id="fPe" rows="2">'+(a?E(a.pending||''):'')+'</textarea></div></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveAct('+(editId||'null')+')">'+(a?'Actualizar':'Guardar')+'</button></div>');
}
function editAct(id){openActForm(id);}
function saveAct(editId) {
  const desc=$v('fD');if(!desc){toast('e','Descripción obligatoria');return;}
  const prog=parseInt($('fPr').value);const status=$v('fSt');
  if(prog===100&&status!=='Cumplida'){toast('w','100% → Estado ajustado a Cumplida');$('fSt').value='Cumplida';}
  if(prog===0&&status==='Cumplida'){toast('e','0% no puede ser Cumplida');return;}
  const data={month:$v('fM'),week:parseInt($v('fW')),description:desc,responsible:parseInt($v('fR')),assigned_by:S.user.id,status:$v('fSt'),progress:parseInt($('fPr').value),priority:$v('fPri'),objective_id:parseInt($v('fO'))||null,process_id:parseInt($v('fP'))||null,deadline:$v('fDl'),observations:$v('fObs'),pending:$v('fPe'),dragged:false};
  if(editId){DB.updateActivity(editId,data);toast('s','Actividad actualizada');}
  else{DB.createActivity(data);toast('s','Actividad creada');}
  closeModal();render();
}
function viewAct(id) {
  const a=DB.getActivity(id);if(!a)return;const u=DB.getUser(a.responsible);const by=DB.getUser(a.assigned_by);const o=a.objective_id?DB.getObjective(a.objective_id):null;const p=a.process_id?DB.getProcess(a.process_id):null;const dept=u?DB.getDept(u.dept):null;
  openModal('<div class="mdl-hd"><h3>Detalle #'+a.id+'</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="d-row"><span class="d-label">Periodo</span><span>'+E(a.month)+' — Semana '+a.week+'</span></div><div class="d-row"><span class="d-label">Actividad</span><span>'+E(a.description)+'</span></div><div class="d-row"><span class="d-label">Responsable</span><span>'+(u?E(u.name):'')+' '+(dept?'('+E(dept.name).substring(0,20)+')':'')+'</span></div><div class="d-row"><span class="d-label">Asignada por</span><span>'+(by?E(by.name):'')+'</span></div><div class="d-row"><span class="d-label">Estado</span><span>'+stBadge(a.status)+'</span></div><div class="d-row"><span class="d-label">Avance</span><span>'+progHTML(a.progress)+'</span></div><div class="d-row"><span class="d-label">Objetivo</span><span style="color:var(--teal)">'+(o?E(o.name):'Sin vincular')+'</span></div><div class="d-row"><span class="d-label">Proceso</span><span>'+(p?E(p.code)+' — '+E(p.name):'Sin vincular')+'</span></div><div class="d-row"><span class="d-label">Fecha límite</span><span>'+(a.deadline||'Sin definir')+'</span></div><div class="d-row"><span class="d-label">Observaciones</span><span>'+E(a.observations||'—')+'</span></div><div class="d-row"><span class="d-label">Pendientes</span><span style="color:var(--yellow)">'+E(a.pending||'—')+'</span></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cerrar</button><button class="btn btn-p" onclick="closeModal();editAct('+a.id+')">✏️ Editar</button></div>');
}
function deleteAct(id){if(!confirm('¿Eliminar actividad #'+id+'?'))return;DB.deleteActivity(id);toast('s','Actividad eliminada');render();}

/* ============================================================
   FORM: MEETING
   ============================================================ */
function openMeetForm(type,editId) {
  const m=editId?DB.getMeeting(editId):null;
  const users=DB.getUsers();const uOpts=users.map(function(u){return '<option value="'+u.id+'">'+E(u.name)+'</option>';}).join('');
  const isN1=type==='N-1';
  openModal('<div class="mdl-hd"><h3>'+(m?'Editar':'Nueva')+' Reunión '+type+'</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="fg"><label>Título <span class="req">*</span></label><input class="fi" id="mT" value="'+(m?E(m.title):'')+'"></div><div class="fr"><div class="fg"><label>Líder</label><select class="fsel" id="mL">'+uOpts+'</select></div><div class="fg"><label>'+(isN1?'Participantes (ctrl+click)':'Colaborador')+'</label><select class="fsel" id="mP" '+(isN1?'multiple style="min-height:80px"':'')+'>'+uOpts+'</select></div></div><div class="fr"><div class="fg"><label>Fecha</label><input type="date" class="fi" id="mDt" value="'+(m?m.date:'')+'"></div><div class="fg"><label>Estado</label><select class="fsel" id="mSt"><option '+(m&&m.status==='Pendiente'?'selected':'')+'>Pendiente</option><option '+(m&&m.status==='Completada'?'selected':'')+'>Completada</option></select></div></div><div class="fg"><label>Puntos de agenda (uno por línea)</label><textarea class="fta" id="mIt" rows="4">'+(m?m.items.map(function(i){return i.text;}).join('\n'):'')+'</textarea></div><div class="fg"><label>Notas</label><textarea class="fta" id="mN" rows="2">'+(m?E(m.notes||''):'')+'</textarea></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveMeet(\''+type+'\','+(editId||'null')+')">'+(m?'Actualizar':'Guardar')+'</button></div>');
  if(m){setTimeout(function(){$('mL').value=m.leader;if(!isN1&&m.participants.length)$('mP').value=m.participants[0].id;else if(isN1){var sel=$('mP');m.participants.forEach(function(p){var opt=sel.querySelector('option[value="'+p.id+'"]');if(opt)opt.selected=true;});}},30);}
}
function editMeet(id){var m=DB.getMeeting(id);if(m)openMeetForm(m.type,id);}
function saveMeet(type,editId) {
  const title=$v('mT');if(!title){toast('e','Título obligatorio');return;}
  const sel=$('mP');const itemTexts=$('mIt').value.split('\n').filter(function(l){return l.trim();});
  const items=itemTexts.map(function(t){return {text:t.trim(),d:0};});
  const data={type:type,title:title,leader:parseInt($v('mL')),participants:type==='1:1'?[parseInt(sel.value)]:Array.from(sel.selectedOptions).map(function(o){return parseInt(o.value);}),date:$v('mDt'),status:$v('mSt'),notes:$v('mN'),items:items,replaceItems:true};
  if(editId){DB.updateMeeting(editId,data);toast('s','Reunión actualizada');}
  else{DB.createMeeting(data);toast('s','Reunión creada');}
  closeModal();render();
}

/* ============================================================
   FORM: OBJECTIVE
   ============================================================ */
function openObjForm(editId) {
  const o=editId?DB.getObjective(editId):null;
  const depts=DB.getDepts();const users=DB.getUsers();
  const dOpts=depts.map(function(d){return '<option value="'+d.id+'" '+(o&&o.dept===d.id?'selected':'')+'>'+E(d.name)+'</option>';}).join('');
  const uOpts=users.map(function(u){return '<option value="'+u.id+'" '+(o&&o.owner===u.id?'selected':'')+'>'+E(u.name)+'</option>';}).join('');
  openModal('<div class="mdl-hd"><h3>'+(o?'Editar':'Nuevo')+' Objetivo</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="fg"><label>Nombre <span class="req">*</span></label><textarea class="fta" id="oN" rows="2">'+(o?E(o.name):'')+'</textarea></div><div class="fr3"><div class="fg"><label>Tipo</label><select class="fsel" id="oT"><option '+(o&&o.type==='Estratégico'?'selected':'')+'>Estratégico</option><option '+(o&&o.type==='Operativo'?'selected':'')+'>Operativo</option><option '+(o&&o.type==='Misional'?'selected':'')+'>Misional</option></select></div><div class="fg"><label>Prioridad</label><select class="fsel" id="oPr"><option '+(o&&o.priority==='Alta'?'selected':'')+'>Alta</option><option '+(o&&o.priority==='Media'||!o?'selected':'')+'>Media</option><option '+(o&&o.priority==='Baja'?'selected':'')+'>Baja</option></select></div><div class="fg"><label>Trimestre</label><select class="fsel" id="oQ"><option '+(o&&o.quarter==='Q1'?'selected':'')+'>Q1</option><option '+(o&&o.quarter==='Q1-Q2'?'selected':'')+'>Q1-Q2</option><option '+(o&&o.quarter==='Q1-Q3'?'selected':'')+'>Q1-Q3</option><option '+(o&&o.quarter==='Q1-Q4'?'selected':'')+'>Q1-Q4</option></select></div></div><div class="fr"><div class="fg"><label>Dependencia</label><select class="fsel" id="oD">'+dOpts+'</select></div><div class="fg"><label>Responsable</label><select class="fsel" id="oO">'+uOpts+'</select></div></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveObj('+(editId||'null')+')">'+(o?'Actualizar':'Guardar')+'</button></div>');
}
function editObj(id){openObjForm(id);}
function saveObj(editId) {
  const name=$v('oN');if(!name){toast('e','Nombre obligatorio');return;}
  const data={name:name,type:$v('oT'),priority:$v('oPr'),quarter:$v('oQ'),dept:$v('oD'),owner:parseInt($v('oO'))};
  if(editId){DB.updateObjective(editId,data);toast('s','Objetivo actualizado');}
  else{DB.createObjective(data);toast('s','Objetivo creado');}
  closeModal();render();
}

/* ============================================================
   FORM: PROCESS — FULL CRUD
   ============================================================ */
function openProcForm(editId) {
  const p=editId?DB.getProcess(editId):null;
  const depts=DB.getDepts();
  const dOpts=depts.map(function(d){return '<option value="'+d.id+'" '+(p&&p.dept===d.id?'selected':'')+'>'+E(d.name)+'</option>';}).join('');
  openModal('<div class="mdl-hd"><h3>'+(p?'Editar':'Nuevo')+' Proceso</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="fg"><label>Nombre <span class="req">*</span></label><input class="fi" id="pName" value="'+(p?E(p.name):'')+'"></div><div class="fr"><div class="fg"><label>Código</label><input class="fi" id="pCode" value="'+(p?E(p.code):'')+'"></div><div class="fg"><label>Dependencia</label><select class="fsel" id="pDept">'+dOpts+'</select></div></div><div class="fr"><div class="fg"><label>Estado</label><select class="fsel" id="pSt"><option '+(p&&p.status==='Activo'?'selected':'')+'>Activo</option><option '+(p&&p.status==='Inactivo'?'selected':'')+'>Inactivo</option></select></div></div><div class="fg"><label>Descripción</label><textarea class="fta" id="pDesc" rows="3">'+(p?E(p.description):'')+'</textarea></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveProc('+(editId||'null')+')">'+(p?'Actualizar':'Guardar')+'</button></div>');
}
function editProc(id){openProcForm(id);}
function saveProc(editId) {
  const name=$v('pName');if(!name){toast('e','Nombre obligatorio');return;}
  const data={name:name,code:$v('pCode'),dept:$v('pDept'),status:$v('pSt'),description:$v('pDesc')};
  if(editId){DB.updateProcess(editId,data);toast('s','Proceso actualizado');}
  else{DB.createProcess(data);toast('s','Proceso creado');}
  closeModal();render();
}
function deleteProc(id) {
  if(!confirm('¿Eliminar proceso?'))return;
  const res=DB.deleteProcess(id);
  if(res.ok){toast('s','Proceso eliminado');render();}
  else{toast('e','No se puede eliminar: '+res.reason);}
}

/* ============================================================
   FORM: DEPARTMENT — FULL CRUD
   ============================================================ */
function openDeptForm(editId) {
  const d=editId?DB.getDept(editId):null;
  const depts=DB.getDepts();
  const pOpts='<option value="">— Ninguno (raíz) —</option>'+depts.filter(function(dp){return dp.id!==editId;}).map(function(dp){return '<option value="'+dp.id+'" '+(d&&d.parent===dp.id?'selected':'')+'>'+E(dp.name)+'</option>';}).join('');
  const icons='🏛️,🔬,💼,📡,🧪,✅,👥,💰,💻,📣,🔍,⚙️,📋,🎯'.split(',');
  const iOpts=icons.map(function(ic){return '<option '+(d&&d.icon===ic?'selected':'')+'>'+ic+'</option>';}).join('');
  openModal('<div class="mdl-hd"><h3>'+(d?'Editar':'Nueva')+' Dependencia</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd">'+(d?'':'<div class="fg"><label>ID (slug único) <span class="req">*</span></label><input class="fi" id="dId" placeholder="ej: c-nueva"></div>')+'<div class="fg"><label>Nombre <span class="req">*</span></label><input class="fi" id="dName" value="'+(d?E(d.name):'')+'"></div><div class="fr"><div class="fg"><label>Tipo</label><select class="fsel" id="dType"><option '+(d&&d.type==='Dirección'?'selected':'')+'>Dirección</option><option '+(d&&d.type==='Subdirección'?'selected':'')+'>Subdirección</option><option '+(d&&d.type==='Coordinación'||!d?'selected':'')+'>Coordinación</option><option '+(d&&d.type==='Jefatura'?'selected':'')+'>Jefatura</option></select></div><div class="fg"><label>Icono</label><select class="fsel" id="dIcon">'+iOpts+'</select></div></div><div class="fr"><div class="fg"><label>Dependencia padre</label><select class="fsel" id="dParent">'+pOpts+'</select></div><div class="fg"><label>Color</label><input type="color" class="fi" id="dColor" value="'+(d?d.color:'#2563EB')+'" style="height:38px"></div></div></div><div class="mdl-ft">'+(d?'<button class="btn btn-d btn-sm" onclick="deleteDept(\''+editId+'\')">🗑 Eliminar</button>':'')+'<button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveDept('+(editId?'\''+editId+'\'':'null')+')">'+(d?'Actualizar':'Crear')+'</button></div>');
}
function editDept(id){openDeptForm(id);}
function saveDept(editId) {
  const name=$v('dName');if(!name){toast('e','Nombre obligatorio');return;}
  const data={name:name,type:$v('dType'),icon:$v('dIcon'),color:$v('dColor'),parent:$v('dParent')||null};
  if(editId){DB.updateDept(editId,data);toast('s','Dependencia actualizada');}
  else{const id=$v('dId');if(!id){toast('e','ID obligatorio');return;}data.id=id;DB.createDept(data);toast('s','Dependencia creada');}
  closeModal();render();
}
function deleteDept(id) {
  if(!confirm('¿Eliminar dependencia?'))return;
  const ok=DB.deleteDept(id);
  if(ok){toast('s','Dependencia eliminada');closeModal();render();}
  else{toast('e','No se puede eliminar: tiene usuarios o subdependencias');}
}

/* ============================================================
   FORM: EVALUATION (CREATE/EDIT with auto-fill & hierarchy)
   ============================================================ */
function openEvalForm(editId) {
  const ev=editId?DB.getEvaluation(editId):null;const isEdit=!!ev;
  const evaluatable=DB.getEvaluatableUsers(S.user.id);
  if(!evaluatable.length&&!isEdit){toast('e','No tiene usuarios para evaluar');return;}
  const uOpts=isEdit?'<option value="'+ev.user_id+'" selected>'+E(DB.getUser(ev.user_id).name)+'</option>':evaluatable.map(function(u){return '<option value="'+u.id+'">'+E(u.name)+' — '+E(u.position)+'</option>';}).join('');
  openModal('<div class="mdl-hd"><h3>'+(isEdit?'Editar':'Nueva')+' Evaluación</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div class="fr"><div class="fg"><label>Colaborador</label><select class="fsel" id="evU" '+(isEdit?'disabled':'')+' onchange="autoFillPreview()">'+uOpts+'</select></div><div class="fg"><label>Periodo</label><input class="fi" id="evP" value="'+(ev?E(ev.period):'Q1 2026')+'" '+(isEdit?'readonly':'')+'></div></div><div class="fg"><label>Tipo</label><select class="fsel" id="evT"><option '+(ev&&ev.type==='Trimestral'||!ev?'selected':'')+'>Trimestral</option><option '+(ev&&ev.type==='Semanal'?'selected':'')+'>Semanal</option></select></div><div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 8px"><p style="font-size:12px;font-weight:700;color:var(--text2)">Dimensiones (0-100)</p><button class="btn btn-teal btn-sm" type="button" onclick="autoFillEval()">⚡ Auto-rellenar</button></div><div id="autoFillMsg" style="display:none;margin-bottom:8px;padding:8px;background:var(--teal-bg);border:1px solid #A7F3D0;border-radius:6px;font-size:11px;color:var(--teal)"></div><div class="fr"><div class="fg"><label>Cumplimiento (25%)</label><div class="range-wrap"><input type="range" id="evD1" min="0" max="100" value="'+(ev?ev.cumplimiento:75)+'" oninput="$(\'evD1V\').textContent=this.value"><span class="rv" id="evD1V">'+(ev?ev.cumplimiento:75)+'</span></div></div><div class="fg"><label>Calidad (25%)</label><div class="range-wrap"><input type="range" id="evD2" min="0" max="100" value="'+(ev?ev.calidad:75)+'" oninput="$(\'evD2V\').textContent=this.value"><span class="rv" id="evD2V">'+(ev?ev.calidad:75)+'</span></div></div></div><div class="fr"><div class="fg"><label>Puntualidad (20%)</label><div class="range-wrap"><input type="range" id="evD3" min="0" max="100" value="'+(ev?ev.puntualidad:75)+'" oninput="$(\'evD3V\').textContent=this.value"><span class="rv" id="evD3V">'+(ev?ev.puntualidad:75)+'</span></div></div><div class="fg"><label>Colaboración (15%)</label><div class="range-wrap"><input type="range" id="evD4" min="0" max="100" value="'+(ev?ev.colaboracion:75)+'" oninput="$(\'evD4V\').textContent=this.value"><span class="rv" id="evD4V">'+(ev?ev.colaboracion:75)+'</span></div></div></div><div class="fg"><label>Iniciativa (15%)</label><div class="range-wrap"><input type="range" id="evD5" min="0" max="100" value="'+(ev?ev.iniciativa:75)+'" oninput="$(\'evD5V\').textContent=this.value"><span class="rv" id="evD5V">'+(ev?ev.iniciativa:75)+'</span></div></div><div class="fg"><label>Comentarios</label><textarea class="fta" id="evComm" rows="2" placeholder="Observaciones...">'+(ev?E(ev.comments||''):'')+'</textarea></div></div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveEval('+(editId||'null')+')">'+(isEdit?'Actualizar':'Guardar')+'</button></div>');
}
function editEval(id){openEvalForm(id);}
function autoFillEval() {
  const uid=parseInt($v('evU'));if(!uid){toast('e','Seleccione un colaborador');return;}
  const auto=DB.calcAutoEval(uid);const u=DB.getUser(uid);
  $('evD1').value=auto.cumplimiento;$('evD1V').textContent=auto.cumplimiento;
  $('evD2').value=auto.calidad;$('evD2V').textContent=auto.calidad;
  $('evD3').value=auto.puntualidad;$('evD3V').textContent=auto.puntualidad;
  $('evD4').value=auto.colaboracion;$('evD4V').textContent=auto.colaboracion;
  $('evD5').value=auto.iniciativa;$('evD5V').textContent=auto.iniciativa;
  const msg=$('autoFillMsg');const acts=DB.getActivitiesByUser(uid);
  msg.style.display='block';msg.innerHTML='⚡ Calculado para <b>'+E(u.name)+'</b> con '+acts.length+' actividades. Ajuste si requiere.';
  toast('s','Dimensiones auto-calculadas');
}
function autoFillPreview() {
  const uid=parseInt($v('evU'));if(!uid)return;
  const acts=DB.getActivitiesByUser(uid);const msg=$('autoFillMsg');
  msg.style.display='block';msg.innerHTML='Este usuario tiene '+acts.length+' actividades. Use "Auto-rellenar" para calcular.';
}
function saveEval(editId) {
  const data={user_id:parseInt($v('evU')),period:$v('evP'),type:$v('evT'),cumplimiento:parseInt($('evD1').value)||0,calidad:parseInt($('evD2').value)||0,puntualidad:parseInt($('evD3').value)||0,colaboracion:parseInt($('evD4').value)||0,iniciativa:parseInt($('evD5').value)||0,evaluated_by:S.user.id,date:new Date().toISOString().split('T')[0],comments:$v('evComm'),auto_filled:$('autoFillMsg').style.display!=='none'?1:0};
  if(editId){DB.updateEvaluation(editId,data);toast('s','Evaluación actualizada');}
  else{DB.createEvaluation(data);toast('s','Evaluación registrada');}
  closeModal();render();
}

/* ============================================================
   USER PROFILE
   ============================================================ */
function viewUser(uid) {
  const u=DB.getUser(uid);if(!u)return;const dept=DB.getDept(u.dept);
  const acts=DB.getActivitiesByUser(uid);const avg=acts.length?Math.round(acts.reduce(function(s,a){return s+a.progress;},0)/acts.length):0;
  const done=acts.filter(function(a){return a.status==='Cumplida';}).length;
  const pend=acts.filter(function(a){return !['Cumplida','No aplica'].includes(a.status);}).length;
  const evals=DB.getEvalByUser(uid);const ev=evals.length?evals[0]:null;const evScore=ev?DB.calcEvalScore(ev):'—';
  const meetings=DB.getMeetingsForUser(uid);
  let meetSec='';if(meetings.length){meetSec='<div style="margin-top:12px"><p style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">Reuniones ('+meetings.length+')</p>'+meetings.slice(0,4).map(function(m){const mt=DB.getMeeting(m.id);if(!mt)return '';return '<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--border)">'+(mt.type==='1:1'?'🤝':'👥')+' '+E(mt.title)+' · '+(mt.status==='Completada'?'✅':'⏳')+' '+mt.date+'</div>';}).join('')+'</div>';}
  let actList='';if(acts.length){actList='<div style="margin-top:12px"><p style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">Actividades recientes</p>'+acts.slice(0,5).map(function(a){return '<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--border)">'+E(a.description).substring(0,40)+'... '+stBadge(a.status)+'</div>';}).join('')+'</div>';}
  openModal('<div class="mdl-hd"><h3>Perfil</h3><button class="mdl-x" onclick="closeModal()">✕</button></div><div class="mdl-bd"><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'+avH(u,48)+'<div><div style="font-weight:700;font-size:16px">'+E(u.name)+'</div><div style="font-size:12px;color:var(--text2)">'+E(u.position)+'</div><div style="font-size:11px;color:var(--text3)">'+E(u.email)+'</div></div></div><div style="display:flex;gap:4px;margin-bottom:14px"><span class="badge b-blue">'+E(u.role)+'</span><span class="badge b-muted">'+(dept?E(dept.name):'')+'</span></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px"><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--accent)">'+acts.length+'</div><div style="font-size:9px;color:var(--text3)">Total</div></div><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--green)">'+done+'</div><div style="font-size:9px;color:var(--text3)">Cumplidas</div></div><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--yellow)">'+pend+'</div><div style="font-size:9px;color:var(--text3)">Pendientes</div></div><div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--accent)">'+avg+'%</div><div style="font-size:9px;color:var(--text3)">Avance</div></div></div>'+(ev?'<p style="font-size:12px;font-weight:700;margin-bottom:6px">Evaluación '+E(ev.period)+': <span style="color:var(--accent)">'+evScore+'/100</span></p>':'')+actList+meetSec+'</div><div class="mdl-ft"><button class="btn btn-s" onclick="closeModal()">Cerrar</button>'+(S.user.role==='Administrador'?'<button class="btn btn-p" onclick="closeModal();editUser('+uid+')">✏️ Editar</button>':'')+'</div>');
}

/* ============================================================
   EXPORT
   ============================================================ */
function doExport() {
  try{
    const csv=DB.exportAllCSV();
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='IETS_export_'+new Date().toISOString().split('T')[0]+'.csv';
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    toast('s','Datos exportados como CSV');
  }catch(e){toast('e','Error al exportar: '+e.message);}
}

/* ============================================================
   UTILITIES
   ============================================================ */
function resetData(){if(!confirm('¿Restablecer todos los datos?'))return;DB.reset();toast('s','Datos restablecidos');render();}

/* ============================================================
   INIT
   ============================================================ */
async function initApp() {
  try{
    await DB.init();
    $('loadingScreen').style.display='none';
    $('loginScreen').style.display='flex';
  }catch(e){
    console.error('DB init error:',e);
    $('loadingScreen').querySelector('.loading-inner').innerHTML='<p style="color:var(--red)">Error al cargar la base de datos.<br>Verifique su conexión a internet para cargar sql.js.</p>';
  }
}
window.addEventListener('DOMContentLoaded',initApp);
