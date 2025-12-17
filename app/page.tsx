import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/signin");
  }
}
