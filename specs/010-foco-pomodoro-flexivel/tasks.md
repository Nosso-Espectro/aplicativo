# Tasks — Foco / Pomodoro Flexível

Milestone #18: [spec.md](spec.md) e [plan.md](plan.md). US025 implementada e validada localmente em 2026-10-14; PR/CI/merge devem confirmar entrega. US026 e gate nativo T011 continuam pendentes.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-025 — Issue #25

- [x] T001 [US-025] Modelo puro em `src/features/focus/`: presets 25/5 e 50/10 (RF-001), estado/fase/restante/prazo, seleção antes da sessão e comandos com identidade capturada.
- [x] T002 [US-025] Provider local somente memória e iniciar/pausar/retomar/encerrar (RF-002); prazo/relógio injetável, AppState/reconciliação sem catch-up, recusa de eventos antigos/duplicados, relógio inválido/regressivo com recuperação humana e cleanup.
- [x] T003 [US-025] UI e rotas próprias/quadro/fallback: aviso visual/polite e próxima fase somente por comando humano (RF-003), confirmação de saída ativa, reentrada vazia, modo9/48dp/escalável, sem som/vibração/notificação ou alterar timer existente.
- [x] T004 [US-025] Testes modelo/provider/Expo Router: presets, pausa/retomada, fim foco/pausa, próxima fase manual, background/atraso/relógio regressivo, comandos antigos/duplicados, confirmar/manter saída, desmontagem/reentrada e modo9; regressões timer/avisos existentes.
- [x] T005 [US-025] Revisar RNF-001 a RNF-004, privacidade/offline/clean-code e diff; Jest serial/lint/tipos/Doctor/tooling/validador antes PR e CI leve antes integração. Atualizar tasks somente após comportamento verificado, sem alegar gate nativo por mocks.

Evidência local US025: 20 testes novos (12 modelo + 8 fluxo/provider); 145 relacionados/11 suítes incluindo timer/avisos; 629 Jest/83 suítes completos, lint/tipos sem warnings, Doctor21/21,56tooling,validador/diffcheck verdes. Sem nova dependência/permissão/DB/rede/voz/notificação. Revisão sem regressão impeditiva conhecida; limites nativos em T011 não comprovados por estes testes.

- [ ] T011 [US-025] Gate nativo posterior no SHA integrado: relógio/background/processo morto/offline, TalkBack/VoiceOver/foco/ampliação/insets/alvos/contraste e saída real. Build remoto não substitui estes testes; nenhuma instalação autorizada por refinamento.

## US-026 — Issue #26

- [ ] T006 [US-026] Em `src/features/focus/stopwatch`, atender RF-004 (critério 1 de #26): O cronômetro deve iniciar em zero e contar o tempo decorrido. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-026] Em `src/features/focus/stopwatch`, atender RF-005 (critério 2 de #26): Deve permitir pausar, retomar e finalizar. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-026] Em `src/features/focus/stopwatch`, atender RF-006 (critério 3 de #26): O recurso não deve penalizar o usuário por sessões curtas ou interrompidas. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-026] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/focus/stopwatch`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-026] Revisar RNF-001 a RNF-004 na interface/dados de #26, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
