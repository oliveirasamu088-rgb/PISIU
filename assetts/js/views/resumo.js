/* Tela: Resumo com percentil por tarefa. */
(function (P) {
  var FIELDS = [
    ['Tempo médio de reação', 'tempoMedioReacaoMs'],
    ['Erros por omissão', 'errosOmissao'],
    ['Erros por ação', 'errosAcao']
  ];

  P.views.resumo = {
    title: 'Resumo',
    mount: async function (root) {
      root.innerHTML =
        '<div class="card"><h2>Resumo dos testes</h2>' +
          '<label>Paciente<select id="sp"></select></label>' +
          '<div id="body"></div>' +
          '<p class="note">Comparação interna com os exames salvos neste navegador, por tarefa; só aparece com 30 ou mais exames da mesma tarefa. Não é tabela normativa e não substitui avaliação profissional.</p>' +
          '<div class="acts"><button class="btn g" id="print" type="button">Imprimir</button></div>' +
        '</div>';

      var patients = P.auth.scope(await P.DB.all('patients'));
      var all = await P.DB.all('exams');
      var sp = root.querySelector('#sp'), body = root.querySelector('#body');
      P.utils.fillPatientSelect(sp, patients);
      if (P.auth.isPatient()) sp.parentNode.style.display = 'none';

      function draw() {
        var mine = all.filter(function (e) { return e.patientId === sp.value; });
        if (!mine.length) { body.innerHTML = '<div class="empty">Nenhuma tarefa aplicada a este paciente.</div>'; return; }

        body.innerHTML = FIELDS.map(function (f) {
          var field = f[1];
          var rows = P.TASKS.filter(function (t) { return mine.some(function (x) { return x.taskId === t.id; }); }).map(function (t) {
            var e = mine.find(function (x) { return x.taskId === t.id; });
            if (!e || e[field] == null) return '<tr><td>' + t.nome + '</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>';
            var s = P.stats.percentile(all, t.id, field, e[field]);
            var score = field === 'tempoMedioReacaoMs' ? Math.round(e[field]) + ' ms' : e[field];
            if (s.n < P.stats.MIN) return '<tr><td>' + t.nome + '</td><td>' + score + '</td><td colspan="3" class="note">Comparação disponível com ' + P.stats.MIN + '+ exames desta tarefa (há ' + s.n + ').</td></tr>';
            return '<tr><td>' + t.nome + '</td><td>' + score + '</td>' +
              '<td><span class="band" style="background:' + s.color + '">' + s.p + '</span></td>' +
              '<td>' + Math.round(s.more) + '%</td><td>' + Math.round(s.same) + '%</td></tr>';
          }).join('');
          return '<h3>' + f[0] + '</h3><table><thead><tr><th>Tarefa</th><th>Escore</th><th>Percentil</th><th>% com valor maior</th><th>% igual</th></tr></thead><tbody>' + rows + '</tbody></table>';
        }).join('');
      }

      sp.onchange = draw;
      root.querySelector('#print').onclick = function () { window.print(); };
      draw();
    }
  };
})(window.Psilog);
