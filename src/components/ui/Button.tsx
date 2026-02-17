import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer";
  const variants = {
    primary:
      "bg-brand text-black hover:shadow-[0_0_25px_rgba(13,223,114,0.4)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
    outline:
      "border border-brand text-brand hover:bg-brand/10 hover:shadow-[0_0_25px_rgba(13,223,114,0.2)] disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
