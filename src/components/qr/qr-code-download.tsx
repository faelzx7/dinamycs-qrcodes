'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import QRCode from 'qrcode'

interface QRCodeDownloadProps {
  code: string
  url: string
}

export function QRCodeDownload({ code, url }: QRCodeDownloadProps) {
  const downloadSVG = async () => {
    try {
      const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'H' })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `qr-${code}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Failed to generate SVG', err)
    }
  }

  const downloadPNG = async () => {
    try {
      const pngDataUrl = await QRCode.toDataURL(url, { type: 'image/png', width: 800, errorCorrectionLevel: 'H' })
      const link = document.createElement('a')
      link.href = pngDataUrl
      link.download = `qr-${code}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to generate PNG', err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={downloadSVG}>
        <Download className="mr-2 h-4 w-4" />
        SVG
      </Button>
      <Button size="sm" variant="outline" onClick={downloadPNG}>
        <Download className="mr-2 h-4 w-4" />
        PNG
      </Button>
    </div>
  )
}
