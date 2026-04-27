"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientSidebar from "../components/ClientSidebar";
import MobileHeader from "../components/MobileHeader";
import { isClientAuthenticated, clearClientToken } from "../lib/clientAuth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthed, setIsAuthed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authed = isClientAuthenticated();
      setIsAuthed(authed);
      setIsMounted(true);
      if (!authed) {
        router.push("/login");
      }
    };

    checkAuth();

    const handleUnauthorized = () => {
      clearClientToken();
      setIsAuthed(false);
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized as EventListener);
      window.removeEventListener("storage", checkAuth);
    };
  }, [router]);

  if (!isMounted || !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-zinc-500 border-t-slate-900 dark:border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <ClientSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto w-full">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} title="Client Portal" />
        <div className="px-4 py-6 sm:px-8 lg:pl-12 lg:pr-16 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
