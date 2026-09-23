# Contrato de engenharia — TEAr

## Projeto

TEAr — Múltiplas Formas de Existir / Nosso Espectro integra o projeto Minha História, Nosso Espectro. Diretriz: aplicativo React Native, primeira versão sem backend. Na inspeção inicial não há código de aplicação, dependências ou build; confirme a stack real antes de cada implementação. Preserve alterações locais do usuário.

## Fonte da verdade

GitHub Issues e Milestones de `Nosso-Espectro/aplicativo` definem o produto. Consulte via gh; divergências e ambiguidades voltam ao backlog. O livro contextualiza o projeto, mas não substitui os critérios das Issues.

## Desenvolvimento

Trunk-based com `main` utilizável e integrável. Não criar develop, development, integration, release/* ou branches permanentes de feature. Leia [workflow](docs/development-workflow.md).

## Branch

Uma Issue = uma branch curta, nascida da main atualizada: `feat/us-xxx-slug`, `fix/us-xxx-slug` ou `chore/us-xxx-slug`. Não implementar duas Issues independentes na mesma branch. Antes de iniciar, árvore limpa e Definition of Ready atendida. Prefira `scripts/github/start-issue.sh N`.

## Especificação

Milestone → spec; Issue → story; story → requisitos/tasks. Leia o [índice](specs/README.md), a spec, o plano e as tasks correspondentes. Critérios originais devem ser preservados. IDs de requisitos/tasks são locais à spec. Atualize tasks apenas após verificar o comportamento.

## Qualidade

Sempre considerar testes adequados ao risco, acessibilidade, design, privacidade e código limpo. Antes de concluir: testes relacionados, lint, typecheck quando aplicável, build e checks existentes. Ausência de ferramentas não significa aprovação. Não gerar cobertura artificial. Consulte a DoD e o gate de milestone no workflow.

## Skills locais

Os arquivos canônicos estão em `.codex/skills/`; `.agents/skills` é um link para o mesmo conteúdo, para descoberta por Codex. Se o ambiente não seguir links, leia explicitamente o SKILL.md indicado; não mantenha cópias divergentes.

- `spec-driven-development`: iniciar feature, mudar comportamento ou implementar história.
- `github-trunk-workflow`: branch, commits, PR e integração.
- `clean-code`: escrita e refatoração de código.
- `accessibility-neuroinclusive`: obrigatória em qualquer alteração de interface.
- `ui-ux-design`: fluxos e interação.
- `testing-quality`: testes e validação de entrega.
- `privacy-security`: dados, permissões e serviços externos.
- `offline-first`: operação sem servidor e persistência.
- `code-review`: revisão de diff/entrega.
- `milestone-release`: preparação/conclusão de milestone aparentemente completa.

Abra apenas as Skills pertinentes. Elas não ampliam a autorização da tarefa.

## Git

Não fazer push, merge, tag ou fechar Issue sem autorização quando a tarefa não solicitar explicitamente essas ações. PRs e escritas no GitHub também respeitam o escopo autorizado. Nunca sobrescrever tags; não usar force-push como rotina. Commits pequenos e Conventional Commits; PR contra main, squash quando apropriado. Tags anotadas por milestone após o gate, no commit integrado da main.

## Escopo

Não inventar requisitos nem decidir ambiguidades funcionais silenciosamente. Registrar questões abertas com Issue de origem. Não antecipar IA, backend ou sincronização no MVP. Inicialização técnica sem Issue requer vinculação explícita no backlog antes de desenvolvimento.

## Saúde

O aplicativo não realiza diagnóstico médico ou psicológico. Recursos de apoio não são tratamento nem substituem acompanhamento profissional. Não inferir condições clínicas a partir dos relatos ou registros.
