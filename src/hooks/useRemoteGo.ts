import {SocketUtils} from "@/utils";
import {AnyAction} from "@reduxjs/toolkit";

import {useGo} from "./index";

export const useRemoteGo = (mode?: string) => {
    const go = useGo();
    return (action: AnyAction) => {
        go(action)
        if (mode && mode === 'remote') {
            SocketUtils.send('syncAction', action);
        }
    };
}
