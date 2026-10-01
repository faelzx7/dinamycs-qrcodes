'use client'

import { useState } from 'react'
import { generateBatchAction, getBatchQRCodes, exportBatchCSV } from '@/actions/admin.actions'
import { QRCodeStatus } from '@/components/qr/qr-code-status'
import { QRCodeDownload } from '@/components/qr/qr-code-download'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_URL } from '@/lib/constants'
import { Loader2, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export default function QRGeneratorPage() {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [codes, setCodes] = useState<any[]>([])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !quantity) return
    
    setLoading(true)
    try {
      const num = Number(quantity)
      if (num < 1 || num > 5000) {
        toast.error('Quantidade deve ser entre 1 e 5000.')
        return
      }

      const res = await generateBatchAction({ name, quantity: num })
      if (res.success && res.batchId) {
        setBatchId(res.batchId)
        toast.success('Lote gerado com sucesso.')
        
        // Fetch generated codes
        const codesData = await getBatchQRCodes(res.batchId)
        if (codesData) {
          setCodes(codesData)
        }
      } else {
        toast.error(res.error || 'Falha ao gerar lote.')
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!codes.length) return
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      const cols = 4
      const rows = 5
      const qrSize = (pageWidth - margin * 2 - (cols - 1) * 10) / cols
      
      const mappedCodes = codes.map(c => ({
        code: c.code,
        url: `${APP_URL}/q/${c.code}`
      }))

      for (let i = 0; i < mappedCodes.length; i++) {
        if (i > 0 && i % (cols * rows) === 0) doc.addPage()
        const pageIndex = i % (cols * rows)
        const col = pageIndex % cols
        const row = Math.floor(pageIndex / cols)
        const x = margin + col * (qrSize + 10)
        const y = margin + row * (qrSize + 15)
        
        const pngDataUrl = await QRCode.toDataURL(mappedCodes[i].url, { width: 300, errorCorrectionLevel: 'H' })
        doc.addImage(pngDataUrl, 'PNG', x, y, qrSize, qrSize)
        doc.setFontSize(8)
        doc.text(mappedCodes[i].code, x + qrSize / 2, y + qrSize + 4, { align: 'center' })
      }
      
      doc.save(`lote-${name || batchId}.pdf`)
    } catch (error) {
      toast.error('Erro ao gerar PDF.')
    }
  }

  const handleExportCSV = async () => {
    if (!batchId) return
    const csv = await exportBatchCSV(batchId)
    if (!csv) return
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `lote-${name || batchId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAllPNG = async () => {
      // In MVP, we might download individually or zip.
      // Doing simple individual trigger to show intent, though zip is better.
      toast('Para lotes grandes, utilize o PDF. O download individual em massa iniciará.')
      for(const c of codes) {
          const url = `${APP_URL}/q/${c.code}`
          const pngDataUrl = await QRCode.toDataURL(url, { type: 'image/png', width: 400, errorCorrectionLevel: 'H' })
          const link = document.createElement('a')
          link.href = pngDataUrl
          link.download = `qr-${c.code}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          await new Promise(resolve => setTimeout(resolve, 300)) // delay to not block browser completely
      }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de QR Codes</h1>
        <p className="text-muted-foreground mt-2">Crie novos lotes de QR Codes em massa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Lote</CardTitle>
          <CardDescription>Defina o nome e a quantidade de QR Codes para este lote.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Lote</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Lote Promocional A" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  max="5000" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')} 
                  placeholder="1-5000" 
                  required 
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar QR Codes
            </Button>
          </form>
        </CardContent>
      </Card>

      {codes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>QR Codes Gerados</CardTitle>
              <CardDescription>Lote gerado com sucesso. Você já pode baixar os arquivos.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={handleDownloadAllPNG}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PNGs
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Baixar PDF
                </Button>
                <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL de Destino</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">
                        <Link href={`/q/${code.code}`} className="hover:underline text-primary" target="_blank">
                          {code.code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <QRCodeStatus status={code.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        Não configurado
                      </TableCell>
                      <TableCell className="text-right">
                        <QRCodeDownload code={code.code} url={`${APP_URL}/q/${code.code}`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
