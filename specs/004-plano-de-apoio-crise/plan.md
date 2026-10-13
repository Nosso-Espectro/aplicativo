# Plano de implementação — Plano de Apoio / Crise

Spec: [spec.md](spec.md). Milestone #12; Issues #11, #12, #13. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo SDK57.0.28, RN0.86.3, React19.2.3, TypeScript strict,
Expo Router e expo-sqlite já integrados. Node24.21.0/npm11.19.0, Jest/RNTL,
SQLite real do Node, lint/typecheck/Doctor e tooling existentes. Sem novas
dependências/permissões para US-011; builds nativos somente remotos.

## Arquitetura atual

Comunicação, rotinas e perfil integrados. US-011 reutiliza os padrões de formulário
local, salvar/cancelar e erro genérico, em `src/features/support-plan/`, com rota
`/support-plan` acessada por comando no quadro. O contrato do perfil
`readSupportForPlan(selected)` já retorna somente dados atuais explicitamente
escolhidos; sem dependência circular ou mudança em comunicação/rotinas/perfil.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/support-plan/`.

- `src/features/support-plan/plan-editor` — [US-011] Cadastrar plano pessoal de apoio.
- `src/features/support-plan/support-card` — [US-012] Exibir cartão de apoio em tela cheia.
- `src/features/support-plan/trusted-contact` — [US-013] Acionar contato de confiança pelo WhatsApp.

## Modelo de dados

US-011: um plano pessoal com `instructions` livre opcional, IDs das quatro sugestões
predefinidas e IDs dos campos de suporte escolhidos voluntariamente. Seleções
inicialmente vazias, validadas, deduplicadas e em ordem previsível; texto com trim
externo, sem interpretação clínica. Valores referenciados no perfil são lidos
atuais, não copiados. Contato/mensagem e visualização em cartão ficam nas #13/#12.

## Persistência

Andamento inicial da US-011: `support-plan.ts` implementa modelo/normalização,
quatro sugestões originais, seleção vazia, IDs validados e referências sem texto
copiado do perfil. Seis testes unitários aprovados, lint/typecheck verdes. Editor,
SQLite, navegação e cenários de persistência/erro ainda não implementados; nenhuma
task de entrega marcada concluída e Issue #11 permanece aberta.

US-011 planeja banco privado `tear-support-plan.db`, schema próprio inicial,
singleton de texto e tabelas separadas de IDs das sugestões/referências. Operações
parametrizadas em fila/transação exclusiva; ler resultado antes do commit,
publicar somente após sucesso, rollback preserva versão confirmada. Schema futuro
recusado sem downgrade. Salvar vazio é permitido; remoção integral confirmada
limpa apenas o plano. Sem snapshot de texto do perfil, rede, log pessoal ou backup
externo do aplicativo. Política de backup do sistema permanece revisão nativa.

## Fluxos principais

Sequência de capacidades: Cadastrar plano pessoal de apoio → Exibir cartão de apoio em tela cheia → Acionar contato de confiança pelo WhatsApp.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Editor e reabertura do plano devem operar com SQLite local sem rede. Erro mantém
draft/confirmado e permite retry/cancelar; abertura falha não habilita gravação.
Se leitura de referências do perfil falhar, não publicar conteúdo antigo nem
substituir orientações salvas. Recuperação/interrupção e política de backups
exigem evidência no SQLite Expo antes do gate.

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
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck quando aplicável e checks leves; builds somente remotos no SHA integrado da main.

US-011: testar modelo/seleção, SQLite real para reabertura/rollback/isolamento,
componentes e navegação para sugestões, edição, remover/cancelar, vazio, erro e
duplicatas; integração com referências atuais do perfil. Checks existentes: Jest
serial, lint, typecheck, Doctor, unittest tooling e validador. Mocks/SQLite do host
não equivalem a TalkBack/VoiceOver, foco, ampliação e abertura offline nativa.

## Dependências técnicas

Base React Native existente, contrato de leitura de suporte da US-015. US-011 não
depende de implementar cartão, painel, áudio, timer ou WhatsApp. Sem antecipar
framework ou integração externa. Segurança do host de build continua pendente na
#61, sem interferir no modelo local ou autorizar instalação arriscada no celular.

## Riscos

Plano vazio, contato inválido e WhatsApp ausente; #13 exige informar indisponibilidade sem falhar. Tratamento de validação detalhado em Q-APOIO-03.

US-011 está Ready após refinamento no GitHub e confirmação da stack. Questões
Q-APOIO-02/03/04 continuam nas histórias dependentes; não aprovar milestone/release
por implementar somente o editor. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-011: TypeScript, módulo por capacidade, formulário local em rota Router e SQLite próprio; sem novas dependências ou estado global para esse editor.
- #12/#13: decisões de cartão/compartilhamento/contato continuam pendentes e não integram esta branch.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
