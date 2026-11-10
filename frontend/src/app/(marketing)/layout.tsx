import { Navbar } from "@/components/layout/navbar";

/** Marketing shell only — keeps the root layout chunk small (avoids dev ChunkLoadError on app routes). */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
