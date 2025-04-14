// components/ui/button.tsx
export const Button = ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      {...props}
    >
      {children}
    </button>
  );
  