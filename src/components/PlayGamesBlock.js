import { calculateScore } from "../utils/GameData";
import { IconGoogle, IconLoader } from "./Icons";
import { PLAYGAMES_STATE, usePlayGames } from "./PlayGamesContext";
import { Block, Button } from "./Ui";

export function PlayGamesBlock() {
    const { showLeaderboard, state, signIn } = usePlayGames();

    const points = calculateScore();
    if (state === PLAYGAMES_STATE.DISABLED) return;
    return (

        <Block>
            {state === PLAYGAMES_STATE.CONNECTED && <Button onClick={showLeaderboard} special={true}>
                <div className="uppercase flex-1 text-center -my-2">
                    <div className="text-xs -my-1 flex justify-center">
                        <IconGoogle />
                    </div>
                    SHOW LEADERBOARD
                    <div className="text-xs -my-1">
                        &nbsp;
                        <span className="lowercase opacity-60">{points} points collected</span>
                        &nbsp;
                    </div>
                </div>
            </Button>}

            {state === PLAYGAMES_STATE.DISCONNECTED && <Button onClick={signIn} special={true}>

                <div className="uppercase flex-1 text-center -my-2">
                    <div className="text-xs -my-1 flex justify-center">
                        <IconGoogle />
                    </div>
                    <div className="flex justify-center items-center gap-1">
                        SIGN IN TO
                        PLAY GAMES
                    </div>
                    <div className="text-xs -my-1">
                        &nbsp;
                        <span className="lowercase opacity-60">unlock cloud saves and leaderboard</span>
                        &nbsp;
                    </div>
                </div>

            </Button>}

            {state === PLAYGAMES_STATE.CONNECTING && <Button disabled special={true}>

                <div className="uppercase flex-1 text-center -my-2">
                    <div className="text-xs -my-1 flex justify-center animate-spin">
                        <IconLoader />
                    </div>
                    <div className="flex justify-center items-center gap-1">
                        SIGN IN TO
                        PLAY GAMES
                    </div>
                    <div className="text-xs -my-1">
                        &nbsp;
                        <span className="lowercase opacity-60">connecting</span>
                        &nbsp;
                    </div>
                </div>

            </Button>}

        </Block>
    );
}