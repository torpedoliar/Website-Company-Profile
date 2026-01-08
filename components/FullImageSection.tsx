"use client";

import Image from "next/image";

interface FullImageSectionProps {
    title?: string;
    subtitle?: string;
    imagePath?: string;
    overlayOpacity?: number;
    textAlign?: 'left' | 'center' | 'right';
}

export default function FullImageSection({
    title = "Corporate Shared Value",
    subtitle,
    imagePath,
    overlayOpacity = 0.5,
    textAlign = 'right',
}: FullImageSectionProps) {
    return (
        <section style={{
            position: 'relative',
            minHeight: '500px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#000',
        }}>
            {/* Background Image */}
            {imagePath && (
                <Image
                    src={imagePath}
                    alt={title || "Section background"}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            )}

            {/* Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to ${textAlign === 'right' ? 'right' : 'left'}, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,${overlayOpacity * 0.6}) 100%)`,
            }} />

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '64px 24px',
                width: '100%',
                display: 'flex',
                justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start',
            }}>
                <div style={{
                    maxWidth: '500px',
                    textAlign: textAlign,
                }}>
                    {subtitle && (
                        <p style={{
                            color: '#dc2626',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '16px',
                        }}>
                            {subtitle}
                        </p>
                    )}

                    <h2 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 'clamp(32px, 5vw, 56px)',
                        fontWeight: 700,
                        color: '#fff',
                        lineHeight: 1.1,
                    }}>
                        {title?.split(' ').map((word, index) => (
                            <span key={index} style={{ display: 'block' }}>
                                {word}
                            </span>
                        ))}
                    </h2>
                </div>
            </div>
        </section>
    );
}
