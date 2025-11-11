"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import MobileSidebarWrapper from "../components/MobileSidebarWrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLangageContext } from "../context/langageContext";
import { createTranslator } from "../lib/utils";

type InvoiceSummary = {
  idFacture: number;
  factureNumber: number;
  dateFacture: string;
  nomClient?: string;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatLocalDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CalendarPage() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const router = useRouter();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [invoices, setInvoices] = useState<Record<string, InvoiceSummary[]>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthStartKey = `${year}-${pad(monthIndex + 1)}-01`;
  const monthEnd = new Date(year, monthIndex + 1, 0).getDate();
  const monthEndKey = `${year}-${pad(monthIndex + 1)}-${pad(monthEnd)}`;

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/histories-invoices?start=${monthStartKey}&end=${monthEndKey}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          setInvoices({});
          return;
        }
        const data = await res.json();

        const map: Record<string, InvoiceSummary[]> = {};
        if (Array.isArray(data)) {
          data.forEach((inv: any) => {
            const d = new Date(inv.dateFacture);
            const key = formatLocalDateKey(d);
            (map[key] ||= []).push({
              idFacture: inv.idFacture,
              factureNumber: inv.factureNumber,
              dateFacture: inv.dateFacture,
              nomClient: inv.clientInfo?.nomClient,
            });
          });
        }
        setInvoices(map);
      } catch (err) {
        console.error(err);
        setInvoices({});
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [monthStartKey, monthEndKey, monthIndex, year]);

  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(year, monthIndex, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
    const cells: Array<{ date: Date | null }> = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayIndex + 1;
      cells.push(
        dayNumber < 1 || dayNumber > daysInMonth
          ? { date: null }
          : { date: new Date(year, monthIndex, dayNumber) }
      );
    }
    return cells;
  }, [year, monthIndex]);

  const goPrev = () => setCurrentMonth(new Date(year, monthIndex - 1, 1));
  const goNext = () => setCurrentMonth(new Date(year, monthIndex + 1, 1));
  const goToday = () =>
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  // Localized weekday labels, Sunday -> Saturday
  const weekDays = useMemo(() => {
    const locale = langage === "fr" ? "fr-FR" : "en-US";
    const df = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2020, 5, 7 + i); // 2020-06-07 = Sunday
      names.push(df.format(d));
    }
    return names;
  }, [langage]);

  const monthLabel = currentMonth.toLocaleString(
    langage === "fr" ? "fr-FR" : "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        {/* Decorative gradient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <main className="flex-1 pt-20 pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <section className="flex-1">
              {/* Toolbar - Stack on mobile, single row on desktop */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 capitalize text-center sm:text-left">
                  {monthLabel}
                </h2>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={goPrev}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 sm:px-4 py-2 text-slate-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors"
                    aria-label="Previous month"
                  >
                    ◀
                  </button>
                  <button
                    onClick={goToday}
                    className="rounded-xl border border-sky-400/40 bg-sky-500/10 px-3 sm:px-4 py-2 text-sky-200 hover:bg-sky-500/20 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors text-sm sm:text-base"
                  >
                    {t("today")}
                  </button>
                  <button
                    onClick={goNext}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 sm:px-4 py-2 text-slate-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors"
                    aria-label="Next month"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Calendar frame */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                {/* Weekday header (weekends highlighted) */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-sm font-semibold pb-3 border-b border-white/10">
                  {weekDays.map((d, i) => {
                    const isWeekend = i === 0 || i === 6; // Sun or Sat
                    return (
                      <div
                        key={i}
                        className={[
                          "rounded-lg px-1 sm:px-2 py-1",
                          isWeekend
                            ? "text-rose-200 bg-rose-500/10 ring-1 ring-rose-400/20"
                            : "text-slate-300/90",
                        ].join(" ")}
                      >
                        {d}
                      </div>
                    );
                  })}
                </div>

                {/* Days grid (weekend cells tinted) */}
                <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
                  {daysGrid.map((cell, idx) => {
                    if (!cell.date)
                      return <div key={idx} className="h-20 sm:h-24 md:h-28" />;

                    const d = cell.date;
                    const dateKey = formatLocalDateKey(d);
                    const dayInvoices = invoices[dateKey] || [];
                    const isToday = dateKey === formatLocalDateKey(today);
                    const dayOfWeek = d.getDay(); // 0=Sun,6=Sat
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    return (
                      <div
                        key={idx}
                        className={[
                          "h-20 sm:h-24 md:h-28 p-1 sm:p-2 rounded-lg sm:rounded-xl border flex flex-col",
                          "transition-colors",
                          isWeekend
                            ? "bg-rose-500/5 border-rose-400/20 hover:bg-rose-500/10"
                            : "bg-white/5 border-white/10 hover:bg-white/10",
                          isToday ? "ring-2 ring-sky-400/40" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between">
                          <div className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-100">
                            {d.getDate()}
                          </div>
                          {dayInvoices.length > 0 && (
                            <div
                              className={[
                                "text-[8px] sm:text-[10px] md:text-xs text-white rounded-full px-1 sm:px-2 py-0.5",
                                isWeekend ? "bg-rose-500/90" : "bg-sky-500/90",
                              ].join(" ")}
                            >
                              {dayInvoices.length}
                            </div>
                          )}
                        </div>

                        <div className="mt-0.5 sm:mt-1 flex-1 overflow-auto">
                          {loading ? (
                            <div className="text-[9px] sm:text-[11px] md:text-xs text-slate-400">
                              {t("loading")}
                            </div>
                          ) : dayInvoices.length === 0 ? (
                            <div className="text-[9px] sm:text-[11px] md:text-xs text-transparent select-none">
                              .
                            </div>
                          ) : (
                            dayInvoices.map((inv) => (
                              <Link
                                key={inv.idFacture}
                                href={`/previsualisation?factureId=${inv.idFacture}`}
                                className={[
                                  "block text-[9px] sm:text-[11px] md:text-xs truncate underline-offset-2 hover:underline",
                                  isWeekend
                                    ? "text-rose-200 hover:text-rose-100"
                                    : "text-sky-200 hover:text-sky-100",
                                ].join(" ")}
                                title={`${inv.factureNumber} • ${
                                  inv.nomClient ?? ""
                                }`}
                              >
                                <span className="hidden sm:inline">
                                  {inv.factureNumber} • {inv.nomClient ?? ""}
                                </span>
                                <span className="sm:hidden">
                                  {inv.factureNumber}
                                </span>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 text-[10px] sm:text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded ring-2 ring-sky-400/40 bg-white/5" />
                  {t("today")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-rose-500/10 ring-1 ring-rose-400/30" />
                  Week-end (sam./dim.)
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
