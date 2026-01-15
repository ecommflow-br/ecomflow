import React, { useEffect } from 'react';

const SecurityShield = () => {
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();

        // 1. Disable Right Click
        document.addEventListener('contextmenu', preventDefault);

        // 2. Disable Keyboard Shortcuts
        const handleKeyDown = (e) => {
            // Block F12
            if (e.key === 'F12') {
                e.preventDefault();
            }

            // Block Ctrl+Combinations
            if (e.ctrlKey) {
                // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
                if (e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                    e.preventDefault();
                }
                // Ctrl+U (Source), Ctrl+S (Save), Ctrl+P (Print)
                if (e.key === 'u' || e.key === 's' || e.key === 'p') {
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // 3. PrintScreen Detection (Deterrent)
        const handleKeyUp = (e) => {
            if (e.key === 'PrintScreen') {
                // Try to clear clipboard or show alert
                // Note: Clearing clipboard programmatically without explicit user interaction is restricted in modern browsers,
                // but we can show a warning overlay or alert.
                alert('Proteção de Conteúdo: Capturas de tela são restritas neste ambiente.');

                // Temporary blur effect to ruin the screenshot if the alert doesn't block it fast enough
                document.body.style.filter = 'blur(20px)';
                setTimeout(() => {
                    document.body.style.filter = 'none';
                }, 1000);
            }
        }
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('contextmenu', preventDefault);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return null; // Invisible component
};

export default SecurityShield;
