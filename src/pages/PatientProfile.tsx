import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { multiTenantService, type PatientProfile } from '@/services/supabaseService';

const PatientProfile = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailVisible, setEmailVisible] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const patientProfile = await multiTenantService.getCurrentPatientProfile();
      setProfile(patientProfile);
      setEditForm({
        name: patientProfile?.name || '',
        email: patientProfile?.email || '',
        phone: patientProfile?.phone || '',
        dateOfBirth: patientProfile?.dateOfBirth || '',
        bloodType: patientProfile?.bloodType || '',
        allergies: patientProfile?.allergies || '',
        emergencyContact: patientProfile?.emergencyContact || '',
        emergencyPhone: patientProfile?.emergencyPhone || ''
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
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.dateOfBirth || '',
      bloodType: profile?.bloodType || '',
      allergies: profile?.allergies || '',
      emergencyContact: profile?.emergencyContact || '',
      emergencyPhone: profile?.emergencyPhone || ''
    });
  };

  const handleSave = async () => {
    try {
      if (profile) {
        const updatedProfile = await multiTenantService.updatePatientProfile({
          ...profile,
          ...editForm
        });
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Layout userRole="patient">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout userRole="patient">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Please complete your profile setup first.</p>
          <Button asChild>
            <Link to="/patient/settings">Complete Profile</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="patient">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-2xl font-bold">Patient Profile</h1>
              <p className="text-gray-600">Manage your personal information</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <CardDescription>Patient ID: {profile.id}</CardDescription>
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
                  <span className="text-sm text-gray-500">Blood Type</span>
                  <span className="text-sm font-medium">{profile.bloodType || 'Not specified'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
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
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}
                      </p>
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

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  {isEditing ? (
                    <Input
                      id="allergies"
                      name="allergies"
                      value={editForm.allergies}
                      onChange={handleInputChange}
                      placeholder="List any allergies or 'None'"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{profile.allergies || 'None specified'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={editForm.emergencyContact}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.emergencyContact || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyPhone"
                        name="emergencyPhone"
                        type="tel"
                        value={editForm.emergencyPhone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.emergencyPhone || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile; 