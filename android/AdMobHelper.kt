package com.teryaev.mamazzle

import android.app.Activity
import android.util.Log
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.TaskCompletionSource

class AdMobHelper(val activity: Activity) {

    private var rewardedAd: RewardedAd? = null

    fun loadRewardedAd(adId: String):Task<Boolean> {
        val taskCompletionSource = TaskCompletionSource<Boolean>()
        val adRequest = AdRequest.Builder().build()

        activity.runOnUiThread {
            RewardedAd.load(activity, adId, adRequest,
                object : RewardedAdLoadCallback() {
                    override fun onAdLoaded(ad: RewardedAd) {
                        rewardedAd = ad
                        Log.d(tagName, "AD IS LOADED");
                        taskCompletionSource.setResult(true)
                        //webView.evaluateJavascript(jsSetAdIsReady,null)
                    }

                    override fun onAdFailedToLoad(adError: LoadAdError) {
                        rewardedAd = null
                        Log.d(tagName, "AD CONNOT BE LOADED: " + adError.toString());
                        taskCompletionSource.setResult(false)
                    }
                })
        }

        return taskCompletionSource.task
    }

    fun showRewardedAd():Task<Boolean> {
        val taskCompletionSource = TaskCompletionSource<Boolean>()

        activity.runOnUiThread {
            rewardedAd?.show(activity) { rewardItem ->
                Log.d(tagName, "REWARD PROVIDED");
                taskCompletionSource.setResult(true)
            } ?: taskCompletionSource.setResult(false)
        }

        return taskCompletionSource.task
    }
}
