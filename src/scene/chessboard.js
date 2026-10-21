(function (WC) {
    'use strict';

    function buildChessboard() {
        const boardGroup = new THREE.Group();

        // 1. Reference Image 1: Dark Matte-Satin Beveled Inner Board Frame with Engraved Runes
        // Positioned with clean vertical separation below the 64 tiles to prevent any coplanar Z-fighting
        const darkFrameMat = new THREE.MeshStandardMaterial({
            color: 0x22252A,
            roughness: 0.36,
            metalness: 0.22
        });

        // Sloped Bevel Base Pyramid Frustum around the 16x16 playing grid
        const bevelBaseGeo = new THREE.CylinderGeometry(11.65, 12.65, 0.34, 4);
        bevelBaseGeo.rotateY(Math.PI / 4);
        const bevelBase = new THREE.Mesh(bevelBaseGeo, darkFrameMat);
        bevelBase.position.y = -0.22;
        bevelBase.receiveShadow = true;
        boardGroup.add(bevelBase);

        // Crisp White Inner Perimeter Accent Collar (top at Y = -0.02, safely below square tops at Y = 0.0)
        const whiteRimMat = new THREE.MeshStandardMaterial({
            color: 0xEAECEF,
            roughness: 0.3,
            metalness: 0.05
        });
        const innerRim = new THREE.Mesh(new THREE.BoxGeometry(16.28, 0.28, 16.28), whiteRimMat);
        innerRim.position.y = -0.16;
        innerRim.receiveShadow = true;
        boardGroup.add(innerRim);

        // Engraved Rune & Coordinate Strips along all 4 Beveled Borders (Image 1)
        const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const fileStripTex = WC.textures.rune.createEngravedRuneStripTexture(files);
        const rankStripTex = WC.textures.rune.createEngravedRuneStripTexture(ranks);

        const fileStripMat = new THREE.MeshStandardMaterial({
            map: fileStripTex,
            roughness: 0.4,
            metalness: 0.2,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });
        const rankStripMat = new THREE.MeshStandardMaterial({
            map: rankStripTex,
            roughness: 0.4,
            metalness: 0.2,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });

        const stripGeom = new THREE.PlaneGeometry(16.0, 0.92);
        const borderDist = 8.62;

        // South Bevel Strip (A-H)
        const stripS = new THREE.Mesh(stripGeom, fileStripMat);
        stripS.position.set(0, -0.09, borderDist);
        stripS.rotation.x = -Math.PI / 2 + 0.22;
        boardGroup.add(stripS);

        // North Bevel Strip (A-H)
        const stripN = new THREE.Mesh(stripGeom, fileStripMat);
        stripN.position.set(0, -0.09, -borderDist);
        stripN.rotation.x = -Math.PI / 2 - 0.22;
        stripN.rotation.z = Math.PI;
        boardGroup.add(stripN);

        // West Bevel Strip (1-8)
        const stripW = new THREE.Mesh(stripGeom, rankStripMat);
        stripW.position.set(-borderDist, -0.09, 0);
        stripW.rotation.order = 'YXZ';
        stripW.rotation.y = -Math.PI / 2;
        stripW.rotation.x = -Math.PI / 2 + 0.22;
        boardGroup.add(stripW);

        // East Bevel Strip (1-8)
        const stripE = new THREE.Mesh(stripGeom, rankStripMat);
        stripE.position.set(borderDist, -0.09, 0);
        stripE.rotation.order = 'YXZ';
        stripE.rotation.y = Math.PI / 2;
        stripE.rotation.x = -Math.PI / 2 + 0.22;
        boardGroup.add(stripE);

        // 2. Recessed Mortar Grout Bed & Clean Grout Joint Lines Identifying All 64 Squares
        // Recessed 1.5cm below the tile tops so it never Z-fights with the 64 squares
        const mortarBedMat = new THREE.MeshStandardMaterial({
            color: 0x1F2226,
            roughness: 0.85,
            metalness: 0.05
        });
        const mortarBed = new THREE.Mesh(new THREE.BoxGeometry(16.04, 0.26, 16.04), mortarBedMat);
        mortarBed.position.y = -0.15;
        mortarBed.receiveShadow = true;
        boardGroup.add(mortarBed);

        const gridLineMat = new THREE.MeshStandardMaterial({
            color: 0x545962,
            roughness: 0.55,
            metalness: 0.12
        });

        const gridSpan = 8 * WC.constants.SQUARE_SIZE;
        const lineThickness = 0.044;
        const lineHeight = 0.02;

        for (let i = 0; i <= 8; i++) {
            const offset = (i - 4) * WC.constants.SQUARE_SIZE;

            const vLine = new THREE.Mesh(
                new THREE.BoxGeometry(lineThickness, lineHeight, gridSpan + lineThickness),
                gridLineMat
            );
            // Top of grout line sits at -0.004, just below the 0.000 surface of the stone pavers
            vLine.position.set(offset, -0.014, 0);
            vLine.receiveShadow = true;
            boardGroup.add(vLine);

            const hLine = new THREE.Mesh(
                new THREE.BoxGeometry(gridSpan + lineThickness, lineHeight, lineThickness),
                gridLineMat
            );
            hLine.position.set(0, -0.014, offset);
            hLine.receiveShadow = true;
            boardGroup.add(hLine);
        }

        // 3. 64 Individual Pickable Veined Carrara Marble & Honed Slate Paver Squares
        // Top surface sits cleanly at Y = 0.000 with zero overlapping coplanar geometry
        const tileGeo = new THREE.BoxGeometry(WC.constants.SQUARE_SIZE * 0.974, 0.24, WC.constants.SQUARE_SIZE * 0.974);

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const isLight = (file + rank) % 2 !== 0;
                const algebraic = WC.coords.indexToAlgebraic(file, rank);
                const pos = WC.coords.algebraicToWorld(algebraic);

                const baseMat = isLight ? WC.state.materials.lightSquareMat : WC.state.materials.darkSquareMat;
                const tileMesh = new THREE.Mesh(tileGeo, baseMat);
                tileMesh.position.set(pos.x, -0.12, pos.z);
                tileMesh.rotation.y = ((file * 3 + rank) % 4) * (Math.PI / 2);
                tileMesh.receiveShadow = true;
                tileMesh.userData = {
                    type: 'square',
                    square: algebraic,
                    isLight: isLight
                };

                WC.state.squareMeshes[algebraic] = tileMesh;
                boardGroup.add(tileMesh);
            }
        }

        WC.state.scene.add(boardGroup);
    }

    WC.board = { buildChessboard };
})(window.WizardChess = window.WizardChess || {});
