import { createContext, useContext, useEffect, useState } from "react";
import { calculateScore, syncWithCloud } from "../utils/GameData";


const playGamesContext = createContext();

export function usePlayGames() {
    return useContext(playGamesContext);
}
export const PLAYGAMES_STATE = {
    DISABLED: 0,
    DISCONNECTED: 1,
    CONNECTING: 2,
    CONNECTED: 3
}

const LEADERBOARD_ID = "CgkI7pC-prceEAIQAQ";

export function PlayGamesContextProvider({ children }) {
    const [state, setState] = useState(PLAYGAMES_STATE.DISABLED);
    const [score, setScore] = useState(0);

    const RunNative = window.RunNative;

    function submitScore(score) {
        if (!RunNative("submitScore", LEADERBOARD_ID, parseInt(score))) {
            console.log("submitScore: NO NATIVE WRAPPER")
        }
    }

    function showLeaderboard() {
        if (!RunNative("showLeaderboard", LEADERBOARD_ID)) {
            console.log("showLeaderboard: NO NATIVE WRAPPER")
        }

    }

    function signIn() {
        if (state !== PLAYGAMES_STATE.DISCONNECTED) return;
        setState(PLAYGAMES_STATE.CONNECTING);
        console.log("SIGN IN TO PLAYGAMES")
        window.playGamesCallbacks.signInCallback = (isAuth) => {
            console.log("SIGN IN TO PLAYGAMES CALLBACK: " + isAuth)
            window.playGamesCallbacks.signInCallback = null;
            setState(isAuth ? PLAYGAMES_STATE.CONNECTED : PLAYGAMES_STATE.DISCONNECTED);
        }

        if (!RunNative("signInPlayGames", "window.playGamesCallbacks.signInCallback")) {
            setState(PLAYGAMES_STATE.DISABLED);
            window.playGamesCallbacks.signInCallback = null;
            console.log("SIGN IN TO PLAYGAMES CANNOT RUN")
        }
    }

    function checkConnection() {
        setState(PLAYGAMES_STATE.CONNECTING);
        console.log("Checking connection to PlayGames")
        window.playGamesCallbacks.checkAuthCallback = (isAuth) => {
            window.playGamesCallbacks.checkAuthCallback = null;
            setState(isAuth ? PLAYGAMES_STATE.CONNECTED : PLAYGAMES_STATE.DISCONNECTED);
            console.log("Checked connection to PlayGames: " + isAuth)
        }

        if (!RunNative("checkAuthenticatedPlayGames", "window.playGamesCallbacks.checkAuthCallback")) {
            setState(PLAYGAMES_STATE.DISABLED);
            window.playGamesCallbacks.checkAuthCallback = null;
            console.log("Checked connection to PlayGames: NO NATIVE WRAPPER")

        }
    }

    function save(data, callback) {
        if (!callback) callback = () => { };
        if (state !== PLAYGAMES_STATE.CONNECTED) {
            callback(false);
            return false;
        }
        window.playGamesCallbacks.save = (isOk) => {
            window.playGamesCallbacks.save = null;
            console.log("Save to PlayGames: " + isOk);
            callback(isOk);
        }
        if (!RunNative("saveGameData", data, "window.playGamesCallbacks.save")) {
            callback(false)
            window.playGamesCallbacks.save = null;
            console.log("Save to PlayGames: NO NATIVE WRAPPER")
            return false;
        }
        return true;
    }

    function load(callback) {
        if (state !== PLAYGAMES_STATE.CONNECTED) {
            callback(null);
            return false;
        }
        window.playGamesCallbacks.load = (data) => {
            window.playGamesCallbacks.load = null;
            console.log("Load from PlayGames: " + data);
            callback(data);
        }

        if (!RunNative("loadGameData", "window.playGamesCallbacks.load")) {
            callback(null)
            window.playGamesCallbacks.load = null;
            console.log("Load from PlayGames: NO NATIVE WRAPPER")
            return false;
        }
        return true;
    }

    function syncWithPlayGames() {
        if (state !== PLAYGAMES_STATE.CONNECTED) return;

        load((cloudString) => {
            let cloudData = null;

            try { cloudData = JSON.parse(cloudString); } catch (e) { }

            const newData = syncWithCloud(cloudData);
            const scoreAfter = calculateScore();
            submitScore(scoreAfter);
            setScore(scoreAfter);

            console.log("NEW DATA TO SAVE TO CLOUD:", JSON.stringify(newData));
            save(JSON.stringify(newData), (res) => {
                console.log("DATA SAVED TO CLOUD:", res);
            });
        })
    }

    useEffect(() => {
        window.playGamesCallbacks = {}
        checkConnection();
    }, []);

    useEffect(() => {
        syncWithPlayGames()
    }, [state]);

    return (
        <playGamesContext.Provider value={{ state, signIn, score, showLeaderboard, syncWithPlayGames }}>
            {children}
        </playGamesContext.Provider>
    );
}