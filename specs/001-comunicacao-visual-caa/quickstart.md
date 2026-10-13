# Quickstart de Validação — Comunicação Visual / CAA

Este guia conserva o histórico do bootstrap US-041/#41 e registra a implementação
parcial da US-001/#1. A rota inicial apresenta o quadro e os dez PNGs fornecidos
pelo usuário; a verificação individual de licença permanece pendente.

## US-001 — Evidências de 2026-10-13

- Branch: `feat/us-001-exibir-quadro-basico-de-comunicacao`, worktree isolada já
  existente e inicialmente limpa, baseada na main 44737e42fce67f103ad22c3fbfea9ea38a1df9d9.
- Catálogo: dez mensagens e categorias conforme tabela da Issue #1; filtro,
  exibição individual e retorno, sem som, logs de conteúdo ou persistência.
  Pictogramas importados localmente com os nomes originais enviados pelo usuário.
  Crédito Flaticon por cartão usa a busca solicitada pelo usuário e só abre
  navegador por ação explícita; a tela não depende desse acesso.
- `npm test -- --ci --runInBand`: 3 suítes, 17 testes aprovados com Node 24.21.0
  após incorporar PNGs, links e falha de abertura do crédito.
  Cobertura: catálogo aprovado, primeira renderização sem fetch, dez caminhos
  de até dois toques, filtro/retorno e ausência de dados. Não prova execução nativa.
- `npm run lint` e `npm run typecheck`: aprovados.
- `python3 scripts/validate-workflow.py`, 40 testes de tooling e
  `./scripts/github/check-issue.sh 1`: aprovados; critérios originais e Ready reconciliados.
- Expo Doctor 1.20.4: 20/21 checks; falha por patches recomendados mais recentes
  para expo, expo-constants, expo-linking, expo-router e jest-expo. Antes da
  integração, esses cinco patches foram alinhados e Expo Doctor passou 21/21.
  Execução no sandbox não conseguiu
  ler JSON do subprocesso; execução fora do sandbox produziu o resultado acima.
- Privacidade/revisão estática: catálogo importado localmente, sem chamadas
  automáticas de rede, coleta, banco, permissões ou dependências adicionais.
  Link externo de crédito transmite somente o termo público de busca a pedido.
  Seleção apenas
  abre cartão; não inicia voz ou animação.
- Acessibilidade projetada: rótulos e estados de seleção, texto ampliável,
  rolagem, alvos de pelo menos 48 unidades; uma coluna para largura abaixo de
  340 ou fontScale >= 1.5. Texto #202124 em branco; categorias #16634D em
  #EEF6F2. Não há cor como única informação. Revisão nativa de foco, contraste,
  ampliação, TalkBack/VoiceOver e uso offline instalado permanece pendente.
- Pictogramas: acesso direto ao Flaticon bloqueado por preferência salva do
  navegador, inclusive após autorização explícita do usuário. Usuário forneceu
  os dez PNGs e solicitou os links de busca como atribuição. Licenças/autores
  específicos não identificados; não presumidos. Associação e referências em
  [ATTRIBUTIONS.md](../../assets/communication/pictograms/ATTRIBUTIONS.md).
- Dependências inicialmente compartilhadas por link local `node_modules`;
  antes da integração, instaladas na worktree com manifesto e lockfile alinhados
  aos cinco patches recomendados pelo Expo Doctor.
- Build Android iniciado sob a regra anterior: `assembleRelease` aprovado
  em 18m12s, 571 tasks Gradle; bundle e dez PNGs locais empacotados.
  APK em `android/app/build/outputs/apk/release/app-release.apk`.
  Esse resultado não comprova abertura, uso offline ou acessibilidade nativa.
- Decisão de 2026-10-13: retirar builds automáticos por tarefa/Issue/execução
  nesta máquina. Gate da milestone em ambiente dedicado, ou execução explícita;
  SSH ainda não configurado. Não foi iniciado outro build após essa decisão.
- Decisão posterior: usar GitHub Actions em lugar do SSH planejado, com builds
  Android/iOS manuais e gate remoto no SHA integrado da main.
- `adb devices`: nenhum dispositivo; SDK local sem emulador instalado.
  Abertura/offline, TalkBack/VoiceOver e build iOS ficam para o gate dedicado.

## US-002 — Desenvolvimento local em 2026-10-13

Branch `feat/us-002-montar-frases-com-cartoes-de-comunicacao`, criada sobre a main
integrada pelo PR #43. Provider de sessão acima das rotas; frase apenas em memória.
Cada seleção acrescenta um snapshot, inclusive cartões repetidos. Remoção usa ID
da ocorrência; limpeza preserva catálogo e contador de IDs. A ação remove-card
permite a integração futura da exclusão na #4, sem implementar editor nesta Issue.

- 25 testes JS aprovados: ordem, duplicatas, remoção individual, limpeza,
  snapshot de título/imagem, ausência de máximo funcional, remoção por ID de cartão,
  troca de categorias, detalhe/retorno e ciclo de montagem do provider.
- Testes simulam remount da sessão; não comprovam suspensão ou encerramento pelo
  sistema em aparelho. Essas validações permanecem no gate da milestone.
- Nenhuma persistência, fala, coleta ou transmissão de frase. URLs dos créditos
  existentes abrem somente por ação explícita.
- `npm run lint`, `npm run typecheck`, Expo Doctor 21/21, 44 testes de tooling,
  validação documental e `git diff --check` aprovados, incluindo o suporte web.
- Prévia web: `npx expo start --web --port 8082`, com react-native-web compatível
  instalado pelo Expo. A configuração web serve à inspeção do desenvolvimento,
  sem afirmar suporte funcional completo dos módulos nativos futuros.
- Prévia acessível em http://localhost:8082; Metro compilou 873 módulos sem
  erro e registrou a inicialização. Automação do navegador negada por permissão;
  não foi realizada inspeção visual automatizada.

## Pré-Requisitos Históricos Do Bootstrap

- Feature: [spec.md](spec.md), Issues #1–#5 e US-041/#41 da milestone #9.
- Comportamento: [contrato de interação](contracts/user-interaction.md).
- Modelo lógico: [data-model.md](data-model.md).
- Stack instalada: Expo 57.0.28, RN 0.86.3, React 19.2.3, Node.js 24.21.0/npm 11.19.0,
  `package-lock.json`, TypeScript 6.0.3 strict, Expo Router 57.0.26 e Hermes.
- Branch existente: `chore/us-041-bootstrap-react-native`; DoR da #41 conferida via gh.
  Não recriar a base ao retomar. Verificar tasks e evidências; nenhuma história funcional
  foi implementada. O fallback Node 22.23.3/npm 10.9.9 não foi necessário.

## Instalação e checks da base

Na raiz, com nvm disponível:

```bash
nvm install
nvm use
node --version
npm --version
export EXPO_NO_TELEMETRY=1
npm ci
npx expo lint
npm run lint
npx tsc --noEmit
npm test -- --ci
npx expo-doctor
python3 scripts/validate-workflow.py
python3 -m unittest discover -s tests/tooling -v
git diff --check
```

As versões esperadas são Node `v24.21.0` e npm `11.19.0`. A variável desativa telemetria da
CLI Expo; não existe telemetria implementada no aplicativo. `npm run lint` também cobre testes
e configurações. O teste em `tests/tooling/app-start.test.tsx` abre a rota `/` com o layout real
usando Expo Router/RNTL e verifica o título acessível. Testes das histórias irão para
`tests/features/communication/`, hoje vazio.

## Desenvolvimento e builds locais

Para desenvolver com Metro e toolchain/dispositivo disponíveis:

```bash
npm start
npm run android
npm run ios
```

Android: JDK 17, Android SDK com platform-tools, API 36, build-tools 36.0.0,
NDK 27.1.12297006 e emulador/dispositivo. Configurar `JAVA_HOME`, `ANDROID_HOME` e `PATH`.
API 36 é o SDK de compilação; o mínimo de execução configurado é API 24/Android 7.
iOS: macOS, Xcode/Command Line Tools e CocoaPods compatíveis com Expo SDK 57, runtime de
simulador iOS 16.4+ ou dispositivo com assinatura de desenvolvimento. Sem EAS ou publicação.

```bash
npm run build:android
# Em macOS, com simulador selecionado/disponível:
npm run build:ios
```

O build Android usa CNG e `./gradlew assembleRelease`; produz
`android/app/build/outputs/apk/release/app-release.apk` com bundle embutido e chave de debug
do template, apenas para teste local. Não é artefato pronto para publicação.
O build iOS usa configuração Release e `--no-bundler`, compilando/instalando no simulador;
para um aparelho conectado, usar `npm run build:ios -- --device` e configurar assinatura.
`npm run build` exige ambos os comandos, em macOS com os dois toolchains, no quality gate.

Projetos nativos são gerados e ignorados pelo Git. Não executar
`npx expo prebuild --clean` sobre uma árvore com alterações não revisadas: CNG recria diretórios
nativos gerados. O workflow `mobile-quality.yml` configura os checks JS e o build Android;
nenhum job remoto foi executado nesta entrega local.

## Verificação offline da base instalada — pendente

1. Gerar o build Release acima; instalar o APK com
   `adb install android/app/build/outputs/apk/release/app-release.apk`, ou usar o app Release
   instalado pelo comando iOS. Usar instalação limpa em dispositivo de teste.
2. Encerrar Metro, desligar Wi-Fi/dados (modo avião em aparelho físico) e abrir o app
   pela primeira vez. Confirmar título TEAr sem login, download ou pedido de permissão.
3. Encerrar e reabrir ainda sem rede. Registrar plataforma/versão, dispositivo,
   comando/artefato, resultado e eventuais erros; verificar rede e logs com conteúdo sintético.
4. Conferir leitura do título com TalkBack/VoiceOver e texto ampliado sem corte.

Expo Go/servidor Metro, mocks Jest, prebuild e exportação de bundles não comprovam abertura
offline de aplicativo instalado. Não há persistência ou funções de CAA para testar na #41.

## Evidências da US-041 — 2026-09-23

Ambiente: Linux x86_64, sem Java, Android SDK/adb, Xcode ou CocoaPods disponíveis.
Node oficial foi usado em `/tmp/node-v24.21.0-linux-x64/bin`, colocado no início de `PATH`,
com npm 11.19.0 e `EXPO_NO_TELEMETRY=1`. Não confundir com o Node 22.23.2/npm 10.9.8
original do ambiente. Esse caminho temporário não é requisito do projeto.

| Verificação executada | Resultado e limite |
|---|---|
| `npm ci` | Passou; 1053 pacotes instalados. Auditoria informou 13 vulnerabilidades moderadas; revisão abaixo vinculada. |
| `npx expo lint` e `npm run lint` | Passaram, sem erros. |
| `npx tsc --noEmit` | Passou com `strict: true`, incluindo o teste. |
| `npm test -- --ci` | Passou: 1 suíte/1 teste de inicialização pelo Router. Usa simulação nativa. |
| `npx expo-doctor --verbose` | Passou: 21/21 checks após ajustes finais, com acesso de rede autorizado. A tentativa confinada ao sandbox falhou ao obter o JSON do subprocesso Expo; não foi contada como sucesso. |
| `npx expo prebuild --no-install --platform all --template ./node_modules/expo/template.tgz` | Passou para Android/iOS; Hermes configurado, iOS deployment target 16.4. Geração de arquivos apenas. |
| `npx expo export --platform all --max-workers 2` | Passou; bundles Hermes `.hbc` para Android e iOS em `dist/`. Não compila nem abre app nativo. |
| `npm run build:android` | Falhou antes da compilação: `JAVA_HOME is not set` e comando `java` ausente. SDK/adb também indisponíveis. |
| `npm run build:ios` | Não compilou: CLI informa que iOS exige macOS. |
| `python3 scripts/validate-workflow.py` | Passou: estrutura, links e rastreabilidade local. |
| `python3 -m unittest discover -s tests/tooling -v` | Passou: 40 testes do tooling existente. |
| Abertura instalada, modo avião, TalkBack/VoiceOver | Não executados em nenhuma plataforma. Permanecem pendentes. |
| CI remoto | Configurado, não executado; não houve push ou PR. |

A [revisão de dependências, permissões, privacidade e acessibilidade](../../docs/bootstrap-tecnico.md)
registra os alertas e o escopo da evidência estática. T007 segue pendente; T008 tem revisão
local preparada, mas falta registro no PR e validação nativa. A Issue #41 permanece aberta.

## Cenários futuros das Issues #1–#5

Executar somente após implementar as histórias correspondentes, com dados sintéticos. Registrar
plataforma/versão, rede, presença de voz e resultado. Para imagens e fala, testar em aparelhos
reais além dos mocks; não declarar voz local por resultado de simulador isolado.

| Cenário | Preparação e ação | Resultado esperado |
|---|---|---|
| Primeira abertura offline | Instalar versão limpa, ativar modo avião, abrir o quadro. | Categorias/cartões essenciais disponíveis; dez mensagens iniciais; alvo acessível em até dois toques após abrir. |
| Frase e navegação | Selecionar cartões em ordem, trocar categoria, remover um, limpar; enviar app ao segundo plano e retornar. | Ordem preservada; remoção individual; limpeza total; retorno preserva frase. |
| Encerramento da sessão | Com frase composta, encerrar app e abrir novamente. | Frase vazia; cartões personalizados e favoritos persistidos. |
| Sem voz pt-BR | Em Android e iOS sem voz local compatível, tentar reprodução. | Frase continua visível; aviso acessível; sem travamento ou solicitação de TTS remoto. |
| Voz pt-BR offline | Em dispositivo com voz local compatível, modo avião, iniciar e interromper reprodução. | Frase lida sem rede, apenas após toque explícito; interrupção pelo usuário funciona. |
| Cartão personalizado | Criar/editar título e categoria válidos com imagem e sem imagem; reiniciar app. | Validação aceita somente título/categoria válidos; cartão persiste localmente. |
| Validação de campos | Tentar salvar título vazio/só espaços e categoria ausente/inexistente. | Não salva; preserva preenchimento; indica campo a corrigir. |
| Falha de gravação | Simular falha ao salvar cartão e falha ao persistir ordem de favoritos. | Edição do cartão preservada; favoritos mantêm última ordem salva; erro acessível, nova tentativa disponível e nenhum sucesso falso. |
| Câmera indisponível | Negar permissão ou simular câmera indisponível. | Informar a condição e permitir salvar cartão sem imagem. |
| Favoritos e estados vazios | Marcar/desmarcar vários cartões, fechar/abrir; abrir favoritos vazios e tentar ler frase vazia. | Ordem por sequência recuperada; vazio explicado; frase vazia não fala e orienta a compor. |
| Editar/excluir em uso | Selecionar cartão na frase e favorito; editar, depois excluir. | Frase preserva snapshot; favorito mostra conteúdo atualizado; exclusão remove referência e preserva ordem dos demais. |
| Privacidade e acessibilidade | Inspecionar rede/logs durante fluxos; usar leitor de tela, ampliar texto e revisar foco/contraste/alvos. | Sem texto/imagem/frase em rede/log; conteúdo e função permanecem com ampliação; resultados e limitações acessíveis registrados. |

## Evidências obrigatórias antes de concluir Issue

Registrar comandos e resultados reais de testes, lint, typecheck quando aplicável e build;
separar resultados simulados dos testes nativos. Não marcar gate verde quando a ferramenta
estiver ausente. Revisões de acessibilidade, privacidade e design incluem evidências ou
limitações concretas no PR. O aplicativo não está validado por este documento.
