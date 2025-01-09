'use server'

import { prisma } from '@/lib/prisma'
import { User, Tag, ExternalAccount } from '@prisma/client'

type UserWithRelations = User & {
  tags: Tag[]
  externalAccounts: ExternalAccount[]
}

export async function updateMember(userData: UserWithRelations) {
  const { id, name, email, tags, externalAccounts } = userData

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      tags: {
        set: tags.map(tag => ({ id: tag.id }))
      },
      externalAccounts: {
        deleteMany: {},
        create: externalAccounts.map(account => ({
          externalProviderId: account.externalProviderId
        }))
      }
    },
  })
}

