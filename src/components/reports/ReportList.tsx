
import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { MedicalReport } from '@/services/supabaseService';

type ReportListProps = {
  reports: MedicalReport[];
  onReportSelect: (report: MedicalReport) => void;
};

const ReportList = ({ reports, onReportSelect }: ReportListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report Name</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length > 0 ? (
          reports.map((report) => (
            <TableRow 
              key={report.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onReportSelect(report)}
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-healthy-600" />
                  <div>
                    <p className="font-medium">{report.report_name}</p>
                    <p className="text-xs text-gray-500 md:hidden">{new Date(report.created_at).toLocaleDateString()} · {report.category}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{report.category}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge 
                  variant={report.status === 'reviewed' ? 'outline' : 'secondary'}
                  className={
                    report.status === 'reviewed' 
                      ? 'border-green-200 text-green-700 bg-green-50' 
                      : 'border-amber-200 text-amber-700 bg-amber-50'
                  }
                >
                  {report.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
              No reports found matching your search
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ReportList;
