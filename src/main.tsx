import {Home, Play} from '@/pages';
import {store} from "@/stores";
import {updateSelfColor} from "@/stores/game";

import {configClient} from '@illuxiza/one-client'

import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import '@illuxiza/one-client-react/index.scss';

// const url = "localhost:8888";
const url = "game.congeer.com";
configClient("ws://" + url + "/game-tmp/ws", {
    maxPlayer: 2,
    baseConfig: [],
    debug: true,
    playerConfig: [[JSON.stringify(updateSelfColor(false))], [JSON.stringify(updateSelfColor(true))]],
    onConfig: store.dispatch,
    onFrame: store.dispatch
}, "gobang")

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(<Provider store={store}>
        <BrowserRouter basename="/gobang">
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/play/:mode" element={<Play/>}/>
                <Route path="/play/:mode/:roomId" element={<Play/>}/>
            </Routes>
        </BrowserRouter>
    </Provider>
);
