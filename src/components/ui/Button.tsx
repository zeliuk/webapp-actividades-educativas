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
    "px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
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