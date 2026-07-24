import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Pending Approval - QUANTUM HEALTH"
        description="Your doctor registration is pending approval. Please check your email for confirmation."
        keywords="pending approval, doctor registration, email confirmation, healthcare provider approval"
        url="https://quantumhealth.quantum-climb.com/pending-approval"
        tags={['pending', 'approval', 'doctor registration']}
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text mb-2">
            QUANTUM HEALTH
          </h1>
          <p className="text-gray-500">Revolutionary healthcare management platform</p>
        </div>
        
        <Card className="w-full max-w-md glass-card animate-scale-in shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Registration Pending</CardTitle>
            <CardDescription>
              Your doctor account is awaiting email confirmation
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email to your registered address. 
                    Please click the verification link to activate your account.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">What's Next?</h3>
                  <p className="text-sm text-gray-600">
                    Once confirmed, you'll be able to set up your clinic and start 
                    managing patients through our platform.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
                variant="outline"
              >
                Back to Login
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate('/password-reset')}
                  >
                    contact support
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PendingApproval;
