import { PhotoSizePreset, BgColorOption, DressOption, EnhancementOption, DressColorItem } from '../types/aiEditorTypes';

export const PHOTO_SIZES: PhotoSizePreset[] = [
  {
    id: 'passport',
    label: 'পাসপোর্ট',
    subLabel: '৪৫×৫৫ মিমি',
    widthMm: 45,
    heightMm: 55,
    aspectRatio: 45 / 55,
    description: 'বাংলাদেশ ও আন্তর্জাতিক স্ট্যান্ডার্ড পাসপোর্ট ফটো সাইজ'
  },
  {
    id: 'dual',
    label: 'ডুয়াল',
    subLabel: 'যৌথ ছবি',
    widthMm: 80,
    heightMm: 55,
    aspectRatio: 80 / 55,
    description: 'দুজন ব্যক্তির যৌথ ছবির স্ট্যান্ডার্ড ফ্রেম'
  },
  {
    id: 'epass',
    label: 'ই-পাস',
    subLabel: '৪০×৫০ মিমি',
    widthMm: 40,
    heightMm: 50,
    aspectRatio: 40 / 50,
    description: 'ই-পাসপোর্ট এবং অফিশিয়াল ডকুমেন্ট ফরম্যাট'
  },
  {
    id: 'visa',
    label: 'ভিসা',
    subLabel: '৫০×৫০ মিমি',
    widthMm: 50,
    heightMm: 50,
    aspectRatio: 1,
    description: 'ইউএস / কানাডা / সেনজেন ও আন্তর্জাতিক ভিসা ফরম্যাট'
  },
  {
    id: 'birth',
    label: 'জন্ম',
    subLabel: '৩৫×৪৫ মিমি',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    description: 'জন্ম নিবন্ধন এবং স্কুল ও ভর্তি পরীক্ষার ছবি'
  }
];

export const BG_COLORS: BgColorOption[] = [
  { id: 'white', label: 'সাদা', hex: '#FFFFFF', borderColor: '#e2e8f0' },
  { id: 'light-blue', label: 'হালকা নীল', hex: '#3b82f6' },
  { id: 'sky-blue', label: 'স্কাই ব্লু', hex: '#00a3e0' },
  { id: 'grey', label: 'ধূসর', hex: '#8e9297' },
  { id: 'royal-blue', label: 'রয়্যাল ব্লু', hex: '#2563eb' },
  { id: 'deep-green', label: 'গাঢ় সবুজ', hex: '#007058' },
  { id: 'off-white', label: 'অফ-হোয়াইট', hex: '#f6f6eb' },
  { id: 'custom', label: 'কাস্টম', hex: '#6366f1', isCustomPicker: true }
];

export const DRESS_COLORS: DressColorItem[] = [
  // Row 1 (6 colors)
  { id: 'white', label: 'সাদা', hex: '#FFFFFF', isLight: true },
  { id: 'black', label: 'কালো', hex: '#212121' },
  { id: 'red', label: 'লাল', hex: '#e53935' },
  { id: 'blue', label: 'নীল', hex: '#1e88e5' },
  { id: 'green', label: 'সবুজ', hex: '#2e7d32' },
  { id: 'navy', label: 'নেভি ব্লু', hex: '#1a237e' },

  // Row 2 (6 colors)
  { id: 'grey', label: 'ধূসর', hex: '#757575' },
  { id: 'brown', label: 'বাদামি', hex: '#6d4c41' },
  { id: 'yellow', label: 'হলুদ', hex: '#fdd835', isLight: true },
  { id: 'pink', label: 'গোলাপি', hex: '#e91e63' },
  { id: 'purple', label: 'বেগুনি', hex: '#7b1fa2' },
  { id: 'orange', label: 'কমলা', hex: '#f57c00' },

  // Row 3 (6 colors)
  { id: 'maroon', label: 'মেরুন', hex: '#880e4f' },
  { id: 'teal', label: 'টিল', hex: '#00796b' },
  { id: 'sky-blue', label: 'আকাশি', hex: '#29b6f6' },
  { id: 'olive', label: 'জলপাই', hex: '#689f38' },
  { id: 'khaki', label: 'ঘিয়ে / খাকি', hex: '#d7ccc8', isLight: true },
  { id: 'mustard', label: 'সরিষা / সোনালী', hex: '#ffa000' },

  // Row 4 (2 colors)
  { id: 'magenta', label: 'ম্যাজেন্টা', hex: '#c2185b' },
  { id: 'cyan', label: 'সায়ান', hex: '#00acc1' }
];

export const DRESS_OPTIONS: DressOption[] = [
  {
    id: 'none',
    title: 'কোনো পরিবর্তন নয়',
    category: 'none',
    promptDescription: 'Keep original clothing unchanged without any alteration.',
    iconType: 'none'
  },
  {
    id: 'formal-white-shirt',
    title: 'ফরমাল সাদা শার্ট',
    category: 'male-formal',
    promptDescription: 'Replace attire with a crisp, tailored professional white formal collared button-up shirt.',
    iconType: 'white-shirt'
  },
  {
    id: 'dark-polo',
    title: 'নেভি/কালো পোলো',
    category: 'male-casual',
    promptDescription: 'Replace attire with a clean smart-casual dark navy polo collar shirt.',
    iconType: 'dark-polo'
  },
  {
    id: 'suit-red-tie',
    title: 'স্যুট ও লাল টাই',
    category: 'male-formal',
    promptDescription: 'Replace attire with a dark executive business suit jacket, white shirt, and silk red necktie.',
    iconType: 'suit-red-tie'
  },
  {
    id: 'dark-suit-blazer',
    title: 'কালো/নেভি ব্লেজার',
    category: 'male-formal',
    promptDescription: 'Replace attire with a professional tailored dark navy/black blazer jacket over a light shirt.',
    iconType: 'dark-suit'
  },
  {
    id: 'red-saree',
    title: 'লাল শাড়ি',
    category: 'female-traditional',
    promptDescription: 'Replace attire with an elegant traditional red Bengali saree with fine golden zari border work.',
    iconType: 'red-saree'
  },
  {
    id: 'modest-red-black-hijab',
    title: 'কালো-লাল হিজাব',
    category: 'religious',
    promptDescription: 'Replace headwear and clothing with a neat, modest black and crimson-red draped hijab.',
    iconType: 'red-black-hijab'
  },
  {
    id: 'white-panjabi',
    title: 'সাদা পাঞ্জাবি',
    category: 'male-formal',
    promptDescription: 'Replace attire with an authentic pristine white traditional South Asian cotton panjabi with subtle collar embroidery.',
    iconType: 'white-panjabi'
  },
  {
    id: 'maroon-kurti',
    title: 'মেরুন কুর্তি/কামিজ',
    category: 'female-traditional',
    promptDescription: 'Replace attire with a rich maroon/red women formal salwar kameez/kurti with modest neckline.',
    iconType: 'maroon-kurti'
  },
  {
    id: 'blue-casual-tshirt',
    title: 'নীল টি-শার্ট',
    category: 'male-casual',
    promptDescription: 'Replace attire with a clean, solid royal blue crew-neck t-shirt.',
    iconType: 'blue-tshirt'
  },
  {
    id: 'sky-blue-hijab',
    title: 'আকাশি হিজাব',
    category: 'religious',
    promptDescription: 'Replace headwear and dress with an elegant pastel sky-blue modest hijab neatly framing the face.',
    iconType: 'sky-hijab'
  },
  {
    id: 'black-borka-hijab',
    title: 'কালো বোরকা ও হিজাব',
    category: 'religious',
    promptDescription: 'Replace attire with a traditional modest solid black abaya/borka and matching neat black hijab.',
    iconType: 'black-hijab'
  },
  {
    id: 'purple-salwar',
    title: 'পার্পল সালোয়ার কামিজ',
    category: 'female-traditional',
    promptDescription: 'Replace attire with a formal lavender-purple and white patterned salwar suit with dupatta.',
    iconType: 'purple-salwar'
  },
  {
    id: 'blue-formal-shirt',
    title: 'ব্লু ফরমাল শার্ট',
    category: 'male-formal',
    promptDescription: 'Replace attire with a professional light French-blue button-down dress shirt with structured collar.',
    iconType: 'blue-shirt'
  },
  {
    id: 'sky-blue-shirt',
    title: 'আকাশি কলার শার্ট',
    category: 'male-formal',
    promptDescription: 'Replace attire with a crisp pastel light-blue formal office shirt with clean front placket.',
    iconType: 'sky-shirt'
  }
];

export const ENHANCEMENT_OPTIONS: EnhancementOption[] = [
  {
    id: 'beauty-enhance',
    label: 'সৌন্দর্য বৃদ্ধি',
    description: 'চেহারার স্বাভাবিক উজ্জ্বলতা ও আকর্ষনীয়তা বৃদ্ধি',
    iconType: 'sparkles',
    promptDirective: 'Apply subtle high-end studio portrait beauty enhancement to naturally refine facial balance while keeping all authentic individual identity intact.'
  },
  {
    id: 'skin-smooth',
    label: 'ত্বক মসৃণ',
    description: 'স্বাভাবিক স্কিন টেক্সচার বজায় রেখে ত্বক স্মুথ করা',
    iconType: 'smooth-face',
    promptDirective: 'Naturally smooth skin blemishes, rough patches and wrinkles while strictly preserving realistic, natural skin micropores and authentic skin texture without artificial plastic look.'
  },
  {
    id: 'oil-control',
    label: 'তৈলাক্ত ত্বক',
    description: 'ক্যামেরার ফ্ল্যাশ বা তৈলাক্ত ভাব অপসারণ',
    iconType: 'oil-drop',
    promptDirective: 'Eliminate oily sheen, greasy skin reflections, and harsh forehead/nose hot-spot glare, replacing it with a soft matte studio skin finish.'
  },
  {
    id: 'brighten-photo',
    label: 'ছবি উজ্জ্বল',
    description: 'কম আলো বা অন্ধকার ভাব দূর করা',
    iconType: 'sun-bright',
    promptDirective: 'Increase overall exposure, clarify dark shadows, and boost photo clarity with true-to-life vibrant color balance.'
  },
  {
    id: 'studio-lighting',
    label: 'স্টুডিও লাইটিং',
    description: 'দ্বিমুখী সফটবক্স স্টুডিও আলোর ইফেক্ট',
    iconType: 'studio-light',
    promptDirective: 'Re-light the subject with soft professional dual-key studio softbox lighting, providing gentle rim-light separation and balanced cheekbone illumination.'
  },
  {
    id: 'head-straighten',
    label: 'মাথা সোজা',
    description: 'ঘাড় বা মাথার সামান্য বাঁকা ভঙ্গি ঠিক করা',
    iconType: 'head-straight',
    promptDirective: 'Subtly align head tilt and shoulders upright and perfectly perpendicular to the camera lens in compliance with official passport standards.'
  },
  {
    id: 'half-body',
    label: 'হাফ বডি',
    description: 'বুক ও কাঁধ পর্যন্ত প্রফেশনাল ফ্রেম',
    iconType: 'half-body',
    promptDirective: 'Frame subject in a classic half-bust composition showing shoulders, chest and upright posture with balanced headroom.'
  },
  {
    id: 'preserve-mole-scar',
    label: 'তিল/দাগ রাখা',
    description: 'জন্মদাগ ও তিল অপরিবর্তিত রাখা',
    iconType: 'preserve-mole',
    promptDirective: 'CRITICAL: Strictly preserve all natural facial moles, birthmarks, natural scars, and unique identity marks; do NOT erase or blur them.'
  },
  {
    id: 'preserve-nose-pin',
    label: 'নাক ফুল রাখুন',
    description: 'নাকের নথ বা নাকফুল স্বাভাবিক রাখা',
    iconType: 'nose-pin',
    promptDirective: 'Carefully preserve any existing nose-ring, nose-pin, ear studs or cultural jewelry worn on the face with crystal clarity.'
  },
  {
    id: 'lipstick-retouch',
    label: 'লিপস্টিক',
    description: 'ঠোঁটের স্বাভাবিক সতেজ রং যুক্ত করা',
    iconType: 'lipstick',
    promptDirective: 'Add a subtle, natural, elegant moist rose/nude tone to the lips for a fresh and dignified presentation.'
  }
];
