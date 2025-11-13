import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect root to login page
  redirect("/login");
}
