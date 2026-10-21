(function (WC) {
    'use strict';

    // Computes portrait distance multiplier & vertical framing offset so the 8x8 board + curb never clip on mobile phones
    function getViewportCameraFraming() {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        const aspect = w / h;
        // Scale radius smoothly when aspect < 1.15 so horizontal FOV always encompasses the full 20.4-unit stone curb
        const aspectScale = Math.max(1.0, 1.12 / Math.min(1.12, aspect * 1.05));
        // Cap maximum pullback so we stay inside the garden hedges and fog bounds
        const clampedScale = Math.min(aspectScale, 1.88);
        // Slightly shift lookAt target upward on tall portrait screens so the board centers below the 2-row top bar
        const lookAtY = aspect < 0.85 ? 0.95 : 0.35;
        return {
            scale: clampedScale,
            minRadius: 11.5 * clampedScale,
            maxRadius: Math.min(48.0, 36.0 * clampedScale),
            lookAtY: lookAtY
        };
    }

    function applyResponsiveCameraFraming(immediate = false) {
        const state = WC.state;
        if (!state.camera) return;
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        const aspect = w / h;

        // Widening vertical FOV slightly on ultra-narrow portrait screens keeps perspective natural without excessive distance
        state.camera.fov = aspect < 0.85 ? 45 : 40;
        state.camera.aspect = aspect;
        state.camera.updateProjectionMatrix();

        const framing = getViewportCameraFraming();
        state.camState.targetRadius = Math.max(
            framing.minRadius,
            Math.min(framing.maxRadius, state.camState.baseRadius * framing.scale)
        );
        state.camState.targetLookAtY = framing.lookAtY;

        if (immediate) {
            state.camState.radius = state.camState.targetRadius;
            state.camState.lookAt.y = state.camState.targetLookAtY;
        }
    }

    function updateCamera() {
        const state = WC.state;
        const camState = state.camState;

        // Smoothly interpolate camera orbit & portrait aspect framing
        camState.theta += (camState.targetTheta - camState.theta) * 0.09;
        camState.phi += (camState.targetPhi - camState.phi) * 0.09;
        camState.radius += (camState.targetRadius - camState.radius) * 0.09;
        camState.lookAt.y += (camState.targetLookAtY - camState.lookAt.y) * 0.09;

        state.camera.position.x = camState.radius * Math.sin(camState.phi) * Math.sin(camState.theta);
        state.camera.position.y = camState.radius * Math.cos(camState.phi);
        state.camera.position.z = camState.radius * Math.sin(camState.phi) * Math.cos(camState.theta);
        state.camera.lookAt(camState.lookAt);
    }

    WC.camera = { getViewportCameraFraming, applyResponsiveCameraFraming, updateCamera };
})(window.WizardChess = window.WizardChess || {});
