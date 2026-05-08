import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the landing page instead of the sign-in page
  redirect("/landing");
}
