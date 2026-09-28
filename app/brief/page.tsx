import { redirect } from "next/navigation";

export default function BriefRedirect() {
  // Redirects to the default locale (e.g., /fr/brief)
  redirect("/fr/brief");
}