# Tasks — Check-in Corporal e Sensorial

Milestone #16: [spec.md](spec.md) e [plan.md](plan.md). US021 verificada na implementação de 2026-10-14; US022 e gate nativo permanecem pendentes.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-021 — Issue #21

Refinamento aprovado em 2026-10-14: sete itens Sim/Não/Não sei, temperatura Frio/Confortável/Calor/Não sei, sem seleção padrão; todas puláveis. Respostas somente em memória da sessão, sem histórico/resumo/sugestões. Implementação em `src/features/sensory-check-in/CheckInForm.tsx`, reducer/modelo próprio, rota `src/app/check-in/` e entrada no quadro. Tasks abaixo só serão marcadas após verificar comportamento real.

- [x] T001 [US-021] Em `src/features/sensory-check-in/CheckInForm.tsx` e `check-in-model.ts`, atender RF-001 (critério 1 de #21): oito itens corporais/sensoriais, verificados no fluxo real de rota nos testes.
- [x] T002 [US-021] Atender RF-002 (critério 2 de #21): radio simples com estado selecionado, sete itens Sim/Não/Não sei e temperatura Frio/Confortável/Calor/Não sei, sem resposta inicial presumida; seleção reversível.
- [x] T003 [US-021] Atender RF-003 (critério 3 de #21): pular todas as perguntas inclusive a última, apagando eventual resposta anterior; voltar revisa a sessão sem preencher itens ausentes.
- [x] T004 [US-021] Atender RF-004 (critério 4 de #21): encerramento neutro sem diagnóstico, resumo ou prescrição; respostas descartadas. Sem interpretação clínica.
- [x] T005 [US-021] Onze testes em `tests/features/sensory-check-in/`: fluxo real Expo Router/quadro, oito itens, escalas, ausência de dados, inválidos/stale/duplicados, revisão/skip, descarte na saída/back/unmount, reentrada vazia, offline e modo9.
- [x] T006 [US-021] Revisar RNF-001 a RNF-004: alvos48dp/radios56dp/texto escalável/contraste/headers/estado checked/live region polite/SafeArea/scroll sem animação; nenhum DB/API/log/params de respostas/permissão/dependência/estímulo novo. 563 Jest/74 suítes, 30 relacionados/4, lint/tipos/Doctor21/21/56tooling/validador/diffcheck aprovados. Revisão sem regressão impeditiva conhecida. Foco/readers/insets/ampliação/dispositivo não comprovados por RNTL: T012 pendente.

## US-022 — Issue #22

- [ ] T007 [US-022] Em `src/features/sensory-check-in/check-in-summary`, atender RF-005 (critério 1 de #22): O resumo deve mostrar apenas as respostas fornecidas. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-022] Em `src/features/sensory-check-in/check-in-summary`, atender RF-006 (critério 2 de #22): Sugestões devem ser apresentadas como possibilidades, não como prescrição clínica. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-022] Em `src/features/sensory-check-in/check-in-summary`, atender RF-007 (critério 3 de #22): O usuário deve poder acessar diretamente ferramentas relacionadas, como água, regulação ou contato de apoio. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-022] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/sensory-check-in/check-in-summary`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-022] Revisar RNF-001 a RNF-004 na interface/dados de #22, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## Gate nativo separado

- [ ] T012 [US-021] No SHA integrado, verificar abertura/reentrada offline sem retenção, TalkBack/VoiceOver/foco ao trocar pergunta, texto ampliado/insets/scroll/alvos de toque e modo9 em aparelho/simulador. Build/mocks não comprovam essas verificações; nenhuma instalação autorizada por aprovação funcional.
