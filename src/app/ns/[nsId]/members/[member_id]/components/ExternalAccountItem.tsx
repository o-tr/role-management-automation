import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Role, ExternalAccount, ExternalProvider } from '@prisma/client'
import { X } from 'lucide-react'

interface ExternalAccountItemProps {
  account: ExternalAccount & {
    externalProvider: ExternalProvider & {
      roles: Role[]
    }
  }
  onRemove: () => void
}

export default function ExternalAccountItem({
  account,
  onRemove
}: ExternalAccountItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-semibold">{account.externalProvider.provider}</h3>
        <p className="text-sm text-gray-500">{account.externalProvider.providerId}</p>
        <div className="mt-2 space-x-2">
          {account.externalProvider.roles.map(role => (
            <Badge key={role.id} variant="secondary">{role.name}</Badge>
          ))}
        </div>
      </div>
      <div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

