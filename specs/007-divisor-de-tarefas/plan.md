# Plano de implementação — Divisor de Tarefas

Spec: [spec.md](spec.md). Milestone #15; Issues #19, #20. US-019 integrada/PR75; US-020 Ready após aprovação explícita. Registros de progresso abaixo são históricos, não anulam este estado.

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
- US-020 aprovada: modelos pessoais editáveis/removíveis com confirmação; catálogo comum separado na #76, não Ready.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.

## Progresso inicial US-019

task-model.ts preparado com títulos explícitos/clonagem/IDs únicos/bool estrito,
reordenação com IDs/texto/status preservados, remoção do alvo/conclusão reversível
e progresso0de0/0% sem conclusão falsa. newTaskStep cria draft vazio com status
false, sem sugerir conteúdo; operações de draft preservam texto ainda não salvo,
normalizedTaskDraft exige títulos não vazios só ao salvar. IDs seguem convenção
local existente Date.now/Math.random com injeção sintética nos testes; não são
credenciais, UUIDs criptográficos ou timestamps de histórico. Nenhuma task
concluída: SQLite/editor/progresso confirmado/rotas/fluxos ainda faltam. Seis
testes unitários,lint/typecheck verdes; não comprovam UI, persistência ou nativo.

Persistência inicial em task-database.ts: arquivo privado schema1, filas/transações,
lista/save/complete/remove com revisão esperada e readback antes de commit.
IDs/textos/status/ordem validados no read; removido não ressuscita, progresso
reversível não sobrescreve outra tarefa, overflow de revisão recusado. Nenhuma
dependência/permissão/alteração do banco de outro módulo. SDK SQLite instalado
abre outra conexão em withExclusiveTransactionAsync: remove apaga filhos
explicitamente na mesma transação, sem presumir herança de foreign_keys.
Nove testes SQLite real do Node cobrem reabertura/offline/ordem/status, tarefas
vazias, stale target/remoção, rollback de create/edit/complete/delete/readback/
commit, fila, schema futuro/corrupção/overflow e exclusão com FKoff isolada.
Editor/lista/retorno/checkbox confirmado e integração UI ainda faltam; todas
tasksUS019 pendentes, nenhum PR/aparelho/build/validação SQLite Expo alegados.

Provider e editor isolados preparados: TaskProvider reutiliza abertura em efeito,
descarta publicação após desmontagem, bloqueia operações duplicadas e publica
somente o resultado confirmado do banco. save/complete/remove recebem revisão
capturada; falha mantém tarefas confirmadas. TaskEditor mantém draft separado e
revisão inicial, valida/foca títulos obrigatórios, adiciona/edita/reordena com
IDs/status preservados e confirma remoção inclusive de etapa concluída. Cancelar
descarta draft; salvar aguarda commit sem navegação prematura. Controles de 48dp,
texto escalável, SafeArea/KeyboardAvoidingView/scroll e feedback textual neutro,
sem animação/voz/rede. Nove testes de componentes/provider com banco falso:
validação/vazio, edição/ordem/remoção, cancelamento, erro/retry/draft, duplicata/
commit tardio/desmontagem, stale removido, StrictMode/abertura e progresso/removal
confirmados. Lista/detail/checkbox visível/rotas/entrada no quadro ainda faltam;
editor não está exposto no aplicativo e todas tasks de aceitação permanecem
pendentes. Testes de UI não provam leitor de tela, foco ou SQLite Expo nativos.

Fluxo US-019 agora integrado: /tasks com TaskProvider em layout próprio e animação
do modo global; entrada Abrir tarefas no quadro, lista inicial vazia, criação,
detail/checkbox reversível, editor e retornos/fallback reais. Progresso explícito
0de0/0% em tarefa vazia; nenhum início automático. Remoção da tarefa confirma
snapshot/revisão e só apaga seus dados; falha/commit pendente não alteram checkbox
nem afirmam exclusão. Confirmação de etapa continua só no draft até salvar.
Seis testes navigation usam Expo Router real e SQLite Node temporário: entrada/
CRUD/ordem/progresso/reabertura offline, vazio/isolamento, rollback/retry,
duplicata/pending antes commit, erro de abertura/fallback e modo9/draft cancel.
Total30relacionados/4suítes. Revisão local: texto202124/branco, controles48dp,
semântica checkbox/header/alert/polite, fonte escalável/scroll/SafeArea/teclado,
sem animação/som inesperado, contraste e feedback independente de cor; sem PII
em rotas (apenasID), rede/permissão/dependência nova ou alteração de outro banco.
Preservar contratos de revisão/commit e repetir suíte completa/checks/CI antes
integrar. T001–T006 verificadas; T012 nativo/assistivo/SQLiteExpo/offline/backups
pendente, sem alegar conformidade WCAG completa. PR/Issue ainda não concluídos
neste registro; US-020/modelos/catálogo continuam fora do escopo.

Verificação de entrega local: 527 testes Jest/71 suítes completos, 30 relacionados/
4 suítes, lint/typecheck sem warnings, Doctor21/21, 56 testes Python de tooling,
validador e diff-check aprovados. Origin/main confirmado2379922 antes do PR;
nenhuma dependência/nativo/build/host/aparelho operados nesta entrega.

## Plano aprovado US-020

Base mainfff768f/PR75/Issue19 fechada, tarefa real e banco/provider/editor/rotas
disponíveis. Aprovação humana registrada na Issue20, catálogo pronto na #76.
Modelo puro título/etapas ordenadas sem conclusão; cópia gera identidades próprias
e boolfalse, preservando modelo/origem. Modelos pessoais persistidos no mesmo
tear-task-breakdown.db por migração schema1→2 transacional, preservando tarefas/
progresso/revisões. Uma fila/conexão lógica para validar origem e criar cópia na
mesma transação; evitar half-copy, edição obsoleta ou modelo removido ressuscitado.
API de tarefas existente preservada; novos métodos de modelos com readback/commit/
rollback/revisão segura/future-schema, sem histórico/snapshot de progresso.
Salvar como modelo no detalhe real da tarefa confirmada, lista/editor de modelos
e criar tarefa com cópia explícita; editar/remover com confirmação sem afetar
instâncias, cancelar draft sem escrever. Provider/rotas existentes adaptados sem
novo framework/dependência/permissão/rede. IDs em rotas sem dados pessoais.
Testes modelo/SQLite Node/migração/offline/isolamento/revisões/rollback e UI/rotas
reais, duplicatas/loading/error/retry/commit antes sucesso/draft/lowmode. Checks
completos/review/CI leve antes PR; gate nativo/assistivo/SQLiteExpo/offline/backups
aberto. Builds somente remotos, dispatch adiado pelo host/lock ainda desconhecidos.
Nenhuma task de US-020 concluída por este refinamento.

Progresso inicial US-020: task-template-model.ts com conteúdo título/etapas sem
completed, validação/clonagem e taskFromTemplate gerando IDs novos/boolfalse.
Seis testes verificam ausência de progresso/referências mutáveis, cópias entre
si/origem independentes, vazio válido, trim/IDs únicos, rejeição de factory que
reutiliza IDs da origem e edição de draft sem alterar modelo. Nenhum modelo
persistido/UI alegado: migração/banco/provider/lista/editor/rotas/fluxos ainda
faltam e todas tasks US-020 permanecem pendentes. Sem dependência/permissão/rede.

Persistência US-020 preparada isoladamente: openTaskWorkspaceDatabase no arquivo
existente migra schema1→2 em transação sem alterar tarefas/IDs/status/revisões.
Templates/steps próprios sem completed, mesma fila/validação da origem e readback/
commit/rollback. readWorkspace/createTemplate/saveTemplate/removeTemplate/
createTaskFromTemplate confirmam resultado somente após commit. Origem/revisão
checadas dentro da transação; IDs novos na cópia, editar/remover modelo não toca
instâncias e remover origem não apaga modelo. Schema2 incompleto não é recriado,
schema futuro recusado. openTaskDatabase preserva contrato legado list/save/
complete/remove via mesma implementação, sem adaptar mocks para esconder APIs.
Oito testes SQLite Node novos: migração preserva v1/rollback-retry, reabertura
offline e independência, vazio, origem/modelo stale/removido, fila, rollback de
create/edit/delete/copy por commit/readback, corrupção/overflow/tabela ausente.
Total17testes banco; provider/UI/rotas de modelos ainda faltam, todas tasks20
pendentes. Nenhum SQLite Expo/build/aparelho/host ou gate nativo alegado.
