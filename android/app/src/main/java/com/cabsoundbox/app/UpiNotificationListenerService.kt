package com.cabsoundbox.app

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * 100% AUTOMATIC Background UPI Notification Listener Service.
 *
 * Listens 24/7 for push notifications from Paytm, PhonePe, Google Pay, BharatPe, BHIM,
 * and Bank apps on Android.
 *
 * When a customer scans the cab QR and pays, this service automatically extracts
 * the notification text and announces the soundbox audio without the driver touching the phone.
 */
class UpiNotificationListenerService : NotificationListenerService() {

    private val supportedPackages = setOf(
        "net.one97.paytm",                                 // Paytm & Paytm Business
        "com.phonepe.app",                                // PhonePe
        "com.phonepe.app.business",                       // PhonePe Business
        "com.google.android.apps.nbu.paisa.user",         // Google Pay
        "com.google.android.apps.nbu.paisa.merchant",     // Google Pay for Business
        "com.bharatpe.app",                               // BharatPe
        "in.org.npci.upiapp",                             // BHIM UPI
        "com.freecharge.android",                         // Freecharge
        "com.whatsapp"                                    // WhatsApp Pay notifications
    )

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return

        val pkg = sbn.packageName
        if (!supportedPackages.contains(pkg)) {
            return
        }

        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""

        val combinedMessage = "$title $text $bigText"
        Log.d("UpiNotificationListener", "Detected push from $pkg: $combinedMessage")

        val parsed = UpiParser.parse(combinedMessage)
        if (parsed != null) {
            val provider = when {
                pkg.contains("paytm") -> "paytm"
                pkg.contains("phonepe") -> "phonepe"
                pkg.contains("paisa") -> "google_pay"
                pkg.contains("bharatpe") -> "bharatpe"
                else -> parsed.provider
            }

            val speaker = SoundboxSpeaker.getInstance(applicationContext)
            if (parsed.isExpense) {
                speaker.announceExpense(parsed.amount, "CNG")
            } else {
                speaker.announcePayment(parsed.amount, provider, parsed.senderName)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // No-op
    }
}
