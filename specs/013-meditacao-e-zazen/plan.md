# Plano de implementação — Meditação e Zazen

Spec: [spec.md](spec.md). Milestone #21; Issues #31, #32. Plano proposto, sujeito às questões em aberto.

## Plano vigente US031

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
