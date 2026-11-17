/* Tela: entrar / criar conta com e-mail e senha ou Google (Firebase). */
(function (P) {
  var esc = P.utils.esc;

  P.views.loginCloud = function (root) {
    var mode = P.cloud.user && !P.auth.user ? 'perfil' : 'entrar';
    var info = '';

    var G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';

    function google(txt) {
      return '<div class="or"><span>ou</span></div>' +
        '<button class="btn g full gbtn" id="google" type="button">' + G + '<span>' + txt + '</span></button>';
    }
    function head(t, sub) { return '<div class="auth-head"><h2>' + t + '</h2><p>' + sub + '</p></div>'; }
    function lnk(id, t) { return '<button class="lnk" id="' + id + '" type="button">' + t + '</button>'; }
    function field(label, inner) { return '<label>' + label + inner + '</label>'; }
    var err = '<p class="note" id="err" role="alert"></p>';

    function draw() {
      var html = '';
      if (mode === 'entrar') {
        html = head('Entrar no Psilog', 'Acesse sua conta para continuar.') +
          field('E-mail', '<input id="e" type="email" required autocomplete="username" placeholder="voce@exemplo.com">') +
          field('Senha', '<input id="s" type="password" required autocomplete="current-password" placeholder="Sua senha">') +
          err +
          '<button class="btn full" type="submit">Entrar</button>' + google('Entrar com Google') +
          '<div class="links">' + lnk('esq', 'Esqueci a senha') + lnk('criar', 'Criar conta') + '</div>';
      } else if (mode === 'criar') {
        html = head('Criar conta', 'Use seu e-mail ou sua conta Google.') +
          field('E-mail', '<input id="e" type="email" required autocomplete="username" placeholder="voce@exemplo.com">') +
          field('Senha', '<input id="s" type="password" required minlength="6" autocomplete="new-password" placeholder="Mínimo de 6 caracteres">') +
          err +
          '<button class="btn full" type="submit">Criar conta</button>' + google('Continuar com Google') +
          '<div class="links">' + lnk('back', '← Voltar para entrar') + '</div>';
      } else if (mode === 'reset') {
        html = head('Recuperar senha', 'Enviaremos um link de redefinição para o seu e-mail.') +
          field('E-mail da conta', '<input id="e" type="email" required autocomplete="username" placeholder="voce@exemplo.com">') +
          err +
          '<button class="btn full" type="submit">Enviar link</button>' +
          '<div class="links">' + lnk('back', '← Voltar para entrar') + '</div>';
      } else if (mode === 'perfil') {
        html = head('Como você vai usar o Psilog?', 'Conta: ' + esc(P.cloud.user.email || '')) +
          '<button class="btn full" id="pro" type="button">Sou profissional</button>' +
          '<button class="btn g full" id="pac" type="button">Sou paciente</button>' +
          '<div class="links">' + lnk('sair', 'Sair desta conta') + '</div>';
      } else if (mode === 'perfilpro') {
        html = head('Cadastro de profissional', 'Só falta o seu nome.') +
          field('Nome completo', '<input id="n" required autocomplete="name" value="' + esc(P.cloud.user.displayName || '') + '">') +
          err +
          '<button class="btn full" type="submit">Concluir</button>' +
          '<div class="links">' + lnk('back', '← Voltar') + '</div>';
      } else {
        html = head('Cadastro de paciente', 'Preencha seus dados para começar.') +
          field('Nome completo', '<input id="n" required autocomplete="name" value="' + esc(P.cloud.user.displayName || '') + '">') +
          '<div class="two">' + field('Nascimento', '<input type="date" id="b" required>') +
          field('Sexo', '<select id="x"><option>Feminino</option><option>Masculino</option><option>Outro / prefere não informar</option></select>') + '</div>' +
          '<label class="check"><input type="checkbox" id="cons" required> <span>Concordo em fazer os testes e que meus dados sejam registrados (se menor de idade, com autorização do responsável).</span></label>' +
          err +
          '<button class="btn full" type="submit">Concluir</button>' +
          '<div class="links">' + lnk('back', '← Voltar') + '</div>';
      }
      root.innerHTML = '<form class="card auth" id="f">' + html + '</form>';

      var $ = function (id) { return root.querySelector('#' + id); };
      if (P.cloud.redirectError && $('err')) { $('err').textContent = P.cloud.redirectError; P.cloud.redirectError = ''; }
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
