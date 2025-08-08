import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XIcon, MicIcon, MessageSquareIcon, ClockIcon, CpuIcon, ZapIcon, CheckCircleIcon, LoaderIcon } from 'lucide-react'
// Removed Tabs imports as they are no longer needed

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

export function AnalysisSidebar({ currentAnalysis, analysisHistory, onClose }: AnalysisSidebarProps) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="w-80 border-l border-border/50 bg-gradient-to-b from-white/95 to-[#faf7f2]/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CpuIcon className="w-5 h-5 text-[#2d5a5a]" />
            <h3 className="text-lg font-semibold text-[#1e3a3a]">Real-time Analysis</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Analysis */}
          {currentAnalysis && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(currentAnalysis.status)}`}></div>
                  <CardTitle className="text-sm font-semibold text-blue-800">
                    Processing {currentAnalysis.type === 'voice' ? 'Voice' : 'Text'} Request
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Overview Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                    <CpuIcon className="w-3 h-3" /> Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Model</span>
                      <Badge variant="outline" className="text-xs">
                        {currentAnalysis.model}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-mono text-blue-700">
                        {formatDuration(Date.now() - currentAnalysis.startTime)}
                      </span>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-muted-foreground">Current Status</span>
                      <p className="text-blue-700">
                        {currentAnalysis.steps[currentAnalysis.steps.length - 1]?.step || 'Initializing...'}
                      </p>
                    </div>
                    {currentAnalysis.reasoning && (
                      <div className="col-span-2 space-y-1">
                        <span className="text-muted-foreground">Summary</span>
                        <p className="text-blue-700 line-clamp-2">
                          {currentAnalysis.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Processing Steps Section */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                    <ZapIcon className="w-3 h-3" /> Processing Steps
                  </h4>
                  <div className="space-y-2">
                    {currentAnalysis.steps.map((step, index) => (
                      <Card key={index} className={`border ${step.status === 'processing' ? 'border-blue-300 bg-blue-50' : 'border-green-300 bg-green-50'}`}>
                        <CardContent className="p-3 flex items-center gap-2 text-xs">
                          {step.status === 'processing' ? (
                            <LoaderIcon className="w-3 h-3 text-blue-600 animate-spin" />
                          ) : (
                            <CheckCircleIcon className="w-3 h-3 text-green-600" />
                          )}
                          <span className={step.status === 'processing' ? 'text-blue-800' : 'text-green-800'}>
                            {step.step}
                          </span>
                          {step.duration && (
                            <span className="text-muted-foreground ml-auto font-mono">
                              {formatDuration(step.duration)}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Metrics & Details Section */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" /> Metrics & Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Tokens Used</span>
                      <span className="font-mono text-blue-700">
                        {currentAnalysis.tokenCount || 'N/A'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Total Duration</span>
                      <span className="font-mono text-blue-700">
                        {formatDuration(Date.now() - currentAnalysis.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Analysis History */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[#1e3a3a] flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Recent Analysis
            </h4>
            {analysisHistory.map((analysis) => (
              <Card key={analysis.id} className="border-[#8fbc8f]/20 hover:border-[#8fbc8f]/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {analysis.type === 'voice' ? (
                        <MicIcon className="w-3 h-3 text-[#2d5a5a]" />
                      ) : (
                        <MessageSquareIcon className="w-3 h-3 text-[#2d5a5a]" />
                      )}
                      <span className="text-xs font-medium">
                        {analysis.type === 'voice' ? 'Voice' : 'Text'} Request
                      </span>
                    </div>
                    <Badge 
                      variant={analysis.status === 'completed' ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {analysis.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Duration</span>
                      <div className="text-xs font-mono text-[#2d5a5a]">
                        {analysis.endTime 
                          ? formatDuration(analysis.endTime - analysis.startTime)
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Tokens</span>
                      <div className="text-xs font-mono text-[#2d5a5a]">{analysis.tokenCount || 0}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Model</span>
                    <Badge variant="outline" className="text-xs">
                      {analysis.model}
                    </Badge>
                  </div>
                  
                  {analysis.reasoning && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Summary</span>
                      <p className="text-xs text-[#2d5a5a] line-clamp-2">
                        {analysis.reasoning}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Steps ({analysis.steps.length})</span>
                    <div className="space-y-1">
                      {analysis.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700 truncate">
                            {step.step}
                          </span>
                          {step.duration && (
                            <span className="text-xs text-muted-foreground ml-auto font-mono">
                              {formatDuration(step.duration)}
                            </span>
                          )}
                        </div>
                      ))}
                      {analysis.steps.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-2">
                          +{analysis.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {analysisHistory.length === 0 && !currentAnalysis && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#8fbc8f]/10 flex items-center justify-center">
                  <CpuIcon className="w-5 h-5 text-[#8fbc8f]" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Start a conversation to see real-time analysis
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Track processing steps, timing, and token usage
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Analysis Stats Footer */}
        <div className="p-4 border-t border-border/50 bg-white/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs font-semibold text-[#2d5a5a]">
                {analysisHistory.length}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#2d5a5a]">
                {analysisHistory.reduce((acc, a) => acc + (a.tokenCount || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Tokens</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#2d5a5a]">
                {analysisHistory.length > 0 
                  ? formatDuration(
                      analysisHistory.reduce((acc, a) => 
                        acc + (a.endTime ? a.endTime - a.startTime : 0), 0
                      ) / analysisHistory.length
                    )
                  : '0ms'
                }
              </div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
