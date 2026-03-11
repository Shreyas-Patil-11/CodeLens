import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with a beautiful dark theme
mermaid.initialize({ 
    startOnLoad: true, 
    theme: 'dark', 
    securityLevel: 'loose' 
});

export default function Mermaid({ chart }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && chart) {
            // Generate a unique ID for the SVG
            const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
            
            mermaid.render(id, chart)
                .then((result) => {
                    containerRef.current.innerHTML = result.svg;
                })
                .catch((e) => {
                    console.error("Mermaid rendering failed:", e);
                    containerRef.current.innerHTML = `<p class="text-red-500 text-sm">Failed to render diagram.</p>`;
                });
        }
    }, [chart]);

    return (
        <div 
            ref={containerRef} 
            className="mermaid-container flex justify-center bg-gray-900 rounded-lg p-4 my-4 border border-gray-700 shadow-inner overflow-x-auto" 
        />
    );
}