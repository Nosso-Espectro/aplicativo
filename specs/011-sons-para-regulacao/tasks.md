# Tasks — Sons para Regulação

Milestone #19: [spec.md](spec.md) e [plan.md](plan.md). US027 entregue pelo PR71, gate T005 pendente. US028 Ready após refinamento de 2026-10-14; nenhuma task28 implementada/verificada ainda.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-027 — Issue #27

- [x] T001 [US-027] Em `src/features/regulation-sounds/RegulationSoundsScreen.tsx`, atender RF-001 (critério 1 de #27): Deve haver ao menos quatro opções iniciais de som. Verificar com o cenário correspondente no PR.
- [x] T002 [US-027] Em `src/features/regulation-sounds/sound-controller.ts` e `RegulationSoundsScreen.tsx`, atender RF-002 (critério 2 de #27): O usuário deve poder iniciar, pausar e ajustar volume. Verificar com o cenário correspondente no PR.
- [x] T003 [US-027] Em `src/features/regulation-sounds/expo-sound-engine.ts` e `assets/regulation-sounds/`, atender RF-003 (critério 3 de #27): Os sons essenciais devem funcionar offline. Verificar com o cenário correspondente no PR.
- [x] T004 [US-027] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/regulation-sounds/`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-027] Revisar RNF-001 a RNF-004 na interface/dados de #27, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

T001–T004: implementação e 58 testes relacionados/6 suítes, mais verificação real
dos WAVs e configuração em memória; 373 Jest/55 suítes, tooling56, lint/tipos,
Doctor21/21 e validador verdes. T005 permanece pendente do gate nativo/assistivo:
escuta, loop, volume/foco/silêncio/interrupções/TTS, offline, background/lockscreen,
manifesto/licenças nativas finais e leitores de tela/ampliação/foco/insets.
Review local/contraste/semântica/alvos/código/privacidade registrado no plano,
sem declarar conformidade completa ou execução em aparelho pelos mocks.

## US-028 — Issue #28

- [ ] T006 [US-028] Modelo puro de duração inteira1-180/draft15/presets5,15,30,60/prazo corrido/revisão/relógio seguro e UI de aplicação explícita sem autoplay (RF-004).
- [ ] T007 [US-028] Integrar prazo/owner/slot ao controller/provider/AppState: expirar invalida intent e pausa alvo, sucesso só por status nativo; falha/retry, factory/status antigos, clock inválido/regressivo/overflow, sem auto-retomar. Timer requer background desligado e impede habilitação até cancelamento; pause ao background sem prometer JS suspenso (RF-005).
- [ ] T008 [US-028] Cancelar somente timer sem pause/play/configure/ganho; invalidar prazo por troca/player destruído/dispose, preservar reprodução quando cancelado, comandos/reaplicar sem duplicatas (RF-006).
- [ ] T009 [US-028] Testes reais modelo/controller/provider/router: duração/fronteiras/prazo/pausa/TTS, cancelamento independente, stale/reaplicar/troca/factory/status tardios, erro de pause/clock/overflow, AppState/guardas/retornos/mode9; regressões sons/voz/timer/Pomodoro/CAA.
- [ ] T010 [US-028] Revisar RNF-001 a RNF-004/privacidade/offline/clean-code/diff e executar Jest serial/lint/tipos/Doctor/tooling/validador/CI leve antes integração. Tasks só após comportamento; sem DB/rede/deps/permissões/estímulos/histórico novos.
- [ ] T011 [US-028] Gate posterior no SHA integrado Android/iOS: parada/pausa/erro reais, background/lock/processo morto/relógio/offline/TTS e readers/foco/ampliação/insets/alvos/contraste. Mocks/build não comprovam gate; sem instalação automática.
