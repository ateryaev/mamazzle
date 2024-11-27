package com.teryaev.mamazzle

import android.R
import android.app.Activity
import android.util.Log
import androidx.core.app.ActivityCompat.startActivityForResult
import com.google.android.gms.games.AuthenticationResult
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk
import com.google.android.gms.games.SnapshotsClient
import com.google.android.gms.games.snapshot.Snapshot
import com.google.android.gms.games.snapshot.SnapshotMetadataChange
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.TaskCompletionSource


class PlayGameHelper(val activity: Activity) {

    init {
        PlayGamesSdk.initialize(activity);
        //checkAuthenticated()

    }

    fun submitScore(leaderboard_id:String, score: Long) {
        try{
            PlayGames.getLeaderboardsClient(activity).submitScore(leaderboard_id, score)
        } catch (err:Exception) {
            Log.e(tagName, "SUBMIT SCORE ERROR $err")
        }
    }

    fun showLeaderboard(leaderboard_id:String) {
        PlayGames.getLeaderboardsClient(activity)
            .getLeaderboardIntent(leaderboard_id)
            .addOnSuccessListener { intent -> activity.startActivityForResult(intent, 0) }
    }

    fun checkAuthenticated():Task<Boolean> {
        //run it always onResume?
        val taskCompletionSource = TaskCompletionSource<Boolean>()
        val gamesSignInClient = PlayGames.getGamesSignInClient(activity)
        gamesSignInClient.isAuthenticated()
            .addOnCompleteListener { task: Task<AuthenticationResult> ->
                val isAuthenticated = (task.isSuccessful && task.result.isAuthenticated)
                Log.d(tagName, "AUTHENTICATED: $isAuthenticated");
                taskCompletionSource.setResult(isAuthenticated)
            }
        return taskCompletionSource.task;
    }

    fun signIn():Task<Boolean> {
        //force to show login UI
        val taskCompletionSource = TaskCompletionSource<Boolean>()
        val gamesSignInClient = PlayGames.getGamesSignInClient(activity)

        gamesSignInClient.signIn()
            .addOnCompleteListener { task: Task<AuthenticationResult> ->
                val isAuthenticated = (task.isSuccessful && task.result.isAuthenticated)
                Log.d(tagName, "SIGNIN: $isAuthenticated");
                taskCompletionSource.setResult(isAuthenticated)
            }
        return taskCompletionSource.task;
    }

    private fun getSnapshot():Task<Snapshot> {
        val taskCompletionSource = TaskCompletionSource<Snapshot>()

        checkAuthenticated().addOnCompleteListener{taskIsAuthed->
            if (!taskIsAuthed.result) {
                Log.d(tagName, "SNAPSHOT CANNOT BE LOADED");
                taskCompletionSource.setResult(null)
            } else {
                val snapshotsClient = PlayGames.getSnapshotsClient(activity)
                val conflictResolutionPolicy = SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED
                snapshotsClient.open("GameProgressData", true, conflictResolutionPolicy)
                    .addOnCompleteListener { task ->
                        try {
                            Log.d(tagName, "SNAPSHOT LOADED 1 ${task}");
                            Log.d(tagName, "SNAPSHOT LOADED 1 ${task.result}");
                            Log.d(tagName, "SNAPSHOT LOADED 1 ${task.result.data}");
                            taskCompletionSource.setResult(task.result.data)
                            Log.e(tagName, "SNAPSHOT LOADED 2");
                        } catch (err:Exception) {
                            Log.e(tagName, "SNAPSHOT LOADED ERROR $err")
                            taskCompletionSource.setResult(null)
                        }

                    }
            }
        }

        return taskCompletionSource.task;
    }

    fun loadGameData():Task<String?> {
        val taskCompletionSource = TaskCompletionSource<String>()
        getSnapshot().addOnCompleteListener{task->
            Log.e(tagName, "SNAPSHOT READING");
            val snapshot = task.result
            val data = snapshot?.snapshotContents?.readFully()?.toString(Charsets.UTF_8)// ?: ""
            Log.e(tagName, "SNAPSHOT READ: ($data)");
            taskCompletionSource.setResult(data)
        }
        return taskCompletionSource.task;
    }

    fun saveGameData(data:String?):Task<Boolean> {
        val taskCompletionSource = TaskCompletionSource<Boolean>()
        getSnapshot().addOnCompleteListener{task->
            val snapshot = task.result
            snapshot?.snapshotContents?.writeBytes((data?:"").toByteArray(Charsets.UTF_8))
            val snapshotsClient = PlayGames.getSnapshotsClient(activity)
            snapshotsClient.commitAndClose(snapshot, SnapshotMetadataChange.EMPTY_CHANGE);
            Log.e(tagName, "SNAPSHOT WRITE: ($data)");
            taskCompletionSource.setResult(snapshot != null)
        }
        return taskCompletionSource.task;
    }
}
