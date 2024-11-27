package com.teryaev.mamazzle

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient

class MamaWebViewClient(val context: Activity, val webView: WebView):WebViewClient() {
    override fun onPageFinished(view: WebView, url: String) {
        super.onPageFinished(view, url)

        Log.d(tagName, "Page is finished to load: " + url);
        webView.clearHistory()
    }

    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
        val isExternal = url.startsWith("http://") || url.startsWith("https://")
        return if (url != null && isExternal) {
            // Open the URL in the external browser
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
            true // Indicate that we've handled the URL
        } else {
            false // Allow WebView to handle the URL
        }
    }

    override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String) {
        view.loadUrl(urlError)
        Handler(Looper.getMainLooper()).postDelayed({
            webView.loadUrl(urlGame)
        }, 1000)
    }
}
