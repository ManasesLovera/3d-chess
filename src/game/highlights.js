(function (WC) {
    'use strict';

    function clearMoveHighlights() {
        const state = WC.state;
        state.highlightMeshes.forEach(m => state.scene.remove(m));
        state.highlightMeshes.length = 0;
    }

    // Helper: Creates a crisp architectural square frame marker on the board surface
    function createSquareFrameMarker(size, thickness, colorHex, opacity = 0.92) {
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: opacity < 1.0,
            opacity: opacity
        });
        const h = 0.025;
        const half = size / 2 - thickness / 2;

        const topBar = new THREE.Mesh(new THREE.BoxGeometry(size, h, thickness), mat);
        topBar.position.set(0, 0, -half);
        const botBar = new THREE.Mesh(new THREE.BoxGeometry(size, h, thickness), mat);
        botBar.position.set(0, 0, half);
        const leftBar = new THREE.Mesh(new THREE.BoxGeometry(thickness, h, size - thickness * 2), mat);
        leftBar.position.set(-half, 0, 0);
        const rightBar = new THREE.Mesh(new THREE.BoxGeometry(thickness, h, size - thickness * 2), mat);
        rightBar.position.set(half, 0, 0);

        group.add(topBar, botBar, leftBar, rightBar);
        return group;
    }

    function showValidMoveHighlights(square) {
        clearMoveHighlights();

        // 1. Selected piece square: Crisp Muted Architectural Brass Frame
        const originPos = WC.coords.algebraicToWorld(square);
        const selectFrame = createSquareFrameMarker(1.74, 0.11, 0xB89146, 0.95);
        selectFrame.position.set(originPos.x, 0.02, originPos.z);
        WC.state.scene.add(selectFrame);
        WC.state.highlightMeshes.push(selectFrame);

        // 2. Legal target squares: Tactile rounded-square plates & terracotta capture frames
        WC.state.legalMovesForSelected.forEach(move => {
            const targetPos = WC.coords.algebraicToWorld(move.to);
            const isCapture = move.flags.includes('c') || move.flags.includes('e');

            if (isCapture) {
                // Warm Terracotta Architectural Capture Frame
                const capFrame = createSquareFrameMarker(1.76, 0.13, 0xB83B2A, 0.92);
                capFrame.position.set(targetPos.x, 0.025, targetPos.z);
                WC.state.scene.add(capFrame);
                WC.state.highlightMeshes.push(capFrame);
            } else {
                // Tactile Chamfered Square Marker in Muted Forest-Brass
                const markerGroup = new THREE.Group();
                const padMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.46, 0.03, 0.46),
                    new THREE.MeshBasicMaterial({
                        color: 0x3A6B48,
                        transparent: true,
                        opacity: 0.88
                    })
                );
                const coreMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.24, 0.038, 0.24),
                    new THREE.MeshBasicMaterial({
                        color: 0xDFD8C8
                    })
                );
                markerGroup.add(padMesh, coreMesh);
                markerGroup.position.set(targetPos.x, 0.02, targetPos.z);
                WC.state.scene.add(markerGroup);
                WC.state.highlightMeshes.push(markerGroup);
            }
        });
    }

    WC.highlights = { clearMoveHighlights, showValidMoveHighlights };
})(window.WizardChess = window.WizardChess || {});
