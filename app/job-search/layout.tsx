import Header from "../components/Header";

export default function HrLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer className="border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <p>Built for technical job hunters.</p>
          <p className="text-[11px]">
            Powered by{" "}
            <span className="font-medium text-zinc-300">TheJobHelpers </span>{" "}
          </p>
        </div>
      </footer>
    </>
  );
}
