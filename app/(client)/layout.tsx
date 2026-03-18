"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import ClientSidebar from "../components/ClientSidebar";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  return !!localStorage.getItem("client_access_token");
}

function getServerSnapshot(): boolean {
  return false;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (typeof window !== "undefined" && !isAuthed) {
    router.push("/login");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
