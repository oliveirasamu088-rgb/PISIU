/* Tela: Resultados de um teste (métricas, linha do tempo e gráfico). */
(function (P) {
  var esc = P.utils.esc;
  var COLORS = { ok: 'var(--ok)', acao: 'var(--da)', omissao: 'var(--wa)' };

  function evolution(x, simple) {
    var list = exams.filter(function (e) { return e.patientId === x.patientId && e.taskId === x.taskId; })
      .sort(function (a, b) { return a.dateISO > b.dateISO ? 1 : -1; });
    if (list.length < 2) return '<p class="note">Faça esta atividade mais de uma vez para ver a evolução.</p>';
    function bars(vals, max, unit) {
      return '<div class="bars">' + vals.map(function (v, i) {
        return '<i style="height:' + (max ? v / max * 100 : 0) + '%" title="' + P.utils.date(list[i].dateISO) + ': ' + v + unit + '"></i>';
      }).join('') + '</div>';
    }
    var acc = list.map(function (e) { return Math.round(e.acertos / e.totalTrials * 100); });
    var out = '<h3>Evolução: acertos (%) a cada aplicação</h3>' + bars(acc, 100, '%');
    if (!simple) {
      var trm = list.map(function (e) { return Math.round(e.tempoMedioReacaoMs || 0); });
      out += '<h3>Evolução: tempo médio de reação (ms)</h3>' + bars(trm, Math.max.apply(0, trm), ' ms');
    }
    return out;
  }

  var exams = [];
  P.views.resultados = {
    title: 'Resultados',
    mount: async function (root, params) {
      root.innerHTML =
        '<div class="card"><h2>Resultados dos testes</h2>' +
          '<div class="row"><label>Paciente<select id="sp"></select></label><label>Teste aplicado<select id="se"></select></label></div>' +
          '<div id="body"></div>' +
        '</div>';

      var patients = P.auth.scope(await P.DB.all('patients'));
      exams = await P.DB.all('exams');
      var sp = root.querySelector('#sp'), se = root.querySelector('#se'), body = root.querySelector('#body');

      P.utils.fillPatientSelect(sp, patients, params.get('p'));
      if (P.auth.isPatient()) sp.parentNode.style.display = 'none';

      function listExams() {
        var list = exams
          .filter(function (e) { return e.patientId === sp.value; })
          .sort(function (a, b) { return a.taskId > b.taskId ? 1 : -1; });
        se.innerHTML = list.length
          ? list.map(function (e) { return '<option value="' + esc(e.id) + '">' + esc(e.taskName) + ' · ' + P.utils.date(e.dateISO) + '</option>'; }).join('')
          : '<option value="">— nenhum teste —</option>';
        var wanted = params.get('e');
        if (wanted && list.some(function (e) { return e.id === wanted; })) se.value = wanted;
        draw();
      }

      function draw() {
        var x = exams.find(function (e) { return e.id === se.value; });
        if (!x) { body.innerHTML = '<div class="empty">Selecione um paciente com teste aplicado.</div>'; return; }
        var max = Math.max.apply(0, x.rts || [1]);

        var simple = P.auth.isPatient();
        body.innerHTML =
          (simple
            ? '<div class="grid"><div class="metric ok"><i>Você acertou</i><b>' + x.acertos + ' de ' + x.totalTrials + '</b></div></div>'
            : '<div class="grid">' +
                '<div class="metric"><i>Tempo médio de reação</i><b>' + (x.tempoMedioReacaoMs != null ? Math.round(x.tempoMedioReacaoMs) + ' ms' : '—') + '</b></div>' +
                '<div class="metric ok"><i>Acertos</i><b>' + x.acertos + '</b></div>' +
                '<div class="metric wa"><i>Erros por omissão</i><b>' + x.errosOmissao + '</b></div>' +
                '<div class="metric da"><i>Erros por ação</i><b>' + x.errosAcao + '</b></div>' +
              '</div>') +
          '<p class="legend"><span><b style="background:var(--ok)"></b>acerto</span><span><b style="background:var(--wa)"></b>omissão</span><span><b style="background:var(--da)"></b>ação</span></p>' +
          '<div class="timeline">' + (x.timeline || []).map(function (t) { return '<span style="background:' + COLORS[t] + '"></span>'; }).join('') + '</div>' +
          (simple ? '' : '<h3>Tempo de reação por estímulo</h3>' +
            '<div class="bars">' + (x.rts || []).map(function (r) { return '<i style="height:' + (r / max * 100) + '%" title="' + r + ' ms"></i>'; }).join('') + '</div>' +
            (x.dispositivo ? '<p class="note">Aparelho: ' + esc(x.dispositivo) + '</p>' : '')) +
          evolution(x, simple) +
          '<div class="acts"><button class="btn g" id="print" type="button">Imprimir / salvar PDF</button>' +
          (simple ? '' : '<button class="btn d" id="del" type="button">Excluir teste</button>') + '</div>';

        body.querySelector('#print').onclick = function () { window.print(); };
        if (body.querySelector('#del')) body.querySelector('#del').onclick = async function () {
          if (!confirm('Excluir este teste?')) return;
          await P.DB.del('exams', x.id);
          exams = exams.filter(function (e) { return e.id !== x.id; });
          listExams();
        };
      }

      sp.onchange = listExams;
      se.onchange = draw;
      listExams();
    }
  };
})(window.Psilog);
