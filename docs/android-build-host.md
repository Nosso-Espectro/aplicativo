# Android Build Host

## Recuperação técnica do host — Issue #61

Após o usuário priorizar a correção do servidor, foi instalado Temurin17.0.20.1+1
em caminho próprio root-owned, por archive oficial com SHA256 confirmado.
Java global/serviços não foram alterados. JVMs antigas somente da conta dedicada
foram encerradas. `dpkg -V` dos pacotes JDK/SSH não relatou divergências, e a
consulta limitada do kernel não encontrou OOM/MCE no intervalo analisado.
Isso não é uma auditoria completa do host nem exclui instabilidade da VM/KVM.

O wrapper usa JDK verificado, `--no-daemon`, dois workers e Kotlin in-process.
Relatórios fatais por SHA ficam em `/srv/tear-build/diagnostics`, modo700, fora
do checkout limpo; não publicar logs brutos em artefatos do GitHub. Hash/mode do
wrapper instalado foram conferidos e comando inválido foi rejeitado.

`scripts/build/install-build-jdk.sh` valida checksum fixo da versão oficial,
recusa sobrescrever destino existente e não altera alternatives do sistema.
O provisionamento espera esse script ao lado do wrapper. Para recuperar somente
o JDK/wrapper, instalar o JDK como root e copiar o wrapper com root:root/mode755;
não executar provisionamento completo em host com serviços/dados desconhecidos.

Compilação diagnóstica do SHA `d54ad611bb20dd52109789e4c8991c1e926726ef`
iniciada em 2026-10-13 no usuário restrito; resultado ainda pendente nesta revisão.
Nenhum APK dessa investigação liberado/instalado e nenhum retorno automático
do workflow ao SSH. Correção das ferramentas não comprova saneamento do servidor.

## Suspensão temporária do host — Issue #61

Em 2026-10-13 os builds Android das US-008/US-014 falharam por encerramento
fatal da JVM/Gradle, não por um erro de compilação diagnosticado no app. Logs
do workflow indicam `hs_err_pid39900.log` e `hs_err_pid116455.log`; ambos foram
apagados pela limpeza do checkout na tentativa seguinte. Relatórios anteriores
do Kotlin mostram SIGSEGV/SIGILL em frames Java compilados C1 com OpenJDK Ubuntu
17.0.20.1. Não há evidência observada de OOM; isso não exclui falha JVM/hardware.
Não se atribui a causa raiz a um bug específico sem o relatório correspondente.

Também foi encontrado relatório de crash de `/usr/bin/xmrig` executado como root.
O usuário pediu remoção: executável/processo já estavam ausentes; remoção explícita
do caminho e busca de nomes/referências em arquivos, serviços e cron confirmaram
ausência nos locais examinados. Relatórios de crash foram preservados no host,
não publicados. A busca limitada NÃO comprova integridade do sistema, nem relação
causal entre mineração e falhas de build. Não instalar artefatos desse host.

Por isolamento preventivo, o workflow manual Android volta temporariamente ao
runner GitHub `ubuntu-24.04`, com Node da `.nvmrc`, Temurin17, SDK36/NDK27.1,
dependências pelo lockfile, sem SSH ou caches/artefatos do host. Gradle usa
`--no-daemon` (pode criar JVM de uso único), dois workers e Kotlin in-process.
Isso evita reutilizar processos antigos, mas não é prova de correção do crash;
o resultado nativo deve ser confirmado na execução remota do SHA integrado.
Sem mudanças em iOS/macOS ou compilação local.

Antes de reativar SSH: investigar/recriar o servidor a partir de imagem confiável,
rotacionar credenciais e revisar segurança da conta root/serviços. Reinstalação
destrutiva do servidor não foi autorizada nesta tarefa. Os scripts abaixo ficam
preservados como referência; provisioná-los não é validação de host íntegro.

Referências técnicas: [daemon Gradle](https://docs.gradle.org/current/userguide/gradle_daemon.html),
[estratégia Kotlin](https://kotlinlang.org/docs/compiler-execution-strategy.html),
[logs fatais JVM](https://docs.oracle.com/en/java/javase/17/troubleshoot/location-fatal-error-log.html).

Issue #49: Ubuntu 24.04 x86_64 dedicado, 8 CPUs, 31 GiB RAM. GitHub Actions
continua coordenando checks/artefatos; somente a compilação Android usa SSH.
iOS permanece no runner macOS 26: Linux não fornece Xcode ou assinatura iOS.
Nenhum build é executado automaticamente na máquina de desenvolvimento.

## Provisionamento

Copiar `scripts/build/provision-android-host.sh`, `scripts/build/install-build-jdk.sh`, `scripts/build/tear-android-ci`
e a chave **pública** dedicada para o servidor e executar como root:

```bash
bash provision-android-host.sh /caminho/chave.pub /caminho/tear-android-ci
```

Instala JDK 17, Node 24.21.0/npm 11.19.0 e Android SDK 36/build-tools 36.0.0/
NDK 27.1.12297006. Compilação pelo usuário `tear-build`, sem sudo ou Docker.
Não reinicia a máquina nem altera serviços existentes. Ferramentas em
`/opt/tear-build`, checkout/cache/artefatos em `/srv/tear-build`.

## Acesso

Segredos do repositório: `TEAR_BUILD_HOST`, `TEAR_BUILD_SSH_KEY` e
`TEAR_BUILD_KNOWN_HOSTS`. Chave dedicada ed25519, autenticação restrita a um
comando root-owned e sem túnel/PTY. A senha root serve somente ao provisionamento;
não é armazenada em arquivos do projeto nem nos segredos do GitHub.
Verificação de host obrigatória: nunca usar `StrictHostKeyChecking=no`.

O comando remoto aceita somente `build SHA` ou `artifact SHA`, com SHA completo.
Build valida ancestralidade na main do repositório fixo e serializa com flock.
O checkout é descartável e pode ser limpo, ao contrário dos worktrees de desenvolvimento.
Código compilado roda com as permissões do usuário de build; não colocar dados
pessoais ou credenciais adicionais nessa conta. Não usar runner self-hosted aberto
a PRs deste repositório público.

## Uso

```bash
gh workflow run mobile-quality.yml --repo Nosso-Espectro/aplicativo --ref main -f platform=android
```

Execução manual somente na main. PRs e pushes mantêm checks leves em runners GitHub.
APK é transferido por SSH e publicado como `tear-android-SHA`; gate remoto existente
continua verificando jobs e artefatos no SHA integrado. Não presume instalação,
funcionamento offline ou acessibilidade em aparelho a partir da compilação.

Revogar acesso: remover os três segredos e a chave pública em authorized_keys.
Trocar a chave em ambos os lados para rotação; nunca incluir chave privada no repo.
