interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  full?: boolean;
}


export function Button({
  children,
  variant = "primary",
  full,
  ...props
}: ButtonProps) {
  const base =
    "rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "text-white hover:bg-cyan-900 hover:text-white",
    secondary: "bg-cyan-700/6 text-gray-700 hover:bg-cyan-700/15",
  };

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}