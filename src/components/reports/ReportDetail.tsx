
import React, { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';
import type { MedicalReport } from '@/services/supabaseService';

type ReportDetailProps = {
  report: MedicalReport;
};

const ReportDetail = ({ report }: ReportDetailProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      if (report.file_url) {
        // Create a download link for the file
        const link = document.createElement('a');
        link.href = report.file_url;
        link.download = report.report_name;
        link.click();
        
        toast({
          title: "Download Complete",
          description: `${report.report_name} has been downloaded successfully.`
        });
      } else {
        toast({
          title: "No File Available",
          description: "This report doesn't have an associated file to download.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your report. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-amber-400 to-purple-400" />
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{report.report_name}</h2>
            <p className="text-sm text-gray-500">{report.category}</p>
          </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>Report Preview</p>
              <p className="text-sm">{report.report_type}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium">{report.report_type}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Format</p>
            <p className="font-medium">{report.file_format || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Size</p>
            <p className="font-medium">{report.file_size_bytes ? `${Math.round(report.file_size_bytes / 1024)} KB` : 'N/A'}</p>
          </div>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm">Description</p>
          <p className="text-sm">{report.description || 'No description available'}</p>
        </div>
        
        <Button 
          className="w-full gap-2" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> 
              Download Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportDetail;
