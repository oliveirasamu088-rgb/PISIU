/* Funções utilitárias compartilhadas. */
(function (P) {
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  P.utils = {
    /** Escapa texto para uso seguro em innerHTML. */
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
    },

    /** Resumo do aparelho usado (o tempo de reação depende dele). */
    device: function () {
      var u = navigator.userAgent;
      var b = /Edg\//.test(u) ? 'Edge' : /Chrome\//.test(u) ? 'Chrome' : /Firefox\//.test(u) ? 'Firefox' : /Safari\//.test(u) ? 'Safari' : 'Navegador';
      var o = /Android/.test(u) ? 'Android' : /iPhone|iPad/.test(u) ? 'iOS' : /Windows/.test(u) ? 'Windows' : /Mac/.test(u) ? 'macOS' : /Linux/.test(u) ? 'Linux' : 'SO?';
      var s = window.screen || {};
      return b + ' · ' + o + ' · ' + s.width + '×' + s.height + ('ontouchstart' in window ? ' · toque' : '');
    },

    /** Formata uma data ISO como dd/mm/aaaa. */
    date: function (iso) {
      return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';
    },

    /** Idade em anos completos a partir da data de nascimento. */
    age: function (birth) {
      if (!birth) return '';
      var b = new Date(birth), now = new Date();
      var years = now.getFullYear() - b.getFullYear();
      if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) years--;
      return years;
    },

    /** Preenche um <select> com a lista de pacientes. */
    fillPatientSelect: function (select, patients, current) {
      select.innerHTML = patients.length
        ? patients.map(function (p) {
            return '<option value="' + P.utils.esc(p.id) + '">' + P.utils.esc(p.nome) + ' — ' + P.utils.date(p.dataExame) + '</option>';
          }).join('')
        : '<option value="">— nenhum paciente —</option>';
      if (current) select.value = current;
    },

    /** Dispara o download de um arquivo de texto. */
    download: function (name, text, type) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: type }));
      a.download = name;
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },

    /** Escapa uma célula de CSV. */
    csv: function (v) {
      return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    }
  };

  var timer;
  /** Mensagem rápida na parte inferior da tela. */
  P.toast = function (msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function () { el.classList.remove('on'); }, 2600);
  };
})(window.Psilog);
