# Plano de implementação — Scripts de Comunicação

Spec: [spec.md](spec.md). Milestone #17; Issues #23, #24. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em2026-10-14: ExpoSDK57/ReactNative0.86.3/React19.2.3/TypeScriptstrict/ExpoRouter/JestRNTL; Node24.21.0/npm11.19.0. Sem backend. #23 precisa API clipboard nativa: verificar versão compatível/licença de expo-clipboard antes de instalar; não antecipar DB/TTS/editor de24.

## Arquitetura atual

Quadro em `src/app/index.tsx`, baixa estimulação global, padrões SafeArea/ScrollView/MaterialIcons/48dp/escalável/erros genéricos. APIs de voz existentes só serão usadas em24; clipboard deve ter adaptador local separado com importação controlada e contrato de sucesso após API.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/communication-scripts/`.

- `src/features/communication-scripts/script-catalog` — [US-023] Consultar scripts de comunicação prontos.
- `src/features/communication-scripts/script-editor` — [US-024] Criar e editar scripts personalizados.

## Modelo de dados

Script (identificador, texto, categoria, origem, favorito). Catálogo inicial empacotado; textos próprios locais.

US023: somente catálogo inicial imutável tipado `{id,categoryId,text}` e categorias rotuladas. Estado de filtro local. Origem/favorito/edição/persistência só em24; nenhum banco ou provider global por antecipação.

Representação física, tipos e migrações serão definidos após a escolha técnica; não instalar banco por antecipação.

## Persistência

Persistir scripts personalizados (#24); copiar texto somente por ação do usuário (#23).

US023 não persiste histórico da cópia nem lê/limpa clipboard. API escreve somente o texto do item confirmado por escolha explícita; ref-inflight impede duplicatas, callbacks desmontados não publicam feedback, falha permite retry manual sem expor erro bruto. Sucesso só após a escrita resolver verdadeira; retorno falso/erro não aparenta cópia.

## Fluxos principais

Sequência de capacidades: Consultar scripts de comunicação prontos → Criar e editar scripts personalizados.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Persistir scripts personalizados (#24); copiar texto somente por ação do usuário (#23).

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
- US023: catálogo/categorias/filtro/IDs/empty/cópia literal/pending/duplicatas/false/rejeição/retry/unmount/rotas/fallback/offline/mode9; testar adaptador real com fronteira SDK mockada explicitamente, sem chamar clipboard real em testes locais.
- Jestserial/lint/tipos/Doctor/56tooling/validador/review porIssue. Builds exclusivamente remotos/manuais no SHA integrado; gate nativo verifica clipboard real/sem voz/envio/readers/ampliação/foco/insets/alvos/offline. Nunca build local ou aparelho sem autorização.

Runner e checks existentes; mocks não validam clipboard real nem sistema/nativo/assistivo. Nada habilita release por documentação.

## Dependências técnicas

Base React Native ainda a inicializar. Selecionar somente as bibliotecas necessárias aos critérios da história, documentando suporte offline, plataformas e permissões. Integrações funcionais estão em spec.md; reuso de temporizador/áudio pode ser avaliado quando houver código, sem criar framework antecipado.

## Riscos

Catálogo vazio, falha na área de transferência, voz indisponível e falha de armazenamento (#23/#24).

As questões em aberto da spec, a ausência de plataforma-alvo definida e a falta de comandos de qualidade impedem afirmar prontidão de implementação/release. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Proposta: módulos por capacidade em `src/features/`, sem fixar extensão/linguagem nem arquitetura de estado.
- Pendente: plataformas e versões mínimas, bootstrap, navegação, persistência e ferramentas de qualidade.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
