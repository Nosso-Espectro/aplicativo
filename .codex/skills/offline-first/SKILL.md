---
name: offline-first
description: "Use em funcionalidades que podem operar sem servidor e em persistência local; verifique uso útil sem rede e recuperação de interrupções conforme o backlog."
---

# offline-first

Leia os critérios para distinguir disponibilidade offline, retenção entre sessões e operação externa. Não são equivalentes. Priorize conteúdo essencial local e armazenamento suficiente para o comportamento solicitado, sem escolher banco antes de inspecionar a stack.

Teste com rede indisponível, fechamento/reabertura quando a retenção for exigida e interrupção de operações. Falhas de persistência devem ser compreensíveis e não aparentar sucesso. Evite dependências remotas desnecessárias e mensagens vagas de erro.

Quando uma ação realmente exigir rede ou outro aplicativo, informe a limitação e preserve funções locais. Sincronização só entra com necessidade explícita; não criar fila, servidor ou resolução de conflitos especulativos. Registre comportamentos ainda indefinidos em questões abertas.
