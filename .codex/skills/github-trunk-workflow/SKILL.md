---
name: github-trunk-workflow
description: "Use ao iniciar uma Issue, preparar commits ou PR e integrar trabalho; preserve main como trunk, uma branch curta por Issue e rastreabilidade até a release."
---

# github-trunk-workflow

Leia `docs/development-workflow.md`. Use `scripts/github/start-issue.sh N` somente quando a tarefa autorizar iniciar desenvolvimento: ele exige árvore limpa, consulta a Issue, atualiza main por fast-forward e cria uma branch exclusiva. Não apague nem guarde alterações do usuário automaticamente.

- Branches `feat/us-xxx-slug`, `fix/us-xxx-slug` ou `chore/us-xxx-slug`, nascidas da main atualizada. Nunca develop, integration, release/* ou branch de milestone.
- Vida útil de horas ou poucos dias. Não misture Issues independentes; proponha divisão se uma história crescer.
- Atualize frequentemente a branch com main conforme o workflow, resolvendo conflitos e repetindo checks pertinentes. Não force-push por rotina.
- Commits pequenos com Conventional Commits e `Refs #N`; use `Closes #N` apenas quando a entrega realmente concluir a Issue.
- PR contra main, critérios e evidências explícitos. Preferir squash quando permitido. Não integrar com checks falhando ou regressão impeditiva.
- Depois de merge autorizado e confirmado, remova a branch com segurança e atualize main.
- Tag anotada somente após quality gate da milestone; use milestone-release nessa situação. A Skill não autoriza push, PR, merge, fechamento ou tag além da solicitação vigente.
