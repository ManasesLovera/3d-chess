(function (WC) {
    'use strict';

    function updateUIStatus() {
        const state = WC.state;
        const chess = state.chess;
        const turn = chess.turn();
        const turnDot = document.getElementById('turn-dot');
        const statusText = document.getElementById('status-text');
        const topBar = document.getElementById('top-app-bar');
        const undoBtn = document.getElementById('undo-btn');
        const capturedChip = document.getElementById('captured-chip');
        const endgameOverlay = document.getElementById('endgame-overlay');
        const endgameCard = document.getElementById('endgame-card');
        const isCompactMobile = window.innerWidth < 640;

        capturedChip.textContent = isCompactMobile ? `CAP: ${state.shatteredCount}` : `CAPTURED: ${state.shatteredCount}`;
        undoBtn.disabled = chess.history().length === 0 || state.isAnimating;

        if (turn === 'w') {
            turnDot.className = 'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-[#FAF8F5] border border-[#525B54] transition-colors duration-200 shrink-0';
        } else {
            turnDot.className = 'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-[#1C211E] border border-[#525B54] transition-colors duration-200 shrink-0';
        }

        if (chess.in_check() && !chess.game_over()) {
            topBar.classList.add('check-alert');
        } else {
            topBar.classList.remove('check-alert');
        }

        if (chess.game_over()) {
            endgameOverlay.classList.remove('opacity-0', 'pointer-events-none');
            endgameCard.classList.remove('scale-95');
            endgameCard.classList.add('scale-100');

            const titleEl = document.getElementById('endgame-title');
            const subEl = document.getElementById('endgame-subtitle');

            if (chess.in_checkmate()) {
                const winner = turn === 'w' ? 'Black (Obsidian)' : 'White (Marble)';
                titleEl.textContent = 'Checkmate';
                subEl.textContent = `${winner} wins the match by checkmate.`;
                statusText.textContent = `Checkmate · ${turn === 'w' ? 'Black' : 'White'} Wins`;
            } else {
                titleEl.textContent = 'Match Drawn';
                subEl.textContent = 'The game concluded in a draw by stalemate or repetition.';
                statusText.textContent = 'Draw / Stalemate';
            }
        } else {
            endgameOverlay.classList.add('opacity-0', 'pointer-events-none');
            endgameCard.classList.add('scale-95');
            endgameCard.classList.remove('scale-100');

            const diffLabel = WC.constants.AI_DIFFICULTY_LABELS[state.aiDifficulty] || 'Med';
            let sideLabel;
            if (isCompactMobile) {
                sideLabel = turn === 'w'
                    ? "White's Turn"
                    : (state.gameMode === 'ai' ? `AI (${diffLabel})...` : "Black's Turn");
            } else {
                sideLabel = turn === 'w'
                    ? "White to Move (Marble)"
                    : (state.gameMode === 'ai' ? `AI (${diffLabel}) Calculating...` : "Black to Move (Obsidian)");
            }
            const checkSuffix = chess.in_check() ? ' · CHECK' : '';
            statusText.textContent = sideLabel + checkSuffix;
        }
    }

    WC.ui = { updateStatus: updateUIStatus };
})(window.WizardChess = window.WizardChess || {});
