import LanguageSwitcher from "@/components/language/LanguageSwitcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="relative min-h-screen">
      {/* Sign-up and registration pages have no navbar, so the language picker lives here */}
      <div className="absolute right-4 top-4 z-30">
        <LanguageSwitcher />
      </div>
      {children}
    </section>
  );
}
