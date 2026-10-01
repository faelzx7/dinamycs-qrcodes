'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodePreviewProps {
  url: string
  size?: number
}

export function QRCodePreview({ url, size = 200 }: QRCodePreviewProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border inline-block">
      <QRCodeSVG
        value={url}
        size={size}
        level="H"
        includeMargin={false}
      />
    </div>
  )
}
