# Tasks — Check-in Corporal e Sensorial

Milestone #16: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-021 — Issue #21

- [ ] T001 [US-021] Em `src/features/sensory-check-in/check-in-form`, atender RF-001 (critério 1 de #21): O check-in deve abordar itens como sede, fome, dor, cansaço, ruído, luz, temperatura e necessidade de ficar sozinho. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-021] Em `src/features/sensory-check-in/check-in-form`, atender RF-002 (critério 2 de #21): As respostas devem utilizar controles simples e objetivos. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-021] Em `src/features/sensory-check-in/check-in-form`, atender RF-003 (critério 3 de #21): O usuário deve poder pular perguntas. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-021] Em `src/features/sensory-check-in/check-in-form`, atender RF-004 (critério 4 de #21): O aplicativo não deve apresentar o resultado como diagnóstico. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-021] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/sensory-check-in/check-in-form`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-021] Revisar RNF-001 a RNF-004 na interface/dados de #21, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-022 — Issue #22

- [ ] T007 [US-022] Em `src/features/sensory-check-in/check-in-summary`, atender RF-005 (critério 1 de #22): O resumo deve mostrar apenas as respostas fornecidas. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-022] Em `src/features/sensory-check-in/check-in-summary`, atender RF-006 (critério 2 de #22): Sugestões devem ser apresentadas como possibilidades, não como prescrição clínica. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-022] Em `src/features/sensory-check-in/check-in-summary`, atender RF-007 (critério 3 de #22): O usuário deve poder acessar diretamente ferramentas relacionadas, como água, regulação ou contato de apoio. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-022] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/sensory-check-in/check-in-summary`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-022] Revisar RNF-001 a RNF-004 na interface/dados de #22, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
