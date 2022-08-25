// 默认棋盘
// 每四个表示一行，每个数字表示一个棋子，0表示空位
// 大于0表示白棋，小于0表示黑棋

const basic = Math.min(window.innerWidth, window.innerHeight, 640) - 20;

export const boardSize = {
    board: basic,
    boardEdge: basic * 0.045,
    boardGrid: basic * 0.065,
    pieceRadius: basic * 0.026
}

export const boardScale = (scale = 1) => {
    return {
        board: boardSize.board * scale,
        boardGrid: boardSize.boardGrid * scale,
        boardEdge: boardSize.boardEdge * scale,
        pieceRadius: boardSize.pieceRadius * scale
    }

}

export type BoardSizeType = typeof boardSize

export const getIndexByBoard = (data: number) => {
    return Math.min(14, Math.max(0, Math.round((data - boardSize.boardEdge) / boardSize.boardGrid)));
}
