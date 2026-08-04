// Item ids must stay in sync with Firebase /claimed keys (carried over from
// the original public/austin-30th-wishlist.html so prior claims survive).
export const GIFT_TIERS = [
  {
    no: '01',
    name: 'By the Handful',
    price: 'grab a few · ~$10–25 each',
    note: 'Small stuff — pick three or four and call it one gift.',
    items: [
      { id: 'golf-divot-tool', href: 'https://www.amazon.com/dp/B0C41V3QJJ', name: 'Golf Divot Tool', tag: 'Golf', price: '~$10–20' },
      { id: 'golf-ball-stamp', href: 'https://www.amazon.com/QUBI-Reusable-Self-Inking-Identify-Accessories/dp/B0DZF9TVK4/', name: 'Golf Ball Stamp', tag: 'Golf', price: '~$15–20' },
      { id: 'pkup-card-lifting-tool', href: 'https://getpkup.com/products/pkup-card-lifting-tool', name: "P'KUP Card Lifting Tool", tag: 'Magic: The Gathering', price: '~$15–25' },
      { id: 'card-storage-organizer', href: 'https://www.amazon.com/UAONO-Storage-Trading-Commander-Magnetic/dp/B0C6XML4MV/', name: 'Card Storage Organizer', tag: 'Magic: The Gathering', price: '~$15–25' },
      { id: 'golf-balls-taylormade', href: 'https://www.amazon.com/2021-TaylorMade-Distance-Golf-Balls/dp/B08QSL9XQW/', name: 'Golf Balls · TaylorMade Distance', tag: 'Golf', price: '~$20' },
      { id: 'nike-everyday-socks', href: 'https://www.amazon.com/NIKE-Unisex-Everyday-Cushion-White/dp/B00K5CN73A/', name: 'Nike Everyday Socks', tag: 'Apparel', price: '~$20–25' },
      { id: 'dragon-shield-lathril-sleeves', href: 'https://www.dragonshield.com/products/legendary-series-lathril-blade-of-elves-matte-dual-art-sleeves', name: 'Dragon Shield Matte Dual Art Sleeves', tag: 'Magic: The Gathering', price: '~$25' },
      { id: 'mtg-card-binder', href: 'https://www.amazon.com/Vault-Binder-Trading-Loading-Pokemon/dp/B071V91LGC/', name: 'MTG Card Binder', tag: 'Magic: The Gathering', price: '~$25–30' },
      { id: 'lego-delorean', href: 'https://www.lego.com/en-us/product/time-machine-from-back-to-the-future-77256', name: 'LEGO DeLorean · Speed Champions', tag: 'LEGO', price: '~$28' },
    ],
  },
  {
    no: '02',
    name: 'By the Peck',
    price: 'one person · ~$30–60',
    note: 'A complete gift on its own.',
    items: [
      { id: 'square-putter-grip', href: 'https://ripitgrips.com/collections/square-putter/products/stay-weird-putter-grip-sq-face', name: 'Square Putter Grip', tag: 'Golf', price: '~$25–35' },
      { id: 'rivendell-lego-light-kit', href: 'https://www.amazon.com/YEABRICKS-Light-Lego-10316-Lord-Rings/dp/B0BXX8XCGF/', name: 'Rivendell LEGO Light Kit · set 10316', tag: 'LEGO', price: '~$30–50' },
      { id: 'custom-club-head-covers', href: 'https://www.etsy.com/listing/1549037190/embroidered-topographic-vegan-leather', name: 'Custom Leather Club Head Covers', tag: 'Golf', price: '~$30–50' },
      { id: 'mage-tech-deck-box', href: 'https://www.amazon.com/dp/B0GQT1PY68', name: 'Mage Tech Commander Deck Box', tag: 'Magic: The Gathering', price: '~$35–48' },
      { id: 'gymshark-tee', href: 'https://www.gymshark.com/products/gymshark-shadow-seamless-t-shirt-black-aw24', name: 'Gymshark Shadow Seamless Tee', tag: 'Apparel · Black', price: '~$40' },
      { id: 'philips-sonicare', href: 'https://www.amazon.com/Philips-Sonicare-Toothbrush-Rechargeable-HX3681/dp/B09LD7WRVS/', name: 'Philips Sonicare Electric Toothbrush', tag: 'Home', price: '~$40–50' },
      { id: 'paddleboard-pump', href: 'https://www.amazon.com/Paddleboard-Professional-Compressor-Deflation-Inflatables/dp/B0CS6HXQPH/', name: 'Electric Paddle Board Pump', tag: 'Outdoor · top of range', price: '~$55–60' },
    ],
  },
  {
    no: '03',
    name: 'Split a Bushel',
    price: 'split between two · ~$130–195',
    note: "Easy to halve with a friend — or grab solo if you're feeling generous.",
    items: [
      { id: 'drake-maye-jersey', href: 'https://www.nflshop.com/new-england-patriots/mens-new-england-patriots-drake-maye-nike-navy-player-game-jersey/t-92607074+p-7966231445327+z-7-478603087', name: 'Drake Maye Patriots Jersey', tag: 'Apparel · Football', price: '~$130' },
      { id: 'patagonia-fleece', href: 'https://www.patagonia.com/product/mens-better-sweater-fleece-jacket/25528.html?dwvar_25528_color=NAUT', name: 'Patagonia Better Sweater Fleece', tag: 'Apparel · Nautilus Tan', price: '~$139' },
      { id: 'hobbit-gift-bundle', href: 'https://manapool.com/sealed/hob/gift-bundle', name: 'The Hobbit Gift Bundle', tag: 'Magic: The Gathering', price: '~$170–195' },
    ],
  },
  {
    no: '04',
    name: 'Golden Apples',
    price: 'group gift · ~$280–490',
    note: 'Big swings — a few people chipping in together makes these easy.',
    items: [
      { id: 'taylormade-putter', href: 'https://www.dickssportinggoods.com/p/taylormade-2024-spider-tour-3-putter-24tymmspdrtr24rd3ptr/24tymmspdrtr24rd3ptr', name: 'TaylorMade Spider Tour Putter', tag: 'Golf', price: '~$280–330' },
      { id: 'strixhaven-collector-box', href: 'https://manapool.com/sealed/sos/collector-booster-box', name: 'Secrets of Strixhaven Collector Box', tag: 'Magic: The Gathering', price: '~$485–490' },
      { id: 'le-creuset-dutch-oven', href: 'https://www.lecreuset.com/signature-round-deep-oven-chambray-6-5-qt/21195026434051.html', name: 'Le Creuset Dutch Oven · 6.5 qt', tag: 'Home', price: '~$290–300' },
      { id: 'ping-g430-driver', href: 'https://www.golfdiscount.com/products/ping-g430-max-driver?variant=50771365167402', name: 'PING G430 MAX Driver', tag: 'Golf', price: '~$400–420' },
    ],
  },
];
