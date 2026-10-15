# Tasks — Histórico e Autoconhecimento

Milestone #24: [spec.md](spec.md) e [plan.md](plan.md). US-038 em implementação; #39/#40 continuam pendentes.

US-038 usa os caminhos reais do plano atualizado; #39/#40 mantêm propostas, sem implementação autorizada. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P]: alterações de UI/contratos são verificadas em sequência para evitar conflito entre histórias.

## US-038 — Issue #38

Refinamento autorizado: spec e Issue #38 em 2026-10-15. Evidências locais abaixo;
T020 permanece pendente e não é substituída por testes automatizados.

- [x] T016 [US-038] Implementar modelo/snapshot mínimo validado e SQLite schema 1 local, FIFO/transação, ID idempotente, leitura ordenada e retry sem alterar bancos das origens.
- [x] T017 [US-038] Integrar opt-in no resumo não vazio do check-in e rotina concluída, sem coleta automática; bloquear duplicação/stale callbacks e descartar feedback tardio preservando commit autorizado.
- [x] T018 [US-038] Integrar rota/lista de Ferramentas, consulta por foco, filtros, vazio/carregando/erro/retry e retorno sem dados em parâmetros; preservar mode9.
- [x] T019 [US-038] Testar SQLite Node real, reabertura/rollback/idempotência/ordem e controles/Router com dados sintéticos, inclusive saída durante operação e regressões nas origens.
- [ ] T020 [US-038] Verificar em aparelho SQLite Expo/offline/reabertura, leitores, foco, ampliação, alvos/insets e fluxo completo. Não aprovar por mocks, SQLite Node, web ou binário apenas compilado.

- [x] T001 [US-038] Em `src/features/history/history-database.ts` e `HistoryScreen.tsx`, atender RF-001 (critério 1 de #38): O histórico deve apresentar registros em ordem cronológica. Verificar com o cenário correspondente no PR.
- [x] T002 [US-038] Em `src/features/history/HistoryScreen.tsx`, atender RF-002 (critério 2 de #38): O usuário deve conseguir filtrar por tipo de registro. Verificar com o cenário correspondente no PR.
- [x] T003 [US-038] Em `src/features/history/HistoryScreen.tsx`, atender RF-003 (critério 3 de #38): A apresentação não deve inferir diagnóstico ou causa clínica. Verificar com o cenário correspondente no PR.
- [x] T004 [US-038] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/history/`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [x] T005 [US-038] Revisar RNF-001 a RNF-004 na interface/dados de #38, executar verificações locais aplicáveis e registrar evidências; verificações reais em aparelho permanecem T020.

### Evidências US-038 em 2026-10-15

- 33 testes novos/4 suítes em `tests/features/history`: DTOs inválidos, parâmetros SQL,
  snapshots mínimos, reabertura SQLite Node, ordem/empates, rollback/retry/idempotência,
  filtros/vazios/erros, StrictMode, comandos stale, blur/refocus e commit autorizado.
- Router com CheckInForm/RoutinePlayer, providers reais e SQLite Node confirma opt-in,
  zero abertura por conclusão, perguntas puladas ausentes, snapshots independentes,
  Ferramentas/retorno/mode9 e nenhuma resposta em parâmetros ou rede.
- Suíte completa serial: 995 testes/109 suítes PASS (91.340s). Lint sem warnings,
  typecheck, Doctor 21/21 e 56 testes tooling (2.086s) PASS.
- Revisão local RNF-001: SafeAreaView, ScrollView, texto flexível, filtros radio com
  nome/checked, alvos >=48dp, estados acessíveis, tipografia >=16 e cores legíveis;
  leitores, foco real, contraste renderizado e ampliação ainda exigem T020.
- RNF-002/004: sem rede, conta, dependências/permissões novas, logs pessoais ou inferência;
  SQLite no sandbox sem promessa de criptografia adicional/backup do OS. RNF-003:
  falhas genéricas, preservação de commits, retry e vazios testados.
- Sem build local, binário novo, teste em aparelho ou release nesta evidência.

## US-039 — Issue #39

- [ ] T006 [US-039] Em `src/features/history/trends`, atender RF-004 (critério 1 de #39): As tendências devem usar apenas dados registrados pelo próprio usuário. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-039] Em `src/features/history/trends`, atender RF-005 (critério 2 de #39): O aplicativo deve diferenciar claramente contagem/tendência de interpretação clínica. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-039] Em `src/features/history/trends`, atender RF-006 (critério 3 de #39): O usuário deve poder escolher o período analisado. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-039] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/history/trends`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-039] Revisar RNF-001 a RNF-004 na interface/dados de #39, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-040 — Issue #40

- [ ] T011 [US-040] Em `src/features/history/record-deletion`, atender RF-007 (critério 1 de #40): Deve ser possível excluir um registro individual. Verificar com o cenário correspondente no PR.
- [ ] T012 [US-040] Em `src/features/history/record-deletion`, atender RF-008 (critério 2 de #40): Deve existir opção para excluir todo o histórico mediante confirmação explícita. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-040] Em `src/features/history/record-deletion`, atender RF-009 (critério 3 de #40): A exclusão deve atualizar imediatamente as visualizações derivadas. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-040] Adicionar testes de comportamento de RF-007, RF-008, RF-009 em `tests/features/history/record-deletion`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T015 [US-040] Revisar RNF-001 a RNF-004 na interface/dados de #40, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
