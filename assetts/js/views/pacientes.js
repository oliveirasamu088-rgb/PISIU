/* Tela (profissional): lista e busca de pacientes. */
(function (P) {
  var esc = P.utils.esc;

  P.views.pacientes = {
    title: 'Pacientes',
    mount: async function (root) {
      var patients = (await P.DB.all('patients')).sort(function (a, b) { return a.nome.localeCompare(b.nome); });
      var exams = await P.DB.all('exams');
      root.innerHTML =
        '<div class="card"><h2>Pacientes</h2>' +
          '<div class="row"><label>Buscar por nome<input id="q" type="search" placeholder="Digite parte do nome" autocomplete="off"></label></div>' +
          '<div id="list"></div>' +
          '<div class="acts"><a class="btn" href="' + P.router.href('cadastro') + '">Novo paciente</a></div>' +
        '</div>';
      var list = root.querySelector('#list');

      function draw() {
        var q = root.querySelector('#q').value.trim().toLowerCase();
        var rows = patients.filter(function (p) { return p.nome.toLowerCase().indexOf(q) >= 0; });
        if (!rows.length) { list.innerHTML = '<div class="empty">Nenhum paciente encontrado.</div>'; return; }
        list.innerHTML = '<table><thead><tr><th>Nome</th><th>Idade</th><th>Testes</th><th>Último</th><th></th></tr></thead><tbody>' +
          rows.map(function (p) {
            var mine = exams.filter(function (e) { return e.patientId === p.id; });
            var last = mine.map(function (e) { return e.dateISO; }).sort().pop();
            return '<tr><td>' + esc(p.nome) + '</td><td>' + esc(p.idade || '—') + '</td><td>' + mine.length + '</td><td>' + P.utils.date(last) + '</td>' +
              '<td class="acts" style="margin:0">' +
                '<a class="btn g" href="' + P.router.href('cadastro', { id: p.id }) + '">Editar</a>' +
                '<a class="btn g" href="' + P.router.href('tarefas', { p: p.id }) + '">Tarefas</a>' +
                '<a class="btn g" href="' + P.router.href('resultados', { p: p.id }) + '">Resultados</a></td></tr>';
          }).join('') + '</tbody></table>';
      }
      root.querySelector('#q').oninput = draw;
      draw();
    }
  };
})(window.Psilog);
