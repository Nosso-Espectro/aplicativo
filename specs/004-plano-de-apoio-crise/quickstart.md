# US-011 — Plano pessoal de apoio

Use somente dados sintéticos; não registre conteúdo pessoal. Comunicação → Plano
de Apoio abre um plano inicialmente vazio. Preencher orientações livres, marcar
quaisquer sugestões originais e salvar explicitamente. Reabrir mantém escolhas e
texto. Cancelar não salva; limpar fontes individualmente mantém as outras.
Remover plano exige confirmação e preserva preferências/sensibilidades do perfil.

As informações do perfil são opcionais: escolher campos específicos lê somente
seus valores atuais não vazios. Plano guarda IDs, não copia texto do perfil.
Editar/remover informação no perfil e reabrir o plano reflete a mudança; desmarcar
durante leitura não exibe resultado obsoleto. Perfil indisponível produz erro
genérico com retry independente, mantendo orientações e edição do plano.

Falha ao abrir o plano bloqueia edição/gravação e permite retry/cancelar. Falha
ao gravar/remover mantém rascunho e plano confirmado; controles ficam indisponíveis
durante commit, sem mensagem de sucesso prematura. SQLite privado versão1,
transações/SQL parametrizado, sem rede, conta, logs pessoais ou permissões novas.
Prévia web comunica indisponibilidade do armazenamento nativo, sem dados simulados.

200 testes Jest/33 suítes aprovados, incluindo 27 específicos: modelo, SQLite
real do Node24, componentes e rotas. Lint/typecheck, Doctor21/21,49 tooling e
validador aprovados. Review estática
sem problema impeditivo identificado. Não foi validada interface visual em
aparelho, leitor de tela, foco/ampliação/teclado, offline SQLite Expo ou backups:
pendências T006 no gate, sem aprovação de release. Builds somente remotos no SHA
integrado; segurança do host #61 permanece pendente e instalação no celular não
é autorizada por mero sucesso de build.

Esta entrega não inclui cartão em tela cheia, painel de regulação, contato ou
WhatsApp (#12/#10/#13), nem afirma diagnóstico ou substituição de acompanhamento.

## US-013 — Contato de confiança

Comunicação → Contato de confiança, inicialmente vazio. Usar somente dados
sintéticos: telefone internacional com código do país explícito, mensagem livre
e nome opcional. Salvar não abre WhatsApp, cancelar não grava; reabrir restaura
conteúdo local. Telefone/mensagem inválidos preservam preenchimento e versão
salva. Falha de commit/read conserva confirmado e permite retry/cancelar, sem
sucesso prematuro. Remoção integral exige confirmação mesmo ao limpar todos os
campos manualmente e preserva plano/perfil.

Revisar pedido de apoio mostra telefone e mensagem SALVOS e as consequências de
encaminhá-los ao WhatsApp; cancelar não abre nada. Alterar draft invalida revisão.
Somente Confirmar abertura verifica disponibilidade e solicita link oficial
preenchido. Não envia mensagem nem afirma recebimento; destino final e envio
permanecem sob controle da pessoa no aplicativo externo. Indisponibilidade,
rejeição/cancelamento ou falha mantêm conteúdo local com feedback genérico e retry
explícito; sem fallback, envio ou tentativa automáticos. Nenhuma cópia do perfil,
leitura de agenda, permissão de contatos, conta/telemetria/backend ou log pessoal.

Validação usa libphonenumber-js1.13.15/max offline e não comprova pessoa/conta
WhatsApp. Consultas mínimas Android VIEW/scheme whatsapp e iOS
LSApplicationQueriesSchemes configuradas; testes com mocks/fixtures, nenhum
prebuild/build local. Avisos MIT/Apache integrais em docs/third-party-notices,
pareados com APK/simulador pelo workflow remoto. Licenças de outras dependências
e auditoria #51 não estão aprovadas por isso.

40 testes específicos e três de licenças/workflow verificados, incluindo SQLite
real do Node, componentes, Linking e rotas. Evidência em 2026-10-13:243 testes
Jest/40 suítes, lint/typecheck,Doctor21/21,49 tooling e validador aprovados;
review concluída sem regressão impeditiva identificada. T017 permanece pendente: handoff
nativo real, leitores de tela/foco/ampliação/teclado, offline Expo e backups.
Builds no SHA integrado não equivalem a testes funcionais no aparelho; não foi
operado WhatsApp nem usado contato/conteúdo pessoal do Samsung.
