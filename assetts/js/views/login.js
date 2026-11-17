/* Tela: escolher o perfil (sem senha por enquanto). */
(function (P) {
  var esc = P.utils.esc;

  P.views.login = {
    title: 'Entrar',
    mount: async function (root) {
      if (P.cloud.enabled) return P.views.loginCloud(root);
      var byName = function (a, b) { return a.nome.localeCompare(b.nome); };
      var patients = (await P.DB.all('patients')).sort(byName);
      var pros = (await P.auth.professionals()).sort(byName);
      var mode = 'home';

      function pick(list, title) {
        return '<h2>' + title + '</h2>' +
          (list.length
            ? '<label>Quem é você?<select id="sel">' + list.map(function (p) {
                return '<option value="' + esc(p.id) + '">' + esc(p.nome) + '</option>'; }).join('') + '</select></label>' +
              '<div class="acts"><button class="btn" id="go" type="button">Entrar</button></div>'
            : '<div class="empty">Nenhum cadastro ainda.</div>') +
          '<div class="acts"><button class="btn g" id="new" type="button">Sou novo: cadastrar</button>' +
          '<button class="btn g" id="back" type="button">Voltar</button></div>';
      }

      function draw() {
        var html;
        if (mode === 'home') {
          html = '<h2>Entrar no Psilog</h2>' +
            '<button class="btn role" id="pro" type="button">Profissional</button>' +
            '<button class="btn role g" id="pac" type="button">Paciente</button>';
        } else if (mode === 'pro') html = pick(pros, 'Profissional');
        else if (mode === 'pac') html = pick(patients, 'Paciente');
        else if (mode === 'novopro') {
          html = '<h2>Cadastro de profissional</h2>' +
            '<label>Nome completo<input id="n" required autocomplete="name"></label>' +
            '<p class="note" id="err" role="alert"></p>' +
            '<div class="acts"><button class="btn" type="submit">Cadastrar e entrar</button>' +
            '<button class="btn g" id="back" type="button">Voltar</button></div>';
        } else {
          html = '<h2>Cadastro de paciente</h2>' +
            '<label>Nome completo<input id="n" required autocomplete="name"></label>' +
            '<div class="row"><label>Nascimento<input type="date" id="b" required></label>' +
            '<label>Sexo<select id="x"><option>Feminino</option><option>Masculino</option><option>Outro / prefere não informar</option></select></label></div>' +
            '<label class="check"><input type="checkbox" id="cons" required> Concordo em fazer os testes e que meus dados sejam registrados (se menor de idade, com autorização do responsável).</label>' +
            '<p class="note" id="err" role="alert"></p>' +
            '<div class="acts"><button class="btn" type="submit">Cadastrar e entrar</button>' +
            '<button class="btn g" id="back" type="button">Voltar</button></div>';
        }
        root.innerHTML = '<form class="card auth" id="f">' + html + '</form>';

        var $ = function (id) { return root.querySelector('#' + id); };
        var on = function (id, fn) { if ($(id)) $(id).onclick = fn; };
        on('pro', function () { mode = 'pro'; draw(); });
        on('pac', function () { mode = 'pac'; draw(); });
        on('new', function () { mode = mode === 'pro' ? 'novopro' : 'novo'; draw(); });
        on('back', function () {
          var list = mode === 'novopro' ? pros : mode === 'novo' ? patients : [];
          mode = mode === 'novopro' && list.length ? 'pro' : mode === 'novo' && list.length ? 'pac' : 'home'; draw();
        });
        on('go', async function () {
          if (mode === 'pro') await P.auth.enterPro($('sel').value); else await P.auth.enterPatient($('sel').value);
          P.router.go('inicio');
        });

        $('f').onsubmit = async function (e) {
          e.preventDefault();
          try {
            if (mode === 'novopro') await P.auth.registerPro($('n').value);
            else if (mode === 'novo') {
              var p = await P.DB.put('patients', {
                nome: $('n').value.trim(), dataExame: new Date().toISOString().slice(0, 10), sexo: $('x').value,
                nascimento: $('b').value, idade: P.utils.age($('b').value),
                escolaridade: '—', lateralidade: '—', anosEstudo: 0, obs: '',
                consentimento: true, consentimentoEm: new Date().toISOString()
              });
              await P.auth.enterPatient(p.id);
            } else return;
            P.router.go('inicio');
          } catch (err) { $('err').textContent = err.message; }
        };
      }
      draw();
    }
  };
})(window.Psilog);
