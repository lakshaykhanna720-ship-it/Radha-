package com.cabsoundbox.app

import java.util.regex.Pattern

data class ParsedPayment(
    val amount: Double,
    val provider: String,
    val senderName: String?,
    val refNumber: String?,
    val rawText: String,
    val isExpense: Boolean = false
)

object UpiParser {

    private val amountPatterns = listOf(
        Pattern.compile("(?:inr|rs\\.?|₹)\\s*([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("([0-9]+(?:\\.[0-9]{1,2})?)\\s*(?:rs|rupees|inr)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:credited|received|paid)\\s*(?:by|for)?\\s*(?:inr|rs\\.?|₹)?\\s*([0-9]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE)
    )

    private val senderPatterns = listOf(
        Pattern.compile("from\\s+([A-Za-z\\s]+?)(?:\\s+on|\\s+via|\\s+ref|\\s+upi|\\s+\\.|\\(|$)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("by\\s+([A-Za-z\\s]+?)(?:\\s+on|\\s+via|\\s+ref|\\s+upi|/|\\s+\\.|$)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("customer\\s+([A-Za-z\\s]+?)(?:\\s+paid|\\s+transferred|\\s+\\.|$)", Pattern.CASE_INSENSITIVE)
    )

    private val refPatterns = listOf(
        Pattern.compile("(?:upi\\s*ref(?:erence)?(?:\\s*no)?\\.?|utr(?:\\s*no)?\\.?|txn\\s*id|ref\\s*no\\.?)\\s*[:\\s#]?\\s*([A-Za-z0-9]{8,18})", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(?:via\\s*upi|upi)[/:\\s]+([0-9]{10,14})", Pattern.CASE_INSENSITIVE)
    )

    fun parse(text: String): ParsedPayment? {
        val lower = text.lowercase()

        // Filter out debits/expenses or detect CNG
        val isDebit = (lower.contains("debited") || lower.contains("spent") || lower.contains("sent")) && !lower.contains("credited")
        val isCngExpense = lower.contains("cng") || lower.contains("petrol") || lower.contains("diesel") || lower.contains("fuel")

        // If it's a regular bank debit (not CNG expense), ignore it so we don't treat driver personal debits as passenger earnings
        if (isDebit && !isCngExpense) {
            return null
        }

        // 1. Extract Amount
        var detectedAmount: Double? = null
        for (pattern in amountPatterns) {
            val matcher = pattern.matcher(text)
            if (matcher.find()) {
                val numStr = matcher.group(1)?.replace(",", "")
                val amt = numStr?.toDoubleOrNull()
                if (amt != null && amt > 0) {
                    detectedAmount = amt
                    break
                }
            }
        }

        if (detectedAmount == null || detectedAmount <= 0) {
            return null
        }

        // 2. Identify Provider
        val provider = when {
            lower.contains("paytm") -> "paytm"
            lower.contains("phonepe") -> "phonepe"
            lower.contains("gpay") || lower.contains("google pay") -> "google_pay"
            lower.contains("bharatpe") -> "bharatpe"
            lower.contains("bhim") -> "bhim"
            lower.contains("sbi") -> "sbi"
            lower.contains("hdfc") -> "hdfc"
            lower.contains("icici") -> "icici"
            lower.contains("axis") -> "axis"
            else -> "upi"
        }

        // 3. Extract Sender Name
        var senderName: String? = null
        for (pattern in senderPatterns) {
            val matcher = pattern.matcher(text)
            if (matcher.find()) {
                val name = matcher.group(1)?.trim()
                if (name != null && name.length in 3..30 && !name.matches(Regex("(?i)^(upi|bank|ac|account|your|card|user)$"))) {
                    senderName = name
                    break
                }
            }
        }

        // 4. Extract Reference/UTR
        var refNumber: String? = null
        for (pattern in refPatterns) {
            val matcher = pattern.matcher(text)
            if (matcher.find()) {
                refNumber = matcher.group(1)?.trim()
                break
            }
        }

        return ParsedPayment(
            amount = detectedAmount,
            provider = provider,
            senderName = senderName,
            refNumber = refNumber,
            rawText = text,
            isExpense = isCngExpense
        )
    }
}
