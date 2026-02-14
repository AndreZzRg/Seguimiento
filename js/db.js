/* =============================================================
   IETS — Database Layer (SQLite via sql.js)
   ============================================================= */

let db = null;

const DB = {
  /* ---- Initialize ---- */
  async init() {
    const SQL = await initSqlJs({
      locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`
    });
    const saved = localStorage.getItem('iets_sqlite');
    if (saved) {
      try {
        const buf = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
        db = new SQL.Database(buf);
        // Verify tables exist
        const chk = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (!chk.length || !chk[0].values.length) { db.close(); db = new SQL.Database(); this.createTables(); this.seedData(); }
      } catch (e) {
        console.warn('DB restore failed, creating fresh:', e);
        db = new SQL.Database();
        this.createTables();
        this.seedData();
      }
    } else {
      db = new SQL.Database();
      this.createTables();
      this.seedData();
    }
    this.save();
  },

  save() {
    const data = db.export();
    const str = btoa(String.fromCharCode(...data));
    localStorage.setItem('iets_sqlite', str);
  },

  reset() {
    db.run("DROP TABLE IF EXISTS meeting_items");
    db.run("DROP TABLE IF EXISTS meeting_participants");
    db.run("DROP TABLE IF EXISTS evaluations");
    db.run("DROP TABLE IF EXISTS activities");
    db.run("DROP TABLE IF EXISTS meetings");
    db.run("DROP TABLE IF EXISTS objectives");
    db.run("DROP TABLE IF EXISTS processes");
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS departments");
    this.createTables();
    this.seedData();
    this.save();
  },

  /* ---- Schema ---- */
  createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT DEFAULT '',
      color TEXT DEFAULT '#2563EB',
      parent TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Usuario',
      dept TEXT REFERENCES departments(id),
      avatar TEXT DEFAULT '',
      color TEXT DEFAULT '#2563EB',
      position TEXT DEFAULT ''
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS objectives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Operativo',
      priority TEXT DEFAULT 'Media',
      dept TEXT REFERENCES departments(id),
      quarter TEXT DEFAULT 'Q1',
      owner INTEGER REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT DEFAULT '',
      dept TEXT REFERENCES departments(id),
      status TEXT DEFAULT 'Activo',
      description TEXT DEFAULT ''
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      week INTEGER NOT NULL,
      description TEXT NOT NULL,
      responsible INTEGER REFERENCES users(id),
      assigned_by INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'Sin iniciar',
      progress INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'Media',
      observations TEXT DEFAULT '',
      pending TEXT DEFAULT '',
      deadline TEXT DEFAULT '',
      objective_id INTEGER,
      process_id INTEGER,
      dragged INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT '1:1',
      title TEXT NOT NULL,
      leader INTEGER REFERENCES users(id),
      date TEXT DEFAULT '',
      status TEXT DEFAULT 'Pendiente',
      notes TEXT DEFAULT ''
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS meeting_participants (
      meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      PRIMARY KEY (meeting_id, user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS meeting_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      period TEXT NOT NULL,
      type TEXT DEFAULT 'Trimestral',
      cumplimiento INTEGER DEFAULT 0,
      calidad INTEGER DEFAULT 0,
      puntualidad INTEGER DEFAULT 0,
      colaboracion INTEGER DEFAULT 0,
      iniciativa INTEGER DEFAULT 0,
      evaluated_by INTEGER REFERENCES users(id),
      date TEXT DEFAULT '',
      comments TEXT DEFAULT '',
      auto_filled INTEGER DEFAULT 0
    )`);
  },

  /* ---- Seed ---- */
  seedData() {
    // Departments
    const depts = [
      ['dir','Dirección Ejecutiva','Dirección','🏛️','#2563EB',null],
      ['sub-tec','Subdirección Técnica','Subdirección','🔬','#0D9488','dir'],
      ['sub-adm','Subdirección Administrativa','Subdirección','💼','#EA580C','dir'],
      ['sub-pid','Subdirección PID','Subdirección','📡','#7C3AED','dir'],
      ['c-ets','Coord. Evaluación de Tecnologías','Coordinación','🧪','#2563EB','sub-tec'],
      ['c-cal','Coord. Calidad','Coordinación','✅','#059669','sub-tec'],
      ['c-th','Coord. Talento Humano','Coordinación','👥','#EC4899','sub-adm'],
      ['c-fin','Coord. Financiera','Coordinación','💰','#D97706','sub-adm'],
      ['c-tic','Coord. TIC','Coordinación','💻','#2563EB','sub-adm'],
      ['j-com','Jefatura Comunicaciones','Jefatura','📣','#EA580C','sub-pid'],
      ['j-inv','Jefatura Investigación','Jefatura','🔍','#0D9488','sub-pid']
    ];
    depts.forEach(d => db.run("INSERT INTO departments VALUES (?,?,?,?,?,?)", d));

    // Users
    const users = [
      [1,'Adriana Robayo','adriana.robayo@iets.org.co','Administrador','dir','AR','#2563EB','Directora Ejecutiva'],
      [2,'Valentina Acosta','valentina.acosta@iets.org.co','Gestor','sub-tec','VA','#0D9488','Subdirectora Técnica'],
      [3,'Carlos Méndez','carlos.mendez@iets.org.co','Usuario','c-ets','CM','#DC2626','Profesional Especializado'],
      [4,'Laura García','laura.garcia@iets.org.co','Usuario','c-ets','LG','#D97706','Profesional Universitario'],
      [5,'Diego Ramírez','diego.ramirez@iets.org.co','Lector','c-cal','DR','#7C3AED','Coordinador de Calidad'],
      [6,'María López','maria.lopez@iets.org.co','Usuario','c-th','ML','#EC4899','Profesional TH'],
      [7,'Andrés Torres','andres.torres@iets.org.co','Gestor','sub-adm','AT','#EA580C','Subdirector Administrativo'],
      [8,'Camila Herrera','camila.herrera@iets.org.co','Usuario','c-fin','CH','#F43F5E','Profesional Financiera'],
      [9,'Sebastián Ruiz','sebastian.ruiz@iets.org.co','Usuario','c-tic','SR','#059669','Ingeniero de Sistemas'],
      [10,'Paula Moreno','paula.moreno@iets.org.co','Gestor','sub-pid','PM','#7C3AED','Subdirectora PID'],
      [11,'Felipe Castro','felipe.castro@iets.org.co','Usuario','j-com','FC','#EA580C','Comunicador'],
      [12,'Natalia Vargas','natalia.vargas@iets.org.co','Usuario','j-inv','NV','#0D9488','Investigadora']
    ];
    users.forEach(u => db.run("INSERT INTO users VALUES (?,?,?,?,?,?,?,?)", u));

    // Objectives
    const objs = [
      [1,'Fortalecer evaluación de tecnologías en salud','Estratégico','Alta','sub-tec','Q1',2],
      [2,'Mejorar eficiencia administrativa y financiera','Estratégico','Alta','sub-adm','Q1',7],
      [3,'Aumentar alcance de difusión institucional','Estratégico','Media','sub-pid','Q1',10],
      [4,'Implementar SGC ISO 9001','Operativo','Alta','c-cal','Q1-Q2',5],
      [5,'Modernización infraestructura TIC','Operativo','Media','c-tic','Q1',9],
      [6,'Plan bienestar y capacitación 2026','Operativo','Baja','c-th','Q1-Q4',6],
      [7,'Producción guías práctica clínica','Misional','Alta','c-ets','Q1-Q2',2],
      [8,'Fortalecimiento investigación aplicada','Misional','Media','j-inv','Q1-Q3',12]
    ];
    objs.forEach(o => db.run("INSERT INTO objectives VALUES (?,?,?,?,?,?,?)", o));

    // Processes
    const procs = [
      [1,'Evaluación de Tecnologías','ETS-01','c-ets','Activo','Proceso misional de ETS.'],
      [2,'Gestión Financiera','GF-01','c-fin','Activo','Gestión financiera y presupuestal.'],
      [3,'Gestión Talento Humano','TH-01','c-th','Activo','Gestión del talento humano.'],
      [4,'Gestión TIC','TIC-01','c-tic','Activo','Gestión tecnológica.'],
      [5,'Gestión de Calidad','CAL-01','c-cal','Activo','Sistema integrado de gestión.'],
      [6,'Comunicaciones','COM-01','j-com','Activo','Comunicaciones institucionales.'],
      [7,'Dirección Estratégica','DIR-01','dir','Activo','Direccionamiento estratégico.']
    ];
    procs.forEach(p => db.run("INSERT INTO processes VALUES (?,?,?,?,?,?)", p));

    // Activities
    const acts = [
      [1,'Enero',1,'Revisión procedimientos gestión documental',3,2,'Cumplida',100,'Alta','Completado','','2026-01-09',1,1,0],
      [2,'Enero',2,'Informe trimestral indicadores de gestión',4,2,'Cumplida',100,'Alta','Entregado a tiempo','','2026-01-16',7,1,0],
      [3,'Enero',3,'Capacitación equipo normatividad técnica',4,1,'Cumplida parcialmente',75,'Media','Faltó personal turno tarde','Reprogramar sesión','2026-01-23',4,5,0],
      [4,'Enero',4,'Actualización BD proveedores y contratos',8,7,'En progreso',60,'Media','Verificación en curso','Validar 15 contratos','2026-01-30',2,2,1],
      [5,'Febrero',5,'Preparación auditoría interna calidad',3,2,'En progreso',45,'Alta','','Recopilar evidencias','2026-02-06',1,1,0],
      [6,'Febrero',5,'Consolidación reportes mensuales áreas',8,7,'No cumplida',20,'Alta','Áreas no enviaron info','Solicitar faltantes','2026-02-06',2,2,0],
      [7,'Febrero',6,'Diseño encuesta satisfacción interna',5,2,'En progreso',30,'Baja','Borrador en revisión','Aprobación coordinación','2026-02-13',4,5,0],
      [8,'Febrero',6,'Ajuste plan anual de trabajo 2026',8,7,'En progreso',50,'Alta','','Incorporar observaciones','2026-02-13',2,2,0],
      [9,'Febrero',6,'Migración servidores infraestructura cloud',9,7,'En progreso',65,'Alta','Fase 2 en ejecución','Pruebas de carga','2026-02-20',5,4,0],
      [10,'Febrero',7,'Campaña institucional primer trimestre',11,10,'Sin iniciar',0,'Media','','','2026-02-20',3,6,0],
      [11,'Febrero',7,'Guía práctica clínica cardiovascular',12,10,'En progreso',40,'Alta','Revisión por pares','Incorporar feedback','2026-02-27',8,1,0],
      [12,'Febrero',6,'Jornadas de bienestar Q1',6,7,'Cumplida parcialmente',70,'Baja','2 de 3 actividades definidas','Confirmar proveedor','2026-02-13',6,3,0]
    ];
    acts.forEach(a => db.run("INSERT INTO activities VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", a));

    // Meetings with participants and items
    const meetings = [
      { id: 1, type: '1:1', title: 'Seguimiento — Carlos', leader: 2, date: '2026-02-10', status: 'Completada', notes: 'Revisamos avance auditoría.', parts: [3], items: [{ t: 'Revisar avance auditoría', d: 1 }, { t: 'Definir entregables semana 7', d: 1 }, { t: 'Feedback presentación', d: 0 }] },
      { id: 2, type: '1:1', title: 'Revisión objetivos — Laura', leader: 2, date: '2026-02-10', status: 'Completada', notes: 'Necesita apoyo normatividad.', parts: [4], items: [{ t: 'Estado capacitación normatividad', d: 1 }, { t: 'Plan formación Q1', d: 1 }] },
      { id: 3, type: '1:1', title: 'Seguimiento — Camila', leader: 7, date: '2026-02-11', status: 'Pendiente', notes: '', parts: [8], items: [{ t: 'Revisión contratos proveedores', d: 0 }, { t: 'Estado consolidación reportes', d: 0 }, { t: 'Plan anual de trabajo', d: 0 }] },
      { id: 4, type: 'N-1', title: 'Equipo Subdirección Técnica', leader: 2, date: '2026-02-10', status: 'Completada', notes: 'Revisión indicadores del equipo.', parts: [3, 4, 5], items: [{ t: 'Indicadores Q1', d: 1 }, { t: 'Avance auditoría', d: 1 }, { t: 'Planificación semana 7', d: 0 }] },
      { id: 5, type: 'N-1', title: 'Equipo Subdirección Admin.', leader: 7, date: '2026-02-10', status: 'Pendiente', notes: '', parts: [6, 8, 9], items: [{ t: 'Ejecución presupuestal enero', d: 0 }, { t: 'Migración TIC', d: 0 }, { t: 'Bienestar Q1', d: 0 }] }
    ];
    meetings.forEach(m => {
      db.run("INSERT INTO meetings VALUES (?,?,?,?,?,?,?)", [m.id, m.type, m.title, m.leader, m.date, m.status, m.notes]);
      m.parts.forEach(p => db.run("INSERT INTO meeting_participants VALUES (?,?)", [m.id, p]));
      m.items.forEach((it, i) => db.run("INSERT INTO meeting_items (meeting_id, text, done, sort_order) VALUES (?,?,?,?)", [m.id, it.t, it.d, i]));
    });

    // Evaluations
    const evals = [
      [1, 3, 'Q1 2026', 'Trimestral', 85, 80, 78, 84, 82, 2, '2026-02-07', '', 0],
      [2, 4, 'Q1 2026', 'Trimestral', 75, 80, 70, 78, 78, 2, '2026-02-07', '', 0],
      [3, 8, 'Q1 2026', 'Trimestral', 65, 72, 60, 75, 70, 7, '2026-02-07', '', 0],
      [4, 9, 'Q1 2026', 'Trimestral', 90, 85, 92, 82, 90, 7, '2026-02-07', '', 0],
      [5, 11, 'Q1 2026', 'Trimestral', 70, 75, 68, 78, 70, 10, '2026-02-07', '', 0],
      [6, 12, 'Q1 2026', 'Trimestral', 80, 82, 75, 78, 80, 10, '2026-02-07', '', 0],
      [7, 6, 'Q1 2026', 'Trimestral', 72, 78, 70, 76, 72, 7, '2026-02-07', '', 0],
      [8, 5, 'Q1 2026', 'Trimestral', 82, 80, 78, 80, 80, 2, '2026-02-07', '', 0]
    ];
    evals.forEach(e => db.run("INSERT INTO evaluations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", e));
  },

  /* ============================================================
     QUERY HELPERS
     ============================================================ */
  _rows(sql, params) {
    const res = db.exec(sql, params);
    if (!res.length) return [];
    const cols = res[0].columns;
    return res[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => obj[c] = row[i]);
      return obj;
    });
  },
  _row(sql, params) {
    const rows = this._rows(sql, params);
    return rows.length ? rows[0] : null;
  },
  _run(sql, params) {
    db.run(sql, params);
    this.save();
  },

  /* ---- Departments ---- */
  getDepts() { return this._rows("SELECT * FROM departments"); },
  getDept(id) { return this._row("SELECT * FROM departments WHERE id = ?", [id]); },
  createDept(d) {
    this._run("INSERT INTO departments (id,name,type,icon,color,parent) VALUES (?,?,?,?,?,?)",
      [d.id, d.name, d.type, d.icon || '', d.color || '#2563EB', d.parent || null]);
  },
  updateDept(id, d) {
    this._run("UPDATE departments SET name=?,type=?,icon=?,color=?,parent=? WHERE id=?",
      [d.name, d.type, d.icon || '', d.color || '#2563EB', d.parent || null, id]);
  },
  deleteDept(id) {
    // Check for users and child depts
    const users = this.getUsersByDept(id);
    const children = this._rows("SELECT id FROM departments WHERE parent = ?", [id]);
    if (users.length || children.length) return false;
    this._run("DELETE FROM departments WHERE id = ?", [id]);
    return true;
  },

  getChildDeptIds(parentId) {
    const children = this._rows("SELECT id FROM departments WHERE parent = ?", [parentId]);
    let ids = children.map(c => c.id);
    children.forEach(c => { ids = ids.concat(this.getChildDeptIds(c.id)); });
    return ids;
  },

  /* ---- Users ---- */
  getUsers() { return this._rows("SELECT * FROM users ORDER BY name"); },
  getUser(id) { return this._row("SELECT * FROM users WHERE id = ?", [id]); },
  getUsersByDept(deptId) { return this._rows("SELECT * FROM users WHERE dept = ? ORDER BY name", [deptId]); },
  getNextUserId() {
    const r = this._row("SELECT COALESCE(MAX(id),0)+1 as nid FROM users");
    return r ? r.nid : 1;
  },

  createUser(d) {
    const av = (d.name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#2563EB','#0D9488','#DC2626','#D97706','#7C3AED','#EC4899','#EA580C','#F43F5E','#059669'];
    const color = d.color || colors[Math.floor(Math.random() * colors.length)];
    const id = this.getNextUserId();
    this._run("INSERT INTO users (id,name,email,role,dept,avatar,color,position) VALUES (?,?,?,?,?,?,?,?)",
      [id, d.name, d.email, d.role || 'Usuario', d.dept, av, color, d.position || '']);
    return id;
  },
  updateUser(id, d) {
    const av = (d.name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    this._run("UPDATE users SET name=?,email=?,role=?,dept=?,avatar=?,color=?,position=? WHERE id=?",
      [d.name, d.email, d.role, d.dept, av, d.color || '#2563EB', d.position || '', id]);
  },
  deleteUser(id) {
    // Check dependencies
    const acts = this._row("SELECT COUNT(*) as c FROM activities WHERE responsible = ?", [id]);
    if (acts && acts.c > 0) return { ok: false, reason: 'Tiene actividades asignadas (' + acts.c + ')' };
    const evals = this._row("SELECT COUNT(*) as c FROM evaluations WHERE user_id = ?", [id]);
    if (evals && evals.c > 0) return { ok: false, reason: 'Tiene evaluaciones registradas (' + evals.c + ')' };
    db.run("DELETE FROM meeting_participants WHERE user_id = ?", [id]);
    this._run("DELETE FROM users WHERE id = ?", [id]);
    return { ok: true };
  },
  changeUserRole(userId, newRole) {
    this._run("UPDATE users SET role = ? WHERE id = ?", [newRole, userId]);
  },

  /* ---- Objectives ---- */
  getObjectives() { return this._rows("SELECT * FROM objectives ORDER BY id"); },
  getObjective(id) { return this._row("SELECT * FROM objectives WHERE id = ?", [id]); },

  createObjective(d) {
    this._run("INSERT INTO objectives (name,type,priority,dept,quarter,owner) VALUES (?,?,?,?,?,?)",
      [d.name, d.type, d.priority, d.dept, d.quarter, d.owner]);
  },
  updateObjective(id, d) {
    this._run("UPDATE objectives SET name=?,type=?,priority=?,dept=?,quarter=?,owner=? WHERE id=?",
      [d.name, d.type, d.priority, d.dept, d.quarter, d.owner, id]);
  },
  deleteObjective(id) { this._run("DELETE FROM objectives WHERE id = ?", [id]); },

  calcObjProgress(objId) {
    const rows = this._rows("SELECT progress FROM activities WHERE objective_id = ?", [objId]);
    if (!rows.length) return 0;
    return Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length);
  },

  /* ---- Processes ---- */
  getProcesses() { return this._rows("SELECT * FROM processes ORDER BY id"); },
  getProcess(id) { return this._row("SELECT * FROM processes WHERE id = ?", [id]); },
  createProcess(d) {
    this._run("INSERT INTO processes (name,code,dept,status,description) VALUES (?,?,?,?,?)",
      [d.name, d.code || '', d.dept, d.status || 'Activo', d.description || '']);
  },
  updateProcess(id, d) {
    this._run("UPDATE processes SET name=?,code=?,dept=?,status=?,description=? WHERE id=?",
      [d.name, d.code || '', d.dept, d.status || 'Activo', d.description || '', id]);
  },
  deleteProcess(id) {
    const acts = this._row("SELECT COUNT(*) as c FROM activities WHERE process_id = ?", [id]);
    if (acts && acts.c > 0) return { ok: false, reason: 'Tiene actividades vinculadas (' + acts.c + ')' };
    this._run("DELETE FROM processes WHERE id = ?", [id]);
    return { ok: true };
  },

  /* ---- Export ---- */
  exportCSV(table) {
    const rows = this._rows("SELECT * FROM " + table);
    if (!rows.length) return '';
    const cols = Object.keys(rows[0]);
    let csv = cols.join(',') + '\n';
    rows.forEach(r => { csv += cols.map(c => '"' + String(r[c] || '').replace(/"/g, '""') + '"').join(',') + '\n'; });
    return csv;
  },
  exportAllCSV() {
    const tables = ['users','departments','activities','objectives','processes','meetings','evaluations'];
    let all = '';
    tables.forEach(t => { all += '=== ' + t.toUpperCase() + ' ===\n' + this.exportCSV(t) + '\n\n'; });
    return all;
  },

  /* ---- Activities ---- */
  getActivities() { return this._rows("SELECT * FROM activities ORDER BY id DESC"); },
  getActivity(id) { return this._row("SELECT * FROM activities WHERE id = ?", [id]); },
  getActivitiesByUser(userId) { return this._rows("SELECT * FROM activities WHERE responsible = ? ORDER BY id DESC", [userId]); },
  getActivitiesByObjective(objId) { return this._rows("SELECT * FROM activities WHERE objective_id = ?", [objId]); },
  getActivitiesByProcess(procId) { return this._rows("SELECT * FROM activities WHERE process_id = ?", [procId]); },

  createActivity(d) {
    this._run(`INSERT INTO activities (month,week,description,responsible,assigned_by,status,progress,priority,observations,pending,deadline,objective_id,process_id,dragged)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.month, d.week, d.description, d.responsible, d.assigned_by, d.status, d.progress, d.priority, d.observations || '', d.pending || '', d.deadline || '', d.objective_id || null, d.process_id || null, d.dragged ? 1 : 0]);
  },
  updateActivity(id, d) {
    this._run(`UPDATE activities SET month=?,week=?,description=?,responsible=?,status=?,progress=?,priority=?,observations=?,pending=?,deadline=?,objective_id=?,process_id=?,dragged=? WHERE id=?`,
      [d.month, d.week, d.description, d.responsible, d.status, d.progress, d.priority, d.observations || '', d.pending || '', d.deadline || '', d.objective_id || null, d.process_id || null, d.dragged ? 1 : 0, id]);
  },
  deleteActivity(id) { this._run("DELETE FROM activities WHERE id = ?", [id]); },

  getActivityCount() { return this._row("SELECT COUNT(*) as c FROM activities").c; },
  getActivityStats() {
    return {
      total: this._row("SELECT COUNT(*) as c FROM activities").c,
      done: this._row("SELECT COUNT(*) as c FROM activities WHERE status = 'Cumplida'").c,
      inProgress: this._row("SELECT COUNT(*) as c FROM activities WHERE status = 'En progreso'").c,
      failed: this._row("SELECT COUNT(*) as c FROM activities WHERE status = 'No cumplida'").c,
      avgProgress: this._row("SELECT COALESCE(AVG(progress),0) as a FROM activities").a
    };
  },

  /* ---- Meetings ---- */
  getMeetings() {
    const meets = this._rows("SELECT * FROM meetings ORDER BY date DESC, id DESC");
    meets.forEach(m => {
      m.participants = this._rows("SELECT u.* FROM meeting_participants mp JOIN users u ON u.id = mp.user_id WHERE mp.meeting_id = ?", [m.id]);
      m.items = this._rows("SELECT * FROM meeting_items WHERE meeting_id = ? ORDER BY sort_order", [m.id]);
    });
    return meets;
  },
  getMeeting(id) {
    const m = this._row("SELECT * FROM meetings WHERE id = ?", [id]);
    if (!m) return null;
    m.participants = this._rows("SELECT u.* FROM meeting_participants mp JOIN users u ON u.id = mp.user_id WHERE mp.meeting_id = ?", [id]);
    m.items = this._rows("SELECT * FROM meeting_items WHERE meeting_id = ? ORDER BY sort_order", [id]);
    return m;
  },

  createMeeting(d) {
    db.run("INSERT INTO meetings (type,title,leader,date,status,notes) VALUES (?,?,?,?,?,?)",
      [d.type, d.title, d.leader, d.date || '', d.status || 'Pendiente', d.notes || '']);
    const mid = this._row("SELECT last_insert_rowid() as id").id;
    (d.participants || []).forEach(uid => db.run("INSERT INTO meeting_participants VALUES (?,?)", [mid, uid]));
    (d.items || []).forEach((it, i) => db.run("INSERT INTO meeting_items (meeting_id,text,done,sort_order) VALUES (?,?,?,?)", [mid, it.t || it.text || it, 0, i]));
    this.save();
  },
  updateMeeting(id, d) {
    db.run("UPDATE meetings SET type=?,title=?,leader=?,date=?,status=?,notes=? WHERE id=?",
      [d.type, d.title, d.leader, d.date || '', d.status || 'Pendiente', d.notes || '', id]);
    db.run("DELETE FROM meeting_participants WHERE meeting_id = ?", [id]);
    (d.participants || []).forEach(uid => db.run("INSERT INTO meeting_participants VALUES (?,?)", [id, uid]));
    // Only update items if provided (preserves done state otherwise)
    if (d.replaceItems) {
      db.run("DELETE FROM meeting_items WHERE meeting_id = ?", [id]);
      (d.items || []).forEach((it, i) => db.run("INSERT INTO meeting_items (meeting_id,text,done,sort_order) VALUES (?,?,?,?)", [id, it.t || it.text || it, it.d || 0, i]));
    }
    this.save();
  },
  deleteMeeting(id) {
    db.run("DELETE FROM meeting_items WHERE meeting_id = ?", [id]);
    db.run("DELETE FROM meeting_participants WHERE meeting_id = ?", [id]);
    this._run("DELETE FROM meetings WHERE id = ?", [id]);
  },

  toggleMeetingItem(itemId) {
    this._run("UPDATE meeting_items SET done = CASE WHEN done = 1 THEN 0 ELSE 1 END WHERE id = ?", [itemId]);
  },

  getMeetingsForUser(userId) {
    return this._rows(`SELECT DISTINCT m.* FROM meetings m
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
      WHERE m.leader = ? OR mp.user_id = ?
      ORDER BY m.date DESC`, [userId, userId]);
  },

  /* ---- Evaluations ---- */
  getEvaluations() { return this._rows("SELECT * FROM evaluations ORDER BY date DESC, id DESC"); },
  getEvaluation(id) { return this._row("SELECT * FROM evaluations WHERE id = ?", [id]); },
  getEvalByUser(userId) { return this._rows("SELECT * FROM evaluations WHERE user_id = ? ORDER BY date DESC", [userId]); },

  createEvaluation(d) {
    this._run(`INSERT INTO evaluations (user_id,period,type,cumplimiento,calidad,puntualidad,colaboracion,iniciativa,evaluated_by,date,comments,auto_filled)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.user_id, d.period, d.type || 'Trimestral', d.cumplimiento, d.calidad, d.puntualidad, d.colaboracion, d.iniciativa, d.evaluated_by, d.date || new Date().toISOString().split('T')[0], d.comments || '', d.auto_filled ? 1 : 0]);
  },
  updateEvaluation(id, d) {
    this._run(`UPDATE evaluations SET cumplimiento=?,calidad=?,puntualidad=?,colaboracion=?,iniciativa=?,comments=?,auto_filled=? WHERE id=?`,
      [d.cumplimiento, d.calidad, d.puntualidad, d.colaboracion, d.iniciativa, d.comments || '', d.auto_filled ? 1 : 0, id]);
  },
  deleteEvaluation(id) { this._run("DELETE FROM evaluations WHERE id = ?", [id]); },

  calcEvalScore(ev) {
    return Math.round((ev.cumplimiento * 25 + ev.calidad * 25 + ev.puntualidad * 20 + ev.colaboracion * 15 + ev.iniciativa * 15) / 100);
  },

  /* ============================================================
     HIERARCHICAL PERMISSION SYSTEM
     ============================================================ */

  /**
   * Check if evaluator can evaluate target based on hierarchy:
   * - Administrador: can evaluate anyone
   * - Gestor: can evaluate users in their dept and child depts
   * - Others: cannot evaluate
   */
  canEvaluate(evaluatorId, targetId) {
    if (evaluatorId === targetId) return false;
    const evaluator = this.getUser(evaluatorId);
    const target = this.getUser(targetId);
    if (!evaluator || !target) return false;

    if (evaluator.role === 'Administrador') return true;
    if (evaluator.role !== 'Gestor') return false;

    // Gestor can evaluate users in their dept and all child departments
    const childDepts = this.getChildDeptIds(evaluator.dept);
    return target.dept === evaluator.dept || childDepts.includes(target.dept);
  },

  /**
   * Check if user can edit an existing evaluation:
   * - Original evaluator can always edit
   * - Anyone above in hierarchy can also edit
   */
  canEditEvaluation(userId, evalRecord) {
    if (userId === evalRecord.evaluated_by) return true;
    const user = this.getUser(userId);
    if (!user) return false;
    if (user.role === 'Administrador') return true;
    if (user.role !== 'Gestor') return false;

    // Check if user is above the evaluated person in hierarchy
    const target = this.getUser(evalRecord.user_id);
    if (!target) return false;
    const childDepts = this.getChildDeptIds(user.dept);
    return target.dept === user.dept || childDepts.includes(target.dept);
  },

  /**
   * Get list of users that the given evaluator can evaluate
   */
  getEvaluatableUsers(evaluatorId) {
    const evaluator = this.getUser(evaluatorId);
    if (!evaluator) return [];
    if (evaluator.role === 'Administrador') {
      return this.getUsers().filter(u => u.id !== evaluatorId);
    }
    if (evaluator.role !== 'Gestor') return [];

    const childDepts = this.getChildDeptIds(evaluator.dept);
    const allowedDepts = [evaluator.dept, ...childDepts];
    return this.getUsers().filter(u => u.id !== evaluatorId && allowedDepts.includes(u.dept));
  },

  /* ============================================================
     AUTO-FILL EVALUATION
     Calculates dimension scores from real activity & meeting data
     ============================================================ */
  calcAutoEval(userId) {
    const acts = this.getActivitiesByUser(userId);
    const result = { cumplimiento: 50, calidad: 50, puntualidad: 50, colaboracion: 50, iniciativa: 50 };

    if (!acts.length) return result;

    // CUMPLIMIENTO: ratio of completed activities
    const statusWeights = {
      'Cumplida': 1.0,
      'Cumplida parcialmente': 0.6,
      'En progreso': 0.3,
      'No cumplida': 0.0,
      'Sin iniciar': 0.0,
      'No aplica': 0.5
    };
    const cumpSum = acts.reduce((s, a) => s + (statusWeights[a.status] || 0), 0);
    result.cumplimiento = Math.min(100, Math.round((cumpSum / acts.length) * 100));

    // CALIDAD: weighted quality score
    const qualWeights = {
      'Cumplida': 100,
      'Cumplida parcialmente': 70,
      'En progreso': 50,
      'No cumplida': 20,
      'Sin iniciar': 10,
      'No aplica': 50
    };
    result.calidad = Math.min(100, Math.round(acts.reduce((s, a) => s + (qualWeights[a.status] || 30), 0) / acts.length));

    // PUNTUALIDAD: activities completed on/before deadline
    const withDl = acts.filter(a => a.deadline && ['Cumplida', 'Cumplida parcialmente'].includes(a.status));
    if (withDl.length) {
      const onTime = withDl.filter(a => a.deadline >= a.deadline).length; // all on-time for completed ones
      // Better metric: compare progress vs time elapsed
      let punctScore = 0;
      withDl.forEach(a => {
        punctScore += a.status === 'Cumplida' ? 100 : 65;
      });
      const late = acts.filter(a => a.deadline && a.deadline < new Date().toISOString().split('T')[0] && !['Cumplida', 'Cumplida parcialmente', 'No aplica'].includes(a.status));
      const totalDl = withDl.length + late.length;
      if (totalDl > 0) {
        result.puntualidad = Math.min(100, Math.round(punctScore / totalDl));
      } else {
        result.puntualidad = 70;
      }
    } else {
      result.puntualidad = 70;
    }

    // COLABORACION: meeting participation and engagement
    const meetings = this.getMeetingsForUser(userId);
    if (meetings.length) {
      let totalItems = 0, doneItems = 0;
      meetings.forEach(mId => {
        const m = this.getMeeting(mId.id);
        if (m && m.items) {
          m.items.forEach(it => { totalItems++; if (it.done) doneItems++; });
        }
      });
      const meetScore = Math.min(100, meetings.length * 15);
      const itemScore = totalItems ? Math.round((doneItems / totalItems) * 100) : 70;
      result.colaboracion = Math.min(100, Math.round((meetScore + itemScore) / 2));
    } else {
      result.colaboracion = 60;
    }

    // INICIATIVA: average progress + extra for high completion
    const avgProg = Math.round(acts.reduce((s, a) => s + a.progress, 0) / acts.length);
    const highPerf = acts.filter(a => a.progress >= 80).length;
    const bonus = Math.min(15, Math.round((highPerf / acts.length) * 15));
    result.iniciativa = Math.min(100, avgProg + bonus);

    return result;
  }
};
