import { Navbar } from "@/components/shared/Navbar";
import { ConditionalFooter } from "@/components/shared/ConditionalFooter";
import { NotificationProvider } from "@/components/providers/NotificationProvider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NotificationProvider>
      <Navbar />
      <main>{children}</main>
      <ConditionalFooter />
    </NotificationProvider>
  );
}
