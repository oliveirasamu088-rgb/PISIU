/* Tela: Seleção de tarefa. */
(function (P) {
  var GLYPHS = { sel: '◎', alt: '⇄', rep: '↻', dir: '↔', custom: '✦' };
  var esc = P.utils.esc;

  P.views.tarefas = {
    title: 'Tarefas',
    mount: async function (root, params) {
      root.innerHTML =
        '<div class="card"><h2>Seleção de tarefa</h2>' +
          '<label>Paciente<select id="sel"></select></label>' +
          '<div class="grid" id="info" style="margin:16px 0"></div>' +
          '<div class="grid" id="tasks"></div>' +
          '<div class="acts"><button class="btn d" id="del" type="button">Excluir paciente</button></div>' +
        '</div>';

      var patients = P.auth.scope(await P.DB.all('patients'));
      var exams = await P.DB.all('exams');
      var sel = root.querySelector('#sel');
      var info = root.querySelector('#info');
      var tasks = root.querySelector('#tasks');

      patients.sort(function (a, b) { return b.createdAt > a.createdAt ? 1 : -1; });
      P.utils.fillPatientSelect(sel, patients, params.get('p'));
      if (P.auth.isPatient()) {
        sel.parentNode.style.display = 'none';
        root.querySelector('#del').style.display = 'none';
      }
      var vis = function (p) { return P.TASKS.filter(function (t) { return P.taskVisible(t, p.id); }); };

      function draw() {
        var p = patients.find(function (x) { return x.id === sel.value; });
        if (!p) {
          info.innerHTML = '<div class="empty">Cadastre um paciente primeiro.</div>';
          tasks.innerHTML = '';
          return;
        }
        var done = exams.filter(function (e) { return e.patientId === p.id; }).map(function (e) { return e.taskId; });
        info.innerHTML = [
          ['Idade', p.idade || '—'],
          ['Escolaridade', p.escolaridade],
          ['Lateralidade', p.lateralidade],
          ['Tarefas aplicadas', new Set(done).size + ' / ' + vis(p).length]
        ].map(function (x) { return '<div class="metric sm"><i>' + x[0] + '</i><b>' + esc(x[1]) + '</b></div>'; }).join('');

        tasks.innerHTML = vis(p).map(function (t) {
          return '<a class="tile" href="' + P.router.href('teste', { p: p.id, t: t.id }) + '">' +
            '<div class="ic">' + (GLYPHS[t.ic] || t.id) + '</div>' +
            '<b>' + t.nome + (t.ativa === false ? ' <small>(inativa)</small>' : '') + (done.includes(t.id) ? ' · refazer' : '') + '</b><span>' + t.desc + '</span></a>';
        }).join('');
      }

      sel.onchange = draw;
      draw();

      root.querySelector('#del').onclick = async function () {
        var id = sel.value;
        if (!id || !confirm('Excluir este paciente e seus exames?')) return;
        for (var e of exams) if (e.patientId === id) await P.DB.del('exams', e.id);
        for (var u of await P.DB.all('users')) if (u.patientId === id) await P.DB.del('users', u.id);
        await P.DB.del('patients', id);
        P.router.go('tarefas');
      };
    }
  };
})(window.Psilog);
