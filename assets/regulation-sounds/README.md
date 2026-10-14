# Sinais originais para US-027

Quatro WAVs mono PCM16, 24 kHz, 23 segundos cada. Todos foram sintetizados por
procedimento original do projeto, licenciado sob [Apache-2.0](../../LICENSE).
Não contêm gravações de pessoas, natureza real ou amostras de terceiros.
FFmpeg é ferramenta de desenvolvimento, não é incorporado/distribuído no app.

| Arquivo | Rótulo | Procedimento |
| --- | --- | --- |
| white.wav | Ruído branco | Ruído branco determinístico |
| brown.wav | Ruído marrom | Ruído marrom filtrado, sem componente DC |
| rain.wav | Chuva sintetizada | Ruído rosa filtrado e modulação lenta |
| ocean.wav | Oceano sintetizado | Ruído rosa com filtro grave e envelope lento |

## Reprodução do Procedimento

`scripts/audio/regulation_assets.py` usa os filtros existentes do
[FFmpeg](https://ffmpeg.org/ffmpeg-filters.html#anoisesrc), seeds fixas e parâmetros
registrados em `manifest.json`. Gera 24 segundos, separa corpo/cabeça/cauda em
entradas independentes e aplica crossfade equal-power de um segundo. Rotacionar
o corpo faz a fronteira do arquivo unir amostras consecutivas do sinal original.
Usa ganho fixo derivado do sinal completo, limitado por RMS 0.075 e pico 0.28;
não aplica ganho automático durante reprodução. Os quatro sinais são distintos.

Verificação offline (somente leitura; sem executar FFmpeg nem reproduzir som):

```bash
python3 scripts/audio/regulation_assets.py
python3 -m unittest discover -s tests/tooling -p test_regulation_assets.py -v
```

Regeneração explícita em diretório **inexistente**:

```bash
python3 scripts/audio/regulation_assets.py --generate --output /tmp/tear-new-sounds
```

Nunca sobrescreve diretório existente, symlink ou arquivo pessoal. Falhas antes
da publicação limpam somente o diretório temporário criado pelo próprio gerador.
A versão exata do FFmpeg fica no manifesto; outra versão pode gerar bytes
diferentes e requer nova revisão, não alteração automática dos checksums.

## Limites da Validação

O verificador confere formato/duração, quatro hashes distintos e SHA256/medidas
registradas, RMS/picos/DC, janelas de 100 ms sem silêncio e salto na fronteira
não superior ao maior salto interno. Esses limites detectam corrupção e artefatos
grosseiros; **não provam loop imperceptível, qualidade percebida, conforto ou
segurança auditiva**. Escuta, dispositivo/codec, volume real, interrupções e
reprodução offline/background ainda dependem do gate nativo de US-027.

Player/UI e testes do fluxo agora implementados na US-027; empacotamento remoto
e validações em aparelho permanecem no gate. Gerar arquivos não inicia áudio
nem concede permissão; reprodução e segundo plano continuam sob ação explícita.
