"use client";

import Link from "next/link";
import Image from "next/image";

interface PinArticleSectionProps {
    title?: string;
    subtitle?: string;
    content?: string;
    imagePath?: string;
    buttonText?: string;
    buttonUrl?: string;
    pinnedArticle?: {
        title: string;
        slug: string;
        excerpt?: string;
        imagePath?: string;
    };
}

export default function PinArticleSection({
    title,
    subtitle,
    content,
    imagePath,
    buttonText = "Selengkapnya",
    buttonUrl,
    pinnedArticle,
}: PinArticleSectionProps) {
    // Use pinned article data if available
    const displayTitle = pinnedArticle?.title || title || "Kapal Api Global";
    const displayContent = pinnedArticle?.excerpt || content || "didistribusikan lebih dari 100 produk ke 68 negara.";
    const displayImage = pinnedArticle?.imagePath || imagePath;
    const displayUrl = pinnedArticle ? `/${pinnedArticle.slug}` : buttonUrl || "#";

    return (
        <section style={{
            position: 'relative',
            padding: '0',
            backgroundColor: '#000',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 24px',
                transform: 'translateY(-60px)',
            }}>
                <div style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    minHeight: '200px',
                }}>
                    {/* Background Image */}
                    {displayImage && (
                        <Image
                            src={displayImage}
                            alt={displayTitle}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    )}

                    {/* Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)',
                    }} />

                    {/* Content */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: '48px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}>
                        {subtitle && (
                            <p style={{
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                marginBottom: '12px',
                            }}>
                                {subtitle}
                            </p>
                        )}

                        <h2 style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: 'clamp(20px, 3vw, 28px)',
                            fontWeight: 700,
                            color: '#fff',
                            marginBottom: '16px',
                            maxWidth: '600px',
                        }}>
                            {displayTitle}
                        </h2>

                        <p style={{
                            color: '#a1a1aa',
                            fontSize: '16px',
                            lineHeight: 1.6,
                            marginBottom: '24px',
                            maxWidth: '500px',
                        }}>
                            {displayContent}
                        </p>

                        <Link
                            href={displayUrl}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 28px',
                                backgroundColor: '#dc2626',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textDecoration: 'none',
                                transition: 'all 0.3s',
                            }}
                        >
                            {buttonText}
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
