'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { DailyScanCount } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScanChartProps {
  data: DailyScanCount[]
}

export function ScanChart({ data }: ScanChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scans (Últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível.
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = data.map(item => {
    const date = new Date(item.date)
    return {
      name: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      scans: item.count
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scans (Últimos 30 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary, #3b82f6)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary, #3b82f6)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
              itemStyle={{ color: '#f4f4f5' }}
            />
            <Area type="monotone" dataKey="scans" stroke="var(--primary, #3b82f6)" fillOpacity={1} fill="url(#colorScans)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
