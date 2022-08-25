import {store} from '@/stores'
import {updateSelfColor} from "@/stores/game";
import {updateIndex, updateOnline, updateOwner, updatePlayer} from "@/stores/online";
import {nanoid} from "@reduxjs/toolkit";
import {CACHE_PLAYER_KEY, CACHE_ROOM_KEY, CacheUtils} from "./cache";

const go = store.dispatch;
// const url = 'ws://10.21.103.127:8888/game/ws';
const url = 'ws://game.congeer.com/game/ws';

const onMessage = (e: MessageEvent) => {
    e.data.text().then((str: string) => JSON.parse(str)).then((data: any) => {
        console.log(data)
        switch (data.type) {
            case 'isOwner':
                go(updatePlayer(true))
                go(updateOwner(true))
                go(updateIndex(0))
                SocketUtils.sendConfig()
                break;
            case 'isPlayer':
                go(updatePlayer(true))
                go(updateOwner(false))
                go(updateIndex(data.index))
                if (data.players > 1) {
                    go(updateOnline(true))
                }
                break;
            case 'isAudience':
                go(updatePlayer(false))
                go(updateOwner(false))
                go(updateIndex(-1))
                break;
            case 'syncAction':
                go(JSON.parse(data.data))
                break;
            case 'joinPlayer':
                go(updateOnline(true))
                break;
            case 'leavePlayer':
                go(updateOnline(false))
                break;
        }
    })
};

const onClose = (e: CloseEvent) => {
    clearInterval(SocketUtils.timer)
}

const blobData = (data: any) => {
    return new Blob([JSON.stringify(data)])
}

export class SocketUtils {
    static sock: WebSocket;
    static roomId: string;
    static playerId: string;
    static timer: NodeJS.Timer;

    static {
        SocketUtils.roomId = nanoid();
        // SocketUtils.roomId = CacheUtils.getItem(CACHE_ROOM_KEY, nanoid());
        CacheUtils.setItem(CACHE_ROOM_KEY, SocketUtils.roomId, 1000 * 60 * 60 * 24)
        SocketUtils.playerId = CacheUtils.getItem(CACHE_PLAYER_KEY, nanoid());
        CacheUtils.setItem(CACHE_PLAYER_KEY, SocketUtils.playerId)
    }

    static addRoom = (roomId: string) => {
        SocketUtils.sock = new WebSocket(url);

        SocketUtils.sock.onopen = () => {
            SocketUtils.send("addRoom", {roomId, playerId: SocketUtils.playerId})
            SocketUtils.timer = setInterval(() => {
                SocketUtils.send("health", {roomId, playerId: SocketUtils.playerId})
            }, 5000);
        };

        SocketUtils.sock.onmessage = onMessage;

        SocketUtils.sock.onclose = onClose;
    }

    static levelRoom = () => {
        SocketUtils.sock && SocketUtils.sock.close()
        SocketUtils.roomId = nanoid();
        clearInterval(SocketUtils.timer)
    }

    static sendConfig = () => {
        const game = store.getState().game;
        const online = store.getState().online;
        const color = online.playerIndex === 0 ? game.selfIsWhite : !game.selfIsWhite;
        SocketUtils.send("configRoom", {
            maxPlayer: 2,
            playerConfig: [
                [updateSelfColor(color)],
                [updateSelfColor(!color)]
            ],
            baseConfig: []
        })
    }

    static send = (type: string, data: any) => {
        SocketUtils.sock.send(blobData({type, data: JSON.stringify(data)}))
    }

}