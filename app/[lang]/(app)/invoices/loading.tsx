"use client";

export default function InvoicesLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      <p className="mt-4 text-slate-300">Chargement des factures...</p>
    </div>
  );
}
