# Tasks — P0: Comunicação Visual / CAA

**Milestone**: #9 — [spec](spec.md)
**Plano técnico**: [plan](plan.md)
**Estado consultado em 2026-10-13**: US-041/#41 fechada e integrada pelo PR #42.
T007/T008 aceitas no escopo reduzido registrado no GitHub, sem aprovação das
verificações retiradas. T009 aprovada no backlog. US-001 em implementação parcial:
catálogo, navegação, PNGs fornecidos pelo usuário e testes locais;
verificação de licenças/créditos e validações nativas pendentes.

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

- [x] T009 Registrar no backlog da Issue #1 o mapeamento aprovado das dez mensagens para necessidades, sentimentos e solicitações antes de semear `src/features/communication/board/initial-cards.ts`; não presumir a distribuição. Evidência: tabela aprovada e revisão Ready na Issue #1, consultadas em 2026-10-13.

## Fase 3: US-001 — Quadro básico de comunicação (Priority: P0, Issue #1)

**Objetivo**: apresentar cartões essenciais localmente e permitir encontrá-los com baixa carga
cognitiva e navegação acessível.

**Teste independente**: abrir a versão instalada em modo avião desde primeira abertura; verificar
categorias e dez mensagens, acesso em até dois toques após abrir o quadro, ampliação sem perda,
leitor de tela, contraste e alvos de toque.

- [x] T010 [US-001] Adicionar testes para RF-001/RF-002 em `tests/features/communication/board/initial-cards.test.ts`, cobrindo primeira abertura sem rede e presença de sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo. Catálogo e abertura sem fetch verificados nas suítes do quadro; 15 testes JS aprovados em 2026-10-13. Teste do binário offline permanece separado em T015.
- [ ] T011 [US-001] Selecionar para cada mensagem um pictograma Flaticon adequado e de baixa estimulação; registrar URL, autor, licença, atribuição e justificativa em `assets/communication/pictograms/ATTRIBUTIONS.md` e salvar recursos licenciados em `assets/communication/pictograms/`.
- [ ] T012 [US-001] Implementar categorias e cartões iniciais para RF-002 conforme o mapeamento aprovado da Issue #1 em `src/features/communication/board/initial-cards.ts`, com recursos locais e sem consulta de rede.
- [ ] T013 [US-001] Implementar quadro e navegação até cada cartão para RF-001, RF-003 e RF-004 em `src/features/communication/board/` e `src/app/index.tsx`, mantendo até dois toques após abrir o quadro.
- [ ] T014 [US-001] Adicionar testes de apresentação e navegação para RF-003/RF-004 em `tests/features/communication/board/board-accessibility.test.tsx`, cobrindo rótulos acessíveis, conteúdo visual/textual e caminho máximo de toques.
- [ ] T015 [US-001] Revisar quadro em Android/iOS com leitor de tela, ampliação de texto, contraste, foco e alvos de toque; documentar verificações aplicáveis, exceções justificadas e baixa carga cognitiva em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR.

**Registro de execução da US-001 (2026-10-13)**: T010/T012–T014 têm código e
testes do catálogo, imagens locais, filtro, seleção e retorno, sem rede automática.
Usuário forneceu os dez PNGs e solicitou busca Flaticon como link de atribuição.
T011 permanece pendente de autores/licenças específicos: acesso direto bloqueado
pela preferência salva do navegador, inclusive após autorização do usuário.
T012–T014 não são declaradas concluídas sem conteúdo visual licenciado e revisão.
T015 permanece pendente: testes simulados não comprovam TalkBack/VoiceOver,
texto ampliado, foco real ou funcionamento do binário instalado offline.

## Fase 4: US-002 — Compor frases (Priority: P0, Issue #2)

**Objetivo**: compor mensagens ordenadas e editáveis durante a sessão, preservando-as entre
categorias e em segundo plano; encerrar o app inicia frase vazia.

**Teste independente**: selecionar múltiplos cartões sem limite funcional predefinido, remover
um, limpar toda a frase, navegar/suspender e retornar; encerrar e abrir novamente para verificar
frase vazia.

- [x] T016 [US-002] Adicionar testes de composição, ordem, remoção individual, limpeza e ciclo de sessão em `tests/features/communication/sentence/sentence-state.test.ts`. Evidência: testes unitários e de composição aprovados em 2026-10-13, incluindo duplicatas, snapshots e ciclo do provider; suíte total com 25 testes.
- [x] T017 [US-002] Implementar estado volátil da frase e entradas com snapshot do conteúdo selecionado para RF-005 e RF-008 em `src/features/communication/sentence/sentence-state.ts`, sem persistir a frase após encerramento e sem impor limite funcional novo. Evidência: reducer, provider na raiz, 1000 seleções sem máximo fixo e nova sessão vazia.
- [x] T018 [US-002] Implementar área de frase, remoção individual para RF-006 e ação de limpar para RF-007 em `src/features/communication/sentence/` e integrar navegação de categorias em `src/app/_layout.tsx`. Evidência: testes de seleção entre categorias, remoção, limpeza, detalhe do cartão e retorno, sem abrir links automaticamente.
- [ ] T019 [US-002] Revisar a composição com leitor de tela, ordem de foco, rótulos, ampliação, previsibilidade e baixa estimulação em `src/features/communication/sentence/`; registrar evidência no PR.

T019: rótulos, ordem e alvos de toque revisados estaticamente; testes de componentes
aprovados. Leitor de tela, foco e ampliação em dispositivo permanecem para o gate.
Prévia web configurada a pedido do usuário; não equivale a validação Android/iOS.

## Fase 5: US-003 — Text-to-Speech (Priority: P0, Issue #3)

**Objetivo**: permitir leitura explícita da frase em voz pt-BR local, interrompível, mantendo
alternativa visual acessível se voz local não estiver disponível.

**Teste independente**: frase vazia não fala; em frase composta, toque inicia e controle interrompe;
validar pt-BR offline em Android/iOS quando voz local compatível estiver disponível; testar
ausência de voz e falha sem travamento ou chamada remota.

- [x] T020 [US-003] Adicionar testes da interface de fala para frase vazia, início explícito, interrupção e indisponibilidade em `tests/features/communication/speech/speech-controls.test.tsx`. Evidência: suíte JS de 40 testes aprovada, incluindo cancelamento durante consulta, retry de interrupção e manutenção da frase visível.
- [x] T021 [US-003] Implementar a ponte TypeScript de disponibilidade, falar e interromper em `src/features/communication/speech/local-speech.ts`, sem acionar fala na seleção de cartão. Evidência: módulo opcional, sequência de partes sem perda/Unicode, interrupção entre partes e erro sem fallback remoto verificados em testes.
- [ ] T022 [US-003] Implementar módulo Expo nativo para RF-010 em Android e iOS em `modules/tear-speech/`, aceitando apenas voz local pt-BR conforme o plano; Android deve rejeitar voz com `isNetworkConnectionRequired == true`, e iOS deve enumerar voz pt-BR instalada. Não baixar vozes nem enviar conteúdo.
- [x] T023 [US-003] Implementar controles acessíveis de reproduzir/interromper para RF-009 e orientação para frase vazia, voz ausente ou falha para RF-011 em `src/features/communication/speech/` e integrar com `src/features/communication/sentence/`. Evidência: controles nomeados, mensagens de alerta, frase mantida, estado assíncrono e ações explícitas testados; revisão assistiva em aparelho separada em T024.
- [ ] T024 [US-003] Validar RF-012 (operação sem servidor remoto), voz pt-BR e interrupção em aparelhos Android/iOS reais, em modo avião e com voz ausente; registrar dispositivos, resultados e limitações em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR, mantendo a frase visível quando não houver leitura.

US-003: código Kotlin/Swift criado e reconhecido pelo autolinking de Android/Apple.
T022 permanece pendente de compilação e validação nativa. T024 depende de aparelho.
Builds executados no GitHub em paralelo; não substituem testes reais de voz offline.

## Fase 6: US-004 — Cartões personalizados (Priority: P0, Issue #4)

**Objetivo**: criar, editar e excluir cartões com título e categoria, imagem opcional, persistência
local e mensagens acessíveis em erros de validação, picker ou gravação.

**Teste independente**: criar/editar/excluir com e sem imagem, verificar validação de título/categoria,
negação/indisponibilidade de câmera, falha de gravação e recuperação após reinício sem rede.

- [x] T025 [US-004] Adicionar testes de validação para título vazio/só espaços, categoria ausente/inexistente e preservação dos campos em `tests/features/communication/custom-cards/custom-card-validation.test.ts`.
- [x] T026 [US-004] Implementar validação e formulário de criar/editar cartão para RF-013 em `src/features/communication/custom-cards/`, exigindo título não vazio após remover espaços externos e categoria existente; erro deve identificar campo, preservar preenchimento e impedir salvar.
- [x] T027 [US-004] Adicionar testes do picker, cópia de imagem e falha de persistência em `tests/features/communication/custom-cards/custom-card-media.test.ts` e `tests/features/communication/custom-cards/custom-card-storage.test.ts`, cobrindo imagem omitida, câmera negada/indisponível e retry/cancelamento.
- [ ] T028 [US-004] Integrar `expo-image-picker` para RF-014 em `src/features/communication/custom-cards/media-picker.ts` e configuração mínima em `app.json`; selecionar arquivo ou câmera a pedido, remover permissão de microfone e permitir salvar sem imagem quando câmera falhar.
- [ ] T029 [US-004] Integrar `expo-file-system` para copiar imagem selecionada ao diretório privado persistente em `src/features/communication/custom-cards/local-image-storage.ts`; manter somente URI local no modelo e não baixar mídia remota.
- [x] T030 [US-004] Implementar RF-015/RF-016: criar, editar, excluir e persistir cartão personalizado em `src/features/communication/custom-cards/`, integrando `expo-sqlite` em `src/features/communication/storage/`; preservar edição em falha, oferecer retry/cancelamento, atualizar favoritos editados e remover cartão excluído da frase/favoritos sem alterar ordem restante.
- [ ] T031 [US-004] Revisar formulário, permissões, mensagens de erro e conteúdo de cartão com leitor de tela, ampliação, foco e contraste em Android/iOS; registrar privacidade, operação offline, evidências e limitações em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR.

## Fase 7: US-005 — Favoritos (Priority: P0, Issue #5)

**Evidência US-004 (2026-10-13)**: T025–T027 e T030 verificadas por testes
de validação, formulário, picker simulado, recuperação de falha, sessão e SQL real
via SQLite do Node 24: criar/editar, reabrir arquivo, parametrização, rollback e
exclusão em cascata. Suíte total: 76 testes, lint e typecheck aprovados.
T028/T029 implementadas e testadas com fronteiras nativas simuladas, mas aguardam
build e uso em Android/iOS. T031 continua pendente de revisão assistiva e offline
em dispositivo. Não confundir SQLite do host com validação do módulo Expo nativo.
Favoritos ainda não possuem interface; a tabela apenas prepara a integridade das
referências e sua exclusão em cascata exigida pela #4.

**Objetivo**: marcar/desmarcar qualquer cartão, acessar área própria e persistir localmente a
ordem, preservando último estado confirmado em falha.

**Teste independente**: marcar vários cartões, confirmar ordem de inclusão, desmarcar e marcar
novamente, reiniciar em modo avião; testar lista vazia e falha de gravação/retry.

- [x] T032 [US-005] Adicionar testes para marcação, desmarcação, inserção no final, ordem após desmarcar/remarcar, estado vazio e falha de persistência em `tests/features/communication/favorites/favorites.test.tsx`.
- [x] T033 [US-005] Implementar armazenamento SQLite local de cartões e favoritos com migrações, transações e restrições de `data-model.md` em `src/features/communication/storage/`; sem ORM, sincronização ou logs de conteúdo.
- [x] T034 [US-005] Implementar RF-017/RF-019: marcação, desmarcação e ordem de favoritos em `src/features/communication/favorites/`, persistindo a ordem localmente e preservando a última ordem salva se a gravação falhar.
- [x] T035 [US-005] Implementar acesso direto à área de favoritos para RF-018 e estado vazio informativo em `src/app/favorites.tsx` e `src/features/communication/favorites/`; informar falha de modo acessível e permitir tentar novamente.
- [ ] T036 [US-005] Revisar navegação, leitor de tela, foco, ordem e erros de favoritos; testar persistência após reinício offline e registrar evidências de acessibilidade, privacidade e operação local em `specs/001-comunicacao-visual-caa/quickstart.md` e no PR.

**Evidência US-005 (2026-10-13)**: T032–T035 verificadas por oito novos testes:
cinco de componentes/provider e três com SQLite real do Node 24, incluindo
reabertura, ordem, idempotência, rollback, retry e cascata. Usa a tabela versionada
da US-004, sem mudança de schema. Estado publicado somente após commit; a frase
continua volátil e favoritos editados mostram o conteúdo atual. Suíte com 84 testes
aprovados antes de incorporar US-052, lint/typecheck e Expo Doctor 21/21.
T036 permanece pendente de binário offline, TalkBack/VoiceOver e foco em aparelho.
Os testes SQLite do host e fronteiras Expo simuladas não substituem essa evidência.

## Organização por imagens — US-088 / Issue #88

- [x] T050 [US-088] Implementar RF-023: quadro na principal, frase no header e 12 ferramentas no drawer; fechar antes de navegar, preservar dados e contratos.
- [x] T051 [US-088] Testar router/composição/menu/retornos/back/erro/favoritos/edição/mode9 e conferir prévia web desktop/mobile.
- [x] T052 [US-088] Revisar UI/acessibilidade/privacidade/diff e executar checks leves/CI antes integração.
- [ ] T053 [US-088] Gate nativo posterior: leitores/foco/ampliação/insets/alvos/offline Android/iOS; prévia web/build não comprovam.

Evidência US088: 635 Jest/85 suítes completos,16 relacionados/4; lint/tipos sem warnings, Doctor21/21,56tooling,validador/diffcheck verdes. Testes da home atualizados para cartões diretos e menu exclusivo de ferramentas; regressões de rotas executam o passo real de abrir menu, sem substituir APIs ou enfraquecer contratos. Prévia real localhost:8093 mostra as duas áreas conforme imagens, compõe Sim, abre Pomodoro pelo menu e retorna preservando frase. Drawer fecha antes de navegar; fundo da home usa aria-hidden na web e propriedades nativas de acessibilidade. Desktop1280x900: documentWidth1280, cartões Sim/Não na mesma linha sem overflow; mobile390x844 e painel estreito exibem controles escaláveis/scroll sem perder funções. T053 e gates anteriores pendentes. Imagens anexadas não viraram assets; nenhum aparelho/host operado, dependência/permissão/banco nova ou áudio automático. Persistência nativa indisponível na prévia continua informada; não declarar paridade funcional web/nativa integral.

## Prévia web — US-087 / Issue #87

- [x] T047 [US-087] Reconciliar contrato web de imagens para RF-022 sem filesystem nativo ou sucesso falso.
- [x] T048 [US-087] Testar exports/indisponibilidade e abrir home real no navegador, drawer/frase/atalhos e viewport mobile/desktop; registrar limites.
- [x] T049 [US-087] Revisar diff/privacidade e executar checks leves/CI antes integração, sem build nativo/instalação.

Evidência US087: dois testes novos de contrato web, 635 Jest/85 suítes completos, lint/tipos sem warnings, Doctor21/21,56tooling,validador/diffcheck. Prévia real em localhost:8093 abriu home, drawer e compôs Sim sem acionar leitura; fechamento preservou frase e retornou foco ao menu. Viewport390x844: documentWidth390 e controles dentro dos limites. Foco web usa ref.focus(), não findNodeHandle nativo; Android/iOS mantêm implementação anterior. Cartões/favoritos salvos permanecem explicitamente indisponíveis na prévia; estados SQLite de outros módulos não equivalem a persistência web validada. Nenhum gate nativo aprovado por esta prévia. Reorganização visual posterior das imagens é Issue88, não parte desta correção.

## Home — US-085 / Issue #85

- [x] T043 [US-085] Implementar RF-021: frase no header, ações na home e Comunicação no drawer esquerdo, reutilizando contratos atuais.
- [x] T044 [US-085] Testar drawer/back/fechar/categorias/composição/retornos/editores/erro/mode9 e regressões CAA/voz/atalhos.
- [x] T045 [US-085] Revisar acessibilidade/privacidade/offline/diff e executar checks leves antes da entrega.
- [ ] T046 [US-085] Gate nativo posterior: leitores/foco real/ampliação/insets/alvos/offline em Android/iOS; mocks/build não comprovam.

Evidência US085: quatro testes novos de Expo Router/providers reais, 633 Jest/84 suítes completos, 33 relacionados/5 suítes após ajustes finais de toolbar/foco e estilos; lint/tipos sem warnings, Doctor21/21,56tooling,validador/diffcheck aprovados. Drawer sem animação, fechar fixo no topo, backdrop/back, conteúdo de fundo oculto aos leitores e tentativa de foco de abertura/retorno; contratos de composição/favoritos/edição/voz e todos os atalhos preservados. Nenhuma dependência/permissão/banco/rede nova. Prévia web não validada: erro preexistente em `local-image-storage.web.ts` sem export `createLocalImageStorage`, usado por rotinas; não alterado nesta Issue. Revisão de código sem regressão impeditiva conhecida nos testes, mas T046 e gates nativos anteriores permanecem pendentes. Nenhum celular operado.

## Identidade visual solicitada — US-052 / Issue #52

- [x] T040 [US-052] Gerar e salvar o ícone raster aprovado em `assets/branding/tear-icon.png`, registrar referência/prompt e preservar exatamente a imagem aprovada. Evidência: PNG RGB 1254x1254 copiado sem edição, aprovado expressamente pelo usuário e documentado em README.
- [x] T041 [US-052] Implementar RF-020: configurar ícone Android/iOS, favicon e tela de inicialização nativa via Expo SplashScreen, usando o asset local sem áudio, animação ou timer artificial. Evidência: teste de configuração/PNG, fonte local e padrão automático Expo Router, sem timers ou alteração da comunicação.
- [ ] T042 [US-052] Testar configuração/asset e regressões do quadro; executar checks leves, acionar build remoto e atualizar o app por USB com `adb install -r`, sem apagar dados; registrar evidências e limitações em quickstart.

## Manutenção SDK57 — US-095 / Issue #95

- [x] T054 [US-095] RF-024: atualizar só os seis patches recomendados, manifest/lock coerentes/ignore-scripts; preservar dependências funcionais/pessoais/US031 e revisar transitive churn. Evidência: install/ci ignore-scripts, 12 versões alteradas (6 diretas + 6 exigidas), nenhuma entrada adicionada/removida; xcpretty/drawer preservados.
- [x] T055 [US-095] RF-025: fontes/changelogs/version-integrity/licenças/notices exatos e contratos reais notifications(timestamp-nextdate-DAILY)/Router; sem falsa aprovação nativa ou causa histórica de crash. Evidência: fontes npm/SDK57 e licença upstream blob30b20e3b5f0f470947ba9480d90587ba07c137b4; notices integrais/regressões de contrato aprovados.
- [x] T056 [US-095] RF-026: related/fullJestserial/linttipos/Doctor21/21/56toolingvalidadordiffcheck/review e CIleve verdes sem suprimir check, PR própria antesintegração. Evidência: 50 relacionados/4 suítes, 828 Jest/96 suítes, tipos/lint, Doctor21/21, 56tooling/validadordiffcheck/review PASS; PR96 anexado, CI38609833005 SUCCESS 1min49s no head af8c04d. CI do último commit documental deve permanecer verde antes squash; Android/iOS SKIPPED, NÃO builds.
- [x] T057 [US-095] RF-027: registrar ambos nativos/artefatos/licenças/assinatura/fluxos reais pendentes no SHA integrado, sem APKantigo/installauto/hostjobsphone/buildlocal/preview/tagrelease. Evidência: plano US095 registra gate ainda PENDENTE; esta task comprova o registro, NÃO executa ou aprova build/assinatura/fluxos nativos.

## Fase 8: Polish e verificações transversais

**Objetivo**: verificar coerência entre histórias implementadas e Definition of Done, sem antecipar
funcionalidades fora das Issues.

- [ ] T037 Executar os checks leves por Issue: `npm ci`, `npx expo lint`, `npx tsc --noEmit`, `npm test -- --ci`, `npx expo-doctor` e cenários aplicáveis de `specs/001-comunicacao-visual-caa/quickstart.md`; registrar resultados reais e limitações. Builds Android/iOS e cenários dependentes de binário ficam para o gate da milestone em ambiente dedicado, conforme emenda de 2026-10-13; não executar build local automaticamente.
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

## Recuperacao JVM US-109 / Issue #109

- [x] T066 [US-109] RF-032: fixar installer oficial Temurin21.0.12.1+1/checksum, preservar JDK17/global e recusar sobrescrita. Evidencia: checksum oficial aprovado pelo installer remoto, java-version21.0.12.1+1 confirmado; JDK17 preservado.
- [x] T067 [US-109] RF-033: wrapper dedicado usa JDK21 preservando main/SHA/flock/conta/memoria/diagnosticos/contrato artifact. Evidencia: diff de uma linha no wrapper, contratos/sintaxe/rejeicao de comandos passaram; compilacao remota permanece em T069.
- [x] T068 [US-109] RF-034: testes de contrato/sintaxe/checks leves/review/CI e implantacao com hash/mode conferidos, sem secrets/logs brutos. Evidencia: 56 tooling/1023 Jest111/lint/tipos/Doctor21-21/validador289tasks/diff/review PASS; CI38737703211 no head c363bb8 SUCCESS. Wrapper remoto f695ee8d849dfb3e513b9e076fb3ad110c7848fb95e25a634f0f31af2b1c5ca5 root:root755, Java21 como tear-build confirmado, copia anterior retida. CI do ultimo commit documental deve ser reconferido antes merge; build T069 ainda pendente.
- [x] T069 [US-109] RF-035: build manual both/SSH na main integrada, artefatos/digests/CRC/notices/assinatura verificados; nao aprovar causa raiz, host integro ou gates assistivos/offline. Evidencia: run38743232948 main8578702a08db79cec2af378814af065540fbeaf1 quality/AndroidSSH/iOSSUCCESS; check-native-build PASS. ZIPs oficiais/ranges206/ContentRange/tamanhos/CRC/entradas/notices exatos6arquivos PASS; APK b5cea4e0000f74df0d7e1ae679562f41087817d708380b7d5e853c76def9712d, assinatura v2 valida e certificado igual ao instalado. iOS somente simulador unsigned. Registro documental posterior nao e outro build.

## Correção de comandos desmontados US003

- [x] T064 [US-003] RF-009/RF-011: reproduzir stop/read antigos após desmontagem e impedir efeitos antes de activate, mantendo cleanup normal, tokens e retry, sem política nova de blur/background. Evidência: dois RED reproduzidos (stop extra e pause de som indevida), três testes novos PASS incluindo StrictMode e integração com controlador de som real/engine sintético.
- [x] T065 [US-003] Validar componentes e integração com guarda/controlador de som, engine/TTS sintéticos, StrictMode e regressões; relacionados/fullserial/lint/tipos/Doctor/tooling/validador/review/CI, mantendo T022/T024 nativos pendentes. Evidência: PR106 anexado, CI38654075840 SUCCESS2min28s no head980c3696e60ae742b2275d83b170245c7ff2f6af; conferir último commit documental antes squash e main push após integração.

Evidência local #3 (2026-10-14):112 relacionados/11 suítes PASS,962Jest/105
PASS141.327s, lint/tipos sem warnings, Doctor21/21,56toolingPASS4.730s,
validador/diffcheck/reviewPASS. Primeiro CI do PR106 aprovado; último head
documental/main push ainda não comprovados. T022/T024 nativos intactos.
Sem áudio físico/host/buildlocal/phone/preview/tag/release.

## Correção de controle US004

- [x] T062 [US-004] Reproduzir callbacks antigos e exclusão revogada; proteger editor por foco/ID/intenção, descartando feedback/navegação tardios sem cancelar persistência já autorizada (RF-013–RF-016). Evidência: três testes RED antes da correção, 15 testes do editor PASS e quatro testes Router/provider/SQLiteNode real PASS, incluindo commit retido após saída e confirmação revogada sem SQL.
- [x] T063 [US-004] Validar componentes e Router/provider/SQLiteNode com commit retido, frase/favoritos e regressões rotinas; testes/lint/tipos/checks leves/review/CI, mantendo T028/T029/T031 nativos pendentes. Evidência: PR105 anexado, CI38649085153 SUCCESS2min12s no head ac8b297aaf7e39aefcf0f31d5c0bc3d7642f07a9, todos checks leves verdes. Reconferir CI do último commit documental antes integração.

Evidência local da correção #4 (2026-10-14): 13 testes novos (9 componentes,
4 Router/SQLiteNode), 55 relacionados/9 suítes PASS; suíte completa 959/105 PASS
141.970s, lint/tipos sem warnings, Doctor21/21, 56 tooling PASS4.893s,
validador/diffcheck e revisão PASS. CI do PR105 aprovado no head ac8b297;
CI documental final e main push devem ser reconferidos, sem afirmar resultado futuro.
T028/T029/T031 continuam nativas pendentes, sem build/preview/aparelho/host.

## Manutenção US097 — CI leve serial

- [x] T058 [US-097] RF-028: CI Tests usa --ci --runInBand, mesmos testes/asserts/timeouts/gates, sem retry/exclusões. Evidência: diff de uma linha no workflow, suíte completa829/97 e relacionados30/3 PASS com mesmos limites.
- [x] T059 [US-097] RF-029: teste de contrato YAML protege comando serial/lint/typecheck/Doctor; docs/Ready antes código. Evidência: serial-ci.test.ts aprovado/propagação de falhas preservada; refino/check-issue97/docsabe07df precedem código.
- [x] T060 [US-097] RF-030: related/fullserial/linttipos/Doctor21/21/56toolingvalidadordiffreview/CI latesthead verdes; mainpush observado, nenhuma falha ocultada. Evidência:30relacionados3/829Jest97/Doctor21/21/56tooling/tiposlintvalidadordiffreview PASS; PR98 anexado/CI38612269263SUCCESS2min15s no head d3166b9. Main95run38610475617FAIL observado e mantido; reconferir CI do último commit documental antes squash e novo mainpush após integração, sem afirmar sucesso ainda.
- [x] T061 [US-097] RF-031: registrar run main95 FAIL e pendências nativas/artefatos/aparelho/audit, sem host/nativejob/buildlocal/phone/preview/tag/cancelretry. Evidência: plano e Issue97 mantêm run38610475617FAIL e hipótese explícita; registro NÃO aprova build/assinatura/offline/assistivo.
