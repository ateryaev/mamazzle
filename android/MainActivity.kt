package com.teryaev.mamazzle

import android.content.Context
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

const val urlGame: String  = "https://mamazzle.web.app/"
const val urlError: String  = "file:///android_asset/offline.html"
const val nameNativeWrapper: String  = "NativeWrapper"
const val tagName: String  = "mamazzle"
const val colorGreen: String = "#229966"
const val colorLight: String = "#D1D5DB"

const val jsSetRewardIsAvailable: String = "javascript:window.adInterface.setRewardIsAvailable()"
const val jsSetAdLoadingError: String = "javascript:window.adInterface.setAdLoadingError()"
const val jsSetAdIsReady: String = "javascript:window.adInterface.setAdIsReady()"
const val adUnitId: String = "ca-app-pub-3940256099942544/5224354917" //test ad id, change to real for release

class MainActivity : ComponentActivity() {

    private inner class JavascriptInterface(val context: MainActivity)
    {

        @android.webkit.JavascriptInterface
        fun showAd()
        {
            Log.d(tagName, "WEB wants to show ad");
            context.showRewardedAd()
        }
        @android.webkit.JavascriptInterface
        fun loadAd()
        {
            Log.d(tagName, "WEB wants to load ad");
            context.loadRewardedAd()
        }

        @android.webkit.JavascriptInterface
        fun recolor(statusColor: String, navColor: String)
        {
            Log.d(tagName, "WEB wants to change colors " + statusColor + " " + navColor);
            window.statusBarColor = Color.parseColor(statusColor)
            window.navigationBarColor = Color.parseColor(navColor)
        }

        @android.webkit.JavascriptInterface
        fun vibrate() {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            val vibrationEffect4: VibrationEffect;
            Log.d(tagName, "WEB wants to vibrate 1");
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                Log.d(tagName, "WEB wants to vibrate 2");
                vibrationEffect4 = VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK);
                vibrator.cancel();
                vibrator.vibrate(vibrationEffect4)
            }
        }
    }

    private lateinit var webView: WebView
    private var rewardedAd: RewardedAd? = null

    // Function to determine if the device is a tablet
    private fun isTablet(): Boolean {
        val screenLayout = resources.configuration.screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK
        return screenLayout >= Configuration.SCREENLAYOUT_SIZE_LARGE
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Check if the device is a tablet
        if (isTablet()) {
            // Allow free orientation for tablets
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        } else {
            // Lock orientation for phones (portrait)
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }

        window.statusBarColor = Color.parseColor(colorGreen)
        window.navigationBarColor = Color.parseColor(colorLight)

        webView = WebView(this)
        webView.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.MATCH_PARENT
        )
        webView.settings.javaScriptEnabled = true
        //webView.settings.cacheMode=WebSettings.LOAD_CACHE_ELSE_NETWORK
        webView.settings.cacheMode=WebSettings.LOAD_DEFAULT
        //webView.settings.cacheMode=WebSettings.LOAD_NO_CACHE
        webView.settings.domStorageEnabled = true
        webView.settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(JavascriptInterface(this), nameNativeWrapper)

        // WebView to handle offline mode
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                Log.d(tagName, "Page is finished to load: " + url);
                webView.clearHistory()
            }

            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                view.loadUrl(url)
                return true
            }

            override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String) {
                view.loadUrl(urlError)
                Handler(Looper.getMainLooper()).postDelayed({
                    webView.loadUrl(urlGame)
                }, 1000)
            }
        }

        webView.loadUrl(urlGame)
        //webView.loadUrl("file:///android_asset/offline.html")

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

    private fun loadRewardedAd() {
        val adRequest = AdRequest.Builder().build()
        runOnUiThread {
            RewardedAd.load(
                this,
                adUnitId,
                adRequest,
                object : RewardedAdLoadCallback() {
                    override fun onAdLoaded(ad: RewardedAd) {
                        rewardedAd = ad
                        Log.d(tagName, "Ad is loaded");
                        webView.evaluateJavascript(jsSetAdIsReady,null)
                    }

                    override fun onAdFailedToLoad(adError: LoadAdError) {
                        rewardedAd = null
                        Log.d(tagName, "Ad failed to load: " + adError.toString());
                        webView.evaluateJavascript(jsSetAdLoadingError,null)
                    }
                })
        }
    }

    fun showRewardedAd() {
        runOnUiThread {
            rewardedAd?.show(this) { rewardItem ->
                Log.d(tagName, "Reward provided");
                webView.evaluateJavascript(jsSetRewardIsAvailable, null)
            }
        }
    }
}
