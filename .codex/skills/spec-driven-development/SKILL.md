---
name: spec-driven-development
description: "Use ao iniciar feature, implementar User Story ou alterar comportamento funcional; alinhe Issue, milestone, spec, critérios e tasks sem inventar requisitos."
---

# spec-driven-development

1. Leia `AGENTS.md` e consulte a Issue viva com `gh issue view N --repo Nosso-Espectro/aplicativo`.
2. Localize milestone e spec via `scripts/github/check-issue.sh N`; leia spec.md, plan.md e tasks.md dessa milestone e a constituição em `.specify/memory/constitution.md`.
3. Confira a Definition of Ready em `docs/development-workflow.md`. Preserve os critérios originais. Se a descrição da milestone pedir algo sem história/critério correspondente, registre a lacuna; não converta em implementação silenciosa.
4. Trabalhe apenas nas tasks da história solicitada. Refinamentos de produto devem voltar ao GitHub com autorização para a escrita; atualizar só a spec não redefine o produto.
5. Vincule RF/RNF aos testes, tasks às mudanças e Issue aos commits/PR. Marque tasks somente com evidência de conclusão. IDs RF/T são locais à spec: use o caminho ao citá-los.
6. Entregue comportamento validado ou documentação solicitada, arquivos afetados, critérios cobertos e pendências. Não confunda geração de specs com implementação.

Spec Kit não define a branch: uma milestone compartilha spec entre várias branches de Issue. Consulte `.specify/README.md` antes de usar comandos da ferramenta.
