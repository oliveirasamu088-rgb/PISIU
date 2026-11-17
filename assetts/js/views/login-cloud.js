/* Tela: entrar / criar conta com e-mail e senha ou Google (Firebase). */
(function (P) {
  var esc = P.utils.esc;

  P.views.loginCloud = function (root) {
    var mode = P.cloud.user && !P.auth.user ? 'perfil' : 'entrar';
    var info = '';

    function google() {
      return '<div class="acts"><button class="btn g" id="google" type="button">Entrar com Google</button></div>';
    }

    function draw() {
      var html = '';
      if (mode === 'entrar') {
        html = '<h2>Entrar no Psilog</h2>' +
          '<label>E-mail<input id="e" type="email" required autocomplete="username"></label>' +
          '<label>Senha<input id="s" type="password" required autocomplete="current-password"></label>' +
          '<p class="note" id="err" role="alert"></p>' +
          '<div class="acts"><button class="btn" type="submit">Entrar</button></div>' + google() +
          '<div class="acts"><button class="btn g" id="criar" type="button">Criar conta</button>' +
          '<button class="btn g" id="esq" type="button">Esqueci a senha</button></div>';
      } else if (mode === 'criar') {
        html = '<h2>Criar conta</h2>' +
          '<label>E-mail<input id="e" type="email" required autocomplete="username"></label>' +
          '<label>Senha (mínimo 6 caracteres)<input id="s" type="password" required minlength="6" autocomplete="new-password"></label>' +
          '<p class="note" id="err" role="alert"></p>' +
          '<div class="acts"><button class="btn" type="submit">Criar conta</button></div>' + google() +
          '<div class="acts"><button class="btn g" id="back" type="button">Voltar</button></div>';
      } else if (mode === 'reset') {
        html = '<h2>Recuperar senha</h2>' +
          '<label>E-mail da conta<input id="e" type="email" required autocomplete="username"></label>' +
          '<p class="note" id="err" role="alert"></p>' +
          '<div class="acts"><button class="btn" type="submit">Enviar link por e-mail</button>' +
          '<button class="btn g" id="back" type="button">Voltar</button></div>';
      } else if (mode === 'perfil') {
        html = '<h2>Como você vai usar o Psilog?</h2>' +
          '<p class="note">Conta: ' + esc(P.cloud.user.email || '') + '</p>' +
          '<button class="btn role" id="pro" type="button">Sou profissional</button>' +
          '<button class="btn role g" id="pac" type="button">Sou paciente</button>' +
          '<div class="acts"><button class="btn g" id="sair" type="button">Sair desta conta</button></div>';
      } else if (mode === 'perfilpro') {
        html = '<h2>Cadastro de profissional</h2>' +
          '<label>Nome completo<input id="n" required autocomplete="name" value="' + esc(P.cloud.user.displayName || '') + '"></label>' +
          '<p class="note" id="err" role="alert"></p>' +
          '<div class="acts"><button class="btn" type="submit">Concluir</button>' +
          '<button class="btn g" id="back" type="button">Voltar</button></div>';
      } else {
        html = '<h2>Cadastro de paciente</h2>' +
          '<label>Nome completo<input id="n" required autocomplete="name" value="' + esc(P.cloud.user.displayName || '') + '"></label>' +
          '<div class="row"><label>Nascimento<input type="date" id="b" required></label>' +
          '<label>Sexo<select id="x"><option>Feminino</option><option>Masculino</option><option>Outro / prefere não informar</option></select></label></div>' +
          '<label class="check"><input type="checkbox" id="cons" required> Concordo em fazer os testes e que meus dados sejam registrados (se menor de idade, com autorização do responsável).</label>' +
          '<p class="note" id="err" role="alert"></p>' +
          '<div class="acts"><button class="btn" type="submit">Concluir</button>' +
          '<button class="btn g" id="back" type="button">Voltar</button></div>';
      }
      root.innerHTML = '<form class="card auth" id="f">' + html + '</form>';

      var $ = function (id) { return root.querySelector('#' + id); };
      var on = function (id, fn) { if ($(id)) $(id).onclick = fn; };
      var say = function (t) { if ($('err')) $('err').textContent = t; };
      var busy = function (b) { var x = root.querySelector('button[type=submit]'); if (x) x.disabled = b; };

      /** Depois de entrar: se já tem perfil, vai ao painel; senão pede o cadastro. */
      async function afterSignIn() {
        await P.auth.syncCloud();
        if (P.auth.user) P.router.go('inicio'); else { mode = 'perfil'; draw(); }
      }

      on('criar', function () { mode = 'criar'; draw(); });
      on('esq', function () { mode = 'reset'; draw(); });
      on('back', function () { mode = (mode === 'perfilpro' || mode === 'perfilpac') ? 'perfil' : 'entrar'; draw(); });
      on('pro', function () { mode = 'perfilpro'; draw(); });
      on('pac', function () { mode = 'perfilpac'; draw(); });
      on('sair', async function () { await P.cloud.signOut(); P.cloud.user = null; mode = 'entrar'; draw(); });
      on('google', async function () {
        try { await P.cloud.google(); await afterSignIn(); } catch (err) { say(err.message); }
      });

      $('f').onsubmit = async function (e) {
        e.preventDefault();
        say(''); busy(true);
        try {
          if (mode === 'entrar') { await P.cloud.signIn($('e').value.trim(), $('s').value); await afterSignIn(); }
          else if (mode === 'criar') { await P.cloud.signUp($('e').value.trim(), $('s').value); await afterSignIn(); }
          else if (mode === 'reset') { await P.cloud.reset($('e').value.trim()); say('Pronto! Enviamos um link para o seu e-mail.'); }
          else if (mode === 'perfilpro') { await P.auth.completeProfile('profissional', { nome: $('n').value }); P.router.go('inicio'); }
          else if (mode === 'perfilpac') {
            await P.auth.completeProfile('paciente', { nome: $('n').value, nascimento: $('b').value, sexo: $('x').value });
            P.router.go('inicio');
          }
        } catch (err) { say(err.message); }
        busy(false);
      };
    }
    draw();
  };
})(window.Psilog);
