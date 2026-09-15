package com.cabsoundbox.app

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.media.ToneGenerator
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

class SoundboxSpeaker private constructor(private val context: Context) {

    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Default to Hindi if available, otherwise Indian English or English
                val hindiLocale = Locale("hi", "IN")
                val result = tts?.setLanguage(hindiLocale)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts?.setLanguage(Locale("en", "IN"))
                }
                tts?.setSpeechRate(0.95f)
                isTtsReady = true
                Log.d("SoundboxSpeaker", "TTS initialized successfully")
            } else {
                Log.e("SoundboxSpeaker", "TTS initialization failed: $status")
            }
        }
    }

    /**
     * Play loud soundbox chime and speak transaction aloud through vehicle/phone speaker
     */
    fun announcePayment(amount: Double, provider: String, senderName: String?) {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        // Temporarily boost media stream volume to ensure driver hears it over traffic
        val currentVol = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        val maxVol = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        if (currentVol < (maxVol * 0.75).toInt()) {
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, (maxVol * 0.85).toInt(), 0)
        }

        // 1. Play dual-tone soundbox chime
        playChime()

        // 2. Speak the announcement after 400ms chime delay
        Handler(Looper.getMainLooper()).postDelayed({
            speakText(buildSpeechString(amount, provider, senderName))
        }, 450)
    }

    fun announceExpense(amount: Double, category: String) {
        playChime()
        Handler(Looper.getMainLooper()).postDelayed({
            val speech = "सीएनजी का खर्चा ${amount.toInt()} रुपये दर्ज किया गया।"
            speakText(speech)
        }, 450)
    }

    private fun playChime() {
        try {
            val toneGen = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
            toneGen.startTone(ToneGenerator.TONE_CDMA_HIGH_L, 120)
            Handler(Looper.getMainLooper()).postDelayed({
                toneGen.startTone(ToneGenerator.TONE_PROP_BEEP2, 200)
            }, 130)
        } catch (e: Exception) {
            Log.e("SoundboxSpeaker", "Error playing chime", e)
        }
    }

    private fun buildSpeechString(amount: Double, provider: String, senderName: String?): String {
        val amtInt = amount.toInt()
        val providerName = when (provider.lowercase()) {
            "paytm" -> "Paytm"
            "phonepe" -> "PhonePe"
            "google_pay" -> "Google Pay"
            "bharatpe" -> "BharatPe"
            else -> "UPI"
        }

        return if (!senderName.isNullOrBlank()) {
            "$providerName पर $senderName से $amtInt रुपये प्राप्त हुए।"
        } else {
            "$providerName पर $amtInt रुपये प्राप्त हुए।"
        }
    }

    private fun speakText(text: String) {
        if (!isTtsReady || tts == null) {
            Log.w("SoundboxSpeaker", "TTS not ready yet, retrying...")
            Handler(Looper.getMainLooper()).postDelayed({
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "SoundboxPaymentId")
            }, 600)
            return
        }

        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "SoundboxPaymentId")
    }

    companion object {
        @Volatile
        private var instance: SoundboxSpeaker? = null

        fun getInstance(context: Context): SoundboxSpeaker {
            return instance ?: synchronized(this) {
                instance ?: SoundboxSpeaker(context).also { instance = it }
            }
        }
    }
}
