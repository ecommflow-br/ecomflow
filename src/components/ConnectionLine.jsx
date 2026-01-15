import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ConnectionLine = ({ fromRef, toRef, zoom }) => {
    const [path, setPath] = useState('');

    useEffect(() => {
        let animationFrameId;

        const updatePath = () => {
            try {
                if (fromRef.current && toRef.current) {
                    const fromRect = fromRef.current.getBoundingClientRect();
                    const toRect = toRef.current.getBoundingClientRect();

                    if (fromRect.width === 0 || toRect.width === 0) {
                        animationFrameId = requestAnimationFrame(updatePath);
                        return;
                    }

                    // Calculate centers respecting the current scroll and zoom
                    // Note: getBoundingClientRect returns viewport coordinates.
                    // Since the SVG overlay is fixed/absolute to viewport or container,
                    // we might need to adjust based on context, but FlowCanvas uses 
                    // a fixed SVG overlay (pointer-events-none) so viewport coords are likely what we want if the SVG is fixed.
                    // Looking at FlowCanvas.jsx, the SVG is: <svg className="fixed inset-0 ...">
                    // So getBoundingClientRect (viewport coords) works perfectly for the path 'd'.

                    const startX = fromRect.left + fromRect.width / 2;
                    const startY = fromRect.top + fromRect.height / 2;
                    const endX = toRect.left + toRect.width / 2;
                    const endY = toRect.top + toRect.height / 2;

                    if (!Number.isFinite(startX) || !Number.isFinite(endX)) {
                        animationFrameId = requestAnimationFrame(updatePath);
                        return;
                    }

                    const controlY = startY + (endY - startY) / 2;
                    const newPath = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

                    setPath(prev => {
                        if (prev !== newPath) return newPath;
                        return prev;
                    });
                }
            } catch (error) {
                // Fail silently to avoid console spam during layout trashing
            }
            animationFrameId = requestAnimationFrame(updatePath);
        };

        // Start the loop
        updatePath();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [fromRef, toRef]); // Removed 'zoom' dependency to allow continuous update during zoom transitions if needed, or re-running on zoom change is handled by the rAF loop anyway.

    return (
        <motion.path
            d={path}
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth={3 * zoom}
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5 }}
        />
    );
};

export default ConnectionLine;
