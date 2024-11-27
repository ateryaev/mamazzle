package com.teryaev.mamazzle

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import android.webkit.WebView

const val jsSetRewardIsAvailable: String = "javascript:window.adInterface.setRewardIsAvailable()"
const val jsSetAdLoadingError: String = "javascript:window.adInterface.setAdLoadingError()"
const val jsSetAdIsReady: String = "javascript:window.adInterface.setAdIsReady()"
const val adUnitId: String = "ca-app-pub-3940256099942544/5224354917" //test ad id, change to real for production

fun executeInWebview(webView: WebView, callback:String, param: String) {
    Log.d(tagName, "WEB EXEC: javascript:$callback($param)")
    //webView.evaluateJavascript("javascript:console.log($param)",null)
    webView.evaluateJavascript("javascript:$callback($param)",null)
}

class JavascriptInterface(val context: Activity,
                          val webView: WebView,
                          val playGameHelper: PlayGameHelper,
                          val adMobHelper: AdMobHelper) {

    @android.webkit.JavascriptInterface
    fun signInPlayGames(callback:String)
    {
        Log.d(tagName, "WEB WANTS TO CHECK SIGNIN PLAYGAMES")
        playGameHelper.signIn().addOnCompleteListener { task->
            executeInWebview(webView, callback, "${task.result}")
        }
    }

    @android.webkit.JavascriptInterface
    fun checkAuthenticatedPlayGames(callback:String)
    {
        Log.d(tagName, "WEB WANTS TO CHECK PLAYGAMES AUTHENTICATION")
        playGameHelper.checkAuthenticated().addOnCompleteListener { task->
            executeInWebview(webView, callback, "${task.result}")
        }
    }

    @android.webkit.JavascriptInterface
    fun loadGameData(callback:String)
    {
        Log.d(tagName, "WEB WANTS TO LOAD GAME DATA")
        playGameHelper.loadGameData().addOnCompleteListener { task->
            val data = task.result
            if (data == null)  executeInWebview(webView, callback, "null")
            else executeInWebview(webView, callback, "'${data.replace("'", "\\'")}'")
        }
    }

    @android.webkit.JavascriptInterface
    fun saveGameData(data:String, callback:String)
    {
        Log.d(tagName, "WEB WANTS TO SAVE GAME DATA")
        playGameHelper.saveGameData(data).addOnCompleteListener { task->
            Log.d(tagName, "SAVE RESULT = ${task.result}")
            executeInWebview(webView, callback, "${task.result}")
        }
    }

    @android.webkit.JavascriptInterface
    fun submitScore(leaderboard:String, score:Long)
    {
        playGameHelper.submitScore(leaderboard, score)
    }
    @android.webkit.JavascriptInterface
    fun showLeaderboard(leaderboard:String)
    {
        playGameHelper.showLeaderboard(leaderboard)
    }

    @android.webkit.JavascriptInterface
    fun loadAd()
    {
        Log.d(tagName, "WEB wants to load real ad")
        loadAd(adUnitId)
    }

    @android.webkit.JavascriptInterface
    fun loadAd(adId: String)
    {
        Log.d(tagName, "WEB wants to load ad $adUnitId")
        adMobHelper.loadRewardedAd(adId).addOnCompleteListener{task->
            val cmd = if (task.result) jsSetAdIsReady else jsSetAdLoadingError
            webView.evaluateJavascript(cmd, null)
        }
    }

    @android.webkit.JavascriptInterface
    fun showAd()
    {
        Log.d(tagName, "WEB wants to show ad");
        adMobHelper.showRewardedAd().addOnCompleteListener{task->
            if (task.result) {
                webView.evaluateJavascript(jsSetRewardIsAvailable, null)
            }
        }
    }

    @android.webkit.JavascriptInterface
    fun recolor(statusColor: String, navColor: String)
    {
        Log.d(tagName, "WEB wants to change colors $statusColor $navColor")
        context.window.statusBarColor = Color.parseColor(statusColor)
        context.window.navigationBarColor = Color.parseColor(navColor)
    }

    @android.webkit.JavascriptInterface
    fun vibrate() {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        val vibrationEffect4: VibrationEffect;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            vibrationEffect4 = VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK);
            vibrator.cancel();
            vibrator.vibrate(vibrationEffect4)
        }
    }
}
