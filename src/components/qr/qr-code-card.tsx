import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCode } from "@/types/database"
import { QRCodeStatus } from "./qr-code-status"
import { BarChart2, Calendar, Settings, Link2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface QRCodeCardProps {
  qr: QRCode
  scanCount?: number
  scansToday?: number
}

export function QRCodeCard({ qr, scanCount = 0, scansToday = 0 }: QRCodeCardProps) {
  const destName = qr.name || qr.code
  const destUrl = qr.destination_url || 'Sem destino'

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border/40 bg-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold font-mono tracking-wider truncate mr-2" title={destName}>
            {destName}
          </CardTitle>
          <QRCodeStatus status={qr.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
          <Link2 className="h-4 w-4" />
          <span className="font-medium truncate flex-1 font-mono text-xs" title={qr.code}>Código: {qr.code}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate w-full" title={destUrl}>
          {destUrl}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <BarChart2 className="h-3 w-3" /> Total
            </span>
            <span className="text-lg font-semibold">{scanCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Hoje
            </span>
            <span className="text-lg font-semibold">{scansToday}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t border-border/40 bg-muted/10">
        <Link href={`/dashboard/qr/${qr.id}/edit`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" /> Editar
          </Button>
        </Link>
        <Link href={`/dashboard/qr/${qr.id}`} className="w-full">
          <Button variant="default" size="sm" className="w-full">
            Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
