
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Shield, Users, AlertTriangle, Heart, Clock } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Terms of Service</h1>
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
            These terms govern your use of our disaster response and community resilience platform. 
            By using our services, you agree to help build stronger, more prepared communities.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              Our Mission & Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              This platform exists to strengthen community resilience, facilitate mutual aid, 
              and improve disaster preparedness. We believe in:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Community First:</strong> Decisions benefit local communities</li>
                <li>• <strong>Accessibility:</strong> Tools available to everyone</li>
                <li>• <strong>Transparency:</strong> Open about operations and data use</li>
              </ul>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Non-Discrimination:</strong> Support for all community members</li>
                <li>• <strong>Sustainability:</strong> Long-term community resilience</li>
                <li>• <strong>Safety First:</strong> Protect volunteers and aid recipients</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance & Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance & Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Agreement to Terms</h4>
              <p className="text-gray-700">
                By accessing or using this platform, you agree to be bound by these Terms of Service 
                and our Privacy Policy. If you disagree with any part of these terms, 
                please do not use our services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Eligibility Requirements</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Must be at least 16 years old (or have parental consent)</li>
                <li>• Provide accurate registration information</li>
                <li>• Comply with all applicable local, state, and federal laws</li>
                <li>• Act in good faith to support community resilience</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Services */}
        <Card>
          <CardHeader>
            <CardTitle>2. Platform Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Emergency Alert System</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Real-time weather and disaster notifications</li>
                <li>• Community safety updates and evacuation information</li>
                <li>• Resource availability and emergency shelter locations</li>
                <li>• Critical infrastructure status updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Volunteer Coordination</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Volunteer registration and skill matching</li>
                <li>• Shift scheduling and availability management</li>
                <li>• Task assignment and coordination tools</li>
                <li>• Communication between volunteers and coordinators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Resource Mapping & Data</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Interactive maps showing aid distribution sites</li>
                <li>• Real-time inventory tracking for community resources</li>
                <li>• Bioregional data and ecological information</li>
                <li>• Wildlife conservation and environmental monitoring</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              3. User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Volunteer Commitments</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Show up for scheduled volunteer shifts or provide advance notice</li>
                <li>• Follow safety protocols and coordinator instructions</li>
                <li>• Treat all community members with respect and dignity</li>
                <li>• Maintain confidentiality of sensitive information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Information Accuracy</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Provide accurate contact information and availability</li>
                <li>• Update your profile when circumstances change</li>
                <li>• Report any system errors or safety concerns immediately</li>
                <li>• Use the platform only for legitimate community assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Prohibited Activities</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Using the platform for commercial purposes without permission</li>
                <li>• Sharing false or misleading emergency information</li>
                <li>• Harassment, discrimination, or harmful behavior</li>
                <li>• Attempting to access unauthorized system areas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Disclaimers */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              4. Emergency Service Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <strong className="text-red-800 block mb-2">IMPORTANT: This is NOT 911</strong>
              <p className="text-red-700 text-sm">
                Our platform supplements but does not replace official emergency services. 
                For life-threatening emergencies, always call 911 first.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Information Accuracy</h4>
              <p className="text-gray-700 text-sm">
                While we strive for accuracy, emergency information may be outdated or incomplete. 
                Always verify critical information through official sources before taking action.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Volunteer Safety</h4>
              <p className="text-gray-700 text-sm">
                Volunteers participate at their own risk. We provide safety guidelines but cannot 
                guarantee protection from all hazards. Use good judgment and prioritize your safety.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Liability & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle>5. Liability & Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Platform Limitations</h4>
              <p className="text-gray-700 text-sm">
                We provide this platform "as is" without warranties. We are not liable for 
                service interruptions, data loss, or decisions made based on platform information.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Volunteer Insurance</h4>
              <p className="text-gray-700 text-sm">
                Volunteers should verify their own insurance coverage. Some activities may be 
                covered by partner organization policies, but this varies by situation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Third-Party Content</h4>
              <p className="text-gray-700 text-sm">
                We aggregate information from government agencies, weather services, and community 
                reports. We are not responsible for the accuracy of third-party content.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              6. Data Usage & Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Your Data Rights</h4>
              <p className="text-gray-700 text-sm">
                You retain ownership of any personal information you provide. We use your data 
                only as described in our Privacy Policy and with your consent.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Platform Content</h4>
              <p className="text-gray-700 text-sm">
                Our software, design, and compiled data are protected by intellectual property laws. 
                You may not copy, redistribute, or create derivative works without permission.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Open Source Components</h4>
              <p className="text-gray-700 text-sm">
                Some platform components use open source software. We respect and comply with 
                all applicable open source licenses.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              7. Service Availability & Modifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service Uptime</h4>
              <p className="text-gray-700 text-sm">
                We strive for 99.9% uptime but cannot guarantee uninterrupted service. 
                Maintenance windows will be announced in advance when possible.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Feature Updates</h4>
              <p className="text-gray-700 text-sm">
                We may modify features to improve functionality or comply with regulations. 
                Major changes will be announced with reasonable notice.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Service Termination</h4>
              <p className="text-gray-700 text-sm">
                We reserve the right to suspend accounts for terms violations. 
                Users may delete their accounts at any time through the platform settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle>8. Dispute Resolution & Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Informal Resolution</h4>
              <p className="text-gray-700 text-sm">
                We encourage resolving disputes through direct communication. 
                Contact us at disputes@bioregion-resilience.org for assistance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Mediation</h4>
              <p className="text-gray-700 text-sm">
                If informal resolution fails, we prefer mediation through a neutral third party 
                before pursuing formal legal action.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Governing Law</h4>
              <p className="text-gray-700 text-sm">
                These terms are governed by the laws of [State/Province], without regard to 
                conflict of law principles. (To be specified in final version)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Updates */}
        <Card>
          <CardHeader>
            <CardTitle>9. Contact Information & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Questions About These Terms</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Email:</strong> legal@bioregion-resilience.org</p>
                  <p><strong>Response Time:</strong> Within 5 business days</p>
                  <p><strong>Subject Line:</strong> "Terms of Service Question"</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Terms Updates</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>We'll notify users 30 days before material changes</p>
                  <p>Minor updates may be made with shorter notice</p>
                  <p>Continued use indicates acceptance of changes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6 space-y-2">
          <p>This is a draft Terms of Service for demonstration purposes.</p>
          <p>Final version will be reviewed by legal experts before production deployment.</p>
          <p className="font-semibold">Thank you for helping build resilient communities! 🌱</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
