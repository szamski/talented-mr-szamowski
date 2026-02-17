import Link from "next/link";
import { getTechIcon } from "@/lib/tech-icons";

interface TagProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  icon?: boolean;
}

export default function Tag({ children, href, className = "", icon = false }: TagProps) {
  const classes = `inline-flex items-center gap-1.5 bg-dark-green text-brand-secondary rounded-full px-3 py-1 text-xs font-medium transition-colors ${className}`;
  const label = typeof children === "string" ? children : "";
  const Icon = icon && label ? getTechIcon(label) : null;

  const content = (
    <>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${classes} hover:bg-brand/20`}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
