import NavBar from "@/app/components/common/admin/navBar";
import { Metadata } from "next";

// app/dashboard/layout.tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="w-[80%] clip-nav">
        <NavBar />
        {/* Le conteneur SVG corrigé avec la bonne syntaxe (objectBoundingBox sans S) */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <clipPath id="clip-nav-rounded" clipPathUnits="objectBoundingBox">
              {/* Utilisation de Q (Courbe de Bézier) : ultra-stable sur Next.js */}
              <path d="M 0 0 L 1 0 L 0.97 0.70 Q 0.955 1 0.915 1 L 0 1 Z" />
            </clipPath>
          </defs>
        </svg>
      </div>
      {children}
    </div>
  );
};

export default Layout;
