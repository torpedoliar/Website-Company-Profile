"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiLink, FiFileText, FiUpload } from "react-icons/fi";

interface PageSection {
    id: string;
    pageSlug: string;
    sectionKey: string;
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    imagePath: string | null;
    imagePath2: string | null;
    backgroundColor: string | null;
    textColor: string | null;
    layout: string | null;
    order: number;
    isActive: boolean;
    pinnedAnnouncementId: string | null;
    pinnedAnnouncement?: {
        id: string;
        title: string;
        slug: string;
    } | null;
}

interface Announcement {
    id: string;
    title: string;
    slug: string;
}

const DEFAULT_SECTIONS = [
    { sectionKey: "pin_main", sectionType: "pin_article", label: "Pin Main Beranda" },
    { sectionKey: "secondary", sectionType: "text_image", label: "Secondary Article" },
    { sectionKey: "corporate", sectionType: "full_image", label: "Corporate Section" },
];

export default function HomepagePage() {
    const [sections, setSections] = useState<PageSection[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<PageSection | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sectionsRes, announcementsRes] = await Promise.all([
                fetch("/api/page-sections?page=beranda"),
                fetch("/api/announcements?limit=50"),
            ]);

            if (sectionsRes.ok) {
                const data = await sectionsRes.json();
                setSections(data);
            }

            if (announcementsRes.ok) {
                const data = await announcementsRes.json();
                setAnnouncements(data.announcements || data);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSection = async (sectionKey: string, sectionType: string) => {
        try {
            const res = await fetch("/api/page-sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pageSlug: "beranda",
                    sectionKey,
                    sectionType,
                    order: sections.length,
                }),
            });

            if (res.ok) {
                setMessage("Section berhasil dibuat!");
                fetchData();
            } else {
                setMessage("Gagal membuat section");
            }
        } catch (error) {
            console.error("Failed to create section:", error);
            setMessage("Terjadi kesalahan");
        }
    };

    const handleUpdateSection = async () => {
        if (!editingSection) return;

        try {
            const res = await fetch(`/api/page-sections/${editingSection.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingSection),
            });

            if (res.ok) {
                setMessage("Section berhasil diupdate!");
                setEditingSection(null);
                fetchData();
            } else {
                setMessage("Gagal update section");
            }
        } catch (error) {
            console.error("Failed to update section:", error);
            setMessage("Terjadi kesalahan");
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Yakin ingin menghapus section ini?")) return;

        try {
            const res = await fetch(`/api/page-sections/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage("Section berhasil dihapus!");
                fetchData();
            } else {
                setMessage("Gagal menghapus section");
            }
        } catch (error) {
            console.error("Failed to delete section:", error);
            setMessage("Terjadi kesalahan");
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "imagePath" | "imagePath2"
    ) => {
        const file = e.target.files?.[0];
        if (!file || !editingSection) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setEditingSection({ ...editingSection, [field]: data.url });
            }
        } catch (error) {
            console.error("Upload failed:", error);
        }

        e.target.value = "";
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        backgroundColor: "#0a0a0a",
        border: "1px solid #262626",
        color: "#fff",
        fontSize: "14px",
        outline: "none",
        borderRadius: "4px",
    };

    const labelStyle = {
        display: "block",
        color: "#737373",
        fontSize: "11px",
        fontWeight: 600 as const,
        letterSpacing: "0.1em",
        marginBottom: "8px",
        textTransform: "uppercase" as const,
    };

    if (isLoading) {
        return (
            <div style={{ padding: "32px", color: "#525252" }}>Loading...</div>
        );
    }

    return (
        <div style={{ padding: "32px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <p style={{
                    color: "#dc2626",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    marginBottom: "4px",
                }}>
                    KONTEN
                </p>
                <h1 style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#fff",
                }}>
                    Pengaturan Beranda
                </h1>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: "16px",
                    marginBottom: "24px",
                    backgroundColor: message.includes("berhasil") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: message.includes("berhasil") ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                    color: message.includes("berhasil") ? "#22c55e" : "#ef4444",
                    borderRadius: "4px",
                }}>
                    {message}
                </div>
            )}

            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {DEFAULT_SECTIONS.map((defaultSection) => {
                    const existingSection = sections.find(
                        (s) => s.sectionKey === defaultSection.sectionKey
                    );

                    return (
                        <div
                            key={defaultSection.sectionKey}
                            style={{
                                backgroundColor: "#000",
                                border: "1px solid #1a1a1a",
                                borderRadius: "8px",
                                padding: "24px",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "16px",
                            }}>
                                <div>
                                    <h3 style={{
                                        color: "#fff",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                    }}>
                                        {defaultSection.label}
                                    </h3>
                                    <p style={{
                                        color: "#525252",
                                        fontSize: "12px",
                                    }}>
                                        {defaultSection.sectionType}
                                    </p>
                                </div>

                                {existingSection ? (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => setEditingSection(existingSection)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "8px 16px",
                                                backgroundColor: "#1e40af",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <FiEdit2 size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSection(existingSection.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "8px 16px",
                                                backgroundColor: "#7f1d1d",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleCreateSection(
                                            defaultSection.sectionKey,
                                            defaultSection.sectionType
                                        )}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "8px 16px",
                                            backgroundColor: "#14532d",
                                            border: "none",
                                            color: "#fff",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <FiPlus size={14} />
                                        Buat Section
                                    </button>
                                )}
                            </div>

                            {existingSection && (
                                <div style={{
                                    padding: "16px",
                                    backgroundColor: "#0a0a0a",
                                    border: "1px solid #1a1a1a",
                                    borderRadius: "4px",
                                }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", fontSize: "13px" }}>
                                        <div>
                                            <span style={{ color: "#525252" }}>Title:</span>
                                            <span style={{ color: "#a1a1aa", marginLeft: "8px" }}>
                                                {existingSection.title || "-"}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: "#525252" }}>Image:</span>
                                            <span style={{ color: "#a1a1aa", marginLeft: "8px" }}>
                                                {existingSection.imagePath ? "✓" : "-"}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: "#525252" }}>Pinned:</span>
                                            <span style={{ color: "#a1a1aa", marginLeft: "8px" }}>
                                                {existingSection.pinnedAnnouncement?.title || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {editingSection && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setEditingSection(null);
                    }}
                >
                    <div style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "12px",
                        padding: "32px",
                        maxWidth: "700px",
                        width: "90%",
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "24px",
                        }}>
                            <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>
                                Edit Section: {editingSection.sectionKey}
                            </h2>
                            <button
                                onClick={() => setEditingSection(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#525252",
                                    cursor: "pointer",
                                }}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Title */}
                            <div>
                                <label style={labelStyle}>
                                    <FiFileText size={12} style={{ marginRight: "6px" }} />
                                    Judul
                                </label>
                                <input
                                    type="text"
                                    value={editingSection.title || ""}
                                    onChange={(e) => setEditingSection({
                                        ...editingSection,
                                        title: e.target.value,
                                    })}
                                    style={inputStyle}
                                    placeholder="Masukkan judul..."
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label style={labelStyle}>Subtitle</label>
                                <input
                                    type="text"
                                    value={editingSection.subtitle || ""}
                                    onChange={(e) => setEditingSection({
                                        ...editingSection,
                                        subtitle: e.target.value,
                                    })}
                                    style={inputStyle}
                                    placeholder="Masukkan subtitle..."
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label style={labelStyle}>Konten</label>
                                <textarea
                                    value={editingSection.content || ""}
                                    onChange={(e) => setEditingSection({
                                        ...editingSection,
                                        content: e.target.value,
                                    })}
                                    style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                                    placeholder="Masukkan konten..."
                                />
                            </div>

                            {/* Button */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={labelStyle}>
                                        <FiLink size={12} style={{ marginRight: "6px" }} />
                                        Teks Tombol
                                    </label>
                                    <input
                                        type="text"
                                        value={editingSection.buttonText || ""}
                                        onChange={(e) => setEditingSection({
                                            ...editingSection,
                                            buttonText: e.target.value,
                                        })}
                                        style={inputStyle}
                                        placeholder="Selengkapnya"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>URL Tombol</label>
                                    <input
                                        type="text"
                                        value={editingSection.buttonUrl || ""}
                                        onChange={(e) => setEditingSection({
                                            ...editingSection,
                                            buttonUrl: e.target.value,
                                        })}
                                        style={inputStyle}
                                        placeholder="/tentang"
                                    />
                                </div>
                            </div>

                            {/* Images */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={labelStyle}>
                                        <FiImage size={12} style={{ marginRight: "6px" }} />
                                        Gambar 1
                                    </label>
                                    {editingSection.imagePath ? (
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={editingSection.imagePath}
                                                alt="Preview"
                                                style={{
                                                    width: "100%",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <button
                                                onClick={() => setEditingSection({
                                                    ...editingSection,
                                                    imagePath: null,
                                                })}
                                                style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    right: "8px",
                                                    backgroundColor: "#dc2626",
                                                    border: "none",
                                                    color: "#fff",
                                                    padding: "4px",
                                                    cursor: "pointer",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            padding: "24px",
                                            border: "1px dashed #333",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            color: "#525252",
                                        }}>
                                            <FiUpload size={16} />
                                            Upload Gambar
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, "imagePath")}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <label style={labelStyle}>Gambar 2 (Opsional)</label>
                                    {editingSection.imagePath2 ? (
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={editingSection.imagePath2}
                                                alt="Preview 2"
                                                style={{
                                                    width: "100%",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <button
                                                onClick={() => setEditingSection({
                                                    ...editingSection,
                                                    imagePath2: null,
                                                })}
                                                style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    right: "8px",
                                                    backgroundColor: "#dc2626",
                                                    border: "none",
                                                    color: "#fff",
                                                    padding: "4px",
                                                    cursor: "pointer",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            padding: "24px",
                                            border: "1px dashed #333",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            color: "#525252",
                                        }}>
                                            <FiUpload size={16} />
                                            Upload Gambar
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, "imagePath2")}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Styling */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={labelStyle}>Warna Background</label>
                                    <input
                                        type="color"
                                        value={editingSection.backgroundColor || "#dc2626"}
                                        onChange={(e) => setEditingSection({
                                            ...editingSection,
                                            backgroundColor: e.target.value,
                                        })}
                                        style={{
                                            width: "100%",
                                            height: "44px",
                                            cursor: "pointer",
                                            border: "1px solid #262626",
                                            backgroundColor: "transparent",
                                            borderRadius: "4px",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Warna Teks</label>
                                    <input
                                        type="color"
                                        value={editingSection.textColor || "#ffffff"}
                                        onChange={(e) => setEditingSection({
                                            ...editingSection,
                                            textColor: e.target.value,
                                        })}
                                        style={{
                                            width: "100%",
                                            height: "44px",
                                            cursor: "pointer",
                                            border: "1px solid #262626",
                                            backgroundColor: "transparent",
                                            borderRadius: "4px",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Layout</label>
                                    <select
                                        value={editingSection.layout || "left"}
                                        onChange={(e) => setEditingSection({
                                            ...editingSection,
                                            layout: e.target.value,
                                        })}
                                        style={inputStyle}
                                    >
                                        <option value="left">Gambar di Kanan</option>
                                        <option value="right">Gambar di Kiri</option>
                                        <option value="center">Center</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pin Announcement */}
                            {editingSection.sectionType === "pin_article" && (
                                <div>
                                    <label style={labelStyle}>Pin Artikel</label>
                                    <select
                                        value={editingSection.pinnedAnnouncementId || ""}
                                        onChange={(e) => setEditingSection({
                                            ...editingSection,
                                            pinnedAnnouncementId: e.target.value || null,
                                        })}
                                        style={inputStyle}
                                    >
                                        <option value="">-- Tidak ada artikel di-pin --</option>
                                        {announcements.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                                <button
                                    onClick={() => setEditingSection(null)}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#333",
                                        border: "none",
                                        color: "#fff",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpdateSection}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 24px",
                                        backgroundColor: "#dc2626",
                                        border: "none",
                                        color: "#fff",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <FiSave size={14} />
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
