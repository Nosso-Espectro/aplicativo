# Tasks — Scripts de Comunicação

Milestone #17: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-023 — Issue #23

- [ ] T001 [US-023] Em `src/features/communication-scripts/script-catalog`, atender RF-001 (critério 1 de #23): Devem existir scripts iniciais para pedir ajuda, pedir mais tempo, pedir esclarecimento, encerrar conversa e informar sobrecarga. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-023] Em `src/features/communication-scripts/script-catalog`, atender RF-002 (critério 2 de #23): Os scripts devem ser organizados por categoria. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-023] Em `src/features/communication-scripts/script-catalog`, atender RF-003 (critério 3 de #23): O usuário deve conseguir copiar um script com um toque. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-023] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/communication-scripts/script-catalog`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-023] Revisar RNF-001 a RNF-004 na interface/dados de #23, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-024 — Issue #24

- [ ] T006 [US-024] Em `src/features/communication-scripts/script-editor`, atender RF-004 (critério 1 de #24): Deve ser possível criar, editar, excluir e favoritar scripts. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-024] Em `src/features/communication-scripts/script-editor`, atender RF-005 (critério 2 de #24): Os scripts personalizados devem ficar salvos localmente. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-024] Em `src/features/communication-scripts/script-editor`, atender RF-006 (critério 3 de #24): O usuário deve poder usar um script no Text-to-Speech. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-024] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/communication-scripts/script-editor`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-024] Revisar RNF-001 a RNF-004 na interface/dados de #24, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
