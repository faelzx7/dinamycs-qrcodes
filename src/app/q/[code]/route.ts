import { NextRequest, NextResponse } from 'next/server'
import { lookupQRCode, recordScan } from '@/services/qr-redirect.service'

export const dynamic = 'force-dynamic'

function generateErrorHTML(title: string, message: string, statusLabel: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | QR Dinâmico</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #09090b;
      color: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .status {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    .label {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    p {
      color: #a1a1aa;
      font-size: 15px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="status">⚠️</div>
    <span class="label">${statusLabel}</span>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  if (!code || code.length > 10) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  const qr = await lookupQRCode(code)

  if (!qr) {
    // QR not found - show 404
    return new NextResponse(
      generateErrorHTML('QR Code não encontrado', 'Este QR Code não existe no nosso sistema.', '404'),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  if (qr.status === 'disabled') {
    return new NextResponse(
      generateErrorHTML('Placa desativada', 'Esta placa está temporariamente desativada.', 'Desativada'),
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  if (qr.status === 'unconfigured') {
    return NextResponse.redirect(new URL(`/configurar/${qr.code}`, request.url))
  }

  // Status is 'active' - record scan and redirect
  const userAgent = request.headers.get('user-agent')
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             null

  // Record scan asynchronously - don't block the redirect
  recordScan(qr.id, userAgent, ip)

  // 302 redirect (not 301 - destination can change)
  return NextResponse.redirect(qr.destination_url!, { status: 302 })
}
