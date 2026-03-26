"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore, useEffect } from "react";
import JaAdminSidebar from "../../components/JaAdminSidebar";
import { clearJaToken } from "../../lib/jaAuth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  return !!localStorage.getItem("ja_access_token");
}

function getServerSnapshot(): boolean {
  return false;
}

export default function JaAdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearJaToken();
      window.dispatchEvent(new Event("storage"));
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized as EventListener);
    };
  }, []);

  if (typeof window !== "undefined" && !isAuthed) {
    router.push("/ja-admin/login");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-800 border-t-violet-300" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-800 border-t-violet-300" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <JaAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
