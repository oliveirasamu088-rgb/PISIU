/* Definição das tarefas. Sem "tipo" = go/no-go clássico (letra K).
   Tipos: sel (seletiva), alt (alternada), rep (sustentada), dir (direção). */
window.Psilog.TASKS = [
  { id: '1', grupo: 'Go/no-go (letras)', nome: 'Tarefa 1', desc: 'Ritmo lento · 20 estímulos · 950 ms',  n: 20, isi: 950, nogo: 0.25 },
  { id: '2', grupo: 'Go/no-go (letras)', nome: 'Tarefa 2', desc: 'Ritmo médio · 26 estímulos · 720 ms',  n: 26, isi: 720, nogo: 0.30 },
  { id: '3', grupo: 'Go/no-go (letras)', nome: 'Tarefa 3', desc: 'Ritmo rápido · 32 estímulos · 560 ms', n: 32, isi: 560, nogo: 0.35 },

  // 4. Atenção seletiva: responder só ao alvo (▲ verde) entre distratores.
  { id: 'sel-f', grupo: 'Atenção seletiva · Caça ao alvo', ic: '🎯', nivel: 'Fácil',   tipo: 'sel', n: 20, isi: 1100, alvo: 0.30, dist: 0,
    nome: 'Seletiva · Fácil',   desc: 'Distratores bem diferentes · 1100 ms',
    regra: 'Aperte <b>ESPAÇO</b> só quando aparecer o <b style="color:#38b8ac">▲ verde</b>. Ignore o resto.' },
  { id: 'sel-m', grupo: 'Atenção seletiva · Caça ao alvo', ic: '🎯', nivel: 'Médio',   tipo: 'sel', n: 28, isi: 850, alvo: 0.30, dist: 1,
    nome: 'Seletiva · Médio',   desc: 'Distratores parecidos · 850 ms',
    regra: 'Aperte <b>ESPAÇO</b> só quando aparecer o <b style="color:#38b8ac">▲ verde</b>. Cuidado: há ▲ de outras cores e formas verdes.' },
  { id: 'sel-d', grupo: 'Atenção seletiva · Caça ao alvo', ic: '🎯', nivel: 'Difícil', tipo: 'sel', n: 36, isi: 650, alvo: 0.28, dist: 2,
    nome: 'Seletiva · Difícil', desc: 'Quase só distratores parecidos · 650 ms',
    regra: 'Aperte <b>ESPAÇO</b> só quando aparecer o <b style="color:#38b8ac">▲ verde</b>. A maioria dos distratores é muito parecida.' },

  // 5. Atenção alternada: a regra (alvo) troca durante a tarefa.
  { id: 'alt-f', grupo: 'Atenção alternada · Troca de regra', ic: '🔀', nivel: 'Fácil',   tipo: 'alt', n: 24, isi: 1100, troca: 8, alvo: 0.5,
    nome: 'Alternada · Fácil',   desc: 'Troca a cada 8 · 1100 ms',
    regra: 'A regra aparece no topo e <b>muda</b>. Aperte <b>ESPAÇO</b> só para a forma indicada (▲ ou ●).' },
  { id: 'alt-m', grupo: 'Atenção alternada · Troca de regra', ic: '🔀', nivel: 'Médio',   tipo: 'alt', n: 30, isi: 900, troca: 5, alvo: 0.5,
    nome: 'Alternada · Médio',   desc: 'Troca a cada 5 · 900 ms',
    regra: 'A regra aparece no topo e <b>muda</b>. Aperte <b>ESPAÇO</b> só para a forma indicada (▲ ou ●).' },
  { id: 'alt-d', grupo: 'Atenção alternada · Troca de regra', ic: '🔀', nivel: 'Difícil', tipo: 'alt', n: 36, isi: 720, troca: 3, alvo: 0.5,
    nome: 'Alternada · Difícil', desc: 'Troca a cada 3 · 720 ms',
    regra: 'A regra aparece no topo e <b>muda</b> com frequência. Aperte <b>ESPAÇO</b> só para a forma indicada (▲ ou ●).' },

  // 6. Atenção sustentada: detectar repetição de número (memória curta).
  { id: 'rep-f', grupo: 'Atenção sustentada · Repetição', ic: '🔁', nivel: 'Fácil',   tipo: 'rep', n: 24, isi: 1100, volta: 1, alvo: 0.25,
    nome: 'Repetição · Fácil',   desc: 'Igual ao anterior · 1100 ms',
    regra: 'Aperte <b>ESPAÇO</b> quando o número for <b>igual ao anterior</b>.' },
  { id: 'rep-m', grupo: 'Atenção sustentada · Repetição', ic: '🔁', nivel: 'Médio',   tipo: 'rep', n: 30, isi: 850, volta: 1, alvo: 0.25,
    nome: 'Repetição · Médio',   desc: 'Igual ao anterior · 850 ms',
    regra: 'Aperte <b>ESPAÇO</b> quando o número for <b>igual ao anterior</b>. Ritmo mais rápido.' },
  { id: 'rep-d', grupo: 'Atenção sustentada · Repetição', ic: '🔁', nivel: 'Difícil', tipo: 'rep', n: 36, isi: 850, volta: 2, alvo: 0.25,
    nome: 'Repetição · Difícil', desc: 'Igual ao de 2 atrás · 850 ms',
    regra: 'Aperte <b>ESPAÇO</b> quando o número for <b>igual ao de duas posições atrás</b>.' },

  // 7. Direção: escolha esquerda/direita (←/→ no teclado ou botões).
  { id: 'dir-f', grupo: 'Direção · Esquerda ou direita', ic: '↔️', nivel: 'Fácil',   tipo: 'dir', n: 20, isi: 1400, inv: 0,
    nome: 'Direção · Fácil',   desc: 'Mesma direção da seta · 1400 ms',
    regra: 'Aperte para o <b>mesmo lado</b> que a seta aponta (← ou →).' },
  { id: 'dir-m', grupo: 'Direção · Esquerda ou direita', ic: '↔️', nivel: 'Médio',   tipo: 'dir', n: 26, isi: 1100, inv: 0.3,
    nome: 'Direção · Médio',   desc: 'Seta <span style="color:#ec8279">vermelha</span> inverte · 1100 ms',
    regra: 'Seta <b style="color:#38b8ac">verde</b>: mesmo lado. Seta <b style="color:#ec8279">vermelha</b>: <b>lado oposto</b>.' },
  { id: 'dir-d', grupo: 'Direção · Esquerda ou direita', ic: '↔️', nivel: 'Difícil', tipo: 'dir', n: 32, isi: 900, inv: 0.5,
    nome: 'Direção · Difícil', desc: 'Metade inverte · 900 ms',
    regra: 'Seta <b style="color:#38b8ac">verde</b>: mesmo lado. Seta <b style="color:#ec8279">vermelha</b>: <b>lado oposto</b>. Rápido!' }
];

/* Gera a sequência de estímulos de uma tarefa.
   Cada item: { txt, color, nogo (não responder), ans ('E'|'D'), cue (texto do topo) } */
window.Psilog.gen = function (t) {
  var P = window.Psilog, seq = [], k, r = Math.random;
  var pick = function (a) { return a[r() * a.length | 0]; };

  if (!t.tipo) {                                   // go/no-go clássico
    var L = 'ABCDEFGHJLMNPRSTUVZ'.split('');
    for (k = 0; k < t.n; k++) {
      var l = k && r() < t.nogo ? 'K' : pick(L);
      seq.push({ txt: l, nogo: l === 'K' });
    }
    return seq;
  }

  if (t.tipo === 'sel') {
    var G = '#38b8ac', COL = ['#ec8279', '#e8c343', '#6f8ff0', '#c98ae0'], SH = ['●', '■', '◆', '★'];
    for (k = 0; k < t.n; k++) {
      if (r() < t.alvo) { seq.push({ txt: '▲', color: G, nogo: false }); continue; }
      var s, c;
      if (t.dist === 0) { s = pick(SH); c = pick(COL); }                       // nada em comum com o alvo
      else if (t.dist === 1) {                                                  // divide uma característica
        if (r() < .5) { s = '▲'; c = pick(COL); } else { s = pick(SH); c = G; }
      } else {                                                                  // quase sempre divide uma característica
        if (r() < .5) { s = '▲'; c = pick(['#4fcf95', '#2aa88f', '#8fd27c', '#e8c343']); }
        else { s = pick(SH); c = G; }
      }
      seq.push({ txt: s, color: c, nogo: true });
    }
    return seq;
  }

  if (t.tipo === 'alt') {
    var rule = r() < .5 ? '▲' : '●';
    for (k = 0; k < t.n; k++) {
      if (k && k % t.troca === 0) rule = rule === '▲' ? '●' : '▲';
      var shape = r() < t.alvo ? rule : (rule === '▲' ? '●' : '▲');
      seq.push({ txt: shape, color: shape === '▲' ? '#38b8ac' : '#e8a24a', nogo: shape !== rule,
                 cue: 'Regra: ' + rule + (k % t.troca === 0 && k ? '  ↻ TROCOU' : '') });
    }
    return seq;
  }

  if (t.tipo === 'rep') {
    for (k = 0; k < t.n; k++) {
      var back = k >= t.volta ? seq[k - t.volta].txt : null, d;
      if (back && r() < t.alvo) d = back;
      else do { d = String(1 + (r() * 9 | 0)); } while (d === back);
      seq.push({ txt: d, nogo: d !== back });
    }
    return seq;
  }

  if (t.tipo === 'dir') {
    for (k = 0; k < t.n; k++) {
      var left = r() < .5, inv = r() < t.inv;
      seq.push({ txt: left ? '◀' : '▶', color: inv ? '#ec8279' : '#38b8ac', nogo: false,
                 ans: (left !== inv) ? 'E' : 'D' });
    }
    return seq;
  }
  return seq;
};

/* Nível (Fácil/Médio/Difícil), título curto e chave do ícone de cada tarefa. */
(function (P) {
  var TIT = { sel: 'Seletiva', alt: 'Alternada', rep: 'Repetição', dir: 'Direção' };
  var LV = { '1': 'Fácil', '2': 'Médio', '3': 'Difícil' };
  P.TASKS.forEach(function (t) {
    t.ic = t.tipo || 'gng';
    t.titulo = t.tipo ? TIT[t.tipo] : 'Go/no-go';
    t.nivel = t.nivel || LV[t.id];
  });
})(window.Psilog);

/* Atividades criadas pelo profissional (banco) somam-se às acima. */
window.Psilog.BASE_COUNT = window.Psilog.TASKS.length;
window.Psilog.refreshTasks = async function () {
  var P = window.Psilog, esc = P.utils.esc;
  P.TASKS.length = P.BASE_COUNT;
  var list = await P.DB.all('customTasks');
  list.sort(function (a, b) { return a.createdAt > b.createdAt ? 1 : -1; });
  list.forEach(function (c) {
    var base = P.TASKS.slice(0, P.BASE_COUNT).find(function (t) { return t.tipo === c.tipo || (!t.tipo && !c.tipo); });
    var t = Object.assign({}, c, {
      custom: true, ic: 'custom', titulo: esc(c.nome), nivel: c.nivel || 'Médio',
      nome: esc(c.nome), desc: esc(c.desc),
      regra: c.regra ? esc(c.regra) : (base && base.regra)
    });
    P.TASKS.push(t);
  });
};
/** Paciente só vê atividades ativas e liberadas para ele. */
window.Psilog.taskVisible = function (t, patientId) {
  var P = window.Psilog;
  if (P.auth.isPro() || !t.custom) return true;
  return t.ativa !== false && (!t.pacientes || !t.pacientes.length || t.pacientes.indexOf(patientId) >= 0);
};
