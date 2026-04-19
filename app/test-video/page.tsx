"use client"
import { VideoPlayer } from "@/components/video-player"
import { MOCK_OVERNIGHT_SUMMARY, MOCK_QUEUE } from "@/lib/mock-data"

export default function TestVideoPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <VideoPlayer
        agentName="James"
        summary={MOCK_OVERNIGHT_SUMMARY}
        queue={MOCK_QUEUE}
        onComplete={() => { window.location.href = "/" }}
      />
    </div>
  )
}
