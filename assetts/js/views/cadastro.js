/* Tela (profissional): cadastro e edição do paciente. */
(function (P) {
  P.views.cadastro = {
    title: 'Novo exame',
    mount: async function (root, params) {
      var cur = params.get('id') ? await P.DB.get('patients', params.get('id')) : null;
      root.innerHTML =
        '<form class="card" id="form"><h2>' + (cur ? 'Editar paciente' : 'Cadastro do paciente') + '</h2>' +
          '<div class="row">' +
            '<label>Nome<input id="nome" required></label>' +
            '<label>Data do exame<input type="date" id="dataExame"></label>' +
          '</div>' +
          '<div class="row">' +
            '<label>Sexo<select id="sexo"><option>Feminino</option><option>Masculino</option><option>Outro / prefere não informar</option></select></label>' +
            '<label>Nascimento<input type="date" id="nasc"></label>' +
            '<label>Idade<input id="idade" readonly placeholder="calculada"></label>' +
          '</div>' +
          '<div class="row">' +
            '<label>Escolaridade<select id="escol"><option>Fundamental</option><option>Médio</option><option>Superior</option><option>Pós-graduação</option></select></label>' +
            '<label>Lateralidade<select id="lat"><option>Destro</option><option>Canhoto</option><option>Ambidestro</option></select></label>' +
            '<label>Anos de estudo<input type="number" id="anos" min="0" max="30" value="0"></label>' +
          '</div>' +
          '<label>Anotações<textarea id="obs" rows="3"></textarea></label>' +
          '<label class="check"><input type="checkbox" id="cons" required> Consentimento do paciente (ou responsável) para a aplicação dos testes e o registro dos dados foi obtido.</label>' +
          '<p id="cadastro-erro" class="form-error" role="alert" hidden></p>' +
          '<div class="acts">' +
            '<button class="btn" type="submit">' + (cur ? 'Salvar alterações' : 'Salvar e escolher tarefa') + '</button>' +
            '<a class="btn g" href="' + P.router.href(cur ? 'pacientes' : 'inicio') + '">Cancelar</a>' +
          '</div>' +
        '</form>';

      var $ = function (id) { return root.querySelector('#' + id); };
      $('dataExame').value = new Date().toISOString().slice(0, 10);
      $('nasc').onchange = function () { $('idade').value = P.utils.age(this.value); };

      if (cur) {
        $('nome').value = cur.nome || ''; $('dataExame').value = cur.dataExame || '';
        $('sexo').value = cur.sexo || ''; $('nasc').value = cur.nascimento || ''; $('idade').value = cur.idade || '';
        $('escol').value = cur.escolaridade || ''; $('lat').value = cur.lateralidade || '';
        $('anos').value = cur.anosEstudo || 0; $('obs').value = cur.obs || '';
        $('cons').checked = !!cur.consentimento;
      }

      $('form').onsubmit = async function (e) {
        e.preventDefault();
        var button = e.target.querySelector('button[type="submit"]');
        var label = button.textContent;
        var errorBox = $('cadastro-erro');
        var nome = $('nome').value.trim();
        errorBox.hidden = true;
        if (!nome) {
          $('nome').focus();
          errorBox.textContent = 'Informe o nome do paciente para continuar.';
          errorBox.hidden = false;
          return;
        }
        button.disabled = true;
        button.textContent = 'Salvando...';
        try {
          var patient = await P.DB.put('patients', Object.assign({}, cur || {}, {
            nome: nome,
            dataExame: $('dataExame').value,
            sexo: $('sexo').value,
            nascimento: $('nasc').value,
            idade: $('idade').value,
            escolaridade: $('escol').value,
            lateralidade: $('lat').value,
            anosEstudo: Number($('anos').value) || 0,
            obs: $('obs').value.trim(),
            consentimento: true,
            consentimentoEm: (cur && cur.consentimentoEm) || new Date().toISOString()
          }));
          if (!patient || !patient.id) throw new Error('O paciente foi salvo sem um identificador válido.');
          if (cur) { P.toast('Paciente atualizado.'); P.router.go('pacientes'); }
          else P.router.go('tarefas', { p: patient.id });
        } catch (error) {
          console.error('Erro ao salvar paciente:', error);
          errorBox.textContent = 'Não foi possível salvar o cadastro. Detalhe: ' + (error && error.message ? error.message : 'erro desconhecido');
          errorBox.hidden = false;
          button.disabled = false;
          button.textContent = label;
        }
      };
    }
  };
})(window.Psilog);
