# Tasks — Divisor de Tarefas

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

- [ ] T007 [US-020] Em `src/features/task-breakdown/task-templates`, atender RF-005 (critério 1 de #20): Uma tarefa existente deve poder ser salva como modelo. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-020] Em `src/features/task-breakdown/task-templates`, atender RF-006 (critério 2 de #20): O usuário deve poder criar nova tarefa a partir do modelo. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-020] Em `src/features/task-breakdown/task-templates`, atender RF-007 (critério 3 de #20): Editar uma cópia criada do modelo não deve alterar o modelo original. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-020] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/task-breakdown/task-templates`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-020] Revisar RNF-001 a RNF-004 na interface/dados de #20, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
- [ ] T013 [US-020] Implementar modelos pessoais editáveis/removíveis com confirmação, drafts/save/cancel e revisões; cópias independentes com todas etapas não concluídas, preservando tarefas/modelos já existentes. Verificar migração schema1→2/rollback/offline/reabertura/isolamento/erro/retry/duplicatas e navegação real.
- [ ] T014 [US-020] Gate nativo/assistivo: SQLite Expo/migração/offline/backups/TalkBack/VoiceOver/foco/ampliação/teclado/insets/alvos48dp e retorno. Mocks/SQLite Node não comprovam esses resultados; builds somente remotos quando host/lock conferidos.
