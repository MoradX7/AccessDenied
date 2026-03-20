import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "text-foreground bg-muted"
          : "text-foreground/80 hover:text-foreground hover:bg-muted"
      } ${className || ""}`}
    >
      {children}
    </Link>
  );
}