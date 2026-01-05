import Link from 'next/link';
import { REPORT_CONFIGS } from '@/lib/configs/reports';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function ReportsHubPage() {

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Reports Center</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(REPORT_CONFIGS).map(([key, config]) => (
          <Link href={`/protected/reports/${key}`} key={key}>
            <Card className="hover:border-primary cursor-pointer transition-all">
              <CardHeader>
                <FileText className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>{config.title}</CardTitle>
                <CardDescription>Generate and export PDF for {config.title}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}