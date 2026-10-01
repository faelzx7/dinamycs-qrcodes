'use client'

import { DestinationType } from '@/types/database'
import { DESTINATION_TYPES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, Camera, MapPin, Globe, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DestinationSelectorProps {
  onSelect: (type: DestinationType) => void
  selected?: string
}

export function DestinationSelector({ onSelect, selected }: DestinationSelectorProps) {
  const options = [
    {
      id: 'whatsapp' as DestinationType,
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
    },
    {
      id: 'instagram' as DestinationType,
      label: 'Instagram',
      icon: Camera,
      color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200',
    },
    {
      id: 'google' as DestinationType,
      label: 'Google',
      icon: MapPin,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
    },
    {
      id: 'website' as DestinationType,
      label: 'Site',
      icon: Globe,
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
    },
    {
      id: 'custom' as DestinationType,
      label: 'Outro link',
      icon: LinkIcon,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((option) => (
        <Card
          key={option.id}
          className={cn(
            'cursor-pointer transition-all duration-200 ease-in-out border-2',
            option.color,
            selected === option.id ? 'ring-2 ring-offset-2 ring-primary' : ''
          )}
          onClick={() => onSelect(option.id)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <option.icon className="w-10 h-10" />
            <span className="font-medium text-lg leading-tight">{option.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
