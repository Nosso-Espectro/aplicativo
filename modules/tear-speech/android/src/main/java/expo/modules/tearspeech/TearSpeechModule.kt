package expo.modules.tearspeech

import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TearSpeechModule : Module() {
  private val main = Handler(Looper.getMainLooper())
  private var engine: TextToSpeech? = null
  private var ready = false
  private var initializing = false
  private var destroyed = false
  private var engineGeneration = 0
  private val waiters = mutableListOf<(Boolean) -> Unit>()
  private var timeout: Runnable? = null
  private var speechPromise: Promise? = null
  private var utteranceId: String? = null
  private var nextUtterance = 0L
  private var playbackGeneration = 0

  override fun definition() = ModuleDefinition {
    Name("TearSpeech")
    Constants("maxInputLength" to TextToSpeech.getMaxSpeechInputLength())

    AsyncFunction("isAvailable") { promise: Promise ->
      main.post {
        initialize { success -> promise.resolve(success && localVoice() != null) }
      }
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("speak") { text: String, promise: Promise ->
      main.post {
        val generation = ++playbackGeneration
        initialize { success ->
          if (generation != playbackGeneration) {
            promise.resolve()
            return@initialize
          }
          val voice = if (success) localVoice() else null
          if (voice == null) {
            promise.reject("ERR_NO_LOCAL_VOICE", "Local pt-BR voice unavailable.", null)
          } else if (text.isBlank()) {
            promise.resolve()
          } else {
            try {
              stopCurrent()
              if (engine?.setVoice(voice) != TextToSpeech.SUCCESS) {
                promise.reject("ERR_NO_LOCAL_VOICE", "Local pt-BR voice unavailable.", null)
              } else {
                val id = "tear-${++nextUtterance}"
                speechPromise = promise
                utteranceId = id
                val result = engine?.speak(text, TextToSpeech.QUEUE_FLUSH, null, id)
                if (result != TextToSpeech.SUCCESS) finish(id, true)
              }
            } catch (_: Exception) {
              if (speechPromise === promise) {
                finish(utteranceId, true)
              } else {
                promise.reject("ERR_LOCAL_SPEECH", "Local speech failed.", null)
              }
            }
          }
        }
      }
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("stop") { promise: Promise ->
      main.post {
        playbackGeneration++
        try {
          stopCurrent()
          promise.resolve()
        } catch (_: Exception) {
          promise.reject("ERR_LOCAL_SPEECH_STOP", "Unable to stop local speech.", null)
        }
      }
    }.runOnQueue(Queues.MAIN)

    OnDestroy {
      main.post {
        destroyed = true
        engineGeneration++
        playbackGeneration++
        timeout?.let { main.removeCallbacks(it) }
        initializing = false
        ready = false
        val callbacks = waiters.toList()
        waiters.clear()
        callbacks.forEach { it(false) }
        try {
          stopCurrent()
        } catch (_: Exception) {
          speechPromise?.resolve()
          speechPromise = null
          utteranceId = null
        } finally {
          engine?.shutdown()
          engine = null
        }
      }
    }
  }

  private fun initialize(callback: (Boolean) -> Unit) {
    if (destroyed) {
      callback(false)
      return
    }
    if (ready) {
      callback(true)
      return
    }
    waiters.add(callback)
    if (initializing) return
    val context = appContext.reactContext?.applicationContext
    if (context == null) {
      finishInitialization(false)
      return
    }
    initializing = true
    val generation = ++engineGeneration
    val watchdog = Runnable {
      if (generation == engineGeneration && initializing) {
        engineGeneration++
        engine?.shutdown()
        engine = null
        finishInitialization(false)
      }
    }
    timeout = watchdog
    main.postDelayed(watchdog, 10000L)
    try {
      engine = TextToSpeech(context) { status ->
        main.post {
          if (generation == engineGeneration && !destroyed) {
            if (status == TextToSpeech.SUCCESS) {
              engine?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(id: String?) {}
                override fun onDone(id: String?) { main.post { finish(id, false) } }
                override fun onError(id: String?) { main.post { finish(id, true) } }
                override fun onError(id: String?, code: Int) { main.post { finish(id, true) } }
                override fun onStop(id: String?, interrupted: Boolean) { main.post { finish(id, true) } }
              })
            }
            finishInitialization(status == TextToSpeech.SUCCESS)
          }
        }
      }
    } catch (_: Exception) {
      finishInitialization(false)
    }
  }

  private fun finishInitialization(success: Boolean) {
    timeout?.let { main.removeCallbacks(it) }
    timeout = null
    initializing = false
    ready = success
    if (!success) {
      engine?.shutdown()
      engine = null
    }
    val callbacks = waiters.toList()
    waiters.clear()
    callbacks.forEach { it(success) }
  }

  private fun localVoice(): Voice? = try {
    engine?.voices?.filter {
      it.locale.language.equals("pt", ignoreCase = true) &&
        it.locale.country.equals("BR", ignoreCase = true) &&
        !it.isNetworkConnectionRequired &&
        it.features?.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED) != true
    }?.sortedWith(compareByDescending<Voice> { it.quality }.thenBy { it.name })?.firstOrNull()
  } catch (_: Exception) {
    null
  }

  private fun stopCurrent() {
    val result = engine?.stop()
    if (result != null && result != TextToSpeech.SUCCESS) {
      throw IllegalStateException("Unable to stop local speech.")
    }
    val pending = speechPromise
    speechPromise = null
    utteranceId = null
    pending?.resolve()
  }

  private fun finish(id: String?, failed: Boolean) {
    if (id == null || id != utteranceId) return
    val pending = speechPromise
    speechPromise = null
    utteranceId = null
    if (failed) {
      engine?.stop()
      pending?.reject("ERR_LOCAL_SPEECH", "Local speech failed.", null)
    } else {
      pending?.resolve()
    }
  }
}
