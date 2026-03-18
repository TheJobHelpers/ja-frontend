"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

export default function HrHome() {
  const router = useRouter();

  useLayoutEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/job-search/search");
    } else {
      router.push("/job-search/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200"></div>
    </div>
  );
}
