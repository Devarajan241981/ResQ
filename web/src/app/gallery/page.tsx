import { GalleryView } from "@/components/gallery/gallery-view";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";

export default function GalleryPage() {
  return (
    <>
      <PageHero photo={PHOTOS.volunteers} titleKey="gallery.heading" subtitleKey="gallery.subheading" />
      <PageContainer>
        <GalleryView />
      </PageContainer>
    </>
  );
}
