"use client"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardBarChart({ 
  data, 
  title, 
  dataKey = "value",
  labelKey = "name",
  barColor = "#0176D3", 
  unit = ""
}) {
  return (
    <Card className="bg-white dark:bg-[#161B22] border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey={labelKey} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                stroke="#888888"
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                stroke="#888888"
                tickFormatter={(value) => unit ? `${value} ${unit}` : value}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                formatter={(value) => unit ? [`${value} ${unit}`, 'Value'] : [value, 'Quantity']}
              />
              <Bar 
                dataKey={dataKey} 
                fill={barColor} 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}