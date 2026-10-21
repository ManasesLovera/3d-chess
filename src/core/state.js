(function (WC) {
    'use strict';

    WC.state = {
        // Three.js core objects
        scene: null,
        camera: null,
        renderer: null,
        raycaster: null,
        mouse: null,

        // Game engine & mode
        chess: new Chess(),
        gameMode: 'ai',
        aiDifficulty: 'medium',
        isAnimating: false,
        isAIThinking: false,
        selectedSquare: null,
        legalMovesForSelected: [],
        shatteredCount: 0,

        // Collections of 3D objects
        squareMeshes: {},
        pieceMeshes: {},
        highlightMeshes: [],
        activeAnimations: [],
        activeDebris: [],
        foliageGroups: [],

        // Shared materials
        materials: {
            whitePieceMat: null,
            blackPieceMat: null,
            goldTrimMat: null,
            obsidianVeinMat: null,
            lightSquareMat: null,
            darkSquareMat: null
        },

        // Custom smooth orbit & multi-touch camera controller
        camState: {
            theta: -1.18,
            phi: 1.04,
            baseRadius: 23.0,
            radius: 23.0,
            targetTheta: -1.18,
            targetPhi: 1.04,
            targetRadius: 23.0,
            lookAt: new THREE.Vector3(0, 0.35, 0),
            targetLookAtY: 0.35,
            isDragging: false,
            dragDistance: 0,
            downX: 0,
            downY: 0,
            downTime: 0,
            prevX: 0,
            prevY: 0,
            wasMultiTouch: false,
            lastPinchDist: 0,
            presetIndex: 0
        },

        prevTime: performance.now()
    };
})(window.WizardChess = window.WizardChess || {});
