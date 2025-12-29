'use client';
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function ReportBuilder({ data = [], config, title }) {
  //init default columns from config
  const [selectedFields, setSelectedFields] = useState(
    config?.columns.filter(c => c.default).map(c => c.id) || []
  );
  
  const contentRef = useRef();
  
  //print config
  const handlePrint = useReactToPrint({ 
    contentRef,
    documentTitle: title?.replace(/\s+/g, '_') || 'Report',
  });

  const toggleField = (id) => {
    setSelectedFields(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  //filter columns - user selection
  const visibleColumns = config.columns.filter(c => selectedFields.includes(c.id));

  return (
    <div className="space-y-6">
      {/* control panel */}
      <div className="print:hidden border p-4 rounded-lg bg-card shadow-sm border-slate-200">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Customize Report View:
        </h3>
        <div className="flex flex-wrap gap-6">
          {config.columns.map(col => (
            <div key={col.id} className="flex items-center space-x-2">
              <Checkbox 
                id={col.id} 
                checked={selectedFields.includes(col.id)}
                onCheckedChange={() => toggleField(col.id)}
              />
              <label 
                htmlFor={col.id} 
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:opacity-70"
              >
                {col.label}
              </label>
            </div>
          ))}
        </div>
        <Button onClick={handlePrint} className="mt-6 w-full md:w-auto">
          Export to PDF
        </Button>
      </div>

      {/* print report */}
      <div 
        ref={contentRef} 
        className="bg-white p-8 rounded-md shadow-inner border border-dashed print:border-none print:shadow-none"
      >
        <div className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">{title}</h1>
            <p className="text-gray-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right text-xs text-gray-400 print:block hidden">
            Internal Document - {title}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black hover:bg-transparent">
              {visibleColumns.map(col => (
                <TableHead key={col.id} className="font-bold text-black py-4">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <TableRow key={idx} className="border-b border-gray-100">
                  {visibleColumns.map(col => (
                    <TableCell key={col.id} className="py-3">
                      {col.format ? col.format(row[col.id]) : (row[col.id] || '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-10 text-gray-400">
                  No records found for this report.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}