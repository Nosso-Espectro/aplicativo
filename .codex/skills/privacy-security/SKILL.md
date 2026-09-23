---
name: privacy-security
description: "Use ao manipular dados pessoais, permissões, logs, dependências ou serviços externos; reduza exposição e preserve controle e transparência."
---

# privacy-security

Minimize coleta e retenção; privacidade por padrão e dados locais quando possível. MVP sem backend: não introduza conta, telemetria ou transmissão remota por conveniência.

Trate com especial cautela informações de saúde, comunicação, crises, sensibilidades e contatos de apoio. Não registre esses conteúdos em logs nem use dados reais em fixtures. Nunca versione secrets ou exponha tokens/credenciais no cliente, nos exemplos ou no output.

Valide entradas, codifique saídas/URLs quando necessário, use APIs seguras e revise a necessidade e segurança das dependências. Serviços externos exigem necessidade derivada do backlog, transparência e consentimento pertinente; compartilhamento não pode ser automático.

Verifique fluxos de rede, permissões, exclusão e minimização conforme a Issue. IA P3 não autoriza backend no MVP nem credenciais embutidas. Entregue riscos concretos e evidências, sem impor infraestrutura não necessária.
