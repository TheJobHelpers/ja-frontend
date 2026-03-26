"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useLayoutEffect(() => {
    // Root page redirects to Client Portal login
    router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200"></div>
    </div>
  );
}
