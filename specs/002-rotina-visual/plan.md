# Plano de implementação — Rotina Visual

Spec: [spec.md](spec.md). Milestone #10; Issues #6, #7, #8. Plano das três histórias atualizado em 2026-10-13, conforme refinamentos registrados nas respectivas Issues.

## Stack

Inspeção em 2026-10-13: Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript strict, Expo Router, SQLite, FileSystem e ImagePicker já integrados. Node 24.21.0/npm 11.19.0, Jest/RNTL e ESLint existentes. US-006 não adiciona dependências, backend, permissões ou sincronização. Builds apenas remotos, manualmente no GitHub Actions, Android via SSH dedicado.

## Arquitetura atual

Comunicação, frases, fala local, cartões personalizados, favoritos e identidade visual já integrados. Reutilizar o seletor contextual de imagens e a cópia privada existente; parametrizar o namespace de imagem para impedir que a limpeza de cartões alcance rotinas e vice-versa. Provider de rotinas somente no layout `/routines`, sem alterar o estado da frase nem iniciar mídia.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo: `src/features/routines/`. Rotas `/routines`, `/routines/new` e `/routines/[id]`; acesso direto pelo quadro de comunicação, lista com nome e quantidade de etapas e editor rolável.

- `src/features/routines/RoutineEditor.tsx`, `RoutineProvider.tsx`, `routine-model.ts`, `routine-storage.ts`, `routine-database.ts` — [US-006] Criar uma rotina visual.
- `src/features/routines/step-order.ts`, `RoutineEditor.tsx` e `routine-database.ts` — [US-007] Reordenar etapas da rotina.
- `src/features/routines/RoutinePlayer.tsx`, `routine-execution.ts` e rota `/routines/play/[id]` — [US-008] Executar rotina com Agora e Depois.

## Modelo de dados

Rotina (identificador, nome); etapa (identificador estável, título, imagem opcional, posição, estado); execução (rotina, etapa atual, progresso). Reordenação preserva identificadores e conteúdo.

US-006: banco privado `tear-routines.db`, versão 1; `routines(id, name)` e `routine_steps(id, routine_id, title, image_uri, position)`, FK com cascata, posição única por rotina e títulos/nomes não vazios. Identificadores das etapas sobrevivem a edição. Sem estado de execução antecipado. SQLite separado preserva o schema de comunicação. Cada salvamento substitui as etapas da rotina dentro da mesma transação exclusiva; fila de operações e publicação somente após commit. SQL parametrizado, sem ORM. Imagens em `routine-images`, cópia antes do commit e remoção de cópias novas em falha; órfãs antigas limpas ao reabrir o módulo. Reordenação/status/progresso serão definidos nas Issues próprias.

## Persistência

US-007: migração transacional v1→v2 adiciona `completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1))` sem mudar IDs/conteúdo/ordem. Bancos com versão futura são rejeitados sem downgrade. Status é lido por ID dentro da transação antes de substituir etapas, preservado na nova posição e ignorando status de rascunho possivelmente obsoleto. Etapas novas iniciam pendentes. Sem controles de conclusão/progresso antecipados; execução pertence à #8.

Subir/descer transforma apenas a sequência do rascunho, mantendo objetos estáveis, imagem e status. Limites desabilitados, sem gesto obrigatório; feedback textual anuncia posição. Salvar reutiliza a transação da rotina; cancelamento mantém banco anterior, falha mantém edição e rollback conserva a versão salva. Reordenar imagens existentes não as copia novamente, pois o storage compara referências por ID.

Persistir rotinas, ordem e progresso (#6–#8); operações devem preservar status ao reordenar e restaurar execução após fechamento.

## Fluxos principais

US-008: `routineExecution` deriva Agora/Depois das duas primeiras etapas pendentes
na ordem salva, sem guardar cursor por índice. SQLite v2 existente, sem migração
adicional. `progress` valida ID esperado da etapa atual em transação antes de
concluir; voltar reabre a etapa anterior e as posteriores; reiniciar somente
após conclusão e confirmação explícita na UI. Cada ação publica estado após
commit e usa a mesma fila que edição/reordenação. Fronteira recusa ações obsoletas,
rotina vazia/ausente e limites inválidos. Falha conserva estado confirmado e retry.
Fechar o player não reinicia progresso; edição/deleção/reordenação reconciliam-se
pelos IDs/status persistidos ao reabrir. Sem som, timer ou avanço automático.

Sequência de capacidades: Criar uma rotina visual → Reordenar etapas da rotina → Executar rotina com Agora e Depois.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Persistir rotinas, ordem e progresso (#6–#8); operações devem preservar status ao reordenar e restaurar execução após fechamento.

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

Comandos leves existentes: `npm test -- --ci --runInBand`, `npm run lint`, `npm run typecheck`, `npx --no-install expo-doctor`, unittest de tooling e `scripts/validate-workflow.py`. SQLite real do Node 24 cobre transações/reabertura; componentes e picker/FileSystem usam fronteiras simuladas. Não equivalem a validação do Expo em Android/iOS. Builds remotos e testes em dispositivo permanecem evidências separadas, sem aprovar release.

## Dependências técnicas

Base integrada da US-041 e fronteiras locais de imagem da US-004 reutilizadas. Sem nova biblioteca ou ferramenta. Permissão de câmera permanece contextual; descrição passa a mencionar etapas de rotina. Sem microfone ou acesso amplo à biblioteca. Mínimos Android API24/iOS16.4 herdados da configuração existente, não comprovados por testes no host.

## Riscos

### Correção US-008: player e consentimento de reinício

Reproduzir callback de progresso após unmount e confirmação capturada antes de
Manter rotina concluída. Usar foco real do Router e owner por ativação/ID de
rotina. Intenção de reinício possui token próprio, validado antes de confirmar
ou repetir; cancelar/sair/outra intenção invalida o token. Continuações antigas
não publicam feedback nem liberam busy atual. Commit previamente autorizado
pode concluir, sem promessa de cancelamento da transação. Preservar DAO,
expectedId, schema/permissões/dependências e feedback da ativação atual.
Testes componentes/StrictMode e Router/provider/SQLiteNode real devem cobrir
callbacks/blur/retorno/commit/falha tardios, cancelamento de reinício e retry.
T017 nativa permanece pendente; correção não fecha #8.

### Correção US-006: continuações do editor

Reprodução inicial: manter save pendente, desmontar o editor e resolver o commit;
o fechamento antigo não pode navegar. O editor usa useFocusEffect do Router
real e captura um owner por ativação (montagem/foco), invalidado na
limpeza; uma nova ativação não aceita o owner anterior. Comandos antigos não
iniciam save/picker; continuações antigas não publicam feedback nem fechamento.
O finally libera somente o busy da operação/ativação correspondente. Preservar
gravações já autorizadas, provider/DAO, schema, permissões e dependências.
Testar sucesso/falha tardios, unmount/blur/retorno, callbacks antigos, StrictMode
e sucesso/retry atual. T006/T011/T017 continuam pendentes no gate nativo.

Evidência local 2026-10-14: regressão reproduzida antes da correção (router.back
chamado após unmount), oito cenários novos aprovados. Dois usam Router/provider
reais e SQLite do Node com commit retido: a gravação conclui, mas não navega após
replace ou blur/retorno. Suíte completa 934 testes/104 suítes PASS (140,437s),
lint/tipos sem avisos, Doctor21/21, 56 testes tooling, validador/diff check PASS.
Revisão do diff preserva dados/schema/status, layout e alvos de 48dp; nenhuma
permissão/dependência/rede/estímulo nova. PR103 anexado; CI38639608287 SUCCESS
2min10s no head6f5921c. Reconferir CI do último commit documental antes squash;
Android/iOS SKIPPED não são builds. Issue6 permanece aberta para os gates.

Rotina vazia, imagem ausente, falha de persistência e etapa removida durante edição; preservar ordem/status (#6–#8).

Refinamentos de #6/#7/#8 foram registrados nas Issues sob delegação do usuário. Validação de imagens, progresso persistido, operação offline e acessibilidade em Android/iOS permanece necessária para o gate; a base/host não comprovam suporte em todas as versões mínimas. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Proposta: módulos por capacidade em `src/features/`, sem fixar extensão/linguagem nem arquitetura de estado.
- US-006/US-007/US-008: reutilizar a stack efetiva, navegação Router e persistência SQLite privada; refinamentos funcionais registrados nas Issues sob delegação do usuário, preservando critérios originais. Validações nativas/assistivas continuam pendentes do gate.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
