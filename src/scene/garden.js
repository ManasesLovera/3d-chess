(function (WC) {
    'use strict';

    // Helper: Creates realistic curved sword-like Agapanthus / Lily leaf blades with central rib & tall teardrop flower buds (Image 2 foreground)
    function createAgapanthusClump(leafCount = 26, budCount = 3, scale = 1.0) {
        const group = new THREE.Group();
        const leafShades = [
            new THREE.MeshStandardMaterial({ color: 0x2D5C1E, roughness: 0.46, side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: 0x3B7225, roughness: 0.42, side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: 0x49842E, roughness: 0.48, side: THREE.DoubleSide })
        ];
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x29541A, roughness: 0.45 });
        const budMat = new THREE.MeshStandardMaterial({ color: 0x4E8A2F, roughness: 0.36 });
        const budTipMat = new THREE.MeshStandardMaterial({ color: 0x6AA344, roughness: 0.35 });

        // Build a custom arched strap-leaf geometry with natural mid-blade droop
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.32;
            const spreadTilt = 0.22 + (i % 3) * 0.2 + Math.random() * 0.28;
            const bladeLen = (1.65 + Math.random() * 1.55) * scale;
            const bladeWidth = (0.14 + Math.random() * 0.05) * scale;

            const leafPivot = new THREE.Group();
            leafPivot.rotation.y = angle;
            leafPivot.rotation.x = spreadTilt;

            // 3 articulated segments per leaf blade for graceful botanical arching
            const segLen = bladeLen / 3;
            let currGroup = leafPivot;
            for (let s = 0; s < 3; s++) {
                const segGroup = new THREE.Group();
                if (s > 0) {
                    segGroup.position.y = segLen * 0.94;
                    segGroup.rotation.x = 0.18 + s * 0.12;
                }
                const wTop = s === 2 ? 0.01 : bladeWidth * (1 - (s + 1) * 0.22);
                const wBot = bladeWidth * (1 - s * 0.22);
                const segGeo = new THREE.CylinderGeometry(wTop, wBot, segLen, 4);
                segGeo.scale(1.0, 1.0, 0.14);
                segGeo.translate(0, segLen / 2, 0);

                const segMesh = new THREE.Mesh(segGeo, leafShades[i % leafShades.length]);
                segMesh.castShadow = true;
                segMesh.receiveShadow = true;
                segGroup.add(segMesh);

                currGroup.add(segGroup);
                currGroup = segGroup;
            }

            group.add(leafPivot);
        }

        // Tall slender flower stalks topped with teardrop green scape buds (prominent in bottom foreground of Image 2)
        for (let b = 0; b < budCount; b++) {
            const stalkGroup = new THREE.Group();
            const stalkH = (2.85 + Math.random() * 1.35) * scale;
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.032 * scale, 0.048 * scale, stalkH, 8), stemMat);
            stem.position.y = stalkH / 2;
            stem.castShadow = true;
            stalkGroup.add(stem);

            // Swollen teardrop bud base + pointed tip
            const budBase = new THREE.Mesh(new THREE.SphereGeometry(0.095 * scale, 10, 10), budMat);
            budBase.scale.set(0.85, 1.45, 0.85);
            budBase.position.y = stalkH + 0.06 * scale;
            stalkGroup.add(budBase);

            const budCone = new THREE.Mesh(new THREE.ConeGeometry(0.082 * scale, 0.34 * scale, 10), budTipMat);
            budCone.position.y = stalkH + 0.24 * scale;
            stalkGroup.add(budCone);

            stalkGroup.position.set((Math.random() - 0.5) * 0.65, 0, (Math.random() - 0.5) * 0.65);
            stalkGroup.rotation.z = (Math.random() - 0.5) * 0.14;
            stalkGroup.rotation.x = (Math.random() - 0.5) * 0.14;
            group.add(stalkGroup);
        }

        group.userData = { swayPhase: Math.random() * Math.PI * 2 };
        WC.state.foliageGroups.push(group);
        return group;
    }

    // Helper: High-Detail Layered Botanical Shrub & Hedge with Leaf Clusters & Wildflowers (Left & Rear of Image 2)
    function createGardenShrub(radius = 2.5, withWhiteFlowers = false) {
        const group = new THREE.Group();
        const shades = [0x1F4414, 0x2B581B, 0x376C23, 0x46802C, 0x569437];
        const materials = shades.map(c => new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.68,
            flatShading: true
        }));

        // Woody interior branches
        const branchMat = new THREE.MeshStandardMaterial({ color: 0x3D2E1E, roughness: 0.9 });
        for (let b = 0; b < 5; b++) {
            const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, radius * 1.1, 6), branchMat);
            br.position.set((Math.random() - 0.5) * radius * 0.5, radius * 0.45, (Math.random() - 0.5) * radius * 0.5);
            br.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * 3, (Math.random() - 0.5) * 0.6);
            group.add(br);
        }

        // Layered organic leaf clusters
        const clusterCount = 42;
        for (let i = 0; i < clusterCount; i++) {
            const mat = materials[i % materials.length];
            const r = radius * (0.24 + Math.random() * 0.28);
            const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
            puff.scale.set(1.15, 0.78 + Math.random() * 0.35, 1.1);
            const ang = Math.random() * Math.PI * 2;
            const elev = Math.random();
            const dist = Math.pow(Math.random(), 0.6) * radius * 0.85;
            puff.position.set(
                Math.cos(ang) * dist,
                r * 0.5 + elev * radius * 0.85,
                Math.sin(ang) * dist
            );
            puff.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
            puff.castShadow = true;
            puff.receiveShadow = true;
            group.add(puff);
        }

        // Delicate White & Yellow Cosmos/Daisy Wildflowers on Slender Stems (visible near back-left bushes in Image 2)
        if (withWhiteFlowers) {
            const petalMat = new THREE.MeshStandardMaterial({ color: 0xFCFBF7, roughness: 0.35 });
            const yellowPetalMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.38 });
            const centerMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.4 });
            const stemMat = new THREE.MeshStandardMaterial({ color: 0x366322, roughness: 0.5 });

            for (let f = 0; f < 18; f++) {
                const flower = new THREE.Group();
                const stemH = 0.55 + Math.random() * 0.65;
                const fStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, stemH, 5), stemMat);
                fStem.position.y = -stemH / 2;
                flower.add(fStem);

                const center = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), centerMat);
                center.scale.set(1, 0.55, 1);
                flower.add(center);

                const pMat = f % 4 === 0 ? yellowPetalMat : petalMat;
                for (let p = 0; p < 6; p++) {
                    const pa = (p / 6) * Math.PI * 2;
                    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.085, 7, 7), pMat);
                    petal.scale.set(1.5, 0.28, 0.75);
                    petal.position.set(Math.cos(pa) * 0.13, 0.01, Math.sin(pa) * 0.13);
                    petal.rotation.y = -pa;
                    flower.add(petal);
                }
                flower.position.set(
                    (Math.random() - 0.5) * radius * 1.35,
                    radius * 0.85 + Math.random() * radius * 0.75,
                    (Math.random() - 0.5) * radius * 1.35
                );
                flower.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * 3, (Math.random() - 0.5) * 0.4);
                group.add(flower);
            }
        }

        return group;
    }

    function buildGardenCourtyard() {
        const courtyardGroup = new THREE.Group();

        // 1. Realistic Earthy Soil, Gravel, Fallen Leaves & Moss Ground (Reference Image 2)
        const soilMaps = WC.textures.soil.createGardenSoilMaps();
        const groundMat = new THREE.MeshStandardMaterial({
            map: soilMaps.map,
            bumpMap: soilMaps.bumpMap,
            bumpScale: 0.04,
            color: 0x9A896E,
            roughness: 0.92,
            metalness: 0.02
        });
        const groundMesh = new THREE.Mesh(new THREE.CylinderGeometry(62, 62, 0.6, 48), groundMat);
        groundMesh.position.y = -0.66;
        groundMesh.receiveShadow = true;
        courtyardGroup.add(groundMesh);

        // 2. Weathered Grey Granite Outer Curb Blocks & Stone Patio Slabs (Reference Image 2)
        const curbMaps = WC.textures.stone.createStoneMaterialMaps({
            baseColor: '#96938C',
            speck1: '#706D66',
            speck2: '#B8B5AE',
            veined: false,
            tileBorder: true
        });
        const curbMat = new THREE.MeshStandardMaterial({
            map: curbMaps.map,
            bumpMap: curbMaps.bumpMap,
            bumpScale: 0.022,
            color: 0x9C9992,
            roughness: 0.82,
            metalness: 0.05
        });

        const mortarMat = new THREE.MeshStandardMaterial({
            color: 0x52504A,
            roughness: 0.95
        });

        // Flat Concrete/Granite Patio Bedding Slab immediately beneath the board & curb
        const apronSlab = new THREE.Mesh(new THREE.BoxGeometry(20.5, 0.26, 20.5), mortarMat);
        apronSlab.position.y = -0.33;
        apronSlab.receiveShadow = true;
        courtyardGroup.add(apronSlab);

        // Worn Outdoor Flagstone Stepping Slabs in the Foreground & Right Clearing (visible in Image 2)
        const flagstoneCoords = [
            [11.4, 3.2, 2.6, 2.2, 0.04],
            [11.5, 0.6, 2.4, 2.5, -0.03],
            [11.3, -2.2, 2.5, 2.3, 0.02],
            [11.6, -5.0, 2.3, 2.4, -0.05],
            [8.4, -11.5, 2.8, 2.1, 0.08],
            [5.2, -11.6, 2.5, 2.2, -0.04]
        ];
        flagstoneCoords.forEach(([fx, fz, fw, fd, rot]) => {
            const slab = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.14, fd), curbMat);
            slab.position.set(fx, -0.34, fz);
            slab.rotation.y = rot;
            slab.receiveShadow = true;
            courtyardGroup.add(slab);
        });

        // Segmented Raised Granite Curb Blocks around all 4 sides with recessed mortar seams
        const curbSpan = 20.4;
        const curbThick = 0.96;
        const curbHeight = 0.44;
        const segments = 7;
        const segLen = (curbSpan - curbThick) / segments;

        for (let i = 0; i < segments; i++) {
            const offset = -((curbSpan - curbThick) / 2) + (i + 0.5) * segLen;

            // North & South granite curb stones
            const blockN = new THREE.Mesh(new THREE.BoxGeometry(segLen - 0.07, curbHeight, curbThick), curbMat);
            blockN.position.set(offset, -0.14, -curbSpan / 2);
            blockN.castShadow = true;
            blockN.receiveShadow = true;
            courtyardGroup.add(blockN);

            const blockS = new THREE.Mesh(new THREE.BoxGeometry(segLen - 0.07, curbHeight, curbThick), curbMat);
            blockS.position.set(offset, -0.14, curbSpan / 2);
            blockS.castShadow = true;
            blockS.receiveShadow = true;
            courtyardGroup.add(blockS);

            // West & East granite curb stones
            const blockW = new THREE.Mesh(new THREE.BoxGeometry(curbThick, curbHeight, segLen - 0.07), curbMat);
            blockW.position.set(-curbSpan / 2, -0.14, offset);
            blockW.castShadow = true;
            blockW.receiveShadow = true;
            courtyardGroup.add(blockW);

            const blockE = new THREE.Mesh(new THREE.BoxGeometry(curbThick, curbHeight, segLen - 0.07), curbMat);
            blockE.position.set(curbSpan / 2, -0.14, offset);
            blockE.castShadow = true;
            blockE.receiveShadow = true;
            courtyardGroup.add(blockE);
        }

        // Corner granite keystone blocks
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([cx, cz]) => {
            const cornerBlock = new THREE.Mesh(new THREE.BoxGeometry(curbThick, curbHeight + 0.01, curbThick), curbMat);
            cornerBlock.position.set(cx * (curbSpan / 2), -0.14, cz * (curbSpan / 2));
            cornerBlock.castShadow = true;
            cornerBlock.receiveShadow = true;
            courtyardGroup.add(cornerBlock);
        });

        // 3. Weathered Moss-Stained Concrete Garden Wall in Background (Upper-left/back of Image 2)
        const wallMaps = WC.textures.stone.createStoneMaterialMaps({
            baseColor: '#63665A',
            speck1: '#45483E',
            speck2: '#7D8072',
            veined: true,
            weatheredWall: true,
            tileBorder: false
        });
        wallMaps.map.repeat.set(5, 2);
        wallMaps.bumpMap.repeat.set(5, 2);

        const wallMat = new THREE.MeshStandardMaterial({
            map: wallMaps.map,
            bumpMap: wallMaps.bumpMap,
            bumpScale: 0.035,
            color: 0x686B5E,
            roughness: 0.92
        });

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(58, 13, 1.5), wallMat);
        backWall.position.set(-19.2, 5.8, -5);
        backWall.rotation.y = Math.PI / 2;
        backWall.receiveShadow = true;
        courtyardGroup.add(backWall);

        const sideWall = new THREE.Mesh(new THREE.BoxGeometry(58, 13, 1.5), wallMat);
        sideWall.position.set(5, 5.8, -23.5);
        sideWall.receiveShadow = true;
        courtyardGroup.add(sideWall);

        // 4. Lush Dense Shrubs & Hedges (Matching Reference Image 2 placement)
        const hedgePositions = [
            [-8.5, 13.5, 3.4, true],
            [-3.2, 14.5, 3.0, false],
            [2.5, 14.8, 3.1, false],
            [8.5, 14.2, 2.7, true],
            [-14.2, 9.8, 3.6, true],
            [-14.8, 4.0, 3.3, false],
            [-14.6, -2.8, 3.4, true],
            [-14.2, -9.8, 3.7, false],
            [-9.8, -15.2, 3.4, false],
            [-3.2, -16.2, 3.8, true],
            [3.8, -15.8, 3.2, false],
            [10.8, -14.8, 2.9, false]
        ];

        hedgePositions.forEach(([hx, hz, rad, flowers]) => {
            const shrub = createGardenShrub(rad, flowers);
            shrub.position.set(hx, -0.35, hz);
            courtyardGroup.add(shrub);
        });

        // 5. Foreground & Border Clumps of Sword-Grass / Agapanthus with Tall Green Flower Buds (Reference Image 2)
        const grassClumpCoords = [
            // Foreground edge (when viewing from default Garden Side camera on +X axis)
            [11.5, 6.2, 28, 4, 1.08],
            [11.7, 2.8, 32, 5, 1.16],
            [11.4, -1.6, 22, 3, 0.98],
            [11.6, -6.2, 26, 4, 1.04],
            [11.3, 9.0, 24, 3, 0.96],
            // Back & side garden beds along the stone curb
            [-11.6, -6.5, 28, 2, 1.18],
            [-11.7, -1.5, 30, 3, 1.22],
            [-11.6, 3.8, 26, 2, 1.12],
            [-6.5, 11.6, 26, 3, 1.08],
            [-1.5, 11.8, 24, 2, 1.02],
            [4.5, 11.6, 26, 3, 1.08],
            [-5.0, -11.8, 26, 2, 1.04],
            [2.0, -12.0, 24, 2, 0.98]
        ];

        grassClumpCoords.forEach(([gx, gz, leaves, buds, sc]) => {
            const clump = createAgapanthusClump(leaves, buds, sc);
            clump.position.set(gx, -0.35, gz);
            courtyardGroup.add(clump);
        });

        WC.state.scene.add(courtyardGroup);
    }

    function updateFoliage(elapsedSec) {
        // Gentle breeze sway for outdoor garden sword-grass & flower stalks
        WC.state.foliageGroups.forEach(fg => {
            const phase = fg.userData.swayPhase || 0;
            fg.rotation.z = Math.sin(elapsedSec * 1.4 + phase) * 0.025;
            fg.rotation.x = Math.cos(elapsedSec * 1.1 + phase) * 0.018;
        });
    }

    WC.garden = { buildCourtyard: buildGardenCourtyard, updateFoliage };
})(window.WizardChess = window.WizardChess || {});
