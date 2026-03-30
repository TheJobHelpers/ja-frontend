"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientSidebar from "../components/ClientSidebar";
import MobileHeader from "../components/MobileHeader";
import { clearClientToken } from "../lib/clientAuth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getClientAuthStatus(): boolean {
  if (typeof window === "undefined") return true; // Assume true on server to prevent flash
  return !!document.cookie.match(new RegExp('(^| )client_access_token=([^;]+)')) || !!localStorage.getItem("client_access_token");
}

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
      const authed = getClientAuthStatus();
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <ClientSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto w-full">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} title="Client Portal" />
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
