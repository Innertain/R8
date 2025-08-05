
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Bell, Users, Building, PhoneCall } from "lucide-react";

export function AlertPricingPlans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Individual",
      description: "Perfect for personal emergency notifications",
      icon: <Bell className="w-6 h-6 text-blue-600" />,
      price: billingCycle === 'monthly' ? 3 : 30,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $6/year' : null,
      features: [
        "Up to 5 custom alert rules",
        "Email & SMS notifications",
        "Basic geographic filtering",
        "24-hour alert history",
        "Community support"
      ],
      limitations: [
        "50 alerts per month",
        "Basic notification methods only"
      ],
      cta: "Start Individual Plan",
      popular: false
    },
    {
      name: "Non-Profit",
      description: "Designed for community organizations",
      icon: <Users className="w-6 h-6 text-green-600" />,
      price: billingCycle === 'monthly' ? 5 : 50,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $10/year' : null,
      features: [
        "Up to 15 custom alert rules",
        "Email, SMS & webhook notifications",
        "Advanced geographic filtering",
        "30-day alert history",
        "Priority community support",
        "Multi-user dashboard access",
        "Volunteer coordination features"
      ],
      limitations: [
        "200 alerts per month",
        "Up to 3 team members"
      ],
      cta: "Start Non-Profit Plan",
      popular: true
    },
    {
      name: "Small Business",
      description: "Comprehensive alerts for business continuity",
      icon: <Building className="w-6 h-6 text-purple-600" />,
      price: billingCycle === 'monthly' ? 10 : 100,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $20/year' : null,
      features: [
        "Unlimited custom alert rules",
        "All notification methods",
        "Advanced filtering & routing",
        "90-day alert history",
        "Email & phone support",
        "Team management (up to 10 users)",
        "API access for integrations",
        "Custom notification templates"
      ],
      limitations: [
        "500 alerts per month"
      ],
      cta: "Start Business Plan",
      popular: false
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      icon: <PhoneCall className="w-6 h-6 text-orange-600" />,
      price: null,
      period: 'Custom pricing',
      features: [
        "Unlimited everything",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "24/7 premium support",
        "White-label options",
        "Advanced analytics",
        "Compliance reporting",
        "Custom deployment options"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
          Custom Alert Plans
        </Badge>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Alert Protection Level
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Get personalized emergency notifications tailored to your needs. 
          From individual protection to enterprise-scale monitoring.
        </p>
        
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
              Save up to 17%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative hover:shadow-lg transition-shadow ${
              plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">
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
              
              <div className="mt-4">
                {plan.price !== null ? (
                  <div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-sm text-green-600 mt-1">{plan.savings}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-semibold text-gray-900">{plan.period}</div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Button 
                className={`w-full mb-6 ${
                  plan.name === 'Enterprise' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : ''
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">Features included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Limits:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-gray-500">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">Need a custom solution?</h3>
          <p className="text-blue-800 text-sm mb-4">
            Our Enterprise plan can be tailored to your specific requirements including custom API integrations, 
            dedicated infrastructure, compliance certifications, and specialized support.
          </p>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            <PhoneCall className="w-4 h-4 mr-2" />
            Schedule Enterprise Consultation
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-center mb-6">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What counts as an alert?</h4>
            <p className="text-sm text-gray-600">
              Each notification sent (email, SMS, or webhook) counts as one alert. 
              A single emergency event triggering multiple notification methods counts as multiple alerts.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Can I upgrade anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes! You can upgrade your plan at any time. Your billing will be prorated, 
              and you'll immediately get access to the higher tier features.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What data sources are included?</h4>
            <p className="text-sm text-gray-600">
              All plans include access to NOAA weather alerts, USGS earthquake data, 
              NASA EONET events, and FEMA disaster declarations.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Is there a free trial?</h4>
            <p className="text-sm text-gray-600">
              Yes! All paid plans come with a 14-day free trial. 
              No credit card required to start your trial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
