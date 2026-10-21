(function (WC) {
    'use strict';

    // Non-blocking AI trigger so UI status ("AI (Expert) Thinking...") & 3D garden sway render smoothly
    function triggerAIMove() {
        const state = WC.state;
        if (state.chess.game_over() || state.isAnimating || state.isAIThinking) return;
        state.isAIThinking = true;
        WC.ui.updateStatus();

        // Yield to browser paint frame before running search tree
        requestAnimationFrame(() => {
            setTimeout(() => {
                makeAIMove();
            }, 320);
        });
    }

    function chooseBestBySearch(simEngine, orderedMoves, scoreMove) {
        let bestMove = orderedMoves[0];
        let bestScore = -Infinity;
        let alpha = -Infinity;
        const beta = Infinity;

        for (let i = 0; i < orderedMoves.length; i++) {
            const move = orderedMoves[i];
            WC.aiEngine.applyVirtualMove(simEngine, move);
            const score = scoreMove(move, alpha, beta);
            simEngine.undo();

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            if (score > alpha) alpha = score;
        }

        return bestMove;
    }

    function makeAIMove() {
        const state = WC.state;
        const { applyVirtualMove, evaluateBoard, orderMoves, minimax, cloneState } = WC.aiEngine;

        if (state.chess.game_over() || state.isAnimating) {
            state.isAIThinking = false;
            WC.ui.updateStatus();
            return;
        }

        const simEngine = cloneState(state.chess);
        const legalMoves = simEngine.moves({ verbose: true });
        if (legalMoves.length === 0) {
            state.isAIThinking = false;
            return;
        }

        let chosenMove = legalMoves[0];

        if (state.aiDifficulty === 'easy') {
            // EASY: Depth 1 greedy evaluation with high positional randomness so novices can win comfortably
            let bestScore = -Infinity;
            legalMoves.forEach(move => {
                applyVirtualMove(simEngine, move);
                const baseEval = evaluateBoard(simEngine, false, false);
                simEngine.undo();

                // High random jitter (+/- 240 centipawns) so Easy mode plays casually
                const noisyScore = baseEval + (Math.random() - 0.5) * 480;
                if (noisyScore > bestScore) {
                    bestScore = noisyScore;
                    chosenMove = move;
                }
            });
        } else if (state.aiDifficulty === 'medium') {
            // MEDIUM: Depth 2 Minimax with Alpha-Beta pruning & basic material + center control (avoids 1-move blunders)
            chosenMove = chooseBestBySearch(simEngine, orderMoves(legalMoves), (move, alpha, beta) =>
                minimax(simEngine, 1, alpha, beta, false, false, false) + (Math.random() - 0.5) * 16
            );
        } else if (state.aiDifficulty === 'hard') {
            // HARD: Depth 3 Minimax with Alpha-Beta pruning, full Piece-Square Tables (PST) & MVV-LVA ordering
            chosenMove = chooseBestBySearch(simEngine, orderMoves(legalMoves), (move, alpha, beta) =>
                minimax(simEngine, 2, alpha, beta, false, true, false) + (Math.random() - 0.5) * 6
            );
        } else {
            // EXPERT: Depth 4 Minimax with Alpha-Beta pruning, Quiescence capture search, full PST & deterministic selection
            chosenMove = chooseBestBySearch(simEngine, orderMoves(legalMoves), (move, alpha, beta) =>
                minimax(simEngine, 3, alpha, beta, false, true, true)
            );
        }

        state.isAIThinking = false;
        WC.animations.executeAnimatedMove(chosenMove);
    }

    WC.ai = { triggerMove: triggerAIMove };
})(window.WizardChess = window.WizardChess || {});
