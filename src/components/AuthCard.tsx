export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-md w-full mx-auto mt-16 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-semibold text-center mb-6">{title}</h1>
      {children}
    </div>
  );
}