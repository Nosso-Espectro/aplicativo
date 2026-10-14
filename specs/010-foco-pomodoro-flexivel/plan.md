# Plano de implementação — Foco / Pomodoro Flexível

Spec: [spec.md](spec.md). Milestone #18; Issues #25, #26. US025 refinada em 2026-10-14; US026 permanece sujeita às questões próprias.

## Plano vigente US025

Stack confirmada: Expo SDK57, React Native0.86.3, React19.2.3, TypeScript strict, Expo Router e Jest. O temporizador US017 e avisos US018 já existem; ler seus modelos, relógio/AppState, layouts e testes antes de implementar, sem alterar seus bancos, sessão ou consentimentos. Caminho da ferramenta: `src/features/focus/` e rotas próprias sob `src/app/focus/`, acesso pelo quadro e retorno com fallback.

Reducer/modelo puro com preset, fase foco/pausa, estado inicial/em curso/pausado/aguardando próxima fase, restante e prazo. Relógio injetável nos testes; capturar comandos/identidade da sessão para rejeitar eventos antigos e duplicatas. Não somar ticks como fonte da verdade. Ao retornar de background, calcular apenas o período atual, limitar restante a zero e aguardar ação humana para a próxima fase. Tratar relógio inválido ou regressivo sem avançar fase.

Provider pertencente ao layout da ferramenta, somente memória. Dispose e saída descartam callbacks e sessão; saída explícita ativa pede confirmação. Preset não muda no meio da sessão. UI reutiliza padrões de SafeArea, Scroll, modo9, alvos48dp, texto escalável e anúncios polite sem som/movimento inesperado. Não criar banco/dependência/permissão/rede ou notificação por conveniência.

Testes: presets e relógio controlado, pausa/retomada, fim de ambas fases, confirmação da próxima, atraso/background sem catch-up, relógio regressivo, comando antigo/duplicado, saída/cancelamento/desmontagem/reentrada vazia, router/fallback/modo9 e regressões timer/avisos existentes. Checks leves serializados; acessibilidade e background real dependem do gate nativo, não de mocks. #82 personalização e #26 cronômetro fora da branch.

As seções abaixo são contexto da preparação original; afirmações de ausência de código/stack em 2026-09-23 não descrevem o estado atual. Este plano vigente prevalece para #25.

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
