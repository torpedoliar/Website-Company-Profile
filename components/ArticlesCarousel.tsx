"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    imagePath?: string | null;
    createdAt: string;
    category?: {
        name: string;
        color: string;
    };
}

interface ArticlesCarouselProps {
    title?: string;
    subtitle?: string;
    limit?: number;
}

export default function ArticlesCarousel({
    title = "Aktivitas Perusahaan",
    subtitle,
    limit = 6,
}: ArticlesCarouselProps) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchArticles();
    }, [limit]);

    const fetchArticles = async () => {
        try {
            const res = await fetch(`/api/announcements?limit=${limit}&published=true`);
            if (res.ok) {
                const data = await res.json();
                // Handle different response formats
                const articleData = data.announcements || data;
                // Ensure we always have an array
                setArticles(Array.isArray(articleData) ? articleData : []);
            }
        } catch (error) {
            console.error("Failed to fetch articles:", error);
            setArticles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const visibleCount = 3; // Number of visible cards
    const maxIndex = Math.max(0, articles.length - visibleCount);

    const nextSlide = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    if (isLoading) {
        return (
            <section style={{ backgroundColor: '#000', padding: '80px 0' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: '400px',
                                    backgroundColor: '#1a1a1a',
                                    animation: 'pulse 2s infinite',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (articles.length === 0) {
        return null;
    }

    return (
        <section style={{
            backgroundColor: '#000',
            padding: '80px 0',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 24px',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: '48px',
                }}>
                    <div>
                        {subtitle && (
                            <p style={{
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                            }}>
                                {subtitle}
                            </p>
                        )}
                        <h2 style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: 'clamp(24px, 4vw, 36px)',
                            fontWeight: 700,
                            color: '#fff',
                        }}>
                            {title}
                        </h2>
                    </div>

                    {/* Navigation */}
                    {articles.length > visibleCount && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={prevSlide}
                                disabled={currentIndex === 0}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    border: '1px solid #333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: currentIndex === 0 ? '#404040' : '#fff',
                                    backgroundColor: 'transparent',
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextSlide}
                                disabled={currentIndex >= maxIndex}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    border: '1px solid #333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: currentIndex >= maxIndex ? '#404040' : '#fff',
                                    backgroundColor: 'transparent',
                                    cursor: currentIndex >= maxIndex ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Articles Grid */}
                <div
                    ref={containerRef}
                    style={{
                        display: 'flex',
                        gap: '24px',
                        transform: `translateX(-${currentIndex * (100 / visibleCount + 2)}%)`,
                        transition: 'transform 0.5s ease',
                    }}
                >
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/${article.slug}`}
                            style={{
                                flex: `0 0 calc(${100 / visibleCount}% - 16px)`,
                                display: 'block',
                                textDecoration: 'none',
                                transition: 'transform 0.3s',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #1a1a1a',
                                overflow: 'hidden',
                                height: '100%',
                            }}>
                                {/* Image */}
                                <div style={{
                                    position: 'relative',
                                    height: '200px',
                                    backgroundColor: '#1a1a1a',
                                }}>
                                    {article.imagePath ? (
                                        <Image
                                            src={article.imagePath}
                                            alt={article.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#404040',
                                        }}>
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ padding: '24px' }}>
                                    {article.category && (
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            backgroundColor: article.category.color,
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            letterSpacing: '0.1em',
                                            marginBottom: '12px',
                                        }}>
                                            {article.category.name}
                                        </span>
                                    )}

                                    <h3 style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#fff',
                                        marginBottom: '8px',
                                        lineHeight: 1.4,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>
                                        {article.title}
                                    </h3>

                                    {article.excerpt && (
                                        <p style={{
                                            color: '#71717a',
                                            fontSize: '13px',
                                            lineHeight: 1.6,
                                            marginBottom: '16px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {article.excerpt}
                                        </p>
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#dc2626',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}>
                                        Baca Selengkapnya
                                        <FiArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Dots Indicator */}
                {articles.length > visibleCount && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '32px',
                    }}>
                        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                style={{
                                    width: index === currentIndex ? '32px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: index === currentIndex ? '#dc2626' : '#404040',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
