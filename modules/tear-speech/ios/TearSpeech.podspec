Pod::Spec.new do |s|
  s.name = 'TearSpeech'
  s.version = '1.0.0'
  s.summary = 'Local pt-BR speech for TEAr'
  s.description = 'Device speech with explicit playback and cancellation.'
  s.author = 'Nosso Espectro'
  s.homepage = 'https://github.com/Nosso-Espectro/aplicativo'
  s.license = { :type => 'Apache-2.0', :file => '../../../LICENSE' }
  s.platform = :ios, '16.4'
  s.source = { :git => 'https://github.com/Nosso-Espectro/aplicativo.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'AVFoundation'
  s.swift_version = '5.9'
  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
