"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JaAdminSidebar from "../../components/JaAdminSidebar";
import MobileHeader from "../../components/MobileHeader";
import { clearJaToken, getJaToken } from "../../lib/jaAuth";

export default function JaAdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Use cookie/localStorage check that correctly determines auth on mount
    setIsAuthed(!!getJaToken());

    const handleStorage = () => setIsAuthed(!!getJaToken());
    window.addEventListener("storage", handleStorage);

    const handleUnauthorized = () => {
      clearJaToken();
      setIsAuthed(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    };
  }, []);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-800 border-t-violet-300" />
      </div>
    );
  }

  if (!isAuthed) {
    router.push("/ja-admin/login");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-800 border-t-violet-300" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <JaAdminSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto w-full">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} title="JA Admin" />
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
