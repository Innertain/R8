
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Thermometer, TrendingUp, AlertTriangle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function TemperatureAnomalyExplainer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Understanding Temperature Anomalies</CardTitle>
        </div>
        <CardDescription>
          Learn how to read and interpret global temperature anomaly data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Summary */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Temperature anomalies</strong> show how much warmer or cooler Earth's temperature is compared to the long-term average (1901-2000). 
                Positive values (above the red line) mean warmer than average, negative values mean cooler than average.
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Detailed Explanation */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span>Learn More About Temperature Anomalies</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6 mt-4">
            {/* What is a Baseline? */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Thermometer className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What is the Baseline (1901-2000)?</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    The baseline is the average global temperature calculated from 100 years of data (1901-2000). 
                    This period represents "normal" climate conditions before significant modern warming began.
                  </p>
                  <div className="bg-green-50 rounded p-3 border border-green-200">
                    <p className="text-xs text-green-800">
                      <strong>Why 1901-2000?</strong> This 100-year period provides a stable reference point that includes 
                      natural climate variations but occurs before the most dramatic effects of human-caused climate change.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What is an Anomaly? */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What is a Temperature Anomaly?</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    An anomaly is the difference between the actual temperature and the baseline average. 
                    It tells us whether Earth was warmer or cooler than "normal" in any given year.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded p-3 border border-red-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm font-medium text-red-800">Positive Anomaly</span>
                      </div>
                      <p className="text-xs text-red-700">
                        <strong>+0.5°C:</strong> Earth was 0.5°C (0.9°F) warmer than the 1901-2000 average
                      </p>
                      <p className="text-xs text-red-600 mt-1">Above the red zero line = Warmer than normal</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded p-3 border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium text-blue-800">Negative Anomaly</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        <strong>-0.3°C:</strong> Earth was 0.3°C (0.5°F) cooler than the 1901-2000 average
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Below the red zero line = Cooler than normal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading the Chart */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How to Read the Chart</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Key Visual Elements:</h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-4 h-0.5 bg-red-500"></div>
                          <span><strong>Red dotted line (0.0):</strong> The baseline - average temperature from 1901-2000</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-4 h-3 bg-red-200 border border-red-300"></div>
                          <span><strong>Pink area above line:</strong> Years warmer than the 20th century average</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-4 h-3 bg-blue-200 border border-blue-300"></div>
                          <span><strong>Blue area below line:</strong> Years cooler than the 20th century average</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">What the Numbers Mean:</h4>
                      <div className="bg-gray-50 rounded p-3 space-y-2">
                        <p className="text-xs text-gray-700">
                          <strong>+1.2°C anomaly (like 2023):</strong> Earth was 1.2°C (2.2°F) warmer than the 1901-2000 average - the warmest year on record
                        </p>
                        <p className="text-xs text-gray-700">
                          <strong>0.0°C anomaly:</strong> Temperature matched the 20th century average exactly
                        </p>
                        <p className="text-xs text-gray-700">
                          <strong>-0.4°C anomaly (like 1910):</strong> Earth was 0.4°C (0.7°F) cooler than the 20th century average
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Climate Trends */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What the Trend Shows</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    The chart reveals a clear warming trend, especially since 1980. Here's what different periods show:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="w-16 text-right font-medium">1880-1920:</div>
                      <div className="flex-1 bg-blue-100 rounded p-2">
                        Mostly negative anomalies - cooler than 20th century average
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="w-16 text-right font-medium">1920-1980:</div>
                      <div className="flex-1 bg-yellow-100 rounded p-2">
                        Mixed positive and negative - natural climate variations
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="w-16 text-right font-medium">1980-2025:</div>
                      <div className="flex-1 bg-red-100 rounded p-2">
                        Consistently positive anomalies - clear warming trend
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Matters */}
            <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Why Temperature Anomalies Matter
              </h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                Even small temperature anomalies have big impacts. A +1°C global anomaly represents enormous amounts of 
                extra energy in Earth's climate system, affecting weather patterns, sea levels, ecosystems, and extreme events 
                worldwide. The consistent warming trend since 1980 provides clear evidence of human-caused climate change.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
