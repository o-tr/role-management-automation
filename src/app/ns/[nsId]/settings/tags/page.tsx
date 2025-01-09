import TagList from "@/app/ns/[nsId]/settings/tags/TagList";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/settings/tags/BreadcrumbUpdater";
import { GroupId } from "@/types/brandTypes";
import { useNamespace } from "@/hooks/use-namespace";

export default async function GroupTagsPage({
  params,
}: {
  params: { nsId: string };
}) {
  const { namespace, isPending } = useNamespace({ namespaceId: params.nsId });

  if (!isPending || !namespace) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        グループ設定: {namespace.name}
      </h1>
      <TagList namespaceId={namespace.id as GroupId} />
      <BreadcrumbUpdater />
    </div>
  );
}
