(function (WC) {
    'use strict';

    function spawnShatterDebris(worldPos, pieceColor) {
        const state = WC.state;
        const { whitePieceMat, blackPieceMat, goldTrimMat, obsidianVeinMat } = state.materials;
        const count = 26;
        const mat = (pieceColor === 'w' ? whitePieceMat : blackPieceMat).clone();
        mat.transparent = true;
        mat.opacity = 1.0;

        const accentMat = (pieceColor === 'w' ? goldTrimMat : obsidianVeinMat).clone();
        accentMat.transparent = true;
        accentMat.opacity = 1.0;

        for (let i = 0; i < count; i++) {
            const radius = 0.14 + Math.random() * 0.24;
            const shardGeo = new THREE.DodecahedronGeometry(radius, 0);
            // Scale unevenly for jagged stone/obsidian fracture look
            shardGeo.scale(
                0.6 + Math.random() * 0.9,
                0.5 + Math.random() * 1.1,
                0.6 + Math.random() * 0.9
            );

            const shardMesh = new THREE.Mesh(shardGeo, i % 4 === 0 ? accentMat : mat);
            shardMesh.position.set(
                worldPos.x + (Math.random() - 0.5) * 0.6,
                0.4 + Math.random() * 1.6,
                worldPos.z + (Math.random() - 0.5) * 0.6
            );
            shardMesh.castShadow = true;
            state.scene.add(shardMesh);

            const angle = Math.random() * Math.PI * 2;
            const speed = 2.2 + Math.random() * 5.2;
            state.activeDebris.push({
                mesh: shardMesh,
                vel: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    3.2 + Math.random() * 5.0,
                    Math.sin(angle) * speed
                ),
                rotVel: new THREE.Vector3(
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 12
                ),
                age: 0,
                maxAge: 1.55 + Math.random() * 0.5
            });
        }
    }

    function updateDebris(dt) {
        const state = WC.state;
        const activeDebris = state.activeDebris;

        for (let i = activeDebris.length - 1; i >= 0; i--) {
            const d = activeDebris[i];
            d.age += dt;

            // Gravity & velocity integration
            d.vel.y -= 15.5 * dt;
            d.mesh.position.addScaledVector(d.vel, dt);

            // Bounce off cathedral board surface
            if (d.mesh.position.y < 0.08) {
                d.mesh.position.y = 0.08;
                d.vel.y *= -0.42;
                d.vel.x *= 0.72;
                d.vel.z *= 0.72;
            }

            d.mesh.rotation.x += d.rotVel.x * dt;
            d.mesh.rotation.y += d.rotVel.y * dt;
            d.mesh.rotation.z += d.rotVel.z * dt;

            // Fade out & shrink
            const lifeRatio = d.age / d.maxAge;
            if (lifeRatio > 0.55) {
                const fade = 1 - (lifeRatio - 0.55) / 0.45;
                d.mesh.scale.setScalar(Math.max(0.01, fade));
            }

            if (d.age >= d.maxAge) {
                state.scene.remove(d.mesh);
                d.mesh.geometry.dispose();
                activeDebris.splice(i, 1);
            }
        }
    }

    WC.effects = { spawnShatterDebris, updateDebris };
})(window.WizardChess = window.WizardChess || {});
