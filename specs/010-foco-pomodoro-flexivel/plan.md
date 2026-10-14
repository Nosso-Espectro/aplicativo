# Plano de implementação — Foco / Pomodoro Flexível

## Plano vigente US082

Ready sob delegação funcional, Issue82/refino6176236501, base main20a6efe. Expo57/RN0.86/React19/Router/Node24.21.0/npm11.19.0 reais, sem nova dependência. Preservar #25/#26 e Timer/CAA. Estender modelo Pomodoro com escolha custom validada1-180min inteiros e cópia dos dois tempos no estado da sessão; presets e exports existentes preservados. Todas as fases usam tempos capturados, não draft mutável. Start inválido recusa sem sessão; clock inválido mantém recuperação existente. Provider mantém owner/revisão/AppState, nenhum armazenamento.

UI de escolha em Pomodoro existente: radio Personalizado e edição explícita de dois campos numéricos rotulados/aplicar/cancelar, draft25/5. Validar ambos, erro preserva preenchimento e escolha anterior. Edição incompleta impede iniciar; cancelar retorna escolha anterior. Sessão running/paused/waiting não exibe edição e callback antigo deve conferir inatividade/revisão antes mudar escolha/iniciar. Escolha/draft desaparecem em blur/unmount/saída, reentrada25/5; encerrar na mesma abertura mantém escolha aplicada. Sem som/vibração/TTS/notificação/DB/preferência/rede/permissão nova. Textos18/escaláveis/alvos48dp/mode9/retornos previsíveis, sem anúncio por segundo ou indicação clínica.

Testes modelo limites/NaN/decimal/overflow/cópias/presetregressão/clock/stale/next; Router/provider draft/error/apply/cancel/activeguards/saídas/reentrada/cronômetro/AppState/mode9/CAA/Timer. Related/fullserial/lint/tipos/Doctor56toolingvalidador/diff/review/CI últimohead antes integrar; tasks só comportamento. T018 nativo posterior verifica leitores/teclado/reflow/foco/insets/clockbg/offline no SHA integrado, não aprovado por mocks. Sem host/jobs/buildlocal/phone/preview8093 nesta história.

Seções anteriores abaixo são histórico #25/#26; declarações antigas de ausência de código ou #82 não Ready não substituem este plano.

Spec: [spec.md](spec.md). Milestone #18; Issues #25, #26. US025 entregue pelo PR83; US026 refinada e Ready em 2026-10-14.

## Plano vigente US026

Cronômetro livre em `src/features/focus/`, rota própria `/focus/free` com provider de sessão próprio e memória efêmera. Reusar padrões reais de relógio/AppState/owner/rotas e layout modo9 da US025, sem unir estados independentes ou criar framework genérico por antecipação. Não iniciar cronômetro ao navegar; oferecer acesso quando a sessão Pomodoro não estiver ativa, respeitando encerramento/confirmação existente.

Modelo puro com estado inicial/running/paused/finished, decorrido confirmado, relógio de última retomada/amostra e revisão de comandos. Prazo ausente; ticks apenas reconciliam decorrido. Pausa acumula diferença segura e congela; retomada cria baseline humano; finalizar preserva decorrido da sessão até nova sessão ou saída, sem histórico. Clock inválido/regressivo/overflow pausa no último valor confirmado sem tempo negativo ou meta artificial. Provider limpa intervalos/listeners e recusa callbacks antigos. Saída explícita ativa confirma; blur/unmount/saída externa descarta e reentrada vazia.

Testes de zero/elapsed/acumulado/pausa/retomada/finalizar/novo, interrupções curtas sem penalização, atraso/background, clock regressivo/falha/inteiros safe, stale/duplicatas/desmontagem, Expo Router/retornos/mode9 e regressões Pomodoro/timer. Mesmos checks leves e skills; gate T012 nativeassistivo/offline/background/clock separado. Nenhum DB/rede/dep/permissão/áudio/notificação nova. #82 continua fora.

### Modelo US026 preparado em 2026-10-14

`stopwatch-model.ts` implementa sessão própria running/paused/finished, revisão capturada, acumulado confirmado, baseline de retomada, amostra de relógio e decorrido. Tick calcula `accumulatedMs + nowMs - startedAtMs`, sem contagem de ticks; pausa congela e retomada não zera. Finalização preserva somente esta sessão, sem histórico; nova sessão explícita zera. Clock inválido/regressivo/overflow pausa no último decorrido confirmado. Se finalizar durante clock falho, primeiro preserva/pausa para nova decisão humana; finalizar já pausado é válido mesmo sem relógio. Falha ao iniciar nova sessão não apaga um resultado finalizado anterior. Discard remove sessão e revisões recusam callbacks antigos.

`StopwatchProvider` usa owner de efeito, ref do estado confirmado, relógio injetável e AppState/ticks foreground conforme padrão do Pomodoro, mas estado próprio. Comandos duplicados são recusados antes de render, cleanup descarta listeners/intervalos e callbacks antigos não publicam. A rota `/focus/free` monta provider próprio; acesso no Pomodoro somente sem sessão ativa. Não houve mudança no banco/avisos/timer ou ciclo Pomodoro.

`StopwatchScreen` exibe horas/minutos/segundos em segmentos com wrap e um rótulo acessível completo, sem anunciar cada segundo. Estado polite e comandos humano de iniciar/pausar/retomar/finalizar/nova sessão. Resultado finalizado permanece apenas na tela; saída ativa confirma revisão capturada. Hardware back focado segue o mesmo fluxo, callback tardio retorna sem ação, blur/unmount discarda e foco limpa confirmação/mensagem antigas mesmo em tela retida pelo stack. Retorno sem histórico usa `/focus`. Testes reais Expo Router/provider e clock/AppState sintéticos verificam estados, isolamento, reentrada/fallback/mode9/offline JS, erro/recuperação/StrictMode. Doze testes modelo e onze novos de fluxo/provider; gate T012 nativo permanece pendente.

O acesso ao cronômetro consulta owner/revisão e ausência de sessão confirmados no provider Pomodoro, não apenas o estado de um render antigo. Uma ref impede navegação duplicada antes de trocar de tela, foco libera o próximo comando e falha síncrona de navegação oferece retry humano. Testes capturam o callback real antes de iniciar Pomodoro e verificam sua recusa posterior, além de falha/retry e duplicatas sem criar APIs falsas.

## Plano vigente US025

Stack confirmada: Expo SDK57, React Native0.86.3, React19.2.3, TypeScript strict, Expo Router e Jest. O temporizador US017 e avisos US018 já existem; ler seus modelos, relógio/AppState, layouts e testes antes de implementar, sem alterar seus bancos, sessão ou consentimentos. Caminho da ferramenta: `src/features/focus/` e rotas próprias sob `src/app/focus/`, acesso pelo quadro e retorno com fallback.

Reducer/modelo puro com preset, fase foco/pausa, estado inicial/em curso/pausado/aguardando próxima fase, restante e prazo. Relógio injetável nos testes; capturar comandos/identidade da sessão para rejeitar eventos antigos e duplicatas. Não somar ticks como fonte da verdade. Ao retornar de background, calcular apenas o período atual, limitar restante a zero e aguardar ação humana para a próxima fase. Tratar relógio inválido ou regressivo sem avançar fase.

Provider pertencente ao layout da ferramenta, somente memória. Dispose e saída descartam callbacks e sessão; saída explícita ativa pede confirmação. Preset não muda no meio da sessão. UI reutiliza padrões de SafeArea, Scroll, modo9, alvos48dp, texto escalável e anúncios polite sem som/movimento inesperado. Não criar banco/dependência/permissão/rede ou notificação por conveniência.

Testes: presets e relógio controlado, pausa/retomada, fim de ambas fases, confirmação da próxima, atraso/background sem catch-up, relógio regressivo, comando antigo/duplicado, saída/cancelamento/desmontagem/reentrada vazia, router/fallback/modo9 e regressões timer/avisos existentes. Checks leves serializados; acessibilidade e background real dependem do gate nativo, não de mocks. #82 personalização e #26 cronômetro fora da branch.

As seções abaixo são contexto da preparação original; afirmações de ausência de código/stack em 2026-09-23 não descrevem o estado atual. Este plano vigente prevalece para #25.

### Modelo preparado em 2026-10-14

`pomodoro-model.ts` implementa os dois presets e um reducer puro com revisão capturada em cada comando. Ticks atualizam prazo/restante sem invalidar comandos humanos da mesma fase; pausa, retomada, término, erro de relógio e passagem à próxima fase avançam a revisão para recusar eventos antigos. Expiração mantém a fase concluída em `waiting`, sem executar a próxima. Relógio inválido/regressivo preserva o último restante confirmado e exige retomada humana; falha de relógio ao iniciar a próxima fase mantém `waiting` para retry explícito. Fim descarta a sessão; não há histórico ou persistência. Testes unitários incluem fronteiras exatas, background longo sem catch-up, duplicatas/stale e erro/retry.

`PomodoroProvider` pertence ao layout `/focus`, publica ações sincronamente com ref do estado confirmado para impedir comandos duplicados antes de render, observa AppState e usa ticks apenas no foreground. Retorno reconcilia somente a fase corrente. Owner de efeito e revisões descartam callbacks antigos; desmontagem remove listener/intervalo. Relógio injetável permite testar falhas sem alterar serviço externo.

`PomodoroScreen` tem presets, restante sem anúncio por segundo, estado polite, comandos explícitos para pausar/retomar/próxima fase e confirmação capturada de encerramento/saída. Se a fase mudar durante confirmação, pede revisão novamente. BackHandler focado usa o mesmo fluxo; callback tardio é descartado. Gestos de saída do stack da ferramenta ficam desabilitados para não contornar confirmação. Saída externa/blur/desmontagem descarta; rota direta tem fallback ao quadro e reentrada vazia. Nenhum banco/áudio/permissão/rede acrescentado; timer/avisos existentes intactos. Testes reais Expo Router/provider verificam fluxo, AppState sintético, modo9, erro de relógio e ownership. Native gesture/back, relógio/background/aparelho e leitores reais permanecem gate T011; testes JS não os comprovam.

## Stack

Inspeção em 2026-09-23: repositório sem código de aplicação, package.json, dependências ou ferramentas de build/teste. React Native e primeira versão sem backend são diretrizes explícitas do projeto, ainda não implementadas. Expo, linguagem, navegação e biblioteca de persistência não foram escolhidos. Não assumir stack web, banco ou servidor.

## Arquitetura atual

Somente README e licença antes desta preparação. Não há componentes, modelos ou serviços existentes para reutilizar. Os caminhos abaixo são propostas de organização e não arquivos já criados.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/focus/`.

- `src/features/focus/pomodoro` — [US-025] Executar sessão Pomodoro.
- `src/features/focus/stopwatch` — [US-026] Usar cronômetro de foco livre.

## Modelo de dados

Sessão de foco com modalidade, duração/preset, fase e estado; cronômetro com tempo acumulado. Histórico de sessões não exigido aqui.

Representação física, tipos e migrações serão definidos após a escolha técnica; não instalar banco por antecipação.

## Persistência

Estado durante a sessão; salvamento de sessões e comportamento após fechamento não definidos.

## Fluxos principais

Sequência de capacidades: Executar sessão Pomodoro → Usar cronômetro de foco livre.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Estado durante a sessão; salvamento de sessões e comportamento após fechamento não definidos.

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

Pausa/retomada e interrupção da sessão; sem penalizações por encerrar cedo (#25/#26).

As questões em aberto da spec, a ausência de plataforma-alvo definida e a falta de comandos de qualidade impedem afirmar prontidão de implementação/release. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Proposta: módulos por capacidade em `src/features/`, sem fixar extensão/linguagem nem arquitetura de estado.
- Pendente: plataformas e versões mínimas, bootstrap, navegação, persistência e ferramentas de qualidade.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
