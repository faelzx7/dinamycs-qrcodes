import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG } from "@/lib/constants"
import { QRStatus } from "@/types/database"

interface QRCodeStatusProps {
  status: QRStatus
}

export function QRCodeStatus({ status }: QRCodeStatusProps) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500' }
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"
  let colorClass = "bg-yellow-500 hover:bg-yellow-600 text-white"

  if (status === 'active') {
    colorClass = "bg-green-500 hover:bg-green-600 text-white"
  } else if (status === 'disabled') {
    variant = "destructive"
    colorClass = ""
  }

  return (
    <Badge variant={variant} className={status !== 'disabled' ? colorClass : undefined}>
      {config.label}
    </Badge>
  )
}
