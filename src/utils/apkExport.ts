import JSZip from 'jszip';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('README.md', `# Cab Soundbox Android APK (Automatic Background SMS & UPI Reader)

This is the complete, 100% native Android Studio project for Cab Soundbox.

## Features:
- **100% Automatic SMS Interceptor**: Uses \`BroadcastReceiver\` on \`android.provider.Telephony.SMS_RECEIVED\` with priority 999.
- **24/7 Notification Listener**: Uses \`NotificationListenerService\` to automatically catch push notifications from PhonePe, Google Pay, Paytm, and BHIM.
- **Soundbox Dual-Tone Chime & TTS**: Loud dual-tone chime + native Android TextToSpeech in Hindi and English.
- **Zero-Touch Driving Mode**: Driver does not have to click, copy, or touch anything while driving.

## How to Build the .APK:
1. Open this folder in **Android Studio** (Electric Eel, Hedgehog, or newer).
2. Let Gradle sync dependencies.
3. Click **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
4. Locate the generated \`app-debug.apk\` in \`app/build/outputs/apk/debug/\`.
5. Transfer to your Android phone and install!

## Or Build in Cloud with GitHub Actions:
- Push this repo to GitHub.
- Go to the **Actions** tab -> **Build Android APK**.
- Download the generated \`CabSoundbox-AutoSMS-Release-APK.apk\` directly!
`);

  zip.file('settings.gradle', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "CabSoundbox"
include ':app'
`);

  zip.file('build.gradle', `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`);

  // App module
  const app = zip.folder('app');
  if (app) {
    app.file('build.gradle', `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.cabsoundbox.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.cabsoundbox.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
`);

    const main = app.folder('src')?.folder('main');
    if (main) {
      main.file('AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cabsoundbox.app">

    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Cab Soundbox"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Automatic Zero-Touch SMS Interceptor -->
        <receiver
            android:name=".SmsReceiver"
            android:exported="true"
            android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

        <!-- Automatic Notification Listener for GPay / PhonePe / Paytm -->
        <service
            android:name=".UpiNotificationListenerService"
            android:label="Cab Soundbox Notification Reader"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

    </application>
</manifest>
`);

      // Android Resources
      const res = main.folder('res');
      if (res) {
        res.folder('values')?.file('strings.xml', `<resources>
    <string name="app_name">Cab Soundbox</string>
</resources>`);

        res.folder('values')?.file('colors.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#10b981</color>
    <color name="primary_dark">#059669</color>
    <color name="accent">#3b82f6</color>
    <color name="background">#020617</color>
</resources>`);

        res.folder('values')?.file('themes.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.CabSoundbox" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryVariant">@color/primary_dark</item>
        <item name="colorOnPrimary">#ffffff</item>
        <item name="android:statusBarColor">@color/background</item>
    </style>
</resources>`);

        res.folder('drawable')?.file('ic_launcher.xml', `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:fillColor="#064e3b" android:pathData="M0,0h108v108h-108z" />
    <path android:fillColor="#10b981" android:pathData="M38,36 L48,36 L62,24 L62,84 L48,72 L38,72 Z" />
</vector>`);
      }

      const javaPkg = main.folder('java')?.folder('com')?.folder('cabsoundbox')?.folder('app');
      if (javaPkg) {
        javaPkg.file('SmsReceiver.kt', `package com.cabsoundbox.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        try {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            val fullBody = StringBuilder()
            for (sms in messages) {
                fullBody.append(sms.messageBody)
            }
            val smsText = fullBody.toString()
            Log.d("SmsReceiver", "Automatic SMS intercepted: $smsText")

            val parsed = UpiParser.parse(smsText)
            if (parsed != null) {
                val speaker = SoundboxSpeaker.getInstance(context)
                if (parsed.isExpense) {
                    speaker.announceExpense(parsed.amount, "CNG")
                } else {
                    speaker.announcePayment(parsed.amount, parsed.provider, parsed.senderName)
                }
            }
        } catch (e: Exception) {
            Log.e("SmsReceiver", "Error processing SMS", e)
        }
    }
}
`);

        javaPkg.file('UpiNotificationListenerService.kt', `package com.cabsoundbox.app

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class UpiNotificationListenerService : NotificationListenerService() {
    private val supportedPackages = setOf(
        "net.one97.paytm",
        "com.phonepe.app",
        "com.phonepe.app.business",
        "com.google.android.apps.nbu.paisa.user",
        "com.google.android.apps.nbu.paisa.merchant",
        "com.bharatpe.app",
        "in.org.npci.upiapp"
    )

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val pkg = sbn.packageName
        if (!supportedPackages.contains(pkg)) return

        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val combinedMessage = "$title $text"

        val parsed = UpiParser.parse(combinedMessage)
        if (parsed != null) {
            val speaker = SoundboxSpeaker.getInstance(applicationContext)
            if (parsed.isExpense) {
                speaker.announceExpense(parsed.amount, "CNG")
            } else {
                speaker.announcePayment(parsed.amount, parsed.provider, parsed.senderName)
            }
        }
    }
}
`);

        javaPkg.file('SoundboxSpeaker.kt', `package com.cabsoundbox.app

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import java.util.Locale

class SoundboxSpeaker private constructor(private val context: Context) {
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.setLanguage(Locale("hi", "IN"))
                tts?.setSpeechRate(0.95f)
                isTtsReady = true
            }
        }
    }

    fun announcePayment(amount: Double, provider: String, senderName: String?) {
        playChime()
        Handler(Looper.getMainLooper()).postDelayed({
            val prov = when (provider.lowercase()) {
                "paytm" -> "Paytm"
                "phonepe" -> "PhonePe"
                "google_pay" -> "Google Pay"
                "bharatpe" -> "BharatPe"
                else -> "UPI"
            }
            val text = if (!senderName.isNullOrBlank()) {
                "\$prov पर \$senderName से \${amount.toInt()} रुपये प्राप्त हुए।"
            } else {
                "\$prov पर \${amount.toInt()} रुपये प्राप्त हुए।"
            }
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "PaymentSoundbox")
        }, 450)
    }

    fun announceExpense(amount: Double, category: String) {
        playChime()
        Handler(Looper.getMainLooper()).postDelayed({
            tts?.speak("सीएनजी का खर्चा \${amount.toInt()} रुपये दर्ज किया गया।", TextToSpeech.QUEUE_FLUSH, null, "ExpenseSoundbox")
        }, 450)
    }

    private fun playChime() {
        try {
            val tone = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
            tone.startTone(ToneGenerator.TONE_CDMA_HIGH_L, 120)
        } catch (e: Exception) {}
    }

    companion object {
        @Volatile private var instance: SoundboxSpeaker? = null
        fun getInstance(context: Context): SoundboxSpeaker {
            return instance ?: synchronized(this) {
                instance ?: SoundboxSpeaker(context).also { instance = it }
            }
        }
    }
}
`);

        javaPkg.file('UpiParser.kt', `package com.cabsoundbox.app

import java.util.regex.Pattern

data class ParsedPayment(
    val amount: Double,
    val provider: String,
    val senderName: String?,
    val isExpense: Boolean
)

object UpiParser {
    fun parse(text: String): ParsedPayment? {
        val lower = text.lowercase()
        val isCng = lower.contains("cng") || lower.contains("petrol") || lower.contains("fuel")
        val isDebit = (lower.contains("debited") || lower.contains("spent")) && !lower.contains("credited")

        if (isDebit && !isCng) return null

        val matcher = Pattern.compile("(?:inr|rs\\.?|₹)\\s*([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE).matcher(text)
        var amount: Double? = null
        if (matcher.find()) {
            amount = matcher.group(1)?.toDoubleOrNull()
        }
        if (amount == null || amount <= 0) return null

        val provider = when {
            lower.contains("paytm") -> "paytm"
            lower.contains("phonepe") -> "phonepe"
            lower.contains("gpay") || lower.contains("google pay") -> "google_pay"
            lower.contains("bharatpe") -> "bharatpe"
            else -> "upi"
        }

        return ParsedPayment(amount, provider, null, isCng)
    }
}
`);
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
