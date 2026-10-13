import AVFoundation
import ExpoModulesCore

public class TearSpeechModule: Module {
  private var engine: LocalSpeechEngine?

  private func localEngine() -> LocalSpeechEngine {
    if let engine = engine { return engine }
    let created = LocalSpeechEngine()
    engine = created
    return created
  }

  public func definition() -> ModuleDefinition {
    Name("TearSpeech")
    Constants(["maxInputLength": 4000])

    AsyncFunction("isAvailable") {
      return self.localEngine().localVoice() != nil
    }.runOnQueue(.main)

    AsyncFunction("speak") { (text: String, promise: Promise) in
      self.localEngine().speak(text, promise: promise)
    }.runOnQueue(.main)

    AsyncFunction("stop") { () -> Void in
      self.engine?.stop()
    }.runOnQueue(.main)

    OnDestroy {
      let engine = self.engine
      DispatchQueue.main.async { engine?.stop() }
    }
  }
}

private final class LocalSpeechEngine: NSObject, AVSpeechSynthesizerDelegate {
  private let synthesizer = AVSpeechSynthesizer()
  private var pending: Promise?
  private var current: AVSpeechUtterance?

  override init() {
    super.init()
    synthesizer.delegate = self
    synthesizer.usesApplicationAudioSession = false
  }

  func localVoice() -> AVSpeechSynthesisVoice? {
    AVSpeechSynthesisVoice.speechVoices()
      .filter { $0.language == "pt-BR" }
      .sorted { $0.identifier < $1.identifier }
      .first
  }

  func speak(_ text: String, promise: Promise) {
    guard let voice = localVoice() else {
      promise.reject("ERR_NO_LOCAL_VOICE", "Local pt-BR voice unavailable.")
      return
    }
    guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
      promise.resolve()
      return
    }
    stop()
    let utterance = AVSpeechUtterance(string: text)
    utterance.voice = voice
    pending = promise
    current = utterance
    synthesizer.speak(utterance)
  }

  func stop() {
    let promise = pending
    pending = nil
    current = nil
    synthesizer.stopSpeaking(at: .immediate)
    promise?.resolve()
  }

  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
    finish(utterance)
  }

  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
    finish(utterance, cancelled: true)
  }

  private func finish(_ utterance: AVSpeechUtterance, cancelled: Bool = false) {
    guard current === utterance else { return }
    let promise = pending
    pending = nil
    current = nil
    if cancelled {
      promise?.reject("ERR_LOCAL_SPEECH_CANCELLED", "Local speech interrupted.")
    } else {
      promise?.resolve()
    }
  }
}
