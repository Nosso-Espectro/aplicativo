# Tasks — Divisor de Tarefas

## US-076 — Issue #76

Ready após refino sob delegação e spec/plan alinhados, sem código76. #19/#20 integradas; T012/T014 nativos anteriores preservados.

- [ ] T015 [US-076] RF-008: catálogo editorial original local validado/completo/read-only/snapshots congelados/proveniência e isolamento de templates pessoais.
- [ ] T016 [US-076] RF-009: cópia para draft do editor existente/IDsnovos/statusfalse/apenasaçãohumana/editarcancelar sem escrita automática, foco/blur/unmount/oldcallbacks.
- [ ] T017 [US-076] RF-010: entrada Modelos/rotas/fallback/back/mode9/escalável/48dp, saveDAOreal/commit/pending/erroretry/semfalsosucesso/indisponívelcorrupto-banco.
- [ ] T018 [US-076] Testes modelo/Router/provider/SQLiteNode de conteúdo/completude/cópias/primeiraabertura/offline/savecancel/pendingdups/rollbackretry/blurunmount/stale/isolamento19-20/regressõesCAA/Timer.
- [ ] T019 [US-076] Review RF/RNF/UIprivacyofflineclean, related/fullserial/linttiposDoctor56toolingvalidadordiffreview/CI últimohead antesintegração; tasks sócomportamento comprovado.
- [ ] T020 [US-076] Gate real SHA integrado SQLiteExpo/offline/backups/readers/teclado/foco/ampliação/insets/alvos/backgestos; mocks/SQLiteNode/CIleve não aprovam nativo ou autorizam aparelho/buildlocal.

Milestone #15: [spec.md](spec.md) e [plan.md](plan.md). US-019 integrada/PR75, Issue fechada. US-020 Ready após aprovação humana; tasks ainda pendentes. Catálogo pronto na #76 fora desta branch. Gates nativos não são substituídos pelos testes locais.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-019 — Issue #19

- [x] T001 [US-019] RF-001: TaskEditor/tasks/new permite criar principal com título obrigatório e tarefa vazia válida; task-navigation verifica entrada real pelo quadro e persistência.
- [x] T002 [US-019] RF-002: TaskEditor adiciona/edita/ordena/remove etapas confirmadas, preservando IDs/status; task-editor/model/database/navigation verificam draft, cancelamento e persistência.
- [x] T003 [US-019] RF-003: TaskDetail oferece checkbox reversível; provider/database publicam somente após commit. Testes navigation verificam pending/duplicatas/rollback sem sucesso prematuro.
- [x] T004 [US-019] RF-004: task-database.ts schema1 privado/fila/transação/readback/revisão/rollback/future-schema; testes SQLite Node verificam reabertura offline, isolamento e stale removido.
- [x] T005 [US-019] 30 testes relacionados/4 suítes cobrem RF-001–RF-004 com fixtures sintéticas, fluxo real de rotas e erros/vazio/retry/cancelamento.
- [x] T006 [US-019] Revisão local RNF-001–RNF-004 registrada no plan.md: alvos48dp/texto/contraste/controle/sem rede-permissão-dependência nova, armazenamento isolado e modo9 preservado. Gate nativo T012 permanece aberto.
- [ ] T012 [US-019] No gate da milestone verificar SQLite Expo/offline/backups e dispositivo/assistivo: TalkBack/VoiceOver/foco/ampliação/teclado/insets/scroll/alvos48dp/retorno e controles de progresso/confirmar remoção. SQLite Node e mocks não comprovam esses resultados.

## US-020 — Issue #20

- [x] T007 [US-020] RF-005: Salvar como modelo no TaskDetail real, somente tarefa confirmada/revisão dentro da transação; testes modelo/banco/provider/navigation.
- [x] T008 [US-020] RF-006: TemplateDetail cria tarefa da versão salva, freshIDs/boolfalse e ID exato depois commit; testes copy/pending/duplicata/reabertura/offline/vazio.
- [x] T009 [US-020] RF-007: Cópia independente, editar/remover modelo não modifica instâncias nem progresso; teste real SQLite/rotas/copy edit.
- [x] T010 [US-020] Testes de RF-005/RF-006/RF-007 com fixtures sintéticas, erro/vazio/retry/rollback/stale/commit/lifecycle/lowmode e regressões19.
- [x] T011 [US-020] RNF-001–RNF-004 revisados localmente conforme plan.md; controls48dp/escalável/contraste/sem estímulos/rede/permissão/dep/PII em rotas. Gate T014 separado, nenhuma validação assistiva nativa presumida.
- [x] T013 [US-020] Modelos pessoais editáveis/removíveis com confirmação e drafts/revisão; migração schema1→2 preserva tarefas, instâncias independentes e navegação real; testes SQLiteNode/provider/UI.
- [ ] T014 [US-020] Gate nativo/assistivo: SQLite Expo/migração/offline/backups/TalkBack/VoiceOver/foco/ampliação/teclado/insets/alvos48dp e retorno. Mocks/SQLite Node não comprovam esses resultados; builds somente remotos quando host/lock conferidos.
