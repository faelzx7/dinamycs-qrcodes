import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

export default async function ScansPage() {
  const supabase = await createClient()
  
  // Basic query to fetch recent scans, with nested qr_codes code
  const { data: scans } = await supabase
    .from('scans')
    .select(`
      id, 
      scanned_at, 
      device_info, 
      country, 
      city, 
      ip_address,
      qr_codes(code)
    `)
    .order('scanned_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Scans</h1>
        <p className="text-muted-foreground mt-2">Últimos 100 escaneamentos registrados na plataforma.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>QR Code</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!scans || scans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum scan registrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium">
                    {/* @ts-ignore - Handle possible array or object */}
                    <Link href={`/admin/qr/${scan.qr_codes?.code}`} className="text-primary hover:underline">
                      {/* @ts-ignore */}
                      {scan.qr_codes?.code || 'Desconhecido'}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(scan.scanned_at).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="truncate max-w-[200px]" title={scan.device_info || ''}>
                    {scan.device_info || 'Desconhecido'}
                  </TableCell>
                  <TableCell>
                    {[scan.city, scan.country].filter(Boolean).join(', ') || 'Desconhecido'}
                  </TableCell>
                  <TableCell>{scan.ip_address || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
