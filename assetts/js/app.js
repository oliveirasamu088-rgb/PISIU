/* Ponto de entrada: liga o botão de tema e inicia o roteador. */
(function (P) {
  document.getElementById('theme-toggle').addEventListener('click', function () {
    PsilogTheme.toggleMode();
  });

  // Menu hambúrguer: fecha ao navegar, ao clicar fora ou com Esc.
  var btn = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  btn.addEventListener('click', function () { setMenu(nav.hidden); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', function (e) {
    if (!nav.hidden && !e.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !nav.hidden) { setMenu(false); btn.focus(); }
  });
  window.addEventListener('hashchange', function () { setMenu(false); });

  var sectionNames = {
    login: 'Entrar', pacientes: 'Pacientes', atividades: 'Atividades', inicio: 'Visão geral', cadastro: 'Novo exame', tarefas: 'Tarefas cognitivas',
    teste: 'Aplicação do teste', resultados: 'Resultados', resumo: 'Resumo clínico',
    dados: 'Dados e backups', aparencia: 'Preferências', tour: 'Ajuda e tour'
  };
  function updateSection() {
    var route = (location.hash.replace(/^#\/?/, '').split('?')[0] || 'inicio');
    var target = document.getElementById('current-section');
    if (target) target.textContent = sectionNames[route] || 'Psilog';
  }
  window.addEventListener('hashchange', updateSection);
  updateSection();
  document.getElementById('logout').addEventListener('click', function (e) {
    e.preventDefault(); P.auth.logout(); P.router.go('login');
  });
  P.auth.init().then(P.refreshTasks).catch(console.error).then(P.router.start);
})(window.Psilog);
