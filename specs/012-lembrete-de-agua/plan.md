# Plano de implementação — Lembrete de Água

Spec: [spec.md](spec.md). Milestone #20; Issues #29, #30. Plano proposto, sujeito às questões em aberto.

## Plano vigente US029

Refino de 2026-10-14 sob delegação funcional, Ready somente29; nenhum código. Stack atual Expo57/RN0.86.3/React19.2.3/TypeScript strict/Router/SQLite e expo-notifications57.0.22 existentes. Ler API/types/fontes instaladas e engine de avisos do timer antes de implementar; reusar SDK sem novos deps/permissões/privilégios/handler global/tokens/rede e sem copiar framework inteiro. Não alterar bancos/avisos de timer nem outras ferramentas.

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
