# Tasks — Check-in Corporal e Sensorial

Milestone #16: [spec.md](spec.md) e [plan.md](plan.md). US021/US022 verificadas na implementação de 2026-10-14; gates nativos permanecem pendentes.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-021 — Issue #21

Refinamento aprovado em 2026-10-14: sete itens Sim/Não/Não sei, temperatura Frio/Confortável/Calor/Não sei, sem seleção padrão; todas puláveis. Respostas somente em memória da sessão, sem histórico/resumo/sugestões. Implementação em `src/features/sensory-check-in/CheckInForm.tsx`, reducer/modelo próprio, rota `src/app/check-in/` e entrada no quadro. Tasks abaixo só serão marcadas após verificar comportamento real.

- [x] T001 [US-021] Em `src/features/sensory-check-in/CheckInForm.tsx` e `check-in-model.ts`, atender RF-001 (critério 1 de #21): oito itens corporais/sensoriais, verificados no fluxo real de rota nos testes.
- [x] T002 [US-021] Atender RF-002 (critério 2 de #21): radio simples com estado selecionado, sete itens Sim/Não/Não sei e temperatura Frio/Confortável/Calor/Não sei, sem resposta inicial presumida; seleção reversível.
- [x] T003 [US-021] Atender RF-003 (critério 3 de #21): pular todas as perguntas inclusive a última, apagando eventual resposta anterior; voltar revisa a sessão sem preencher itens ausentes.
- [x] T004 [US-021] Atender RF-004 (critério 4 de #21): encerramento sem diagnóstico/prescrição/interpretação clínica. US022 agora estende para resumo literal em memória; saída/blur/unmount descarta.
- [x] T005 [US-021] Onze testes em `tests/features/sensory-check-in/`: fluxo real Expo Router/quadro, oito itens, escalas, ausência de dados, inválidos/stale/duplicados, revisão/skip, descarte na saída/back/unmount, reentrada vazia, offline e modo9.
- [x] T006 [US-021] Revisar RNF-001 a RNF-004: alvos48dp/radios56dp/texto escalável/contraste/headers/estado checked/live region polite/SafeArea/scroll sem animação; nenhum DB/API/log/params de respostas/permissão/dependência/estímulo novo. 563 Jest/74 suítes, 30 relacionados/4, lint/tipos/Doctor21/21/56tooling/validador/diffcheck aprovados. Revisão sem regressão impeditiva conhecida. Foco/readers/insets/ampliação/dispositivo não comprovados por RNTL: T012 pendente.

## US-022 — Issue #22

Refinamento aprovado em2026-10-14: resumo literal só respostas válidas, sem inferência de puladas; estado vazio neutro. Memória até sair/abrir ferramenta/back/blur/unmount; sem histórico. Possibilidades neutras opcionais e rotas reais regulação/contato/Água CAA local para exibição, sem ações automáticas. Modelo em `check-in-summary.ts`, UI no fluxo existente `CheckInForm.tsx`, rota `src/app/check-in/water.tsx`; sem deps/DB/rede/respostas em params.

- [x] T007 [US-022] RF-005: `check-in-summary.ts` deriva somente respostas válidas fornecidas em ordem; `CheckInForm.tsx` mostra resumo literal/estado vazio neutro. Escalas incompatíveis/itens inválidos omitidos sem expor dado bruto ou inferir puladas.
- [x] T008 [US-022] RF-006: possibilidades neutras aprovadas, independentes das respostas, somente por escolha humana; sem prescrição/diagnóstico/estímulo ou ação automática.
- [x] T009 [US-022] RF-007: atalhos reais regulação/contato/Água local CAA, sem respostas em params. Água reutiliza cartão/imagem/Modal/crédito existente, sem compositor/voz/frase/envio/lembretes. Ausência do cartão preserva retorno. Abrir ferramenta descarta sessão.
- [x] T010 [US-022] Nove testes novos (3 resumo puro/6 fluxos Expo Router real): respostas fornecidas/ordem/ausentes/inválidas/sem mutação, resumo vazio, descarte/back/unmount/reentrada, rotas/params/mode9, offline/nenhum fetch/voz/WhatsApp/envio, falha/retry contato e cartão ausente. Regressões21 mantidas, retenção ao finalizar estendida explicitamente para22.
- [x] T011 [US-022] Revisão RNF001-004: texto escalável/contraste/headers/agrupamento acessível pergunta+resposta/polite/48dp/SafeArea/scroll sem animação; sem DB/rede/params/logs de respostas/deps/permissões novas.572Jest/75suítes,46relacionados/6,lint/tipossemwarnings/Doctor21/21/56tooling/validador/diffcheck aprovados. Sem regressão impeditiva conhecida. Nativo/assistivo não comprovado por RNTL: T012/T013 pendentes, sem release pronta.

## Gate nativo separado

- [ ] T012 [US-021] No SHA integrado, verificar abertura/reentrada offline sem retenção, TalkBack/VoiceOver/foco ao trocar pergunta, texto ampliado/insets/scroll/alvos de toque e modo9 em aparelho/simulador. Build/mocks não comprovam essas verificações; nenhuma instalação autorizada por aprovação funcional.
- [ ] T013 [US-022] No SHA integrado, verificar resumo/saída/reentrada offline e sem retenção, leitores/foco/ampliação/insets/scroll/alvos/modo9/Modal do cartão Água em aparelho/simulador; abertura dos atalhos sem voz/envio/estímulos automáticos. Mocks/build não comprovam; instalação requer autorização específica.
