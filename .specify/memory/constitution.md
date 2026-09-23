<!--
Sync Impact Report — material temporário de revisão; remover antes do commit.
Versão: 1.0.0 → 1.1.0 (MINOR: ampliação dos princípios e da governança).
Princípios anteriores reorganizados e ampliados:
- 1. GitHub como fonte de verdade → I. Produto orientado pelo GitHub e pelos critérios de aceite.
- 2. Milestone/spec e Issue/história/branch → I, VII e VIII.
- 3. Main, integração e rastreabilidade → VII. Trunk-based e VIII. Entrega por Milestone.
- 4. Diretriz React Native e ausência de backend → Restrições de escopo e tecnologia.
- 5. Controle, acessibilidade, privacidade e saúde → II, III, IV e IX.
- 6. Ready, Done e quality gate → VI e Fluxo de desenvolvimento e Definition of Done.
- 7. Revisão de documentos e princípios → Governance.
Seções adicionadas: Core Principles (nove princípios explícitos), Restrições de escopo e
tecnologia, Fluxo de desenvolvimento e Definition of Done, Governance.
Regras explicitadas: WCAG 2.2 AA aplicável, neuroinclusão, armazenamento local, offline-first,
simplicidade, testes automatizados e aplicação em todas as etapas do Spec Kit.
Seções removidas: nenhuma regra vigente removida; lista anterior incorporada à nova estrutura.
Ratificação: 2026-09-23, nesta solicitação de adoção; versão anterior era proposta da mesma data.
TODOs ou placeholders pendentes: nenhum.
Artefatos dependentes: não modificados; devem consultar esta constituição em tempo de execução.
-->
# TEAr — Múltiplas Formas de Existir Constitution

## Core Principles

### I. Produto orientado pelo GitHub e pelos critérios de aceite

GitHub Issues e Milestones de `Nosso-Espectro/aplicativo` DEVEM ser a fonte de verdade do
produto. Antes de especificar ou implementar uma história, a equipe DEVE consultar sua origem
via `gh`, preservar os critérios de aceite originais e manter rastreabilidade:
Milestone → spec → Issue/história → requisitos → tasks → implementação → evidências.
Cada Milestone DEVE possuir uma spec; os IDs de requisitos e tasks são locais à spec.
Os critérios de aceite DEVEM orientar a implementação e sua validação.

Requisitos não especificados NÃO DEVEM ser implementados silenciosamente. Lacunas,
contradições e ambiguidades funcionais DEVEM ser registradas com a Issue de origem e
resolvidas explicitamente no backlog antes do trabalho dependente. Documentos locais e o
livro contextualizam o projeto, mas NÃO substituem os requisitos do GitHub.

### II. Acessibilidade desde o início e design neuroinclusivo

Acessibilidade DEVE integrar specification, planning, tasks, implementation e convergence,
desde a definição do fluxo. Interfaces DEVEM atender à WCAG 2.2 nível AA quando aplicável;
a revisão DEVE registrar critérios aplicáveis, evidências e justificativas concretas de
não aplicabilidade ao contexto nativo. Não aplicabilidade NÃO autoriza ignorar barreiras.

O design DEVE ser neuroinclusivo, com baixa carga cognitiva, linguagem clara, baixa estimulação
e interfaces previsíveis. Fluxos DEVEM manter navegação, rótulos e respostas consistentes,
explicitar estados e erros e evitar estímulos inesperados. A revisão de interface DEVE
verificar tecnologias assistivas, legibilidade, contraste, foco, alternativas à comunicação
exclusivamente visual ou sonora e necessidades sensoriais pertinentes ao fluxo.
Essas verificações reduzem barreiras sem pressupor uma única forma de perceber ou comunicar.

### III. Autonomia e controle do usuário

O usuário DEVE controlar suas ações, preferências, dados e estímulos. Fluxos DEVEM informar
consequências relevantes e permitir cancelar ou interromper ações quando aplicável.
Operações irreversíveis DEVEM comunicar claramente seu efeito antes da confirmação.
Sons, animações, notificações e compartilhamentos NÃO DEVEM ocorrer de forma inesperada;
sua ativação e interrupção DEVEM respeitar os requisitos e as escolhas explícitas do usuário.
O design NÃO DEVE usar coerção ou padrões enganosos para obter consentimento ou engajamento.

### IV. Privacidade por padrão, minimização e operação local

Privacidade e segurança DEVEM orientar as decisões desde o planejamento. Cada dado coletado,
permissão solicitada e transmissão DEVE ter finalidade necessária e rastreável ao requisito.
O projeto DEVE minimizar coleta, retenção e exposição, inclusive em logs, e NÃO DEVE ativar
coleta ou compartilhamento opcional por padrão.

Armazenamento local DEVE ser a opção preferida. Adoção de armazenamento remoto DEVE apresentar
necessidade fundamentada, análise de riscos e requisito explícito. Dados locais também DEVEM
receber proteção adequada à sua sensibilidade e às capacidades da plataforma.

Funcionalidades DEVEM ser offline-first quando tecnicamente viável. O plano DEVE registrar
como o uso útil, a persistência e a recuperação de interrupções funcionam sem rede. Dependência
inevitável de rede DEVE ser justificada, comunicada na interface e validada com cenários de
falha e recuperação, sem perda silenciosa de dados.

### V. Código simples, limpo e coeso

O código DEVE ter responsabilidades claras, nomes compreensíveis e a menor complexidade
necessária aos critérios de aceite. Abstrações prematuras e infraestrutura para necessidades
hipotéticas NÃO DEVEM ser introduzidas. Uma abstração DEVE resolver uma necessidade atual
comprovável; uma dependência nova DEVE justificar seu benefício frente às capacidades já
existentes e seus custos de manutenção, segurança, privacidade e tamanho.
Refatorações DEVEM permanecer coesas e vinculadas ao escopo autorizado.

### VI. Testes automatizados e evidências de qualidade

Comportamentos implementados DEVEM ter testes automatizados proporcionais ao risco,
derivados dos critérios de aceite, cobrindo fluxos relevantes, falhas e regressões.
Testes NÃO DEVEM apenas reproduzir a implementação nem criar cobertura artificial.
Verificações manuais de design e acessibilidade DEVEM complementar a automação quando ela
não comprovar o comportamento necessário.

Antes de concluir uma Issue, DEVEM ser executados testes relacionados, lint, build,
typecheck quando aplicável e demais checks existentes exigidos pelo projeto. Evidências
DEVEM registrar resultados reais e limitações. Ausência de ferramentas ou falha de execução
NÃO equivale a aprovação. Tasks só DEVEM ser marcadas como concluídas após a validação.

### VII. Trunk-based e uma branch curta por Issue

O desenvolvimento DEVE ser trunk-based, com `main` como única trunk, sempre utilizável e
integrável. Cada GitHub Issue em desenvolvimento DEVE possuir uma branch curta própria,
criada da `main` atualizada e reintegrada à `main` por Pull Request com revisão e checks.
Issues independentes NÃO DEVEM compartilhar uma branch. Branches DEVEM durar horas ou poucos
dias e manter mudanças pequenas, rastreáveis e próximas da trunk.

As convenções DEVEM ser `feat/us-xxx-slug`, `fix/us-xxx-slug` ou `chore/us-xxx-slug`.
`develop`, `development`, `integration`, `release/*` e branches permanentes de feature
NÃO DEVEM ser criadas. Commits DEVEM ser pequenos e seguir Conventional Commits.
Force-push NÃO DEVE ser usado como rotina; alterações locais do usuário DEVEM ser preservadas.

### VIII. Entrega por Milestone e tags rastreáveis

Uma Milestone DEVE representar uma unidade de entrega. Sua conclusão DEVE resultar em uma
tag anotada no commit integrado da `main`, após todas as Issues previstas estarem concluídas,
seus PRs integrados e o quality gate aprovado. Fechar Issues ou a Milestone no GitHub, por si
só, NÃO comprova entrega.

Tags DEVEM seguir o mapeamento de `specs/README.md`, atualmente `mNNN-slug-da-spec`, e
NÃO DEVEM ser sobrescritas ou movidas. Criação e publicação DEVEM respeitar a autorização
vigente; uma tag pendente de autorização DEVE ser reportada como pendência da entrega.
A versão desta constituição NÃO representa uma versão ou release do aplicativo.

### IX. Apoio sem diagnóstico e limites de IA

Nenhuma funcionalidade, mensagem ou resultado DEVE se apresentar como diagnóstico médico ou
psicológico. Recursos de apoio NÃO DEVEM ser apresentados como tratamento ou substituição
de acompanhamento profissional. O aplicativo NÃO DEVE inferir condições clínicas a partir
de relatos ou registros.

IA, quando explicitamente prevista e autorizada pelo backlog, DEVE atuar apenas como
ferramenta de apoio, com limites claros e decisão sob controle do usuário. Seus resultados
NÃO DEVEM ser tratados como diagnóstico, autoridade clínica ou decisão obrigatória.
A existência deste princípio NÃO autoriza antecipar funcionalidades de IA no MVP.

## Restrições de escopo e tecnologia

TEAr — Múltiplas Formas de Existir / Nosso Espectro integra Minha História, Nosso Espectro.
React Native é a diretriz de plataforma e a primeira versão DEVE operar sem backend.
Antes de cada implementação, a equipe DEVE confirmar a stack real; linguagem, bibliotecas,
persistência e ferramentas NÃO DEVEM ser presumidas a partir de documentos históricos.
Inicialização técnica DEVE ter vinculação explícita no backlog antes do desenvolvimento.
IA, backend e sincronização NÃO DEVEM ser antecipados no MVP.

As instruções de [AGENTS.md](../../AGENTS.md), o
[workflow](../../docs/development-workflow.md) e o [índice de specs](../../specs/README.md)
DEVEM orientar a execução em conjunto com esta constituição. Skills pertinentes DEVEM ser
consultadas sem ampliar a autorização. Push, merge, criação de tag, fechamento de Issue,
PRs e outras escritas no GitHub DEVEM respeitar o escopo autorizado da tarefa.

## Fluxo de desenvolvimento e Definition of Done

A Definition of Ready do workflow DEVE ser atendida antes de iniciar uma Issue: história e
critérios verificáveis, vínculo à Milestone/spec e dependências e ambiguidades bloqueantes
resolvidas. A árvore DEVE estar limpa antes de criar a branch, preservando trabalho local.

Todas as etapas posteriores DEVEM ler esta constituição e registrar conformidade pertinente:

- **Specification**: preservar critérios do GitHub, mapear origem e explicitar requisitos de
  acessibilidade, design, autonomia, privacidade, segurança e comportamento offline pertinentes.
- **Planning**: verificar os princípios antes das decisões técnicas; justificar dependências,
  armazenamento, conectividade e estratégia de testes; registrar riscos e bloqueios.
- **Tasks**: decompor por Issue, incluir validações e revisões exigidas e manter vínculos aos
  critérios e requisitos, sem introduzir funcionalidades não especificadas.
- **Implementation**: executar apenas o escopo autorizado, validar comportamento e registrar
  evidências antes de marcar tasks concluídas.
- **Convergence**: comparar código, spec, plano, tasks e critérios; identificar lacunas e
  trabalho restante rastreável, sem inventar requisitos ou declarar conclusão sem evidências.

A Definition of Done DEVE incluir, obrigatoriamente:

- Critérios de aceite atendidos, tasks verificadas e rastreabilidade preservada.
- Testes automatizados pertinentes aprovados, lint e build aprovados, typecheck quando
  aplicável e checks obrigatórios aprovados.
- Acessibilidade e design revisados, incluindo neuroinclusão, baixa carga cognitiva,
  previsibilidade e controle do usuário nas interfaces afetadas.
- Segurança e privacidade revisadas, incluindo minimização, permissões, logs, dependências
  e armazenamento quando afetados.
- Operação offline e recuperação verificadas quando aplicáveis; limitações justificadas.
- Código revisado quanto a simplicidade e coesão, documentação/spec atualizadas,
  PR vinculado à Issue e revisão concluída, sem regressão impeditiva conhecida.

Cada dimensão da DoD DEVE ter evidência ou justificativa concreta de não aplicabilidade;
nenhuma DEVE ser omitida silenciosamente. Uma mudança apenas documental exige verificações
documentais pertinentes, sem alegar validação do aplicativo.

O quality gate de Milestone DEVE cumprir o workflow: todas as entregas integradas, `main`
atualizada e limpa, suíte completa, lint, tipos quando aplicáveis, build, E2E quando existentes,
checks remotos e revisões de acessibilidade, segurança, privacidade, design e documentação.
Falta de suíte/build, regressão impeditiva ou vulnerabilidade conhecida impeditiva bloqueia
a release. `status: implemented` só DEVE ser registrado após revisão da implementação.

## Governance

Esta constituição estabelece regras obrigatórias para specification, planning, tasks,
implementation e convergence. GitHub permanece a fonte de verdade do escopo do produto;
conflitos entre requisitos e princípios DEVEM ser explicitados e resolvidos antes da execução
dependente, sem flexibilização silenciosa de qualquer lado.

Toda emenda DEVE registrar motivação, princípios afetados, impacto nos artefatos dependentes
e plano de adequação, receber revisão e aprovação explícita do maintainer e atualizar versão
e data. Documentos existentes ainda aplicáveis DEVEM ser preservados. A versão segue SemVer:
MAJOR para remoções ou redefinições incompatíveis, MINOR para novos princípios ou ampliações
materiais e PATCH para esclarecimentos sem mudança normativa.

PRs e revisões de entrega DEVEM verificar conformidade com esta constituição. Divergências
em AGENTS.md, workflow, specs, planos, tasks ou templates DEVEM ser registradas e corrigidas
no escopo apropriado antes de executar trabalho afetado. O comando de constituição altera
somente este documento; artefatos dependentes DEVEM consultá-lo em tempo de execução e ter
sua adequação revisada nas respectivas etapas. Exceções a regras obrigatórias exigem emenda
explícita; justificativas de aplicabilidade previstas nos princípios exigem evidência e revisão.

A versão 1.0.0 era uma proposta documental de 2026-09-23. Esta ampliação é ratificada pela
solicitação de adoção dos princípios nessa mesma data. A preparação inicial limitou-se a
backlog, documentação, Skills, scripts e validação local; ela não representa implementação
ou release do aplicativo. A autorização de cada tarefa futura DEVE continuar sendo respeitada.

**Version**: 1.1.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
