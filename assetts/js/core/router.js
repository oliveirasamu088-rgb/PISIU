/* Roteador por hash (#/rota?chave=valor). Funciona abrindo o index.html direto. */
(function (P) {
  var DEFAULT = 'inicio';
  var cleanup = null;
  var token = 0;

  function parse() {
    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('?');
    return { name: parts[0] || DEFAULT, params: new URLSearchParams(parts[1] || '') };
  }

  function build(name, params) {
    var qs = new URLSearchParams(params || {}).toString();
    return '#/' + name + (qs ? '?' + qs : '');
  }

  async function render() {
    var route = parse();
    var view = P.views[route.name];
    if (!view) { location.replace(build(DEFAULT)); return; }
    var allowed = P.auth ? P.auth.guard(route.name) : route.name;
    if (allowed !== route.name) { location.replace(build(allowed)); return; }

    var mine = ++token;
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }

    var app = document.getElementById('app');
    app.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'view view-' + route.name;
    app.appendChild(root);

    document.title = view.title + ' · Psilog';
    document.querySelectorAll('a[data-route]').forEach(function (a) {
      if (a.dataset.route === route.name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    var result = await view.mount(root, route.params);
    // Se o usuário navegou enquanto a tela carregava, descarta o resultado.
    if (mine !== token) { if (typeof result === 'function') result(); return; }
    cleanup = typeof result === 'function' ? result : null;
    window.scrollTo(0, 0);
  }

  P.router = {
    start: function () { window.addEventListener('hashchange', render); render(); },
    /** Navega para uma rota; se já estiver nela, apenas redesenha. */
    go: function (name, params) {
      var target = build(name, params);
      if (location.hash === target) render(); else location.hash = target;
    },
    href: build
  };
})(window.Psilog);
