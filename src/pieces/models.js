(function (WC) {
    'use strict';

    /***********************************************************************
     * 6. CLASSIC STAUNTON MONOCHROME CHESS PIECES (MATCHING IMAGE 1)
     ***********************************************************************/
    function createLatheBody(pointsArray, mat, segments = 36) {
        const pts = pointsArray.map(([x, y]) => new THREE.Vector2(x, y));
        const geo = new THREE.LatheGeometry(pts, segments);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    function createWizardPieceMesh(type, color) {
        const { whitePieceMat, blackPieceMat, darkSquareMat } = WC.state.materials;
        const group = new THREE.Group();
        const mainMat = color === 'w' ? whitePieceMat : blackPieceMat;
        const dir = color === 'w' ? -1 : 1; // White faces -Z (North), Black faces +Z (South)

        // 1. Multi-Ringed Stepped Circular Staunton Pedestal Base (Shared across all 32 pieces in Image 1 & 2)
        const stauntonBaseProfile = [
            [0.0, 0.0],
            [0.78, 0.0],
            [0.78, 0.09],
            [0.73, 0.12],
            [0.76, 0.17],
            [0.75, 0.22],
            [0.65, 0.27],
            [0.69, 0.32],
            [0.67, 0.37],
            [0.56, 0.43],
            [0.58, 0.47],
            [0.50, 0.52],
            [0.0, 0.52]
        ];
        const pedestal = createLatheBody(stauntonBaseProfile, mainMat, 36);
        group.add(pedestal);

        // Articulated Upper Piece Body Group (for idle breathing, glide & combat strike animations)
        const bodyGroup = new THREE.Group();
        bodyGroup.name = 'bodyGroup';
        group.add(bodyGroup);

        switch (type) {
            case 'p': {
                // PAWN (Image 1): Smooth concave tapered column, crisp horizontal collar disc & large spherical ball head
                const pawnProfile = [
                    [0.0, 0.48],
                    [0.50, 0.48],
                    [0.42, 0.72],
                    [0.31, 1.02],
                    [0.25, 1.28],
                    [0.40, 1.33],
                    [0.40, 1.39],
                    [0.23, 1.43],
                    [0.0, 1.43]
                ];
                bodyGroup.add(createLatheBody(pawnProfile, mainMat, 36));

                // Large Classic Spherical Pawn Head
                const headBall = new THREE.Mesh(new THREE.SphereGeometry(0.37, 28, 24), mainMat);
                headBall.position.y = 1.72;
                headBall.castShadow = true;
                headBall.receiveShadow = true;
                bodyGroup.add(headBall);
                break;
            }

            case 'r': {
                // ROOK (Image 1): Cylindrical turret with Spiral Staircase relief wrapping shaft & 6-merlon crenellated crown
                const rookShaftProfile = [
                    [0.0, 0.48],
                    [0.54, 0.48],
                    [0.48, 0.80],
                    [0.44, 1.35],
                    [0.43, 1.68],
                    [0.54, 1.78],
                    [0.56, 1.92],
                    [0.36, 1.92],
                    [0.0, 1.92]
                ];
                bodyGroup.add(createLatheBody(rookShaftProfile, mainMat, 36));

                // Spiral Staircase Relief wrapping around the Rook tower (distinctive detail in Reference Image 1)
                const steps = 22;
                for (let i = 0; i < steps; i++) {
                    const t = i / (steps - 1);
                    const angle = t * Math.PI * 2.1 + (color === 'w' ? 0.5 : -0.5);
                    const y = 0.58 + t * 1.12;
                    const r = 0.485 - t * 0.035;

                    const stepBrick = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.065, 0.16), mainMat);
                    stepBrick.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
                    stepBrick.rotation.y = -angle;
                    stepBrick.rotation.z = 0.28;
                    stepBrick.castShadow = true;
                    stepBrick.receiveShadow = true;
                    bodyGroup.add(stepBrick);
                }

                // Small arched doorway niche on the spiral top landing
                const niche = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.14), darkSquareMat);
                niche.position.set(0.41, 1.56, 0.12 * dir);
                niche.rotation.y = 0.25 * dir;
                bodyGroup.add(niche);

                // 6 Crenellated Battlement Merlons around the Rim
                const merlonCount = 6;
                for (let i = 0; i < merlonCount; i++) {
                    const ang = (i / merlonCount) * Math.PI * 2;
                    const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.17), mainMat);
                    merlon.position.set(Math.cos(ang) * 0.47, 2.04, Math.sin(ang) * 0.47);
                    merlon.rotation.y = -ang + Math.PI / 2;
                    merlon.castShadow = true;
                    merlon.receiveShadow = true;
                    bodyGroup.add(merlon);
                }
                break;
            }

            case 'n': {
                // KNIGHT (Image 1 & 2): Sculpted Classic Staunton Horse with arched chest, curved neck, mane ridge, snout & ears
                const knightGroup = new THREE.Group();
                // Orient horse to face opponent's side
                if (dir === 1) {
                    knightGroup.rotation.y = Math.PI;
                }

                // Smooth organic sculpted profile along the spine & chest
                const segments = [
                    // Lower chest & haunches
                    { y: 0.62, z: 0.02, rx: 0.12, rTop: 0.44, rBot: 0.50, h: 0.30, sz: 1.08 },
                    { y: 0.86, z: -0.03, rx: 0.22, rTop: 0.41, rBot: 0.45, h: 0.30, sz: 1.14 },
                    // Broad muscular arched chest & neck
                    { y: 1.12, z: -0.08, rx: 0.28, rTop: 0.38, rBot: 0.42, h: 0.32, sz: 1.18 },
                    { y: 1.38, z: -0.10, rx: 0.18, rTop: 0.34, rBot: 0.38, h: 0.32, sz: 1.16 },
                    { y: 1.64, z: -0.07, rx: -0.05, rTop: 0.30, rBot: 0.35, h: 0.30, sz: 1.12 },
                    // Upper poll & crest
                    { y: 1.86, z: -0.04, rx: -0.25, rTop: 0.25, rBot: 0.30, h: 0.26, sz: 1.08 }
                ];

                segments.forEach(s => {
                    const segMesh = new THREE.Mesh(new THREE.CylinderGeometry(s.rTop, s.rBot, s.h, 24), mainMat);
                    segMesh.scale.set(0.88, 1.0, s.sz);
                    segMesh.position.set(0, s.y, s.z);
                    segMesh.rotation.x = s.rx;
                    segMesh.castShadow = true;
                    segMesh.receiveShadow = true;
                    knightGroup.add(segMesh);
                });

                // Sculpted Staunton Mane Ridge along the back (+Z in local space)
                for (let i = 0; i < 9; i++) {
                    const t = i / 8;
                    const maneWave = new THREE.Mesh(new THREE.SphereGeometry(0.15 - t * 0.03, 14, 12), mainMat);
                    maneWave.scale.set(0.55, 0.85, 1.35);
                    maneWave.position.set(
                        0,
                        0.74 + t * 1.18,
                        0.34 - Math.sin(t * Math.PI) * 0.08
                    );
                    maneWave.rotation.x = -0.35 + t * 0.5;
                    maneWave.castShadow = true;
                    knightGroup.add(maneWave);
                }

                // Horse Head, Jaw & Tapered Muzzle projecting forward (-Z in local space)
                const headGroup = new THREE.Group();
                headGroup.position.set(0, 1.82, -0.14);
                headGroup.rotation.x = -0.58; // Downward proud Staunton tuck

                // Cheekbones & cranium
                const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), mainMat);
                skull.scale.set(0.84, 0.96, 1.18);
                skull.castShadow = true;
                headGroup.add(skull);

                // Bridge of nose & muzzle
                const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.24, 0.58, 20), mainMat);
                snout.rotation.x = Math.PI / 2;
                snout.scale.set(0.85, 1.0, 0.92);
                snout.position.set(0, -0.03, -0.32);
                snout.castShadow = true;
                headGroup.add(snout);

                // Rounded nose tip & nostrils
                const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), mainMat);
                noseTip.scale.set(0.92, 0.85, 0.8);
                noseTip.position.set(0, -0.03, -0.58);
                headGroup.add(noseTip);

                // Subtle sculpted nostrils & eyes
                [-0.08, 0.08].forEach(nx => {
                    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), mainMat);
                    nostril.position.set(nx, -0.01, -0.63);
                    headGroup.add(nostril);
                });

                [-0.19, 0.19].forEach(ex => {
                    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), mainMat);
                    eyeSocket.position.set(ex, 0.08, -0.12);
                    headGroup.add(eyeSocket);
                });

                // Lower jaw / throat-latch curve
                const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.19, 0.46, 16), mainMat);
                jaw.rotation.x = Math.PI / 2 - 0.18;
                jaw.position.set(0, -0.12, -0.24);
                headGroup.add(jaw);

                // Twin Alert Pointed Staunton Ears at the Crown
                [-0.13, 0.13].forEach(earX => {
                    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.28, 12), mainMat);
                    ear.scale.set(0.75, 1.0, 1.1);
                    ear.position.set(earX, 0.28, 0.08);
                    ear.rotation.x = 0.45;
                    ear.rotation.z = earX > 0 ? -0.14 : 0.14;
                    ear.castShadow = true;
                    headGroup.add(ear);
                });

                knightGroup.add(headGroup);
                bodyGroup.add(knightGroup);
                break;
            }

            case 'b': {
                // BISHOP (Image 1): Tapered column with double collar rings, teardrop mitre with diagonal notch & ball finial
                const bishopProfile = [
                    [0.0, 0.48],
                    [0.52, 0.48],
                    [0.42, 0.82],
                    [0.31, 1.24],
                    [0.25, 1.54],
                    [0.41, 1.60],
                    [0.41, 1.66],
                    [0.26, 1.71],
                    [0.33, 1.76],
                    [0.24, 1.81],
                    // Teardrop Mitre Bulb
                    [0.34, 1.96],
                    [0.37, 2.15],
                    [0.31, 2.36],
                    [0.18, 2.52],
                    [0.0, 2.58]
                ];
                bodyGroup.add(createLatheBody(bishopProfile, mainMat, 36));

                // Tiny Raised Cross Relief on Front of Bishop Column (visible in Reference Image 1)
                const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.20, 0.04), mainMat);
                crossV.position.set(0, 1.22, 0.30 * dir);
                crossV.rotation.x = -0.16 * dir;
                const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.045, 0.04), mainMat);
                crossH.position.set(0, 1.25, 0.295 * dir);
                crossH.rotation.x = -0.16 * dir;
                bodyGroup.add(crossV, crossH);

                // Classic Staunton Mitre Diagonal Cleft Groove
                const cleftMat = color === 'w'
                    ? new THREE.MeshStandardMaterial({ color: 0xC8CDD5, roughness: 0.5 })
                    : new THREE.MeshStandardMaterial({ color: 0x0B0D10, roughness: 0.5 });
                const cleftRing = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.026, 10, 24, Math.PI * 0.85), cleftMat);
                cleftRing.position.set(0, 2.25, 0.08 * dir);
                cleftRing.rotation.x = (Math.PI / 4) * dir;
                bodyGroup.add(cleftRing);

                // Top Spherical Finial Pip
                const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 16), mainMat);
                finialBall.position.y = 2.65;
                finialBall.castShadow = true;
                bodyGroup.add(finialBall);
                break;
            }

            case 'q': {
                // QUEEN (Image 1): Tall flared column, double collar rings, scalloped coronet crown with rim beads & ball finial
                const queenProfile = [
                    [0.0, 0.48],
                    [0.56, 0.48],
                    [0.45, 0.88],
                    [0.34, 1.38],
                    [0.27, 1.82],
                    [0.45, 1.89],
                    [0.45, 1.96],
                    [0.29, 2.02],
                    [0.37, 2.08],
                    [0.27, 2.14],
                    // Flared Coronet Cup
                    [0.34, 2.34],
                    [0.44, 2.58],
                    [0.34, 2.60],
                    // Inner Rounded Dome Cushion
                    [0.28, 2.68],
                    [0.14, 2.75],
                    [0.0, 2.76]
                ];
                bodyGroup.add(createLatheBody(queenProfile, mainMat, 36));

                // 9 Scalloped Staunton Coronet Points & Rim Pearls (exact match to Image 1 Queen)
                const points = 9;
                for (let i = 0; i < points; i++) {
                    const ang = (i / points) * Math.PI * 2;
                    const px = Math.cos(ang) * 0.40;
                    const pz = Math.sin(ang) * 0.40;

                    const prong = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.18, 10), mainMat);
                    prong.position.set(px, 2.64, pz);
                    prong.rotation.z = -Math.cos(ang) * 0.22;
                    prong.rotation.x = Math.sin(ang) * 0.22;
                    bodyGroup.add(prong);

                    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), mainMat);
                    pearl.position.set(Math.cos(ang) * 0.42, 2.72, Math.sin(ang) * 0.42);
                    bodyGroup.add(pearl);
                }

                // Top Spherical Finial Ball
                const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 16), mainMat);
                topBall.position.y = 2.84;
                topBall.castShadow = true;
                bodyGroup.add(topBall);
                break;
            }

            case 'k': {
                // KING (Image 1): Tallest flared column, bold collar rings, beveled crown cup & sturdy Staunton Cross Pattee
                const kingProfile = [
                    [0.0, 0.48],
                    [0.59, 0.48],
                    [0.48, 0.92],
                    [0.36, 1.48],
                    [0.29, 1.98],
                    [0.48, 2.06],
                    [0.48, 2.14],
                    [0.31, 2.20],
                    [0.40, 2.26],
                    [0.29, 2.33],
                    // Beveled Royal Crown Cup
                    [0.37, 2.56],
                    [0.46, 2.80],
                    [0.43, 2.86],
                    // Domed Crown Cushion
                    [0.32, 2.94],
                    [0.16, 3.00],
                    [0.0, 3.01]
                ];
                bodyGroup.add(createLatheBody(kingProfile, mainMat, 36));

                // Classic Staunton Cross Finial at Apex (Image 1)
                const crossMount = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), mainMat);
                crossMount.position.y = 3.05;
                bodyGroup.add(crossMount);

                const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.38, 0.11), mainMat);
                crossVert.position.y = 3.24;
                crossVert.castShadow = true;
                bodyGroup.add(crossVert);

                const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.11), mainMat);
                crossHoriz.position.y = 3.26;
                crossHoriz.castShadow = true;
                bodyGroup.add(crossHoriz);
                break;
            }
        }

        group.userData = {
            pieceType: type,
            color: color,
            phase: Math.random() * Math.PI * 2,
            baseY: 0
        };

        return group;
    }

    WC.pieces = { createPieceMesh: createWizardPieceMesh };
})(window.WizardChess = window.WizardChess || {});
