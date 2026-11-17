/* Percentil por tarefa, comparando com os exames salvos localmente. */
(function (P) {
  // [percentil máximo da faixa, cor]
  var BANDS = [
    [2, '#c98a3f'], [9, '#e2574a'], [25, '#e8c343'], [75, '#8fd27c'],
    [91, '#49b6c9'], [98, '#4a6fe0'], [100, '#2b3fb0']
  ];

  P.stats = {
    MIN: 30,   // exames por tarefa para mostrar percentil
    /**
     * @param {Array}  exams  todos os exames
     * @param {string} taskId tarefa a comparar
     * @param {string} field  campo numérico do exame
     * @param {number} value  valor do paciente
     */
    percentile: function (exams, taskId, field, value) {
      var pool = exams
        .filter(function (e) { return e.taskId === taskId && e[field] != null; })
        .map(function (e) { return e[field]; });
      var n = pool.length || 1;
      var pct = function (fn) { return pool.filter(fn).length / n * 100; };
      var p = Math.round(pct(function (x) { return x >= value; }));
      var band = BANDS.find(function (b) { return p <= b[0]; }) || BANDS[BANDS.length - 1];
      return {
        p: p,
        n: pool.length,
        more: pct(function (x) { return x > value; }),
        same: pct(function (x) { return x === value; }),
        color: band[1]
      };
    }
  };
})(window.Psilog);
