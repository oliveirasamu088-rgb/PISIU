/* Tela: Dados e backup (JSON, CSV, importação, dados de exemplo). */
(function (P) {
  function rand(a, b) { return a + Math.random() * (b - a); }

  async function loadSamples() {
    var today = new Date().toISOString().slice(0, 10);
    for (var name of ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Davi Rocha']) {
      var patient = await P.DB.put('patients', {
        nome: name, dataExame: today, idade: String(rand(8, 60) | 0),
        escolaridade: 'Médio', lateralidade: 'Destro', anosEstudo: 11, obs: 'Exemplo'
      });
      for (var t of P.TASKS) {
        var omissions = rand(0, 4) | 0, commissions = rand(0, 4) | 0, timeline = [];
        for (var i = 0; i < t.n; i++) {
          timeline.push(i < omissions ? 'omissao' : i < omissions + commissions ? 'acao' : 'ok');
        }
        await P.DB.put('exams', {
          patientId: patient.id, patientName: name, taskId: t.id, taskName: t.nome,
          dateISO: new Date().toISOString(), totalTrials: t.n,
          acertos: t.n - omissions - commissions, errosOmissao: omissions, errosAcao: commissions,
          tempoMedioReacaoMs: rand(380, 640), timeline: timeline,
          rts: timeline.map(function (x) { return x === 'ok' ? Math.round(rand(350, 650)) : 0; })
        });
      }
    }
  }

  P.views.dados = {
    title: 'Dados',
    mount: function (root) {
      root.innerHTML =
        '<div class="card"><h2>Dados e backup</h2>' +
          '<p class="note">Tudo fica salvo neste navegador (IndexedDB). Faça backup regularmente — dados de pacientes são sensíveis, guarde os arquivos com cuidado.</p>' +
          '<div class="grid">' +
            '<button class="tile" id="ej" type="button"><div class="ic">💾</div><b>Exportar backup (JSON)</b><span>Pacientes e exames.</span></button>' +
            '<button class="tile" id="ec" type="button"><div class="ic">📄</div><b>Exportar exames (CSV)</b><span>Abre no Excel.</span></button>' +
            '<label class="tile"><div class="ic">📥</div><b>Importar backup</b><span>Arquivo JSON do Psilog.</span><input type="file" id="im" accept=".json" hidden></label>' +
            '<button class="tile" id="dm" type="button"><div class="ic">✨</div><b>Carregar dados de exemplo</b><span>4 pacientes fictícios.</span></button>' +
            '<button class="tile" id="cl" type="button"><div class="ic">🗑️</div><b>Apagar tudo</b><span>Não pode ser desfeito.</span></button>' +
          '</div>' +
        '</div>';

      var $ = function (id) { return root.querySelector('#' + id); };

      $('ej').onclick = async function () {
        P.utils.download('psilog-backup.json', JSON.stringify(await P.DB.dump(), null, 1), 'application/json');
      };

      $('ec').onclick = async function () {
        var exams = await P.DB.all('exams');
        var header = ['paciente', 'tarefa', 'data', 'acertos', 'omissao', 'acao', 'tempo_medio_ms'];
        var rows = exams.map(function (e) {
          return [P.utils.csv(e.patientName), e.taskName, e.dateISO.slice(0, 10), e.acertos, e.errosOmissao, e.errosAcao, Math.round(e.tempoMedioReacaoMs || 0)];
        });
        // BOM (﻿) para o Excel reconhecer UTF-8.
        P.utils.download('psilog-exames.csv', '﻿' + [header].concat(rows).join('\n'), 'text/csv');
      };

      $('im').onchange = async function () {
        try { await P.DB.load(JSON.parse(await this.files[0].text())); P.toast('Backup importado.'); }
        catch (e) { P.toast('Arquivo inválido.'); }
        this.value = '';
      };

      $('dm').onclick = async function () { if (!confirm('Isto cria 4 pacientes FICTÍCIOS com exames inventados. Use só para testar. Continuar?')) return; await loadSamples(); P.toast('Dados de exemplo carregados.'); };

      $('cl').onclick = async function () {
        if (prompt('Isto apaga pacientes, exames e acessos de pacientes. Digite APAGAR para confirmar:') === 'APAGAR') { await P.DB.clear(); P.toast('Dados apagados.'); }
      };
    }
  };
})(window.Psilog);
