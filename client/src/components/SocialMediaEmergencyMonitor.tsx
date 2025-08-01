import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Heart, 
  Repeat, 
  MessageCircle,
  User,
  CheckCircle,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SocialMediaPost {
  id: string;
  state: string;
  stateFullName: string;
  accountType: 'governor' | 'emergency';
  username: string;
  displayName: string;
  verified: boolean;
  text: string;
  createdAt: string;
  engagement: {
    retweets: number;
    likes: number;
    replies: number;
  };
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  url: string;
}

interface SocialMediaResponse {
  success: boolean;
  disabled?: boolean;
  posts?: SocialMediaPost[];
  totalRelevantPosts: number;
  accountsMonitored?: number;
  lastUpdated?: string;
  nextUpdate?: string;
  sources?: string[];
  note?: string;
  apiUsage?: {
    requestsUsed: number;
    monthlyLimit: number;
    status: string;
  };
}

export function SocialMediaEmergencyMonitor() {
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterAccount, setFilterAccount] = useState<'all' | 'governor' | 'emergency'>('all');

  const { data, isLoading, error, refetch } = useQuery<SocialMediaResponse>({
    queryKey: ['/api/social-media-emergency'],
    refetchInterval: 6 * 60 * 60 * 1000, // Refresh every 6 hours
  });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white animate-pulse';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getAccountTypeColor = (type: string) => {
    return type === 'governor' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredPosts = (data?.posts || []).filter(post => {
    const urgencyMatch = filterUrgency === 'all' || post.urgencyLevel === filterUrgency;
    const accountMatch = filterAccount === 'all' || post.accountType === filterAccount;
    return urgencyMatch && accountMatch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="w-5 h-5 text-blue-500" />
            Social Media Emergency Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Scanning state official social media accounts...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="w-5 h-5 text-blue-500" />
            Social Media Emergency Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Failed to load social media emergency data
            </div>
            <p className="text-sm text-red-600 mb-3">
              Unable to fetch emergency updates from state officials' social media accounts.
            </p>
            <Button onClick={() => refetch()} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle disabled state
  if (data?.disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="w-5 h-5 text-blue-500" />
            Social Media Emergency Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <Shield className="w-4 h-4" />
              Social Media Monitoring Temporarily Disabled
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              {data.note || "Social media monitoring is disabled and may be coming soon."}
            </p>
            {data.apiUsage && (
              <div className="text-xs text-yellow-600 bg-yellow-100 rounded p-2">
                API Usage: {data.apiUsage.requestsUsed}/{data.apiUsage.monthlyLimit} requests used this month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-500" />
              Social Media Emergency Monitor
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Real-time emergency updates from state governors and emergency management officials
            </p>
          </div>
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Twitter className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Total Posts</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.totalRelevantPosts}</div>
            <div className="text-xs text-blue-500">Emergency Related</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-sm">Accounts</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{data.accountsMonitored}</div>
            <div className="text-xs text-purple-500">Monitored</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {filteredPosts.filter(p => p.urgencyLevel === 'critical').length}
            </div>
            <div className="text-xs text-red-500">High Priority</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Next Update</span>
            </div>
            <div className="text-sm font-bold text-green-600">
              {new Date(data.nextUpdate).toLocaleTimeString()}
            </div>
            <div className="text-xs text-green-500">6 Hour Intervals</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Urgency:</span>
            <div className="flex gap-1">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={filterUrgency === level ? "default" : "outline"}
                  onClick={() => setFilterUrgency(level)}
                  className="text-xs"
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Account:</span>
            <div className="flex gap-1">
              {(['all', 'governor', 'emergency'] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterAccount === type ? "default" : "outline"}
                  onClick={() => setFilterAccount(type)}
                  className="text-xs"
                >
                  {type === 'all' ? 'All' : type === 'governor' ? 'Governors' : 'Emergency Mgmt'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No emergency-related social media posts found with current filters
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">@{post.username}</span>
                        {post.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      
                      <Badge className={`text-xs ${getUrgencyColor(post.urgencyLevel)}`}>
                        {post.urgencyLevel.toUpperCase()}
                      </Badge>
                      
                      <Badge variant="outline" className={`text-xs ${getAccountTypeColor(post.accountType)}`}>
                        {post.accountType === 'governor' ? 'Governor' : 'Emergency Mgmt'}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {post.state} - {post.stateFullName}
                      </Badge>
                    </div>
                    
                    {/* Post Content */}
                    <p className="text-gray-800 mb-3 leading-relaxed">
                      {post.text}
                    </p>
                    
                    {/* Post Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.engagement.likes}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          <span>{post.engagement.retweets}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.engagement.replies}</span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(post.url, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Tweet
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Data Sources and Implementation Note */}
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-800 mb-2">Data Sources</div>
            <div className="text-xs text-blue-700 space-y-1">
              {data.sources.map((source, index) => (
                <div key={index}>• {source}</div>
              ))}
              <div className="text-blue-600 mt-2">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </div>
              <div className="text-blue-600">
                Next update: {new Date(data.nextUpdate).toLocaleString()}
              </div>
            </div>
          </div>
          
          {data.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm font-medium text-yellow-800 mb-1">Implementation Note</div>
              <div className="text-xs text-yellow-700">{data.note}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SocialMediaEmergencyMonitor;