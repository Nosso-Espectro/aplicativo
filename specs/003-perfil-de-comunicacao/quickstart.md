# US-014 — Preferências de Comunicação

Use somente dados sintéticos nos testes e não registre conteúdo pessoal.

Comunicação → Perfil de comunicação: estado inicial vazio e tempo não informado.
Preencher textos livres e escolher preciso/não preciso/não informado; salvar e
reabrir mantém distinção. Limpar um campo e salvar remove essa informação.
Remoção integral exige confirmação; cancelar mantém dados. Falha de gravação
conserva formulário e versão salva, permite salvar novamente/cancelar, sem detalhe
interno. Durante commit, controles ficam indisponíveis e não há sucesso antecipado.

135 testes Jest/24 suítes passaram: cinco SQL reais via Node24 e seis componentes
novos. Lint/typecheck e 47 testes tooling aprovados; teste no host não comprova Expo
em aparelho. Texto escalável, controles 48dp, radios com estado e erros acessíveis
revisados estaticamente. Sem novas dependências/permissões, rede, logs pessoais,
exportação ou compartilhamento; nenhuma inferência clínica. SQLite privado próprio.

Pendências T006: persistência offline nativa, leitor de tela/foco/teclado/ampliação
e backups do sistema. Prévia web informa armazenamento nativo indisponível, sem
persistência simulada. Builds remotos e atualização do Samsung preservando dados
somente após integração/artefato. Nenhum build local ou release aprovado.

## US-015 — Sensibilidades e estratégias

Perfil de comunicação → Sensibilidades e estratégias. Preencher somente os campos
escolhidos (som, luz, toque, temperatura, outras, estratégias úteis/evitadas),
salvar explicitamente e reabrir. Cancelar não grava; limpar um campo e salvar
remove essa informação. Remover todas exige confirmação e mantém a comunicação
da US-014. Falha conserva preenchimento e versão salva, oferecendo retry sem
exibir detalhes internos; gravação pendente bloqueia ações duplicadas.

SQLite versão2 migra a tabela de comunicação intacta e adiciona tabela própria
de suporte; testes reais no Node verificam migração v1, reabertura, UPSERT,
isolamento, rollback e leitura do contrato `readSupportForPlan(selected)`.
O contrato retorna somente valores atuais escolhidos explicitamente (padrão
nenhum), sem snapshot antigo após editar/remover; seu consumidor visual será #11.
Testes de componentes verificam campos/rótulos, estados vazio/erro/salvando,
edição/remoção/cancelamento/retry e navegação sem gravação implícita.

Revisão estática: textos escaláveis, formulário em scroll com teclado, alvos
mínimos 48dp, rótulos acessíveis e cabeçalhos, sem áudio/animação automáticos,
permissões/dependências novas, rede ou logs de conteúdo. T011 continua pendente
para SQLite Expo offline, TalkBack/VoiceOver, foco/ampliação/teclado e política
de backups em dispositivo. Mocks/SQLite do host não equivalem a essas validações.

Evidência em 2026-10-13: 151 testes Jest/26 suítes, lint/typecheck, Doctor21/21,
47 testes de tooling e validador de workflow aprovados na branch US-015.
