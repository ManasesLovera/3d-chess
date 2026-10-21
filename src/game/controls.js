(function (WC) {
    'use strict';

    function setGameMode(mode) {
        const state = WC.state;
        state.gameMode = mode;
        const aiBtn = document.getElementById('mode-ai-btn');
        const pvpBtn = document.getElementById('mode-pvp-btn');
        const diffGroup = document.getElementById('ai-difficulty-group');

        if (mode === 'ai') {
            aiBtn.classList.add('arch-segmented-active');
            pvpBtn.classList.remove('arch-segmented-active');
            if (diffGroup) {
                diffGroup.classList.remove('opacity-40', 'pointer-events-none');
            }
            if (!state.chess.game_over() && state.chess.turn() === 'b' && !state.isAnimating && !state.isAIThinking) {
                WC.ai.triggerMove();
            }
        } else {
            pvpBtn.classList.add('arch-segmented-active');
            aiBtn.classList.remove('arch-segmented-active');
            if (diffGroup) {
                diffGroup.classList.add('opacity-40', 'pointer-events-none');
            }
        }
        WC.ui.updateStatus();
    }

    function setAIDifficulty(level) {
        const state = WC.state;
        state.aiDifficulty = level;
        const levels = WC.constants.AI_DIFFICULTIES;
        levels.forEach(l => {
            const btn = document.getElementById(`diff-${l}-btn`);
            if (!btn) return;
            if (l === level) {
                btn.classList.add('arch-segmented-active');
            } else {
                btn.classList.remove('arch-segmented-active');
            }
        });
        WC.sound.playSelect();
        WC.ui.updateStatus();
    }

    function cycleCameraPreset() {
        const state = WC.state;
        state.camState.presetIndex = (state.camState.presetIndex + 1) % WC.constants.CAMERA_PRESETS.length;
        const preset = WC.constants.CAMERA_PRESETS[state.camState.presetIndex];
        state.camState.targetTheta = preset.theta;
        state.camState.targetPhi = preset.phi;
        state.camState.baseRadius = preset.radius;
        WC.camera.applyResponsiveCameraFraming(false);
        document.getElementById('camera-label').textContent = preset.name;
        WC.sound.playSelect();
    }

    function undoLastMove() {
        const state = WC.state;
        if (state.isAnimating || state.chess.history().length === 0) return;
        WC.highlights.clearMoveHighlights();
        state.selectedSquare = null;
        state.legalMovesForSelected = [];

        if (state.gameMode === 'ai' && state.chess.turn() === 'w' && state.chess.history().length >= 2) {
            state.chess.undo();
            state.chess.undo();
        } else {
            state.chess.undo();
        }

        const history = state.chess.history();
        document.getElementById('last-move-chip').textContent = history.length > 0 ? `PLY: ${history[history.length - 1]}` : 'PLY: --';
        WC.sound.playSlide();
        WC.pieces.syncWithBoard();
    }

    function toggleAudio() {
        WC.sound.enabled = !WC.sound.enabled;
        document.getElementById('sound-icon').textContent = WC.sound.enabled ? 'volume_up' : 'volume_off';
        if (WC.sound.enabled) WC.sound.playSelect();
    }

    function resetGame() {
        const state = WC.state;
        if (state.isAnimating) return;
        state.chess.reset();
        state.shatteredCount = 0;
        state.selectedSquare = null;
        state.legalMovesForSelected = [];
        WC.highlights.clearMoveHighlights();
        document.getElementById('last-move-chip').textContent = 'PLY: --';
        WC.sound.playSlide();
        WC.pieces.syncWithBoard();
    }

    WC.controls = {
        setGameMode,
        setAIDifficulty,
        cycleCameraPreset,
        undoLastMove,
        toggleAudio,
        resetGame
    };
})(window.WizardChess = window.WizardChess || {});
