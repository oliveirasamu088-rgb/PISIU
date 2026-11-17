/* Painel inicial — visão de trabalho do consultório. */
(function (P) {
  var link = P.router.href;
  function icon(path) {
    return '<span class="dash-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg></span>';
  }
  async function patientHome(root) {
    var u = P.auth.user;
    var exams = (await P.DB.all('exams')).filter(function (e) { return e.patientId === u.patientId; });
    var avg = exams.length
      ? Math.round(exams.reduce(function (a, x) { return a + (x.totalTrials ? x.acertos / x.totalTrials : 0); }, 0) / exams.length * 100) + '%'
      : '—';
    root.innerHTML =
      '<section class="dashboard-heading">' +
        '<div><div class="eyebrow">OLÁ, ' + P.utils.esc(u.nome) + '</div><h1>Vamos fazer suas atividades</h1>' +
        '<p>Escolha uma atividade, responda com atenção e depois veja como foi o seu desempenho.</p></div>' +
        '<a class="btn dash-primary" href="' + link('tarefas') + '"><span>＋</span> Fazer atividades</a>' +
      '</section>' +
      '<section class="dashboard-metrics" aria-label="Indicadores">' +
        '<article class="dash-metric"><span class="metric-symbol">▤</span><div><small>Atividades feitas</small><b>' + exams.length + '</b><em>Registradas</em></div></article>' +
        '<article class="dash-metric"><span class="metric-symbol">↗</span><div><small>Acerto médio</small><b>' + avg + '</b><em>Nas atividades salvas</em></div></article>' +
      '</section>' +
      '<section class="dashboard-section"><div class="professional-grid">' +
        '<a class="professional-tile tile-feature" href="' + link('tarefas') + '">' +
          icon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>') +
          '<div><b>Atividades</b><span>Escolha uma atividade para fazer.</span></div><i>→</i></a>' +
        '<a class="professional-tile" href="' + link('resultados') + '">' +
          icon('<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/>') +
          '<div><b>Meus resultados</b><span>Veja como foi o seu desempenho.</span></div><i>→</i></a>' +
      '</div></section>';
  }

  P.views.inicio = {
    title: 'Visão geral',
    mount: async function (root) {
      if (P.auth.isPatient()) return patientHome(root);
      root.innerHTML =
        '<section class="dashboard-heading">' +
          '<div><div class="eyebrow">PAINEL DE ACOMPANHAMENTO</div><h1>Visão geral</h1>' +
          '<p>Organize avaliações, acompanhe resultados e mantenha seus registros em um só lugar.</p></div>' +
          '<a class="btn dash-primary" href="' + link('cadastro') + '"><span>＋</span> Iniciar avaliação</a>' +
        '</section>' +
        '<section class="dashboard-metrics" id="stats" aria-label="Indicadores"></section>' +
        '<section class="dashboard-section">' +
          '<div class="section-heading"><div><div class="eyebrow">FLUXO DE TRABALHO</div><h2>Acesso rápido</h2></div></div>' +
          '<div class="professional-grid">' +
            '<a class="professional-tile tile-feature" href="' + link('cadastro') + '">' +
              icon('<path d="M12 5v14M5 12h14"/>') +
              '<div><b>Nova avaliação</b><span>Cadastre os dados do paciente e inicie uma tarefa.</span></div><i>→</i></a>' +
            '<a class="professional-tile" href="' + link('tarefas') + '">' +
              icon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>') +
              '<div><b>Tarefas cognitivas</b><span>Acesse as atividades de atenção sustentada.</span></div><i>→</i></a>' +
            '<a class="professional-tile" href="' + link('resultados') + '">' +
              icon('<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/>') +
              '<div><b>Resultados</b><span>Consulte métricas e desempenho dos testes.</span></div><i>→</i></a>' +
            '<a class="professional-tile" href="' + link('resumo') + '">' +
              icon('<path d="M7 3h8l4 4v14H5V3z"/><path d="M14 3v5h5M8 13h8M8 17h8"/>') +
              '<div><b>Resumo clínico</b><span>Visualize o resumo dos registros e percentis.</span></div><i>→</i></a>' +
            '<a class="professional-tile" href="' + link('pacientes') + '">' +
              icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 11.5a3 3 0 1 0 0-6M18 14.3c2.2.6 3.5 2.4 3.5 5.7"/>') +
              '<div><b>Pacientes</b><span>Edite cadastros e crie o acesso do paciente.</span></div><i>→</i></a>' +
            '<a class="professional-tile" href="' + link('atividades') + '">' +
              icon('<path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/>') +
              '<div><b>Atividades</b><span>Crie e gerencie atividades personalizadas.</span></div><i>→</i></a>' +
            '<a class="professional-tile" href="' + link('dados') + '">' +
              icon('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>') +
              '<div><b>Dados e segurança</b><span>Faça exportações e mantenha cópias de segurança.</span></div><i>→</i></a>' +
          '</div>' +
        '</section>' +
        '<section class="dashboard-note"><span class="note-mark">i</span><div><b>Privacidade e armazenamento</b><p>Os registros desta versão ficam armazenados localmente neste dispositivo. Faça backups periódicos na seção Dados.</p></div><a href="' + link('dados') + '">Acessar backups →</a></section>' +
        '<p class="clinical-disclaimer">O Psilog é uma ferramenta de apoio. A interpretação dos resultados deve considerar o contexto da avaliação e o julgamento do profissional.</p>';

      var patients = await P.DB.all('patients');
      var exams = await P.DB.all('exams');
      var avg = exams.length
        ? Math.round(exams.reduce(function (a, x) { return a + (x.totalTrials ? x.acertos / x.totalTrials : 0); }, 0) / exams.length * 100) + '%'
        : '—';
      root.querySelector('#stats').innerHTML =
        '<article class="dash-metric"><span class="metric-symbol">♙</span><div><small>Pacientes cadastrados</small><b>' + patients.length + '</b><em>Registros locais</em></div></article>' +
        '<article class="dash-metric"><span class="metric-symbol">▤</span><div><small>Avaliações realizadas</small><b>' + exams.length + '</b><em>Testes registrados</em></div></article>' +
        '<article class="dash-metric"><span class="metric-symbol">↗</span><div><small>Média de acertos</small><b>' + avg + '</b><em>Nos testes salvos</em></div></article>';
    }
  };
})(window.Psilog);
