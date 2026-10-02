'use client'

/** Speaks a guidance prompt. Urgent prompts cut off whatever is playing; others queue behind it. */
export function speak(text: string, { interrupt = false } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (interrupt) window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

/** "450 metres" / "1.2 kilometres": abbreviations are read inconsistently by speech engines */
export function spokenDistance(meters: number) {
    if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} metres`
    return `${(meters / 1000).toFixed(1)} kilometres`
}
