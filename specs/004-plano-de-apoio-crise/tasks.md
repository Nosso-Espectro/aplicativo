# Tasks — Plano de Apoio / Crise

Milestone #12: [spec.md](spec.md) e [plan.md](plan.md). Progresso US-011 marcado após verificações; revisões nativas/assistivas pendentes no gate. #12/#13 ainda não implementadas.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-011 — Issue #11

- [x] T001 [US-011] RF-001: `SupportPlanScreen.tsx` permite texto livre opcional e checkboxes de orientações, inicialmente vazios, gravação explícita. Componentes/rotas verificam abrir, editar, cancelar e reabrir.
- [x] T002 [US-011] RF-002: `support-plan.ts` e editor disponibilizam Não me toque, Fale pouco, Preciso de silêncio e Dê-me tempo para responder, sem escolha ou inferência automática; modelo e componentes verificam os exemplos originais.
- [x] T003 [US-011] RF-003: editar/limpar texto e escolhas, remover plano com confirmação, cancelar, preservar draft/confirmado em falha e retry. Referências usam dados atuais, sem snapshot ou alteração do perfil; resultados obsoletos descartados e duplicatas bloqueadas, testes aprovados.
- [x] T004 [US-011] RF-004: `support-plan-database.ts` usa SQLite privado versão1, singleton de texto e IDs separados, fila/transação parametrizada/rollback e publicação após commit. Reabertura, falha parcial/commit, isolamento e schema futuro verificados no SQLite real do Node.
- [x] T005 [US-011] 27 testes específicos em `tests/features/support-plan/`: seis de modelo, oito de banco, onze de componentes e duas rotas, usando fixtures sintéticas. Cobrem RF-001–RF-004, vazio/erro/retry/cancelamento/reabertura e integração com o contrato atual do perfil.
- [ ] T006 [US-011] Revisar RNF-001 a RNF-004 na interface/dados de #11, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

T006: revisão estática de contraste, rótulos e estado dos checkboxes, alvos48dp,
texto escalável, scroll/teclado e feedback acessível realizada. Sem novas
dependências/permissões, rede, log pessoal, mídia inesperada ou inferência clínica.
TalkBack/VoiceOver, foco real/ampliação/teclado, reabertura offline SQLite Expo e
política de backups do sistema ainda pendentes no gate. Mocks/SQLite do host não
comprovam essas verificações em aparelho.

## US-012 — Issue #12

- [ ] T007 [US-012] Em `src/features/support-plan/support-card`, atender RF-005 (critério 1 de #12): Deve existir uma visualização em tela cheia. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-012] Em `src/features/support-plan/support-card`, atender RF-006 (critério 2 de #12): A visualização deve priorizar texto grande e alto contraste. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-012] Em `src/features/support-plan/support-card`, atender RF-007 (critério 3 de #12): Deve haver acesso direto a partir do painel de regulação. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-012] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/support-plan/support-card`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-012] Revisar RNF-001 a RNF-004 na interface/dados de #12, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-013 — Issue #13

Ready registrada na Issue, spec e plano. Base inicial `trusted-contact.ts` e
cinco testes de validação/URI aprovados; UI, SQLite, revisão antes de handoff,
disponibilidade e abertura ainda pendentes. Nenhuma task abaixo concluída pelo
modelo isolado. #12 continua aberta pela dependência real de #10.

- [ ] T012 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-008 (critério 1 de #13): O usuário deve poder cadastrar um contato e uma mensagem padrão. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-009 (critério 2 de #13): Ao acionar o recurso, o aplicativo deve abrir o WhatsApp ou mecanismo compatível com a mensagem preenchida. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-010 (critério 3 de #13): O envio final deve permanecer sob controle do usuário. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-011 (critério 4 de #13): Se o WhatsApp não estiver disponível, o aplicativo deve informar isso sem falhar. Verificar com o cenário correspondente no PR.
- [ ] T016 [US-013] Adicionar testes de comportamento de RF-008, RF-009, RF-010, RF-011 em `tests/features/support-plan/trusted-contact`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T017 [US-013] Revisar RNF-001 a RNF-004 na interface/dados de #13, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
