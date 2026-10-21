(function (WC) {
    'use strict';

    // Clean, Temporally Stable Honed Slate & Carrara Marble Square Texture Generator
    // (Zero high-frequency pixel noise or harsh bump maps to prevent mipmap blur and shimmering)
    function createCleanSquareTexture(isLight, maxAnisotropy = 16) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (isLight) {
            // Smooth Sunlit Honed Carrara White Marble
            ctx.fillStyle = '#F2EFE9';
            ctx.fillRect(0, 0, size, size);

            // Soft, large-scale mineral clouding
            for (let i = 0; i < 16; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 90 + Math.random() * 140;
                const grad = ctx.createRadialGradient(x, y, 8, x, y, r);
                grad.addColorStop(0, i % 2 === 0 ? 'rgba(222, 217, 208, 0.28)' : 'rgba(252, 250, 246, 0.32)');
                grad.addColorStop(1, 'rgba(242, 239, 233, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Smooth, natural linear Carrara marble veins (matches Reference Photo 2 white tiles)
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (let v = 0; v < 7; v++) {
                ctx.beginPath();
                let vy = (v + 0.5) * (size / 7) + (Math.random() - 0.5) * 35;
                ctx.moveTo(0, vy);
                for (let vx = 32; vx <= size; vx += 32) {
                    vy += (Math.random() - 0.5) * 14;
                    ctx.lineTo(vx, vy);
                }
                ctx.strokeStyle = v % 2 === 0 ? 'rgba(195, 190, 182, 0.30)' : 'rgba(210, 205, 196, 0.22)';
                ctx.lineWidth = 2.0 + Math.random() * 4.5;
                ctx.stroke();
            }

            // Subtle honed stone edge bevel highlight
            ctx.strokeStyle = 'rgba(180, 175, 166, 0.35)';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, size - 4, size - 4);
        } else {
            // Smooth, Deep Honed Charcoal / Obsidian Slate (Zero high-frequency speckles)
            const baseGrad = ctx.createLinearGradient(0, 0, size, size);
            baseGrad.addColorStop(0, '#2B2F35');
            baseGrad.addColorStop(0.5, '#25292E');
            baseGrad.addColorStop(1, '#2D3138');
            ctx.fillStyle = baseGrad;
            ctx.fillRect(0, 0, size, size);

            // Subtle, wide mineral tonal clouds for authentic honed slate depth
            for (let i = 0; i < 12; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 110 + Math.random() * 150;
                const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
                grad.addColorStop(0, i % 2 === 0 ? 'rgba(54, 59, 66, 0.22)' : 'rgba(26, 29, 34, 0.25)');
                grad.addColorStop(1, 'rgba(37, 41, 46, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Very faint, smooth slate bedding plane lines (no harsh contrast)
            for (let v = 0; v < 4; v++) {
                ctx.beginPath();
                let vy = Math.random() * size;
                ctx.moveTo(0, vy);
                for (let vx = 64; vx <= size; vx += 64) {
                    vy += (Math.random() - 0.5) * 12;
                    ctx.lineTo(vx, vy);
                }
                ctx.strokeStyle = 'rgba(62, 67, 75, 0.16)';
                ctx.lineWidth = 3 + Math.random() * 5;
                ctx.stroke();
            }

            // Crisp honed slate bevel border
            ctx.strokeStyle = 'rgba(18, 20, 24, 0.45)';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, size - 4, size - 4);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.anisotropy = maxAnisotropy;
        tex.needsUpdate = true;
        return tex;
    }

    WC.textures.board = { createCleanSquareTexture };
})(window.WizardChess = window.WizardChess || {});
