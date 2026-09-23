---
name: milestone-release
description: "Use quando uma milestone parecer completa e for solicitada preparação ou execução da release; valide conclusão e prepare uma tag anotada na main sem publicação automática."
---

# milestone-release

Leia `docs/development-workflow.md` e o índice `specs/README.md`. Consulte `scripts/github/check-milestone.sh "Título exato"`: todas as Issues devem estar fechadas, mas isso sozinho não comprova entrega.

Confira PRs integrados na main e seus commits, tasks/aceites concluídos, docs/spec consistentes, checks verdes, acessibilidade, privacidade, regressões e vulnerabilidades impeditivas. Execute a suíte real e registre evidência para o commit exato conforme o modelo em `.specify/templates/release-evidence-template.md`.

Calcule a tag pelo campo `tag` da spec; nunca use apenas o número GitHub da milestone. Exija main atualizada, working tree limpa e nome inexistente local/remotamente. Nunca mover/sobrescrever tag.

Apenas quando criar a tag estiver explicitamente autorizado, execute `scripts/github/tag-milestone.sh "Título exato"`; o script repete os gates e cria uma tag anotada, sem push. Preparar release não implica publicar. Se faltar qualquer evidência/check, reporte o bloqueio e não contorne o gate.

Nesta preparação inicial do workflow nenhuma tag será executada. A ausência atual de build/testes do app bloqueia releases.
