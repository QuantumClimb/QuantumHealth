import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, Eye, EyeOff, Award, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { multiTenantService, type DoctorProfile } from '@/services/supabaseService';

const DoctorProfile = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailVisible, setEmailVisible] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    license_number: '',
    experience_years: '',
    qualifications: '',
    clinic_name: '',
    consultation_fee: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const doctorProfile = await multiTenantService.getCurrentDoctorProfile();
      setProfile(doctorProfile);
      setEditForm({
        first_name: doctorProfile?.first_name || '',
        last_name: doctorProfile?.last_name || '',
        email: doctorProfile?.email || '',
        phone: doctorProfile?.phone || '',
        specialization: doctorProfile?.specialization || '',
        license_number: doctorProfile?.license_number || '',
        experience_years: doctorProfile?.experience_years?.toString() || '',
        qualifications: doctorProfile?.qualifications?.join(', ') || '',
        clinic_name: doctorProfile?.clinic_name || '',
        consultation_fee: doctorProfile?.consultation_fee?.toString() || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      specialization: profile?.specialization || '',
      license_number: profile?.license_number || '',
      experience_years: profile?.experience_years?.toString() || '',
      qualifications: profile?.qualifications?.join(', ') || '',
      clinic_name: profile?.clinic_name || '',
      consultation_fee: profile?.consultation_fee?.toString() || ''
    });
  };

  const handleSave = async () => {
    try {
      if (profile) {
        const updatedProfile = await multiTenantService.updateDoctorProfile({
          ...profile,
          ...editForm,
          experience_years: parseInt(editForm.experience_years) || 0,
          qualifications: editForm.qualifications.split(',').map(q => q.trim()).filter(q => q),
          consultation_fee: parseFloat(editForm.consultation_fee) || 0
        });
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
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

  if (!profile) {
    return (
      <Layout userRole="doctor">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Please complete your profile setup first.</p>
          <Button asChild>
            <Link to="/doctor/settings">Complete Profile</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="doctor">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold">Doctor Profile</h1>
              <p className="text-gray-600">Manage your professional information</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} className="bg-gradient-to-r from-healthy-400 to-nature-500">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-healthy-400 to-nature-500">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-healthy-400 to-nature-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profile.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription>{profile.specialization}</CardDescription>
                <Badge className="mt-2 bg-blue-100 text-blue-700">Doctor ID: {profile.id}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">License</span>
                  <span className="text-sm font-medium">{profile.licenseNumber || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Experience</span>
                  <span className="text-sm font-medium">{profile.experience || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Consultation Fee</span>
                  <span className="text-sm font-medium">
                    ${profile.consultationFee || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-healthy-500" />
                    <span className="text-sm text-gray-600">Today's Appointments</span>
                  </div>
                  <Badge variant="outline">5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-healthy-500" />
                    <span className="text-sm text-gray-600">Total Patients</span>
                  </div>
                  <Badge variant="outline">127</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-healthy-500" />
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <Badge variant="outline">4.8/5</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Personal Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic information and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{profile.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      {isEditing ? (
                        <Input
                          id="specialization"
                          name="specialization"
                          value={editForm.specialization}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{profile.specialization}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {isEditing ? (
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={editForm.email}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <>
                            <p className="text-sm font-medium">
                              {emailVisible ? profile.email : '•••••••••••••'}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEmailVisible(!emailVisible)}
                            >
                              {emailVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {isEditing ? (
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={editForm.phone}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <>
                            <p className="text-sm font-medium">
                              {phoneVisible ? profile.phone : '•••••••••••'}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPhoneVisible(!phoneVisible)}
                            >
                              {phoneVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Your medical credentials and experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      {isEditing ? (
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          value={editForm.licenseNumber}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{profile.licenseNumber || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      {isEditing ? (
                        <Input
                          id="experience"
                          name="experience"
                          value={editForm.experience}
                          onChange={handleInputChange}
                          placeholder="e.g., 10 years"
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{profile.experience || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                      {isEditing ? (
                        <Input
                          id="consultationFee"
                          name="consultationFee"
                          type="number"
                          value={editForm.consultationFee}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">${profile.consultationFee || 0}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="languages">Languages Spoken</Label>
                      {isEditing ? (
                        <Input
                          id="languages"
                          name="languages"
                          value={editForm.languages}
                          onChange={handleInputChange}
                          placeholder="e.g., English, Spanish"
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{profile.languages || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="education">Education</Label>
                    {isEditing ? (
                      <Textarea
                        id="education"
                        name="education"
                        value={editForm.education}
                        onChange={handleInputChange}
                        placeholder="List your degrees and institutions"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.education || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        name="bio"
                        value={editForm.bio}
                        onChange={handleInputChange}
                        placeholder="Tell patients about your expertise and approach"
                        className="mt-1"
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{profile.bio || 'No bio available'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile; 