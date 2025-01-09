import { prisma } from '@/lib/prisma'
import MemberForm from './components/MemberForm'
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function MemberDetail({ params }: { params: { id: string, member_id: string } }) {
  const session = await getServerSession()
  
  if (!session) {
    redirect("/api/auth/signin")
  }

  const groupId = parseInt(params.id)
  const memberId = parseInt(params.member_id)

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { 
      tags: true,
      externalAccounts: {
        include: {
          externalProvider: true
        }
      },
      group: {
        include: {
          tags: true,
          externalProviders: true
        }
      }
    },
  })

  if (!member || member.groupId !== groupId) {
    return <div>Member not found in this group</div>
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  if (!currentUser) {
    return <div>User not found</div>
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { admins: true, owner: true }
  })

  if (!group) {
    return <div>Group not found</div>
  }

  const isOwner = group.ownerId === currentUser.id
  const isAdmin = group.admins.some(admin => admin.id === currentUser.id) || isOwner

  if (!isAdmin) {
    redirect("/groups")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">メンバー詳細</h1>
      <MemberForm member={member} />
    </div>
  )
}

