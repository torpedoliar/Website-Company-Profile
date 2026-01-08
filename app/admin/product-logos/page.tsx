"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUpload, FiLink, FiMove } from "react-icons/fi";

interface ProductLogo {
    id: string;
    name: string;
    logoPath: string;
    linkUrl: string | null;
    order: number;
    isActive: boolean;
}

export default function ProductLogosPage() {
    const [logos, setLogos] = useState<ProductLogo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingLogo, setEditingLogo] = useState<ProductLogo | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newLogo, setNewLogo] = useState({ name: "", logoPath: "", linkUrl: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchLogos();
    }, []);

    const fetchLogos = async () => {
        try {
            const res = await fetch("/api/product-logos");
            if (res.ok) {
                const data = await res.json();
                setLogos(data);
            }
        } catch (error) {
            console.error("Failed to fetch logos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newLogo.name || !newLogo.logoPath) {
            setMessage("Nama dan logo wajib diisi");
            return;
        }

        try {
            const res = await fetch("/api/product-logos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newLogo,
                    order: logos.length,
                }),
            });

            if (res.ok) {
                setMessage("Logo berhasil ditambahkan!");
                setIsCreating(false);
                setNewLogo({ name: "", logoPath: "", linkUrl: "" });
                fetchLogos();
            } else {
                setMessage("Gagal menambahkan logo");
            }
        } catch (error) {
            console.error("Failed to create logo:", error);
            setMessage("Terjadi kesalahan");
        }
    };

    const handleUpdate = async () => {
        if (!editingLogo) return;

        try {
            const res = await fetch(`/api/product-logos/${editingLogo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingLogo),
            });

            if (res.ok) {
                setMessage("Logo berhasil diupdate!");
                setEditingLogo(null);
                fetchLogos();
            } else {
                setMessage("Gagal update logo");
            }
        } catch (error) {
            console.error("Failed to update logo:", error);
            setMessage("Terjadi kesalahan");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus logo ini?")) return;

        try {
            const res = await fetch(`/api/product-logos/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage("Logo berhasil dihapus!");
                fetchLogos();
            } else {
                setMessage("Gagal menghapus logo");
            }
        } catch (error) {
            console.error("Failed to delete logo:", error);
            setMessage("Terjadi kesalahan");
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        isNew: boolean = false
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (isNew) {
                    setNewLogo({ ...newLogo, logoPath: data.url });
                } else if (editingLogo) {
                    setEditingLogo({ ...editingLogo, logoPath: data.url });
                }
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
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px",
            }}>
                <div>
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
                        Logo Produk
                    </h1>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#14532d",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        borderRadius: "4px",
                    }}
                >
                    <FiPlus size={14} />
                    Tambah Logo
                </button>
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

            {/* Logos Grid */}
            {logos.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "64px",
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    borderRadius: "8px",
                }}>
                    <p style={{ color: "#525252", marginBottom: "16px" }}>
                        Belum ada logo produk
                    </p>
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 24px",
                            backgroundColor: "#14532d",
                            border: "none",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            borderRadius: "4px",
                        }}
                    >
                        <FiPlus size={14} />
                        Tambah Logo Pertama
                    </button>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "20px",
                }}>
                    {logos.map((logo, index) => (
                        <div
                            key={logo.id}
                            style={{
                                backgroundColor: "#000",
                                border: "1px solid #1a1a1a",
                                borderRadius: "8px",
                                padding: "20px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "16px",
                            }}>
                                <span style={{
                                    color: "#525252",
                                    fontSize: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}>
                                    <FiMove size={12} />
                                    #{index + 1}
                                </span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => setEditingLogo(logo)}
                                        style={{
                                            padding: "6px",
                                            backgroundColor: "#1e40af",
                                            border: "none",
                                            color: "#fff",
                                            cursor: "pointer",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <FiEdit2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(logo.id)}
                                        style={{
                                            padding: "6px",
                                            backgroundColor: "#7f1d1d",
                                            border: "none",
                                            color: "#fff",
                                            cursor: "pointer",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                height: "80px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#0a0a0a",
                                borderRadius: "4px",
                                marginBottom: "12px",
                            }}>
                                <img
                                    src={logo.logoPath}
                                    alt={logo.name}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "60px",
                                        objectFit: "contain",
                                        filter: "brightness(0) invert(1)",
                                    }}
                                />
                            </div>

                            <p style={{
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: 600,
                                marginBottom: "4px",
                            }}>
                                {logo.name}
                            </p>
                            {logo.linkUrl && (
                                <p style={{
                                    color: "#525252",
                                    fontSize: "11px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                }}>
                                    <FiLink size={10} />
                                    {logo.linkUrl.slice(0, 30)}...
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
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
                        if (e.target === e.currentTarget) setIsCreating(false);
                    }}
                >
                    <div style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "12px",
                        padding: "32px",
                        maxWidth: "500px",
                        width: "90%",
                    }}>
                        <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>
                            Tambah Logo Baru
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Nama Produk</label>
                                <input
                                    type="text"
                                    value={newLogo.name}
                                    onChange={(e) => setNewLogo({ ...newLogo, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Kapal Api, Excelso, dll."
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Logo</label>
                                {newLogo.logoPath ? (
                                    <div style={{ position: "relative", display: "inline-block" }}>
                                        <div style={{
                                            padding: "20px",
                                            backgroundColor: "#0a0a0a",
                                            border: "1px solid #262626",
                                            borderRadius: "4px",
                                        }}>
                                            <img
                                                src={newLogo.logoPath}
                                                alt="Preview"
                                                style={{
                                                    maxHeight: "60px",
                                                    objectFit: "contain",
                                                    filter: "brightness(0) invert(1)",
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setNewLogo({ ...newLogo, logoPath: "" })}
                                            style={{
                                                position: "absolute",
                                                top: "-8px",
                                                right: "-8px",
                                                backgroundColor: "#dc2626",
                                                border: "none",
                                                color: "#fff",
                                                padding: "4px",
                                                cursor: "pointer",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "32px",
                                        border: "1px dashed #333",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        color: "#525252",
                                    }}>
                                        <FiUpload size={16} />
                                        Upload Logo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, true)}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label style={labelStyle}>Link URL (Opsional)</label>
                                <input
                                    type="text"
                                    value={newLogo.linkUrl}
                                    onChange={(e) => setNewLogo({ ...newLogo, linkUrl: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://..."
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewLogo({ name: "", logoPath: "", linkUrl: "" });
                                    }}
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
                                    onClick={handleCreate}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 24px",
                                        backgroundColor: "#14532d",
                                        border: "none",
                                        color: "#fff",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <FiPlus size={14} />
                                    Tambah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingLogo && (
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
                        if (e.target === e.currentTarget) setEditingLogo(null);
                    }}
                >
                    <div style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "12px",
                        padding: "32px",
                        maxWidth: "500px",
                        width: "90%",
                    }}>
                        <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>
                            Edit Logo
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Nama Produk</label>
                                <input
                                    type="text"
                                    value={editingLogo.name}
                                    onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Logo</label>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <div style={{
                                        padding: "20px",
                                        backgroundColor: "#0a0a0a",
                                        border: "1px solid #262626",
                                        borderRadius: "4px",
                                    }}>
                                        <img
                                            src={editingLogo.logoPath}
                                            alt="Preview"
                                            style={{
                                                maxHeight: "60px",
                                                objectFit: "contain",
                                                filter: "brightness(0) invert(1)",
                                            }}
                                        />
                                    </div>
                                    <label style={{
                                        position: "absolute",
                                        bottom: "-8px",
                                        right: "-8px",
                                        backgroundColor: "#1e40af",
                                        border: "none",
                                        color: "#fff",
                                        padding: "6px",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                    }}>
                                        <FiUpload size={12} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, false)}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Link URL (Opsional)</label>
                                <input
                                    type="text"
                                    value={editingLogo.linkUrl || ""}
                                    onChange={(e) => setEditingLogo({ ...editingLogo, linkUrl: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Urutan</label>
                                <input
                                    type="number"
                                    value={editingLogo.order}
                                    onChange={(e) => setEditingLogo({ ...editingLogo, order: parseInt(e.target.value) || 0 })}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                                <button
                                    onClick={() => setEditingLogo(null)}
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
                                    onClick={handleUpdate}
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
