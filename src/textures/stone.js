(function (WC) {
    'use strict';

    // High-Resolution Procedural Stone & Weathered Granite Generator for Surrounding Garden & Curb
    function createStoneMaterialMaps(options) {
        const size = 512;
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = size;
        diffCanvas.height = size;
        const ctx = diffCanvas.getContext('2d');

        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = size;
        bumpCanvas.height = size;
        const bCtx = bumpCanvas.getContext('2d');

        ctx.fillStyle = options.baseColor;
        ctx.fillRect(0, 0, size, size);

        bCtx.fillStyle = '#808080';
        bCtx.fillRect(0, 0, size, size);

        // Organic mineral clouding
        for (let i = 0; i < 90; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 24 + Math.random() * 85;
            const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
            grad.addColorStop(0, i % 2 === 0 ? options.speck1 : options.speck2);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = 0.04 + Math.random() * 0.06;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Linear veining for weathered garden walls
        if (options.veined) {
            for (let v = 0; v < 18; v++) {
                ctx.beginPath();
                bCtx.beginPath();
                let vy = Math.random() * size;
                ctx.moveTo(0, vy);
                bCtx.moveTo(0, vy);
                for (let vx = 0; vx <= size; vx += 32) {
                    vy += (Math.random() - 0.5) * 14;
                    ctx.lineTo(vx, vy);
                    bCtx.lineTo(vx, vy);
                }
                ctx.strokeStyle = v % 3 === 0 ? options.speck1 : options.speck2;
                ctx.lineWidth = 1.2 + Math.random() * 4.0;
                ctx.globalAlpha = 0.10 + Math.random() * 0.12;
                ctx.stroke();

                bCtx.strokeStyle = '#686868';
                bCtx.lineWidth = 1 + Math.random() * 2.0;
                bCtx.globalAlpha = 0.22;
                bCtx.stroke();
            }
        }

        // Moderate mineral grain for garden curb & walls
        const grainCount = options.lowNoise ? 800 : 3800;
        for (let i = 0; i < grainCount; i++) {
            const sx = Math.random() * size;
            const sy = Math.random() * size;
            const s = 1.5 + Math.random() * 2.5;
            ctx.fillStyle = Math.random() > 0.45 ? options.speck1 : options.speck2;
            ctx.globalAlpha = 0.05 + Math.random() * 0.09;
            ctx.fillRect(sx, sy, s, s);

            bCtx.fillStyle = Math.random() > 0.5 ? '#949494' : '#6c6c6c';
            bCtx.globalAlpha = 0.12;
            bCtx.fillRect(sx, sy, s, s);
        }

        // Optional moss/weathering staining for outdoor wall or curb
        if (options.weatheredWall) {
            for (let w = 0; w < 45; w++) {
                const wx = Math.random() * size;
                const grad = ctx.createLinearGradient(wx, 0, wx, size);
                grad.addColorStop(0, 'rgba(34, 42, 28, 0.32)');
                grad.addColorStop(0.5, 'rgba(55, 65, 44, 0.14)');
                grad.addColorStop(1, 'rgba(28, 45, 22, 0.48)');
                ctx.globalAlpha = 0.45;
                ctx.fillStyle = grad;
                ctx.fillRect(wx, 0, 6 + Math.random() * 22, size);
            }
        }

        if (options.tileBorder) {
            ctx.globalAlpha = 0.20;
            ctx.strokeStyle = '#1c1e1b';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, size - 6, size - 6);
        }

        const maxAniso = WC.state.renderer ? WC.state.renderer.capabilities.getMaxAnisotropy() : 8;
        const diffTex = new THREE.CanvasTexture(diffCanvas);
        diffTex.wrapS = THREE.RepeatWrapping;
        diffTex.wrapT = THREE.RepeatWrapping;
        diffTex.anisotropy = maxAniso;

        const bumpTex = new THREE.CanvasTexture(bumpCanvas);
        bumpTex.wrapS = THREE.RepeatWrapping;
        bumpTex.wrapT = THREE.RepeatWrapping;
        bumpTex.anisotropy = maxAniso;

        return { map: diffTex, bumpMap: bumpTex };
    }

    WC.textures.stone = { createStoneMaterialMaps };
})(window.WizardChess = window.WizardChess || {});
