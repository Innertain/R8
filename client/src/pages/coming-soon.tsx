
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Shield, Users, Globe } from 'lucide-react';

export default function ComingSoonPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Check if phone number is whitelisted
      const response = await fetch(`/api/whitelist/verify/${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      if (data.success && data.whitelisted) {
        setAccessGranted(true);
        setMessage('Access granted! You can now explore the platform.');
        
        // Store access token in session
        sessionStorage.setItem('platformAccess', 'granted');
        sessionStorage.setItem('accessUser', JSON.stringify(data.user));
        
        // Redirect to main app after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage('Phone number not found in our access list. Please contact our team for demo access.');
      }
    } catch (error) {
      setMessage('Error verifying access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Access Granted!</CardTitle>
            <CardDescription>
              Welcome to the Regenerative 8 platform. Redirecting you to the main application...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Globe className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Regenerative 8
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-6">
            Disaster Response & Ecosystem Regeneration Platform
          </p>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-200 text-lg font-medium">
              🚧 Platform Coming Soon - Demo Access Available
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <Shield className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle>Emergency Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Real-time disaster monitoring, alerts, and coordinated response systems.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <Users className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle>Volunteer Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Connect volunteers with opportunities for disaster relief and ecosystem restoration.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <Globe className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle>Ecosystem Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Track biodiversity, climate data, and regenerative projects across bioregions.</p>
            </CardContent>
          </Card>
        </div>

        {/* Access Form */}
        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <CardTitle>Request Demo Access</CardTitle>
            <CardDescription>
              Enter your phone number to check for demo access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Phone number (e.g., 555-DEMO)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="text-center text-lg"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !phoneNumber}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Check Access'
                )}
              </Button>
            </form>

            {message && (
              <Alert className={`mt-4 ${message.includes('granted') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <AlertDescription className={message.includes('granted') ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-gray-600 mb-2">
                Don't have access yet?
              </p>
              <p className="text-xs text-gray-500">
                Contact our team for demo access: <br />
                <span className="font-medium">team@regenerative8.org</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-blue-200 text-sm">
          <p>&copy; 2025 Regenerative 8. Building resilient communities through data-driven response.</p>
        </div>
      </div>
    </div>
  );
}
