export const categories = ['Audio', 'Workspace', 'Accessories'] as const;
export type Category = (typeof categories)[number];

export interface Product {
  id: string;
  name: string;
  category: Category;
  priceCents: number;
  description: string;
  detail: string;
  features: string[];
  image: string;
  color: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: 'arc-headphones',
    name: 'Arc Wireless Headphones',
    category: 'Audio',
    priceCents: 9500,
    description: 'Less noise. More of what you love.',
    detail:
      'Find your focus with comfortable over-ear cushions, active noise cancellation, and warm, balanced sound. Your everyday escape, wherever the day takes you.',
    features: [
      'Active noise cancellation',
      'Up to 40 hours of listening',
      'USB-C charging',
      'Soft, adjustable ear cushions',
    ],
    image: 'headphones',
    color: 'Graphite',
    badge: 'Bestseller',
  },
  {
    id: 'dot-earbuds',
    name: 'Dot Wireless Earbuds',
    category: 'Audio',
    priceCents: 6900,
    description: 'Big sound. Pocket-sized.',
    detail:
      'An effortless soundtrack for your commute, workout, and everything in between. A compact charging case keeps the music going.',
    features: [
      '24-hour battery with case',
      'Splash-resistant design',
      'Touch controls',
      'Three sizes of ear tips',
    ],
    image: 'earbuds',
    color: 'Chalk',
    badge: 'Everyday favorite',
  },
  {
    id: 'nomad-speaker',
    name: 'Nomad Mini Speaker',
    category: 'Audio',
    priceCents: 5900,
    description: 'Your music, a little more portable.',
    detail:
      'Room-filling sound in a small, tactile package. Take your favorite playlists from the kitchen counter to your next weekend away.',
    features: [
      '12-hour battery',
      'Bluetooth connectivity',
      'Woven fabric finish',
      'Convenient carry loop',
    ],
    image: 'speaker',
    color: 'Forest',
  },
  {
    id: 'type-keyboard',
    name: 'Type Mechanical Keyboard',
    category: 'Workspace',
    priceCents: 8900,
    description: 'Make every keystroke count.',
    detail:
      'A thoughtfully compact keyboard with satisfying tactile switches. Connect wirelessly or plug in for a desk that works your way.',
    features: [
      '75% compact layout',
      'Tactile mechanical switches',
      'Bluetooth and USB-C',
      'Mac and Windows compatible',
    ],
    image: 'keyboard',
    color: 'Sand',
    badge: 'New arrival',
  },
  {
    id: 'glide-mouse',
    name: 'Glide Wireless Mouse',
    category: 'Workspace',
    priceCents: 3500,
    description: 'A smoother way through your day.',
    detail:
      'Quiet clicks and an easy, comfortable grip. Glide brings precise tracking and simple wireless connectivity to your everyday workspace.',
    features: [
      'Silent click buttons',
      'Adjustable sensitivity',
      'USB receiver included',
      'Comfortable sculpted shape',
    ],
    image: 'mouse',
    color: 'Pebble',
  },
  {
    id: 'volt-charger',
    name: 'Volt 65W USB-C Charger',
    category: 'Accessories',
    priceCents: 4500,
    description: 'Small charger. Serious energy.',
    detail:
      'Power your laptop, tablet, or phone with one compact charger. Efficient GaN technology keeps your everyday carry light.',
    features: ['65W USB-C power delivery', 'Compact GaN design', 'Two charging ports', 'EU plug'],
    image: 'charger',
    color: 'Chalk',
  },
  {
    id: 'frame-webcam',
    name: 'Frame HD Webcam',
    category: 'Workspace',
    priceCents: 7900,
    description: 'Show up a little clearer.',
    detail:
      'Look sharp on your next call with crisp 1080p video, automatic light adjustment, and a simple plug-and-play connection.',
    features: [
      '1080p at 30 fps',
      'Built-in microphone',
      'Physical privacy cover',
      'Adjustable monitor mount',
    ],
    image: 'webcam',
    color: 'Graphite',
  },
  {
    id: 'link-hub',
    name: 'Link USB-C Hub',
    category: 'Accessories',
    priceCents: 4900,
    description: 'More possibilities. One connection.',
    detail:
      'Turn a single USB-C port into the connections you need. A slim aluminum finish fits neatly into your bag or your workspace.',
    features: ['HDMI output', 'Two USB-A ports', 'SD card reader', 'USB-C pass-through charging'],
    image: 'hub',
    color: 'Silver',
  },
  {
    id: 'flex-usb-c-cable',
    name: 'Flex USB-C Cable',
    category: 'Accessories',
    priceCents: 1500,
    description: 'A little more reach. An everyday connection.',
    detail:
      'A flexible, braided USB-C to USB-C cable for charging headphones, phones, and other compatible devices. Sold separately as an optional accessory; use your existing compatible cable if you prefer.',
    features: [
      'USB-C to USB-C connectors',
      '1.5 m braided cable',
      'Up to 60W charging',
      'Compatible with Arc Wireless Headphones',
    ],
    image: 'usb-c-cable',
    color: 'Graphite',
  },
];

export const shippingMethods = [
  { id: 'standard', name: 'Standard delivery', description: '3–5 business days', priceCents: 1200 },
  { id: 'express', name: 'Express delivery', description: '1–2 business days', priceCents: 2000 },
  {
    id: 'collection',
    name: 'Store collection',
    description: 'Collect at our demo store',
    priceCents: 0,
  },
] as const;
export type ShippingMethod = (typeof shippingMethods)[number];
export type ShippingId = ShippingMethod['id'];

export const deliveryInsurancePriceCents = 500;
export const warrantyOptions = [
  { years: 2, name: '2-year warranty', priceCents: 0 },
  { years: 3, name: '3-year warranty', priceCents: 1000 },
  { years: 4, name: '4-year warranty', priceCents: 2000 },
  { years: 5, name: '5-year warranty', priceCents: 3000 },
] as const;
export type WarrantyOption = (typeof warrantyOptions)[number];
export type WarrantyYears = WarrantyOption['years'];
