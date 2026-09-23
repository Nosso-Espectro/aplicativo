# Estrutura compatível com Spec Kit

Na inspeção de 2026-09-23, `specify` não está instalado e não havia `.specify/` nem `specs/`. Esta preparação fornece constituição, templates e o trio spec/plan/tasks por milestone. Não executa `specify init`, não instala CLI e não afirma que comandos de agente do Spec Kit já estejam disponíveis.

- `memory/constitution.md`: princípios do projeto.
- `templates/`: estrutura para futuras specs, planos, tasks e evidências de release.
- `../specs/`: artefatos derivados do backlog.

Para futura adoção da CLI, confira `specify --help` e a documentação da versão escolhida, fixe a versão e revise o diff de inicialização. Não sobrescreva artefatos nem aceite hooks que criem branches de milestone. A ferramenta não substitui o contrato em AGENTS.md.

A [documentação atual do Spec Kit](https://github.com/github/spec-kit/blob/main/docs/quickstart.md) permite selecionar uma feature por `SPECIFY_FEATURE_DIRECTORY`, independente da branch. Ao trabalhar em uma história da primeira milestone, use:

```bash
export SPECIFY_FEATURE_DIRECTORY=specs/001-comunicacao-visual-caa
```

Esse exemplo seleciona a spec compartilhada; a branch continua sendo a da Issue. Comandos de agente só devem ser usados após instalar a integração correspondente e confirmar sua sintaxe na versão adotada. Limite implementação/geração de tasks à história solicitada, preservando as demais.

Skills próprias ficam em `.codex/skills` e são expostas por `.agents/skills` via link, seguindo a [descoberta documentada do Codex](https://developers.openai.com/codex/skills/). Reinicie a sessão se necessário; em ambientes que não seguem links, use o caminho explícito do SKILL.md. Não se criaram cópias nem configuração global.
