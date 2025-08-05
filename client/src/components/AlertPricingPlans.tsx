
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MessageSquare, Users, Building, PhoneCall, Zap, School, Church, Store } from "lucide-react";

export function AlertPricingPlans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Small Group",
      description: "Perfect for small teams, classrooms, or family groups",
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      userLimit: "Up to 25 users",
      price: billingCycle === 'monthly' ? 15 : 150,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $30/year' : null,
      pricePerUser: billingCycle === 'monthly' ? '$0.60' : '$0.50',
      monthlyMessages: "500 custom messages/month",
      extraMessageFee: "$0.05 per additional message",
      features: [
        "25 recipients included",
        "500 custom messages per month",
        "Email & SMS delivery",
        "Message scheduling",
        "Basic message templates",
        "Group management",
        "Message history (30 days)",
        "Email support"
      ],
      emergencyFeatures: [
        "FREE Emergency Weather Alerts",
        "FREE Disaster Notifications", 
        "FREE Earthquake Updates",
        "Geographic filtering included"
      ],
      useCases: ["Small businesses", "Classrooms", "Sports teams", "Family groups"],
      cta: "Start Small Group Plan",
      popular: false
    },
    {
      name: "Non-Profit",
      description: "Special pricing for qualifying non-profits and NGOs",
      icon: <Church className="w-6 h-6 text-green-600" />,
      userLimit: "Up to 100 users",
      price: billingCycle === 'monthly' ? 35 : 350,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $70/year' : null,
      pricePerUser: billingCycle === 'monthly' ? '$0.35' : '$0.29',
      specialNote: "501(c)(3) verification required",
      monthlyMessages: "1,500 custom messages/month",
      extraMessageFee: "$0.04 per additional message",
      features: [
        "100 recipients included",
        "1,500 custom messages per month",
        "Email, SMS & voice calls",
        "Advanced message scheduling",
        "Custom message templates",
        "Volunteer management tools",
        "Message analytics & tracking",
        "Priority support",
        "Donation campaign integration",
        "Event coordination tools"
      ],
      emergencyFeatures: [
        "FREE Emergency Weather Alerts",
        "FREE Disaster Notifications",
        "FREE Community Safety Updates",
        "Emergency response coordination",
        "Crisis communication templates"
      ],
      useCases: ["Non-profit organizations", "NGOs", "Community groups", "Charitable foundations"],
      cta: "Apply for Non-Profit Plan",
      popular: false,
      discount: "40% off regular pricing"
    },
    {
      name: "Medium Organization",
      description: "Ideal for schools, churches, and growing businesses",
      icon: <Users className="w-6 h-6 text-green-600" />,
      userLimit: "Up to 150 users",
      price: billingCycle === 'monthly' ? 75 : 750,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $150/year' : null,
      pricePerUser: billingCycle === 'monthly' ? '$0.50' : '$0.42',
      monthlyMessages: "3,000 custom messages/month",
      extraMessageFee: "$0.03 per additional message",
      features: [
        "150 recipients included",
        "3,000 custom messages per month", 
        "Email, SMS & voice calls",
        "Advanced message scheduling",
        "Custom message templates",
        "Multi-admin management",
        "Message analytics & delivery tracking",
        "Priority support",
        "API access for integrations"
      ],
      emergencyFeatures: [
        "FREE Emergency Weather Alerts",
        "FREE Disaster Notifications",
        "FREE Earthquake & Wildfire Updates", 
        "Advanced geographic filtering",
        "Emergency alert customization"
      ],
      useCases: ["Schools & Universities", "Churches & Religious Groups", "Non-profits", "Medium businesses"],
      cta: "Start Medium Plan",
      popular: true
    },
    {
      name: "Large Enterprise",
      description: "Comprehensive solution for large organizations",
      icon: <Building className="w-6 h-6 text-purple-600" />,
      userLimit: "Up to 1,000 users",
      price: billingCycle === 'monthly' ? 300 : 3000,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $600/year' : null,
      pricePerUser: billingCycle === 'monthly' ? '$0.30' : '$0.25',
      monthlyMessages: "10,000 custom messages/month",
      extraMessageFee: "$0.02 per additional message",
      features: [
        "1,000 recipients included",
        "10,000 custom messages per month",
        "All delivery methods + webhooks",
        "Advanced automation & workflows",
        "White-label message templates",
        "Multi-location management", 
        "Advanced analytics & reporting",
        "Dedicated account manager",
        "Full API access & integrations",
        "SSO authentication"
      ],
      emergencyFeatures: [
        "FREE Emergency Weather Alerts",
        "FREE All Disaster Notifications",
        "FREE Real-time Emergency Updates",
        "Custom emergency protocols",
        "Emergency escalation workflows",
        "Crisis communication templates"
      ],
      useCases: ["Large corporations", "School districts", "Healthcare systems", "Government agencies"],
      cta: "Start Enterprise Plan",
      popular: false
    },
    {
      name: "Custom Scale",
      description: "Tailored solutions for massive organizations",
      icon: <PhoneCall className="w-6 h-6 text-orange-600" />,
      userLimit: "1,000+ users",
      price: null,
      period: 'Custom pricing',
      pricePerUser: 'Volume discounts available',
      monthlyMessages: "Unlimited custom messages",
      extraMessageFee: "Volume pricing available",
      features: [
        "Unlimited recipients",
        "Unlimited custom messages",
        "Custom delivery infrastructure",
        "Dedicated infrastructure",
        "Custom integrations & APIs",
        "24/7 premium support",
        "SLA guarantees",
        "Compliance certifications",
        "Custom deployment options",
        "Advanced security features"
      ],
      emergencyFeatures: [
        "FREE All Emergency Services",
        "Custom emergency data feeds", 
        "Priority emergency notifications",
        "Custom crisis management tools",
        "Emergency response integration"
      ],
      useCases: ["Fortune 500 companies", "Federal agencies", "State governments", "Major universities"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
          Custom Group Messaging Platform
        </Badge>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Instantly Connect With Your Entire Group
        </h2>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-6">
          Send custom messages to your entire organization instantly via SMS, email, and voice calls. 
          Perfect for schools, churches, businesses, and any group that needs reliable mass communication.
          <span className="font-semibold text-green-600"> Emergency alerts included at no extra cost.</span>
        </p>

        {/* Use Case Icons */}
        <div className="flex justify-center items-center gap-6 mb-6 text-sm text-gray-600">
          <div className="flex flex-col items-center gap-2">
            <School className="w-8 h-8 text-blue-500" />
            <span>Schools</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Church className="w-8 h-8 text-purple-500" />
            <span>Churches</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Store className="w-8 h-8 text-green-500" />
            <span>Businesses</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-orange-500" />
            <span>Non-Profits</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Building className="w-8 h-8 text-red-500" />
            <span>Organizations</span>
          </div>
        </div>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
              Save up to 20%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative hover:shadow-lg transition-shadow ${
              plan.popular ? 'ring-2 ring-green-500 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                {plan.icon}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              <div className="text-sm font-medium text-blue-600 mb-1">{plan.userLimit}</div>
              <div className="text-sm text-gray-600 mb-2">{plan.monthlyMessages}</div>
              
              <div className="mt-4">
                {plan.price !== null ? (
                  <div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{plan.pricePerUser} per user</div>
                    <div className="text-xs text-gray-500 mt-1">Extra: {plan.extraMessageFee}</div>
                    {plan.savings && (
                      <p className="text-sm text-green-600 mt-1">{plan.savings}</p>
                    )}
                    {plan.discount && (
                      <p className="text-sm text-green-600 font-medium mt-1">{plan.discount}</p>
                    )}
                    {plan.specialNote && (
                      <p className="text-xs text-gray-500 mt-2">{plan.specialNote}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-semibold text-gray-900">{plan.period}</div>
                    <div className="text-sm text-gray-500 mt-1">{plan.pricePerUser}</div>
                    <div className="text-xs text-gray-500 mt-1">{plan.extraMessageFee}</div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Button 
                className={`w-full mb-6 ${
                  plan.name === 'Custom Scale' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : plan.popular 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : ''
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Custom Messaging Features:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    FREE Emergency Alerts:
                  </h4>
                  <ul className="space-y-1">
                    {plan.emergencyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-green-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Perfect for:</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.useCases.map((useCase, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Value Proposition */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-8 max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Our Platform?</h3>
          <p className="text-gray-700">The complete solution for group communication and emergency preparedness</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Custom Group Messaging</h4>
            <p className="text-sm text-gray-600">
              Send instant messages to your entire group via SMS, email, and voice calls. 
              Perfect for announcements, alerts, and important updates.
            </p>
          </div>
          <div className="text-center">
            <Zap className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">FREE Emergency Alerts</h4>
            <p className="text-sm text-gray-600">
              Automatic weather warnings, disaster notifications, and emergency updates 
              sent to your group at no additional cost.
            </p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Easy Group Management</h4>
            <p className="text-sm text-gray-600">
              Simple tools to manage your contact lists, create message templates, 
              and track delivery across all communication channels.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-center mb-6">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">How does pricing work?</h4>
            <p className="text-sm text-gray-600">
              Plans are based on the number of recipients in your group. You can send unlimited custom messages 
              to all recipients in your plan. Emergency alerts are always free.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What counts as a custom message?</h4>
            <p className="text-sm text-gray-600">
              Any message you personally write and send to your group - announcements, reminders, 
              updates, etc. Emergency alerts from weather services don't count toward any limits.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Can I upgrade my plan?</h4>
            <p className="text-sm text-gray-600">
              Yes! Upgrade anytime as your group grows. Your billing will be prorated, 
              and you'll immediately get access to support more recipients.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Do you offer free trials?</h4>
            <p className="text-sm text-gray-600">
              Yes! All plans include a 14-day free trial with full access to custom messaging 
              and emergency alerts. No credit card required to start.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">How do I qualify for non-profit pricing?</h4>
            <p className="text-sm text-gray-600">
              Valid 501(c)(3) status or equivalent NGO documentation required. 
              Apply with your tax-exempt certificate to receive 40% off regular pricing.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What happens if I exceed my monthly message limit?</h4>
            <p className="text-sm text-gray-600">
              Additional custom messages beyond your plan limit are charged per message. 
              Emergency disaster alerts are always free within reasonable usage limits.
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Disclaimers */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Terms & Disclaimers</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Emergency Messaging</h4>
            <p className="mb-3">
              Emergency disaster alerts in your area are provided free within reasonable usage limits. 
              These include weather warnings, natural disasters, and public safety notifications.
            </p>
            
            <h4 className="font-medium mb-2">Carrier Charges</h4>
            <p className="mb-3">
              Standard cellphone and carrier message/data charges may apply. 
              Contact your mobile carrier for specific rates and terms.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">User Consent & Opt-Out</h4>
            <p className="mb-3">
              All users must provide explicit permission to receive messages. 
              Users may opt out at any time by replying STOP or through account settings.
            </p>
            
            <h4 className="font-medium mb-2">Terms of Service</h4>
            <p>
              By using our service, you agree to our Terms of Service and Privacy Policy. 
              User consent is required for all messaging services.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <div className="bg-blue-600 text-white rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Ready to Connect Your Group?</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of organizations using our platform to keep their communities informed and safe.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3">
            Start Your Free Trial Today
          </Button>
          <p className="text-sm text-blue-200 mt-4">
            No credit card required • Cancel anytime • 14-day free trial
          </p>
        </div>
      </div>
    </div>
  );
}
