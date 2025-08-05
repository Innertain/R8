
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Users, Database, AlertTriangle } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Draft Version
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Effective: Demo Period
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Last Updated: January 2025
            </Badge>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your privacy and data security are fundamental to our mission of building resilient communities. 
            This policy explains how we collect, protect, and use your information transparently.
          </p>
        </div>

        {/* Key Principles */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Our Privacy Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <strong>Privacy by Design:</strong> Data protection built into every feature
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <strong>Minimal Collection:</strong> Only data necessary for emergency response
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <strong>Community Control:</strong> You decide what to share and when
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <strong>Full Transparency:</strong> Clear explanation of all data use
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Volunteer Registration Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Contact Information:</strong> Name, phone number, email address</li>
                <li>• <strong>Availability:</strong> Time slots you're available to help</li>
                <li>• <strong>Skills & Capabilities:</strong> Driving ability, special skills, equipment access</li>
                <li>• <strong>Location Data:</strong> General area for volunteer matching (no precise tracking)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Emergency Alert Preferences</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Geographic areas you want alerts for</li>
                <li>• Types of emergencies you're interested in</li>
                <li>• Communication preferences (SMS, email)</li>
                <li>• Alert frequency settings</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Usage Analytics (Anonymous)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Page views and feature usage (no personal identification)</li>
                <li>• Error reports for system improvement</li>
                <li>• Geographic patterns for resource allocation</li>
                <li>• System performance metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-800">Emergency Response & Coordination</h4>
              <p className="text-gray-700">
                Match volunteers with community needs, coordinate disaster response efforts, 
                and facilitate mutual aid connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Critical Alert Delivery</h4>
              <p className="text-gray-700">
                Send timely emergency notifications, weather warnings, and community safety updates 
                based on your location and preferences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800">Platform Improvement</h4>
              <p className="text-gray-700">
                Analyze usage patterns to improve features, identify community needs, 
                and enhance emergency preparedness tools.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Data Security & Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Technical Safeguards</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• End-to-end encryption for sensitive data</li>
                  <li>• Secure database storage with access controls</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Multi-factor authentication for admin access</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Access Controls</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Minimum necessary access principle</li>
                  <li>• Background checks for staff</li>
                  <li>• Audit logs for all data access</li>
                  <li>• Regular access review and rotation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-blue-800">Access & Portability</h4>
                  <p className="text-sm text-gray-600">
                    Request a copy of all your data at any time
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Correction</h4>
                  <p className="text-sm text-gray-600">
                    Update or correct any inaccurate information
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800">Deletion</h4>
                  <p className="text-sm text-gray-600">
                    Request complete removal of your account and data
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-orange-800">Consent Control</h4>
                  <p className="text-sm text-gray-600">
                    Modify or withdraw consent for data processing
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">Restriction</h4>
                  <p className="text-sm text-gray-600">
                    Limit how your data is processed or shared
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Complaint</h4>
                  <p className="text-sm text-gray-600">
                    Report privacy concerns to appropriate authorities
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sharing & Third Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <strong className="text-yellow-800">Emergency Situations Only</strong>
                  <p className="text-yellow-700 text-sm mt-1">
                    We may share essential contact information with emergency responders, 
                    verified aid organizations, or authorities during active disasters to save lives.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">We Never Share For:</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Commercial marketing or advertising</li>
                <li>• Data broker sales or monetization</li>
                <li>• Non-emergency government surveillance</li>
                <li>• Social media integration or cross-platform tracking</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Service Providers (With Strict Contracts):</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• SMS delivery services (for emergency alerts only)</li>
                <li>• Secure cloud hosting providers</li>
                <li>• Security monitoring services</li>
                <li>• All providers sign data protection agreements</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us & Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Privacy Concerns or Questions</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Email:</strong> privacy@bioregion-resilience.org</p>
                  <p><strong>Response Time:</strong> Within 48 hours</p>
                  <p><strong>Subject Line:</strong> "Privacy Policy Question"</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Policy Updates</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>We'll notify you 30 days before any material changes</p>
                  <p>Check this page regularly for updates</p>
                  <p>Continued use implies acceptance of changes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>This is a draft privacy policy for demonstration purposes.</p>
          <p>Final version will be reviewed by legal experts before production deployment.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
