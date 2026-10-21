(function (WC) {
    'use strict';

    function executeAnimatedMove(moveObj) {
        const state = WC.state;

        state.isAnimating = true;
        WC.highlights.clearMoveHighlights();
        state.selectedSquare = null;
        state.legalMovesForSelected = [];

        const fromSq = moveObj.from;
        const toSq = moveObj.to;
        const attackerMesh = state.pieceMeshes[fromSq];
        const startPos = WC.coords.algebraicToWorld(fromSq);
        const endPos = WC.coords.algebraicToWorld(toSq);

        // Identify if there is a captured piece (including En Passant)
        let capturedSq = null;
        let defenderMesh = null;
        if (moveObj.flags.includes('e')) {
            // En passant capture square
            const epRank = moveObj.color === 'w' ? '5' : '4';
            capturedSq = toSq[0] + epRank;
            defenderMesh = state.pieceMeshes[capturedSq];
        } else if (moveObj.captured) {
            capturedSq = toSq;
            defenderMesh = state.pieceMeshes[toSq];
        }

        // Commit move to Chess.js engine
        const result = state.chess.move(moveObj);
        if (!result) {
            state.isAnimating = false;
            return;
        }

        // Handle Castling Rook Glide simultaneously
        if (result.flags.includes('k') || result.flags.includes('q')) {
            const rank = result.color === 'w' ? '1' : '8';
            const rookFrom = result.flags.includes('k') ? 'h' + rank : 'a' + rank;
            const rookTo = result.flags.includes('k') ? 'f' + rank : 'd' + rank;
            const rookMesh = state.pieceMeshes[rookFrom];
            if (rookMesh) {
                delete state.pieceMeshes[rookFrom];
                state.pieceMeshes[rookTo] = rookMesh;
                rookMesh.userData.square = rookTo;
                state.activeAnimations.push({
                    type: 'glide',
                    mesh: rookMesh,
                    startPos: WC.coords.algebraicToWorld(rookFrom),
                    endPos: WC.coords.algebraicToWorld(rookTo),
                    elapsed: 0,
                    duration: 0.55
                });
            }
        }

        // Update piece dictionary reference
        delete state.pieceMeshes[fromSq];
        if (capturedSq && state.pieceMeshes[capturedSq]) {
            delete state.pieceMeshes[capturedSq];
        }
        state.pieceMeshes[toSq] = attackerMesh;
        attackerMesh.userData.square = toSq;

        // Handle Pawn Promotion Visual Upgrade
        const isPromotion = result.flags.includes('p');

        if (defenderMesh) {
            // Wizard's Chess Wind-up, Lunge Strike & Shatter Animation
            state.activeAnimations.push({
                type: 'attack',
                mesh: attackerMesh,
                defenderMesh: defenderMesh,
                defenderColor: result.color === 'w' ? 'b' : 'w',
                startPos: startPos,
                endPos: endPos,
                shattered: false,
                isPromotion: isPromotion,
                promotedType: result.promotion || 'q',
                pieceColor: result.color,
                square: toSq,
                elapsed: 0,
                duration: 0.85
            });
        } else {
            // Smooth Ceremonial Glide / Knight Leap Animation
            WC.sound.playSlide();
            state.activeAnimations.push({
                type: 'glide',
                mesh: attackerMesh,
                isKnight: result.piece === 'n',
                isPromotion: isPromotion,
                promotedType: result.promotion || 'q',
                pieceColor: result.color,
                square: toSq,
                startPos: startPos,
                endPos: endPos,
                elapsed: 0,
                duration: 0.52
            });
        }

        document.getElementById('last-move-chip').textContent = `PLY: ${result.san}`;
    }

    function onAllAnimationsComplete() {
        const state = WC.state;

        state.isAnimating = false;
        WC.ui.updateStatus();

        if (state.chess.in_check()) {
            WC.sound.playCheck();
        }

        // Trigger AI response if vs AI mode and it is Black's turn
        if (!state.chess.game_over() && state.gameMode === 'ai' && state.chess.turn() === 'b') {
            WC.ai.triggerMove();
        }
    }

    function updateAnimations(dt) {
        const state = WC.state;
        const activeAnimations = state.activeAnimations;

        // 4. Update Active Piece Move & Combat Strike Animations
        for (let i = activeAnimations.length - 1; i >= 0; i--) {
            const anim = activeAnimations[i];
            anim.elapsed += dt;
            const t = Math.min(anim.elapsed / anim.duration, 1.0);

            if (anim.type === 'glide') {
                // Smooth ease-in-out cubic glide
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, ease);
                // Parabolic arc for Knights or subtle levitation for gliding pieces
                const arcHeight = anim.isKnight ? 2.6 : 0.45;
                anim.mesh.position.y = Math.sin(t * Math.PI) * arcHeight;
            } else if (anim.type === 'attack') {
                // 3-Phase Wizard's Chess Combat Animation:
                // Phase 1 (0.0 -> 0.55): Approach target square
                // Phase 2 (0.55 -> 0.72): Wind-up & tilt back weapon
                // Phase 3 (0.72 -> 1.0): Heavy strike lunge & shatter defender
                if (t < 0.55) {
                    const p = t / 0.55;
                    anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, p * 0.78);
                    anim.mesh.position.y = Math.sin(p * Math.PI) * 0.6;
                } else if (t < 0.72) {
                    const w = (t - 0.55) / 0.17;
                    anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, 0.78 - w * 0.08);
                    anim.mesh.position.y = 0.25 * w;
                    anim.mesh.rotation.x = -0.38 * w * (anim.pieceColor === 'w' ? 1 : -1);
                } else {
                    const s = (t - 0.72) / 0.28;
                    anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, 0.70 + s * 0.30);
                    anim.mesh.position.y = (1 - s) * 0.25;
                    anim.mesh.rotation.x = (1 - s) * 0.45 * (anim.pieceColor === 'w' ? 1 : -1);

                    if (!anim.shattered) {
                        anim.shattered = true;
                        state.shatteredCount++;
                        WC.sound.playShatter();
                        WC.effects.spawnShatterDebris(anim.endPos, anim.defenderColor);
                        state.scene.remove(anim.defenderMesh);
                    }
                }
            }

            if (t >= 1.0) {
                anim.mesh.position.copy(anim.endPos);
                anim.mesh.position.y = 0;
                anim.mesh.rotation.set(0, 0, 0);

                // Replace pawn mesh with Queen mesh if promoted
                if (anim.isPromotion) {
                    state.scene.remove(anim.mesh);
                    const promotedMesh = WC.pieces.createPieceMesh(anim.promotedType, anim.pieceColor);
                    promotedMesh.position.copy(anim.endPos);
                    promotedMesh.userData.square = anim.square;
                    state.scene.add(promotedMesh);
                    state.pieceMeshes[anim.square] = promotedMesh;
                }

                activeAnimations.splice(i, 1);
                if (activeAnimations.length === 0) {
                    onAllAnimationsComplete();
                }
            }
        }
    }

    WC.animations = { executeAnimatedMove, updateAnimations };
})(window.WizardChess = window.WizardChess || {});
