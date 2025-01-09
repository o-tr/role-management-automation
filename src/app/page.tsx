import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/ns");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Welcome to User Management</h1>
      <p className="text-xl mb-8">Efficiently manage your users and groups</p>
      <Link href="/api/auth/signin">
        <Button size="lg">Get Started</Button>
      </Link>
    </div>
  );
}
