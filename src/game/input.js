(function (WC) {
    'use strict';

    function setupInputListeners() {
        const state = WC.state;
        const dom = state.renderer.domElement;
        const activePointers = new Map();

        dom.addEventListener('pointerdown', e => {
            activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (activePointers.size === 1) {
                state.camState.isDragging = true;
                state.camState.wasMultiTouch = false;
                state.camState.dragDistance = 0;
                state.camState.downX = e.clientX;
                state.camState.downY = e.clientY;
                state.camState.downTime = performance.now();
                state.camState.prevX = e.clientX;
                state.camState.prevY = e.clientY;
            } else if (activePointers.size >= 2) {
                // Two-finger pinch-zoom gesture started: suppress accidental tap piece selection
                state.camState.wasMultiTouch = true;
                const pts = Array.from(activePointers.values());
                state.camState.lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            }
        });

        window.addEventListener('pointermove', e => {
            if (!activePointers.has(e.pointerId)) return;
            activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (activePointers.size === 2) {
                // Two-finger pinch-to-zoom & subtle two-finger orbit
                const pts = Array.from(activePointers.values());
                const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                if (state.camState.lastPinchDist > 0) {
                    const deltaDist = state.camState.lastPinchDist - dist;
                    const framing = WC.camera.getViewportCameraFraming();
                    state.camState.baseRadius = Math.max(
                        11.5,
                        Math.min(36.0, state.camState.baseRadius + deltaDist * 0.045)
                    );
                    state.camState.targetRadius = Math.max(
                        framing.minRadius,
                        Math.min(framing.maxRadius, state.camState.baseRadius * framing.scale)
                    );
                }
                state.camState.lastPinchDist = dist;
                return;
            }

            if (!state.camState.isDragging || activePointers.size !== 1) return;

            const dx = e.clientX - state.camState.prevX;
            const dy = e.clientY - state.camState.prevY;
            state.camState.dragDistance = Math.hypot(e.clientX - state.camState.downX, e.clientY - state.camState.downY);

            state.camState.targetTheta -= dx * 0.0068;
            state.camState.targetPhi = Math.max(0.20, Math.min(1.36, state.camState.targetPhi - dy * 0.0058));

            state.camState.prevX = e.clientX;
            state.camState.prevY = e.clientY;
        });

        const onPointerEnd = e => {
            activePointers.delete(e.pointerId);

            if (activePointers.size < 2) {
                state.camState.lastPinchDist = 0;
            }

            if (activePointers.size === 0) {
                const duration = performance.now() - state.camState.downTime;
                const moveDist = Math.hypot(e.clientX - state.camState.downX, e.clientY - state.camState.downY);

                // Clean single-finger tap discrimination (< 12px movement and < 400ms duration, no pinch)
                if (
                    state.camState.isDragging &&
                    !state.camState.wasMultiTouch &&
                    moveDist < 12 &&
                    state.camState.dragDistance < 12 &&
                    duration < 400
                ) {
                    handleBoardTap(e.clientX, e.clientY);
                }
                state.camState.isDragging = false;
                state.camState.wasMultiTouch = false;
            } else if (activePointers.size === 1) {
                // Sync remaining finger coordinates so transitioning from 2 fingers to 1 doesn't jump camera
                const remaining = Array.from(activePointers.values())[0];
                state.camState.prevX = remaining.x;
                state.camState.prevY = remaining.y;
            }
        };

        window.addEventListener('pointerup', onPointerEnd);
        window.addEventListener('pointercancel', onPointerEnd);

        dom.addEventListener('wheel', e => {
            e.preventDefault();
            const framing = WC.camera.getViewportCameraFraming();
            state.camState.baseRadius = Math.max(11.5, Math.min(36.0, state.camState.baseRadius + e.deltaY * 0.015));
            state.camState.targetRadius = Math.max(
                framing.minRadius,
                Math.min(framing.maxRadius, state.camState.baseRadius * framing.scale)
            );
        }, { passive: false });

        const handleViewportResize = () => {
            if (!state.renderer || !state.camera) return;
            state.renderer.setSize(window.innerWidth, window.innerHeight);
            state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            WC.camera.applyResponsiveCameraFraming(false);
            WC.ui.updateStatus();
        };

        window.addEventListener('resize', handleViewportResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleViewportResize, 80);
        });
    }

    function handleBoardTap(clientX, clientY) {
        const state = WC.state;

        if (state.isAnimating || state.chess.game_over()) return;
        if (state.gameMode === 'ai' && state.chess.turn() === 'b') return;

        const rect = state.renderer.domElement.getBoundingClientRect();
        state.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        state.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        state.raycaster.setFromCamera(state.mouse, state.camera);

        // Collect all pickable squares and pieces
        const pickables = [...Object.values(state.squareMeshes)];
        Object.values(state.pieceMeshes).forEach(group => {
            group.traverse(child => {
                if (child.isMesh) {
                    child.userData.parentSquare = group.userData.square;
                    pickables.push(child);
                }
            });
        });

        const intersects = state.raycaster.intersectObjects(pickables, false);
        if (intersects.length === 0) {
            state.selectedSquare = null;
            state.legalMovesForSelected = [];
            WC.highlights.clearMoveHighlights();
            return;
        }

        const hit = intersects[0].object;
        const clickedSquare = hit.userData.square || hit.userData.parentSquare;
        if (!clickedSquare) return;

        // 1. Check if clickedSquare is a valid destination for currently selected piece
        const chosenMove = state.legalMovesForSelected.find(m => m.to === clickedSquare);
        if (chosenMove) {
            // Default auto-Queen promotion for streamlined single-level UX
            if (chosenMove.flags.includes('p')) {
                chosenMove.promotion = 'q';
            }
            WC.animations.executeAnimatedMove(chosenMove);
            return;
        }

        // 2. Otherwise, check if user clicked one of their own pieces
        const pieceOnSquare = state.chess.get(clickedSquare);
        if (pieceOnSquare && pieceOnSquare.color === state.chess.turn()) {
            state.selectedSquare = clickedSquare;
            state.legalMovesForSelected = state.chess.moves({ square: clickedSquare, verbose: true });
            WC.sound.playSelect();
            WC.highlights.showValidMoveHighlights(clickedSquare);
        } else {
            state.selectedSquare = null;
            state.legalMovesForSelected = [];
            WC.highlights.clearMoveHighlights();
        }
    }

    WC.input = { setupInputListeners };
})(window.WizardChess = window.WizardChess || {});
