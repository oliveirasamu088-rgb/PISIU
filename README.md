# Psilog

Aplicação web para testes de atenção sustentada (go/no-go): cadastro de pacientes,
aplicação de tarefas, resultados com gráficos e resumo com percentil.

## Como usar

Abra o `index.html` no navegador (duplo clique). Não precisa de servidor, build nem instalação.

## Estrutura

```
psilog/
├── index.html            # única página; as telas são trocadas por rota (#/inicio, #/cadastro, ...)
├── assets/
│   └── img/              # logo e mascote
├── css/
│   ├── base.css          # tokens, reset e tipografia
│   ├── themes.css        # temas: branco, amarelo, laranja e escuro
│   ├── layout.css        # cabeçalho, navegação e grades
│   ├── components.css    # card, botão, formulário, tabela, toast...
│   └── views/            # estilos específicos de cada tela
├── js/
│   ├── core/             # tema, utilitários, banco (IndexedDB), estatística e roteador
│   ├── data/             # definição das tarefas
│   ├── views/            # uma tela por arquivo (inicio, cadastro, tarefas, teste, ...)
│   └── app.js            # ponto de entrada
└── docs/                 # material de apoio (captura de tela)
```

## Rotas

`#/inicio` · `#/cadastro` · `#/tarefas` · `#/teste` · `#/resultados` · `#/resumo` · `#/dados` · `#/aparencia` · `#/tour`

## Como adicionar uma tela

1. Crie `js/views/minha-tela.js` registrando `Psilog.views.minhaTela = { title, mount(root, params) }`
   (`mount` pode retornar uma função de limpeza).
2. Inclua o script no `index.html` e um link `<a href="#/minhaTela" data-route="minhaTela">` no menu.

## Banco de dados

IndexedDB do navegador (`js/core/db.js`). Os dados ficam só neste navegador/computador;
use a tela **Dados** para backup (JSON) e exportação (CSV).

## Aviso

Os percentis comparam apenas os exames salvos localmente; não são tabelas normativas
clínicas e não substituem avaliação profissional.
