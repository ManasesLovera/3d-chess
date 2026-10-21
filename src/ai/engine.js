(function (WC) {
    'use strict';

    const PIECE_BASE_VALUES = {
        p: 100,
        n: 320,
        b: 335,
        r: 500,
        q: 900,
        k: 20000
    };

    // Piece-Square Tables (from White's perspective, rank 8 at row 0 down to rank 1 at row 7; mirrored for Black)
    const PST_WHITE = {
        p: [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [ 50, 50, 50, 50, 50, 50, 50, 50],
            [ 10, 10, 20, 30, 30, 20, 10, 10],
            [  5,  5, 10, 25, 25, 10,  5,  5],
            [  0,  0,  0, 20, 20,  0,  0,  0],
            [  5, -5,-10,  0,  0,-10, -5,  5],
            [  5, 10, 10,-20,-20, 10, 10,  5],
            [  0,  0,  0,  0,  0,  0,  0,  0]
        ],
        n: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ],
        b: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ],
        r: [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [  5, 10, 10, 10, 10, 10, 10,  5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [  0,  0,  0,  5,  5,  0,  0,  0]
        ],
        q: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ],
        k_mid: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ],
        k_end: [
            [-50,-40,-30,-20,-20,-30,-40,-50],
            [-30,-20,-10,  0,  0,-10,-20,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-30,  0,  0,  0,  0,-30,-30],
            [-50,-30,-30,-30,-30,-30,-30,-50]
        ]
    };

    // Pure-state virtual simulator helper functions (zero 3D scene mutation during search)
    function cloneState(engine) {
        return new Chess(engine.fen());
    }

    function applyVirtualMove(simEngine, move) {
        return simEngine.move(move);
    }

    // Static board evaluation from Black's perspective (positive = favorable for Black AI)
    function evaluateBoard(simEngine, usePST = true, includeKingSafety = false) {
        if (simEngine.in_checkmate()) {
            return simEngine.turn() === 'b' ? -99999 : 99999;
        }
        if (simEngine.in_draw() || simEngine.in_stalemate() || simEngine.in_threefold_repetition()) {
            return 0;
        }

        const board = simEngine.board();
        let score = 0;
        let nonPawnMaterial = 0;

        // First pass: count non-pawn material to detect endgame phase
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const p = board[r][f];
                if (p && p.type !== 'p' && p.type !== 'k') {
                    nonPawnMaterial += PIECE_BASE_VALUES[p.type];
                }
            }
        }
        const isEndgame = nonPawnMaterial <= 2600;

        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const p = board[r][f];
                if (!p) continue;

                const baseVal = PIECE_BASE_VALUES[p.type];
                let positionalVal = 0;

                if (usePST) {
                    const tableKey = p.type === 'k' ? (isEndgame ? 'k_end' : 'k_mid') : p.type;
                    const table = PST_WHITE[tableKey];
                    if (p.color === 'w') {
                        positionalVal = table[r][f];
                    } else {
                        // Mirror row vertically for Black
                        positionalVal = table[7 - r][f];
                    }
                } else {
                    // Basic center control bonus for Medium mode
                    if ((r === 3 || r === 4) && (f === 3 || f === 4)) {
                        positionalVal = 20;
                    } else if ((r >= 2 && r <= 5) && (f >= 2 && f <= 5)) {
                        positionalVal = 8;
                    }
                }

                if (p.color === 'b') {
                    score += (baseVal + positionalVal);
                } else {
                    score -= (baseVal + positionalVal);
                }
            }
        }

        // Expert level: bonus for checking opponent & pawn shield / tactical pressure
        if (includeKingSafety && simEngine.in_check()) {
            score += (simEngine.turn() === 'w' ? 35 : -35);
        }

        return score;
    }

    // MVV-LVA (Most Valuable Victim - Least Valuable Attacker) + Promotion & Check Move Ordering
    function orderMoves(moves) {
        return moves.slice().sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            if (a.captured) scoreA += 10 * PIECE_BASE_VALUES[a.captured] - PIECE_BASE_VALUES[a.piece];
            if (b.captured) scoreB += 10 * PIECE_BASE_VALUES[b.captured] - PIECE_BASE_VALUES[b.piece];

            if (a.promotion) scoreA += PIECE_BASE_VALUES[a.promotion || 'q'];
            if (b.promotion) scoreB += PIECE_BASE_VALUES[b.promotion || 'q'];

            if (a.san && a.san.includes('+')) scoreA += 150;
            if (b.san && b.san.includes('+')) scoreB += 150;

            return scoreB - scoreA;
        });
    }

    // Quiescence Search: extends tactical capture chains at leaf nodes to prevent horizon-effect blunders
    function quiescence(simEngine, alpha, beta, maximizingPlayer, qDepth = 0) {
        const standPat = evaluateBoard(simEngine, true, true);

        if (qDepth >= 3) {
            return standPat;
        }

        if (maximizingPlayer) {
            if (standPat >= beta) return beta;
            if (alpha < standPat) alpha = standPat;

            const captureMoves = orderMoves(
                simEngine.moves({ verbose: true }).filter(m => m.captured || m.promotion)
            );

            for (let i = 0; i < captureMoves.length; i++) {
                applyVirtualMove(simEngine, captureMoves[i]);
                const score = quiescence(simEngine, alpha, beta, false, qDepth + 1);
                simEngine.undo();

                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            }
            return alpha;
        } else {
            if (standPat <= alpha) return alpha;
            if (beta > standPat) beta = standPat;

            const captureMoves = orderMoves(
                simEngine.moves({ verbose: true }).filter(m => m.captured || m.promotion)
            );

            for (let i = 0; i < captureMoves.length; i++) {
                applyVirtualMove(simEngine, captureMoves[i]);
                const score = quiescence(simEngine, alpha, beta, true, qDepth + 1);
                simEngine.undo();

                if (score <= alpha) return alpha;
                if (score < beta) beta = score;
            }
            return beta;
        }
    }

    // Minimax with Alpha-Beta Pruning
    function minimax(simEngine, depth, alpha, beta, maximizingPlayer, usePST, useQuiescence) {
        if (simEngine.game_over()) {
            if (simEngine.in_checkmate()) {
                // Prefer faster checkmates
                return maximizingPlayer ? (-99999 - depth * 100) : (99999 + depth * 100);
            }
            return 0;
        }

        if (depth === 0) {
            if (useQuiescence) {
                return quiescence(simEngine, alpha, beta, maximizingPlayer, 0);
            }
            return evaluateBoard(simEngine, usePST, false);
        }

        const rawMoves = simEngine.moves({ verbose: true });
        const moves = orderMoves(rawMoves);

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                applyVirtualMove(simEngine, moves[i]);
                const evaluation = minimax(simEngine, depth - 1, alpha, beta, false, usePST, useQuiescence);
                simEngine.undo();

                if (evaluation > maxEval) maxEval = evaluation;
                if (evaluation > alpha) alpha = evaluation;
                if (beta <= alpha) break; // Beta cutoff
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                applyVirtualMove(simEngine, moves[i]);
                const evaluation = minimax(simEngine, depth - 1, alpha, beta, true, usePST, useQuiescence);
                simEngine.undo();

                if (evaluation < minEval) minEval = evaluation;
                if (evaluation < beta) beta = evaluation;
                if (beta <= alpha) break; // Alpha cutoff
            }
            return minEval;
        }
    }

    WC.aiEngine = {
        PIECE_BASE_VALUES,
        cloneState,
        applyVirtualMove,
        evaluateBoard,
        orderMoves,
        quiescence,
        minimax
    };
})(window.WizardChess = window.WizardChess || {});
