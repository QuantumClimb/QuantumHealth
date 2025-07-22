import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Search, Filter, Phone, MessageSquare, FileText, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { multiTenantService, type PatientProfile, type Appointment } from '@/services/supabaseService';

interface PatientWithStats extends PatientProfile {
  appointmentCount?: number;
  lastAppointment?: string;
  nextAppointment?: string;
}

const DoctorPatients = () => {
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const allPatients = await multiTenantService.getPatients();
      
      // Get appointment stats for each patient
      const patientsWithStats = await Promise.all(
        allPatients.map(async (patient) => {
          try {
            const appointments = await multiTenantService.getAppointments(patient.id);
            const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
            const lastAppointment = appointments
              .filter(a => a.status === 'completed')
              .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];
            
            const nextAppointment = confirmedAppointments
              .filter(a => new Date(a.appointment_date) > new Date())
              .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

            return {
              ...patient,
              appointmentCount: appointments.length,
              lastAppointment: lastAppointment?.appointment_date,
              nextAppointment: nextAppointment?.appointment_date
            };
          } catch (error) {
            console.error('Failed to load patient stats:', error);
            return {
              ...patient,
              appointmentCount: 0,
              lastAppointment: undefined,
              nextAppointment: undefined
            };
          }
        })
      );
      
      setPatients(patientsWithStats);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && (patient.appointmentCount || 0) > 0) ||
      (filterStatus === 'inactive' && (patient.appointmentCount || 0) === 0);
    
    return matchesSearch && matchesFilter;
  });

  const createWhatsAppUrl = (phone: string, patientName: string) => {
    const message = `Hi ${patientName}, this is Dr. [Your Name] from QUANTUM HEALTH. How can I help you today?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppChat = (phoneNumber: string, patientName: string) => {
    const message = `Hi ${patientName}, this is Dr. [Your Name] from QUANTUM HEALTH. How can I help you today?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Patients</h1>
              <p className="text-gray-600">Manage your patient relationships and care</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-healthy-400 to-nature-500" asChild>
            <Link to="/doctor/patients/upload-report">
              <Plus className="h-4 w-4 mr-2" />
              Upload Report
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-healthy-600">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-healthy-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-green-600">
                    {patients.filter(p => (p.appointmentCount || 0) > 0).length}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {patients.filter(p => {
                      const createdDate = new Date(p.created_at);
                      const now = new Date();
                      return createdDate.getMonth() === now.getMonth() && 
                             createdDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">New</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Appointments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {patients.length > 0 
                      ? Math.round(patients.reduce((sum, p) => sum + (p.appointmentCount || 0), 0) / patients.length)
                      : 0
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Search Patients</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="active">Active Patients</SelectItem>
                <SelectItem value="inactive">Inactive Patients</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Patient Directory</h2>
            <p className="text-sm text-gray-500">{filteredPatients.length} patients</p>
          </div>

          {filteredPatients.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500 mb-4">
                  {patients.length === 0 
                    ? "You don't have any patients yet."
                    : "No patients match your current filters."
                  }
                </p>
                <Button variant="outline" onClick={() => {
                  setFilterStatus('all');
                  setSearchTerm('');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-healthy-400 to-nature-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {patient.first_name?.charAt(0).toUpperCase()}{patient.last_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {patient.first_name} {patient.last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>Patient ID: {patient.id}</span>
                            <Badge variant="outline" className={
                              (patient.appointmentCount || 0) > 0 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }>
                              {(patient.appointmentCount || 0) > 0 ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{patient.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{patient.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <p className="font-medium">
                          {patient.date_of_birth 
                            ? `${Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <p className="font-medium">{patient.gender || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Appointments:</span>
                        <p className="font-medium">{patient.appointmentCount || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Visit:</span>
                        <p className="font-medium">
                          {patient.lastAppointment 
                            ? new Date(patient.lastAppointment).toLocaleDateString()
                            : 'No visits yet'
                          }
                        </p>
                      </div>
                    </div>

                    {patient.nextAppointment && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-700 font-medium">Next Appointment:</span>
                          <span className="text-blue-600">
                            {new Date(patient.nextAppointment).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {patient.phone && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={`tel:${patient.phone}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={createWhatsAppUrl(patient.phone, `${patient.first_name} ${patient.last_name}`)} target="_blank" rel="noopener noreferrer">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              WhatsApp
                            </a>
                          </Button>
                        </>
                      )}
                      
                      <div className="flex gap-1 ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/doctor/reports?patient=${patient.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Reports
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/doctor/schedule?patient=${patient.id}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorPatients; 