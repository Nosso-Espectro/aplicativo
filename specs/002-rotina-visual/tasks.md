# Tasks — Rotina Visual

Milestone #10: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-006 — Issue #6

- [x] T001 [US-006] Em `src/features/routines/RoutineEditor.tsx`, atender RF-001 (critério 1 de #6): Deve ser possível criar uma rotina com nome. Evidência: validação e gravação de rotina nomeada vazia verificadas em componentes e SQLite.
- [x] T002 [US-006] Em `src/features/routines/RoutineEditor.tsx`, atender RF-002 (critério 2 de #6): Cada etapa deve aceitar título e imagem opcional. Evidência: imagem omitida, seleção/cancelamento/negação simulados e cópia privada testados; permissões reais em T006.
- [x] T003 [US-006] Em `src/features/routines/RoutineEditor.tsx`, atender RF-003 (critério 3 de #6): O usuário deve poder adicionar, editar e remover etapas. Evidência: edição, confirmação de remoção e IDs estáveis verificados.
- [x] T004 [US-006] Em `src/features/routines/routine-database.ts`, atender RF-004 (critério 4 de #6): A rotina deve ficar disponível offline após ser salva. Evidência: SQLite real do Node 24, reabertura, SQL parametrizado e rollback, sem rede. Binário Expo offline em T006.
- [x] T005 [US-006] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/routines/`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais. Evidência: 15 testes de rotina e uma regressão de isolamento de imagens; suíte total 101 testes/19 suítes aprovada.
- [ ] T006 [US-006] Revisar RNF-001 a RNF-004 na interface/dados de #6, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

Revisão estática de rótulos, foco de campo inválido, texto escalável, alvos de 48dp,
contraste, controle de mídia, mensagens sanitizadas e persistência local realizada.
Lint/typecheck, 47 testes de tooling e validador estrutural passaram. T006 mantém
pendentes revisão assistiva, permissões, reinício offline e imagens no aparelho.
Ver [quickstart](quickstart.md). Não confundir mocks/SQLite do host com Expo nativo.

## US-007 — Issue #7

- [x] T007 [US-007] Em `src/features/routines/step-order.ts` e `RoutineEditor.tsx`, atender RF-005 (critério 1 de #7): Deve ser possível alterar a ordem das etapas. Evidência: subir/descer, limites, cancelamento, feedback e listas vazias/unitárias testados.
- [x] T008 [US-007] Em `src/features/routines/routine-database.ts`, atender RF-006 (critério 2 de #7): A nova ordem deve ser persistida. Evidência: transação, reabertura e rollback/retry em SQLite real do Node 24.
- [x] T009 [US-007] Em `src/features/routines/routine-database.ts`, atender RF-007 (critério 3 de #7): A reordenação não deve apagar o status ou conteúdo das etapas. Evidência: migração v1→v2, IDs, imagens/títulos e completed por ID preservados mesmo com rascunho obsoleto; schema futuro não é rebaixado.
- [x] T010 [US-007] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/routines/step-order.test.ts` e testes de banco/editor; cobrir fluxo principal, ausência de dados e erros pertinentes, sem dados pessoais reais. Evidência: dez cenários novos, 111 testes/20 suítes aprovados.
- [ ] T011 [US-007] Revisar RNF-001 a RNF-004 na interface/dados de #7, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

T011: revisão estática de rótulos, alvos 48dp, estados desabilitados, feedback sem
fala/animação automática, texto escalável e privacidade realizada. Sem novas
dependências/permissões/rede. TalkBack/VoiceOver, foco após mover e persistência
offline no binário ainda pendentes; testes do host não substituem essas evidências.

## US-008 — Issue #8

- [x] T012 [US-008] Em `src/features/routines/RoutinePlayer.tsx`, atender RF-008: indicações claras de Agora e Depois, somente duas etapas pendentes, verificadas por testes de componentes/lógica.
- [x] T013 [US-008] Em `src/features/routines/routine-database.ts`, atender RF-009: concluir persiste antes de avançar; testes cobrem ausência de sucesso otimista, duplicatas e falha/rollback/retry.
- [x] T014 [US-008] Em `src/features/routines/RoutinePlayer.tsx` e banco, atender RF-010: voltar reabre a anterior e as posteriores, inclusive após terminar; limite inicial desabilitado e fim/reinício explícitos testados.
- [x] T015 [US-008] Em banco/provider, atender RF-011: progresso retomado após reabertura do SQLite real e nova sessão do provider, sem cursor órfão após edição/remoção.
- [x] T016 [US-008] Adicionar testes em `tests/features/routines/routine-player.test.tsx`, `routine-execution.test.ts` e banco: seis componentes, três lógica e quatro SQLite real; suíte total de 124 testes/22 suítes aprovada.
- [ ] T017 [US-008] Revisar RNF-001 a RNF-004 na interface/dados de #8, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

T017: revisão estática de contraste, nomes, texto escalável, alvos 48dp, estados
vazios/erros e nenhuma transmissão de conteúdo realizada. Leitor de tela, foco,
offline e interrupção/reabertura do binário permanecem pendentes. Nenhum build local.

## Correção de ciclo de vida — US-006 / Issue #6

- [x] T018 [US-006] Reproduzir commit pendente/desmontagem e proteger comandos/continuações do editor por owner de montagem/foco; preservar commit autorizado, save/retry atual e contratos de reordenação, sem novo schema/dependências/permissões. Evidência: teste falhou antes da correção por back tardio; oito regressões novas PASS, incluindo dois fluxos Router/provider/SQLiteNode real com commit retido.
- [x] T019 [US-006] Testar sucesso/falha tardios, blur/retorno/callbacks antigos/StrictMode; revisar UI/privacidade/diff e executar related/full Jest serial, lint/tipos/Doctor/tooling/validador e CI do último head antes integração. Evidência: oito regressões novas, 934 Jest/104 suítes PASS, lint/tipos sem warnings, Doctor21/21, 56 tooling/validador/diff/review PASS. PR103 anexado; CI38639608287 SUCCESS 2min10s no head6f5921c. Último commit documental deve manter CI verde antes squash. Não fecha #6 nem marca T006/T011/T017 nativos.

## Correção do player — US-008 / Issue #8

- [ ] T020 [US-008] Reproduzir ações após descarte e confirmação revogada; proteger owner de foco/montagem/rotina e intenção de reinício/cancelamento/retry, preservando commits autorizados e guardas transacionais existentes.
- [ ] T021 [US-008] Testar componentes/Router/provider/SQLiteNode real/StrictMode, blur/retorno/ações antigas/falhas/commit/rollback e regressões #6/#7/CAA/timers; revisar UI/privacidade/diff e checks leves/CI último head antes merge. Não fechar #8 ou aprovar T017 nativa.
