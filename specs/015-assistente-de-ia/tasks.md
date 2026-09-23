# Tasks — Assistente de IA

Milestone #23: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

Ordem interna recomendada: US-037 (limites), depois US-035 e US-036. IDs preservam rastreabilidade, não impõem ordem de execução.

## US-035 — Issue #35

- [ ] T001 [US-035] Em `src/features/assistant/task-suggestions`, atender RF-001 (critério 1 de #35): O usuário deve fornecer a tarefa em texto. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-035] Em `src/features/assistant/task-suggestions`, atender RF-002 (critério 2 de #35): A resposta deve retornar uma sequência editável de etapas. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-035] Em `src/features/assistant/task-suggestions`, atender RF-003 (critério 3 de #35): O usuário deve confirmar antes de salvar as etapas como tarefa. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-035] Em `src/features/assistant/task-suggestions`, atender RF-004 (critério 4 de #35): O recurso deve informar que a saída pode conter erros e deve ser revisada. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-035] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/assistant/task-suggestions`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-035] Revisar RNF-001 a RNF-004 na interface/dados de #35, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-036 — Issue #36

- [ ] T007 [US-036] Em `src/features/assistant/message-rewrite`, atender RF-005 (critério 1 de #36): O usuário deve escolher entre ações como simplificar, tornar mais direto ou organizar em tópicos. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-036] Em `src/features/assistant/message-rewrite`, atender RF-006 (critério 2 de #36): O texto original não deve ser substituído sem confirmação. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-036] Em `src/features/assistant/message-rewrite`, atender RF-007 (critério 3 de #36): O usuário deve poder copiar ou salvar a versão resultante. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-036] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/assistant/message-rewrite`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-036] Revisar RNF-001 a RNF-004 na interface/dados de #36, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-037 — Issue #37

- [ ] T012 [US-037] Em `src/features/assistant/assistant-boundaries`, atender RF-008 (critério 1 de #37): O assistente não deve se apresentar como profissional de saúde. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-037] Em `src/features/assistant/assistant-boundaries`, atender RF-009 (critério 2 de #37): Pedidos de diagnóstico devem receber orientação de limite e busca de avaliação profissional apropriada. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-037] Em `src/features/assistant/assistant-boundaries`, atender RF-010 (critério 3 de #37): O produto deve informar quando conteúdo for gerado por IA. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-037] Em `src/features/assistant/assistant-boundaries`, atender RF-011 (critério 4 de #37): Dados enviados ao serviço devem ser minimizados e a política de privacidade deve ser acessível. Verificar com o cenário correspondente no PR.
- [ ] T016 [US-037] Adicionar testes de comportamento de RF-008, RF-009, RF-010, RF-011 em `tests/features/assistant/assistant-boundaries`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T017 [US-037] Revisar RNF-001 a RNF-004 na interface/dados de #37, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
