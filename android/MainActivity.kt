package com.teryaev.mamazzle
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback


const val urlGame: String  = "https://mamazzle.web.app/"
const val urlError: String  = "file:///android_asset/offline.html"
const val nameNativeWrapper: String  = "NativeWrapper"
const val tagName: String  = "mamazzleKt"
const val colorGreen: String = "#229966"
const val colorLight: String = "#D1D5DB"


class MainActivity : ComponentActivity() {

    val playGameHelper: PlayGameHelper = PlayGameHelper(this)
    val adMobHelper: AdMobHelper = AdMobHelper(this)

    private fun orientationSetup() {
        val screenLayout = resources.configuration.screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK
        val isTablet = screenLayout >= Configuration.SCREENLAYOUT_SIZE_LARGE
        requestedOrientation = if (isTablet) ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED else
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        orientationSetup()

        window.statusBarColor = Color.parseColor(colorGreen)
        window.navigationBarColor = Color.parseColor(colorLight)

        val webView = WebView(this)
        webView.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.MATCH_PARENT
        )
        webView.settings.javaScriptEnabled = true
        //webView.settings.cacheMode=WebSettings.LOAD_DEFAULT
        webView.settings.cacheMode=WebSettings.LOAD_NO_CACHE
        webView.settings.domStorageEnabled = true
        webView.settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.settings.textZoom = 100
        webView.addJavascriptInterface(JavascriptInterface(this, webView, playGameHelper, adMobHelper), nameNativeWrapper)

        // WebView to handle offline mode
        webView.webViewClient = MamaWebViewClient(this, webView)

        webView.loadUrl(urlGame)

        val layout = LinearLayout(this)
        layout.addView(webView)
        setContentView(layout)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    moveTaskToBack(true)
                }
            }
        })
    }
}
