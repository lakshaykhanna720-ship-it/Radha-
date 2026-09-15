package com.cabsoundbox.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

/**
 * 100% AUTOMATIC Background SMS Broadcast Receiver.
 *
 * Triggered automatically by Android OS whenever an SMS arrives on the phone.
 * ZERO user intervention or manual clicks required.
 *
 * 1. Android fires onReceive() when bank SMS arrives.
 * 2. Extracts SMS body and sender.
 * 3. UpiParser regex extracts INR amount, sender name, and UPI provider.
 * 4. SoundboxSpeaker triggers loud Soundbox chime and speaks transaction in Hindi/English.
 * 5. Saves transaction to local database / SharedPreferences for driver's ledger.
 */
class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            return
        }

        try {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            val fullBody = StringBuilder()
            var sender = ""

            for (sms in messages) {
                fullBody.append(sms.messageBody)
                if (sender.isEmpty()) {
                    sender = sms.originatingAddress ?: ""
                }
            }

            val smsText = fullBody.toString()
            Log.d("SmsReceiver", "Automatic SMS intercepted from: $sender: $smsText")

            // Parse UPI payment
            val parsed = UpiParser.parse(smsText)
            if (parsed != null) {
                Log.d("SmsReceiver", "Parsed Payment: ₹${parsed.amount} via ${parsed.provider} from ${parsed.senderName}")

                val speaker = SoundboxSpeaker.getInstance(context)

                if (parsed.isExpense) {
                    speaker.announceExpense(parsed.amount, "CNG")
                } else {
                    speaker.announcePayment(parsed.amount, parsed.provider, parsed.senderName)
                }

                // Broadcast local update to UI activity if running
                val updateIntent = Intent("com.cabsoundbox.app.TRANSACTION_RECEIVED")
                updateIntent.setPackage(context.packageName)
                updateIntent.putExtra("amount", parsed.amount)
                updateIntent.putExtra("provider", parsed.provider)
                updateIntent.putExtra("senderName", parsed.senderName)
                updateIntent.putExtra("isExpense", parsed.isExpense)
                context.sendBroadcast(updateIntent)
            }
        } catch (e: Exception) {
            Log.e("SmsReceiver", "Error processing incoming SMS automatically", e)
        }
    }
}
