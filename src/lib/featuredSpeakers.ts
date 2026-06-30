export function sortFeaturedSpeakersForHomepage<T extends { featuredOrder?: number | null; name?: string | null }>(
  speakers: T[],
): T[] {
  return [...speakers].sort((a, b) => {
    const orderA =
      typeof a.featuredOrder === 'number' && Number.isFinite(a.featuredOrder) ? a.featuredOrder : 9999
    const orderB =
      typeof b.featuredOrder === 'number' && Number.isFinite(b.featuredOrder) ? b.featuredOrder : 9999

    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

export const HOMEPAGE_FEATURED_SPEAKER_LIMIT = 3
