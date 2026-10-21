(function (WC) {
    'use strict';

    /***********************************************************************
     * 5. BUILD 64-SQUARE BOARD WITH ARCHITECTURAL COORDINATE BEVEL
     ***********************************************************************/
    function createEngravedRuneStripTexture(symbols) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 1024, 128);

        // Matte architectural dark slate border finish
        ctx.fillStyle = '#23262B';
        ctx.fillRect(0, 0, 1024, 128);

        // Top and bottom subtle milled architectural channels
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(1024, 18);
        ctx.moveTo(0, 110);
        ctx.lineTo(1024, 110);
        ctx.stroke();

        const step = 1024 / 8;

        for (let i = 0; i < 8; i++) {
            const cx = step * (i + 0.5);

            // Crisp vertical square-boundary tick marks
            if (i > 0) {
                const tx = step * i;
                ctx.strokeStyle = 'rgba(12, 14, 18, 0.85)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(tx, 34);
                ctx.lineTo(tx, 94);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(190, 198, 208, 0.25)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(tx + 1.5, 34);
                ctx.lineTo(tx + 1.5, 94);
                ctx.stroke();
            }

            // Precision geometric diamond indices flanking the coordinate
            [-40, 40].forEach(offset => {
                ctx.save();
                ctx.translate(cx + offset, 64);
                ctx.rotate(Math.PI / 4);
                ctx.fillStyle = 'rgba(175, 182, 194, 0.35)';
                ctx.fillRect(-3.5, -3.5, 7, 7);
                ctx.restore();
            });

            // Central Algebraic Coordinate (A-H or 1-8) in clean Roboto Mono
            ctx.font = '600 40px "Roboto Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Recessed engraving shadow
            ctx.fillStyle = 'rgba(8, 10, 12, 0.9)';
            ctx.fillText(symbols[i], cx, 66);

            // Crisp architectural stone inlay fill
            ctx.fillStyle = 'rgba(218, 222, 228, 0.82)';
            ctx.fillText(symbols[i], cx, 64);
        }

        const maxAniso = WC.state.renderer ? WC.state.renderer.capabilities.getMaxAnisotropy() : 16;
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = maxAniso;
        return tex;
    }

    WC.textures.rune = { createEngravedRuneStripTexture };
})(window.WizardChess = window.WizardChess || {});
