# TearSpeech — US-003 / Issue #3

Módulo Expo local. Autolinking em modules/tear-speech; não usa serviço externo
nem solicita captura de áudio. Código sob a licença Apache-2.0 do repositório.

- isAvailable: consulta apenas voz pt-BR disponível no dispositivo.
- speak: resolve ao terminar a mensagem; não inicia leitura sem chamada explícita.
- stop: interrompe a mensagem e resolve a operação pendente.
- maxInputLength: limite técnico por utterance; o cliente divide mensagens
  sem impor máximo funcional à frase e sem perder caracteres.

Android: TextToSpeech, vozes com rede exigida ou dados ausentes rejeitadas,
inicialização com espera limitada. Manifesto declara apenas a query TTS_SERVICE.
iOS: AVSpeechSynthesisVoice.speechVoices e AVSpeechSynthesizer; sem downloads.
Validar disponibilidade real e leitura offline em aparelhos continua obrigatório.

O navegador e Expo Go sem este módulo apresentam indisponibilidade e mantêm
o quadro/frase utilizáveis. A prévia web não comprova voz offline.

Não registrar textos em logs. Erros enviados ao JS são genéricos, sem conteúdo.
Builds ocorrem no GitHub Actions; não compilar automaticamente na máquina local.
