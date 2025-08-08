"use client"
import type React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import { useState, useRef, useEffect } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { HeartIcon, MicIcon, PlusIcon, ShieldCheckIcon, UserIcon, CalendarIcon, StarIcon, ClockIcon, MapPinIcon, GraduationCapIcon, MessageSquareIcon, MicOffIcon, VolumeXIcon, Volume2Icon, PlayIcon, PauseIcon, MonitorStopIcon as StopIcon, XIcon, CpuIcon, ZapIcon } from 'lucide-react'
import Image from "next/image"
import logo from "@/public/logo.png"
import favicon from "@/public/favicon.png"
import { CounselorCards } from "@/components/counselor-cards"
import { AnalysisSidebar } from '@/components/analysis-sidebar'

// Add this function before the component
function isWellnessRelated(text: string): boolean {
  const wellnessKeywords = [
    'wellness', 'mindfulness', 'stress', 'anxiety', 'breathing', 'meditation',
    'emotional', 'feelings', 'mental health', 'self-care', 'relaxation',
    'wellbeing', 'calm', 'peace', 'support', 'counselor', 'therapy'
  ];
  const lowerText = text.toLowerCase();
  return wellnessKeywords.some(keyword => lowerText.includes(keyword)) ||
    lowerText.includes('how are you feeling') ||
    lowerText.includes('emotional wellness') ||
    lowerText.includes('here specifically for');
}

// Wellness-focused system prompt for Realtime API - More strict
const WELLNESS_SYSTEM_PROMPT = `You are 1to1Help, a compassionate emotional wellness companion created by The 1to1Help community. You are based in India and you must speak in Indian voice and with Indian accent. Your role is to provide warm, supportive, and empathetic responses focused on emotional wellbeing, mindfulness, and stress relief.

IMPORTANT:
- Keep your answers short and concise — try to consume as few tokens as possible.
- You must speak in Indian voice and with Indian accent.

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
"I'd be happy to connect you with our qualified counselors. Let me show you who's available to support you."

🌱 Additional Behaviour Rules:
- When a patient initiates a conversation, **do not solve the problem immediately** — first ask open, gentle questions to understand what they are feeling and experiencing.
- When offering a suggestion or solution, **always end with a gentle follow-up prompt** such as: "Does that seem helpful?" or "Would you like to explore that together?"

🌱 Always be gentle, brief, and non-judgmental.
🌱 Stay within general wellness — not therapy or clinical care.
🌱 Keep answers helpful, caring, and to the point.

You are a guide for wellbeing — not a replacement for professional care.`;

const COACH_SYSTEM_PROMPT = `You are 1to1Help Health Coach AI, a supportive health and wellness guide created by The 1to1Help community in India. Speak in an Indian voice and accent.

Your role is to provide concise, practical advice focused on healthy lifestyle habits, fitness motivation, nutrition basics, and wellbeing routines.

🧠 Specialize in:
- Healthy lifestyle guidance
- Nutrition tips
- Fitness motivation and routines
- Daily wellness habits and self-care

✅ You can:
- Suggest simple exercises or movement tips
- Share balanced diet ideas and hydration reminders
- Encourage healthy sleep and stress management
- Motivate users to build sustainable habits

❌ You cannot:
- Provide medical diagnosis or prescribe treatments
- Offer therapy or clinical advice
- Mention emergency services or external hotlines

When starting a conversation, ask open questions to understand current habits and goals before suggesting changes. Always end with a gentle prompt like "Does that sound doable?" or "Would you like to try this together?"

Keep answers brief, encouraging, and practical.`;

export default function WellnessChat() {
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [showCounselors, setShowCounselors] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceLevel, setVoiceLevel] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null)
  const [events, setEvents] = useState<any[]>([])

  // Analysis tracking state - FAKE but convincing
  const [analysisData, setAnalysisData] = useState<any[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    id: string
    type: 'text' | 'voice'
    status: 'processing' | 'completed' | 'error'
    startTime: number
    endTime?: number
    steps: Array<{
      step: string
      timestamp: number
      duration?: number
      status: 'processing' | 'completed'  
    }>
    tokenCount?: number
    model?: string
    reasoning?: string
  }>()

  // Fake analysis system with realistic timing
  const createFakeAnalysis = (type: 'text' | 'voice', model?: string) => {
    const id = Date.now().toString()
    const analysis = {
      id,
      type,
      status: 'processing' as const,
      startTime: Date.now(),
      steps: [],
      model,
      tokenCount: 0  
    }
    
    setCurrentAnalysis(analysis)
    
    // Fake realistic steps with timing
    const steps = type === 'voice' 
      ? [
          { step: 'Processing voice input', delay: 100 },
          { step: 'Connecting to Realtime API', delay: 300 },
          { step: 'Analyzing wellness context', delay: 500 },
          { step: 'Generating voice response', delay: 800 },
          { step: 'Streaming audio output', delay: 1200 }
        ]
      : [
          { step: 'Processing text input', delay: 100 },
          { step: 'Analyzing wellness context', delay: 300 },
          { step: 'Connecting to AI model', delay: 500 },
          { step: 'Generating response', delay: 800 },
          { step: 'Streaming text output', delay: 1200 }
        ]
    
    // Add steps with realistic delays
    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCurrentAnalysis(prev => {
          if (!prev || prev.id !== id) return prev
          const newStep = {
            step,
            timestamp: Date.now(),
            status: 'processing' as const
          }
          return {
            ...prev,
            steps: [...prev.steps, newStep]
          }
        })
      }, delay)
    })
  }

  const completeFakeAnalysis = (reasoning?: string) => {
    if (!currentAnalysis) return
    
    const endTime = Date.now()
    const duration = endTime - currentAnalysis.startTime
    const tokenCount = Math.floor(Math.random() * 100) + 50 // Fake token count
    
    // Complete all steps
    const completedSteps = currentAnalysis.steps.map(step => ({
      ...step,
      status: 'completed' as const,
      duration: Math.floor(Math.random() * 500) + 200 // Fake realistic durations
    }))
    
    const completedAnalysis = {
      ...currentAnalysis,
      status: 'completed' as const,
      endTime,
      reasoning: reasoning || 'Analysis completed successfully',
      tokenCount,
      steps: completedSteps
    }
    
    setAnalysisData(prev => [completedAnalysis, ...prev.slice(0, 9)])
    setCurrentAnalysis(undefined)
  }

  // Refs for Realtime API
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const animationFrame = useRef<number | null>(null)

  // Wellness-focused models
  const models = [  
    { id: "gpt-4o-mini", name: "1to1Help Ai", provider: "openai" },  
    { id: "coach", name: "Wellness Coach", provider: "coach" },
  ]

  const [model, setModel] = useState<string>(models[0].id)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",  
    }),
    onFinish: ({ message }) => {
      // Complete fake analysis when message appears
        setTimeout(() => {
          completeFakeAnalysis('Wellness response generated successfully')
        }, 500) // Small delay to make it feel realistic

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
    },
    onError: (error) => {
      if (currentAnalysis) {
        completeFakeAnalysis('Error occurred during processing')
      }
    }
  })

  const [input, setInput] = useState("")

  // Suggestions
  const suggestions = [
    "I'm feeling overwhelmed with work stress",
    "Help me with breathing exercises for anxiety",
    "I need to schedule a session with a counselor",
    "Can you connect me with a therapist?",
  ]

  const coachSuggestions = [
    "I want a personalized fitness plan",
    "Help me start a healthy eating routine",
    "Guide me on improving my sleep schedule",
    "I need motivation for regular exercise",
  ]

  // const voiceSuggestions = [
  //   "Tell me about mindfulness",
  //   "I need stress relief",
  //   "Help me feel calmer",
  //   "Guide me through breathing",
  // ]

  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // OpenAI Realtime API Functions
  async function startSession() {
    try {
      console.log('🎙️ Starting Realtime API session')
      
      // Get a session token for OpenAI Realtime API
      const tokenResponse = await fetch(`/api/token?model=${encodeURIComponent(model)}`);
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const systemPrompt = model === "coach" ? COACH_SYSTEM_PROMPT : WELLNESS_SYSTEM_PROMPT;

      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Setup audio element for playback
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
          audioElement.current.onended = () => setIsSpeaking(false);
          audioElement.current.onpause = () => setIsSpeaking(false);      
        }    
      };

      // Get microphone audio track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioLevelMonitoring(ms);
      pc.addTrack(ms.getTracks()[0]);

      // Create data channel and store in ref
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('📨 Realtime API message', { type: message.type })
        
        if (message.type === "response.audio.delta") {
          setIsSpeaking(true);
        } else if (message.type === "response.done") {
          setIsSpeaking(false);
          // Complete fake analysis for voice
          if (currentAnalysis) {
            setTimeout(() => {
              completeFakeAnalysis('Voice interaction completed successfully')
            }, 300)
          }
        } else if (message.type === "conversation.item.created" &&
          message.item?.role === "assistant"      
        ) {
          const content = message.item?.content?.[0]?.text || "";
          if (content && !isWellnessRelated(content)) {
            console.warn("Non-wellness response detected:", content);        
          }
        }
        setEvents((prev) => [message, ...prev]);    
      };

      dc.onopen = () => {
        console.log('🔗 Data channel opened')
        // Send session create event immediately when data channel opens
        sendClientEvent({
          type: "session.create",
          response: {
            modalities: ["audio", "text"],
            input: [            
              {
                role: "system",
                type: "message",
                content: [                
                  {
                    type: "input_text",
                    text: systemPrompt,                
                  },              
                ],            
              },          
            ],        
          },
          session: {
            modalities: ["text", "audio"],
            instructions: WELLNESS_SYSTEM_PROMPT,
            voice: "sage",
            speed: "3.0",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1",          
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200,          
            },
            temperature: 0.7,
            max_response_output_tokens: 150,        
          },      
        });    
      };

      dc.onclose = () => {
        console.log('🔌 Data channel closed')
        setIsSessionActive(false);
        setIsListening(false);    
      };

      dc.onerror = (error) => {
        console.log('❌ Data channel error', error)
      };

      // SDP negotiation
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const realtimeModel = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${realtimeModel}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",      
        },    
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),    
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
      setIsSessionActive(true);
      setIsListening(true);
      console.log('✅ Realtime session started successfully')
    } catch (error) {
      console.log('❌ Failed to start session', error)
      setIsListening(false);
      setIsSessionActive(false);  
    }
  }

  // Stop session and cleanup
  function stopSession() {
    console.log('🛑 Stopping Realtime session')
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;  
    }
    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();    
      });
      peerConnection.current.close();
      peerConnection.current = null;  
    }
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current.srcObject = null;
      audioElement.current = null;  
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;  
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;  
    }
    analyser.current = null;
    setIsSessionActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setVoiceLevel(0);
    setEvents([]);
    
    console.log('🏁 Realtime session stopped')
  }

  // Send event safely using dataChannelRef
  function sendClientEvent(message: any) {
    const dc = dataChannelRef.current;
    if (dc && dc.readyState === "open") {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();
      if (!message.timestamp) {
        message.timestamp = timestamp;    
      }
      dc.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
      console.log('📤 Sent client event', { type: message.type })
    } else {
      console.log('❌ Failed to send message - no data channel available', message)
    }
  }

  // Audio level monitoring
  function setupAudioLevelMonitoring(stream: MediaStream) {
    audioContext.current = new AudioContext();
    analyser.current = audioContext.current.createAnalyser();
    const source = audioContext.current.createMediaStreamSource(stream);
    source.connect(analyser.current);
    analyser.current.fftSize = 256;
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function updateLevel() {
      if (analyser.current && isListening) {
        analyser.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const level = Math.min(5, Math.floor((average / 255) * 5));
        setVoiceLevel(level);
        animationFrame.current = requestAnimationFrame(updateLevel);    
      }  
    }
    updateLevel();
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isSessionActive) stopSession();  
    };
  }, [isSessionActive]);

  const currentProvider = models.find((m) => m.id === model)?.provider || "openai"

  const handleSuggestionClick = (suggestion: string) => {
    if (isVoiceMode && isSessionActive) {
      // Start fake voice analysis
      createFakeAnalysis('voice', 'gpt-4o-realtime')
      
      // Send voice suggestion to Realtime API
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [          
            {
              type: "input_text",
              text: suggestion          
            }        
          ]      
        }    
      });
      
      // Trigger response
      sendClientEvent({
        type: "response.create"    
      });
      return;  
    }

    // Text mode - start fake analysis
    createFakeAnalysis('text', model)
    
    const systemPrompt = model === "coach" ? COACH_SYSTEM_PROMPT : WELLNESS_SYSTEM_PROMPT;
    const provider = models.find((m) => m.id === model)?.provider || "openai"
    const effectiveWebSearch = provider === "openai" ? useWebSearch : false
    
    sendMessage({
      text: suggestion,
      metadata: {
        useWebSearch: effectiveWebSearch,
        modelId: model,
        provider,
        systemPrompt: systemPrompt      
      }    
    })
  }

  // Handle microphone click - now uses Realtime API in voice mode
  const handleMicClick = async () => {
    if (isVoiceMode) {
      if (isSessionActive) {
        stopSession();    
      } else {
        await startSession();    
      }
      return;  
    }

    // Original transcription logic for text mode
    if (!recording) {
      try {
        console.log('🎤 Starting voice recording')
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
            console.log('🔄 Transcribing audio')
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,          
            })
            const data = await res.json()
            if (data.text) {
              setInput(data.text)
              console.log('✅ Transcription completed', { text: data.text })
            }
            setTranscribing(false)        
          } catch (error) {
            console.log('❌ Transcription error', error)
            setTranscribing(false)        
          }      
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
        setRecording(true)    
      } catch (err) {
        console.log('❌ Could not start recording', err)
      }  
    } else {
      console.log('🛑 Stopping voice recording')
      mediaRecorderRef.current?.stop()
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
      setRecording(false)  
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (input.trim()) {
      // Start fake analysis
      createFakeAnalysis('text', model)
      
      const provider = models.find((m) => m.id === model)?.provider || "openai"
      const effectiveWebSearch = provider === "openai" ? useWebSearch : false
      const systemPrompt = model === "coach" ? COACH_SYSTEM_PROMPT : WELLNESS_SYSTEM_PROMPT;
      
      sendMessage({
        text: input,
        metadata: {
          useWebSearch: effectiveWebSearch,
          modelId: model,
          provider: provider,
          systemPrompt: systemPrompt        
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

    console.log('📎 File selected', { name: file.name, type: file.type, size: file.size })

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
    console.log('✅ User signed up')
  }

  // Monitor chat status changes
  useEffect(() => {
    console.log('📊 Chat status changed', { status })
  }, [status])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] to-[#f0f4f0] p-4">
      <div className="w-full max-w-none h-screen">
        <Card className="h-full bloom-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="wellness-gradient text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="relative w-70 h-20 cursor-pointer"
                  onClick={() => window.location.reload()}
                >
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt="1to1Help Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Analysis Toggle */}
                <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-medium">Analysis</span>
                  <Switch
                    checked={showAnalysis}
                    onCheckedChange={setShowAnalysis}
                    className="data-[state=checked]:bg-[#8fbc8f] data-[state=unchecked]:bg-white/20"
                  />
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
                  {isVoiceMode && isSessionActive && (
                    <Badge variant="secondary" className="bg-green-500/20 text-white border-green-400/30 animate-pulse">
                      <Volume2Icon className="w-3 h-3 mr-1" />                    
                      Live
                    </Badge>                
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-[calc(100%-120px)]">
            <div className="relative flex size-full overflow-hidden">
              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col divide-y divide-border/50">
                {isVoiceMode ? (
                  /* Voice Mode UI - Improved Layout */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4 min-h-0">
                      {/* Main Voice Visualization */}
                      <div className="relative flex flex-col items-center space-y-4">
                        {/* Primary Voice Circle */}
                        <div className="relative">
                          <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isSpeaking                             
                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 scale-105 shadow-2xl shadow-green-500/30'                             
                              : isSessionActive                               
                                ? 'bg-gradient-to-br from-[#8fbc8f] to-[#2d5a5a] scale-100 shadow-xl'                               
                                : 'bg-gradient-to-br from-gray-400 to-gray-600 scale-95'
                          }`}>
                            {isSpeaking ? (
                              <div className="flex items-center space-x-2">
                                <Volume2Icon className="w-12 h-12 text-white animate-pulse" />
                                <div className="flex space-x-1">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-1.5 h-6 bg-white rounded-full animate-bounce"
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                    />                                
                                  ))}
                                </div>
                              </div>                          
                            ) : (
                              <Image
                                src={favicon || "/placeholder.svg"}
                                alt="1to1Help Logo" 
                                className={`w-12 h-12 text-white ${isSessionActive ? 'animate-pulse' : ''}`} 
                              />                          
                            )}
                          </div>
                          {/* Outer Ring Animation */}
                          {isSessionActive && (
                            <>
                              <div className="absolute inset-0 rounded-full border-4 border-[#8fbc8f]/30 animate-ping"></div>
                              <div className="absolute inset-0 rounded-full border-2 border-[#8fbc8f]/50 animate-pulse"></div>
                            </>                        
                          )}
                        </div>

                        {/* Status Text */}
                        <div className="text-center space-y-2">
                          <h2 className={`text-2xl font-semibold transition-colors duration-300 ${
                            isSpeaking ? 'text-green-600' : isSessionActive ? 'text-[#1e3a3a]' : 'text-gray-600'
                          }`}>
                            {isSpeaking ? '🎙️ I\'m responding...' : isSessionActive ? '👂 I\'m listening...' : '💚 Voice Wellness Mode'}
                          </h2>
                          <p className={`max-w-md leading-relaxed text-sm transition-colors duration-300 ${
                            isSpeaking ? 'text-green-700' : isSessionActive ? 'text-muted-foreground' : 'text-gray-500'
                          }`}>
                            {isSpeaking                             
                              ? 'I\'m providing wellness guidance through voice.'                             
                              : isSessionActive                               
                                ? 'Share your feelings and I\'ll support you with care.'                               
                                : 'Start a voice conversation for personalized emotional wellness support.'
                            }
                          </p>
                        </div>

                        {/* Voice Level Indicator - Only show when listening and not speaking */}
                        {isSessionActive && !isSpeaking && (
                          <div className="flex items-end gap-1 h-12">
                            {[...Array(7)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 bg-gradient-to-t from-[#8fbc8f] to-[#2d5a5a] rounded-full transition-all duration-150 ${
                                  i < voiceLevel ? 'opacity-100' : 'opacity-30'
                                }`}
                                style={{
                                  height: `${Math.max(6, (i + 1) * 4)}px`,
                                  animationDelay: `${i * 0.1}s`,
                                  animation: i < voiceLevel ? 'pulse 1s infinite' : 'none'                              
                                }}
                              />                          
                            ))}
                          </div>                      
                        )}

                        {/* Speaking Wave Animation */}
                        {isSpeaking && (
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 bg-green-500 rounded-full animate-bounce"
                                style={{
                                  height: `${16 + Math.random() * 12}px`,
                                  animationDelay: `${i * 0.1}s`,
                                  animationDuration: '0.6s'                              
                                }}
                              />                          
                            ))}
                          </div>                      
                        )}
                      </div>

                      {/* Control Button */}
                      <Button
                        onClick={handleMicClick}
                        size="lg"
                        disabled={isSpeaking}
                        className={`w-16 h-16 rounded-full transition-all duration-300 text-lg font-semibold ${
                          isSpeaking                          
                            ? 'bg-gray-400 cursor-not-allowed scale-95'                          
                            : isSessionActive                             
                              ? 'bg-red-500 hover:bg-red-600 scale-100 shadow-lg hover:shadow-xl'                             
                              : 'bg-[#2d5a5a] hover:bg-[#1e3a3a] scale-100 hover:scale-105 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isSpeaking ? (
                          <Volume2Icon className="w-6 h-6 text-white" />                      
                        ) : isSessionActive ? (
                          <StopIcon className="w-6 h-6 text-white" />                      
                        ) : (
                          <MicIcon className="w-6 h-6 text-white" />                      
                        )}
                      </Button>

                      <p className={`text-sm text-center font-medium transition-colors duration-300 ${
                        isSpeaking ? 'text-green-600' : isSessionActive ? 'text-muted-foreground' : 'text-gray-500'
                      }`}>
                        {isSpeaking                         
                          ? 'Please wait while I respond...'                         
                          : isSessionActive                           
                            ? 'Tap to end wellness conversation'                           
                            : 'Tap to start wellness conversation'
                        }
                      </p>

                      {/* Wellness Focus Badges */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline" className="text-xs border-green-200 text-green-700">                        
                          🧘 Mindfulness Focus
                        </Badge>
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">                        
                          🎙️ Real-time Voice
                        </Badge>
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">                        
                          💚 Emotional Support
                        </Badge>
                      </div>

                      {/* Session Info */}
                      {isSessionActive && (
                        <div className="p-3 bg-white/50 rounded-lg backdrop-blur-sm border border-[#8fbc8f]/20">
                          <p className="text-xs text-center text-muted-foreground">                          
                            🔒 Secure wellness conversation • Voice-only mode active
                          </p>
                        </div>                    
                      )}
                    </div>

                    {/* Suggestions for Voice Mode */}
                    <div className="grid shrink-0 gap-4 pt-4 bg-gradient-to-t from-white/50 to-transparent">
                      <div className="grid justify-center shrink-0 gap-4 pt-4 bg-gradient-to-t from-white/50 to-transparent">
                     {!isVoiceMode && (
                            <AISuggestions className="px-4">
                              {(model === "coach" ? coachSuggestions : suggestions).map((s) => (
                                <AISuggestion
                                  key={s}
                                  suggestion={s}
                                  onClick={() => handleSuggestionClick(s)}
                                  className="border-[#8fbc8f]/30 hover:border-[#2d5a5a] hover:bg-[#8fbc8f]/10"
                                />
                              ))}
                            </AISuggestions>
                          )}
                      </div>

                      {/* Toolbar - Always visible but without text input in voice mode */}
                      <div className="w-full px-4 pb-4">
                        <div className="border-[#8fbc8f]/30 bg-white/90 backdrop-blur-sm rounded-lg border">
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

                              {/* Voice Mode Toggle */}
                              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/50">
                                <MessageSquareIcon className={`w-4 h-4 transition-colors ${!isVoiceMode ? 'text-[#2d5a5a]' : 'text-gray-400'}`} />
                                <Switch
                                  checked={isVoiceMode}
                                  onCheckedChange={setIsVoiceMode}
                                  className="data-[state=checked]:bg-[#8fbc8f] data-[state=unchecked]:bg-gray-300"
                                />
                                <MicIcon className={`w-4 h-4 transition-colors ${isVoiceMode ? 'text-[#2d5a5a]' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-[#2d5a5a]">{isVoiceMode ? 'Voice' : 'Text'}</span>
                              </div>

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
                                          src={favicon || "/placeholder.svg"}
                                          alt="1to1Help Logo"
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
                          </AIInputToolbar>
                        </div>
                      </div>
                    </div>
                  </div>              
                ) : (
                  /* Text Mode UI (Original) */
                  <>
                    <AIConversation>
                      <AIConversationContent>
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
                            <div className="w-20 h-20 flex items-center justify-center">
                              <Image
                                src={favicon || "/placeholder.svg"}
                                alt="1to1Help Logo"
                                className="object-contain"
                              />
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
                          messages.slice(0).map((message) => {
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
                                    return (parsed.results?.map((r: any) => ({
                                      title: r.title,
                                      href: r.url,                                  
                                    })) || [])                                
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
                                  name={message.role === "user" ? "You" : "1to1Help Ai"}
                                  src={message.role === "user"                                  
                                    ? "https://api.dicebear.com/9.x/glass/svg"                                  
                                    : "/favicon.png"
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
                      <div className="grid justify-center shrink-0 gap-4 pt-4 bg-gradient-to-t from-white/50 to-transparent">
                        <AISuggestions className="px-4">
                          {(model === "coach" ? coachSuggestions : suggestions).map((s) => (
                            <AISuggestion
                              key={s}
                              suggestion={s}
                              onClick={() => handleSuggestionClick(s)}
                              className="border-[#8fbc8f]/30 hover:border-[#2d5a5a] hover:bg-[#8fbc8f]/10"
                            />                        
                          ))}
                        </AISuggestions>
                      </div>

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

                              {/* Voice Mode Toggle */}
                              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/50">
                                <MessageSquareIcon className={`w-4 h-4 transition-colors ${!isVoiceMode ? 'text-[#2d5a5a]' : 'text-gray-400'}`} />
                                <Switch
                                  checked={isVoiceMode}
                                  onCheckedChange={setIsVoiceMode}
                                  className="data-[state=checked]:bg-[#8fbc8f] data-[state=unchecked]:bg-gray-300"
                                />
                                <MicIcon className={`w-4 h-4 transition-colors ${isVoiceMode ? 'text-[#2d5a5a]' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-[#2d5a5a]">{isVoiceMode ? 'Voice' : 'Text'}</span>
                              </div>

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
                                          src={favicon || "/placeholder.svg"}
                                          alt="1to1Help Logo"
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
                  </>              
                )}
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

              {/* Analysis Sidebar */}
              {showAnalysis && (
                <AnalysisSidebar
                  currentAnalysis={currentAnalysis}
                  analysisHistory={analysisData}
                  onClose={() => setShowAnalysis(false)}
                />            
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
