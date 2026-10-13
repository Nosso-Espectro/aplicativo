# Tasks — Plano de Apoio / Crise

Milestone #12: [spec.md](spec.md) e [plan.md](plan.md). Progresso US-011/US-013 marcado após verificações; revisões nativas/assistivas pendentes no gate. #12 ainda não implementada.

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

Ready registrada na Issue, spec e plano; #12 continua aberta pela dependência real de #10.

- [x] T012 [US-013] RF-008: `TrustedContactScreen.tsx` e SQLite privado versão1 configuram nome opcional, telefone internacional e mensagem livres; salvar/cancelar/editar, remoção confirmada (inclusive limpar todos os campos), validação, reabertura e rollback testados, preservando plano/perfil.
- [x] T013 [US-013] RF-009: `whatsapp-handoff.ts` usa Linking para disponibilidade e link oficial preenchido/codificado após revisão e confirmação explícitas. Queries mínimas Android/iOS configuradas; API testada com mocks Android/iOS, abertura nativa real ainda T017.
- [x] T014 [US-013] RF-010: salvar/carregar/navegar/revisar/cancelar não abrem app externo; apenas confirmação encaminha telefone/mensagem salvos, sem nome/perfil/plano. Alterar draft invalida revisão; envio final permanece externo e sucesso não afirma entrega, testes aprovados.
- [x] T015 [US-013] RF-011: ausência, falha de disponibilidade/abertura, rejeição inesperada e prévia web produzem feedback genérico, conservando contato/mensagem e permitindo retry/cancelar explícitos, sem fallback/envio/retry automáticos ou logs pessoais.
- [x] T016 [US-013] 40 testes específicos: cinco modelo, oito SQLite real do Node, quinze componentes, sete Linking, duas rotas e três de queries nativas. Fixtures sintéticas cobrem RF-008–RF-011, vazio/erro/rollback/retry/cancelamento/duplicatas. Três testes de licenças/configuração YAML verificam avisos nos artefatos remotos.
- [ ] T017 [US-013] Revisar RNF-001 a RNF-004 na interface/dados de #13, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

T017: revisão estática de rótulos/feedback, contraste, texto escalável, scroll,
alvos48dp, revisão de destino/mensagem, consentimento e nenhuma inferência clínica
realizada. Handoff real em Android/iOS (queries, WhatsApp/ausência/cancelamento),
TalkBack/VoiceOver/foco/ampliação/teclado, reabertura offline SQLite Expo e backups
continuam pendentes no gate. Não operar outros apps ou contatos pessoais do
aparelho para simular validação. Mocks/build/instalação não comprovam esses testes.
