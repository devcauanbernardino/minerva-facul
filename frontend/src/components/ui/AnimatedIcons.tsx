import { useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

type IconProps = {
  className?: string
}

function HoverIcon({ icon, className }: { icon: string; className?: string }) {
  const [key, setKey] = useState(0)
  return (
    <span
      className={cn('inline-flex', className)}
      onMouseEnter={() => setKey((k) => k + 1)}
    >
      <Icon key={key} icon={icon} width="1em" height="1em" />
    </span>
  )
}

export function TrashIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:trash" className={className} />
}

export function PencilIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:pencil-twotone" className={className} />
}

export function PlusIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:plus" className={className} />
}

export function HomeIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:home-twotone" className={className} />
}

export function SendIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:uploading-loop" className={className} />
}

export function CheckIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:confirm" className={className} />
}

export function FileDownIcon({ className }: IconProps) {
  return <HoverIcon icon="line-md:downloading" className={className} />
}
