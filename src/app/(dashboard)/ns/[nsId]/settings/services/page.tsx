import { redirect } from "next/navigation";
import type { TNamespaceId } from "@/types/prisma";

export default async function GroupProvidersPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  redirect(`/ns/${params.nsId}/settings/services/accounts`);
}
