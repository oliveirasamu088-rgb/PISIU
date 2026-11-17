/* Contas na nuvem (Firebase Authentication). Só identifica quem entrou:
   os exames e cadastros continuam salvos neste computador. */
(function (P) {
  var cfg = window.PSILOG_FIREBASE || {};
  var C = { enabled: false, user: null, ready: Promise.resolve(null) };
  P.cloud = C;

  if (typeof firebase === 'undefined' || !cfg.apiKey || cfg.apiKey.indexOf('COLE') === 0) return;
  C.enabled = true;

  var MSG = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/email-already-in-use': 'Esse e-mail já tem conta. Use "Entrar".',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de concluir.',
    'auth/cancelled-popup-request': 'A janela do Google foi fechada antes de concluir.',
    'auth/popup-blocked': 'O navegador bloqueou a janela do Google.',
    'auth/unauthorized-domain': 'Este endereço ainda não está autorizado no Firebase. Adicione-o em Authentication > Configurações > Domínios autorizados.',
    'auth/web-storage-unsupported': 'O navegador está bloqueando o armazenamento do site. Use uma aba normal, sem bloqueio de cookies.',
    'auth/operation-not-supported-in-this-environment': 'O navegador não permitiu abrir o login do Google. Tente em uma aba normal do Chrome ou Edge.'
  };
  function wrap(p) {
    return p.catch(function (e) { throw new Error(MSG[e && e.code] || (e && e.message) || 'Não foi possível concluir.'); });
  }

  firebase.initializeApp(cfg);
  var auth = firebase.auth();
  if (auth.useDeviceLanguage) auth.useDeviceLanguage();

  C.ready = new Promise(function (resolve) {
    var first = true;
    auth.onAuthStateChanged(function (user) {
      C.user = user || null;
      if (first) { first = false; resolve(C.user); }
    });
  });

  C.signIn = function (email, senha) { return wrap(auth.signInWithEmailAndPassword(email, senha)); };
  C.signUp = function (email, senha) {
    return wrap(auth.createUserWithEmailAndPassword(email, senha).then(function (cred) {
      return cred.user.sendEmailVerification().catch(function () {}).then(function () { return cred; });
    }));
  };
  /** Google: janela (pop-up); se o navegador não permitir, redireciona a página inteira. */
  C.google = function () {
    var web = /^https?:$/.test(location.protocol);
    if (/Electron/i.test(navigator.userAgent)) {
      return Promise.reject(new Error('No aplicativo para Windows, entre com e-mail e senha. O Google funciona no site.'));
    }
    if (!web) {
      return Promise.reject(new Error('Esta página foi aberta como arquivo do computador. Para entrar com Google, abra o site pelo endereço https.'));
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider).catch(function (e) {
      var fallback = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'];
      if (e && fallback.indexOf(e.code) !== -1) {
        return auth.signInWithRedirect(provider).then(function () { return new Promise(function () {}); });
      }
      throw e;
    }).catch(function (e) {
      throw new Error(MSG[e && e.code] || (e && e.message) || 'Não foi possível entrar com o Google.');
    });
  };

  // Volta do redirecionamento do Google: guarda um eventual erro para mostrar na tela de entrada.
  if (auth.getRedirectResult) {
    auth.getRedirectResult().catch(function (e) {
      C.redirectError = MSG[e && e.code] || (e && e.message) || '';
    });
  }
  C.reset = function (email) { return wrap(auth.sendPasswordResetEmail(email)); };
  C.signOut = function () { return auth.signOut().catch(function () {}); };
})(window.Psilog);
