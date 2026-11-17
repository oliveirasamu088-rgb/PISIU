/* Perfis (profissional / paciente) e sessão. Sem Firebase configurado: a pessoa só escolhe o perfil (local).
   Com Firebase (js/core/firebase-config.js): conta por e-mail/senha ou Google. */
(function (P) {
  var KEY = 'psilog.session';
  var PATIENT_ROUTES = ['inicio', 'tarefas', 'teste', 'resultados', 'aparencia', 'tour'];
  var mem = null;

  function store(v) {
    try { if (v == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, v); } catch (e) { mem = v; }
  }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return mem; } }

  var A = {
    user: null,
    isPro: function () { return !!A.user && A.user.role === 'profissional'; },
    isPatient: function () { return !!A.user && A.user.role === 'paciente'; },

    /** Paciente enxerga só o próprio cadastro. */
    scope: function (patients) {
      return A.isPatient() ? patients.filter(function (p) { return p.id === A.user.patientId; }) : patients;
    },

    guard: function (name) {
      if (!A.user) return 'login';
      if (name === 'login') return 'inicio';
      if (A.user.role === 'paciente' && PATIENT_ROUTES.indexOf(name) < 0) return 'inicio';
      return name;
    },

    paint: function () {
      document.body.dataset.role = A.user ? (A.isPro() ? 'pro' : 'paciente') : 'anon';
      var w = document.getElementById('who');
      if (w) w.textContent = A.user ? A.user.nome.split(' ')[0] : '';
    },

    init: async function () {
      if (P.cloud.enabled) { await P.cloud.ready; await A.syncCloud(); return; }
      var id = saved();
      A.user = id ? (await P.DB.get('users', id)) || null : null;
      A.paint();
    },

    /** Com conta na nuvem: acha o perfil ligado a quem entrou (se ainda não existe, o login pede o cadastro). */
    syncCloud: async function () {
      var fb = P.cloud.user;
      A.user = fb ? (await P.DB.all('users')).find(function (x) { return x.uid === fb.uid; }) || null : null;
      A.paint();
    },

    /** Cria o perfil (profissional ou paciente) da conta que acabou de entrar. */
    completeProfile: async function (role, data) {
      var fb = P.cloud.user;
      if (!fb) throw new Error('Entre na sua conta primeiro.');
      var nome = String(data.nome || '').trim();
      if (!nome) throw new Error('Informe o nome.');
      var rec = { nome: nome, role: role, uid: fb.uid, email: fb.email || '' };
      if (role === 'paciente') {
        var p = await P.DB.put('patients', {
          nome: nome, dataExame: new Date().toISOString().slice(0, 10), sexo: data.sexo,
          nascimento: data.nascimento, idade: P.utils.age(data.nascimento),
          escolaridade: '—', lateralidade: '—', anosEstudo: 0, obs: '',
          consentimento: true, consentimentoEm: new Date().toISOString()
        });
        rec.patientId = p.id;
      }
      A.user = await P.DB.put('users', rec);
      A.paint();
    },

    professionals: async function () {
      return (await P.DB.all('users')).filter(function (x) { return x.role === 'profissional'; });
    },

    enterPro: async function (userId) {
      var u = await P.DB.get('users', userId || '');
      if (!u || u.role !== 'profissional') throw new Error('Profissional não encontrado.');
      A.user = u; store(u.id); A.paint();
    },

    registerPro: async function (nome) {
      nome = String(nome || '').trim();
      if (!nome) throw new Error('Informe o nome.');
      var u = await P.DB.put('users', { nome: nome, role: 'profissional' });
      return A.enterPro(u.id);
    },

    enterPatient: async function (patientId) {
      var patient = await P.DB.get('patients', patientId || '');
      if (!patient) throw new Error('Paciente não encontrado.');
      var u = (await P.DB.all('users')).find(function (x) { return x.patientId === patient.id; });
      A.user = u || await P.DB.put('users', { nome: patient.nome, role: 'paciente', patientId: patient.id });
      store(A.user.id); A.paint();
    },

    logout: function () {
      A.user = null; store(null); A.paint();
      if (P.cloud.enabled) P.cloud.signOut();
    }
  };

  P.auth = A;
})(window.Psilog);
