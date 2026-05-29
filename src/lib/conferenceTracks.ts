/** Conference tracks — same values as abstract submission and Payload abstracts collection. */

export const CONFERENCE_TRACKS = [
  {
    value: 'education-rights',
    label: 'Track 1: Education Rights and Equity',
    shortLabel: 'Education Rights and Equity',
  },
  {
    value: 'hiv-aids',
    label: 'Track 2: HIV/AIDS, STIs and Vulnerable Groups',
    shortLabel: 'HIV/AIDS, STIs and Vulnerable Groups',
  },
  {
    value: 'ncd-prevention',
    label: 'Track 3: Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles',
    shortLabel: 'NCDs Prevention and Health Lifestyles',
  },
  {
    value: 'digital-health',
    label: 'Track 4: Digital Health and Safety',
    shortLabel: 'Digital Health and Safety',
  },
  {
    value: 'mental-health',
    label: 'Track 5: Mental Health and Substance Abuse',
    shortLabel: 'Mental Health and Substance Abuse',
  },
] as const

export type ConferenceTrackId = (typeof CONFERENCE_TRACKS)[number]['value']

export function isConferenceTrackId(value: unknown): value is ConferenceTrackId {
  return (
    typeof value === 'string' &&
    CONFERENCE_TRACKS.some((track) => track.value === value)
  )
}

export function conferenceTrackLabel(trackId: string | undefined | null): string {
  if (!trackId) return '—'
  const track = CONFERENCE_TRACKS.find((t) => t.value === trackId)
  return track?.label ?? trackId
}
