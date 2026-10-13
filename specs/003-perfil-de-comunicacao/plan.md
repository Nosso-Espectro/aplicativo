# Plano de implementação — Perfil de Comunicação

Spec: [spec.md](spec.md). Milestone #13; Issues #14, #15, #16. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo SDK57/RN0.86.3/React19.2.3, TypeScript strict, Expo Router e SQLite já integrados. Node24.21.0/npm11.19.0, Jest/RNTL, lint/typecheck e Expo Doctor existentes. US-014 reutiliza essa base sem novas dependências/permissões. Builds manuais remotos; nenhuma compilação local.

## Arquitetura atual

Comunicação e rotinas implementadas. Perfil tem rota `/profile`, módulo `src/features/communication-profile/` e acesso explícito pelo quadro. Estado do formulário apenas nessa tela; carregar uma vez, preservar edição em erro, salvar explicitamente e confirmar remoção integral. Sem alterar frases/favoritos/rotinas nem implementar navegação global.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/communication-profile/`.

- `src/features/communication-profile/preferences` — [US-014] Cadastrar preferências de comunicação.
- `src/features/communication-profile/sensitivities` — [US-015] Registrar sensibilidades e estratégias de suporte.
- `src/features/communication-profile/profile-summary` — [US-016] Visualizar resumo do perfil para terceiros.

## Modelo de dados

Perfil com formas de comunicação, necessidade de tempo adicional, sensibilidades, estratégias úteis/evitadas e seleção explícita de informações para apresentação. Sem conta remota.

US-014: banco privado `tear-profile.db` versão1, tabela singleton `communication_preferences(id=1, communication, instructions, extra_time)`. Textos opcionais livres, trim externo; extra_time NULL/1/0 diferencia não informado/preciso/não preciso. Transação exclusiva com leitura do resultado antes do commit, fila de leituras/escritas, UPSERT parametrizado. Salvar campos vazios ou não informado remove a informação; remoção integral salva o modelo vazio após confirmação. Schema futuro é recusado sem downgrade. Sem antecipar campos de #15/#16 ou flags de compartilhamento.

## Persistência

Preferências locais por padrão (#14); seleção de compartilhamento controlada pelo usuário (#16). Definir contrato de reutilização no plano (#15).

## Fluxos principais

Sequência de capacidades: Cadastrar preferências de comunicação → Registrar sensibilidades e estratégias de suporte → Visualizar resumo do perfil para terceiros.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Preferências locais por padrão (#14); seleção de compartilhamento controlada pelo usuário (#16). Definir contrato de reutilização no plano (#15).

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

Checks existentes: Jest serial, lint, typecheck, Expo Doctor, unittest de tooling e validador de workflow. Cinco testes SQLite real do Node24 e seis componentes com fronteira nativa simulada cobrem reabertura, tri-state, edição/remoção, rollback, retry e duplicatas. Não equivalem a validação SQLite Expo/TalkBack/VoiceOver no aparelho, que permanece pendente.

## Dependências técnicas

Base integrada da US-041, com SQLite já usado por comunicação/rotinas; sem inicialização técnica extra ou nova biblioteca. Banco do perfil separado não modifica schema dos módulos existentes.

## Riscos

Campos ausentes, nenhuma informação selecionada e falha ao salvar; não incluir informações não autorizadas no resumo (#14–#16).

Questões de #15/#16 não bloqueiam US-014 refinada na Issue. Privacidade do app foi revisada sem rede/logs/compartilhamento; backups do sistema, foco/teclado/ampliação e armazenamento offline em plataformas precisam de revisão nativa antes do gate. Não aprova release. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Proposta: módulos por capacidade em `src/features/`, sem fixar extensão/linguagem nem arquitetura de estado.
- Pendente: plataformas e versões mínimas, bootstrap, navegação, persistência e ferramentas de qualidade.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
