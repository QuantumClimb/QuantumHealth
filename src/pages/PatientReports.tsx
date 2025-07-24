
import React, { useState, useEffect } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { multiTenantService, type MedicalReport } from '@/services/supabaseService';
import ReportFilter from '@/components/reports/ReportFilter';
import ReportTabs from '@/components/reports/ReportTabs';
import ReportDetail from '@/components/reports/ReportDetail';
import NoReportSelected from '@/components/reports/NoReportSelected';
import { toast } from 'sonner';

const PatientReports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsData = await multiTenantService.getMedicalReports();
      setReports(reportsData);
      console.log('📋 Reports loaded:', reportsData.length);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search query
  const filteredReports = reports.filter(report => 
    report.report_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.report_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle report selection
  const handleReportSelect = (report: MedicalReport) => {
    setSelectedReport(report);
  };

  if (loading) {
    return (
      <Layout userRole="patient">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="patient">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medical Reports</h1>
            <p className="text-gray-500">Access and manage your medical reports and test results</p>
          </div>
          <Link to="/patient/reports/upload">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Report
            </Button>
          </Link>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Reports listing section */}
          <div className="w-full lg:w-2/3 space-y-6">
            <ReportFilter 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
            />
            <ReportTabs 
              filteredReports={filteredReports} 
              onReportSelect={handleReportSelect}
            />
          </div>

          {/* Report details section */}
          <div className="w-full lg:w-1/3">
            {selectedReport ? (
              <ReportDetail report={selectedReport} />
            ) : (
              <NoReportSelected />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientReports;
