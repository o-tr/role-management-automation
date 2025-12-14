import { redirect } from "next/navigation";
import type { TNamespaceId } from "@/types/prisma";

export default async function GroupProvidersPage({
  params,
}: {
  params: Promise<{ nsId: TNamespaceId }>;
}) {
  const { nsId } = await params;
  redirect(`/ns/${nsId}/settings/services/accounts`);
}
