(function (WC) {
    'use strict';

    function syncPiecesWithBoard() {
        const state = WC.state;

        // Clear existing piece meshes
        Object.keys(state.pieceMeshes).forEach(sq => {
            state.scene.remove(state.pieceMeshes[sq]);
            delete state.pieceMeshes[sq];
        });

        const board = state.chess.board();
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const piece = board[r][f];
                if (piece) {
                    const sq = WC.coords.indexToAlgebraic(f, 7 - r);
                    const worldPos = WC.coords.algebraicToWorld(sq);
                    const mesh = WC.pieces.createPieceMesh(piece.type, piece.color);
                    mesh.position.copy(worldPos);
                    mesh.userData.square = sq;
                    state.scene.add(mesh);
                    state.pieceMeshes[sq] = mesh;
                }
            }
        }

        WC.ui.updateStatus();
    }

    function updateIdleAnimations(elapsedSec) {
        Object.values(WC.state.pieceMeshes).forEach(pieceGroup => {
            const body = pieceGroup.getObjectByName('bodyGroup');
            if (body) {
                const phase = pieceGroup.userData.phase;
                body.position.y = Math.sin(elapsedSec * 2.2 + phase) * 0.028;
                body.rotation.z = Math.sin(elapsedSec * 1.5 + phase) * 0.014;
                body.rotation.x = Math.cos(elapsedSec * 1.7 + phase) * 0.012;
            }
        });
    }

    WC.pieces.syncWithBoard = syncPiecesWithBoard;
    WC.pieces.updateIdleAnimations = updateIdleAnimations;
})(window.WizardChess = window.WizardChess || {});
