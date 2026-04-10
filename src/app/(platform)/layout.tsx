import { Header } from "@/components/layout";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex flex-1">
        {children}
      </div>
    </>
  );
}
