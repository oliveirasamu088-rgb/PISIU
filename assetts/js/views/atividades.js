/* Tela (profissional): criar e administrar atividades. */
(function (P) {
  var esc = P.utils.esc;
  var TIPOS = [
    ['', 'Go/no-go (letras, não responder ao K)'], ['sel', 'Seletiva (alvo ▲ verde)'], ['alt', 'Alternada (troca de regra)'],
    ['rep', 'Repetição (igual ao anterior)'], ['dir', 'Direção (esquerda/direita)']
  ];
  // [rótulo, mínimo, máximo, padrão]
  var PARAM = {
    '':  ['% de letras K (no-go)', 5, 60, 30], sel: ['Distração (0 fácil, 1 médio, 2 difícil)', 0, 2, 1],
    alt: ['Trocar a regra a cada (estímulos)', 2, 12, 5], rep: ['Comparar com quantas posições atrás (1 ou 2)', 1, 2, 1],
    dir: ['% de setas vermelhas (invertem)', 0, 100, 30]
  };

  P.views.atividades = {
    title: 'Atividades',
    mount: async function (root) {
      var editing = null;
      async function load() {
        var list = (await P.DB.all('customTasks')).sort(function (a, b) { return a.createdAt > b.createdAt ? 1 : -1; });
        var patients = await P.DB.all('patients');

        root.innerHTML =
          '<div class="card"><h2>Atividades criadas por você</h2>' +
            (list.length ? '<table><thead><tr><th>Nome</th><th>Detalhes</th><th>Para</th><th></th></tr></thead><tbody>' +
              list.map(function (t) {
                var who = t.pacientes && t.pacientes.length ? t.pacientes.length + ' paciente(s)' : 'Todos';
                return '<tr><td>' + esc(t.nome) + ' <i>(' + esc(t.nivel || 'Médio') + ')</i>' + (t.ativa === false ? ' <i>(inativa)</i>' : '') + '</td><td>' + esc(t.desc) + '</td><td>' + who + '</td>' +
                  '<td class="acts" style="margin:0"><button class="btn g" data-ed="' + t.id + '" type="button">Editar</button><button class="btn g" data-tg="' + t.id + '" type="button">' + (t.ativa === false ? 'Ativar' : 'Desativar') + '</button>' +
                  '<button class="btn d" data-del="' + t.id + '" type="button">Excluir</button></td></tr>';
              }).join('') + '</tbody></table>' : '<div class="empty">Nenhuma atividade ainda. Crie a primeira abaixo.</div>') +
          '</div>' +

          '<form class="card" id="f"><h2>' + (editing ? 'Editar atividade' : 'Nova atividade') + '</h2>' +
            '<div class="row"><label>Nome<input id="nm" required maxlength="50"></label>' +
            '<label>Nível<select id="nv"><option>Fácil</option><option selected>Médio</option><option>Difícil</option></select></label>' +
            '<label>Tipo<select id="tp">' + TIPOS.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select></label></div>' +
            '<div class="row"><label>Nº de estímulos<input id="n" type="number" min="6" max="80" value="24"></label>' +
            '<label>Tempo por estímulo (ms)<input id="isi" type="number" min="300" max="3000" step="50" value="900"></label>' +
            '<label><span id="pl"></span><input id="pv" type="number"></label></div>' +
            '<label>Instrução para o paciente (opcional)<textarea id="rg" rows="2" maxlength="200"></textarea></label>' +
            '<label>Liberar para (nenhum marcado = todos)<select id="pc" multiple size="4">' +
              patients.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nome) + '</option>'; }).join('') + '</select></label>' +
            '<div class="acts"><button class="btn" type="submit">' + (editing ? 'Salvar alterações' : 'Criar atividade') + '</button>' +
              (editing ? '<button class="btn g" id="cx" type="button">Cancelar</button>' : '') + '</div></form>';

        var $ = function (id) { return root.querySelector('#' + id); };
        function setParam() {
          var d = PARAM[$('tp').value];
          $('pl').textContent = d[0]; $('pv').min = d[1]; $('pv').max = d[2]; $('pv').value = d[3];
        }
        $('tp').onchange = setParam; setParam();
        if (editing) {
          var ed = editing, tp = ed.tipo || '';
          $('nm').value = ed.nome; $('nv').value = ed.nivel || 'Médio'; $('tp').value = tp; setParam();
          $('n').value = ed.n; $('isi').value = ed.isi; $('rg').value = ed.regra || '';
          $('pv').value = tp === '' ? Math.round(ed.nogo * 100) : tp === 'sel' ? ed.dist : tp === 'alt' ? ed.troca : tp === 'rep' ? ed.volta : Math.round(ed.inv * 100);
          Array.prototype.forEach.call($('pc').options, function (o) { o.selected = (ed.pacientes || []).indexOf(o.value) >= 0; });
          $('cx').onclick = function () { editing = null; load(); };
        }
        root.querySelectorAll('[data-ed]').forEach(function (b) {
          b.onclick = function () { editing = list.find(function (x) { return x.id === b.dataset.ed; }); load(); window.scrollTo(0, document.body.scrollHeight); };
        });

        root.querySelectorAll('[data-tg]').forEach(function (b) {
          b.onclick = async function () {
            var t = list.find(function (x) { return x.id === b.dataset.tg; });
            t.ativa = t.ativa === false; await P.DB.put('customTasks', t); await P.refreshTasks(); load();
          };
        });
        root.querySelectorAll('[data-del]').forEach(function (b) {
          b.onclick = async function () {
            if (!confirm('Excluir esta atividade? Os resultados já salvos continuam nos exames.')) return;
            await P.DB.del('customTasks', b.dataset.del); await P.refreshTasks(); load();
          };
        });

        $('f').onsubmit = async function (e) {
          e.preventDefault();
          var tipo = $('tp').value, d = PARAM[tipo];
          var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, +v || lo)); };
          var n = clamp($('n').value, 6, 80), isi = clamp($('isi').value, 300, 3000), v = clamp($('pv').value, d[1], d[2]);
          var t = Object.assign({}, editing || {}, {
            nome: $('nm').value.trim(), nivel: $('nv').value, tipo: tipo, n: n, isi: isi, ativa: editing ? editing.ativa : true, regra: $('rg').value.trim(),
            pacientes: Array.prototype.filter.call($('pc').options, function (o) { return o.selected; }).map(function (o) { return o.value; })
          });
          if (tipo === '') t.nogo = v / 100;
          if (tipo === 'sel') { t.dist = v; t.alvo = .3; }
          if (tipo === 'alt') { t.troca = v; t.alvo = .5; }
          if (tipo === 'rep') { t.volta = v; t.alvo = .25; }
          if (tipo === 'dir') t.inv = v / 100;
          t.desc = TIPOS.filter(function (x) { return x[0] === tipo; })[0][1].split(' (')[0] + ' · ' + n + ' estímulos · ' + isi + ' ms';
          await P.DB.put('customTasks', t);
          await P.refreshTasks();
          P.toast(editing ? 'Atividade atualizada.' : 'Atividade criada.');
          editing = null;
          load();
        };
      }
      await load();
    }
  };
})(window.Psilog);
