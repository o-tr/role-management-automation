import type { TNamespaceId } from "@/types/prisma";
import { redirect } from "next/navigation";

export default async function GroupProvidersPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  redirect(`/ns/${params.nsId}/settings/services/accounts`);
}
