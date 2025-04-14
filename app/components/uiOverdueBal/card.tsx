// components/ui/card.tsx
export const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-lg shadow-md bg-white">{children}</div>
  );
  
  export const CardContent = ({ children }: { children: React.ReactNode }) => (
    <div className="p-4">{children}</div>
  );
  