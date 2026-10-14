# Plano de implementação — Divisor de Tarefas

Spec: [spec.md](spec.md). Milestone #15; Issues #19, #20. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-14: Expo57.0.28/RN0.86.3/React19.2.3/TypeScript strict,
Router/SQLite/Jest-RNTL/SQL real do Node existentes, Node24.21.0/npm11.19.0.
Main2379922 inclui timer/avisos locais; nenhuma dependência/permissão nova para19.
Builds somente remotos, nunca prebuild/Gradle/Xcode locais.

## Arquitetura atual

CAA/rotinas/perfil/apoio/regulação/timer/sons integrados. Reusar padrões de
editor/navegação/SQLite privado/revisão/erro, sem editar dados ou banco de rotinas.
Subtarefas não são execução de rotina; checkbox/progresso pertencem só a19.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/task-breakdown/`.

- `src/features/task-breakdown/task-editor` — [US-019] Dividir uma tarefa em pequenas etapas.
- `src/features/task-breakdown/task-templates` — [US-020] Salvar tarefa como modelo reutilizável.

## Modelo de dados

US-019: tarefa {id,title,revision,steps:[{id,title,completed}]} com IDs locais
opacos/estáveis, texto livre obrigatório trim não vazio e bool estrito. Lista
vazia inicialmente, tarefa sem etapas válida/progresso0de0/0%, sem falso sucesso.
Subir/descer conserva IDs/conteúdo/status, apagar uma etapa recalcula somente
essa tarefa, conclusão é reversível. Sem coleta de histórico/timestamps por
conveniência, diagnóstico, mídia ou transformação automática.
Identidades seguem o padrão local existente e não são credenciais; tests podem
injetar IDs sintéticos. Cópias/identidades de modelos pertencem a20 e não serão
criadas por antecipação. Modelo puro deve validar/clonar inputs para que draft
não altere a versão confirmada.

## Persistência

US-019: SQLite privado tear-task-breakdown.db schema1, tarefas/etapas ordenadas,
revisão segura, fila/transação/readback/rollback/future-schema. CRUD de tarefa,
edição completa e checkbox de progresso confirmam somente após commit. Alvo
removido/revisão antiga recusados, sem resurrect por save antigo; erro/retry
mantém draft/versão confirmada e preserva outros módulos. SQLite Node/reabertura
testam persistência local; gate precisa SQLite Expo/offline/backups reais.
Modelos/cópias independentes de20 têm persistência própria a refinar depois.

## Fluxos principais

Sequência de capacidades: Dividir uma tarefa em pequenas etapas → Salvar tarefa como modelo reutilizável.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Persistir progresso (#19) e modelos reutilizáveis (#20); duplicar conteúdo sem vínculo mutável com o modelo.

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
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar checks leves por Issue; builds somente remotos na main integrada, após disponibilidade segura do host.

Jest serial,lint/typecheck,Doctor21/21,56tooling/validador/review e CI leve remoto
antes da entrega. Nenhum teste alegado por esta preparação; tasks só após executar.
Gate nativo/assistivo/offline continua necessário, sem release automática.

## Dependências técnicas

Stack e APIs locais existentes suficientes; sem nova biblioteca/framework.
Rota própria e comando no quadro, lista/editor/retorno previsíveis. Checkbox e
subir/descer explícitos, alvos48dp/texto escalável/contraste/modo9 preservados.
Nenhum player/timer/aviso ou configuração global de outro módulo.

## Riscos

Tarefa sem etapas, falha ao salvar progresso e modelo removido; cópia não deve modificar original (#19/#20).

US-019 Ready após refinamento na Issue19; questões de modelos/catálogo da20
continuam abertas e impedem afirmar milestone completa. Segurança61/auditoria51,
builds e consentimento de instalação permanecem no monitor separado. Não operar
celular, dados pessoais ou scripts autônomos não revisados para validar19.

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-019: TypeScript em src/features/task-breakdown, modelo/SQLite/editor/lista/rota pequenos, alinhados às convenções atuais.
- Pendente para20: edição/exclusão de modelos e catálogo comum, sem redefinir seus critérios na19.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
