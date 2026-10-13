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

US-013 Ready: contato separado com nome opcional, telefone internacional com
código do país explícito e mensagem livre; sem valores iniciais ou leitura de
agenda. Nome é apenas rótulo local, não compõe mensagem enviada. Configuração
válida exige telefone/mensagem; remoção integral confirmada pode salvar vazio.
Nenhuma verificação de existência da pessoa/conta WhatsApp.

Validação planeja `libphonenumber-js` versão1.13.15, importação `/max` para
metadados completos, parser estrito `extract:false`, formato internacional
normalizado e rejeição de ramal. Biblioteca de domínio evita implementar parser
telefônico próprio; metadados embarcados operam offline, sem API. Versão fixada no
lockfile; licença/impacto de dependência revisados na implementação. Referências:
[biblioteca](https://github.com/catamphetamine/libphonenumber-js),
[WhatsApp](https://faq.whatsapp.com/5913398998672934) e
[Linking RN0.86](https://reactnative.dev/docs/0.86/linking).

## Persistência

US-011 implementada em `SupportPlanScreen.tsx`, `support-plan.ts` e
`support-plan-database.ts`: texto livre, quatro sugestões originais e referências
opcionais aos campos atuais do perfil. Rota `/support-plan` acessada pelo quadro,
salvar/cancelar explícitos e remoção integral confirmada apenas do plano. Modelo,
SQLite real do Node, componentes e rotas verificam os fluxos; validações
nativas/assistivas e de backup permanecem pendentes em T006.

US-011 usa banco privado `tear-support-plan.db`, schema próprio versão1,
singleton de texto e tabelas separadas de IDs das sugestões/referências. Operações
parametrizadas em fila/transação exclusiva; ler resultado antes do commit,
publicar somente após sucesso, rollback preserva versão confirmada. Schema futuro
recusado sem downgrade. Salvar vazio é permitido; remoção integral confirmada
limpa apenas o plano. Sem snapshot de texto do perfil, rede, log pessoal ou backup
externo do aplicativo. Política de backup do sistema permanece revisão nativa.

US-013 planeja SQLite privado `tear-trusted-contact.db` versão1 com singleton de
nome/telefone/mensagem, fila/transação parametrizada/rollback e publicação após
commit. Independente de plano/perfil; salvar/cancelar não abrem outros apps.
Editor/acionamento em rota própria pelo quadro. Antes de handoff, mostrar destino
e mensagem salvos para revisão e confirmar explicitamente. Formar link oficial
`wa.me` com telefone/mensagem codificados, verificar disponibilidade com Linking e
consultas nativas mínimas; informar falha/ausência e manter configurações, sem
fallback, cópia automática de plano/perfil, envio ou leitura de agenda. Fluxo
externo usa rede/app somente por ação autorizada; operação local fica offline.
Testes de URI/Linking usam mocks e fixtures sintéticas, não aplicativos/dados
pessoais do aparelho; handoff nativo continua pendência real do gate.

## Fluxos principais

Sequência de capacidades: Cadastrar plano pessoal de apoio → Exibir cartão de apoio em tela cheia → Acionar contato de confiança pelo WhatsApp.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Editor e reabertura do plano devem operar com SQLite local sem rede. Erro mantém
draft/confirmado e permite retry/cancelar; abertura falha não habilita gravação.
Se leitura de referências do perfil falhar, não publicar conteúdo antigo nem
substituir orientações salvas. Recuperação/interrupção e política de backups
exigem evidência no SQLite Expo antes do gate. A prévia web informa indisponibilidade
do armazenamento nativo, sem substituir persistência por dados simulados.

No editor, a leitura do perfil usa inicialização compartilhada, resultados ligados
à seleção exata e descarte de requisições obsoletas. Desmarcar um campo não exibe
resultado que chegaria depois; alterar seleção oculta o conteúdo anterior até a
leitura atual. Retry é independente e uma falha do perfil não impede editar ou
salvar as próprias orientações/IDs; nenhum dado antigo é publicado no erro.

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

US-011 entregue pelo PR67, US-013 Ready após refinamento no GitHub e confirmação
da stack. US-012 aguarda painel #10 para cumprir acesso direto, não simulá-lo nem
fechar a Issue. Q-APOIO-02/04 continuam nas histórias dependentes; não aprovar
milestone/release por implementar somente editores. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-011: TypeScript, módulo por capacidade, formulário local em rota Router e SQLite próprio; sem novas dependências ou estado global para esse editor.
- #12: cartão/integração com painel ainda pendentes. #13: contato/handoff refinados, com biblioteca de validação justificada e sem backend ou permissão de agenda.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
