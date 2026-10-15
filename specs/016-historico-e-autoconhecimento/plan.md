# Plano de implementação — Histórico e Autoconhecimento

Spec: [spec.md](spec.md). Milestone #24; Issues #38, #39, #40. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-15: Expo 57, React Native 0.86.3, React 19.2.3, TypeScript 6, Expo Router e expo-sqlite já instalados. Jest/RNTL, lint e typecheck existentes. Sem novas dependências ou backend.

## Arquitetura atual

CheckInForm mantém respostas efêmeras e RoutinePlayer apresenta progresso SQLite. Integrar botão de snapshot apenas nos estados finalizados, sem alterar seus DAOs ou transformar conclusão em coleta. Reutilizar MaterialIcons, SafeAreaView, padrões de foco/owner e lista Ferramentas. As propostas de #39/#40 abaixo não são implementação autorizada.

### Decisão de implementação US-038

- `src/features/history/history-model.ts`: união discriminada validada, snapshot mínimo e resumo de respostas com labels existentes.
- `history-database.ts`: banco próprio `tear-history.db`, schema 1, parâmetros SQL, validação de entrada/leitura, transações exclusivas e FIFO; ID idempotente, rejeitar mesmo ID com conteúdo diferente. Listagem ordenada por instante e rowid. Não modificar bancos de origem.
- `history-storage.ts`: abertura lazy compartilhada; falha de abertura permite retry. Não abrir nem gravar ao renderizar botão. Web explicitamente indisponível, sem fallback volátil fingindo persistência.
- `SaveHistoryButton.tsx`: intenção efêmera com snapshot no primeiro toque; busy síncrono, retry com mesma intenção, owner por foco. Nenhuma navegação tardia. Após sair, commit autorizado pode terminar sem reativar feedback.
- `HistoryScreen.tsx` e `/history`: consulta a cada foco, ignorar respostas antigas, filtros radio, estados explícitos e retorno; sem conteúdo sensível em parâmetros/erros/logs.
- Snapshot de rotina pode ser salvo ao consultar uma rotina já concluída. Por sessão de apresentação, apenas um; nova consulta permite nova escolha explícita, não representa contagem automática de execuções.
- Cobrir persistência/reabertura, ordenação/empates/filtros, validação, idempotência/rollback/retry com SQLite Node real; controles e navegação com RNTL/Router, erros e callbacks stale; regressões check-in/rotinas/Ferramentas.
- Executar suíte serial, lint, tipos, Doctor e tooling/validador existentes. Sem build local. Gate nativo separado, sem alegar SQLite Expo, leitores ou armazenamento web aprovados pelos testes Node.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo US-038: `src/features/history/`. Os nomes abaixo para #39/#40 continuam propostas.

- `src/features/history/HistoryScreen.tsx` — [US-038] Consultar histórico de registros.
- `src/features/history/trends` — [US-039] Visualizar tendências simples.
- `src/features/history/record-deletion` — [US-040] Excluir dados do histórico.

## Modelo de dados

União discriminada `check-in`/`routine`, ID próprio e instante em milissegundos da ação. Payload apenas com respostas válidas fornecidas ou nome/quantidade de etapas. Sem IDs de origem, imagens, sugestões, causa clínica ou eventos de outras ferramentas.

Schema 1 em SQLite próprio: ID primário, saved_at e conteúdo JSON validado; índice por saved_at. Ordem decrescente por saved_at e rowid. Q-HIST-01 resolvida para #38; períodos/agregados permanecem #39, não implementados aqui.

## Persistência

Snapshots persistem entre sessões sem expiração automática. O botão informa os dados salvos e só abre o banco ao toque; lista abre ao consultar. Exclusão #40 e derivados #39 não fazem parte desta implementação. Não alterar/remover dados das origens.

## Fluxos principais

US-038: concluir check-in/rotina → escolher salvar ou sair sem salvar → consultar Ferramentas/Histórico → filtrar → voltar ao quadro. Conclusão por si só não gera registro.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Salvar/consultar não usam rede, autenticação nem serviços externos. Falha na gravação não anuncia sucesso; retry mantém ID da intenção. Dados inválidos/schema futuro falham sem reset/descarte automático. A prévia web informa indisponibilidade, sem persistência volátil apresentada como durável.

Recursos locais não devem depender de autenticação ou API. Capacidades externas explicitamente solicitadas devem informar indisponibilidade sem impedir os recursos locais; não confundir falta de backend próprio com ausência de qualquer serviço externo futuro.

## Acessibilidade

Aplicar RNF-001 e a Skill accessibility-neuroinclusive: rótulos e ordem de foco, leitor de tela, texto ampliado, contraste e alvos de toque. Verificar teclado quando suportado pelo dispositivo. Respeitar preferências de som/movimento e não ativar mídia inesperadamente. Critérios mensuráveis faltantes precisam de refinamento, não de aprovação automática.

## Privacidade e segurança

Aplicar RNF-002 e RNF-004. Usar dados sintéticos nos testes; evitar dados pessoais em logs. Controlar compartilhamento e permissões nas ações que realmente necessitam deles. Não adicionar telemetria, conta ou serviço externo por conveniência técnica.

Dados sensoriais são sensíveis. SQLite fica no sandbox do aplicativo; não há criptografia adicional nesta Issue nem promessa de proteção contra aparelho comprometido/backup do sistema. Android já declara allowBackup=false; isso não atesta iOS/manifesto final ou comportamento do OS. Sem logs de conteúdo, parâmetros de rota pessoais, imagens ou cópia dos arquivos de origem. Retenção e futura exclusão exigem gate nativo e #40 antes de declarar a milestone pronta.

## Estratégia de testes

- Derivar cenários de cada RF, preservando a relação Issue → RF → task → teste.
- Usar testes unitários para transformações de estado/dados; componentes para interação e acessibilidade; integração para persistência/capacidades nativas quando pertinentes.
- Exercitar os casos de erro do spec e regressões das dependências reais.
- Verificar em dispositivo/simulador os fluxos que dependem de voz, áudio, permissões ou notificações; mocks isolados não comprovam suporte nativo.
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck e checks leves antes de concluir a Issue; builds nativos manuais no GitHub Actions e testes em aparelho pertencem ao gate, sem build local automático.

A suíte existente usa Jest/RNTL e adaptadores SQLite Node. Verificações documentais não equivalem a testes do produto; nem testes Node equivalem a SQLite Expo ou leitores reais.

## Dependências técnicas

Reutilizar stack e bibliotecas existentes. Nenhuma nova dependência, permissão, engine de áudio, scheduler ou instrumentação global.

## Riscos

Sem registros, filtro/período vazio e falha de exclusão; manter coerência dos agregados (#38–#40).

US-038 Ready após refino; #39/#40 ainda dependem das suas questões. Retenção sensível, backup do OS, SQLite Expo e acessibilidade real precisam de verificação específica; não declarar release/milestone pronta.

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Módulo coeso em `src/features/history/`, DAO local lazy e estado de apresentação efêmero, sem provider global nem alterações de schema nas origens.
- Pendente: verificações nativas e refino/implementação separados de #39/#40.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
