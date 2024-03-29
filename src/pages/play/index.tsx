import black from '@/assets/black.png';
import white from '@/assets/white.png';
import {Footer, Game, Header, Nav} from '@/components'
import {boardSize} from "@/config/board";
import modes from '@/config/modes'
import {useGo, usePieces, useRemoteGo, useStore} from "@/hooks";
import {changeSelfColor, GridData, handleRestart, handleSelectGrid, updateSelfColor} from "@/stores/game";
import {addRoom, configRoom, leaveRoom, resetRoom,} from '@illuxiza/one-client';
import {redo, undo, useOnline} from "@illuxiza/one-client-react";
import React, {useState} from 'react';
import {useParams} from "react-router-dom";
import {useMount, useUpdateEffect} from "react-use";

import './index.scss'

import StepRecord from "./record";
import RuleSetting from "./setting";


const Play = () => {
    const game = useStore(state => state.game);
    const [pause, setPause] = useState(false);
    const online = useOnline();
    const pieces = usePieces(game.board);
    const go = useGo();
    const params = useParams();
    const mode = params.mode as (keyof typeof modes) || 'ai';
    const remoteGo = useRemoteGo(mode);
    const cfg = modes[mode];
    const [open, setOpen] = useState(false);
    const [showRule, setShowRule] = useState(false);


    const sameColor = game.selfIsWhite === game.stepIsWhite;


    useMount(() => {
        go(handleRestart())
        if (mode === 'local' && game.selfIsWhite) {
            go(changeSelfColor())
        }
        if (mode === 'remote') {
            const roomParam = params.roomId!;
            addRoom(roomParam)
        }
    })

    useUpdateEffect(() => {
        if (!pause && mode === 'ai' && !sameColor && !game.gameIsEnd) {
            // 延时执行，避免操作太快看不清
            // setTimeout(() => {
            // const nextStep = GameUtils.aiNextStep(
            //     [...gameStore.board],
            //     gameStore.stepIsWhite,
            //     !gameStore.selfIsWhite,
            //     gameStore.rule
            // );
            // if (nextStep) {
            //     // go(handlePiecePut(nextStep));
            // }
            // }, 500);
        }
    })

    const opStep = mode === 'local' || !sameColor || pause ? 1 : 2;

    const onBack = () => {
        if (mode === 'remote') {
            leaveRoom()
        }
    };

    const handleGrid = (data: GridData) => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        if (game.gameIsEnd) {
            return
        }
        if (pause) {
            return;
        }
        if (mode !== 'local' && !sameColor) {
            return;
        }
        remoteGo(handleSelectGrid(data))
    }
    let endBecause = '';
    if (game.gameIsEnd) {
        endBecause = `${game.stepIsWhite ? '白' : '黑'}方胜利`;
    }


    let changeColor = () => {
        if (mode === "remote" && online.isPlayer) {
            const index = online?.myIndex;
            const playerConfig = [[updateSelfColor(game.selfIsWhite)], [updateSelfColor(!game.selfIsWhite)]];
            playerConfig[index] = [updateSelfColor(!game.selfIsWhite)]
            playerConfig[1 - index] = [updateSelfColor(game.selfIsWhite)]
            configRoom({playerConfig})
        } else if (mode === "ai") {
            go(changeSelfColor());
        }
    }
    const restartGame = () => {
        if (game.gameIsEnd) {
            changeColor();
        }
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        remoteGo(handleRestart());
        if (mode === "remote") {
            resetRoom()
        }
    }
    const pauseGame = () => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        setPause(!pause);
    }
    const undoGame = () => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        remoteGo(undo(opStep));
    }
    const redoGame = () => {
        if (mode === "remote" && !online.isPlayer) {
            return;
        }
        remoteGo(redo(opStep));
    }
    return (
        <div className="main" style={{width: `${boardSize.board}px`}}>
            <Nav title={cfg.title} onBack={onBack}/>
            <Header mode={mode} selfIsWhite={game.selfIsWhite} otherSideOnline={online.playerCount === 2}
                    channelId={params.roomId ? params.roomId!.substring(0, 4) : ''}/>
            <div className="board">
                <div className="board-header">
                    <div>
                        <button style={{marginRight: '10px'}} onClick={restartGame}
                                disabled={!game.gameIsEnd || !online.isPlayer}>重开
                        </button>
                    </div>
                    {!game.gameIsEnd ?
                        <div className="color-piece">
                            <img alt="" className="piece-img"
                                 src={game.stepIsWhite ? white : black}
                            />
                            <span>轮到{mode === 'local' ? game.stepIsWhite ? '白' : '黑' :
                                sameColor ? '己' : '对'}方走棋</span>
                        </div> : <></>}
                </div>
                <div className="board-body"
                     style={{height: `${boardSize.board}px`}}>
                    <Game
                        selectGrid={game.selectGrid}
                        selfIsWhite={game.stepIsWhite}
                        boardSize={boardSize}
                        pieces={pieces}
                        gameIsEnd={game.gameIsEnd}
                        onGridSelect={handleGrid}
                    />
                </div>
            </div>
            <Footer mode={mode} selfIsWhite={game.selfIsWhite} isViewer={!online.isPlayer}>
                {game.steps === 0 ?
                    mode === "local" ? <></> :
                        <button onClick={changeColor}>
                            换手
                        </button> :
                    <>
                        <button onClick={undoGame} disabled={game.gameIsEnd || !online.isPlayer}>悔棋
                        </button>
                        <button onClick={redoGame} disabled={game.gameIsEnd || !online.isPlayer}>重走
                        </button>
                        <button onClick={() => setOpen(true)}>
                            记录
                        </button>
                    </>
                }
            </Footer>
            <div className="board-footer">
                <div>{endBecause}</div>
            </div>
            <StepRecord open={open} mode={mode} onClose={() => setOpen(false)}/>
            <RuleSetting open={showRule} onClose={() => setShowRule(false)}/>
        </div>
    );
}

export default Play;
