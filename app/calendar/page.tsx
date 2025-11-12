"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import MobileSidebarWrapper from "../components/MobileSidebarWrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLangageContext } from "../context/langageContext";
import { useUser } from "../context/UserContext";
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
  const { user } = useUser();
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

  const [subscriptionUrl, setSubscriptionUrl] = useState<string>("");
  const [copiedSubscription, setCopiedSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string>("");
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthStartKey = `${year}-${pad(monthIndex + 1)}-01`;
  const monthEnd = new Date(year, monthIndex + 1, 0).getDate();
  const monthEndKey = `${year}-${pad(monthIndex + 1)}-${pad(monthEnd)}`;

  // Generate subscription URL when user is available
  useEffect(() => {
    if (user?.id) {
      const generateSubscriptionUrl = async () => {
        setLoadingSubscription(true);
        setSubscriptionError("");
        
        try {
          const response = await fetch('/api/calendar/token', {
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to generate subscription token');
          }
          
          const { token } = await response.json();
          const baseUrl = window.location.origin;
          // No longer need userId in URL - it's encoded in the token
          const url = `${baseUrl}/api/calendar/export?token=${token}`;
          setSubscriptionUrl(url);
        } catch (error) {
          console.error('Error generating subscription URL:', error);
          setSubscriptionError(langage === 'fr' ? 'Erreur lors de la génération du lien d\'abonnement' : 'Error generating subscription link');
        } finally {
          setLoadingSubscription(false);
        }
      };
      
      generateSubscriptionUrl();
    }
  }, [user?.id, langage]); // Remove 't' from dependencies, use langage instead

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

  const handleCopySubscriptionUrl = async () => {
    if (subscriptionUrl) {
      try {
        await navigator.clipboard.writeText(subscriptionUrl);
        setCopiedSubscription(true);
        setTimeout(() => setCopiedSubscription(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

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

                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    {/* Calendar Subscription Toggle Button */}
                  <button
                    onClick={() => setShowSubscription(!showSubscription)}
                    className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 sm:px-4 py-2 text-violet-200 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-all text-sm sm:text-base flex items-center gap-2"
                    title={t("calendarSubscription")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">{t("calendarSubscription")}</span>
                    <svg 
                      className={`w-3 h-3 transition-transform duration-200 ${showSubscription ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
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

              {/* Collapsible Subscription Section */}
              {showSubscription && (
                <div className="mb-4 rounded-xl border border-violet-400/20 bg-violet-500/5 backdrop-blur p-4 sm:p-5 animate-in slide-in-from-top-2 duration-200">
                  {loadingSubscription && (
                    <div className="flex items-center justify-center gap-3 text-violet-200 py-4">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">{t("loadingSubscription")}</span>
                    </div>
                  )}

                  {subscriptionError && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-400/20">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-red-200 text-sm">{subscriptionError}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
                        >
                          {t("retry")}
                        </button>
                      </div>
                    </div>
                  )}

                  {subscriptionUrl && !loadingSubscription && !subscriptionError && (
                    <>
                      <p className="text-sm text-slate-300 mb-3">
                        {t("calendarSubscriptionDescription")}
                      </p>

                      {/* Expiration notice */}
                      <div className="flex items-center gap-2 text-xs text-violet-300/70 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("tokenExpiresIn")}
                      </div>

                      {/* Single Subscription URL for all platforms */}
                      <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input
                          type="text"
                          value={subscriptionUrl}
                          readOnly
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 font-mono"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                          onClick={handleCopySubscriptionUrl}
                          className="px-4 py-2 rounded-lg border border-violet-400/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-colors text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          {copiedSubscription ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {t("copied")}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {t("copyLink")}
                            </>
                          )}
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className="text-xs text-slate-400 bg-white/5 rounded-lg p-3">
                        <p className="font-semibold text-slate-300 mb-2">
                          {t("howToSubscribe")}
                        </p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>{t("subscriptionInstructionsCopy")}</li>
                          <li>{t("subscriptionInstructionsCalendarApp")}</li>
                          <li>{t("subscriptionInstructionsAutoUpdate")}</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

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

                        <div className="mt-0.5 sm:mt-1 flex-1 overflow-auto calendar-scroll">
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
