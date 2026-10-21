(function (WC) {
    'use strict';

    function animate() {
        requestAnimationFrame(animate);

        const state = WC.state;
        const now = performance.now();
        const dt = Math.min((now - state.prevTime) / 1000, 0.1);
        state.prevTime = now;
        const elapsedSec = now * 0.001;

        // 1. Smoothly interpolate camera orbit & portrait aspect framing
        WC.camera.updateCamera();

        // 2. Gentle breeze sway for outdoor garden sword-grass & flower stalks
        WC.garden.updateFoliage(elapsedSec);

        // 3. Procedural idle animations for all 32 pieces (subtle breathing & poise)
        WC.pieces.updateIdleAnimations(elapsedSec);

        // 4. Active piece moves & combat strike animations
        WC.animations.updateAnimations(dt);

        // 5. Shattered stone & obsidian debris physics
        WC.effects.updateDebris(dt);

        state.renderer.render(state.scene, state.camera);
    }

    function start() {
        animate();
    }

    WC.loop = { start };
})(window.WizardChess = window.WizardChess || {});
