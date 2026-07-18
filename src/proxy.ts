import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((request) => {
  const isLoggedIn = Boolean(request.auth);
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", request.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
