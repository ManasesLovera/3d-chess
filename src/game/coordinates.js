(function (WC) {
    'use strict';

    const { SQUARE_SIZE, BOARD_OFFSET } = WC.constants;

    function algebraicToWorld(square) {
        const file = square.charCodeAt(0) - 97;
        const rank = parseInt(square[1], 10) - 1;
        const x = file * SQUARE_SIZE - BOARD_OFFSET;
        const z = (7 - rank) * SQUARE_SIZE - BOARD_OFFSET;
        return new THREE.Vector3(x, 0, z);
    }

    function indexToAlgebraic(file, rank) {
        return String.fromCharCode(97 + file) + (rank + 1);
    }

    WC.coords = { algebraicToWorld, indexToAlgebraic };
})(window.WizardChess = window.WizardChess || {});
