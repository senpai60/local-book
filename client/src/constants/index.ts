import { Book, User, ReadingActivity } from '../types';

export const SYSTEM_CATEGORIES = [
  'Philosophy',
  'Design',
  'Architecture',
  'Typography',
  'Literature',
  'Craftsmanship'
];

export const MOCK_USER: User = {
  id: 'usr_01',
  email: 'curator@bookvault.io',
  name: 'Kenya Tanizaki',
  avatarUrl: undefined, // Will generate initials dynamically
  joinedAt: '2026-01-10T08:00:00Z',
  storageUsed: 342 * 1024 * 1024, // 342 MB
  storageLimit: 2 * 1024 * 1024 * 1024, // 2 GB
  preferences: {
    theme: 'dark',
    fontSize: 'medium',
    marginWidth: 'normal',
    lineHeight: 'normal',
    fontFamily: 'serif'
  }
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'bk_01',
    title: 'Wabi-Sabi for Artists, Designers, Poets & Philosophers',
    author: 'Leonard Koren',
    category: 'Philosophy',
    currentPage: 42,
    totalPages: 124,
    progress: 33,
    sizeBytes: 12.4 * 1024 * 1024, // 12.4 MB
    fileHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploadedAt: '2026-06-20T10:14:00Z',
    description: 'An elegant, understated, and beautiful volume explaining the classic Japanese aesthetic concept of impermanence, imperfection, and simplicity.',
    format: 'pdf',
    lastReadAt: '2026-06-28T15:30:00Z',
    tags: ['Zen', 'Philosophy', 'Aesthetics']
  },
  {
    id: 'bk_02',
    title: 'Designing Design',
    author: 'Kenya Hara',
    category: 'Design',
    currentPage: 156,
    totalPages: 360,
    progress: 43,
    sizeBytes: 48.2 * 1024 * 1024, // 48.2 MB
    fileHash: 'sha256_fa6d4bf8ad0e46a788e404bf4c8996fb92427ae41e4649b934ca495991b7852b851',
    uploadedAt: '2026-06-22T14:20:00Z',
    description: 'Kenya Hara, the creative director of MUJI, outlines his philosophy of design, emphasizing emptiness, white space, and the sensory experience of objects.',
    format: 'pdf',
    lastReadAt: '2026-06-27T22:15:00Z',
    tags: ['Design', 'MUJI', 'Emptiness']
  },
  {
    id: 'bk_03',
    title: 'In Praise of Shadows',
    author: 'Jun\'ichiro Tanizaki',
    category: 'Literature',
    currentPage: 78,
    totalPages: 80,
    progress: 97,
    sizeBytes: 4.8 * 1024 * 1024, // 4.8 MB
    fileHash: 'sha256_ea6c2bf8ad0e46a788e404bf4c8996fb92427ae41e4649b934ca495991b7852b842',
    uploadedAt: '2026-06-15T09:00:00Z',
    description: 'A classic essay on Japanese aesthetics, detailing the contrast between Western bright cleanliness and East Asian appreciation for darkness, shadow, and soft patina.',
    format: 'epub',
    lastReadAt: '2026-06-25T11:40:00Z',
    tags: ['Literature', 'Shadows', 'Aesthetics']
  },
  {
    id: 'bk_04',
    title: 'The Poetics of Space',
    author: 'Gaston Bachelard',
    category: 'Architecture',
    currentPage: 0,
    totalPages: 240,
    progress: 0,
    sizeBytes: 15.6 * 1024 * 1024, // 15.6 MB
    fileHash: 'sha256_da2d4bf8ad0e46a788e404bf4c8996fb92427ae41e4649b934ca495991b7852b833',
    uploadedAt: '2026-06-24T16:45:00Z',
    description: 'A lyrical, phenomenological analysis of how we perceive home and space, exploring the drawer, the nest, the shell, and corners of our lived environments.',
    format: 'pdf',
    lastReadAt: '2026-06-24T16:45:00Z',
    tags: ['Architecture', 'Space', 'Phenomenology']
  },
  {
    id: 'bk_05',
    title: 'Grid Systems in Graphic Design',
    author: 'Josef Müller-Brockmann',
    category: 'Typography',
    currentPage: 12,
    totalPages: 176,
    progress: 6,
    sizeBytes: 25.1 * 1024 * 1024,
    fileHash: 'sha256_ca1c4bf8ad0e46a788e404bf4c8996fb92427ae41e4649b934ca495991b7852b822',
    uploadedAt: '2026-06-26T18:05:00Z',
    description: 'The definitive handbook for grid-based visual design. A masterclass in strict typography, modular grids, and clear structural hierarchy.',
    format: 'pdf',
    lastReadAt: '2026-06-28T09:12:00Z',
    tags: ['Typography', 'Swiss Design', 'Precision']
  }
];

export const MOCK_ACTIVITIES: ReadingActivity[] = [
  {
    id: 'act_01',
    bookId: 'bk_05',
    bookTitle: 'Grid Systems in Graphic Design',
    type: 'read',
    description: 'Read pages 1 to 12',
    timestamp: '2026-06-28T09:12:00Z'
  },
  {
    id: 'act_02',
    bookId: 'bk_01',
    bookTitle: 'Wabi-Sabi for Artists, Designers, Poets & Philosophers',
    type: 'bookmark',
    description: 'Added bookmark on page 42: "On the nature of imperfection"',
    timestamp: '2026-06-28T15:30:00Z'
  },
  {
    id: 'act_03',
    bookId: 'bk_02',
    bookTitle: 'Designing Design',
    type: 'note',
    description: 'Added note on page 156: "Empty space as a container for meaning."',
    timestamp: '2026-06-27T22:15:00Z'
  },
  {
    id: 'act_04',
    bookId: 'bk_05',
    bookTitle: 'Grid Systems in Graphic Design',
    type: 'upload',
    description: 'Uploaded successfully',
    timestamp: '2026-06-26T18:05:00Z'
  }
];

export const MOCK_CHAPTERS: Record<string, { title: string; page: number }[]> = {
  'bk_01': [
    { title: 'I. Background on Wabi-Sabi', page: 1 },
    { title: 'II. The Aesthetic Universe', page: 25 },
    { title: 'III. Material Characteristics', page: 42 },
    { title: 'IV. Spiritual Values', page: 70 },
    { title: 'V. Modern Applications', page: 100 }
  ],
  'bk_02': [
    { title: '1. Art and Design: A Separation', page: 1 },
    { title: '2. Emptiness & White: MUJI Origins', page: 40 },
    { title: '3. Re-Design: Daily Objects Reimagined', page: 85 },
    { title: '4. Haptic Architecture', page: 156 },
    { title: '5. The Senses of Information', page: 240 },
    { title: '6. Exformation: Unknown Design', page: 310 }
  ],
  'bk_03': [
    { title: 'Introduction', page: 1 },
    { title: 'The Beauty of Shadows', page: 12 },
    { title: 'Traditional Japanese Interiors', page: 34 },
    { title: 'Light in Modern Spaces', page: 55 },
    { title: 'Conclusion', page: 75 }
  ],
  'bk_04': [
    { title: 'Chapter 1: The House. From Cellar to Garret', page: 1 },
    { title: 'Chapter 2: House and Universe', page: 45 },
    { title: 'Chapter 3: Drawers, Chests, and Wardrobes', page: 80 },
    { title: 'Chapter 4: The Nest', page: 110 },
    { title: 'Chapter 5: The Shell', page: 140 },
    { title: 'Chapter 6: Corners', page: 180 },
    { title: 'Chapter 7: Miniature Objects', page: 215 }
  ],
  'bk_05': [
    { title: '1. Introduction to Grid Systems', page: 1 },
    { title: '2. The Structure of Typographic Grid', page: 12 },
    { title: '3. 8-Column Grid Layout', page: 45 },
    { title: '4. 12-Column Grid Layout', page: 85 },
    { title: '5. Multi-Column Applications', page: 130 }
  ]
};

export const MOCK_BOOK_CONTENT: Record<string, string[]> = {
  'bk_01': [
    // Page 1
    "Wabi-sabi is a beauty of things imperfect, impermanent, and incomplete.\n\nIt is a beauty of things modest and humble.\n\nIt is a beauty of things unconventional.",
    // Page 2
    "Wabi-sabi is the Zen of things. It represents the quintessential Japanese aesthetic philosophy, focusing on the poetry of natural cycles.",
    // Page 42 (active page)
    "To understand wabi-sabi is to appreciate the crack in the teapot, the rust on the iron kettle, the asymmetry of the ceramic bowl.\n\nUnlike Western ideals of perfection, symmetry, and eternal youth, wabi-sabi honors the passage of time. A worn wooden door has more soul than a polished plastic finish. The grain of wood, the unevenness of hand-fired clay, the moss growing on a stone garden path: these are physical expressions of wabi-sabi.\n\nIt whispers rather than shouts. It resides in the quiet corners of our perception."
  ],
  'bk_02': [
    // Page 1
    "Design is the configuration of elements to satisfy human curiosity and utility. Art is the self-expression of the creator. Where they diverge is where our journey begins.",
    // Page 156
    "Emptiness does not mean nothingness. In Japanese design, emptiness is an active force. It is a container ready to receive meaning. MUJI's advertising, showing simple horizons with nothing but a tiny human figure, is not minimalist out of deprivation, but out of absolute potential.\n\nThe white page is not empty; it is waiting. White is a color that sensitizes all other colors. When we touch a rough piece of paper, we feel the craftsmanship of the fiber. In design, the less we specify, the more we invite the observer to complete the communication."
  ],
  'bk_03': [
    "We find beauty not in the thing itself but in the patterns of shadows, the light and the darkness, that one thing against another creates.\n\nA phosphorescent jewel glows in the dark, but loses its charm in the glare of day. Traditional Japanese buildings manage light by keeping it out. The eaves are deep, casting a soft, gentle shade across the tatami mats.\n\nIn this twilight, our imagination wanders. The lacquerware soup bowl, dark red and gold, shimmers with a deep warmth when held under the candle's glow, a beauty that is lost in the clinical bright light of modern electricity."
  ]
};
