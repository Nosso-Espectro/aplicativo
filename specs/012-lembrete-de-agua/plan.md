# Plano de implementação — Lembrete de Água

Spec: [spec.md](spec.md). Milestone #20; Issues #29, #30. Plano proposto, sujeito às questões em aberto.

## Plano vigente US030

Implementação vigente: fronteira DAILY usa APIs instaladas getNextTriggerDateAsync/scheduleNotificationAsync e verifica retorno Androiddaily versus iOScalendar/dateComponents/repeats, próximos Unixms, deadline, fuso/clock monotônico e minuto fora do silêncio. Recusa transição de offset perto da ocorrência em vez de adivinhar fold/gap DST. Primeiro após intervalo inteiro; candidato cedo omitido, unknown/null/ambíguo/no-slots/capacidade recusados. Limite produto48TOTAL antes de efeitos; nenhum corpo foreign lido pelo TEAr, sem afirmar ausência de observação pelo mapper SDK. Snapshots antes FIFO, plano completo no journal antes de efeito, todas confirmações nativas/DB antes active, compensação de todos IDs comprovados da operação e nunca do ID divergente retornado. Read-only verify não agenda nem cancela; coordenador pausa/cancela próprios após divergência de restore/fuso/clock/permissão/plano.

Coordenador integra lotes e mantém intervalo29 sem janela; saveQuiet só inativo/sem journal, confirmação humana/permissão antes de planejar, retry explícito e nenhum auto-resume/catch-up. Callback foreground aceita todos IDs atuais e recusa silêncio no relógio atual e data do evento, stale/replay/background/clock inválido. Provider/AppState existente reconcilia sem novo request/agenda automática. UI na rota existente: janela default ausente, switch/draft HH:MM sem horários sugeridos, salvar/cancelar/início=fim inválido, ativação com informação de slots/gaps/limites OS, pausa antes de editar, mode9/retornos e geração de foco para callbacks antigos. Min48dp/input/switch hitSlop/layout com wrap e texto escalável; nenhum áudio/notificação real operado na validação.

133 testes hidratação/7 suítes e827Jest96 completos PASS, incluindo novos17adapter/9controller/6Router-provider neste passo (32novos,76novosUS030). Lint/tipos/Doctor21/21/56tooling/validadordiffcheck PASS. Revisão do diff/RF/RNF não encontrou regressão impeditiva; minimização/offline/TX/IDs/sem deps-permissões novas e sem efeito Timer/CAA verificados. Caso residual de operação antiga em configuração inativa: somente após erro e capacidade previamente inicializada, Conferir novamente inspeciona/cancela próprios sem agenda/request, sem carregar SDK no defaultOFF. T007/T008/T010 verificadas em modelos/SDKfake/SQLiteNode/Router; T011 aguarda CI leve, T012/T013 nativos continuam pendentes. Este estado substitui os checkpoints históricos abaixo de adapter/UI ausentes ou quiet activation bloqueada. Nenhum host/jobs/build/phone/preview8093 operado.

Checkpoint atual de persistência: schema2 adiciona quiet_window/receipt privados; migração v1 valida antes de alterar e conserva revisão/intervalo/status/IDs/journal active-pending legados, sem agenda nativa ou tempo inventado. Rollback reverte DDL/version/journal em commit/readback falho. Configuração clona quiet/receipt, valida geração<=revisão/activateexataR/cancelamento de TODO lote, exige ACKs completos/exatos para daily (incluindo lote de uma entrada), recusa corrupção/schema futuro inclusive conexão já aberta. SaveQuietWindow só inativo/semjournal, snapshot antes FIFO, intervalo/reabertura/offline/isolamento preservados. Alias identifier do primeiro recibo mantém contrato29, não substitui lista completa do lote.

Controller usa geração centralizada v1/v2 e preflight de TODOS IDs antes de cancelar, mantém journal completo e não confirma batch após compensação de só um ID; quiet activation bloqueada enquanto DAILY não integrado. Adapter, ao receber ID divergente, compensa somente input ID comprovado, nunca retornado foreign/geração nova.23 testes adicionais (14SQLite/4modelo/2controller/3adapter),101hidratação/7suítes e795Jest96 completos PASS; linttipossemwarnings/Doctor21/21/56tooling/validadordiffcheck verdes. T009 verificada localmente, T007/T008/T010/T011/T013 ainda pendentes, semPR/entrega30/host/phone/build/preview. Snapshots nativos simulados, SQLiteNode real; não SQLiteExpo/aparelho. Seções de checkpoints anteriores abaixo são histórico, não instruem repetir módulos já existentes.

US029 integrada PR93/mainb6dfd5f em2026-10-14:751Jest94/57novos/PRCI38581557667SUCCESS1m32s/mainCI38581938203SUCCESS1m36s, nativos SKIPPED. Seções US029 abaixo preservam evidências pré-integração, não instruem reimplementação. US030 Ready pelo refinamento registrado no GitHub/spec, implementação parcial descrita acima.

Checkpoint parcial30: quiet-hours.ts implementa validação/cópia/HH:MM/minuto/boundaries/meia-noite/relógio e plano diário circular/até48slots/notBefore, sem integração runtime. 15 testes novos,72hidratação/6suítes e766Jest95 completos PASS; linttipossemwarnings/Doctor21/21/56tooling/validadordiffcheck verdes. Nenhuma task30 marcada por modelo isolado: migração/persistência/loteSDK/controller/provider/UI ainda faltam; next-date nativo e capacidade não simulados como implementados. T013 pendente.

Segundo checkpoint parcial: hydration-receipt.ts valida IDs/generação legadosv1 e lotev2-posicional0-47, recibo intervalo/daily, timezone/deadline/gaps/cópias independentes e recusa entries vazias/esparsas/duplicadas/corruptas. Validador de intervalo extraído para módulo folha, preservando export29 e evitando ciclo ao conectar configuração/quiet/receipt. Seis testes adicionais;78hidratação/7suítes,772Jest96 completo e linttipossemwarnings PASS. Helpers NÃO integrados ao DB/adapter/controller: schema ainda1, namespace runtime29 ainda v1, nenhum schedule DAILY real/novo método SDK implementado. Próximo migrar configuração/journal/recibos para lotes com testes SQLiteNode, depois fronteiraSDK/coordenador/provider/UI; tasks30unchecked e gateT013 pendente.

Stack/dependências sem alteração. API/source57.0.22 revisados: parseDailyTrigger aceita DAILY/hour/minute/channelId, Android DailyTrigger usa Calendar local/nextday/segundoszero e iOS DailyTriggerRecord cria UNCalendarNotificationTrigger repeats true. Retorno de inspeção difere Android daily/hour/minute e iOS calendar/dateComponents/repeats; normalizar somente após guardas reais. getNextTriggerDateAsync retorna Unixms nas duas plataformas (iOS multiplica epochseconds por1000), diferente do evento recebido iOS já tratado29. Não usar CALENDAR genérico como suposto suporte Android, nem inventar trigger/listener/quota.

Implementar modelo quiet-hours: nullable default, validação HH:MM/minuto0-1439/distintos, predicate início inclusivo/fim exclusivo/modular-meia-noite, fase de minutos diários ancorada no primeiro intervalo de ativação/retomada, até48 slots e gaps civis nunca menores que intervalo antes do filtro. Relógio/overflow inválidos recusados; plano nativo omite próximas ocorrências antes de now+intervalo completo, dentro do silêncio ou não confirmadas. Sem slots, capacidade ou confirmação = erro/inativo. Sem janela usar contrato29 intacto.

Estender persistência privada para configuração de janela/plano/recibos de lote com migração schema1 preservando valores/status/IDs/journal legado, sem resets nem tocar outros DBs. Revisão CAS/FIFO/TX/readback/rollback/future-schema; DTOs validados e cópias independentes. Todas etapas da operação nativa gravadas antes de efeito; nenhum falso commit distribuído. Preservar cancelamento legado29 e compensação restrita à operação, detectar geração nova antes de cancelar; owner/stale/busy/dup/dispose e erro de cancelamento pendente mantidos.

Adapter/coordenador verificam contagem+IDs pendentes totais com limite conservador48 do produto, não limite declarado do OS; não ler/logar conteúdo alheio. Confirmar cada schedule e TODO lote, preservar avisosTimer/terceiros, compensar apenas próprios após falha parcial/commit/lateeffects. Reabertura valida plano/próximas ocorrências/clock/fuso/permissão sem agendar/request automático; divergência pausa recuperável após cancel próprio, Retomar humano. Faixa foreground recusa relógio inválido/silêncio/ID não atual/replay. Sem polling para promessa background e sem handler global/novas deps/permissões/exact/push/conta/rede.

UI existente hidratação: draft enable/start/end/savecancel separado/revisão capturada; edição apenas pausada/desativada/semjournal, início=fim inválido. Confirmar mudança para horários diários e limites OS antes Ativar/Retomar; sem horário imposto/recomendação clínica. Rótulos/erroretry/backfallback/mode9/48dp/escalável e controles familiares, nunca mudar quiet ou intervalo silenciosamente para obter capacidade. Manter Timer/CAA/som e prévia8093.

Tests quiet/property-boundaries/slots/circular-gaps/clockerror; SQLiteNode real migração v1/rollback/future-schema/receipts/batchtakeover; SDKfake fiel dailyAndroid/calendarIOS/nextms/capacidade/falha parcial/cancel/late; controller/provider/Router/reabertura/fuso/draft/permission/foreg/meia-noite/mode9/regressões29/Timer/CAA. Jest serial/runtime24.21.0/linttipos/Doctor56toolingvalidadordiffreviewCI antesDoD, tasks só comportamento. Gate T013 real: emissão/delivery no silêncio/meia-noite/DST/timezone/clock/Doze/reboot/capacidade/cancelamento/leitores/SQLiteExpo/offline/backups, sem aprovação por mocks/assinatura/build. Nenhuma operação aparelho/host/jobs/build local autorizada neste desenvolvimento.

## Plano vigente US029

### Fundação em desenvolvimento

CI leve PR93 run38581241689 SUCCESS1m18s no head d1712d413c13e0b62560340c80175f3bce4d68d0, após revisão local; Android/iOS SKIPPED, não builds. T006 verificada. Mudança documental de evidência também requer CI verde no head final antes de integrar. Nenhuma milestone/release pronta.

Checks locais finais: 57 testes novos/5 suítes hidratação, 751 Jest/94 suítes completas, lint e tipos sem warnings, Doctor21/21, 56 testes tooling, validador/diffcheck verdes. Revisão local de escopo/privacidade/offline/erros/ownership sem achado impeditivo restante; CI antes de integração ainda pendente. APIs nativas simuladas, persistência SQLiteNode real, não SQLiteExpo em aparelho. Textos genéricos e controles48dp/escaláveis/retorno/mode9 revisados, sem declarar validação assistiva integral. T012 e testes de delivery/cancel/canais/backups/reboot/background/aparelho pendentes; não houve instalação/build local/host/atualização da prévia8093.

Modelo/configuração e SQLite privado schema1 implementados com estado inicial disabled60, intervalo30-720, revisão safe e journal activate/cancel. Preparação grava ID antes do agendamento; confirmação usa ID/revisão exatos e readback antes de publicar, rollback preserva journal em falha de commit. Cancelamento guarda também ID planejado e nova revisão toma posse de recuperação, impedindo confirmação antiga. Salvar intervalo somente paused/disabled e sem journal; UI futura orienta Pausar/Retomar humanos, conforme complemento registrado na Issue29.

Adapter separado usa APIs/types/fontes instaladas57.0.22: repeat TIME_INTERVAL seconds/repeats/identifier explícito, inspeção de trigger com guardas porque retorno também pode ser ChannelAware sem type. Canal local LOW/soundnull/sem vibBadgeLightsDND; request iOS allowAlerttrue/allowSoundBadgeCriticalProvisionalCarPlayfalse somente após comando. SDK Android usa exact se capacidade já existe/versão permite e fallback inexact; TEAr não solicita privilégio exato nem promete horário preciso. Conteúdo genérico, sem push/token/globalhandler; IDs próprios filtrados antes de conteúdo de outros módulos, status agendado/cancelado só confirmado por inspeção. Factory lazy, fila, status iOS autoritativo, late schedule compensado, eventos atuais próprios e dispose sem apagar agenda confirmada. Nenhuma notificação real emitida pelos testes.

Coordenador implementado com 11 testes de fronteira usando SQLiteNode real: journal/takeover/stale/rollback, permissão negada/lenta/cancelada, cancelamento falho, agendamento tardio, owner/dispose/eventos e reabertura sem auto-agenda. O mapper JS do SDK57 não converte date: iOS entrega segundos fracionários, Android milissegundos. Adapter normaliza iOS para milissegundos safe e recusa datas inválidas; testes espelham ambas as plataformas. Nenhum host/aparelho/build local/servidorpreview operado. Gate T012 pendente.

Provider de raiz mantém configuração e banner entre telas, descarta intent pendente no blur da tela e limpa ownership/listeners no teardown sem cancelar agenda já confirmada. Inicialização SQLite compartilhada entre owners StrictMode; callbacks de owner descartado recusados. AppState consulta recibos ao retornar, adia reconciliação enquanto um comando termina e nunca agenda automaticamente. Rota /hydration usa retorno/fallback ao quadro e entrada no drawer Ferramentas. UI separa draft/revisão/savecancel, recusa edição ativa, permite Pausar/Desativar/Retomar humano e pede confirmação antes da permissão. Aviso de horários livres/limites OS precede ativação; erros de cancelamento não aparecem como sucesso. Faixa efêmera fechável sem som/voz, controles48dp/texto escalável/sem animação nova e modo9 preservado. Oito testes Router/provider/coordenador/SQLiteNode reais cobrem estes fluxos; 57 testes hidratação em cinco suítes passaram. Nenhuma entrega declarada antes da revisão/checks finais/CI.

Refino de 2026-10-14 sob delegação funcional, Ready somente29. Stack atual Expo57/RN0.86.3/React19.2.3/TypeScript strict/Router/SQLite e expo-notifications57.0.22 existentes; APIs/types/fontes instaladas revisadas. SDK reusado sem novos deps/permissões/privilégios/handler global/tokens/rede. Não alterar bancos/avisos de timer nem outras ferramentas.

Modelo privado em `src/features/hydration/`: intervalo30-720/draft60/presets30,60,120/revisão/status disabled-paused-active. SQLite privado `tear-hydration-reminders.db` schema1 para configuração e recibos/journal mínimos; fila/TX/readback/rollback/inteiros safe/future-schema/stale e isolamento. OS e SQLite não compartilham transação: coordenador registra etapas e reconcilia IDs/namespace para conter crash/schedule/cancel/commit tardios sem orphan/deduplicação falsa/estado ativo inventado. Não cancelar notificações de timer/terceiras via cancelAll. SDK lazy, permissões consultadas sem request inicial; request somente no ativar/retomar confirmado. Um intervalo repetitivo local, primeiro aviso não imediato; conteúdo genérico/silencioso solicitado sem garantias sobre canais/OS/reboot/force-stop.

Provider local persistido/owner/busy/revisões/retry, confirma agenda+registro antes de active; pausa/desativa só depois de cancelamento confirmado, erro explícito se pendente. Reabertura verifica recibos/permissão sem recriar automaticamente; recuperar com Retomar humano e intervalo novo, sem catch-up. Faixa foreground efêmera só de evento atual próprio, metadados filtrados/sem processar conteúdo de outras ferramentas, fechável48dp/polite/sem som/voz. Tela/rota próprias e entrada Ferramentas, draftsavecancel/erroretry/confirmar permissões/limite sem horário silencioso30/backfallback/mode9/texto escalável. Não implementar30 ou histórico/conta/diagnóstico.

Testes modelo/SQLiteNode real/coordenador/provider/Router/adapter SDK falso: defaultOFF, intervalo inválido/draft, negação/permissão lenta/ownedIDs, cancelamento/schedule tardio/duplicatas/stale/unmount, rollback/readback/reabertura/offline/future-schema/crashjournal/IDs de outros módulos preservados; evento foreground sem replay; regressões timer/CAA. Jest serial/linttipos/Doctor56toolingvalidadordiffreviewCI leve antesDoD. T012spec012 nativo: SQLiteExpo/backups/offline e delivery/cancel/canais/OS/background/reboot/readers; mocks/build não comprovam. Nenhum aparelho/host/build local nesta feature. Se API/OS não confirmar contrato, registrar limite/falha no backlog sem simular sucesso.

As seções seguintes são histórico documental de 2026-09-23, não afirmam ausência atual de stack.

## Stack

Inspeção em 2026-09-23: repositório sem código de aplicação, package.json, dependências ou ferramentas de build/teste. React Native e primeira versão sem backend são diretrizes explícitas do projeto, ainda não implementadas. Expo, linguagem, navegação e biblioteca de persistência não foram escolhidos. Não assumir stack web, banco ou servidor.

## Arquitetura atual

Somente README e licença antes desta preparação. Não há componentes, modelos ou serviços existentes para reutilizar. Os caminhos abaixo são propostas de organização e não arquivos já criados.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/hydration/`.

- `src/features/hydration/reminder-settings` — [US-029] Configurar lembretes de hidratação.
- `src/features/hydration/quiet-hours` — [US-030] Configurar horário silencioso para hidratação.

## Modelo de dados

Configuração de intervalo ou horários, estado dos lembretes e início/fim do silêncio. Agendamentos locais relacionados à configuração.

Representação física, tipos e migrações serão definidos após a escolha técnica; não instalar banco por antecipação.

## Persistência

Persistir horário silencioso (#30); definir restauração/reagendamento no ciclo de vida do dispositivo antes da implementação.

## Fluxos principais

Sequência de capacidades: Configurar lembretes de hidratação → Configurar horário silencioso para hidratação.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Persistir horário silencioso (#30); definir restauração/reagendamento no ciclo de vida do dispositivo antes da implementação.

Recursos locais não devem depender de autenticação ou API. Capacidades externas explicitamente solicitadas devem informar indisponibilidade sem impedir os recursos locais; não confundir falta de backend próprio com ausência de qualquer serviço externo futuro.

## Acessibilidade

Aplicar RNF-001 e a Skill accessibility-neuroinclusive: rótulos e ordem de foco, leitor de tela, texto ampliado, contraste e alvos de toque. Verificar teclado quando suportado pelo dispositivo. Respeitar preferências de som/movimento e não ativar mídia inesperadamente. Critérios mensuráveis faltantes precisam de refinamento, não de aprovação automática.

## Privacidade e segurança

Aplicar RNF-002 e RNF-004. Usar dados sintéticos nos testes; evitar dados pessoais em logs. Controlar compartilhamento e permissões nas ações que realmente necessitam deles. Não adicionar telemetria, conta ou serviço externo por conveniência técnica.

## Estratégia de testes

- Derivar cenários de cada RF, preservando a relação Issue → RF → task → teste.
- Usar testes unitários para transformações de estado/dados; componentes para interação e acessibilidade; integração para persistência/capacidades nativas quando pertinentes.
- Exercitar os casos de erro do spec e regressões das dependências reais.
- Verificar em dispositivo/simulador os fluxos que dependem de voz, áudio, permissões ou notificações; mocks isolados não comprovam suporte nativo.
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck quando aplicável e build antes de concluir.

Hoje não existem runner, scripts de qualidade ou build do aplicativo. A validação da documentação não equivale a testes do produto e não habilita release.

## Dependências técnicas

Base React Native ainda a inicializar. Selecionar somente as bibliotecas necessárias aos critérios da história, documentando suporte offline, plataformas e permissões. Integrações funcionais estão em spec.md; reuso de temporizador/áudio pode ser avaliado quando houver código, sem criar framework antecipado.

## Riscos

Permissão de notificação negada, horários inválidos e reagendamento interrompido (#29/#30); esclarecer política em Q-AGUA-01.

As questões em aberto da spec, a ausência de plataforma-alvo definida e a falta de comandos de qualidade impedem afirmar prontidão de implementação/release. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Proposta: módulos por capacidade em `src/features/`, sem fixar extensão/linguagem nem arquitetura de estado.
- Pendente: plataformas e versões mínimas, bootstrap, navegação, persistência e ferramentas de qualidade.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
