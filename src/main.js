(function (WC) {
    'use strict';

    // Inline HTML controls call these handlers by name.
    window.setGameMode = WC.controls.setGameMode;
    window.setAIDifficulty = WC.controls.setAIDifficulty;
    window.cycleCameraPreset = WC.controls.cycleCameraPreset;
    window.undoLastMove = WC.controls.undoLastMove;
    window.toggleAudio = WC.controls.toggleAudio;
    window.resetGame = WC.controls.resetGame;

    window.onload = function () {
        WC.scene.init();
        WC.loop.start();
    };
})(window.WizardChess = window.WizardChess || {});
