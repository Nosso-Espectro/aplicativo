# Plano de implementação — Timer Visual de Transição

Spec: [spec.md](spec.md). Milestone #14; Issues #17, #18. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo57.0.28/RN0.86.3/React19.2.3, TypeScript strict,
Router, SQLite, Node24.21.0/npm11.19.0 e Jest/RNTL/SQLite real do Node existentes.
Sem nova dependência/permissão; builds somente remotos.

## Arquitetura atual

CAA, rotinas, perfil, apoio/contato e modo de baixa estimulação integrados na
main76bcfa8. Provider do timer deve preservar a sessão ao navegar e coexistir com
providers atuais, sem atualizar/copiar dados deles. Rota fina + tela em módulo
próprio, inicialmente acessível pelo quadro; painel #10 não pertence à branch.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/transition-timer/`.

- `src/features/transition-timer/visual-timer` — [US-017] Criar timer visual de transição.
- `src/features/transition-timer/progress-alerts` — [US-018] Configurar avisos progressivos do timer.

## Modelo de dados

US-017: sessão inicialmente null, depois running/paused/finished, duração e
restante em milissegundos e término absoluto quando running; validação estrita
de duração1s–24h e estados coerentes. Relógio recebido pelos cálculos para testes,
APIs Date.now/agendamento existentes, sem acumular ticks atrasados. UI numérica
arredonda para cima até concluir, barra mostra proporção restante e sem animação.
Pausa/retomada/cancelamento dependem do estado atual confirmado; término passado
é concluído ao atualizar. Não adicionar marcos ou preferências de avisos #18.

## Persistência

US-017 implementa modelo, provider global, tela/rota real e acesso pelo quadro.
Barra estável sem interpolação e contador em partes quebráveis/scaláveis, com
estado independente de cor e liveRegion none nos valores por segundo. Campos
numéricos sem duração sugerida, controles48dp e confirmação de cancelamento.
Estado conhecido somente após leitura, erro preserva sessão/draft e retry reabre
o timer salvo, sem repetir automaticamente uma ação destrutiva. A pessoa pode
repetir explicitamente a ação após recuperar a leitura.

SQLite privado separado tear-transition-timer.db v1 para somente a sessão atual,
fila de operações, transação/readback/rollback e versão futura recusada. Escritas
ao iniciar/pausar/retomar/cancelar, não a cada tick. Estado confirmado só após
commit, erros genéricos/retry preservando sessão/draft e bloqueando duplicatas.

Transições calculadas dentro da transação usando a sessão atual e comparando o
snapshot esperado do comando; alvo stale é recusado sem sobrescrever/cancelar
outra sessão. Consentimento de cancelamento da tela aponta ao snapshot confirmado
e deixa de valer quando a sessão muda. Início novo só quando ausente/concluído.
Prazo expirado é representado como concluído ao ler/atualizar; não há escrita por
tick. A leitura recuperável não reconfirma um cancelamento antigo.
Restauração desconhecida não oferece iniciar outro timer que sobrescreva sessão;
falha não bloqueia comunicação nem afirma ausência de dados. Recuperar término
absoluto ao reabrir; não criar histórico nem prometer alarmes em background.

## Fluxos principais

Sequência de capacidades: Criar timer visual de transição → Configurar avisos progressivos do timer.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Sessão/duração permanecem locais e sem rede. Provider usa relógio no foreground e
recalcula ao AppState active, não exige setInterval executando em background.
Ao reabrir, running usa deadline; paused retém restante. Ajustes no relógio do
sistema afetam o instante absoluto; limitar restante à duração/snapshot e nunca
mostrar valores negativos. Sem notificação/som/vibração nessa história.

Recursos locais não devem depender de autenticação ou API. Capacidades externas explicitamente solicitadas devem informar indisponibilidade sem impedir os recursos locais; não confundir falta de backend próprio com ausência de qualquer serviço externo futuro.

## Acessibilidade

Revisão local: #202124/#FFFFFF 16.10:1, #303438/#FFFFFF 12.54:1,
#16634D/#FFFFFF 7.18:1 e #72777D/#FFFFFF 4.52:1. Trilha/barra24dp estáveis e largura
proporcional, campos/contador/ações quebráveis com limites responsivos. O grupo
numérico tem nome completo em português; progressbar expõe min/max/restante/texto,
sem anúncio explícito a cada segundo. Isso não comprova comportamento TalkBack/
VoiceOver, foco, ampliação/teclado/insets/áreas de toque reais, que ficam no gate.

Aplicar RNF-001 e a Skill accessibility-neuroinclusive: rótulos e ordem de foco, leitor de tela, texto ampliado, contraste e alvos de toque. Verificar teclado quando suportado pelo dispositivo. Respeitar preferências de som/movimento e não ativar mídia inesperadamente. Critérios mensuráveis faltantes precisam de refinamento, não de aprovação automática.

## Privacidade e segurança

Aplicar RNF-002 e RNF-004. Usar dados sintéticos nos testes; evitar dados pessoais em logs. Controlar compartilhamento e permissões nas ações que realmente necessitam deles. Não adicionar telemetria, conta ou serviço externo por conveniência técnica.

## Estratégia de testes

Evidência em 2026-10-13:35 testes de US-017 em quatro suítes e310 testes/48 suítes
completos, lint/tipos,Doctor21/21,49 tooling e validador aprovados. SQL real do Node
em arquivos com close/reopen, rollback de start/pause/resume/cancel e commit,
versão futura/corrupção/alvo stale recusados, isolamento de modo/plano. Componentes
com relógio controlado verificam foreground após pausa dos ticks em background,
remount e sessão pausada, recuperação sem ação automática, draft/confirmado/
duplicatas/cancelamento e rotas reais preservando modo/Stack. [AppState RN0.86](https://reactnative.dev/docs/0.86/appstate)
foi a referência primária; nenhum teste alegado em telefone/OS reais.

- Derivar cenários de cada RF, preservando a relação Issue → RF → task → teste.
- Usar testes unitários para transformações de estado/dados; componentes para interação e acessibilidade; integração para persistência/capacidades nativas quando pertinentes.
- Exercitar os casos de erro do spec e regressões das dependências reais.
- Verificar em dispositivo/simulador os fluxos que dependem de voz, áudio, permissões ou notificações; mocks isolados não comprovam suporte nativo.
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck e checks leves; builds somente remotos no SHA integrado da main.

Jest serial para duração/relógio/ações/representação, componentes com tempo
controlado e AppState, SQLite real do Node com reabertura/rollback e navegação.
Lint/tipos/Doctor,49 tooling e validador. Gate deve verificar SQLite Expo/offline
após reinício, relógio/background/bloqueio reais, leitores de tela/foco/ampliação,
alvos e insets; mocks/build não comprovam esses fluxos nem habilitam release.

## Dependências técnicas

APIs existentes de relógio/agendamento/RN/AppState, Router, SQLite e controles
nativos. Nenhum framework de timer/áudio, dependência, permissão ou serviço novo.
Stack/controle de baixa estimulação preservados; não interferir com voz voluntária.

## Riscos

Duração inválida, marco fora da duração e interrupção de sessão; comportamento de retomada depende de Q-TIMER-01.

US-017 Ready após refinamento vivo e confirmação da stack; Q-TIMER-01/02 para #18
continuam abertas e a milestone não está pronta. Sem prometer serviço ou alarme
fora do app. Segurança do host #61 e auditoria #51 seguem pendentes; não autorizam
instalação no aparelho por inferência. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-017: TypeScript, módulo pequeno por capacidade, estado confirmado/SQLite separado, relógio injetável nos cálculos; provider/tela/rota alinhados aos padrões atuais.
- Pendente: política de avisos/som/vibração de #18; não antecipar nesta branch.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
