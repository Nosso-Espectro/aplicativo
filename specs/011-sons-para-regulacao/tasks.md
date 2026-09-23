# Tasks — Sons para Regulação

Milestone #19: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-027 — Issue #27

- [ ] T001 [US-027] Em `src/features/regulation-sounds/sound-player`, atender RF-001 (critério 1 de #27): Deve haver ao menos quatro opções iniciais de som. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-027] Em `src/features/regulation-sounds/sound-player`, atender RF-002 (critério 2 de #27): O usuário deve poder iniciar, pausar e ajustar volume. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-027] Em `src/features/regulation-sounds/sound-player`, atender RF-003 (critério 3 de #27): Os sons essenciais devem funcionar offline. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-027] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/regulation-sounds/sound-player`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-027] Revisar RNF-001 a RNF-004 na interface/dados de #27, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-028 — Issue #28

- [ ] T006 [US-028] Em `src/features/regulation-sounds/sound-timer`, atender RF-004 (critério 1 de #28): Deve ser possível definir uma duração. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-028] Em `src/features/regulation-sounds/sound-timer`, atender RF-005 (critério 2 de #28): Ao final, a reprodução deve ser encerrada de forma previsível. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-028] Em `src/features/regulation-sounds/sound-timer`, atender RF-006 (critério 3 de #28): O usuário deve poder cancelar o temporizador sem interromper imediatamente o áudio, se desejar. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-028] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/regulation-sounds/sound-timer`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-028] Revisar RNF-001 a RNF-004 na interface/dados de #28, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
