/* Tela: Aplicação do teste go/no-go (letras; não responder à letra K). */
(function (P) {
  P.views.teste = {
    title: 'Teste',
    mount: async function (root, params) {
      var pid = P.auth.isPatient() ? P.auth.user.patientId : params.get('p');
      var patient = await P.DB.get('patients', pid || '');
      var task = P.TASKS.find(function (t) { return t.id === params.get('t'); });
      if (!patient || !task || !P.taskVisible(task, patient.id)) { P.router.go('tarefas'); return; }

      var back = P.router.href('tarefas', { p: patient.id });
      root.innerHTML =
        '<div class="card" id="intro">' +
          '<h2>' + task.nome + ' — ' + P.utils.esc(patient.nome) + '</h2>' +
          '<p>' + (task.regra || 'Aperte <b>ESPAÇO</b> (ou o botão) para toda letra, <b>exceto a letra K</b>.') + ' Seja rápido e preciso.</p>' +
          '<div class="acts"><button class="btn g" id="tr" type="button">Treinar (não conta)</button><button class="btn" id="go" type="button">Começar</button><a class="btn g" href="' + back + '">Voltar</a></div>' +
        '</div>' +
        '<div class="test-stage" id="stage">' +
          '<div class="test-top"><span id="label"></span><span id="progress"></span><a href="' + back + '">Esc</a></div>' +
          '<div class="stimulus" id="stim"></div>' +
          (task.tipo === 'dir'
            ? '<div class="acts"><button class="btn" id="bl" type="button">← Esquerda</button><button class="btn" id="br" type="button">Direita →</button></div>'
            : '<button class="btn" id="resp" type="button">RESPONDER</button>') +
        '</div>';

      var $ = function (id) { return root.querySelector('#' + id); };
      var stim = $('stim');

      var cur = task, practice = false, seq = [];

      var idx = -1, results = [], t0 = 0, answered = false, live = false, dead = false;
      var trialTimer, countdown, pressTimer;

      function respond(side) {
        if (!live || answered || idx < 0) return;
        answered = true;
        var it = seq[idx];
        results.push({ l: it.txt, nogo: it.nogo, r: 1, rt: performance.now() - t0, wrong: !!it.ans && side !== it.ans });
        stim.classList.add('pressed');
        clearTimeout(trialTimer);
        pressTimer = setTimeout(function () { stim.classList.remove('pressed'); next(); }, 90);
      }

      function next() {
        if (dead) return;
        idx++;
        if (idx >= seq.length) return finish();
        answered = false;
        var it = seq[idx], letter = it.txt;
        $('progress').textContent = (idx + 1) + ' / ' + cur.n;
        if (it.cue) $('label').textContent = it.cue;
        stim.className = 'stimulus ' + (it.color ? 'tint' : it.nogo ? 'nogo' : 'go');
        stim.style.color = stim.style.borderColor = it.color || '';
        stim.textContent = letter;
        t0 = performance.now();
        trialTimer = setTimeout(function () {
          if (!answered) results.push({ l: letter, nogo: it.nogo, r: 0, wrong: false });
          next();
        }, cur.isi);
      }

      async function finish() {
        live = false;
        if (practice) {
          practice = false; results = [];
          $('stage').classList.remove('on');
          P.toast('Treino concluído. Quando estiver pronto, clique em Começar.');
          return;
        }
        var hits = 0, omissions = 0, commissions = 0, sum = 0, n = 0, timeline = [], rts = [];
        results.forEach(function (x) {
          if (x.wrong) { rts.push(0); commissions++; timeline.push('acao'); }   // lado errado
          else if (!x.nogo && x.r) {                  // acertou o "go"
            hits++; sum += x.rt; n++; timeline.push('ok'); rts.push(Math.round(x.rt));
          } else {
            rts.push(0);
            if (!x.nogo) { omissions++; timeline.push('omissao'); }          // não respondeu ao "go"
            else if (x.r) { commissions++; timeline.push('acao'); }          // respondeu ao "no-go"
            else { hits++; timeline.push('ok'); }                            // segurou no "no-go"
          }
        });
        var exam = await P.DB.put('exams', {
          patientId: patient.id, patientName: patient.nome,
          taskId: task.id, taskName: task.nome,
          dateISO: new Date().toISOString(),
          totalTrials: results.length,
          acertos: hits, errosOmissao: omissions, errosAcao: commissions,
          tempoMedioReacaoMs: n ? sum / n : null,
          timeline: timeline, rts: rts, dispositivo: P.utils.device()
        });
        if (!dead) P.router.go('resultados', { p: patient.id, e: exam.id });
      }

      function start(isPractice) {
        practice = isPractice;
        cur = isPractice ? Object.assign({}, task, { n: 6, isi: Math.round(task.isi * 1.5) }) : task;
        seq = P.gen(cur); idx = -1; results = []; answered = false;
        $('stage').classList.add('on');
        $('label').textContent = isPractice ? 'Treino (não conta)' : task.nome;
        stim.className = 'stimulus'; stim.style.color = stim.style.borderColor = '';
        var n = 3;
        stim.textContent = n;
        countdown = setInterval(function () {
          n--;
          if (n <= 0) { clearInterval(countdown); live = true; next(); }
          else stim.textContent = n;
        }, 700);
      }
      $('go').onclick = function () { start(false); };
      $('tr').onclick = function () { start(true); };
      if (task.tipo === 'dir') {
        $('bl').onclick = function () { respond('E'); };
        $('br').onclick = function () { respond('D'); };
      } else $('resp').onclick = function () { respond(); };

      function onKey(e) {
        if (task.tipo === 'dir') {
          if (e.code === 'ArrowLeft') { e.preventDefault(); respond('E'); }
          if (e.code === 'ArrowRight') { e.preventDefault(); respond('D'); }
        } else if (e.code === 'Space') { e.preventDefault(); respond(); }
        if (e.code === 'Escape') P.router.go('tarefas', { p: patient.id });
      }
      document.addEventListener('keydown', onKey);

      // Limpeza ao sair da tela (evita timers e atalhos "vazando").
      return function () {
        dead = true;
        clearTimeout(trialTimer); clearTimeout(pressTimer); clearInterval(countdown);
        document.removeEventListener('keydown', onKey);
      };
    }
  };
})(window.Psilog);
