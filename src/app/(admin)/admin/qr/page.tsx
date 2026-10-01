'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { getAdminQRCodes, toggleQRCodeStatus } from '@/actions/admin.actions'
import { QRCodeStatus } from '@/components/qr/qr-code-status'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APP_URL } from '@/lib/constants'
import { Search, Loader2, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function QRCodesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentTab = searchParams.get('status') || 'all'
  const currentSearch = searchParams.get('q') || ''
  
  const [searchValue, setSearchValue] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()
  
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const qrs = await getAdminQRCodes({
        search: currentSearch,
        status: currentTab !== 'all' ? currentTab : undefined,
        per_page: 50 // simplistic pagination for MVP
      })
      setData(qrs?.data || [])
    } catch (err) {
      toast.error('Não foi possível carregar os QR Codes.')
    } finally {
      setLoading(false)
    }
  }, [currentSearch, currentTab])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('q', searchValue)}`)
    })
  }

  const handleTabChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString('status', value === 'all' ? '' : value)}`)
    })
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'unconfigured') return // cant toggle unconfigured
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
      const res = await toggleQRCodeStatus(id, newStatus)
      if (res?.success) {
        toast.success('Status atualizado com sucesso.')
        fetchData()
      } else {
        toast.error('Falha ao atualizar status.')
      }
    } catch (err) {
      toast.error('Ocorreu um erro.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        <p className="text-muted-foreground mt-2">Gerencie todos os QR Codes da plataforma.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="unconfigured">Não Configurados</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="disabled">Desativados</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Buscar por código..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="md:w-64"
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum QR Code encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-medium">
                    {code.code}
                  </TableCell>
                  <TableCell>
                    <QRCodeStatus status={code.status} />
                  </TableCell>
                  <TableCell>
                    {code.destination_type === 'url' ? 'URL' : code.destination_type === 'whatsapp' ? 'WhatsApp' : '-'}
                  </TableCell>
                  <TableCell>{code.batches?.name || '-'}</TableCell>
                  <TableCell>{new Date(code.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/qr/${code.code}`}>
                        <Button variant="ghost" size="icon" title="Ver Detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {code.status !== 'unconfigured' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleStatus(code.id, code.status)}
                          title={code.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
