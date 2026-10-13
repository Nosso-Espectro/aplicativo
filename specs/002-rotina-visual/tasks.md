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

- [ ] T012 [US-008] Em `src/features/routines/routine-player`, atender RF-008 (critério 1 de #8): Durante a execução devem existir indicações claras de Agora e Depois. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-008] Em `src/features/routines/routine-player`, atender RF-009 (critério 2 de #8): Ao concluir a etapa atual, a próxima deve assumir o estado de Agora. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-008] Em `src/features/routines/routine-player`, atender RF-010 (critério 3 de #8): O usuário deve poder voltar para uma etapa anterior quando necessário. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-008] Em `src/features/routines/routine-player`, atender RF-011 (critério 4 de #8): O progresso deve permanecer salvo caso o aplicativo seja fechado. Verificar com o cenário correspondente no PR.
- [ ] T016 [US-008] Adicionar testes de comportamento de RF-008, RF-009, RF-010, RF-011 em `tests/features/routines/routine-player`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T017 [US-008] Revisar RNF-001 a RNF-004 na interface/dados de #8, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
