import Link from "next/link";

interface TagProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export default function Tag({ children, href, className = "" }: TagProps) {
  const classes = `inline-block bg-dark-green text-brand-secondary rounded-full px-3 py-1 text-xs font-medium transition-colors ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${classes} hover:bg-brand/20`}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
