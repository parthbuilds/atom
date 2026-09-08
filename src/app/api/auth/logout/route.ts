import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("atom_user_id");
  response.cookies.delete("atom_role");
  response.cookies.delete("atom_org");
  return response;
}
