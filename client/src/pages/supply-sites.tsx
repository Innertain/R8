import { useState } from "react";
import { Package, MapPin, Users, BookOpen, CheckCircle, ArrowRight, ChevronRight, Lock, Globe, Clock, Truck, Eye, EyeOff, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Register Your Site", desc: "Complete our quick onboarding process", icon: Package },
              { step: 2, title: "Get Approved", desc: "Our team reviews within 24 hours", icon: CheckCircle },
              { step: 3, title: "Connect to Network", desc: "Access volunteers and resources", icon: Users },
              { step: 4, title: "Serve Community", desc: "Help people in need", icon: MapPin }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center" data-testid={`how-it-works-step-${item.step}`}>
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {item.step}
                  </div>
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              );
            })}
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

// Onboarding Wizard Component with form data state
function OnboardingWizard({ step, setStep, onClose }: { step: number; setStep: (step: number) => void; onClose: () => void }) {
  const totalSteps = 8;
  const progress = ((step + 1) / totalSteps) * 100;

  // Form data state matching WSS schema
  const [formData, setFormData] = useState({
    // Site Type
    r8SiteType: "",
    siteType: "",
    
    // PUBLIC INFO
    name: "",
    address: "",
    city: "",
    state: "",
    county: "",
    website: "",
    facebook: "",
    peopleServedWeekly: "",
    
    // PRIVATE INFO
    primaryContactName: "",
    primaryContactPhone: "",
    additionalManagers: [] as { name: string; phone: string }[],
    
    // Operations
    siteHours: "",
    acceptingDonations: true,
    distributingSupplies: true,
    
    // Receiving & Logistics (PRIVATE)
    maxSupplyLoad: "",
    receivingNotes: "",
    
    // Site Status & Visibility
    isPubliclyVisible: true,
    isActive: true,
    inactiveReason: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { title: "Welcome", component: <WelcomeStep /> },
    { title: "Site Type", component: <SiteTypeStep formData={formData} updateFormData={updateFormData} /> },
    { title: "Site Info (Public)", component: <SiteInfoStep formData={formData} updateFormData={updateFormData} /> },
    { title: "Contact Info (Private)", component: <ContactInfoStep formData={formData} updateFormData={updateFormData} /> },
    { title: "Hours & Operations", component: <HoursOperationsStep formData={formData} updateFormData={updateFormData} /> },
    { title: "Receiving & Logistics", component: <ReceivingLogisticsStep formData={formData} updateFormData={updateFormData} /> },
    { title: "Site Status", component: <SiteStatusStep formData={formData} updateFormData={updateFormData} /> },
    { title: "Complete", component: <CompleteStep onClose={onClose} formData={formData} /> },
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

// Privacy Indicator Component
function PrivacyBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <Badge variant={isPublic ? "default" : "secondary"} className="ml-2">
      {isPublic ? <><Globe className="h-3 w-3 mr-1" /> PUBLIC</> : <><Lock className="h-3 w-3 mr-1" /> PRIVATE</>}
    </Badge>
  );
}

// Step 1: Welcome
function WelcomeStep() {
  return (
    <Card data-testid="card-welcome-step">
      <CardHeader>
        <CardTitle className="text-3xl">Welcome to R8 Supply Sites!</CardTitle>
        <CardDescription className="text-lg mt-2">
          Thank you for joining our mutual aid network. This setup will get your site ready to serve your community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          In the next few steps, you'll provide information about your site and operations:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Choose your site type and provide basic information</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Set up contact information and hours</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Configure operational preferences</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <span>Connect to the R8 volunteer network</span>
          </li>
        </ul>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
            <strong>About Privacy:</strong> Some information is public (visible to everyone) while other details are private (authenticated users only).
          </p>
          <div className="flex gap-2 text-xs">
            <Badge variant="default" className="text-xs"><Globe className="h-3 w-3 mr-1" /> PUBLIC</Badge>
            <span className="text-blue-700 dark:text-blue-300">= Visible on public map</span>
          </div>
          <div className="flex gap-2 text-xs mt-1">
            <Badge variant="secondary" className="text-xs"><Lock className="h-3 w-3 mr-1" /> PRIVATE</Badge>
            <span className="text-blue-700 dark:text-blue-300">= Only visible to authenticated users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: Site Type
function SiteTypeStep({ formData, updateFormData }: any) {
  const siteTypes = [
    {
      id: "pod",
      name: "POD - Point of Distribution",
      wssType: "distribution_center",
      description: "Distribute supplies to people in need",
      icon: Package,
      selectedClasses: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
      iconClasses: "text-blue-500"
    },
    {
      id: "poc",
      name: "POC - Point of Collection",
      wssType: "supply_warehouse",
      description: "Collect and organize donations",
      icon: Users,
      selectedClasses: "border-green-500 bg-green-50 dark:bg-green-900/20",
      iconClasses: "text-green-500"
    },
    {
      id: "community",
      name: "Community Center",
      wssType: "distribution_center",
      description: "Church, school, or community building",
      icon: MapPin,
      selectedClasses: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
      iconClasses: "text-purple-500"
    },
    {
      id: "other",
      name: "Other",
      wssType: "distribution_center",
      description: "Custom or hybrid setup",
      icon: BookOpen,
      selectedClasses: "border-orange-500 bg-orange-50 dark:bg-orange-900/20",
      iconClasses: "text-orange-500"
    }
  ];

  const handleTypeSelect = (type: any) => {
    updateFormData("r8SiteType", type.id);
    updateFormData("siteType", type.wssType);
  };

  return (
    <Card data-testid="card-site-type-step">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          What type of supply site are you setting up?
          <PrivacyBadge isPublic={true} />
        </CardTitle>
        <CardDescription>
          Choose the option that best describes your site. You can change this later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {siteTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.r8SiteType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
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
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  WSS Type: {type.wssType.replace('_', ' ')}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Step 3: Site Info (PUBLIC)
function SiteInfoStep({ formData, updateFormData }: any) {
  return (
    <Card data-testid="card-site-info-step">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          Site Information
          <PrivacyBadge isPublic={true} />
        </CardTitle>
        <CardDescription>
          This information will be visible on the public map to help people find your site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="site-name" className="text-base">Site Name *</Label>
            <Input
              id="site-name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="e.g., Community Relief Center"
              className="mt-2"
              data-testid="input-site-name"
            />
          </div>

          <div>
            <Label htmlFor="site-address" className="text-base">Street Address *</Label>
            <Input
              id="site-address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              placeholder="123 Main Street"
              className="mt-2"
              data-testid="input-site-address"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="site-city" className="text-base">City *</Label>
              <Input
                id="site-city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                className="mt-2"
                data-testid="input-site-city"
              />
            </div>
            <div>
              <Label htmlFor="site-state" className="text-base">State *</Label>
              <Input
                id="site-state"
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
                placeholder="NC"
                maxLength={2}
                className="mt-2"
                data-testid="input-site-state"
              />
            </div>
            <div>
              <Label htmlFor="site-county" className="text-base">County</Label>
              <Input
                id="site-county"
                value={formData.county}
                onChange={(e) => updateFormData("county", e.target.value)}
                className="mt-2"
                data-testid="input-site-county"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site-website" className="text-base">Website URL</Label>
              <Input
                id="site-website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                placeholder="https://example.com"
                className="mt-2"
                data-testid="input-site-website"
              />
            </div>
            <div>
              <Label htmlFor="site-facebook" className="text-base">Facebook Page URL</Label>
              <Input
                id="site-facebook"
                type="url"
                value={formData.facebook}
                onChange={(e) => updateFormData("facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="mt-2"
                data-testid="input-site-facebook"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="people-served" className="text-base">People Served Weekly (Optional)</Label>
            <Input
              id="people-served"
              type="number"
              value={formData.peopleServedWeekly}
              onChange={(e) => updateFormData("peopleServedWeekly", e.target.value)}
              placeholder="e.g., 150"
              className="mt-2"
              data-testid="input-people-served"
            />
            <p className="text-xs text-gray-500 mt-1">Approximate number of people your site helps each week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 4: Contact Info (PRIVATE)
function ContactInfoStep({ formData, updateFormData }: any) {
  const addManager = () => {
    updateFormData("additionalManagers", [...formData.additionalManagers, { name: "", phone: "" }]);
  };

  const removeManager = (index: number) => {
    updateFormData("additionalManagers", formData.additionalManagers.filter((_: any, i: number) => i !== index));
  };

  const updateManager = (index: number, field: string, value: string) => {
    const updated = [...formData.additionalManagers];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData("additionalManagers", updated);
  };

  return (
    <Card data-testid="card-contact-info-step">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          Contact Information
          <PrivacyBadge isPublic={false} />
        </CardTitle>
        <CardDescription>
          This information is private and only visible to authenticated users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Contact details are kept private for your security and will only be shared with verified supply site coordinators.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="primary-contact-name" className="text-base">Primary Contact Name *</Label>
            <Input
              id="primary-contact-name"
              value={formData.primaryContactName}
              onChange={(e) => updateFormData("primaryContactName", e.target.value)}
              placeholder="John Doe"
              className="mt-2"
              data-testid="input-primary-contact-name"
            />
          </div>

          <div>
            <Label htmlFor="primary-contact-phone" className="text-base">Primary Contact Phone *</Label>
            <Input
              id="primary-contact-phone"
              type="tel"
              value={formData.primaryContactPhone}
              onChange={(e) => updateFormData("primaryContactPhone", e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-2"
              data-testid="input-primary-contact-phone"
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base">Additional Site Managers (Optional)</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add other contacts who can manage this site</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addManager}
                data-testid="button-add-manager"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Manager
              </Button>
            </div>

            {formData.additionalManagers.map((manager: any, index: number) => (
              <div key={index} className="space-y-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`manager-${index}`}>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Manager {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeManager(index)}
                    data-testid={`button-remove-manager-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={manager.name}
                  onChange={(e) => updateManager(index, "name", e.target.value)}
                  placeholder="Name"
                  data-testid={`input-manager-name-${index}`}
                />
                <Input
                  type="tel"
                  value={manager.phone}
                  onChange={(e) => updateManager(index, "phone", e.target.value)}
                  placeholder="Phone"
                  data-testid={`input-manager-phone-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 5: Hours & Operations
function HoursOperationsStep({ formData, updateFormData }: any) {
  return (
    <Card data-testid="card-hours-operations-step">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          Hours & Operations
          <PrivacyBadge isPublic={true} />
        </CardTitle>
        <CardDescription>
          Let people know when your site is open and what services you provide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="site-hours" className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Site Hours
            </Label>
            <Textarea
              id="site-hours"
              value={formData.siteHours}
              onChange={(e) => updateFormData("siteHours", e.target.value)}
              placeholder="e.g., Monday-Friday 9am-5pm, Saturday 10am-2pm, Closed Sunday"
              className="mt-2 min-h-[100px]"
              data-testid="textarea-site-hours"
            />
            <p className="text-xs text-gray-500 mt-1">Describe when your site is open for donations and/or distribution</p>
          </div>

          <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <Label className="text-base">What is your site currently doing?</Label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Accepting Donations</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receiving supplies from donors</p>
                </div>
              </div>
              <Switch
                checked={formData.acceptingDonations}
                onCheckedChange={(checked) => updateFormData("acceptingDonations", checked)}
                data-testid="switch-accepting-donations"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Distributing Supplies</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Giving supplies to people in need</p>
                </div>
              </div>
              <Switch
                checked={formData.distributingSupplies}
                onCheckedChange={(checked) => updateFormData("distributingSupplies", checked)}
                data-testid="switch-distributing-supplies"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 6: Receiving & Logistics (PRIVATE)
function ReceivingLogisticsStep({ formData, updateFormData }: any) {
  return (
    <Card data-testid="card-receiving-logistics-step">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          Receiving & Logistics
          <PrivacyBadge isPublic={false} />
        </CardTitle>
        <CardDescription>
          Help delivery drivers know how to bring supplies to your site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                This information is private and only shared with verified drivers and coordinators.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="max-supply-load" className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Maximum Supply Load
            </Label>
            <Select value={formData.maxSupplyLoad} onValueChange={(value) => updateFormData("maxSupplyLoad", value)}>
              <SelectTrigger className="mt-2" data-testid="select-max-supply-load">
                <SelectValue placeholder="Select maximum vehicle size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="pickup_truck">Pickup Truck</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="box_truck">Box Truck</SelectItem>
                <SelectItem value="semi_truck">Semi Truck</SelectItem>
                <SelectItem value="any">Any Size</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Largest vehicle that can access your site for deliveries</p>
          </div>

          <div>
            <Label htmlFor="receiving-notes" className="text-base">Delivery Instructions / Receiving Notes</Label>
            <Textarea
              id="receiving-notes"
              value={formData.receivingNotes}
              onChange={(e) => updateFormData("receivingNotes", e.target.value)}
              placeholder="e.g., Use rear entrance, ring bell at loading dock, call ahead for large deliveries"
              className="mt-2 min-h-[120px]"
              data-testid="textarea-receiving-notes"
            />
            <p className="text-xs text-gray-500 mt-1">
              Special instructions for drivers delivering supplies (parking, entrance to use, best times, contact info)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 7: Site Status & Visibility
function SiteStatusStep({ formData, updateFormData }: any) {
  return (
    <Card data-testid="card-site-status-step">
      <CardHeader>
        <CardTitle className="text-2xl">Site Status & Visibility</CardTitle>
        <CardDescription>
          Control how your site appears to the public
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Publicly Visible</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Show this site on the public map</p>
                </div>
              </div>
              <Switch
                checked={formData.isPubliclyVisible}
                onCheckedChange={(checked) => updateFormData("isPubliclyVisible", checked)}
                data-testid="switch-publicly-visible"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Site Active</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Site is currently operational</p>
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => updateFormData("isActive", checked)}
                data-testid="switch-site-active"
              />
            </div>
          </div>

          {!formData.isActive && (
            <div className="animate-in fade-in-50">
              <Label htmlFor="inactive-reason" className="text-base">Why is the site inactive?</Label>
              <Textarea
                id="inactive-reason"
                value={formData.inactiveReason}
                onChange={(e) => updateFormData("inactiveReason", e.target.value)}
                placeholder="e.g., Seasonal closure, moving to new location, temporary pause"
                className="mt-2"
                data-testid="textarea-inactive-reason"
              />
            </div>
          )}

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Visibility Settings Explained</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-blue-500" />
                <span><strong>Publicly Visible:</strong> Your site appears on the public map for people seeking help</span>
              </li>
              <li className="flex items-start gap-2">
                <EyeOff className="h-4 w-4 mt-0.5 text-gray-500" />
                <span><strong>Not Visible:</strong> Site is hidden from public (useful for internal/private operations)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span><strong>Active:</strong> Site is operational and accepting donations/distributing supplies</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 mt-0.5 text-red-500" />
                <span><strong>Inactive:</strong> Site is temporarily or permanently closed</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 8: Complete
function CompleteStep({ onClose, formData }: any) {
  return (
    <Card data-testid="card-complete-step">
      <CardHeader>
        <CardTitle className="text-3xl">Setup Complete! 🎉</CardTitle>
        <CardDescription className="text-lg">
          Your supply site registration has been submitted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
              <span><strong>Admin Review:</strong> Your site will be reviewed by our team (usually within 24-48 hours)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
              <span><strong>Email Confirmation:</strong> You'll receive an email with your site dashboard login credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
              <span><strong>Go Live:</strong> Your site will appear on the public map once approved (if publicly visible)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
              <span><strong>Network Access:</strong> Connect with volunteers, coordinate with other sites, and access resources</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">📋 Site Summary</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Site Name:</strong> {formData.name || "Not provided"}</p>
            <p><strong>Type:</strong> {formData.r8SiteType || "Not selected"}</p>
            <p><strong>Location:</strong> {formData.city && formData.state ? `${formData.city}, ${formData.state}` : "Not provided"}</p>
            <p><strong>Contact:</strong> {formData.primaryContactName || "Not provided"}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={onClose} className="flex-1" data-testid="button-done">
            Return to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
