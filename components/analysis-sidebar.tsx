import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { XIcon, MicIcon, MessageSquareIcon, ClockIcon, CpuIcon, ZapIcon, CheckCircleIcon, LoaderIcon, BrainIcon, SendIcon, EyeIcon, SparklesIcon, DatabaseIcon, NetworkIcon, CpuIcon as ProcessorIcon, WifiIcon } from 'lucide-react'

interface AnalysisStep {
  step: string
  timestamp: number
  duration?: number
  status: 'processing' | 'completed'
}

interface AnalysisData {
  id: string
  type: 'text' | 'voice'
  status: 'processing' | 'completed' | 'error'
  startTime: number
  endTime?: number
  steps: AnalysisStep[]
  tokenCount?: number
  model?: string
  reasoning?: string
}

interface AnalysisSidebarProps {
  currentAnalysis?: AnalysisData
  analysisHistory: AnalysisData[]
  onClose: () => void
}

// Enhanced step descriptions with better language
const getStepDescription = (step: string): { title: string; description: string; icon: React.ReactNode } => {
  const stepMap: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    'Initializing request': {
      title: 'Starting Analysis',
      description: 'Setting up the AI processing pipeline and preparing your request',
      icon: <ProcessorIcon className="w-4 h-4" />
    },
    'Preparing text request': {
      title: 'Processing Input',
      description: 'Analyzing your message and preparing it for the AI model',
      icon: <EyeIcon className="w-4 h-4" />
    },
    'Sending to AI model': {
      title: 'Connecting to AI',
      description: 'Establishing connection with the AI model and sending your request',
      icon: <SendIcon className="w-4 h-4" />
    },
    'Streaming response': {
      title: 'Generating Response',
      description: 'AI is thinking and generating a personalized response for you',
      icon: <BrainIcon className="w-4 h-4" />
    },
    'Receiving response stream': {
      title: 'Streaming Data',
      description: 'Receiving the AI response in real-time chunks',
      icon: <WifiIcon className="w-4 h-4" />
    },
    'Response received': {
      title: 'Response Complete',
      description: 'Successfully received the complete AI response',
      icon: <CheckCircleIcon className="w-4 h-4" />
    },
    'Processing complete': {
      title: 'Analysis Finished',
      description: 'All processing steps completed successfully',
      icon: <SparklesIcon className="w-4 h-4" />
    },
    'Processing voice suggestion': {
      title: 'Voice Processing',
      description: 'Processing your voice suggestion for the AI system',
      icon: <MicIcon className="w-4 h-4" />
    },
    'Sending to Realtime API': {
      title: 'Voice Connection',
      description: 'Connecting to the real-time voice AI system',
      icon: <NetworkIcon className="w-4 h-4" />
    },
    'Triggering AI response': {
      title: 'Activating AI',
      description: 'Triggering the AI to generate a voice response',
      icon: <ZapIcon className="w-4 h-4" />
    },
    'Waiting for voice response': {
      title: 'Voice Generation',
      description: 'AI is preparing to speak back to you with wellness guidance',
      icon: <SparklesIcon className="w-4 h-4"  />
    },
    'Receiving audio response': {
      title: 'Audio Streaming',
      description: 'Receiving and processing the AI\'s voice response in real-time',
      icon: <WifiIcon className="w-4 h-4" />
    },
    'Voice response completed': {
      title: 'Response Complete',
      description: 'Voice interaction completed successfully',
      icon: <CheckCircleIcon className="w-4 h-4" />
    },
    'AI response generated': {
      title: 'Response Ready',
      description: 'AI has generated a thoughtful response to your wellness query',
      icon: <SparklesIcon className="w-4 h-4" />
    }
  }

  return stepMap[step] || {
    title: step,
    description: 'Processing your request...',
    icon: <LoaderIcon className="w-4 h-4" />
  }
}

const getModelDisplayName = (model?: string) => {
  const modelMap: Record<string, string> = {
    'gpt-4o-mini': '1to1Help AI',
    'gpt-4o-realtime': 'Voice AI',
    'coach': 'Wellness Coach',
    'gpt-4o': '1to1Help AI Pro'
  }
  return modelMap[model || ''] || model || 'AI Model'
}

export function AnalysisSidebar({ currentAnalysis, analysisHistory, onClose }: AnalysisSidebarProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every 200ms for smooth animations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 200)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const calculateProgress = (analysis: AnalysisData) => {
    if (!analysis.steps.length) return 0
    const completedSteps = analysis.steps.filter(step => step.status === 'completed').length
    const progress = (completedSteps / analysis.steps.length) * 100
    
    // If analysis is completed, show 100%
    if (analysis.status === 'completed') return 100
    
    // If still processing, show at least some progress
    return Math.max(progress, analysis.steps.length > 0 ? 20 : 0)
  }

  const getCurrentDuration = (startTime: number) => {
    return currentTime - startTime
  }

  // Rest of the component stays the same but with better visual feedback
  
  return (
    <div className="w-80 border-l border-border/50 bg-gradient-to-b from-white/95 to-[#faf7f2]/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <CpuIcon className="w-5 h-5 text-[#2d5a5a]" />
              {currentAnalysis && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-[#1e3a3a]">AI Analysis</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Analysis */}
          {currentAnalysis && (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      currentAnalysis.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                    }`}></div>
                    <CardTitle className="text-sm font-semibold text-blue-800">
                      {currentAnalysis.type === 'voice' ? '🎙️ Voice Analysis' : '💬 Text Analysis'}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                    {getModelDisplayName(currentAnalysis.model)}
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-700">
                    <span>Progress</span>
                    <span>{Math.round(calculateProgress(currentAnalysis))}%</span>
                  </div>
                  <Progress 
                    value={calculateProgress(currentAnalysis)} 
                    className="h-2 bg-blue-100"
                  />
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Real-time Stats */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700 font-mono">
                      {currentAnalysis.endTime 
                        ? formatDuration(currentAnalysis.endTime - currentAnalysis.startTime)
                        : formatDuration(getCurrentDuration(currentAnalysis.startTime))
                      }
                    </div>
                    <div className="text-xs text-blue-600">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">
                      {currentAnalysis.steps.length}
                    </div>
                    <div className="text-xs text-blue-600">Steps</div>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                    <ZapIcon className="w-3 h-3" /> 
                    Processing Steps
                  </h4>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentAnalysis.steps.map((step, index) => {
                      const stepInfo = getStepDescription(step.step)
                      const isActive = step.status === 'processing' && currentAnalysis.status === 'processing'
                      const stepDuration = step.duration || (isActive ? getCurrentDuration(step.timestamp) : 0)
                      
                      return (
                        <Card 
                          key={index} 
                          className={`transition-all duration-500 ${
                            isActive 
                              ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md scale-[1.02]' 
                              : 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${isActive ? 'text-blue-600' : 'text-green-600'}`}>
                                {isActive ? (
                                  <LoaderIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircleIcon className="w-4 h-4" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className={`text-sm font-medium ${
                                    isActive ? 'text-blue-800' : 'text-green-800'
                                  }`}>
                                    {stepInfo.title}
                                  </h5>
                                  <Badge 
                                    variant={isActive ? "default" : "secondary"}
                                    className={`text-xs ${
                                      isActive 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-green-500 text-white'
                                    }`}
                                  >
                                    {formatDuration(stepDuration)}
                                  </Badge>
                                </div>
                                
                                <p className={`text-xs mt-1 ${
                                  isActive ? 'text-blue-700' : 'text-green-700'
                                }`}>
                                  {stepInfo.description}
                                </p>
                                
                                {isActive && (
                                  <div className="mt-2">
                                    <div className="w-full bg-blue-200 rounded-full h-1">
                                      <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '75%'}}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Status Message */}
                <div className={`p-3 rounded-lg border ${
                  currentAnalysis.status === 'completed' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      currentAnalysis.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      currentAnalysis.status === 'completed' ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {currentAnalysis.status === 'completed' ? 'Analysis Complete!' : 'Processing...'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    currentAnalysis.status === 'completed' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {currentAnalysis.status === 'completed' 
                      ? 'Your wellness response has been generated successfully'
                      : 'AI is analyzing your request and generating a personalized response'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis History - keep the same */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[#1e3a3a] flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Recent Analysis ({analysisHistory.length})
            </h4>

            {analysisHistory.map((analysis) => (
              <Card key={analysis.id} className="border-[#8fbc8f]/20 hover:border-[#8fbc8f]/40 transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {analysis.type === 'voice' ? (
                        <MicIcon className="w-3 h-3 text-[#2d5a5a]" />
                      ) : (
                        <MessageSquareIcon className="w-3 h-3 text-[#2d5a5a]" />
                      )}
                      <span className="text-xs font-medium">
                        {analysis.type === 'voice' ? 'Voice' : 'Text'} • {getModelDisplayName(analysis.model)}
                      </span>
                    </div>
                    <Badge 
                      variant={analysis.status === 'completed' ? 'default' : 'destructive'} 
                      className={`text-xs ${
                        analysis.status === 'completed' ? 'bg-green-500' : ''
                      }`}
                    >
                      ✓ {analysis.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 p-2 bg-[#8fbc8f]/5 rounded">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-[#2d5a5a]">
                        {analysis.endTime ? formatDuration(analysis.endTime - analysis.startTime) : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-[#2d5a5a]">
                        {analysis.tokenCount || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-[#2d5a5a]">
                        {analysis.steps.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Steps</div>
                    </div>
                  </div>

                  {analysis.reasoning && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Result</span>
                      <p className="text-xs text-[#2d5a5a] bg-white/50 p-2 rounded">
                        {analysis.reasoning}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {analysisHistory.length === 0 && !currentAnalysis && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8fbc8f]/10 to-[#2d5a5a]/10 flex items-center justify-center">
                  <BrainIcon className="w-6 h-6 text-[#8fbc8f]" />
                </div>
                <h5 className="text-sm font-medium text-[#1e3a3a] mb-2">Ready for Analysis</h5>
                <p className="text-sm text-muted-foreground mb-1">
                  Start a conversation to see AI processing insights
                </p>
                <p className="text-xs text-muted-foreground">
                  Track performance, timing, and model behavior
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats Footer */}
        <div className="p-4 border-t border-border/50 bg-gradient-to-r from-white/80 to-[#faf7f2]/80">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="text-sm font-bold text-[#2d5a5a]">{analysisHistory.length}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="text-sm font-bold text-[#2d5a5a]">
                {analysisHistory.reduce((acc, a) => acc + (a.tokenCount || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Tokens</div>
            </div>
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <div className="text-sm font-bold text-[#2d5a5a]">
                {analysisHistory.length > 0
                  ? formatDuration(
                      analysisHistory.reduce((acc, a) => 
                        acc + (a.endTime ? a.endTime - a.startTime : 0), 0
                      ) / analysisHistory.length
                    )
                  : '0ms'}
              </div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
          </div>
          
          {currentAnalysis && currentAnalysis.status === 'processing' && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-xs text-blue-700">
                <LoaderIcon className="w-3 h-3 animate-spin" />
                <span>Analysis in progress...</span>
              </div>
            </div>
          )}
          
          {currentAnalysis && currentAnalysis.status === 'completed' && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 text-xs text-green-700">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Analysis completed successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
