import { Suspense } from "react";
import RedirectToast from "./components/RedirectToast";

export default function AuhtLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectToast></RedirectToast>
      </Suspense>
      <main>{children}</main>
    </>
  );
}
