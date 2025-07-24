
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ReportList from './ReportList';
import type { MedicalReport } from '@/services/supabaseService';

type ReportTabsProps = {
  filteredReports: MedicalReport[];
  onReportSelect: (report: MedicalReport) => void;
};

const ReportTabs = ({ filteredReports, onReportSelect }: ReportTabsProps) => {
  const reviewedReports = filteredReports.filter(r => r.status === 'reviewed');
  const pendingReports = filteredReports.filter(r => r.status === 'pending');

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid grid-cols-3 max-w-md">
        <TabsTrigger value="all">All Reports</TabsTrigger>
        <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-4">
        <Card className="glass-card">
          <CardContent className="p-0">
            <ReportList reports={filteredReports} onReportSelect={onReportSelect} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reviewed" className="mt-4">
        <Card className="glass-card">
          <CardContent className="p-0">
            <ReportList reports={reviewedReports} onReportSelect={onReportSelect} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="pending" className="mt-4">
        <Card className="glass-card">
          <CardContent className="p-0">
            <ReportList reports={pendingReports} onReportSelect={onReportSelect} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;
