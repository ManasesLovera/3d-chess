(function (WC) {
    'use strict';

    function initThreeScene() {
        const state = WC.state;
        const container = document.getElementById('canvas-container');

        state.scene = new THREE.Scene();
        state.scene.background = new THREE.Color(0x3D4E35);
        state.scene.fog = new THREE.FogExp2(0x3D4E35, 0.0085);

        state.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 160);
        WC.camera.applyResponsiveCameraFraming(true);

        state.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            logarithmicDepthBuffer: false
        });
        state.renderer.setSize(window.innerWidth, window.innerHeight);
        state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        state.renderer.shadowMap.enabled = true;
        state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        state.renderer.toneMappingExposure = 1.08;
        container.appendChild(state.renderer.domElement);

        state.raycaster = new THREE.Raycaster();
        state.mouse = new THREE.Vector2();

        initSharedMaterials();
        setupGardenLighting();
        WC.garden.buildCourtyard();
        WC.board.buildChessboard();
        WC.pieces.syncWithBoard();
        WC.input.setupInputListeners();
    }

    function initSharedMaterials() {
        const state = WC.state;
        const maxAniso = state.renderer ? state.renderer.capabilities.getMaxAnisotropy() : 16;

        // Reference Image 1 & 2: Pure Monochrome Matte-Satin White Staunton Pieces
        state.materials.whitePieceMat = new THREE.MeshStandardMaterial({
            color: 0xF5F6F8,
            roughness: 0.27,
            metalness: 0.04
        });

        // Reference Image 1 & 2: Pure Monochrome Satin Charcoal-Obsidian Staunton Pieces
        state.materials.blackPieceMat = new THREE.MeshStandardMaterial({
            color: 0x1A1E24,
            roughness: 0.24,
            metalness: 0.14
        });

        // Monochrome matching accents so pieces remain 100% cohesive as in Image 1
        state.materials.goldTrimMat = state.materials.whitePieceMat;
        state.materials.obsidianVeinMat = state.materials.blackPieceMat;

        // Board Paver Tiles: Clean, Temporally Stable Carrara Marble & Honed Charcoal Slate
        // (No noisy bump map on tiles so dark squares never shimmer, lag, or blur during camera orbit)
        const lightSquareTex = WC.textures.board.createCleanSquareTexture(true, maxAniso);
        const darkSquareTex = WC.textures.board.createCleanSquareTexture(false, maxAniso);

        state.materials.lightSquareMat = new THREE.MeshStandardMaterial({
            map: lightSquareTex,
            color: 0xFAF8F4,
            roughness: 0.30,
            metalness: 0.03
        });

        state.materials.darkSquareMat = new THREE.MeshStandardMaterial({
            map: darkSquareTex,
            color: 0x34383F,
            roughness: 0.32,
            metalness: 0.06
        });
    }

    function setupGardenLighting() {
        const scene = WC.state.scene;

        // Natural Outdoor Sky & Lush Foliage Bounce Hemisphere Light
        const hemiLight = new THREE.HemisphereLight(0xF6FAFF, 0x3A4B2C, 0.92);
        scene.add(hemiLight);

        // Warm Natural Golden Sunlight casting crisp outdoor garden shadows
        const sunLight = new THREE.DirectionalLight(0xFFF6E0, 1.45);
        sunLight.position.set(19, 35, 22);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 8;
        sunLight.shadow.camera.far = 75;
        const d = 17.5;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0005;
        sunLight.shadow.normalBias = 0.02;
        scene.add(sunLight);

        // Soft cool skylight fill from opposite side so black pieces show rich sculptural curvature
        const fillLight = new THREE.DirectionalLight(0xCBE3FF, 0.52);
        fillLight.position.set(-18, 16, -15);
        scene.add(fillLight);

        // Subtle warm garden bounce light from the sunlit stone patio
        const bounceLight = new THREE.DirectionalLight(0xE8D8B8, 0.25);
        bounceLight.position.set(12, 5, -14);
        scene.add(bounceLight);
    }

    WC.scene = { init: initThreeScene };
})(window.WizardChess = window.WizardChess || {});
