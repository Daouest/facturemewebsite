"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import Link from "next/link";
import { useLangageContext } from "../context/langageContext";
import { createTranslator } from "../lib/utils";
import TextType from '@/app/components/TextType';

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

	const today = new Date();
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
	const [invoices, setInvoices] = useState<Record<string, InvoiceSummary[]>>({});
	const [loading, setLoading] = useState(false);

	const year = currentMonth.getFullYear();
	const monthIndex = currentMonth.getMonth(); // 0-based

	const monthStartKey = `${year}-${pad(monthIndex + 1)}-01`;
	const monthEnd = new Date(year, monthIndex + 1, 0).getDate();
	const monthEndKey = `${year}-${pad(monthIndex + 1)}-${pad(monthEnd)}`;

	useEffect(() => {
		// fetch invoices for the current visible month
		const fetchInvoices = async () => {
			setLoading(true);
			try {
				const res = await fetch(`/api/histories-invoices?start=${monthStartKey}&end=${monthEndKey}`, {
					credentials: "include",
				});
				if (!res.ok) {
					setInvoices({});
					return;
				}
				const data = await res.json();

				// API returns an array of invoices; index them by day (local date key)
				const map: Record<string, InvoiceSummary[]> = {};
				if (Array.isArray(data)) {
					data.forEach((inv: any) => {
						const d = new Date(inv.dateFacture);
						const key = formatLocalDateKey(d);
						if (!map[key]) map[key] = [];
						map[key].push({ idFacture: inv.idFacture, factureNumber: inv.factureNumber, dateFacture: inv.dateFacture, nomClient: inv.clientInfo?.nomClient });
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
		// Week starts Sunday (0 = Sunday)
		const firstDayIndex = new Date(year, monthIndex, 1).getDay();
		const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

		const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
		const cells: Array<{ date: Date | null }> = [];

		for (let i = 0; i < totalCells; i++) {
			const dayNumber = i - firstDayIndex + 1;
			if (dayNumber < 1 || dayNumber > daysInMonth) {
				cells.push({ date: null });
			} else {
				cells.push({ date: new Date(year, monthIndex, dayNumber) });
			}
		}
		return cells;
	}, [year, monthIndex]);

	const goPrev = () => setCurrentMonth(new Date(year, monthIndex - 1, 1));
	const goNext = () => setCurrentMonth(new Date(year, monthIndex + 1, 1));
	const goToday = () => setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

	// localized weekdays starting Sunday
	const weekDays = useMemo(() => {
		const locale = langage === "fr" ? "fr-FR" : "en-US";
		const df = new Intl.DateTimeFormat(locale, { weekday: "short" });
		// generate from Sunday -> Saturday
		const names: string[] = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(2020, 5, 7 + i); // 2020-06-07 is a Sunday
			names.push(df.format(d));
		}
		return names;
	}, [langage]);

	return (
		<main className="min-h-screen flex flex-col bg-gray-100 dark:bg-zinc-800">
			<Header />

			<div className="w-full max-w-5xl mx-auto mt-24 mb-12 px-4">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<button onClick={goPrev} className="px-3 py-1 rounded bg-white shadow">◀</button>
						<button onClick={goToday} className="px-3 py-1 rounded bg-white shadow">
							{t("today")}</button>
						<button onClick={goNext} className="px-3 py-1 rounded bg-white shadow">▶</button>
					</div>
					<h2 className="text-2xl font-semibold">{
					currentMonth.toLocaleString(langage === "fr" ? "fr-FR" : "en-US", { month: 'long', year: 'numeric' })}</h2>
				</div>

				<div className="bg-white rounded-lg shadow p-4">
					<div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold mb-2">
						{weekDays.map((d, i) => (
							<div key={i} className="text-zinc-600">{d}</div>
						))}
					</div>

					<div className="grid grid-cols-7 gap-2">
						{daysGrid.map((cell, idx) => {
							if (!cell.date) {
								return <div key={idx} className="h-24 bg-transparent" />;
							}

							const d = cell.date;
							const dateKey = formatLocalDateKey(d);
							const dayInvoices = invoices[dateKey] || [];
							const isToday = dateKey === formatLocalDateKey(today);

							return (
								<div key={idx} className={`h-28 p-2 border rounded-lg flex flex-col justify-between ${isToday ? 'ring-2 ring-teal-400' : 'bg-white'}`}>
									<div className="flex justify-between items-start">
										<div className="text-sm font-medium">{d.getDate()}</div>
										{dayInvoices.length > 0 && (
											<div className="text-xs bg-teal-500 text-white rounded-full px-2 py-0.5">{dayInvoices.length}</div>
										)}
									</div>

									<div className="flex flex-col gap-1 overflow-auto max-h-16">
										{loading ? (
											<div className="text-xs text-zinc-500">{t("loading")}</div>
										) : dayInvoices.length === 0 ? (
											<div className="text-xs text-zinc-400">&nbsp;</div>
										) : (
											dayInvoices.map((inv) => (
												<Link key={inv.idFacture} href={`/previsualisation?factureId=${inv.idFacture}`} className="text-xs text-left truncate hover:underline text-blue-600">
													{inv.factureNumber} • {inv.nomClient ?? ''}
												</Link>
											))
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<Footer />
		</main>
	);
}
