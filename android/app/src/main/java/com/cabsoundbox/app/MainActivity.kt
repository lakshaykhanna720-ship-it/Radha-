package com.cabsoundbox.app

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val SMS_PERMISSION_REQUEST = 101

    private val localReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val amount = intent?.getDoubleExtra("amount", 0.0) ?: 0.0
            val provider = intent?.getStringExtra("provider") ?: "UPI"
            val sender = intent?.getStringExtra("senderName") ?: ""
            // Send event to WebView dashboard
            webView.evaluateJavascript(
                "window.onNativePaymentReceived && window.onNativePaymentReceived($amount, '$provider', '$sender');",
                null
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        setupWebView()

        // Check and ask for SMS and Notification permissions
        checkAndRequestPermissions()

        // Prompt Notification Listener permission if not enabled
        if (!isNotificationServiceEnabled()) {
            Toast.makeText(this, "Please enable Notification Access for automatic UPI audio announcements", Toast.LENGTH_LONG).show()
        }

        val filter = IntentFilter("com.cabsoundbox.app.TRANSACTION_RECEIVED")
        ContextCompat.registerReceiver(
            this,
            localReceiver,
            filter,
            ContextCompat.RECEIVER_EXPORTED
        )
    }

    private fun setupWebView() {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        webView.settings.cacheMode = WebSettings.LOAD_DEFAULT
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // Loads local assets or hosted web soundbox interface
        webView.loadUrl("https://ais-pre-dszwdtmhfectuelzknbh2l-471078409840.asia-southeast1.run.app")
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), SMS_PERMISSION_REQUEST)
        }
    }

    private fun isNotificationServiceEnabled(): Boolean {
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return flat?.contains(packageName) == true
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(localReceiver)
        } catch (e: Exception) {
            // Ignored
        }
    }
}
