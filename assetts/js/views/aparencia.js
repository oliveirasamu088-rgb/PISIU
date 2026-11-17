/* Tela: Aparência. Branco/Noturno ficam separados dos temas de design. */
(function (P) {
  var MODES = [
    { id: 'light', n: 'Branco', d: 'Tema claro padrão, com fundo suave.', bg: '#f3f4f1', s: '#fbfbf9', a: '#0d8077', t: '#2b3438' },
    { id: 'dark', n: 'Noturno', d: 'Tema escuro para ambientes com pouca luz.', bg: '#0a0e10', s: '#162024', a: '#2dd4bf', t: '#e7f1ee' }
  ];
  var DESIGNS = [
    { id: 'warm', n: 'Amarelo', d: 'Tom de papel, confortável para leituras longas.', bg: '#f4ead0', s: '#faf3e0', a: '#dc8a38', t: '#3b3426' },
    { id: 'orange', n: 'Laranja', d: 'Visual quente e acolhedor.', bg: '#fbe7d4', s: '#fff3e6', a: '#e0622b', t: '#3d2a1c' }
  ];
  var ALL = MODES.concat(DESIGNS);

  P.views.aparencia = {
    title: 'Aparência',
    mount: function (root) {
      root.innerHTML =
        '<div class="card appearance-card">' +
          '<h2>Modo de exibição</h2>' +
          '<p class="note">Alterne entre o modo Branco e o modo Noturno. O botão no cabeçalho também faz somente essa alternância.</p>' +
          '<div class="grid" id="modes"></div>' +
        '</div>' +
        '<div class="card appearance-card" style="margin-top:18px">' +
          '<h2>Design do aplicativo</h2>' +
          '<p class="note">Escolha uma paleta visual alternativa. Esses designs ficam disponíveis aqui, separados dos modos Branco e Noturno.</p>' +
          '<div class="grid" id="designs"></div>' +
          '<div class="acts"><a class="btn g" href="' + P.router.href('inicio') + '">Voltar ao início</a></div>' +
        '</div>';

      function card(x, current) {
        return '<button type="button" class="opt' + (x.id === current ? ' on' : '') + '" data-id="' + x.id + '" aria-pressed="' + (x.id === current) + '">' +
          '<div class="pv" style="background:' + x.bg + '"><i class="h" style="background:' + x.a + '"></i>' +
          '<div class="r"><i style="background:' + x.s + '"></i><i style="background:' + x.s + '"></i></div>' +
          '<i style="background:' + x.t + ';opacity:.25;width:70%"></i><i style="background:' + x.t + ';opacity:.15;width:45%"></i></div>' +
          '<b>' + x.n + (x.id === current ? ' ✓' : '') + '</b><span>' + x.d + '</span></button>';
      }
      function draw() {
        var current = PsilogTheme.get();
        root.querySelector('#modes').innerHTML = MODES.map(function (x) { return card(x, current); }).join('');
        root.querySelector('#designs').innerHTML = DESIGNS.map(function (x) { return card(x, current); }).join('');
      }
      function handleClick(e) {
        var btn = e.target.closest('.opt');
        if (!btn) return;
        var selected = ALL.find(function (x) { return x.id === btn.dataset.id; });
        if (!selected) return;
        PsilogTheme.set(selected.id);
        P.toast('Tema ' + selected.n.toLowerCase() + ' aplicado.');
      }
      root.addEventListener('click', handleClick);
      window.addEventListener('themechange', draw);
      draw();
      return function () {
        window.removeEventListener('themechange', draw);
        root.removeEventListener('click', handleClick);
      };
    }
  };
})(window.Psilog);
