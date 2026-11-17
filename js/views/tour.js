/* Tela: Tour interativo (mini telas simuladas, sem gravar nada no banco). */
(function (P) {
  P.views.tour = {
    title: 'Tour interativo',
    mount: function (root) {
      root.classList.add('tour');
      root.innerHTML =
        '<div class="tour-head"><div><h1>Psilog · tour interativo</h1>' +
        '<p>Clique nas funções e use cada mini tela, como no app de verdade.</p></div>' +
        '<a href="' + P.router.href('inicio') + '">Voltar ao início →</a></div>' +
        '<div class="tour-wrap"><div class="tour-tabs" id="tabs"></div>' +
        '<div class="tour-win"><div class="tour-bar"><i></i><i></i><i></i><span id="url"></span></div>' +
        '<div class="tour-screen" id="screen"></div><div class="tour-caption" id="caption"></div></div></div>';

      var $ = function (s, el) { return (el || root).querySelector(s); };
      var timer = null, current = 0;

      var STEPS = [
        { n: 'Início', route: 'inicio', d: 'Painel com contadores, ilustração e atalhos. Clique em um atalho.',
          render: function (el) {
            el.innerHTML = '<h2>Psilog</h2><p class="tour-hint">Testes de atenção, cadastro e resultados em um só lugar.</p>' +
              '<div class="tour-grid" style="margin-top:14px">' +
              [['➕', 'Novo exame', 1], ['🎯', 'Tarefas', 2], ['📊', 'Resultados', 4], ['🧾', 'Resumo', 5]].map(function (x) {
                return '<button class="tour-card" data-go="' + x[2] + '"><b>' + x[0] + ' ' + x[1] + '</b><span>Abrir esta função</span></button>';
              }).join('') + '</div>';
            el.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { go(+b.dataset.go); }; });
          } },

        { n: 'Cadastro', route: 'cadastro', d: 'Formulário do paciente. A idade é calculada sozinha pela data de nascimento — teste aí.',
          render: function (el) {
            el.innerHTML = '<h3>Cadastro do paciente</h3><label>Nome<input placeholder="Ex.: Maria Oliveira"></label>' +
              '<label>Nascimento<input type="date" id="nb" value="1990-05-12"></label>' +
              '<div class="tour-card static">Idade calculada: <b id="age" style="display:inline"></b></div>';
            var update = function () {
              var age = P.utils.age($('#nb', el).value);
              $('#age', el).textContent = age === '' || isNaN(age) ? '—' : age + ' anos';
            };
            $('#nb', el).oninput = update;
            update();
          } },

        { n: 'Tarefas', route: 'tarefas', d: 'Escolha a tarefa 1, 2 ou 3 (ritmos lento, médio e rápido). Clique para selecionar.',
          render: function (el) {
            var items = [['1', 'Ritmo lento', '20 estímulos · 950 ms'], ['2', 'Ritmo médio', '26 estímulos · 720 ms'], ['3', 'Ritmo rápido', '32 estímulos · 560 ms']];
            el.innerHTML = '<h3>Seleção de tarefa</h3><div class="tour-grid">' + items.map(function (x) {
              return '<button class="tour-card"><b style="font-size:26px">' + x[0] + '</b><b>' + x[1] + '</b><span>' + x[2] + '</span></button>';
            }).join('') + '</div><p class="tour-hint" id="hint">Nenhuma tarefa selecionada.</p>';
            el.querySelectorAll('.tour-card').forEach(function (b, i) {
              b.onclick = function () {
                el.querySelectorAll('.tour-card').forEach(function (x) { x.classList.remove('sel'); });
                b.classList.add('sel');
                $('#hint', el).textContent = 'Tarefa ' + items[i][0] + ' selecionada: ' + items[i][1] + '.';
              };
            });
          } },

        { n: 'Teste', route: 'teste', d: 'Mini teste de verdade: responda a toda letra, menos a K. Use o botão ou a barra de espaço.',
          render: function (el) {
            el.innerHTML = '<div class="tour-center"><div class="tour-stim" id="s">?</div>' +
              '<button class="btn" id="b" type="button">RESPONDER (espaço)</button>' +
              '<div class="tour-stats"><div><b id="a">0</b>acertos</div><div><b id="o">0</b>omissão</div><div><b id="c">0</b>ação</div></div></div>';
            var hits = 0, omissions = 0, commissions = 0, letter = '', answered = true, started = false;
            var POOL = 'ABCDEFGMNPRST';
            var stim = $('#s', el);

            function paint() { $('#a', el).textContent = hits; $('#o', el).textContent = omissions; $('#c', el).textContent = commissions; }
            function next() {
              // Fecha o estímulo anterior: sem resposta a "go" = omissão; sem resposta a "K" = acerto.
              if (started && !answered) { if (letter === 'K') hits++; else omissions++; }
              started = true;
              letter = Math.random() < 0.3 ? 'K' : POOL[Math.random() * POOL.length | 0];
              answered = false;
              stim.textContent = letter;
              stim.className = 'tour-stim' + (letter === 'K' ? ' nogo' : '');
              paint();
            }
            function respond() {
              if (answered) return;
              answered = true;
              if (letter === 'K') commissions++; else hits++;
              stim.classList.add('pressed');
              setTimeout(function () { stim.classList.remove('pressed'); }, 90);
              paint();
            }
            $('#b', el).onclick = respond;
            onKey = function (ev) { if (ev.code === 'Space') { ev.preventDefault(); respond(); } };
            next();
            timer = setInterval(next, 1100);
          } },

        { n: 'Resultados', route: 'resultados', d: 'Métricas, linha do tempo e gráfico de tempo de reação. Passe o mouse (ou toque) nas barras.',
          render: function (el) {
            var v = [480, 512, 455, 0, 430, 498, 520, 470, 0, 445, 505, 462, 490, 438, 0, 476, 501, 449, 515, 468];
            var max = Math.max.apply(0, v);
            el.innerHTML = '<h3>Resultados</h3><div class="tour-grid">' +
              '<div class="tour-card static"><span>Tempo médio</span><b>480 ms</b></div>' +
              '<div class="tour-card static"><span>Acertos</span><b style="color:var(--ok)">17</b></div>' +
              '<div class="tour-card static"><span>Omissão</span><b style="color:var(--wa)">3</b></div></div>' +
              '<div class="tour-timeline">' + v.map(function (x) { return '<span style="background:' + (x ? 'var(--ok)' : 'var(--wa)') + '"></span>'; }).join('') + '</div>' +
              '<div class="tour-bars">' + v.map(function (x, i) { return '<i data-i="' + i + '" style="height:' + (x / max * 100) + '%"></i>'; }).join('') + '</div>' +
              '<p class="tour-hint" id="hint">Estímulo — tempo de reação.</p>';
            el.querySelectorAll('.tour-bars i').forEach(function (b) {
              var show = function () {
                var x = v[b.dataset.i];
                $('#hint', el).textContent = 'Estímulo ' + (+b.dataset.i + 1) + ': ' + (x ? x + ' ms' : 'sem resposta (omissão)');
              };
              b.onmouseover = show; b.onclick = show;
            });
          } },

        { n: 'Resumo', route: 'resumo', d: 'Tabela com percentil por tarefa, em faixas de cor. Clique em uma linha.',
          render: function (el) {
            var rows = [['Tarefa 1', '487 ms', 75, '#8fd27c'], ['Tarefa 2', '478 ms', 50, '#8fd27c'], ['Tarefa 3', '454 ms', 92, '#4a6fe0']];
            el.innerHTML = '<h3>Tempo médio de reação</h3><table><thead><tr><th>Tarefa</th><th>Escore</th><th>Percentil</th></tr></thead><tbody>' +
              rows.map(function (x, i) {
                return '<tr class="tour-row" data-i="' + i + '"><td>' + x[0] + '</td><td>' + x[1] + '</td><td><span class="band" style="background:' + x[3] + '">' + x[2] + '</span></td></tr>';
              }).join('') + '</tbody></table><p class="tour-hint" id="hint">Percentil: % dos exames salvos com valor igual ou pior.</p>';
            el.querySelectorAll('.tour-row').forEach(function (r) {
              r.onclick = function () {
                var x = rows[r.dataset.i];
                $('#hint', el).textContent = x[0] + ': melhor que cerca de ' + x[2] + '% dos exames salvos (comparação local, não normativa).';
              };
            });
          } },

        { n: 'Dados', route: 'dados', d: 'Backup JSON, CSV, importação e dados de exemplo — tudo no banco do navegador.',
          render: function (el) {
            var items = [['💾', 'Exportar backup (JSON)', 'Backup exportado.'], ['📄', 'Exportar exames (CSV)', 'CSV gerado para o Excel.'],
                         ['📥', 'Importar backup', 'Backup importado.'], ['✨', 'Dados de exemplo', '4 pacientes fictícios carregados.']];
            el.innerHTML = '<h3>Dados e backup</h3><div class="tour-grid">' + items.map(function (x) {
              return '<button class="tour-card"><b>' + x[0] + '</b><b>' + x[1] + '</b></button>';
            }).join('') + '</div><div class="tour-toast" id="toast-tour"></div>';
            var t = $('#toast-tour', el), hide;
            el.querySelectorAll('.tour-card').forEach(function (b, i) {
              b.onclick = function () {
                t.textContent = items[i][2] + ' (simulação)';
                t.classList.add('on');
                clearTimeout(hide);
                hide = setTimeout(function () { t.classList.remove('on'); }, 2200);
              };
            });
          } }
      ];

      var onKey = null;
      function stop() {
        clearInterval(timer); timer = null;
        if (onKey) { document.removeEventListener('keydown', onKey); onKey = null; }
      }

      function go(i) {
        stop();
        current = i;
        root.querySelectorAll('.tour-tabs button').forEach(function (b, k) { b.classList.toggle('on', k === i); });
        var screen = $('#screen');
        screen.style.animation = 'none'; void screen.offsetHeight; screen.style.animation = '';
        $('#url').textContent = 'psilog/#/' + STEPS[i].route;
        $('#caption').innerHTML = '<b>' + STEPS[i].n + '</b> — ' + STEPS[i].d + ' Rota: <code>#/' + STEPS[i].route + '</code>';
        STEPS[i].render(screen);
        if (onKey) document.addEventListener('keydown', onKey);
      }

      $('#tabs').innerHTML = STEPS.map(function (s) { return '<button type="button"><span>' + s.n + '</span><small>#/' + s.route + '</small></button>'; }).join('');
      root.querySelectorAll('.tour-tabs button').forEach(function (b, i) { b.onclick = function () { go(i); }; });
      go(0);

      return stop;
    }
  };
})(window.Psilog);
