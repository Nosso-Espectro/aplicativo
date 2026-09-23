# Quality Checklist: P0 — Comunicação Visual / CAA

**Purpose**: Revisar se os requisitos da feature CAA são claros, completos, consistentes e verificáveis nos focos de qualidade solicitados.
**Created**: 2026-09-23
**Feature**: [spec.md](../spec.md)

**Note**: Checklist customizada de qualidade da especificação; não verifica implementação.
**Review Ownership**: Artefato de revisão de requisitos. Marque um item `[x]` somente após confirmar que o critério de qualidade está satisfeito.
**Marker Semantics**: `[x]` indica qualidade dos requisitos revisada, não conclusão da implementação.

## Acessibilidade e design neuroinclusivo

- [ ] CHK001 Os requisitos identificam em quais fluxos e conteúdos se aplicam os critérios WCAG 2.2 AA, incluindo ampliação de texto e alvos de toque, e explicitam como registrar exceções móveis? [Clareza, spec §US-001/US-004/RNF-001, US-001/#1–US-005/#5]
- [ ] CHK002 Os requisitos de acessibilidade cobrem foco, contraste, texto compreensível e mensagens de erro nos fluxos relevantes sem depender de interpretações não registradas? [Completude, spec §RNF-001/RNF-003, US-001/#1–US-005/#5]
- [ ] CHK003 O critério qualitativo de baixa carga cognitiva define o que deve ser avaliado (consistência e previsibilidade) e exige registro da revisão sem introduzir métricas não aprovadas? [Clareza, spec §Clarifications/Q-CAA-02, DoD US-001/#1–US-005/#5]
- [ ] CHK004 A especificação deixa claro como reduzir estímulos inesperados, incluindo que selecionar cartões não inicia fala e que TTS depende de ação explícita e pode ser interrompido? [Consistência, spec §US-002/US-003/RF-005/RF-009, US-002/#2–US-003/#3]
- [ ] CHK005 Os requisitos preservam autonomia e controle do usuário em fluxos de composição, reprodução, personalização, favoritos e recuperação de erros, sem ações automáticas não especificadas? [Cobertura, spec §US-002–US-005/RNF-003, US-002/#2–US-005/#5]

## CAA e comunicação sem fala

- [ ] CHK006 As dez mensagens iniciais estão enumeradas exatamente e sua categorização nas categorias iniciais está identificada como dependência pendente do backlog, sem a spec inventar o mapeamento? [Completude, spec §US-001/Q-CAA-02/Questões em aberto, US-001/#1]
- [ ] CHK007 Os requisitos distinguem com clareza o conteúdo visual/textual dos cartões, a composição de frases e a reprodução TTS, inclusive a comunicação por exibição da frase quando não há voz? [Clareza, spec §US-001–US-003/RF-001–RF-012, US-001/#1–US-003/#3]
- [ ] CHK008 O critério de navegação de até dois toques informa corretamente o ponto inicial e o destino, de modo que possa ser avaliado sem interpretação divergente? [Mensurabilidade, spec §US-001, US-001/#1]
- [ ] CHK009 A especificação mantém explícito que cartões personalizados usam texto e imagem opcional, e que áudio gravado/importado não faz parte desta entrega? [Consistência, spec §US-004/Q-CAA-01/Fora de escopo, US-004/#4]
- [ ] CHK010 A origem visual dos pictogramas está tratada como decisão de backlog (conjunto selecionado/aprovado com licença documentada), sem prescrever um conjunto ainda não escolhido? [Dependência, spec §Q-CAA-02/Questões em aberto, US-001/#1]

## Offline e persistência

- [ ] CHK011 Está explícito quais capacidades devem funcionar sem internet desde a primeira abertura: quadro, frases, cartões personalizados e favoritos? [Completude, spec §RNF-002/Offline/RF-001/RF-012/RF-016/RF-019, US-001/#1–US-005/#5]
- [ ] CHK012 Os requisitos diferenciam claramente dados que persistem localmente entre sessões (cartões personalizados e favoritos) da frase temporária, que persiste durante a sessão e recomeça vazia após encerramento? [Consistência, spec §RF-008/RF-016/RF-019/Offline, US-002/#2, US-004/#4, US-005/#5]
- [ ] CHK013 O comportamento sem voz local é completo e verificável nas plataformas Android e iOS: preservar frase visível, informar indisponibilidade e não exigir instalação/aquisição automática de voz? [Clareza, spec §US-003/RF-010/Offline/Q-CAA-03, US-003/#3]
- [ ] CHK014 As falhas de persistência especificam o estado preservado, a informação apresentada e as opções de recuperação, distinguindo salvamento de cartão e salvamento da ordem de favoritos? [Cobertura de erro, spec §US-004/US-005/Casos de erro, US-004/#4–US-005/#5]

## Privacidade e dados pessoais

- [ ] CHK015 Está definido quais conteúdos ficam exclusivamente no dispositivo e que textos, imagens e frases não são enviados a serviços externos nem incluídos em registros de erro? [Clareza, spec §RNF-002/Offline/US-004, US-001/#1–US-005/#5]
- [ ] CHK016 A especificação deixa explícito que a leitura usa voz local e não depende de backend, autenticação, sincronização, telemetria ou serviço externo? [Consistência, spec §US-003/RNF-002/Offline, US-001/#1–US-005/#5]
- [ ] CHK017 Os requisitos e mensagens deixam claro que o produto não infere condições clínicas e não se apresenta como diagnóstico, tratamento ou substituto de acompanhamento profissional? [Cobertura, spec §RNF-004/Constituição, US-001/#1–US-005/#5]

## Estados de erro e previsibilidade

- [ ] CHK018 Para cada cenário de falha listado (voz indisponível, câmera/imagem, falha ao salvar, favoritos vazios, frase vazia), a especificação define resultado, mensagem/ orientação e continuidade permitida ou identifica explicitamente o que segue em aberto? [Cobertura, spec §Casos de erro/RNF-003/US-003–US-005, US-003/#3–US-005/#5]
- [ ] CHK019 A resposta a título/categoria inválidos descreve os campos obrigatórios, preservação do preenchimento, indicação do campo e bloqueio do salvamento até correção sem regras implícitas adicionais? [Clareza, spec §RF-013/RF-015/Clarifications, US-004/#4]
- [ ] CHK020 As consequências de editar ou excluir um cartão são consistentes entre frase já aberta e favoritos, inclusive remoção e manutenção da ordem dos demais itens? [Consistência, spec §RF-015/Clarifications, US-002/#2, US-004/#4, US-005/#5]
- [ ] CHK021 A especificação define estados vazios e controles de recuperação com mensagens acessíveis, sem sugerir sucesso quando a operação falhar? [Clareza, spec §RF-013/RF-015/RF-019/Casos de erro, US-004/#4–US-005/#5]

## Critérios de aceite e rastreabilidade

- [ ] CHK022 Cada história mantém sua identificação US e número da Issue, e os requisitos/critério derivados permanecem rastreáveis à fonte GitHub correspondente? [Rastreabilidade, spec §Histórias/Rastreabilidade, US-001/#1–US-005/#5]
- [ ] CHK023 Os critérios de aceite cobrem caminhos principais e exceções acordadas sem substituir nem ampliar silenciosamente os critérios originais das Issues? [Consistência, spec §Histórias/Clarifications/Questões em aberto, US-001/#1–US-005/#5]
- [ ] CHK024 Cada critério de aceite usa resultados observáveis e condições de uso suficientemente específicas para orientar implementação e revisão, sem termos qualitativos deixados sem método de avaliação? [Mensurabilidade, spec §Critérios de aceite/SC-001–SC-005]
- [ ] CHK025 As pendências ainda dependentes do backlog ou da investigação técnica estão claramente separadas dos requisitos resolvidos e não são tratadas como decisões silenciosamente tomadas? [Ambiguidades, spec §Questões em aberto/Clarifications, US-001/#1, US-003/#3]

## Notes

- Todos os itens começam desmarcados e devem ser avaliados pela revisão da qualidade dos requisitos.
- A checklist não afirma que os comportamentos foram implementados ou testados.
- O mapeamento das dez mensagens e a aprovação do conjunto de pictogramas continuam dependências do backlog conforme a especificação.
