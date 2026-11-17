# Psilog

Testes de atenção sustentada (go/no-go): cadastro de pacientes, tarefas, resultados
com gráficos, resumo com percentil, atividades personalizadas e login por conta.

## Estrutura

```
psilog/
├── index.html           única página; as telas trocam por rota (#/inicio, #/tarefas, ...)
├── main.cjs             janela do aplicativo Windows (Electron)  ← só para o exe
├── package.json         configuração do exe                       ← só para o exe
├── assets/img/          logo e ícones
├── css/                 base, temas, layout, componentes e views/ (uma por tela)
└── js/
    ├── app.js           ponto de entrada
    ├── core/            banco (IndexedDB), login, Firebase, rotas, tema, utilitários
    ├── data/tasks.js    definição das 15 tarefas
    └── views/           uma tela por arquivo
```

## 1) Rodar como site (GitHub Pages)

Envie tudo para o repositório, **exceto** `main.cjs` e `package.json` (só servem ao exe).
No Firebase, em Authentication > Configurações > Domínios autorizados, adicione
o domínio do site (ex.: `seuusuario.github.io`, sem `https://` e sem `/pasta`).

## 2) Gerar o exe (Windows)

1. Instale o Node.js LTS (https://nodejs.org).
2. Abra o CMD dentro desta pasta e rode `npm install`.
3. Rode `npm run dist:win` (instalador) ou `npm run dist:win:portable`.
4. O resultado fica na pasta `dist`. Para testar sem gerar o exe: `npm start`.

## Login por conta (Firebase)

As chaves do projeto ficam em `js/core/firebase-config.js`. Se esse arquivo ficar com
`COLE_AQUI`, o app usa o login local (só escolher o perfil, sem senha).
- E-mail/senha funciona no site e no exe (precisa de internet).
- "Entrar com Google" funciona no site (https). No exe pode não abrir; o app avisa.
- O Firebase só confirma quem entrou. Exames e cadastros ficam neste dispositivo
  (IndexedDB); faça backups pela tela **Dados**.
- Quem cria a conta escolhe se é profissional ou paciente; impedir que alguém se
  declare profissional exige validação no servidor (custom claims).
- Dados de saúde são sensíveis pela LGPD: antes de guardar exames na nuvem,
  defina consentimento, regras de acesso e política de privacidade.

## Telas

`#/login` · `#/inicio` · `#/cadastro` · `#/tarefas` · `#/teste` · `#/resultados` ·
`#/resumo` · `#/pacientes` · `#/atividades` · `#/dados` · `#/aparencia` · `#/tour`

## Adicionar uma tela

1. Crie `js/views/minha-tela.js` registrando `Psilog.views.minhaTela = { title, mount(root, params) }`.
2. Inclua o script no `index.html` e um link `<a href="#/minhaTela" data-route="minhaTela">` no menu.

## Aviso

Os percentis comparam apenas os exames salvos localmente; não são tabelas normativas
clínicas e não substituem avaliação profissional.
