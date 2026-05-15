export default function FlujoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-background">
      {children}
    </div>
  );
}
