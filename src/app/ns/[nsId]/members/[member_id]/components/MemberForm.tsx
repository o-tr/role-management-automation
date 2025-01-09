'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Member, Tag, ExternalProvider, ExternalAccount, Group } from '@prisma/client'
import { updateMember } from '../../actions'
import TagSelector from './TagSelector'
import ExternalAccountsSection from './ExternalAccountsSection'

type MemberWithRelations = Member & {
  tags: Tag[]
  externalAccounts: (ExternalAccount & {
    externalProvider: ExternalProvider
  })[]
  group: Group & {
    tags: Tag[]
    externalProviders: ExternalProvider[]
  }
}

interface MemberFormProps {
  member: MemberWithRelations
}

export default function MemberForm({ member: initialMember }: MemberFormProps) {
  const [member, setMember] = useState(initialMember)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMember(member)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">名前</Label>
          <Input
            id="name"
            value={member.name}
            onChange={(e) => setMember({ ...member, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={member.email}
            onChange={(e) => setMember({ ...member, email: e.target.value })}
          />
        </div>
        <div>
          <Label>タグ</Label>
          <TagSelector
            allTags={member.group.tags}
            selectedTags={member.tags}
            onTagsChange={(tags) => setMember({ ...member, tags })}
          />
        </div>
      </div>
      
      <ExternalAccountsSection 
        memberExternalAccounts={member.externalAccounts}
        groupExternalProviders={member.group.externalProviders}
        onUpdate={(updatedAccounts) => setMember({ ...member, externalAccounts: updatedAccounts })}
      />

      <Button type="submit" className="w-full">保存</Button>
    </form>
  )
}

