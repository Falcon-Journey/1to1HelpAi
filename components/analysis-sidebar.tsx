"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { XIcon, CpuIcon, ClockIcon, CheckCircleIcon, XCircleIcon, Loader2Icon, MessageSquareIcon, MicIcon, PlayIcon, SparklesIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import React from "react"

interface AnalysisStep {
  step: string
  timestamp: number
  duration?: number
  status: 'processing' | 'completed'
}

interface AnalysisItem {
  id: string
  type: 'text' | 'voice'
  status: 'processing' | 'completed' | 'error'
  startTime: number
  endTime?: number
  steps: AnalysisStep[]
  tokenCount?: number
  model?: string
  reasoning?: string
  tone?: string
}

interface AnalysisSidebarProps {
  isOpen?: boolean // Not strictly needed if controlled by parent, but good for clarity
  onClose: () => void
  currentAnalysis?: AnalysisItem
  analysisHistory: AnalysisItem[]
}

export function AnalysisSidebar({ onClose, currentAnalysis, analysisHistory }: AnalysisSidebarProps) {

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const calculateProgress = (analysis: AnalysisItem) => {
    if (analysis.status === 'completed' || analysis.status === 'error') return 100
    if (!analysis.steps.length) return 0
    const completedSteps = analysis.steps.filter(step => step.status === 'completed').length
    return (completedSteps / analysis.steps.length) * 100
  }

  const getModelName = (modelId?: string) => {
    switch (modelId) {
      case 'coach':
        return 'Wellness Coach';
      case 'therapist':
        return 'Therapist Connect';
      case 'gpt-4o-mini':
        return '1to1Help Ai';
      default:
        return 'Unknown Model';
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#2d5a5a]">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">Understanding the AI's thought process</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#2d5a5a] hover:bg-[#8fbc8f]/10"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto p-4">
        {/* Current Analysis */}
        {currentAnalysis && (
          <>
            {/* Start Card */}
            <Card className="mb-4 border-[#8fbc8f]/30 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PlayIcon className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-[#2d5a5a]">Analysis Started</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Initiating AI thought process for your {currentAnalysis.type} input.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-[#2d5a5a]">
                  {currentAnalysis.type === 'text' ? (
                    <MessageSquareIcon className="inline-block w-4 h-4 mr-1 align-middle" />
                  ) : (
                    <MicIcon className="inline-block w-4 h-4 mr-1 align-middle" />
                  )}
                  Input Type: {currentAnalysis.type === 'text' ? 'Text' : 'Voice'}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2d5a5a] mt-1">
                  <CpuIcon className="w-4 h-4" />
                  Model: {getModelName(currentAnalysis.model)}
                </div>
              </CardContent>
            </Card>

            {/* Thought Process Card */}
            <Card className="mb-4 border-[#8fbc8f]/30 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-[#2d5a5a]">AI Thought Process</CardTitle>
                  <Badge
                    className={cn(
                      "ml-auto",
                      currentAnalysis.status === 'processing' && "bg-blue-100 text-blue-700",
                      currentAnalysis.status === 'completed' && "bg-green-100 text-green-700",
                      currentAnalysis.status === 'error' && "bg-red-100 text-red-700"
                    )}
                  >
                    {currentAnalysis.status === 'processing' && <Loader2Icon className="w-3 h-3 mr-1 animate-spin" />}
                    {currentAnalysis.status === 'completed' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                    {currentAnalysis.status === 'error' && <XCircleIcon className="w-3 h-3 mr-1" />}
                    {currentAnalysis.status.charAt(0).toUpperCase() + currentAnalysis.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current stage of AI processing and reasoning.
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Progress value={calculateProgress(currentAnalysis)} className="h-2" />
                <div className="space-y-2">
                  {currentAnalysis.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {step.status === 'completed' ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <Loader2Icon className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      <span className="flex-1 text-[#2d5a5a]">{step.step}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatTime(step.timestamp)}
                        {step.duration && ` (${step.duration}ms)`}
                      </span>
                    </div>
                  ))}
                </div>
                {currentAnalysis.reasoning && (
                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-[#8fbc8f]/10 rounded-md">
                    <span className="font-semibold text-[#2d5a5a]">Reasoning:</span> {currentAnalysis.reasoning}
                  </div>
                )}
                {currentAnalysis.tone && (
                  <div className="text-xs text-muted-foreground p-2 bg-[#8fbc8f]/10 rounded-md">
                    <span className="font-semibold text-[#2d5a5a]">Tone:</span> {currentAnalysis.tone}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Card (only show if current analysis is completed) */}
            {currentAnalysis.status === 'completed' && (
              <Card className="mb-4 border-[#8fbc8f]/30 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-[#2d5a5a]">Analysis Completed!</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI has finished processing your request.
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#2d5a5a]">
                    <ClockIcon className="w-4 h-4" />
                    Total Duration: {currentAnalysis.endTime ? `${((currentAnalysis.endTime - currentAnalysis.startTime) / 1000).toFixed(1)}s` : 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#2d5a5a]">
                    <CpuIcon className="w-4 h-4" />
                    Tokens Used: {currentAnalysis.tokenCount || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Analysis History */}
        {analysisHistory.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-[#2d5a5a] mt-6 mb-2">Past Analyses</h4>
            {analysisHistory.map((analysis) => (
              <Card key={analysis.id} className="border-[#8fbc8f]/20 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {analysis.type === 'text' ? (
                      <MessageSquareIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <MicIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-base text-[#2d5a5a]">
                      {analysis.type === 'text' ? 'Text Analysis' : 'Voice Analysis'}
                    </CardTitle>
                    <Badge
                      className={cn(
                        "ml-auto",
                        analysis.status === 'completed' && "bg-green-100 text-green-700",
                        analysis.status === 'error' && "bg-red-100 text-red-700"
                      )}
                    >
                      {analysis.status === 'completed' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                      {analysis.status === 'error' && <XCircleIcon className="w-3 h-3 mr-1" />}
                      {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Model: {getModelName(analysis.model)} • Duration: {analysis.endTime ? `${((analysis.endTime - analysis.startTime) / 1000).toFixed(1)}s` : 'N/A'}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 text-sm space-y-2">
                  <p className="text-muted-foreground">
                    Tokens: {analysis.tokenCount || 'N/A'}
                  </p>
                  {analysis.reasoning && (
                    <div className="text-xs text-muted-foreground p-2 bg-[#8fbc8f]/10 rounded-md">
                      Reasoning: {analysis.reasoning}
                    </div>
                  )}
                  {analysis.tone && (
                    <div className="text-xs text-muted-foreground p-2 bg-[#8fbc8f]/10 rounded-md">
                      Tone: {analysis.tone}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {analysisHistory.length === 0 && !currentAnalysis && (
          <div className="text-center py-8 text-muted-foreground">
            <CpuIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No analysis data yet. Start a conversation to see the AI's thought process!</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-[#8fbc8f]/5">
        <p className="text-xs text-muted-foreground text-center">
          AI analysis provides insights into model operations.
        </p>
      </div>
    </div>
  )
}
