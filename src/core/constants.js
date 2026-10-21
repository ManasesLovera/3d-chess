(function (WC) {
    'use strict';

    WC.constants = {
        SQUARE_SIZE: 2.0,
        BOARD_OFFSET: 3.5 * 2.0,

        CAMERA_PRESETS: [
            { name: 'Garden', theta: -1.18, phi: 1.04, radius: 23.0 },
            { name: 'White', theta: 0, phi: 0.92, radius: 22.8 },
            { name: 'Black', theta: Math.PI, phi: 0.92, radius: 22.8 },
            { name: 'Top', theta: 0, phi: 0.22, radius: 24.5 }
        ],

        AI_DIFFICULTY_LABELS: {
            easy: 'Easy',
            medium: 'Med',
            hard: 'Hard',
            expert: 'Expert'
        },

        AI_DIFFICULTIES: ['easy', 'medium', 'hard', 'expert']
    };
})(window.WizardChess = window.WizardChess || {});
