(function (WC) {
    'use strict';

    // Procedural Earthy Soil, Gravel, Moss & Fallen Pine Needle Ground Texture (Reference Image 2)
    function createGardenSoilMaps() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = size;
        bumpCanvas.height = size;
        const bCtx = bumpCanvas.getContext('2d');

        ctx.fillStyle = '#7E6D52';
        ctx.fillRect(0, 0, size, size);
        bCtx.fillStyle = '#808080';
        bCtx.fillRect(0, 0, size, size);

        // Organic soil, damp earth & moss patches
        const patchColors = ['#66563E', '#8F7D60', '#4E5B38', '#5E4E36', '#9C8A6D'];
        for (let i = 0; i < 140; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 18 + Math.random() * 65;
            const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
            grad.addColorStop(0, patchColors[i % patchColors.length]);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Fine pebbles & coarse sand grains
        for (let i = 0; i < 9000; i++) {
            const px = Math.random() * size;
            const py = Math.random() * size;
            const pr = 1 + Math.random() * 2.8;
            ctx.fillStyle = Math.random() > 0.5 ? '#A8987C' : '#4E412D';
            ctx.globalAlpha = 0.22;
            ctx.fillRect(px, py, pr, pr);

            bCtx.fillStyle = Math.random() > 0.5 ? '#B0B0B0' : '#484848';
            bCtx.globalAlpha = 0.35;
            bCtx.fillRect(px, py, pr, pr);
        }

        // Fallen dry leaves & pine needles scattered around the curb (Image 2 foreground/right)
        const needleColors = ['#9E7B46', '#B38E52', '#7A5C32', '#64703B'];
        for (let n = 0; n < 450; n++) {
            const nx = Math.random() * size;
            const ny = Math.random() * size;
            const len = 5 + Math.random() * 11;
            const ang = Math.random() * Math.PI * 2;
            ctx.strokeStyle = needleColors[n % needleColors.length];
            ctx.lineWidth = 1.4;
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(nx + Math.cos(ang) * len, ny + Math.sin(ang) * len);
            ctx.stroke();
        }

        const maxAniso = WC.state.renderer ? WC.state.renderer.capabilities.getMaxAnisotropy() : 8;
        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(10, 10);
        map.anisotropy = maxAniso;

        const bumpMap = new THREE.CanvasTexture(bumpCanvas);
        bumpMap.wrapS = THREE.RepeatWrapping;
        bumpMap.wrapT = THREE.RepeatWrapping;
        bumpMap.repeat.set(10, 10);
        bumpMap.anisotropy = maxAniso;

        return { map, bumpMap };
    }

    WC.textures.soil = { createGardenSoilMaps };
})(window.WizardChess = window.WizardChess || {});
