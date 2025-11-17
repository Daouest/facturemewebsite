import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, decrypt } from "@/app/_lib/session/session-crypto";
import { generateCalendarToken } from "@/app/lib/calendar-token";

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const session = token ? await decrypt(token) : null;
    const userId = session?.idUser;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Generate calendar subscription token
    const calendarToken = generateCalendarToken(userId);

    return NextResponse.json({ token: calendarToken });
  } catch (error) {
    console.error("Error generating calendar token:", error);
    return NextResponse.json(
      { success: false, message: "Error generating token" },
      { status: 500 },
    );
  }
}
