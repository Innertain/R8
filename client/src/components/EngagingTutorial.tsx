import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle, 
  Globe, 
  Users, 
  TreePine, 
  Shield,
  Lightbulb,
  Heart,
  Star,
  X
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  action?: string;
  icon: React.ReactNode;
  color: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Global Ecoregions',
    content: 'Discover 846 unique ecosystems worldwide, each with their own story of biodiversity, indigenous wisdom, and conservation challenges.',
    action: 'Click any ecoregion card to explore',
    icon: <Globe className="w-5 h-5" />,
    color: 'blue'
  },
  {
    id: 'biomes',
    title: 'Filter by Biomes',
    content: 'Use the biome filters to explore specific ecosystem types - from tropical rainforests to arctic tundra. Each color represents a different biome.',
    action: 'Try toggling biomes on/off',
    icon: <TreePine className="w-5 h-5" />,
    color: 'green'
  },
  {
    id: 'indigenous',
    title: 'Indigenous Knowledge',
    content: 'Learn about traditional ecological knowledge from indigenous peoples who have stewarded these lands for thousands of years.',
    action: 'Look for the amber "Indigenous Groups" badges',
    icon: <Users className="w-5 h-5" />,
    color: 'amber'
  },
  {
    id: 'conservation',
    title: 'Conservation Status',
    content: 'Each ecosystem shows threat levels and protection status. Critical ecosystems need urgent action, while stable ones offer success stories.',
    action: 'Notice the threat indicators and protection levels',
    icon: <Shield className="w-5 h-5" />,
    color: 'red'
  },
  {
    id: 'action',
    title: 'Take Action',
    content: 'Every ecosystem page shows how you can help - from supporting conservation organizations to making sustainable choices.',
    action: 'Explore the "Take Action" sections',
    icon: <Heart className="w-5 h-5" />,
    color: 'purple'
  }
];

interface EngagingTutorialProps {
  onComplete: () => void;
  onDismiss: () => void;
}

const EngagingTutorial: React.FC<EngagingTutorialProps> = ({ onComplete, onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      amber: 'bg-amber-50 border-amber-200 text-amber-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getColorClasses(currentStepData.color)}`}>
                {currentStepData.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentStepData.title}</h3>
                <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Getting Started</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-gray-700 leading-relaxed">
            {currentStepData.content}
          </div>
          
          {currentStepData.action && (
            <div className={`border rounded-lg p-4 ${getColorClasses(currentStepData.color)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">Try This:</span>
              </div>
              <div className="text-sm">{currentStepData.action}</div>
            </div>
          )}
          
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2">
            {TUTORIAL_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-blue-500 scale-125'
                    : completedSteps.has(step.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="flex items-center gap-1">
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Educational Fact */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Did You Know?</span>
            </div>
            <div className="text-sm text-blue-700">
              {currentStep === 0 && "Indigenous peoples protect 80% of the world's biodiversity despite being only 5% of the global population."}
              {currentStep === 1 && "The Amazon rainforest produces 20% of the world's oxygen and influences weather patterns globally."}
              {currentStep === 2 && "Traditional ecological knowledge often provides the most accurate long-term environmental data available."}
              {currentStep === 3 && "Less than 15% of the world's land surface is formally protected, but we need at least 30% by 2030."}
              {currentStep === 4 && "Individual actions, when multiplied across millions of people, create significant conservation impact."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagingTutorial;