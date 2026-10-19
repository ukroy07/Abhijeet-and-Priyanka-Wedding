/*
 * Everything a guest reads lives here. Edit, save, reload.
 * Optional fields (time, families, rsvp.whatsapp, music.src) stay hidden while empty.
 */
window.INVITE = {
  groom: 'Abhijeet',
  bride: 'Priyanka',
  initials: ['A', 'P'],

  // Countdown target (IST) and the lines under the names
  countdownTo: '2026-11-21T00:00:00+05:30',
  heroDate: 'Saturday · 21 November 2026',
  heroPlace: 'Bokaro Steel City & Ranchi · Jharkhand',
  span: '19 – 23 November 2026',

  // Shown when a link has no ?to=Name
  defaultEnvelope: 'You & Your Family',
  defaultGreeting: 'Family & Friends',

  // "Our Families" section, shown right after the opening page
  families: [
    {
      side: 'वर पक्ष', role: 'The Groom', name: 'Abhijeet', relation: 'Son of',
      parents: ['Shri Rajesh Kumar', 'Smt. Indira Devi']
    },
    {
      side: 'वधू पक्ष', role: 'The Bride', name: 'Priyanka', relation: 'Daughter of',
      parents: ['Shri Sanjay Kumar Pramanik', 'Smt. Sangita Devi']
    }
  ],

  // Contact box at the end (10-digit Indian mobile numbers)
  contact: ['8797208004', '7464075932'],

  story: [
    {
      img: 'story-1', widths: [640, 960], ratio: '4 / 5',
      title: 'Two Hearts', hi: 'दो दिल',
      text: 'Two families, two different worlds — and two hearts that simply knew they belonged together.',
      caption: 'us, always',
      alt: 'Abhijeet and Priyanka standing together, smiling'
    },
    {
      img: 'story-2', widths: [800, 1280], ratio: '3 / 2',
      title: 'One Promise', hi: 'एक वादा',
      text: 'Blessed by our elders, a simple “yes” became a promise for this life and every life after.',
      caption: 'the day we said yes',
      alt: 'Priyanka in a red chunri seated beside Abhijeet'
    },
    {
      title: 'Forever Begins', hi: 'सात फेरे · सात वचन',
      text: 'Now we take the seven sacred vows — and our forever feels incomplete without you by our side.'
    }
  ],

  events: [
    {
      id: 'lagan-haldi', theme: 'marigold', date: '2026-11-19', day: 'Thursday',
      title: 'Shubh Lagan · Haldi · Mehndi · Sangeet', hi: 'शुभ लगन · हल्दी · मेहंदी · संगीत',
      parts: ['Shubh Lagan', 'Haldi', 'Mehndi', 'Sangeet'],
      short: 'Lagan · Haldi · Mehndi · Sangeet',
      tagline: 'An auspicious day of turmeric, henna & music',
      place: 'Ranchi, Jharkhand', time: '',
      particles: ['marigold', 'rose', 'leaf']
    },
    {
      id: 'mandap', theme: 'ivory', date: '2026-11-20', day: 'Friday',
      title: 'Mandapachhadan', hi: 'मण्डपाच्छादन',
      tagline: 'Raising the sacred wedding mandap',
      place: 'Ranchi, Jharkhand', time: '',
      particles: ['rose', 'marigold']
    },
    {
      id: 'vivah', theme: 'royal', date: '2026-11-21', day: 'Saturday',
      title: 'Baraat', sub: '& Shubh Vivah', hi: 'बारात · शुभ विवाह',
      tagline: 'The procession, the pheras, the promise',
      venue: 'bokaro', time: '',
      particles: ['rose', 'gold']
    },
    {
      id: 'reception', theme: 'midnight', date: '2026-11-23', day: 'Monday',
      title: 'Reception', hi: 'प्रीतिभोज',
      tagline: 'An evening of love, laughter & blessings',
      venue: 'ranchi', time: '',
      particles: ['gold', 'sparkle']
    }
  ],

  venues: {
    bokaro: {
      when: 'Baraat & Vivah · Sat, 21 Nov',
      name: 'Birsha Basa Marriage Hall',
      alias: 'Birsa Mandap',
      address: 'Naya More, Bokaro Steel City, Jharkhand 827010',
      maps: 'https://share.google/sDPNsF7crbZE2F5hv',
      directions: 'https://www.google.com/maps/dir/?api=1&destination=Birsha+Basa+Marriage+Hall%2C+Naya+More%2C+Bokaro+Steel+City%2C+Jharkhand+827010',
      embed: 'https://maps.google.com/maps?q=Birsha+Basa+Marriage+Hall%2C+Naya+More%2C+Bokaro+Steel+City&z=15&output=embed'
    },
    ranchi: {
      when: 'Reception · Mon, 23 Nov',
      name: 'Indraprastha Firayalal Utsav Bhawan',
      alias: '',
      address: 'Hazaribagh Road, Kokar, Ranchi, Jharkhand 834001',
      maps: 'https://www.google.com/maps/search/?api=1&query=Indraprasth+Utsav+Bhavan+Kokar+Ranchi',
      directions: 'https://www.google.com/maps/dir/?api=1&destination=Indraprasth+Utsav+Bhavan%2C+Hazaribagh+Road%2C+Kokar%2C+Ranchi%2C+Jharkhand+834001',
      embed: 'https://maps.google.com/maps?q=Indraprasth+Utsav+Bhavan%2C+Kokar%2C+Ranchi&z=15&output=embed'
    }
  },

  // Leave src '' for the built-in santoor melody, or point it at an mp3 (e.g. 'assets/audio/song.mp3')
  music: { src: '', title: 'Santoor · Raag Yaman' },

  // WhatsApp number with country code (e.g. '919876543210') to show an RSVP button
  rsvp: { whatsapp: '' }
};
