# Plano de implementação — Lembrete de Água

Spec: [spec.md](spec.md). Milestone #20; Issues #29, #30. Plano proposto, sujeito às questões em aberto.

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
