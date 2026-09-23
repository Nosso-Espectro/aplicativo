# Workflow de desenvolvimento — TEAr

GitHub é a fonte de verdade do produto. Este documento define o trabalho futuro; a preparação de 2026-09-23 não implementou histórias nem criou branches, commits, PRs ou tags.

## Fluxo e rastreabilidade

```text
Milestone → spec → Issue / história → requisitos → tasks
                         ↓
                   branch curta
                         ↓
                 implementação e commits
                         ↓
                       testes
                         ↓
                    PR → review
                         ↓
                    merge em main
                         ↓
                   remover branch

Todas as Issues da milestone integradas
                         ↓
                    quality gate
                         ↓
                    tag anotada
                         ↓
                   próxima milestone
```

Uma milestone corresponde a uma pasta em [specs](../specs/README.md). Uma Issue corresponde a US-XXX, seus RFs e suas tasks nessa pasta. RF/T são IDs locais: cite também a spec. A branch usa a US do título, não presume que o número GitHub seja igual ao da história. Commits referenciam a Issue, PRs registram critérios/testes e a tag identifica o commit da main com a entrega integrada.

Não há banco separado de rastreabilidade. Os metadados no início de spec.md fazem o mapeamento lido pelos scripts: número GitHub da milestone, prioridade, tag, status, data consultada e histórias prontas. Não alterar número/tag para renomear uma release já publicada.

## Por que não existe develop

`main` é a trunk oficial e deve permanecer utilizável e integrável. Uma segunda branch permanente criaria outra fila de integração e aumentaria divergência. Não usar `develop`, `development`, `integration`, `release/*` ou branches permanentes de feature. Cada branch tem escopo de uma Issue e duração alvo de horas ou poucos dias.

## Ferramentas e estado real

Git, Bash, Python 3 e GitHub CLI (`gh`) são necessários aos helpers. A conta do gh precisa de leitura do repositório; os scripts não criam login nem exibem tokens. A US-041/#41 materializa a base Expo SDK 57/React Native 0.86.3/React 19.2.3, TypeScript strict, Hermes e Expo Router, sem backend. Use Node 24.21.0 (`.nvmrc`) e npm 11.19.0, fornecido com esse Node. O lockfile é versionado; instale com `npm ci`.

```bash
nvm install
nvm use
export EXPO_NO_TELEMETRY=1
npm ci
npx expo lint
npm run lint
npx tsc --noEmit
npm test -- --ci
npx expo-doctor
```

`npm run lint` inclui testes e configurações, além das rotas verificadas por `npx expo lint`.
O workflow [mobile-quality.yml](../.github/workflows/mobile-quality.yml) configura esses checks
e build Android com bundle embutido. Sua execução remota ainda não foi comprovada.
Android requer JDK 17, Android SDK/API 36, build-tools 36.0.0 e NDK 27.1.12297006;
iOS requer macOS, Xcode e CocoaPods compatíveis com SDK 57. Os mínimos de execução são
Android 7/API 24 e iOS 16.4; geração de projetos e bundles não prova execução nessas versões.
Use `npm run build:android` e, no macOS, `npm run build:ios`. Consulte os comandos de
instalação/offline e os resultados em [quickstart](../specs/001-comunicacao-visual-caa/quickstart.md)
e a [revisão do bootstrap](bootstrap-tecnico.md).

Spec Kit não está instalado. A [estrutura preparada](../.specify/README.md) fornece constituição, templates e specs sem fingir que comandos do agente já estão disponíveis. Skills canônicas estão em `.codex/skills`, com descoberta por `.agents/skills` através de link. Se o ambiente não reconhecer o link, ler o SKILL.md explicitamente.

## Definition of Ready

Uma Issue pode começar quando:

- Possui história de usuário e critérios de aceite verificáveis.
- Está vinculada a uma milestone e à spec correspondente.
- Suas dependências e ambiguidades bloqueantes foram resolvidas.
- A história consta em `ready_stories` da spec após revisão, por exemplo `ready_stories: ["US-001"]`.

Todas as specs começam com `ready_stories: []` e `status: draft`. Essa lista é o registro documental da revisão, não uma segunda prioridade nem substituto do GitHub. Registre a decisão de produto na Issue, atualize a spec e só então declare Ready. Nenhuma história foi aprovada automaticamente nesta preparação.

Descrições de milestone podem ter escopo sem critérios em Issues. Trate como lacuna e proponha refinamento, sem implementar nem alterar o GitHub fora da autorização vigente. O [relatório de auditoria](backlog-audit.md) reúne as pendências atuais.

## Iniciar uma Issue

Consulte primeiro, sem alterar Git:

```bash
./scripts/github/check-issue.sh 12
```

O comando mostra Issue, estado, milestone, labels, branch prevista, spec, critérios e prontidão. Para iniciar desenvolvimento autorizado:

```bash
./scripts/github/start-issue.sh 12
```

O helper exige árvore limpa, Issue aberta e Ready, spec consistente e inexistência de outra branch local/remota da US. Faz fetch da main, verifica que a main local não contém divergência/commits locais exclusivos, executa `git switch main` e `git pull --ff-only origin main`, relê prontidão e cria a branch. Se a atualização falhar, não faz reset/stash automático; pode permanecer em main e informa a falha.

Antes de implementar, leia spec.md, plan.md, tasks.md e as Skills aplicáveis. Não implemente a milestone inteira. A inicialização técnica deve estar vinculada ao backlog antes de ocorrer.

Convenções:

- `feat/us-xxx-descricao-curta`: história funcional.
- `fix/us-xxx-descricao-curta`: correção; labels `bug`, `fix`, `correcao` ou `correção`.
- `chore/us-xxx-descricao-curta`: tarefa técnica; labels `chore`, `technical`, `technical-task`, `tarefa-tecnica` ou `tarefa técnica`.

Labels conflitantes bloqueiam o helper. As 40 Issues atuais são histórias funcionais e suas branches previstas estão no índice. O título atual gera o slug em minúsculas, sem acentos e com hífens. Nunca sobrescrever branch existente, mesmo com slug diferente para a mesma US.

## Durante a implementação

Trabalhe nas tasks da Issue. Marque conclusão somente após validação; não misture refactor sem relação. Se a história crescer, registre a necessidade de divisão e proponha Issues adicionais sem expandir silenciosamente.

Com árvore limpa, mantenha a branch próxima da trunk:

```bash
git fetch origin
git merge origin/main
```

Resolva conflitos e repita checks pertinentes. Esse procedimento evita exigir reescrita do histórico compartilhado. Não use force-push como rotina. A atualização pode incluir mudanças de specs: reconcilie-as com a Issue antes de prosseguir.

Commits seguem Conventional Commits, por exemplo `feat(caa): add communication card grid`, com corpo `Refs #1`. Use `Closes #1` apenas quando semanticamente correto. Commits pequenos devem ter uma intenção clara.

## Pull request e Definition of Done

Cada branch de Issue gera um PR contra main, quando solicitado/autorizado. Título: `[US-001] Exibir quadro básico de comunicação`. Descrição: história, mudanças, checklist dos critérios originais, testes, acessibilidade, privacidade, screenshots quando úteis e `Closes #N` quando concluir a Issue. O [template](../.github/pull_request_template.md) orienta esse registro.

Uma Issue só está pronta para merge quando:

- Critérios atendidos e tasks relevantes concluídas.
- Testes, lint e build verdes; typecheck quando aplicável e demais checks obrigatórios atendidos.
- Acessibilidade revisada para UI e privacidade revisada para dados.
- Documentação/spec atualizadas e nenhuma regressão conhecida impeditiva.
- PR vinculado à Issue e review concluída.

Ausência de suíte não conta como resultado verde. Nesta fase somente as ferramentas/documentação podem ser verificadas; o aplicativo não pode ser liberado.

Prefira Squash and Merge, permitido na configuração consultada, para uma unidade clara por Issue na main. Após merge autorizado e confirmado, atualize main e remova a branch. Confirme o PR integrado antes de excluir: com squash, `git branch -d` pode recusar por não haver ancestralidade direta; não use exclusão forçada automática. Remoção da branch remota também depende da autorização da tarefa.

## Quality gate de milestone

Consultar estado não cria release:

```bash
./scripts/github/check-milestone.sh "P0 — Comunicação Visual / CAA"
```

O comando consulta todas as páginas, exclui PRs da contagem de Issues e mostra totais, abertas, fechadas e percentual. Zero Issues abertas é condição necessária; milestone vazia ou apenas fechada manualmente não comprova entrega.

Antes de tag:

- Todas as Issues previstas concluídas e PRs de conclusão merged na main, com commits ancestrais do HEAD.
- Critérios e tasks atendidos; `status: implemented` na spec somente depois da revisão.
- Main atualizada, estável e árvore limpa, inclusive arquivos não rastreados.
- Suíte completa de testes, lint, tipos quando aplicável, build e E2E quando existentes.
- Revisões de acessibilidade, privacidade, documentação e consistência das specs.
- Nenhuma regressão impeditiva, TODO/FIXME crítico introduzido ou vulnerabilidade conhecida impeditiva.
- Checks remotos concluídos e validação dos checks obrigatórios/regras do repositório pelo revisor.

Os gates automáticos e a revisão manual se complementam. O helper verifica estados de CI existentes, mas não interpreta todos os rulesets/proteções do GitHub nem prova a qualidade de uma revisão humana.

### Configuração dos comandos de qualidade

[scripts/quality-gate.json](../scripts/quality-gate.json) aponta para testes Jest, lint, typecheck e `npm run build`, que exige os builds Android e iOS. O gate completo precisa de macOS com ambos os toolchains; sem eles, falha e **bloqueia a release**. Os arrays são executados da raiz sem shell implícito. Não substituir build nativo por exportação JS nem configurar comandos triviais para obter sucesso artificial.

Somente `typecheck` e `e2e` podem usar um objeto `{"not_applicable": "justificativa técnica revisada e concreta"}` quando realmente não aplicáveis. Testes, lint e build são obrigatórios. E2E está justificado como não aplicável à base neutra da US-041; reavaliar nas histórias funcionais. Configuração do gate não equivale a aprovação: builds, abertura offline e revisões nativas continuam pendentes conforme as evidências locais.

### Evidências e tag

Use o [modelo de evidências](../.specify/templates/release-evidence-template.md) para registrar o número GitHub da milestone, SHA completo da main, revisor e evidências de cada gate manual. Salve fora da working tree para não introduzir alteração nem depender de um arquivo que teria de conter o próprio hash de commit. Não marque flags sem revisão. As evidências de implementação devem permanecer nos PRs/documentos vinculados; o arquivo externo é a atestação final do commit que será marcado.

Quando houver autorização explícita para criar a tag:

```bash
TEAR_RELEASE_EVIDENCE=/caminho/fora-do-repositorio/release.md \
  ./scripts/github/tag-milestone.sh "P0 — Comunicação Visual / CAA"
```

O script consulta o backlog, confirma a conclusão, verifica PRs, main, tasks, evidências, checks e qualidade, revalida estado e cria uma tag anotada no SHA conferido. Falha de qualquer etapa bloqueia a tag. Uma Issue fechada sem PR rastreável também bloqueia a operação e exige revisão do vínculo, sem atalho automático.

Convenção: `mNNN-slug-da-spec`, por exemplo `m001-comunicacao-visual-caa`. NNN é a ordem da spec, não o número GitHub da milestone. Nunca criar tag em feature branch, sobrescrever/mover tag ou fazer push automático. O helper apenas mostra `git push origin <tag>` para execução explicitamente autorizada. Se SemVer for adotado, manter o mapeamento em specs/README.md.

## Validação desta estrutura

```bash
python3 scripts/validate-workflow.py
python3 -m unittest discover -s tests/tooling -v
for script in scripts/github/*.sh; do bash -n "$script"; done
git diff --check
```

Para comparar com o backlog vivo (somente leitura):

```bash
python3 scripts/validate-workflow.py --github
```

O validador verifica referências, cobertura de histórias e critérios, duplicações, specs/milestones sem correspondência e links locais. `bash -n scripts/github/*.sh` isoladamente analisa apenas o primeiro arquivo como script e passa os outros como argumentos; por isso a validação usa um laço.
