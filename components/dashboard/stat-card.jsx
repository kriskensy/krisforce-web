import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const StatCard =({ title, value, subtitle, details, badge }) => {
  return (
    <Card className="bg-white dark:bg-[#161B22] border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
          {title}
        </CardTitle>
        {badge && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {badge}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold dark:text-[#58A6FF] mb-1">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-2 mb-4">
          {subtitle}
        </p>

        {details && (
          <div className="space-y-2 border-t pt-4">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[16px]">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold ">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}