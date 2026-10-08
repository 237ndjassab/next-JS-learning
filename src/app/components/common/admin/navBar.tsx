"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();
  // 1. Liste de tes liens de navigation
  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Shipments", href: "/dashboard/projects" },
    { name: "Customers", href: "/dashboard/customers" },
    { name: "Analytics", href: "/dashboard/analytics" },
    { name: "Orders", href: "/dashboard/orders" },
    { name: "Products", href: "/dashboard/products" },
  ];
  return (
    <div className="w-full">
      <nav className="w-full bg-gray-800 text-white p-2 shadow-lg">
        <div className="max-w-6xl flex gap-5 items-center">
          {/* image */}
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="Logo"
              fill={true}
              preload={true}
              objectFit="contain"
            />
          </div>

          <div className="flex items-center py-1 px-1 space-x-1 bg-zinc-400/40 rounded-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-2 px-5 rounded-full inline-block text-sm ${
                    isActive
                      ? "bg-green-500 transition-colors duration-150 ease-in-out text-black"
                      : "hover:bg-gray-400 transition-colors duration-150 ease-in-out text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
