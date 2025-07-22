import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Save, User, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import { multiTenantService, type MedicalReport, type PatientProfile, type Appointment } from '@/services/supabaseService';

const DoctorReportCreate = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [report, setReport] = useState({
    report_name: '',
    report_type: 'consultation' as const,
    category: '',
    description: '',
    file: null as File | null,
    priority: 'normal' as 'low' | 'normal' | 'high'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadAppointmentData();
    }
  }, [id]);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd get the appointment by ID
      // For now, we'll simulate loading appointment data
      const mockAppointment: Appointment = {
        id: id || '',
        tenant_id: 'mock-tenant',
        patient_id: 'mock-patient',
        doctor_id: 'mock-doctor',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '10:00:00',
        status: 'completed',
        appointment_type: 'consultation',
        notes: 'Patient consultation completed',
        consultation_fee: 100,
        payment_status: 'paid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setAppointment(mockAppointment);
      
      // Load patient data
      try {
        const patientData = await multiTenantService.getPatientById(mockAppointment.patient_id);
        setPatient(patientData);
      } catch (error) {
        console.error('Failed to load patient data:', error);
      }
    } catch (error) {
      console.error('Failed to load appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!report.report_name.trim()) {
      newErrors.report_name = 'Report name is required';
    }
    
    if (!report.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!report.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Please upload a PDF or image file' }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      
      setReport(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      if (!appointment || !patient) {
        throw new Error('Missing appointment or patient data');
      }

      // Create the report
      const newReport: Omit<MedicalReport, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> = {
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        report_name: report.report_name,
        report_type: report.report_type,
        category: report.category,
        description: report.description,
        status: 'pending',
        metadata: {
          priority: report.priority,
          appointment_id: appointment.id,
          created_by: 'current-doctor-id'
        }
      };

      const createdReport = await multiTenantService.createMedicalReport(newReport);
      
      if (createdReport) {
        // Handle file upload if present
        if (report.file) {
          // In a real app, you'd upload the file to storage and update the report
          console.log('File upload would happen here:', report.file.name);
        }
        
        // Redirect to reports list
        window.location.href = '/doctor/reports';
      }
    } catch (error) {
      console.error('Failed to create report:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to create report. Please try again.' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout userRole="doctor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="doctor">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/reports">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Medical Report</h1>
              <p className="text-gray-600">Document patient consultation and findings</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-healthy-400 to-nature-500"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Report
          </Button>
        </div>

        {errors.general && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Details
                </CardTitle>
                <CardDescription>
                  Fill in the details for the medical report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="report_name">Report Name *</Label>
                  <Input
                    id="report_name"
                    value={report.report_name}
                    onChange={(e) => {
                      setReport(prev => ({ ...prev, report_name: e.target.value }));
                      setErrors(prev => ({ ...prev, report_name: '' }));
                    }}
                    placeholder="e.g., Consultation Report, Lab Results, etc."
                    className={errors.report_name ? 'border-red-300' : ''}
                  />
                  {errors.report_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.report_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report_type">Report Type *</Label>
                    <Select 
                      value={report.report_type} 
                      onValueChange={(value: any) => setReport(prev => ({ ...prev, report_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="lab">Lab Results</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="pathology">Pathology</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={report.priority} 
                      onValueChange={(value: any) => setReport(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={report.category}
                    onChange={(e) => {
                      setReport(prev => ({ ...prev, category: e.target.value }));
                      setErrors(prev => ({ ...prev, category: '' }));
                    }}
                    placeholder="e.g., Cardiology, Dermatology, General Medicine"
                    className={errors.category ? 'border-red-300' : ''}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={report.description}
                    onChange={(e) => {
                      setReport(prev => ({ ...prev, description: e.target.value }));
                      setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    placeholder="Detailed description of findings, diagnosis, recommendations..."
                    rows={6}
                    className={errors.description ? 'border-red-300' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="file">Attach File (Optional)</Label>
                  <div className="mt-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted formats: PDF, JPG, PNG (max 10MB)
                    </p>
                    {errors.file && (
                      <p className="text-sm text-red-600 mt-1">{errors.file}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Info */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient ? (
                  <>
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Patient ID:</span>
                      <p className="font-medium">{patient.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Age:</span>
                      <p className="font-medium">
                        {patient.date_of_birth 
                          ? `${Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Gender:</span>
                      <p className="font-medium">{patient.gender || 'Not specified'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Patient information not available</p>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointment ? (
                  <>
                    <div>
                      <span className="text-sm text-gray-500">Date:</span>
                      <p className="font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Time:</span>
                      <p className="font-medium">
                        {new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span>
                      <p className="font-medium">{appointment.appointment_type || 'Consultation'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge className={appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Appointment information not available</p>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Report Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-healthy-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Be specific and detailed in your findings</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-healthy-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include relevant medical history and symptoms</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-healthy-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Provide clear recommendations and next steps</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-healthy-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use appropriate medical terminology</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorReportCreate; 