import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Phone, MessageSquare, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { multiTenantService, type Appointment, type PatientProfile, supabase } from '@/services/supabaseService';

interface AppointmentWithPatient extends Appointment {
  patientName?: string;
  patientPhone?: string;
  specialty?: string;
}

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, filterStatus]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Get current doctor's appointments
      const doctorId = 'current-doctor-id'; // This should come from auth context
      const doctorAppointments = await multiTenantService.getAppointments(undefined, doctorId);
      
      // Get patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        doctorAppointments.map(async (appointment) => {
          try {
            const patient = await multiTenantService.getPatientById(appointment.patient_id);
            return {
              ...appointment,
              patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
              patientPhone: patient?.phone || '',
              specialty: 'General Consultation' // This should come from doctor's specialization
            };
          } catch (error) {
            console.error('Failed to load patient details:', error);
            return {
              ...appointment,
              patientName: 'Unknown Patient',
              patientPhone: '',
              specialty: 'General Consultation'
            };
          }
        })
      );
      
      setAppointments(appointmentsWithPatients);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const createWhatsAppUrl = (phone: string, appointment: AppointmentWithPatient) => {
    const message = `Hi ${appointment.patientName}, this is Dr. [Your Name] regarding your appointment on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${getTimeSlot(appointment.appointment_date, appointment.appointment_time)}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      // Update appointment status in the database
      const { data, error } = await supabase
        .from('quantumhealth_appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .eq('tenant_id', multiTenantService.getCurrentTenantId());
      
      if (error) throw error;
      loadAppointments(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update appointment status:', error);
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
              <h1 className="text-2xl font-bold">My Schedule</h1>
              <p className="text-gray-600">Manage your appointments and availability</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-healthy-400 to-nature-500" asChild>
            <Link to="/doctor/schedule/manage">
              <Plus className="h-4 w-4 mr-2" />
              Manage Availability
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
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
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Schedule Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-healthy-600">
                    {appointments.filter(a => a.status !== 'cancelled').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-healthy-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'confirmed').length}
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
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {appointments.filter(a => a.status === 'scheduled').length}
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Review</Badge>
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
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Appointments for {new Date(selectedDate).toLocaleDateString()}</h2>
            <p className="text-sm text-gray-500">{filteredAppointments.length} appointments</p>
          </div>

          {filteredAppointments.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-4">
                  {appointments.length === 0 
                    ? "You don't have any appointments scheduled for this date."
                    : "No appointments match your current filters."
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
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-healthy-400 to-nature-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{appointment.patientName}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {getTimeSlot(appointment.appointment_date, appointment.appointment_time)}
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
                        <p className="font-medium">{appointment.specialty}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{appointment.duration_minutes ? `${appointment.duration_minutes} min` : '30 min'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{appointment.patientPhone}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium">{appointment.appointment_type || 'Consultation'}</p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div>
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm mt-1">{appointment.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`tel:${appointment.patientPhone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={createWhatsAppUrl(appointment.patientPhone || '', appointment)} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                      
                      {appointment.status === 'scheduled' && (
                        <div className="flex gap-1 ml-auto">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Mark Complete
                        </Button>
                      )}
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

export default DoctorSchedule; 