# Tasks — P0: Comunicação Visual / CAA

**Milestone**: #9 — [spec](spec.md)
**Plano técnico**: [plan](plan.md)
**Estado**: T001–T006 concluídas localmente na US-041/#41, com evidências em [quickstart](quickstart.md). T007 e T008 permanecem pendentes; nenhuma plataforma nativa nem a Issue foi declarada concluída. T009 em diante não foram executadas.

Os IDs T são locais à feature. Cada grupo US corresponde a uma Issue e deve ser executado em
sua própria branch curta, criada da `main` atualizada e integrada por PR. Não executar tasks de
duas Issues independentes na mesma branch. A US-041/#41 é pré-requisito técnico; verificar sua
Definition of Ready e manter a árvore limpa antes de iniciar a branch
`chore/us-041-bootstrap-react-native`. Histórias funcionais dependem do bootstrap integrado.

## Fase 1: US-041 — Bootstrap da base (Issue #41)

**Objetivo**: materializar a base aprovada do plano, sem implementar comportamento de produto.

**Teste independente**: instalar dependências pelo lockfile, executar teste mínimo, lint,
typecheck e Expo Doctor; abrir a base em Android e iOS e registrar evidência por plataforma.
Validação de plataforma indisponível deve permanecer explicitamente pendente.

- [x] T001 [US-041] Criar o app Expo SDK 57 com TypeScript strict, Expo Router, Hermes, `package.json`, `package-lock.json`, `app.json` e `.nvmrc` na raiz, fixando Node.js 24.21.0/npm 11.19.0; usar Node 22.23.3/npm 10.9.9 somente se incompatibilidade comprovada for registrada em `docs/bootstrap-tecnico.md`.
- [x] T002 [US-041] Configurar ESLint/`npx expo lint`, TypeScript strict/`npx tsc --noEmit`, Jest com `jest-expo` e React Native Testing Library em `eslint.config.js`, `tsconfig.json`, `jest.config.js` e `package.json`.
- [x] T003 [P] [US-041] Criar a estrutura vazia de rotas e módulos conforme plano em `src/app/`, `src/features/communication/`, `tests/features/communication/` e `modules/tear-speech/`, sem implementar quadro, frase, fala, cartões ou favoritos.
- [x] T004 [P] [US-041] Criar teste mínimo de inicialização da base em `tests/tooling/app-start.test.tsx`, sem testar comportamentos futuros das histórias.
- [x] T005 [US-041] Configurar workflow de CI para instalar via lockfile e executar lint, typecheck, testes e Expo Doctor em `.github/workflows/mobile-quality.yml`; registrar somente comandos reais em `scripts/quality-gate.json`.
- [x] T006 [US-041] Atualizar `docs/development-workflow.md`, `specs/001-comunicacao-visual-caa/quickstart.md` e `docs/bootstrap-tecnico.md` com Node/npm escolhidos, requisitos de Android 7/API 24 e iOS 16.4, limites do ambiente, comandos executados e evidências/pendências por plataforma.
- [ ] T007 [US-041] Construir e abrir o app-base em Android e iOS, registrar comandos, toolchains, resultados e limitações em `specs/001-comunicacao-visual-caa/quickstart.md`; validar bundle instalado offline, distinguindo-o do servidor de desenvolvimento, e confirmar ausência de conta, backend, telemetria e transmissão de conteúdo.
- [ ] T008 [US-041] Revisar dependências, permissões, rede e logs da base em `package.json`, `app.json` e `docs/bootstrap-tecnico.md`; documentar que SQLite, seleção de imagens e fala nativa serão adicionados somente nas Issues correspondentes, reconciliar caminhos e comandos reais em `specs/001-comunicacao-visual-caa/plan.md`, `specs/001-comunicacao-visual-caa/quickstart.md` e `specs/001-comunicacao-visual-caa/tasks.md`, e registrar evidência de privacidade e acessibilidade da base no PR.

**Pendências da #41**: T007 não pôde compilar/abrir Android (sem Java/SDK) ou iOS (Linux,
sem Xcode). Prebuild e bundles Hermes passaram, mas não provam execução nativa/offline.
Em T008, a revisão local e a reconciliação documental estão em
[bootstrap-tecnico.md](../../docs/bootstrap-tecnico.md); faltam validação nativa, resolução/revisão
dos alertas da auditoria e registro no PR. Nenhum PR/push/merge foi realizado.

## Fase 2: Fundacional — pré-requisitos das histórias funcionais

**Objetivo**: liberar as histórias somente após o PR de US-041/#41 estar integrado à `main` e
os bloqueios de conteúdo da US-001/#1 terem origem aprovada no backlog.

**Teste independente**: confirme PR integrado, comandos reais do bootstrap verdes e mapeamento
das dez mensagens/categorias registrado na Issue #1 antes de criar catálogo inicial.

- [ ] T009 Registrar no backlog da Issue #1 o mapeamento aprovado das dez mensagens para necessidades, sentimentos e solicitações antes de semear `src/features/communication/board/initial-cards.ts`; não presumir a distribuição.

## Fase 3: US-001 — Quadro básico de comunicação (Priority: P0, Issue #1)

**Objetivo**: apresentar cartões essenciais localmente e permitir encontrá-los com baixa carga
cognitiva e navegação acessível.

**Teste independente**: abrir a versão instalada em modo avião desde primeira abertura; verificar
categorias e dez mensagens, acesso em até dois toques após abrir o quadro, ampliação sem perda,
leitor de tela, contraste e alvos de toque.

- [ ] T010 [US-001] Adicionar testes para RF-001/RF-002 em `tests/features/communication/board/initial-cards.test.ts`, cobrindo primeira abertura sem rede e presença de sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo.
- [ ] T011 [US-001] Selecionar para cada mensagem um pictograma Flaticon adequado e de baixa estimulação; registrar URL, autor, licença, atribuição e justificativa em `assets/communication/pictograms/ATTRIBUTIONS.md` e salvar recursos licenciados em `assets/communication/pictograms/`.
- [ ] T012 [US-001] Implementar categorias e cartões iniciais para RF-002 conforme o mapeamento aprovado da Issue #1 em `src/features/communication/board/initial-cards.ts`, com recursos locais e sem consulta de rede.
- [ ] T013 [US-001] Implementar quadro e navegação até cada cartão para RF-001, RF-003 e RF-004 em `src/features/communication/board/` e `src/app/index.tsx`, mantendo até dois toques após abrir o quadro.
- [ ] T014 [US-001] Adicionar testes de apresentação e navegação para RF-003/RF-004 em `tests/features/communication/board/board-accessibility.test.tsx`, cobrindo rótulos acessíveis, conteúdo visual/textual e caminho máximo de toques.
- [ ] T015 [US-001] Revisar quadro em Android/iOS com leitor de tela, ampliação de texto, contraste, foco e alvos de toque; documentar verificações aplicáveis, exceções justificadas e baixa carga cognitiva em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR.

## Fase 4: US-002 — Compor frases (Priority: P0, Issue #2)

**Objetivo**: compor mensagens ordenadas e editáveis durante a sessão, preservando-as entre
categorias e em segundo plano; encerrar o app inicia frase vazia.

**Teste independente**: selecionar múltiplos cartões sem limite funcional predefinido, remover
um, limpar toda a frase, navegar/suspender e retornar; encerrar e abrir novamente para verificar
frase vazia.

- [ ] T016 [US-002] Adicionar testes de composição, ordem, remoção individual, limpeza e ciclo de sessão em `tests/features/communication/sentence/sentence-state.test.ts`.
- [ ] T017 [US-002] Implementar estado volátil da frase e entradas com snapshot do conteúdo selecionado para RF-005 e RF-008 em `src/features/communication/sentence/sentence-state.ts`, sem persistir a frase após encerramento e sem impor limite funcional novo.
- [ ] T018 [US-002] Implementar área de frase, remoção individual para RF-006 e ação de limpar para RF-007 em `src/features/communication/sentence/` e integrar navegação de categorias em `src/app/_layout.tsx`.
- [ ] T019 [US-002] Revisar a composição com leitor de tela, ordem de foco, rótulos, ampliação, previsibilidade e baixa estimulação em `src/features/communication/sentence/`; registrar evidência no PR.

## Fase 5: US-003 — Text-to-Speech (Priority: P0, Issue #3)

**Objetivo**: permitir leitura explícita da frase em voz pt-BR local, interrompível, mantendo
alternativa visual acessível se voz local não estiver disponível.

**Teste independente**: frase vazia não fala; em frase composta, toque inicia e controle interrompe;
validar pt-BR offline em Android/iOS quando voz local compatível estiver disponível; testar
ausência de voz e falha sem travamento ou chamada remota.

- [ ] T020 [US-003] Adicionar testes da interface de fala para frase vazia, início explícito, interrupção e indisponibilidade em `tests/features/communication/speech/speech-controls.test.tsx`.
- [ ] T021 [US-003] Implementar a ponte TypeScript de disponibilidade, falar e interromper em `src/features/communication/speech/local-speech.ts`, sem acionar fala na seleção de cartão.
- [ ] T022 [US-003] Implementar módulo Expo nativo para RF-010 em Android e iOS em `modules/tear-speech/`, aceitando apenas voz local pt-BR conforme o plano; Android deve rejeitar voz com `isNetworkConnectionRequired == true`, e iOS deve enumerar voz pt-BR instalada. Não baixar vozes nem enviar conteúdo.
- [ ] T023 [US-003] Implementar controles acessíveis de reproduzir/interromper para RF-009 e orientação para frase vazia, voz ausente ou falha para RF-011 em `src/features/communication/speech/` e integrar com `src/features/communication/sentence/`.
- [ ] T024 [US-003] Validar RF-012 (operação sem servidor remoto), voz pt-BR e interrupção em aparelhos Android/iOS reais, em modo avião e com voz ausente; registrar dispositivos, resultados e limitações em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR, mantendo a frase visível quando não houver leitura.

## Fase 6: US-004 — Cartões personalizados (Priority: P0, Issue #4)

**Objetivo**: criar, editar e excluir cartões com título e categoria, imagem opcional, persistência
local e mensagens acessíveis em erros de validação, picker ou gravação.

**Teste independente**: criar/editar/excluir com e sem imagem, verificar validação de título/categoria,
negação/indisponibilidade de câmera, falha de gravação e recuperação após reinício sem rede.

- [ ] T025 [US-004] Adicionar testes de validação para título vazio/só espaços, categoria ausente/inexistente e preservação dos campos em `tests/features/communication/custom-cards/custom-card-validation.test.ts`.
- [ ] T026 [US-004] Implementar validação e formulário de criar/editar cartão para RF-013 em `src/features/communication/custom-cards/`, exigindo título não vazio após remover espaços externos e categoria existente; erro deve identificar campo, preservar preenchimento e impedir salvar.
- [ ] T027 [US-004] Adicionar testes do picker, cópia de imagem e falha de persistência em `tests/features/communication/custom-cards/custom-card-media.test.ts` e `tests/features/communication/custom-cards/custom-card-storage.test.ts`, cobrindo imagem omitida, câmera negada/indisponível e retry/cancelamento.
- [ ] T028 [US-004] Integrar `expo-image-picker` para RF-014 em `src/features/communication/custom-cards/media-picker.ts` e configuração mínima em `app.json`; selecionar arquivo ou câmera a pedido, remover permissão de microfone e permitir salvar sem imagem quando câmera falhar.
- [ ] T029 [US-004] Integrar `expo-file-system` para copiar imagem selecionada ao diretório privado persistente em `src/features/communication/custom-cards/local-image-storage.ts`; manter somente URI local no modelo e não baixar mídia remota.
- [ ] T030 [US-004] Implementar RF-015/RF-016: criar, editar, excluir e persistir cartão personalizado em `src/features/communication/custom-cards/`, integrando `expo-sqlite` em `src/features/communication/storage/`; preservar edição em falha, oferecer retry/cancelamento, atualizar favoritos editados e remover cartão excluído da frase/favoritos sem alterar ordem restante.
- [ ] T031 [US-004] Revisar formulário, permissões, mensagens de erro e conteúdo de cartão com leitor de tela, ampliação, foco e contraste em Android/iOS; registrar privacidade, operação offline, evidências e limitações em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR.

## Fase 7: US-005 — Favoritos (Priority: P0, Issue #5)

**Objetivo**: marcar/desmarcar qualquer cartão, acessar área própria e persistir localmente a
ordem, preservando último estado confirmado em falha.

**Teste independente**: marcar vários cartões, confirmar ordem de inclusão, desmarcar e marcar
novamente, reiniciar em modo avião; testar lista vazia e falha de gravação/retry.

- [ ] T032 [US-005] Adicionar testes para marcação, desmarcação, inserção no final, ordem após desmarcar/remarcar, estado vazio e falha de persistência em `tests/features/communication/favorites/favorites.test.ts`.
- [ ] T033 [US-005] Implementar armazenamento SQLite local de cartões e favoritos com migrações, transações e restrições de `data-model.md` em `src/features/communication/storage/`; sem ORM, sincronização ou logs de conteúdo.
- [ ] T034 [US-005] Implementar RF-017/RF-019: marcação, desmarcação e ordem de favoritos em `src/features/communication/favorites/`, persistindo a ordem localmente e preservando a última ordem salva se a gravação falhar.
- [ ] T035 [US-005] Implementar acesso direto à área de favoritos para RF-018 e estado vazio informativo em `src/app/favorites.tsx` e `src/features/communication/favorites/`; informar falha de modo acessível e permitir tentar novamente.
- [ ] T036 [US-005] Revisar navegação, leitor de tela, foco, ordem e erros de favoritos; testar persistência após reinício offline e registrar evidências de acessibilidade, privacidade e operação local em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR.

## Fase 8: Polish e verificações transversais

**Objetivo**: verificar coerência entre histórias implementadas e Definition of Done, sem antecipar
funcionalidades fora das Issues.

- [ ] T037 Executar `npm ci`, `npx expo lint`, `npx tsc --noEmit`, `npm test -- --ci`, `npx expo-doctor`, builds Android/iOS disponíveis e cenários aplicáveis de `specs/001-comunicacao-visual-caa/quickstart.md`; registrar resultados reais, limitações e gates pendentes no PR da Issue correspondente.
- [ ] T038 Revisar acessibilidade, design neuroinclusivo, baixa carga cognitiva, previsibilidade, privacidade, segurança, permissões, rede, logs e dependências nas histórias entregues; registrar evidências ou justificativas de não aplicabilidade em `specs/001-comunicacao-visual-caa/quickstart.md` e nos respectivos PRs.
- [ ] T039 Conferir rastreabilidade de RF-001 a RF-019 e RNF da spec para Issues #1–#5, atualizar `specs/001-comunicacao-visual-caa/tasks.md` somente após verificar critérios e comportamento, e registrar lacunas não especificadas como pendências no backlog de origem.

## Dependências e ordem de execução

- US-041/#41 (T001–T008) deve ser concluída e integrada em `main` antes de qualquer história funcional.
- US-001/#1 (T009–T015) requer bootstrap e mapeamento de mensagens/categorias no backlog; fornece os cartões usados por composição, fala e favoritos.
- US-002/#2 (T016–T019) requer UI e cartões selecionáveis da US-001.
- US-003/#3 (T020–T024) requer frase da US-002 e base Expo do bootstrap; implementar o módulo nativo em sua própria branch e validar em Android/iOS reais.
- US-004/#4 (T025–T031) requer categorias da US-001 e armazenamento local; possui estado de validação e falha próprio.
- US-005/#5 (T032–T036) requer catálogo da US-001 e armazenamento local; pode ser desenvolvida após bootstrap em branch própria, mas sua área lista cartões aprovados.
- Cada Issue usa branch própria da `main` atualizada. Apesar das dependências funcionais, Issues em branches distintas só se integram por PRs pequenos e `main` deve permanecer compilável.
- T037–T039 são verificações na entrega de cada Issue; conclusão da milestone ainda exige gate completo e todas as Issues integradas.

## Oportunidades de paralelismo

- T003–T004 podem ocorrer em paralelo após T001–T002, pois tocam estrutura e teste inicial separados; T005–T006 dependem da base/configuração prevista em T001–T002.
- Histórias de produto pertencem a Issues/branches diferentes e não devem ser executadas na mesma branch. Após bootstrap e catálogo aprovado, US-002, US-004 e partes de US-005 podem ser desenvolvidas em paralelo por responsáveis distintos, coordenando contratos e mantendo `main` integrável.
- Dentro de US-001, T010 e preparação/revisão de recursos de T011 podem ocorrer em paralelo; T012 depende do mapeamento T009 e dos recursos licenciados T011.
- Dentro de US-003, T020 pode ser escrito antes de T021–T023; validação nativa T024 depende do módulo integrado.
- Tasks marcadas `[P]` só indicam arquivos distintos e ausência de dependência direta; a regra de uma branch por Issue continua obrigatória.

## Estratégia de implementação

O bootstrap US-041 (#41) é pré-requisito técnico e entrega somente base verificável. O primeiro
incremento de produto é US-001/#1, com os dez cartões locais e acessíveis após aprovação do
mapeamento no backlog. Depois, validar composição da US-002; TTS da US-003 depende dessa frase.
US-004 e US-005 seguem em branches próprias e só integram quando passarem seus testes e checks.
Nenhuma história é declarada Ready/Done por constar aqui; verificar DoR, critérios originais e
Definition of Done antes de executar e concluir cada Issue.
