import { MultiSelect } from '@/components/MultiSelect'
import { Tag } from '@prisma/client'

interface TagSelectorProps {
  allTags: Tag[]
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
}

export default function TagSelector({ allTags, selectedTags, onTagsChange }: TagSelectorProps) {
  return (
    <MultiSelect
      options={allTags}
      selected={selectedTags}
      onChange={onTagsChange}
    />
  )
}

