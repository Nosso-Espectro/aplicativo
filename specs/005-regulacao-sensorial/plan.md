# Plano de implementação — Regulação Sensorial

Spec: [spec.md](spec.md). Milestone #11; Issues #9, #10. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo57.0.28/RN0.86.3/React19.2.3, TypeScript strict,
Router, SQLite e Node24.21.0/npm11.19.0 existentes. Jest/RNTL/SQLite real do Node,
lint/tipos/Doctor e tooling disponíveis. US-009 sem novas dependências/permissões,
builds somente remotos.

## Arquitetura atual

CAA, rotinas, perfil, editor de plano e contato integrados. RootLayout contém
Stack/providers; quadros de comunicação/favoritos compartilham CommunicationBoard
com imagem decorativa da marca e pictogramas essenciais. Provider pequeno e
controle global de baixa estimulação em `src/features/regulation/` aplicarão
somente apresentação; não copiar dados nem modificar editores/ações/voz.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/regulation/`.

- `src/features/regulation/low-stimulation` — [US-009] Ativar modo de baixa estimulação.
- `src/features/regulation/quick-panel` — [US-010] Acessar painel rápido de regulação.

## Modelo de dados

US-009: preferência `{enabled:boolean}`, defaultfalse, validação estrita sem
coerção. Apresentação remove imagem decorativa somente quando modo ativo; animação
Stack none quando modo ativo OU redução de movimento do sistema, default nos
outros casos. Não interpretar alteração de movimento do sistema como escolha
automática do modo. Estado desconhecido na restauração usa apresentação calma;
provider distingue desconhecido/confirmado, mantém comunicação utilizável e
expõe erros genéricos/retry. API AccessibilityInfo somente lê/respeita preferências
do sistema, não as altera. Ícone/splash native permanecem fora desse controle.

## Persistência

US-009 planeja SQLite privado `tear-display-preferences.db` versão1, singleton
enabled INTEGER0/1, fila/transação/rollback/schema futuro recusado. Publicar modo
confirmado somente após commit; falha mantém confirmado, erro e retry explícito,
switch bloqueado em operação duplicada. Não alterar tabelas/dados de outros
módulos. Controle global Switch com rótulo/estado e alvos48dp, um toque quando
visível; modal CAA exige voltar ao quadro. Todas as funções/pictogramas continuam
disponíveis, apenas imagem decorativa é omitida no quadro/favoritos e transições
do Stack são reduzidas. Painel #10 não exige banco próprio e continua pendente.

## Fluxos principais

Sequência de capacidades: Ativar modo de baixa estimulação → Acessar painel rápido de regulação.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Preferência deve restaurar sem rede; erro não bloqueia ferramentas nem aparenta
sucesso de gravação. Testar reabertura/interrupção em SQLite real do Node, mantendo
pendências SQLite Expo/assistivas/ampliação e movimento real no gate. Inicialização
desconhecida deve usar apresentação calma, sem afirmar flag restaurada antes da
leitura. Não sincronizar ou transmitir preferências.

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
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck e checks leves; builds nativos somente remotos no SHA integrado da main.

Derivar testes para normalização/apresentação/movimento, SQLite com reabertura/
rollback, provider/switch e rotas/quadros preservando ações e pictogramas. Executar
Jest serial, lint/tipos/Doctor,49 tooling e validador. Mocks/build não comprovam
leitores de tela/foco/ampliação, movimento ou abertura offline em aparelho.

## Dependências técnicas

US-009 usa RootLayout/Stack, SQLite e APIs RN existentes. Sem novas dependências,
framework de tema, destinos falsos ou requisito de implementar painel antes. A
navegação inferior discutida não pertence a esta branch. #10/#12/#17/#27 mantêm
dependências de integração próprias; segurança do host #61/auditoria #51 não são
resolvidas pelo modo e nenhum teste autoriza instalação arriscada no celular.

## Riscos

Destinos de atalhos indisponíveis e preferência não salva (#9/#10); comportamento dos destinos P1 bloqueado por Q-REG-01.

US-009 Ready após refinamento vivo e confirmação da stack. Q-REG-01/03 continuam
na #10; não mudar critérios/prioridades, simular atalhos ou liberar milestone por
entregar somente modo. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-009: TypeScript, provider restrito à preferência global, Switch/Stack/RN/SQLite existentes; sem alterar dados ou ações das ferramentas.
- #10: painel/destinos e integração real com #12 continuam pendentes, sem antecipação nesta branch.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
