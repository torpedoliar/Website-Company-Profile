"use client";

import Image from "next/image";
import Link from "next/link";

interface TextImageSectionProps {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonUrl?: string;
    imagePath?: string;
    imagePath2?: string;
    layout?: 'left' | 'right';
    backgroundColor?: string;
    textColor?: string;
}

export default function TextImageSection({
    title = "Nikmati Perjalanan Kami",
    subtitle,
    content,
    buttonText = "Selengkapnya",
    buttonUrl = "#",
    imagePath,
    imagePath2,
    layout = 'left',
    backgroundColor = '#dc2626',
    textColor = '#fff',
}: TextImageSectionProps) {
    return (
        <section style={{
            backgroundColor: '#000',
            position: 'relative',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: layout === 'left' ? '1fr 2fr' : '2fr 1fr',
                minHeight: '400px',
            }}>
                {/* Text Box */}
                <div
                    style={{
                        backgroundColor,
                        padding: '48px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        order: layout === 'left' ? 0 : 1,
                    }}
                >
                    {subtitle && (
                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
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
                        fontSize: 'clamp(24px, 3vw, 36px)',
                        fontWeight: 700,
                        color: textColor,
                        marginBottom: '16px',
                        lineHeight: 1.2,
                    }}>
                        {title}
                    </h2>

                    {content && (
                        <p style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '14px',
                            lineHeight: 1.7,
                            marginBottom: '24px',
                        }}>
                            {content}
                        </p>
                    )}

                    <Link
                        href={buttonUrl}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: textColor,
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            borderBottom: '2px solid rgba(255,255,255,0.3)',
                            paddingBottom: '4px',
                            width: 'fit-content',
                            transition: 'all 0.3s',
                        }}
                    >
                        {buttonText}
                        <span>→</span>
                    </Link>
                </div>

                {/* Images */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: imagePath2 ? '1fr 1fr' : '1fr',
                    order: layout === 'left' ? 1 : 0,
                }}>
                    {imagePath && (
                        <div style={{ position: 'relative', minHeight: '300px' }}>
                            <Image
                                src={imagePath}
                                alt={title || "Section image"}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}
                    {imagePath2 && (
                        <div style={{ position: 'relative', minHeight: '300px' }}>
                            <Image
                                src={imagePath2}
                                alt={title || "Section image 2"}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}
                    {!imagePath && !imagePath2 && (
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '300px',
                        }}>
                            <span style={{ color: '#404040' }}>No Image</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive styles */}
            <style jsx>{`
                @media (max-width: 768px) {
                    section > div:first-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
