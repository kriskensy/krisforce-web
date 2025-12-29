'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { REPORT_CONFIGS } from '@/lib/configs/reports';
import ReportBuilder from '@/components/reports/ReportBuilder';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ReportPage() {
  const { type } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const config = REPORT_CONFIGS[type];

  useEffect(() => {
    const fetchReportData = async () => {
      if (!config) return;

      try {
        const response = await fetch(`/api/reports/${type}/me`); 
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch report data');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchReportData();
  }, [type, config]);

  if (!config) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The requested report type "{type}" does not exist in the system configuration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  //API errors
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  //loading
  if (!data) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <ReportBuilder 
        data={data} 
        config={config} 
        title={config.title} 
      />
    </div>
  );
}