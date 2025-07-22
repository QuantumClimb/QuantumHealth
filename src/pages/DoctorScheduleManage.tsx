import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Save, Plus, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { multiTenantService, type DoctorProfile } from '@/services/supabaseService';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

const DoctorScheduleManage = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: 'Monday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Tuesday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Wednesday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Thursday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Friday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Saturday', enabled: false, slots: [{ start: '09:00', end: '13:00' }] },
    { day: 'Sunday', enabled: false, slots: [{ start: '10:00', end: '14:00' }] },
  ]);

  const [settings, setSettings] = useState({
    appointmentDuration: 30,
    breakBetweenAppointments: 15,
    maxAppointmentsPerDay: 20,
    advanceBookingDays: 30,
    allowSameDayBooking: true,
    allowWeekendBooking: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const doctorProfile = await multiTenantService.getCurrentDoctorProfile();
      setProfile(doctorProfile);
      
      // Load saved schedule if available
      if (doctorProfile?.availability) {
        try {
          const savedSchedule = JSON.parse(doctorProfile.availability as string);
          if (Array.isArray(savedSchedule)) {
            setSchedule(savedSchedule);
          }
        } catch (error) {
          console.error('Failed to parse saved schedule:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, enabled: !day.enabled } : day
    ));
  };

  const addTimeSlot = (dayIndex: number) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, slots: [...day.slots, { start: '09:00', end: '17:00' }] }
        : day
    ));
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { ...day, slots: day.slots.filter((_, slotIdx) => slotIdx !== slotIndex) }
        : day
    ));
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            slots: day.slots.map((slot, slotIdx) => 
              slotIdx === slotIndex ? { ...slot, [field]: value } : slot
            )
          }
        : day
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (profile) {
        const updatedProfile = await multiTenantService.updateDoctorProfile({
          ...profile,
          availability: JSON.stringify(schedule)
        });
        setProfile(updatedProfile);
        // Show success message
        console.log('Schedule saved successfully');
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
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
              <Link to="/doctor/schedule">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schedule
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Manage Availability</h1>
              <p className="text-gray-600">Set your working hours and appointment preferences</p>
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
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Settings */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription>
                  Set your availability for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {schedule.map((day, dayIndex) => (
                  <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={day.enabled}
                          onCheckedChange={() => handleDayToggle(dayIndex)}
                        />
                        <Label className="text-lg font-medium">{day.day}</Label>
                        {day.enabled && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Available
                          </Badge>
                        )}
                      </div>
                      {day.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(dayIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Time Slot
                        </Button>
                      )}
                    </div>

                    {day.enabled && (
                      <div className="space-y-3">
                        {day.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-gray-500">to</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            {day.slots.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!day.enabled && (
                      <div className="text-center py-4 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Not available on {day.day}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Appointment Settings */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Appointment Settings
                </CardTitle>
                <CardDescription>
                  Configure your appointment preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="duration">Appointment Duration (minutes)</Label>
                  <Select 
                    value={settings.appointmentDuration.toString()} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, appointmentDuration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="break">Break Between Appointments (minutes)</Label>
                  <Select 
                    value={settings.breakBetweenAppointments.toString()} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, breakBetweenAppointments: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No break</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxAppointments">Max Appointments Per Day</Label>
                  <Input
                    type="number"
                    value={settings.maxAppointmentsPerDay}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxAppointmentsPerDay: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
                  <Input
                    type="number"
                    value={settings.advanceBookingDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, advanceBookingDays: parseInt(e.target.value) }))}
                    min="1"
                    max="365"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sameDay">Allow Same Day Booking</Label>
                  <Switch
                    checked={settings.allowSameDayBooking}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowSameDayBooking: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weekend">Allow Weekend Booking</Label>
                  <Switch
                    checked={settings.allowWeekendBooking}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowWeekendBooking: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Working Days:</span>
                  <span className="font-medium">{schedule.filter(d => d.enabled).length}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Hours/Week:</span>
                  <span className="font-medium">
                    {schedule
                      .filter(d => d.enabled)
                      .reduce((total, day) => {
                        return total + day.slots.reduce((dayTotal, slot) => {
                          const start = new Date(`2000-01-01T${slot.start}`);
                          const end = new Date(`2000-01-01T${slot.end}`);
                          return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        }, 0);
                      }, 0).toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Patients/Week:</span>
                  <span className="font-medium">
                    {Math.floor(schedule
                      .filter(d => d.enabled)
                      .reduce((total, day) => {
                        return total + day.slots.reduce((dayTotal, slot) => {
                          const start = new Date(`2000-01-01T${slot.start}`);
                          const end = new Date(`2000-01-01T${slot.end}`);
                          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                          return dayTotal + Math.floor(hours * 60 / (settings.appointmentDuration + settings.breakBetweenAppointments));
                        }, 0);
                      }, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorScheduleManage; 