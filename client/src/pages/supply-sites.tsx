import { useState } from "react";
import { Package, MapPin, Users, BookOpen, CheckCircle, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function SupplySitesPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  if (showOnboarding) {
    return <OnboardingWizard step={onboardingStep} setStep={setOnboardingStep} onClose={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30" data-testid="badge-mutual-aid">
              R8 Mutual Aid Network
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-supply-sites-heading">
              Supply Site Network
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100" data-testid="text-hero-description">
              Join our nationwide network of community supply sites helping people in need
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowOnboarding(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                data-testid="button-start-site"
              >
                <Package className="h-5 w-5 mr-2" />
                Start a Supply Site
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                data-testid="button-find-help"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Find Help Near You
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* What is a Supply Site Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-what-is-heading">What is a Supply Site?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400" data-testid="text-what-is-description">
              Supply sites are community-run locations that collect, store, and distribute aid to people in need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-xl transition-all" data-testid="card-site-type-pod">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>POD - Points of Distribution</CardTitle>
                <CardDescription>Sites that distribute supplies to community members in need</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all" data-testid="card-site-type-poc">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>POC - Points of Collection</CardTitle>
                <CardDescription>Sites that collect and organize donations from the community</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all" data-testid="card-site-type-community">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Community Centers</CardTitle>
                <CardDescription>Churches, schools, and centers serving as aid hubs</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Success Stories */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2" data-testid="text-success-heading">Proven Success in Western North Carolina</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4" data-testid="text-success-description">
                  After Hurricane Helene, our supply site network coordinated <strong>hundreds of locations</strong> across WNC and Appalachia, 
                  helping thousands of families access critical supplies when they needed them most.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="text-sm" data-testid="badge-sites-active">200+ Sites Active</Badge>
                  <Badge variant="secondary" className="text-sm" data-testid="badge-tons-distributed">1000+ Tons Distributed</Badge>
                  <Badge variant="secondary" className="text-sm" data-testid="badge-volunteers">5000+ Volunteers</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-12" data-testid="text-how-it-works-heading">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card data-testid="card-step-onboarding">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <CardTitle>Easy Onboarding</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Our guided setup walks you through everything - from site registration to safety protocols
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-step-training">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <CardTitle>Free Training & Resources</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Access templates, checklists, and best practices from our successful NC operations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-step-network">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <CardTitle>Connect to Network</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Get matched with volunteers, drivers, and other sites to optimize distribution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-step-support">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <CardTitle>Ongoing Support</CardTitle>
                </div>
                <CardDescription className="text-base">
                  24/7 support from our team and community of experienced site managers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-heading">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 opacity-90" data-testid="text-cta-description">
              Join the R8 network and help bring relief to communities in need
            </p>
            <Button
              size="lg"
              onClick={() => setShowOnboarding(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-6"
              data-testid="button-get-started"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Onboarding Wizard Component
function OnboardingWizard({ step, setStep, onClose }: { step: number; setStep: (step: number) => void; onClose: () => void }) {
  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const steps = [
    { title: "Welcome", component: <WelcomeStep /> },
    { title: "Site Type", component: <SiteTypeStep /> },
    { title: "Site Information", component: <SiteInfoStep /> },
    { title: "Training", component: <TrainingStep /> },
    { title: "Resources", component: <ResourcesStep /> },
    { title: "Complete", component: <CompleteStep onClose={onClose} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold" data-testid="text-onboarding-title">Supply Site Onboarding</h3>
            <Button variant="ghost" onClick={onClose} data-testid="button-close-onboarding">
              Close
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span data-testid="text-step-indicator">Step {step + 1} of {totalSteps}</span>
              <span data-testid="text-step-name">{steps[step].title}</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-onboarding" />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {steps[step].component}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              data-testid="button-previous-step"
            >
              Previous
            </Button>
            <Button
              onClick={() => setStep(Math.min(totalSteps - 1, step + 1))}
              disabled={step === totalSteps - 1}
              data-testid="button-next-step"
            >
              {step === totalSteps - 2 ? "Complete Setup" : "Next Step"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components (placeholders for now)
function WelcomeStep() {
  return (
    <Card data-testid="card-welcome-step">
      <CardHeader>
        <CardTitle className="text-3xl">Welcome to R8 Supply Sites!</CardTitle>
        <CardDescription className="text-lg mt-2">
          Thank you for joining our mutual aid network. This quick setup will get your site ready to serve your community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          In the next few steps, you'll:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Choose your site type and provide basic information</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Complete essential training modules</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Access templates and resources</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Connect to the R8 volunteer network</span>
          </li>
        </ul>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Estimated time:</strong> 10-15 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SiteTypeStep() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const siteTypes = [
    {
      id: "pod",
      name: "POD - Point of Distribution",
      description: "Distribute supplies to people in need",
      icon: Package,
      selectedClasses: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
      iconClasses: "text-blue-500"
    },
    {
      id: "poc",
      name: "POC - Point of Collection",
      description: "Collect and organize donations",
      icon: Users,
      selectedClasses: "border-green-500 bg-green-50 dark:bg-green-900/20",
      iconClasses: "text-green-500"
    },
    {
      id: "community",
      name: "Community Center",
      description: "Church, school, or community building",
      icon: MapPin,
      selectedClasses: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
      iconClasses: "text-purple-500"
    },
    {
      id: "other",
      name: "Other",
      description: "Custom or hybrid setup",
      icon: BookOpen,
      selectedClasses: "border-orange-500 bg-orange-50 dark:bg-orange-900/20",
      iconClasses: "text-orange-500"
    }
  ];

  return (
    <Card data-testid="card-site-type-step">
      <CardHeader>
        <CardTitle className="text-2xl">What type of supply site are you setting up?</CardTitle>
        <CardDescription>
          Choose the option that best describes your site. You can change this later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {siteTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? type.selectedClasses
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:shadow-md"
                }`}
                data-testid={`button-site-type-${type.id}`}
              >
                <Icon className={`h-8 w-8 mb-3 ${type.iconClasses}`} />
                <h3 className="font-semibold mb-1">{type.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SiteInfoStep() {
  return (
    <Card data-testid="card-site-info-step">
      <CardHeader>
        <CardTitle className="text-2xl">Site Information</CardTitle>
        <CardDescription>
          Tell us about your site so we can help you get connected
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              placeholder="e.g., Community Relief Center"
              data-testid="input-site-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address *</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              placeholder="Street address"
              data-testid="input-site-address"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                data-testid="input-site-city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                data-testid="input-site-state"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrainingStep() {
  return (
    <Card data-testid="card-training-step">
      <CardHeader>
        <CardTitle className="text-2xl">Essential Training</CardTitle>
        <CardDescription>
          Quick modules to ensure safe and effective operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            "Safety Protocols & Volunteer Management",
            "Inventory Tracking Basics",
            "Distribution Best Practices",
            "Communication with Community"
          ].map((module, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`training-module-${i}`}>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>{module}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ResourcesStep() {
  return (
    <Card data-testid="card-resources-step">
      <CardHeader>
        <CardTitle className="text-2xl">Resources & Templates</CardTitle>
        <CardDescription>
          Download everything you need to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            "Site Setup Checklist",
            "Volunteer Sign-in Sheet",
            "Inventory Tracking Template",
            "Safety Guidelines Poster"
          ].map((resource, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" data-testid={`resource-download-${i}`}>
              <span>{resource}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CompleteStep({ onClose }: { onClose: () => void }) {
  return (
    <Card data-testid="card-complete-step">
      <CardHeader>
        <CardTitle className="text-3xl">Setup Complete! 🎉</CardTitle>
        <CardDescription className="text-lg">
          Your supply site is ready to go
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Your site will be reviewed by our team (usually within 24 hours)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>You'll receive an email with your site dashboard login</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Your site will appear on the public map once approved</span>
            </li>
          </ul>
        </div>
        <div className="flex gap-4">
          <Button onClick={onClose} className="flex-1" data-testid="button-done">
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
