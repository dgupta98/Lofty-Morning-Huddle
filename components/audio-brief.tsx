"use client"

export function useAudioBrief(
  agentName: string,
  summary: { lead_followups: number; showing_requests_accepted: number; escalated_lead_name: string | null },
  topLeadName: string
) {
  function play() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const text = [
      `Good morning, ${agentName}.`,
      `While you slept, Lofty handled ${summary.lead_followups} lead follow-ups`,
      `and accepted ${summary.showing_requests_accepted} showing requests.`,
      summary.escalated_lead_name
        ? `${summary.escalated_lead_name} was escalated by the Homeowner Agent.`
        : "",
      `Three things need your attention now.`,
      `First: ${topLeadName} is showing strong buying signals and needs a call this morning.`,
      `Open your handoff to see the full queue.`,
    ]
      .filter(Boolean)
      .join(" ")

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  return { play }
}
