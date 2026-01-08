"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ProductLogo {
    id: string;
    name: string;
    logoPath: string;
    linkUrl?: string | null;
}

interface ProductLogoSliderProps {
    logos: ProductLogo[];
}

export default function ProductLogoSlider({ logos }: ProductLogoSliderProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, [logos]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            setTimeout(checkScrollButtons, 300);
        }
    };

    if (logos.length === 0) {
        return null;
    }

    return (
        <section style={{
            backgroundColor: '#0a0a0a',
            borderTop: '1px solid #1a1a1a',
            borderBottom: '1px solid #1a1a1a',
            padding: '24px 0',
            position: 'relative',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 24px',
                position: 'relative',
            }}>
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        style={{
                            position: 'absolute',
                            left: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid #333',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.borderColor = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
                            e.currentTarget.style.borderColor = '#333';
                        }}
                    >
                        <FiChevronLeft size={20} />
                    </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        style={{
                            position: 'absolute',
                            right: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid #333',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.borderColor = '#dc2626';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
                            e.currentTarget.style.borderColor = '#333';
                        }}
                    >
                        <FiChevronRight size={20} />
                    </button>
                )}

                {/* Logos Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '48px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        padding: '16px 48px',
                    }}
                >
                    {logos.map((logo) => (
                        <div key={logo.id} style={{ flexShrink: 0 }}>
                            {logo.linkUrl ? (
                                <Link
                                    href={logo.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'block',
                                        opacity: 0.7,
                                        transition: 'opacity 0.3s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                                    title={logo.name}
                                >
                                    <Image
                                        src={logo.logoPath}
                                        alt={logo.name}
                                        width={80}
                                        height={40}
                                        style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                    />
                                </Link>
                            ) : (
                                <div
                                    style={{
                                        opacity: 0.7,
                                        transition: 'opacity 0.3s',
                                    }}
                                    title={logo.name}
                                >
                                    <Image
                                        src={logo.logoPath}
                                        alt={logo.name}
                                        width={80}
                                        height={40}
                                        style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
