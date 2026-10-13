---
name: testing-quality
description: "Use ao planejar testes ou concluir uma Issue; selecione verificações de comportamento e registre evidências reais de testes, lint, tipos e build."
---

# testing-quality

Converta critérios de aceite em cenários sempre que razoável. Use unitários para lógica, integração para fronteiras/persistência, componentes para interação, E2E para fluxos críticos e verificações de acessibilidade/regressão conforme o risco. Não busque cobertura artificial nem teste apenas a forma da implementação.

Leia os comandos reais do projeto. Antes de concluir uma tarefa ou Issue, execute testes relacionados, lint, typecheck quando aplicável e checks leves existentes. Não execute build local automaticamente por tarefa, Issue ou execução do agente. Builds nativos são manuais no GitHub Actions; o gate da milestone verifica os jobs Android/iOS e os artefatos no SHA integrado da main. Distinga testes simulados de comportamento em dispositivo; registre validações nativas pertinentes como pendências do gate, sem presumir aprovação.

Hoje o app não foi inicializado: não invente comandos npm, não trate ausência de suíte como aprovação e não instale uma stack só para obter um check verde. As ferramentas de engenharia são verificadas com `python3 -m unittest discover -s tests/tooling -v` e `python3 scripts/validate-workflow.py`.

Para release, `scripts/quality-gate.json` precisa apontar para comandos reais e reproduzíveis. Registre comando, resultado e lacunas; uma falha impede conclusão, não justifica desabilitar o check.
