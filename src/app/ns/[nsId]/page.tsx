import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import MemberList from "./components/MemberList";

export default async function GroupPage({
  params,
}: {
  params: { nsId: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const groupId = params.nsId;
  const group = await prisma.namespace.findUnique({
    where: { id: groupId },
    include: {
      owner: true,
      admins: true,
      members: {
        include: {
          tags: true,
        },
      },
      tags: true,
    },
  });

  if (!group) {
    return <div>Group not found</div>;
  }

  // const currentUser = await prisma.user.findUnique({
  //   where: { email: session.user?.email! },
  // });

  // if (!currentUser) {
  //   return <div>User not found</div>;
  // }

  // const isOwner = group.ownerId === currentUser.id;
  // const isAdmin =
  //   group.admins.some((admin) => admin.id === currentUser.id) || isOwner;

  // if (!isAdmin) {
  //   redirect("/groups");
  // }

  // return (
  //   <div>
  //     <h1 className="text-2xl font-bold mb-5">グループ: {group.name}</h1>
  //     <div className="flex justify-between items-center mb-6">
  //       <Link href={`/groups/${groupId}/settings`}>
  //         <Button variant="outline">設定</Button>
  //       </Link>
  //     </div>
  //     <MemberList
  //       members={group.members}
  //       groupId={group.id}
  //       tags={group.tags}
  //     />
  //   </div>
  // );
}
