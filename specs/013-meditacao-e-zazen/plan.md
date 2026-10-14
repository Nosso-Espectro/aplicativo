# Plano de implementação — Meditação e Zazen

Spec: [spec.md](spec.md). Milestone #21; Issues #31, #32. Plano proposto, sujeito às questões em aberto.

## Plano vigente US032

Issue32 Ready após refino [6175665780](https://github.com/Nosso-Espectro/aplicativo/issues/32#issuecomment-6175665780) e revisão editorial de fontes/direitos/autonomia, antes código. Base main24646a0/US031PR99 integrada, 857Jest99/Doctor21/21 e CI38615605708SUCCESS2min9s; manter T01131 pendente. Stack real Expo57/RN0.86/React19/Router/Node24.21.0/npm11.19.0, sem novas dependências.

Local zazen-guide.ts: conteúdo editorial original curto em pt-BR com revisão,
introdução de limites, três seções e bibliografia. Pesquisa primária:
[Sotoshu](https://www.sotozen.com/eng/zazen/howto/) e
[Zen Studies Society](https://zenstudies.org/teachings/how-to-practice/);
[copyright Sotoshu](https://www.sotozen.com/eng/copyright/index.html) não autoriza
republicar seus textos/PDFs/imagens. Nenhum material copiado/tradução literal,
licença aberta alegada, download ou link externo ativo no app. Fonte não é
conteúdo licenciado importado; registrar mapa editorial/proveniência em docs.
Não prometer benefício clínico nem exigir lotus/ritmo respiratório/ritual.

Validação síncrona da estrutura completa antes apresentar; retornar cópia
imutável de dados locais/sem getters/arrays esparsos incompletos. Ausente,
malformado ou erro local mantém heading/back e erro neutro; nenhuma carga remota,
retry falso ou exposição de detalhes. Não introduzir loader assíncrono/provider,
DB/conta/histórico/telemetria/permissão/mídia/TTS/deps por conteúdo estático.

ZazenGuideScreen leitura unframed/ScrollView/SafeArea/escalável e rota fina
/meditation/zazen/usePanelReturn, atalho Ferramentas/menu-book. Back hardware
somente focado, callback removido após blur não navega; sem iniciar/alterar
meditação31, Timer, Pomodoro, sons, hidratação ou frase. Não tocar prévia8093.

Tests modelo (conteúdo/revisão/referências/sem alegação clínica/clones/ausente/
malformado/getters/sparse) e Router com fronteiras reais (drawer/voltar/fallback/
hardwarebackstale/mode9/CAA/offline). Related/fullJestserial/linttipos/Doctor
56tooling/validadordiffreview/CI último head antes DoD. T012 native posterior
assistivo/reflow/foco/insets/alvos/offline; mocks não aprovam gate.
Nenhuma task32 verificada/código32 neste refino; árvore limpa antes branch32.

Execução32: zazen-guide.ts/ZazenGuideScreen/rota /meditation/zazen/Ferramentas
implementados com recurso original local e bibliografia sem links ativos.
docs/zazen-guide-provenance.md registra fontes/redação/direitos/limites.
Normalizador captura campo uma vez/IDs estritos e copia/freeze completo,
rejeita sparse/ausente/corrupção/getter sem detalhes privados; não cria loader.
Focus/back usa Router real/closeRef atualizado, callback antigo após blur/unmount
não navega. UI88/headerFrase/drawer e timers31/focus/avisos preservados.

19 testes novos(12modelo7Router),223relacionados19/876Jest101 serial PASS;
tipos/lint sem warnings/Doctor21/21/56tooling/validadordiffcheck PASS.
Fixtures iniciais (getter avaliado pelo nome it.each/render sem NavigationContainer)
corrigidas com factorynames/Router real sem fakeAPI/timeout/supressão.
Tipo unknown do id corrigido com expectedId após comparação estrita, sem cast.
Review de conteúdo/RF-RNF/code/privacy/offline/UI/diff não encontrou regressão
impeditiva; nenhum pacote/config/permissão/DB/histórico/player/voz alterado.
T006-T010 verificadas; PR100 anexado, CI38620299198 SUCCESS no head7f6e63f8e26c07e0c42b5d5b8c138ad016217950. Conferir último head documental verde antes squash. Android/iOS SKIPPED não são builds; T012 nativo PENDENTE.
Sem host/nativejob/buildlocal/phone/preview8093/tag/release nesta execução.

## Histórico US031 — Integrada PR99

Retomada após97: PR98 MERGED/main2bb0ec7, PRCI38612713569SUCCESS1min53s
e mainpush38613136392SUCCESS2min10s com Tests serial/Doctor. Main95FAIL
continua histórico, contenção não é causa comprovada. Branch31 recebeu
origin/main por merge e7e1618 em árvore limpa/sem conflitos, sem reescrever
histórico ou reimplementar modelo/provider/UI. Repetir checks neste estado
antes T005/PR/DoD; registros de bloqueio95/97 abaixo são históricos.

Checks pós-merge97:28 novos/204relacionados17/857Jest99 serial PASS,
tipos/lint sem warnings, Doctor21/21,56tooling/validadordiffcheck PASS.
Revisão manual de modelo/provider/tela/rota/testes/RF-RNF/privacidade/offline:
nenhuma regressão impeditiva identificada. Diff contra main somente meditação
e atalho drawer/documentos13, sem pacote/config/permissão/banco/voz alterado.
T005 aguarda PR/CI último head; T011 assistivo/reflow/foco/insets/clockbg
e offline em binário real permanece PENDENTE. Preview8093/aparelho intactos.

PR99 anexado, CI38614583004 SUCCESS2min4s no head2865b65; T005 verificada.
Antes squash autorizado reconferir último commit documental verde e, após
integração, observar mainpush. Android/iOS SKIPPED NÃO builds. T011 continua
pendente, guia32 não Ready, nenhuma milestone/release/instalação autorizada.

Atualização após manutenção95: PR96 MERGED/main2af9db2 em2026-10-14T17:53Z,
CI38610210270SUCCESS1min15s e Doctor21/21 da manutenção. Branch31 recebeu
origin/main por merge d5471c9 somente árvore limpa, sem conflitos/rebase/force.
Bloqueio Doctor20/21 do checkpoint abaixo é HISTÓRICO/resolvido pela95.
Nenhum modelo/provider/UI31 reimplementado ou dependência adicional31.
Repetir related/fullJestserial/tiposlintDoctor56tooling/validadordiffreview e
CI do último head31 antes concluir T005/PR/DoD. Contagens anteriores não são
atestação do estado pós-merge; T011 nativo continua PENDENTE.

Pós-merge95:203relacionados16/856Jest98/linttipossemwarnings/Doctor21/21 PASS.
Main95push38610475617 teve825PASS/3FAIL: dois testes de navegação excederam
5000ms e houve falha subsequente; PR96CI verde não oculta esse run. Workflow
usa paralelismo padrão Jest. [Issue97](https://github.com/Nosso-Espectro/aplicativo/issues/97)
separa execução serial do CI leve com mesmos testes/asserts/timeouts/gates.
Contenção é hipótese, não causa comprovada ou defeito funcional descartado.
Preservar31 em checkpoint/semPR/DoD enquanto manutenção97 é validada;
após main97 repetir checks31. Não rerun/cancelar jobs nem ampliar timeout.

Checkpoint de qualidade:855Jest98/200relacionados15/tipos/lint semwarnings/56tooling/validadordiffcheck PASS. Doctor ATUAL20/21 FALHA por seis patches ExpoSDK57 novos, não regressão atribuída à31 (manifest/lock idênticos àmain3172bbd). Primeiro timeout de schema resolvido com DNSIPv4 somente no comando; mismatch permanece. [Issue95](https://github.com/Nosso-Espectro/aplicativo/issues/95) separa manutenção da base/patches/changelogs/licenças/API/lock/gates, sem suprimir checks. T005 NÃO verificada/semPR/DoD/entrega31. Preservar código em checkpoint na branch31, integrar main após95 somente árvore limpa e repetir checks antes PR. Nenhuma dependência atualizada31/host/phone/preview/build operado. Falha anterior lint owner/setState corrigida via publicação assíncrona guardada e ready/StrictMode testados; não repetir nem esconder bloqueio Doctor atual.

Implementação31: meditation-model.ts/provider/tela/rota /meditation/Ferramentas reais. Duração1-180/draft10/presets5,10,20,30/start explícito/minimal/restante/pausa-retomada/encerrar/nova prática/geração/clockinvalid-regressivo-overflow/finishúnico/resultado efêmero; aviso visual defaultOFF/optinpolite/dismiss sem replay, nenhum áudio/vibração/TTS/notificação. Provider publica owner assíncrono guardado após cleanup inicialStrictMode; comandos bloqueados até ready, callbacks capturam owner/revisão, intervalo obsoleto não atinge retomada; AppState reconcilia sem promessaJSsuspenso/processomorto. Backfocado/gestosdesabilitados/confirmarsaída/blurdiscard/reentradavazia/fallback/48dp/input-switchhitSlop/wrap/textoescalável/mode9; quadroHome/headerFrase/drawer preservados.

28 testes novos (17modelo/11Router-provider),200relacionados15 e855Jest98 completos PASS. Fonte RN0.86 HardwareBackPressEvent(type/timeStamp) conferida; fixtureRouter reinstala Date.now spy após renderRouter, sem falsa API/timeout/supressão. Fetch rejeitado nos testes de fluxo, sem chamadas; memória apenas/semDB-deps-permissões-conta-rede-histórico/PII/conteúdo clínico. Review do código/RF/RNF/privacidade/offline/UI/isolamento não encontrou regressão impeditiva; readers/reflow/foco/clockbg/lock reais continuam T011. T001-T004 verificadas, T005 aguarda checks finais/CI; nenhuma operação de host/jobs/buildlocal/phone/preview8093. Este estado substitui a ausência de código descrita no refinamento histórico abaixo.

Base integrada3172bbd/US030. Refino funcional [Issue31](https://github.com/Nosso-Espectro/aplicativo/issues/31#issuecomment-6173145689); Ready somente31, guia32 não Ready. Expo57/RN0.86/React19/TSstrict/Router/Node24.21.0/npm11.19.0 reais; os estados históricos de ausência de stack abaixo não são instruções atuais. Nenhum código31 implementado/tasks verificadas neste refinamento.

Ler e seguir os padrões reais de focus/StopwatchProvider/StopwatchScreen, PomodoroProvider/model e transition-timer/visual-timer sem alterar sessões/avisos/bancos existentes. Modelo próprio de contagem regressiva efêmera: duração1-180min/configuração de aviso visualOFF-ON capturadas no iniciar; restante confirmado/baseline/lastclock/revisões, comandos pause/resume/end/new e finish único. Clock inválido/regressivo/overflow pausa preservando restante confirmado e opção de aviso; recomeço inválido não apaga resultado. Tick somente da sessão running, sem decremento artificial por intervalo ou revisões por render. Sem DB/histórico/player/permissão/deps/rede.

Provider de sessão/owner, clock Date.now e AppState conforme padrões existentes: reconciliação ao retornar, callbacks capturados/revisão/stale/dup/dispose e saída descartam efêmero sem atingir outras ferramentas; não prometer execução JS suspensa/processo morto. Resultado final permanece apenas na tela, aviso visual/polite somente se escolhido antes de iniciar/defaultOFF, nunca mídia/notificação/TTS/haptic. Não criar handler global nem repetir conclusão.

UI/rota fina /meditation, acesso na lista Ferramentas: configuração separada durationdraft10/presets5,10,20,30 e switch aviso defaultOFF, iniciar humano; prática minimalista com restante/pausa-retomada/encerrar, nova sessão explícita; confirmar sair ativa-paused, hardwareback focado/gestos/blur externo/unmount/fallback e reentrada vazia. SafeArea/48dp/wrap/texto escalável/foco/mode9; sem conteúdo clínico/guia32. Preservar headerFrase/boardHome/toolsdrawer88 e todos contratos Timer/Pomodoro/cronômetro/sons/CAA.

Testar modelo/provider/Router reais (fronteiras nativas simuladas apenas onde necessárias): intervalo/overflow/defaultOFF/draft/avisoON-OFF/fim único/clockbg/invalid-regressivo/stale/dup/unmount/saídas/retornos/fallback/mode9/offline e regressões relacionadas, fullJest serial/linttipos/Doctor56toolingvalidadordiffreview/CI leve antes DoD. Task só após comportamento; T011 nativo posterior no SHA integrado verifica leitores/ampliação/insets/alvos/foco/offline/clockbg/lock/backgestos. Sem build local/host/jobs/celular/preview8093 nesta Issue; docs não aprovam release.

As seções seguintes são histórico documental de2026-09-23 e não afirmam ausência atual da stack.

## Stack

Inspeção em 2026-09-23: repositório sem código de aplicação, package.json, dependências ou ferramentas de build/teste. React Native e primeira versão sem backend são diretrizes explícitas do projeto, ainda não implementadas. Expo, linguagem, navegação e biblioteca de persistência não foram escolhidos. Não assumir stack web, banco ou servidor.

## Arquitetura atual

Somente README e licença antes desta preparação. Não há componentes, modelos ou serviços existentes para reutilizar. Os caminhos abaixo são propostas de organização e não arquivos já criados.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/meditation/`.

- `src/features/meditation/meditation-timer` — [US-031] Usar temporizador de meditação.
- `src/features/meditation/zazen-guide` — [US-032] Consultar guia introdutório de Zazen.

## Modelo de dados

Duração escolhida, estado do timer e aviso configurado; conteúdo introdutório local. Sem dados clínicos.

Representação física, tipos e migrações serão definidos após a escolha técnica; não instalar banco por antecipação.

## Persistência

Guia offline (#32). Retenção das preferências do timer não especificada.

## Fluxos principais

Sequência de capacidades: Usar temporizador de meditação → Consultar guia introdutório de Zazen.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Guia offline (#32). Retenção das preferências do timer não especificada.

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

Duração inválida, interrupção do timer e ausência de conteúdo local; não transformar o guia em tratamento (#31/#32).

As questões em aberto da spec, a ausência de plataforma-alvo definida e a falta de comandos de qualidade impedem afirmar prontidão de implementação/release. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Proposta: módulos por capacidade em `src/features/`, sem fixar extensão/linguagem nem arquitetura de estado.
- Pendente: plataformas e versões mínimas, bootstrap, navegação, persistência e ferramentas de qualidade.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
