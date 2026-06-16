import { useEffect, useRef } from 'react'
import { Player } from '@lordicon/react'
import { Plus, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

import trashIcon from '../../assets/icons/trash.json'
import checkIcon from '../../assets/icons/check.json'
import editIcon from '../../assets/icons/edit.json'
import sendIcon from '../../assets/icons/send.json'
import downloadIcon from '../../assets/icons/download.json'

type IconProps = {
  className?: string
}

function LordiconIcon({
  icon,
  className,
  colorize,
}: {
  icon: object
  className?: string
  colorize?: string
}) {
  const playerRef = useRef<Player>(null)
  const spanRef = useRef<HTMLSpanElement>(null)

  const sizeMatch = className?.match(/(?:^|\s)(?:h|w)-(\d+)(?:\s|$)/)
  const sizeNum = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16

  useEffect(() => {
    const trigger = spanRef.current?.closest('button, a') ?? spanRef.current
    if (!trigger) return
    const play = () => playerRef.current?.playFromBeginning()
    trigger.addEventListener('mouseenter', play)
    return () => trigger.removeEventListener('mouseenter', play)
  }, [])

  return (
    <span
      ref={spanRef}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Player ref={playerRef} icon={icon} size={sizeNum} colorize={colorize} />
    </span>
  )
}

export function TrashIcon({ className }: IconProps) {
  return <LordiconIcon icon={trashIcon} className={className} colorize="#ef4444" />
}

export function PencilIcon({ className }: IconProps) {
  return <LordiconIcon icon={editIcon} className={className} />
}

export function SendIcon({ className }: IconProps) {
  return <LordiconIcon icon={sendIcon} className={className} />
}

export function CheckIcon({ className }: IconProps) {
  return <LordiconIcon icon={checkIcon} className={className} />
}

export function FileDownIcon({ className }: IconProps) {
  return <LordiconIcon icon={downloadIcon} className={className} />
}

export function PlusIcon({ className }: IconProps) {
  return (
    <span className="group inline-flex">
      <Plus
        className={cn(
          'transition-transform duration-200 group-hover:rotate-90',
          className,
        )}
      />
    </span>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <span className="group inline-flex">
      <Home
        className={cn(
          'transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-0.5',
          className,
        )}
      />
    </span>
  )
}
