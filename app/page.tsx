"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef } from "react"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/components/ui/kibo-ui/ai/conversation"
import {
  AIInput,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ui/kibo-ui/ai/input"
import { AIMessage, AIMessageAvatar, AIMessageContent } from "@/components/ui/kibo-ui/ai/message"
import { AISuggestion, AISuggestions } from "@/components/ui/kibo-ui/ai/suggestion"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response"
import { AISources, AISourcesContent, AISourcesTrigger, AISource } from "@/components/ui/kibo-ui/ai/source"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HeartIcon, MicIcon, PlusIcon, ShieldCheckIcon, UserIcon, CalendarIcon, StarIcon, ClockIcon, MapPinIcon, GraduationCapIcon } from 'lucide-react'
import Image from "next/image"
import { CounselorCards } from "@/components/counselor-cards"

// Wellness-focused system prompt
const WELLNESS_SYSTEM_PROMPT = `You are Bloom, a compassionate emotional wellness companion created by The Bloom community. Your role is to provide warm, supportive, and empathetic responses focused on emotional wellbeing, mindfulness, and stress relief.

IMPORTANT:
- Keep your answers short and concise try to consume as less token as possible

🧠 You Specialize In:
- Emotional support
- Mindfulness and grounding techniques
- Stress and anxiety management
- Self-care routines
- Emotional regulation strategies

✅ You Can:
- Offer breathing exercises or mindfulness prompts
- Share affirmations, journaling ideas, or gratitude practices
- Help users identify and manage emotional triggers
- Encourage healthy routines and self-reflection

❌ You Cannot:
- Provide diagnosis, therapy, or medical advice
- Mention emergency services, external hotlines, websites, or apps
- Recommend searching for counselors elsewhere
- Encourage dependency — always promote self-empowerment

📌 For Crises (self-harm, suicidal thoughts, etc.):
Respond with:
"I'm concerned about your wellbeing. This needs professional support. Please speak to someone you trust or a licensed counselor. I'm here for general wellness support, but this needs human care."

📌 For medical/therapy questions:
Respond with:
"This requires guidance from a licensed mental health professional. I can offer general wellness tips, but not clinical advice."

📌 For counselor or session-related requests:
Respond with:
"I’d be happy to connect you with our qualified counselors. Let me show you who’s available to support you."

🌱 Always be gentle, brief, and non-judgmental.
🌱 Stay within general wellness — not therapy or clinical care.
🌱 Keep answers helpful, caring, and to the point.

You are a guide for wellbeing — not a replacement for professional care.
`;


export default function WellnessChat() {
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [showCounselors, setShowCounselors] = useState(false)

  // Wellness-focused models (prioritizing Google Gemini)
  const models = [
    // Google Gemini (Primary)
    { id: "gemini-1.5-flash", name: "Bloom Ai", provider: "google" },
    // { id: "gemini-1.5-pro", name: "Gemini Pro", provider: "google" },
    // { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "google" },
    // // OpenAI (Backup)
    // { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
    // { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
    // // Anthropic (Alternative)
    // { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "anthropic" },
    // { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", provider: "anthropic" },
  ]

  const [model, setModel] = useState<string>(models[0].id)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),

    onFinish: ({ message }) => {
      // ✅ correct destructuring
      const content = message.parts
        .filter((part) => part.type === "text")
        .map((part: any) => part.text || "")
        .join(" ")
        .toLowerCase()

      const counselorKeywords = [
        'counselor', 'counsellor', 'therapist', 'professional',
        'schedule', 'session', 'appointment', 'connect you', 'show you our'
      ]

      if (counselorKeywords.some(keyword => content.includes(keyword))) {
        setShowCounselors(true)
      }
    }
  })
  const [input, setInput] = useState("")

  // Wellness-focused suggestions
  const suggestions = [
    "I'm feeling overwhelmed with work stress",
    "Help me with breathing exercises for anxiety",
    "I need to schedule a session with a counselor",
    "How can I practice self-compassion?",
    "I need help managing difficult emotions",
    "Can you connect me with a therapist?",
  ]

  const currentProvider = models.find((m) => m.id === model)?.provider || "openai"

  const handleSuggestionClick = (suggestion: string) => {
    const provider = models.find((m) => m.id === model)?.provider || "openai"
    const effectiveWebSearch = provider === "openai" ? useWebSearch : false
    sendMessage({ 
      text: suggestion, 
      metadata: { 
        useWebSearch: effectiveWebSearch, 
        modelId: model, 
        provider,
        systemPrompt: WELLNESS_SYSTEM_PROMPT
      } 
    })
  }

  // Handle microphone recording
  const handleMicClick = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        const chunks: BlobPart[] = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" })
          const formData = new FormData()
          formData.append("audio", blob, "recording.webm")
          try {
            setTranscribing(true)
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            })
            const data = await res.json()
            if (data.text) {
              setInput(data.text)
            }
            setTranscribing(false)
          } catch (error) {
            console.error("Transcription error", error)
            setTranscribing(false)
          }
        }
        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
        setRecording(true)
      } catch (err) {
        console.error("Could not start recording", err)
      }
    } else {
      mediaRecorderRef.current?.stop()
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
      setRecording(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (input.trim()) {
      const provider = models.find((m) => m.id === model)?.provider || "openai"
      const effectiveWebSearch = provider === "openai" ? useWebSearch : false
      sendMessage({
        text: input,
        metadata: { 
          useWebSearch: effectiveWebSearch, 
          modelId: model, 
          provider,
          systemPrompt: WELLNESS_SYSTEM_PROMPT
        },
      })
      setInput("")
    }
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileInput = () => {
    fileInputRef.current?.click()
  }

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      sendMessage({
        // @ts-ignore
        parts: [
          {
            type: "file",
            data: dataUrl,
            mediaType: file.type,
            filename: file.name,
          } as any,
        ],
        metadata: { 
          modelId: model, 
          provider: models.find((m) => m.id === model)?.provider || "openai",
          systemPrompt: WELLNESS_SYSTEM_PROMPT
        },
      } as any)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleSignUp = () => {
    setIsSignedUp(true)
    // In a real app, this would handle actual signup
    console.log("User signed up!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] to-[#f0f4f0] p-4">
      <div className="w-full max-w-none h-screen">
        <Card className="h-full bloom-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="wellness-gradient text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Bloom Wellness</h1>
                  <p className="text-white/80 text-sm">Your emotional wellness companion</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSignedUp && (
                  <Badge variant="secondary" className="bg-green-500/20 text-white border-green-400/30">
                    <UserIcon className="w-3 h-3 mr-1" />
                    Signed Up
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  Safe Space
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-120px)]">
            <div className="relative flex size-full overflow-hidden">
              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col divide-y divide-border/50">
                <AIConversation>
                  <AIConversationContent>
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
                        <div className="w-20 h-20 wellness-gradient rounded-full flex items-center justify-center">
                          <HeartIcon className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-semibold text-[#1e3a3a]">Welcome to Your Safe Space</h2>
                          <p className="text-muted-foreground max-w-md leading-relaxed">
                            I'm here to support your emotional wellbeing with mindfulness techniques, stress management, 
                            and gentle guidance. I can also connect you with professional counselors when needed.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="outline" className="text-xs">Mindfulness</Badge>
                          <Badge variant="outline" className="text-xs">Stress Relief</Badge>
                          <Badge variant="outline" className="text-xs">Emotional Support</Badge>
                          <Badge variant="outline" className="text-xs">Professional Help</Badge>
                        </div>
                      </div>
                    ) : (
                      messages.slice(1).map((message) => {
                        // Extract sources from 'source' parts (streamed via sendSources)
                        const sourceParts = message.parts.filter(
                          (part) => part.type === "source-url" || part.type === "source-document",
                        )
                        const streamedSources = sourceParts
                          .map((part: any) => ({
                            title: part.title || part.source?.title || part.url || part.source?.url,
                            href: part.url || part.source?.url,
                          }))
                          .filter((s) => !!s.href)

                        // Extract sources from tool results (web_search_preview)
                        const toolSources = message.parts
                          .filter((part) => part.type === "tool-result")
                          .flatMap((part) => {
                            if (part.type === "tool-result") {
                              const toolResult = part as any
                              if (toolResult.toolName === "web_search_preview" && toolResult.result) {
                                let parsed = toolResult.result
                                if (typeof parsed === "string") {
                                  try {
                                    parsed = JSON.parse(parsed)
                                  } catch {
                                    return []
                                  }
                                }
                                return (
                                  parsed.results?.map((r: any) => ({
                                    title: r.title,
                                    href: r.url,
                                  })) || []
                                )
                              }
                            }
                            return []
                          })

                        // Merge and deduplicate sources by href
                        const sourcesMap = new Map<string, { title: string; href: string }>()
                        ;[...streamedSources, ...toolSources].forEach((s) => {
                          if (s && s.href && !sourcesMap.has(s.href)) {
                            sourcesMap.set(s.href, s as { title: string; href: string })
                          }
                        })
                        const sources = Array.from(sourcesMap.values())

                        return (
                          <AIMessage from={message.role === "user" ? "user" : "assistant"} key={message.id}>
                            <div>
                              {sources.length > 0 && (
                                <AISources className="mb-2" key={`src-${message.id}`}>
                                  <AISourcesTrigger count={sources.length} />
                                  <AISourcesContent>
                                    {sources.map((source, index) => (
                                      <AISource key={index} href={source.href} title={source.title} />
                                    ))}
                                  </AISourcesContent>
                                </AISources>
                              )}
                              <AIMessageContent>
                                <AIResponse>
                                  {message.parts.map((part) => (part.type === "text" ? part.text : null)).join("")}
                                </AIResponse>
                              </AIMessageContent>
                            </div>
                            <AIMessageAvatar
                              name={message.role === "user" ? "You" : "Bloom"}
                              src={
                                message.role === "user"
                                  ? "https://github.com/haydenbleasel.png"
                                  : "/placeholder.svg?height=32&width=32&query=wellness+heart+icon"
                              }
                            />
                          </AIMessage>
                        )
                      })
                    )}
                  </AIConversationContent>
                  <AIConversationScrollButton />
                </AIConversation>
                <div className="grid shrink-0 gap-4 pt-4 bg-gradient-to-t from-white/50 to-transparent">
                  <AISuggestions className="px-4">
                    {suggestions.map((s) => (
                      <AISuggestion 
                        key={s} 
                        suggestion={s} 
                        onClick={() => handleSuggestionClick(s)}
                        className="border-[#8fbc8f]/30 hover:border-[#2d5a5a] hover:bg-[#8fbc8f]/10"
                      />
                    ))}
                  </AISuggestions>
                  <div className="w-full px-4 pb-4">
                    <AIInput onSubmit={handleSubmit} className="border-[#8fbc8f]/30 bg-white/90 backdrop-blur-sm">
                      <AIInputTextarea
                        onChange={(event) => setInput(event.target.value)}
                        value={input}
                        disabled={transcribing}
                        placeholder={transcribing ? "Transcribing your voice..." : "Share what's on your mind..."}
                        className="placeholder:text-muted-foreground/60"
                      />
                      <AIInputToolbar>
                        <AIInputTools>
                          <AIInputButton onClick={handleFileInput} className="text-[#2d5a5a] hover:bg-[#8fbc8f]/10">
                            <PlusIcon size={16} />
                            <span className="sr-only">Add image</span>
                          </AIInputButton>
                          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileSelected} />
                          <AIInputButton 
                            onClick={handleMicClick} 
                            variant={recording ? "default" : "ghost"}
                            className={recording ? "bg-[#2d5a5a] text-white" : "text-[#2d5a5a] hover:bg-[#8fbc8f]/10"}
                          >
                            <MicIcon size={16} />
                            <span className="sr-only">Voice input</span>
                          </AIInputButton>
                          <AIInputModelSelect onValueChange={setModel} value={model}>
                            <AIInputModelSelectTrigger className="text-[#2d5a5a]">
                              <AIInputModelSelectValue />
                            </AIInputModelSelectTrigger>
                            <AIInputModelSelectContent>
                              {models.map((m) => (
                                <AIInputModelSelectItem key={m.id} value={m.id} className="flex items-center gap-2">
                                  {/* provider logos */}
                                  {m.provider === "google" && (
                                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded-full" />
                                  )}
                                  {m.provider === "openai" && (
                                    <Image
                                      src="https://github.com/openai.png"
                                      alt="OpenAI"
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                  )}
                                  {m.provider === "anthropic" && (
                                    <Image
                                      src="https://github.com/anthropics.png"
                                      alt="Anthropic"
                                      width={16}
                                      height={16}
                                      className="rounded"
                                    />
                                  )}
                                  {m.name}
                                </AIInputModelSelectItem>
                              ))}
                            </AIInputModelSelectContent>
                          </AIInputModelSelect>
                        </AIInputTools>
                        <AIInputSubmit 
                          disabled={!input || transcribing} 
                          status={transcribing ? "submitted" : status}
                          className="bg-[#2d5a5a] hover:bg-[#1e3a3a] text-white"
                        />
                      </AIInputToolbar>
                    </AIInput>
                  </div>
                </div>
              </div>

              {/* Counselor Sidebar */}
              {showCounselors && (
                <div className="w-96 border-l border-border/50 bg-gradient-to-b from-white/90 to-[#faf7f2]/90 backdrop-blur-sm">
                  <CounselorCards 
                    isSignedUp={isSignedUp} 
                    onSignUp={handleSignUp}
                    onClose={() => setShowCounselors(false)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
