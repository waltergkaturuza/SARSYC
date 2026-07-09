export const DEFAULT_SARSYC_VI_VENUE = {
  id: 'default',
  venueName: 'Namibia Institute of Public Administration and Management (NIPAM)',
  city: 'Windhoek',
  country: 'Namibia',
  address: 'Paul Nash Street, Khomasdal, Windhoek, Namibia',
  latitude: -22.6025484,
  longitude: 17.0922144,
  zoomLevel: 15,
  conferenceEdition: 'SARSYC VI',
  description:
    'NIPAM is the official SARSYC VI venue, offering modern training and conference facilities in Windhoek.',
  facilities: [
    { facility: 'Main plenary hall (capacity: 600)' },
    { facility: '4 breakout rooms (capacity: 100 each)' },
    { facility: 'Exhibition area' },
    { facility: 'WiFi throughout' },
    { facility: 'Wheelchair accessible' },
  ] as Array<{ facility: string }>,
}

export const DEFAULT_SARSYC_VI_VENUE_NAME = DEFAULT_SARSYC_VI_VENUE.venueName
export const DEFAULT_SARSYC_VI_VENUE_ADDRESS = DEFAULT_SARSYC_VI_VENUE.address
