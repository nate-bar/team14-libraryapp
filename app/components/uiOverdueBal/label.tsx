// components/ui/label.tsx
export const Label = ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className="text-sm font-medium" {...props}>
      {children}
    </label>
  );
  