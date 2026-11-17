/* Tema: carregado no <head> para aplicar a cor antes da primeira pintura. */
(function () {
  var KEY = 'psilog-tema';
  var THEMES = ['light', 'warm', 'orange', 'dark'];

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function set(theme) {
    if (THEMES.indexOf(theme) === -1) theme = 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch (e) { /* armazenamento indisponível */ }
    window.dispatchEvent(new Event('themechange'));
  }

  var saved = stored();
  var initial = THEMES.indexOf(saved) !== -1 ? saved : 'light';
  document.documentElement.dataset.theme = initial;

  window.PsilogTheme = {
    list: THEMES,
    get: function () { return document.documentElement.dataset.theme; },
    set: set,
    // O botão rápido alterna exclusivamente entre Branco e Noturno.
    toggleMode: function () { set(this.get() === 'dark' ? 'light' : 'dark'); },
    // Mantido como alias para compatibilidade com versões anteriores.
    next: function () { this.toggleMode(); }
  };
})();
