# Nosso Espectro

Ferramentas de comunicação, rotina, regulação e autonomia para pessoas autistas e neurodivergentes.

O **Nosso Espectro** é um aplicativo mobile em planejamento, que será desenvolvido em **React Native**. A primeira versão será **sem backend**, com funcionamento local e armazenamento de dados no próprio dispositivo.

## O projeto e o livro

O aplicativo integra o projeto **Minha História, Nosso Espectro**, do qual também faz parte o livro **TEAr — Múltiplas Formas de Existir**, organizado por **Clarice Tardio**.

O livro reúne narrativas autobiográficas de pessoas autistas diagnosticadas tardiamente e aborda experiências de vida, pertencimento, capacitismo, identidade e diversidade dentro do espectro. Sua apresentação destaca a importância de tornar esse conhecimento acessível para além dos espaços clínicos e acadêmicos, valorizando a voz das próprias pessoas neurodivergentes.

Nesse mesmo contexto, o aplicativo tem como propósito oferecer apoio prático ao cotidiano, respeitando diferentes formas de se comunicar, organizar atividades e lidar com necessidades sensoriais. A proposta é favorecer autonomia e autoconhecimento, com respeito às escolhas e às particularidades de cada pessoa.

## Para quem

Pessoas autistas e neurodivergentes com diferentes necessidades de apoio, incluindo quem recebeu um diagnóstico tardio. Familiares e pessoas de confiança também poderão apoiar o uso, conforme a vontade de quem utiliza o aplicativo.

## Funcionalidades propostas

Os quatro eixos abaixo partem da descrição original do repositório. Os exemplos são propostas para orientar o desenvolvimento e ainda precisam ser priorizados e validados com as pessoas que utilizarão o app; não representam funcionalidades já implementadas.

| Eixo | Objetivo | Possibilidades de recursos |
| --- | --- | --- |
| Comunicação | Facilitar a expressão de necessidades, preferências e sentimentos. | Cartões e mensagens personalizáveis para situações do cotidiano. |
| Rotina | Apoiar a organização e a previsibilidade das atividades. | Rotinas visuais, listas de tarefas e divisão de atividades em etapas. |
| Regulação | Ajudar a reconhecer necessidades e acessar recursos pessoais de apoio. | Registro de como a pessoa está se sentindo e acesso rápido a estratégias de conforto escolhidas por ela. |
| Autonomia | Facilitar escolhas e ações do dia a dia. | Guias personalizados, lembretes e organização de informações úteis. |

## Primeira versão: sem backend

A versão inicial será organizada para que os recursos essenciais funcionem sem conexão com a internet.

- **React Native** como base do aplicativo mobile.
- **Persistência local** para preferências, rotinas e demais registros criados no app.
- **Sem cadastro ou autenticação remota** para utilizar os recursos iniciais.
- **Sem API própria, banco de dados remoto ou sincronização entre dispositivos** nesta etapa.

A biblioteca de armazenamento, a ferramenta de criação do projeto e as demais dependências serão definidas durante a implementação. Não há escolha de Expo ou de outro fluxo de desenvolvimento estabelecida neste repositório.

Como os dados serão locais, a primeira versão não contará com recuperação por conta online. Exportação, importação e backup ainda precisam ter seu escopo definido; sem esses recursos, a remoção dos dados do app ou a perda do dispositivo poderá resultar na perda dos registros.

## Diretrizes de experiência e acessibilidade

- Usar linguagem clara, respeitosa e sem infantilização.
- Oferecer navegação previsível e reduzir estímulos desnecessários.
- Permitir personalização de acordo com preferências e necessidades individuais.
- Considerar leitores de tela, tamanhos de texto ajustáveis e contraste adequado.
- Evitar depender exclusivamente de cores, sons ou animações para transmitir informações.
- Preservar o controle da pessoa sobre seus registros e escolhas.
- Envolver pessoas autistas e neurodivergentes na definição e na avaliação dos recursos.

## Estado atual

O repositório está na etapa de documentação e definição de escopo. Ainda não há código React Native, dependências, scripts de execução ou uma versão instalável do aplicativo.

### Próximos passos

- [ ] Validar necessidades e priorizar os recursos da primeira versão com o público do projeto.
- [ ] Definir os fluxos e protótipos de interface.
- [ ] Inicializar o projeto React Native e documentar o ambiente de desenvolvimento.
- [ ] Definir e implementar a persistência local.
- [ ] Desenvolver os recursos priorizados de comunicação, rotina, regulação e autonomia.
- [ ] Verificar acessibilidade, usabilidade e funcionamento sem internet.
- [ ] Documentar instalação, execução e contribuição técnica conforme a implementação avançar.

## Como acompanhar e contribuir

O desenvolvimento será orientado pelo backlog do GitHub, com uma spec por milestone e uma branch curta por Issue. Consulte o [índice de especificações](specs/README.md), o [workflow de desenvolvimento](docs/development-workflow.md), as [pendências do backlog](docs/backlog-audit.md) e o [contrato de engenharia](AGENTS.md). Essa documentação detalha o planejamento; não representa funcionalidades implementadas.

Sugestões de uso, relatos de barreiras de acessibilidade, melhorias na documentação e contribuições de desenvolvimento são bem-vindos.

Use as [issues do repositório](https://github.com/Nosso-Espectro/aplicativo/issues) para propor melhorias ou discutir funcionalidades. Para contribuir com arquivos, crie uma branch com suas alterações e abra um pull request explicando o que mudou e por quê. Ao compartilhar exemplos de uso, evite incluir dados pessoais de outras pessoas.

Para obter uma cópia local:

```bash
git clone https://github.com/Nosso-Espectro/aplicativo.git
cd aplicativo
```

Os comandos de instalação e execução serão adicionados quando a base React Native estiver disponível.

## Referência e licença

O contexto do projeto foi elaborado a partir da apresentação do livro *TEAr — Múltiplas Formas de Existir*, organizado por Clarice Tardio, Salvador–BA, 2026, e da descrição original deste repositório.

Este repositório utiliza a licença [Apache 2.0](LICENSE). A licença do software não se estende automaticamente aos textos, às ilustrações ou a outros materiais do livro, que possuem direitos próprios.
