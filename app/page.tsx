import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PinArticleSection from "@/components/PinArticleSection";
import ProductLogoSlider from "@/components/ProductLogoSlider";
import TextImageSection from "@/components/TextImageSection";
import FullImageSection from "@/components/FullImageSection";
import ArticlesCarousel from "@/components/ArticlesCarousel";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";

async function getHeroAnnouncements() {
  return prisma.announcement.findMany({
    where: { isPublished: true, isHero: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      excerpt: true,
      slug: true,
      imagePath: true,
      videoPath: true,
      videoType: true,
      youtubeUrl: true,
    },
  });
}

async function getPageSections() {
  try {
    return await prisma.pageSection.findMany({
      where: {
        pageSlug: "beranda",
        isActive: true,
      },
      include: {
        pinnedAnnouncement: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            imagePath: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });
  } catch {
    // Table might not exist yet
    return [];
  }
}

async function getProductLogos() {
  try {
    return await prisma.productLogo.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch {
    // Table might not exist yet
    return [];
  }
}

async function getSettings() {
  return prisma.settings.findFirst();
}

export default async function HomePage() {
  const [heroAnnouncements, sections, logos, settings] = await Promise.all([
    getHeroAnnouncements(),
    getPageSections(),
    getProductLogos(),
    getSettings(),
  ]);

  // Find specific sections
  const pinMainSection = sections.find((s) => s.sectionKey === "pin_main");
  const secondarySection = sections.find((s) => s.sectionKey === "secondary");
  const corporateSection = sections.find((s) => s.sectionKey === "corporate");

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#000" }}>
      <Navbar
        logoPath={settings?.logoPath || undefined}
        siteName={settings?.siteName || "Santos Jaya Abadi"}
      />

      {/* 1. Hero Section */}
      <HeroSection
        announcements={heroAnnouncements}
        heroTitle={settings?.heroTitle || "Melestarikan warisan untuk memperkuat masa depan"}
        heroSubtitle={settings?.heroSubtitle || ""}
        heroImage={settings?.heroImage}
      />

      {/* 2. Pin Main Beranda - Featured Article */}
      <PinArticleSection
        title={pinMainSection?.title || "Kapal Api Global"}
        subtitle={pinMainSection?.subtitle}
        content={pinMainSection?.content || "didistribusikan lebih dari 100 produk ke 68 negara."}
        imagePath={pinMainSection?.imagePath || undefined}
        buttonText={pinMainSection?.buttonText || "Selengkapnya"}
        buttonUrl={pinMainSection?.buttonUrl || undefined}
        pinnedArticle={pinMainSection?.pinnedAnnouncement ? {
          title: pinMainSection.pinnedAnnouncement.title,
          slug: pinMainSection.pinnedAnnouncement.slug,
          excerpt: pinMainSection.pinnedAnnouncement.excerpt || undefined,
          imagePath: pinMainSection.pinnedAnnouncement.imagePath || undefined,
        } : undefined}
      />

      {/* 3. Product Logo Slider */}
      <ProductLogoSlider logos={logos} />

      {/* 4. Secondary Article Section - "Nikmati Perjalanan Kami" */}
      <TextImageSection
        title={secondarySection?.title || "Nikmati Perjalanan Kami"}
        subtitle={secondarySection?.subtitle}
        content={secondarySection?.content || undefined}
        buttonText={secondarySection?.buttonText || "Selengkapnya"}
        buttonUrl={secondarySection?.buttonUrl || "#"}
        imagePath={secondarySection?.imagePath || undefined}
        imagePath2={secondarySection?.imagePath2 || undefined}
        layout={(secondarySection?.layout as "left" | "right") || "left"}
        backgroundColor={secondarySection?.backgroundColor || "#dc2626"}
      />

      {/* 5. Corporate Section - "Corporate Shared Value" */}
      <FullImageSection
        title={corporateSection?.title || "Corporate Shared Value"}
        subtitle={corporateSection?.subtitle}
        imagePath={corporateSection?.imagePath || undefined}
      />

      {/* 6. Articles Carousel - "Aktivitas Perusahaan" */}
      <ArticlesCarousel
        title="Aktivitas Perusahaan"
        subtitle="BERITA TERBARU"
        limit={6}
      />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
