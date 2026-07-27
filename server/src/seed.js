const db = require('./db');

const count = db.prepare('SELECT COUNT(*) AS c FROM listings').get().c;

if (count > 0) {
  console.log(`Skipping seed: ${count} listings already exist.`);
  process.exit(0);
}

function photos(seed, n) {
  return JSON.stringify(
    Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/900/600`)
  );
}

const listings = [
  {
    make: 'Honda', model: 'Civic', year: 2014, mileage: 98500, price: 8900,
    description: 'Reliable daily driver with excellent fuel economy. Clean title, recent oil change and new tires. Cold A/C, all power options work great.',
    status: 'active', photos: photos('civic', 5),
  },
  {
    make: 'Toyota', model: 'Camry', year: 2013, mileage: 112300, price: 7500,
    description: 'The used-car classic for a reason. Smooth ride, spacious interior, and a track record of running forever. Non-smoker vehicle.',
    status: 'active', photos: photos('camry', 6),
  },
  {
    make: 'Ford', model: 'Escape', year: 2016, mileage: 87200, price: 10900,
    description: 'Compact SUV with room for the whole family. Backup camera, Bluetooth, and roomy cargo area. Great for road trips.',
    status: 'active', photos: photos('escape', 4),
  },
  {
    make: 'Chevrolet', model: 'Malibu', year: 2015, mileage: 76400, price: 8200,
    description: 'Comfortable sedan with a smooth highway ride. Recently serviced with new brakes and battery.',
    status: 'active', photos: photos('malibu', 5),
  },
  {
    make: 'Nissan', model: 'Altima', year: 2017, mileage: 64900, price: 11500,
    description: 'Low miles for the year. Sporty handling with a comfortable cabin. Great commuter car.',
    status: 'active', photos: photos('altima', 5),
  },
  {
    make: 'Honda', model: 'Accord', year: 2012, mileage: 134800, price: 6400,
    description: 'High miles but well maintained with full service records. Runs and drives excellent. Priced to sell fast.',
    status: 'active', photos: photos('accord', 4),
  },
  {
    make: 'Hyundai', model: 'Elantra', year: 2018, mileage: 58300, price: 12400,
    description: 'Nearly new feel at a used-car price. Apple CarPlay, backup camera, and great warranty remaining.',
    status: 'active', photos: photos('elantra', 6),
  },
  {
    make: 'Jeep', model: 'Patriot', year: 2014, mileage: 91200, price: 7900,
    description: 'Rugged little SUV, great for weekend adventures. 4WD, tow package, new tires all around.',
    status: 'active', photos: photos('patriot', 4),
  },
  {
    make: 'Kia', model: 'Optima', year: 2016, mileage: 82000, price: 8750,
    description: 'Sharp looking sedan with leather seats and sunroof. Drives like new.',
    status: 'sold', photos: photos('optima', 5),
  },
  {
    make: 'Toyota', model: 'Corolla', year: 2011, mileage: 145600, price: 4995,
    description: 'Budget-friendly commuter. High miles but Toyota-reliable. Perfect first car.',
    status: 'active', photos: photos('corolla', 4),
  },
  {
    make: 'Subaru', model: 'Outback', year: 2013, mileage: 108900, price: 9600,
    description: 'All-wheel drive wagon, great for any weather. New timing belt and water pump done.',
    status: 'active', photos: photos('outback', 5),
  },
  {
    make: 'Dodge', model: 'Grand Caravan', year: 2015, mileage: 96700, price: 8300,
    description: 'Family-friendly minivan with Stow n Go seating. Plenty of room for kids and cargo.',
    status: 'sold', photos: photos('caravan', 4),
  },
];

const insert = db.prepare(`
  INSERT INTO listings (make, model, year, mileage, price, description, status, photos)
  VALUES (@make, @model, @year, @mileage, @price, @description, @status, @photos)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

insertMany(listings);

const inquiries = [
  { listing_id: 1, buyer_name: 'Jamie Torres', email: 'jamie.t@example.com', phone: '555-201-3344', message: 'Is the Civic still available? Can I see it this weekend?' },
  { listing_id: 3, buyer_name: 'Priya Patel', email: 'priya.p@example.com', phone: '555-482-9012', message: 'Does the Escape have any accident history?' },
  { listing_id: null, buyer_name: 'Marcus Webb', email: 'marcus.webb@example.com', phone: '555-773-1120', message: 'Looking for something under $8k with low mileage, what do you recommend?' },
];

const insertInquiry = db.prepare(`
  INSERT INTO inquiries (listing_id, buyer_name, email, phone, message)
  VALUES (@listing_id, @buyer_name, @email, @phone, @message)
`);
const insertInquiries = db.transaction((rows) => {
  for (const row of rows) insertInquiry.run(row);
});
insertInquiries(inquiries);

console.log(`Seeded ${listings.length} listings and ${inquiries.length} inquiries.`);
