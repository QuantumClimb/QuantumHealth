
import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, X, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { multiTenantService } from '@/services/supabaseService';

const PatientReportUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      reportName: '',
      category: '',
      description: '',
    }
  });

  const categories = [
    "Lab Work",
    "Radiology", 
    "Dentistry", 
    "General Medicine", 
    "Cardiology", 
    "Neurology", 
    "Immunology",
    "Orthopedics"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (data: { reportName: string; category: string; description: string }) => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create the report in the database
      const newReport = await multiTenantService.createMedicalReport({
        patient_id: 'current-patient-id', // This should come from auth context
        doctor_id: undefined, // Patient uploaded reports don't have a doctor initially
        report_name: data.reportName,
        report_type: 'lab', // Default to lab for patient uploads
        category: data.category,
        description: data.description || '',
        status: 'pending',
        metadata: {
          uploaded_by: 'patient',
          file_name: selectedFile?.name
        }
      });

      if (newReport) {
        setIsUploading(false);
        toast({
          title: 'Report uploaded successfully',
          description: 'Your medical report has been uploaded and is pending review.',
        });

        // Reset form
        form.reset();
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Failed to upload report:', error);
      setIsUploading(false);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your report. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout userRole="patient">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/patient/reports" className="flex items-center text-muted-foreground hover:text-primary mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Reports
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Upload Medical Report</h1>
        </div>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reportName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Annual Blood Test Results" required {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Add a brief description of the report" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                
                <div>
                  <Label htmlFor="file-upload">Upload PDF File</Label>
                  <div className="mt-2">
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">
                            Drag and drop your file here, or
                          </p>
                          <div className="mt-2">
                            <Input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="application/pdf"
                              onChange={handleFileChange}
                            />
                            <label
                              htmlFor="file-upload"
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-healthy-600 hover:bg-healthy-700 cursor-pointer"
                            >
                              Select File
                            </label>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">PDF files only, max 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-healthy-600" />
                            <div>
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Upload Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientReportUpload;
