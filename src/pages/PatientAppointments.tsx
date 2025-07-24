import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Phone, MessageSquare, Plus, Search, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { multiTenantService, type Appointment, type DoctorProfile } from '@/services/supabaseService';

interface AppointmentWithDoctor extends Appointment {
  doctorName?: string;
  doctorSpecialization?: string;
  doctorPhone?: string;
}

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const allAppointments = await multiTenantService.getAppointments();
      
      // Filter appointments for current patient (this should come from auth context)
      const patientId = 'current-patient-id';
      const patientAppointments = allAppointments.filter(apt => apt.patient_id === patientId);
      
      // Get doctor details for each appointment
      const appointmentsWithDoctors = await Promise.all(
        patientAppointments.map(async (appointment) => {
          try {
            const doctor = await multiTenantService.getDoctorById(appointment.doctor_id);
            return {
              ...appointment,
              doctorName: doctor ? `${doctor.first_name} ${doctor.last_name}` : 'Unknown Doctor',
              doctorSpecialization: doctor?.specialization || 'General',
              doctorPhone: doctor?.phone || ''
            };
          } catch (error) {
            console.error('Failed to load doctor details:', error);
            return {
              ...appointment,
              doctorName: 'Unknown Doctor',
              doctorSpecialization: 'General',
              doctorPhone: ''
            };
          }
        })
      );
      
      setAppointments(appointmentsWithDoctors);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorSpecialization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'no_show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeSlot = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const createWhatsAppUrl = (phone: string, doctorName: string, appointment: AppointmentWithDoctor) => {
    // Validate phone number
    if (!phone || phone.trim() === '') {
      console.warn('Invalid phone number for WhatsApp URL:', phone);
      return '#';
    }
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Validate it's a reasonable phone number
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      console.warn('Phone number length invalid:', cleanPhone);
      return '#';
    }
    
    const message = `Hi Dr. ${doctorName}, this is regarding my appointment on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${getTimeSlot(appointment.appointment_date, appointment.appointment_time)}.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // Update appointment status to cancelled
      const updatedAppointment = await multiTenantService.updateAppointment(appointmentId, { status: 'cancelled' });
      
      if (updatedAppointment) {
        loadAppointments(); // Reload to get updated data
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const upcomingAppointments = filteredAppointments.filter(a => 
    a.status === 'confirmed' || a.status === 'scheduled'
  ).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  const pastAppointments = filteredAppointments.filter(a => 
    a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show'
  ).sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  if (loading) {
    return (
      <Layout userRole="patient">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="patient">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Appointments</h1>
              <p className="text-gray-600">View and manage your appointments</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-healthy-400 to-nature-500" asChild>
            <Link to="/patient/appointments/book">
              <Plus className="h-4 w-4 mr-2" />
              Book New Appointment
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-healthy-600">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-healthy-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length}
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
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {appointments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Done</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">
                    {appointments.filter(a => a.status === 'cancelled').length}
                  </p>
                </div>
                <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by doctor or specialty..."
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
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Upcoming Appointments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="glass-card border-l-4 border-green-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-healthy-400 to-nature-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {getTimeSlot(appointment.appointment_date, appointment.appointment_time)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Specialty:</span>
                        <p className="font-medium">{appointment.doctorSpecialization}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{appointment.duration_minutes ? `${appointment.duration_minutes} min` : '30 min'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium">{appointment.appointment_type || 'Consultation'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fee:</span>
                        <p className="font-medium">${appointment.consultation_fee || 0}</p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div>
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm mt-1">{appointment.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {appointment.doctorPhone && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={`tel:${appointment.doctorPhone}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Doctor
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={createWhatsAppUrl(appointment.doctorPhone, appointment.doctorName || '', appointment)} target="_blank" rel="noopener noreferrer">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              WhatsApp
                            </a>
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="ml-auto text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              Past Appointments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {getTimeSlot(appointment.appointment_date, appointment.appointment_time)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Specialty:</span>
                        <p className="font-medium">{appointment.doctorSpecialization}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium">{appointment.appointment_type || 'Consultation'}</p>
                      </div>
                    </div>

                    {appointment.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/patient/reports?appointment=${appointment.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Reports
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/patient/appointments/book?doctor=${appointment.doctor_id}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Book Follow-up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-6">
                {appointments.length === 0 
                  ? "You don't have any appointments yet. Book your first appointment to get started."
                  : "No appointments match your current filters."
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/patient/appointments/book">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                {appointments.length > 0 && (
                  <Button variant="outline" onClick={() => {
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PatientAppointments; 