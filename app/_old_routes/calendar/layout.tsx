import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendrier - FactureMe | Calendar - FactureMe",
  description: "Planifiez et organisez votre activité avec le calendrier. Suivez vos rendez-vous, échéances et événements importants. | Plan and organize your activity with the calendar. Track your appointments, deadlines and important events.",
  keywords: ["calendrier", "planning", "rendez-vous", "organisation", "calendar", "planning", "appointments", "organization", "FactureMe"],
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
