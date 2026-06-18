'use strict';

// Seed catalogue for the chocolate store. This is the "source of truth" that the
// in-memory store is (re)built from on startup and whenever POST /api/admin/reset
// is called. Keeping it as a function means every reset gets a fresh deep copy.

const TYPES = ['dark', 'milk', 'white', 'ruby'];

const BRANDS = [
  'Lindt',
  'Ghirardelli',
  'Godiva',
  'Cadbury',
  "Hershey's",
  'Toblerone',
  'Ferrero',
  'Milka',
  'Valrhona',
  "Green & Black's",
  'Peace-Eshiet',
  'HDLV',
  'LuH8uFu',
];

// Raw catalogue rows: [name, brand, type, cacaoPercentage, price, stock, origin]
const ROWS = [
  ['Excellence 70% Dark', 'Lindt', 'dark', 70, 3.49, 120, 'Switzerland'],
  ['Excellence 85% Dark', 'Lindt', 'dark', 85, 3.79, 80, 'Switzerland'],
  ['Lindor Milk Truffles', 'Lindt', 'milk', 31, 5.99, 200, 'Switzerland'],
  ['Lindor White Truffles', 'Lindt', 'white', 0, 5.99, 150, 'Switzerland'],
  ['Intense Dark 86%', 'Ghirardelli', 'dark', 86, 4.25, 90, 'USA'],
  ['Milk & Caramel Squares', 'Ghirardelli', 'milk', 31, 4.25, 140, 'USA'],
  ['Classic White', 'Ghirardelli', 'white', 0, 4.10, 75, 'USA'],
  ['Signature Dark Truffles', 'Godiva', 'dark', 72, 9.99, 60, 'Belgium'],
  ['Milk Chocolate Gift Box', 'Godiva', 'milk', 33, 12.5, 45, 'Belgium'],
  ['Dairy Milk', 'Cadbury', 'milk', 26, 2.49, 300, 'United Kingdom'],
  ['Bournville Dark', 'Cadbury', 'dark', 50, 2.79, 180, 'United Kingdom'],
  ['Milk Chocolate Bar', "Hershey's", 'milk', 30, 1.99, 400, 'USA'],
  ["Hershey's Special Dark", "Hershey's", 'dark', 45, 2.19, 250, 'USA'],
  ['Cookies n Creme', "Hershey's", 'white', 0, 2.29, 220, 'USA'],
  ['Swiss Milk Triangle', 'Toblerone', 'milk', 28, 3.99, 160, 'Switzerland'],
  ['Dark Honey & Almond', 'Toblerone', 'dark', 50, 4.29, 110, 'Switzerland'],
  ['White Honey & Almond', 'Toblerone', 'white', 0, 4.29, 95, 'Switzerland'],
  ['Rocher Hazelnut', 'Ferrero', 'milk', 30, 6.49, 130, 'Italy'],
  ['Rondnoir Dark', 'Ferrero', 'dark', 55, 6.99, 70, 'Italy'],
  ['Raffaello White Coconut', 'Ferrero', 'white', 0, 6.99, 85, 'Italy'],
  ['Alpine Milk', 'Milka', 'milk', 30, 2.89, 210, 'Germany'],
  ['Daim Crunch', 'Milka', 'milk', 30, 3.19, 175, 'Germany'],
  ['Grand Cru Guanaja 70%', 'Valrhona', 'dark', 70, 7.50, 50, 'France'],
  ['Grand Cru Jivara 40%', 'Valrhona', 'milk', 40, 7.50, 55, 'France'],
  ['Inspiration Ruby', 'Valrhona', 'ruby', 47, 8.20, 40, 'France'],
  ['Organic 85% Dark', "Green & Black's", 'dark', 85, 3.99, 100, 'United Kingdom'],
  ['Organic Milk', "Green & Black's", 'milk', 37, 3.99, 120, 'United Kingdom'],
  ['Organic White', "Green & Black's", 'white', 0, 3.99, 80, 'United Kingdom'],
  ['Ruby Cacao Bar', 'Lindt', 'ruby', 47, 4.49, 65, 'Switzerland'],
  ['Ruby Truffle Box', 'Godiva', 'ruby', 47, 13.5, 35, 'Belgium'],
  ['Cacao Oaxaca 75%', 'Peace-Eshiet', 'dark', 75, 5.49, 90, 'Mexico'],
  ['Leche Dulce', 'Peace-Eshiet', 'milk', 34, 4.29, 110, 'Mexico'],
  ['Rosa Ruby', 'Peace-Eshiet', 'ruby', 47, 6.20, 50, 'Mexico'],
  ['Maya Dark 80%', 'HDLV', 'dark', 80, 5.99, 70, 'Mexico'],
  ['Blanco Vainilla', 'HDLV', 'white', 0, 4.79, 85, 'Mexico'],
  ['Chili Milk', 'HDLV', 'milk', 32, 4.99, 95, 'Mexico'],
  ['Aztec Spice Dark', 'LuH8uFu', 'dark', 72, 5.79, 60, 'Mexico'],
  ['Coco Blanco', 'LuH8uFu', 'white', 0, 4.59, 75, 'Mexico'],
  ['Ruby Agave', 'LuH8uFu', 'ruby', 47, 6.49, 45, 'Mexico'],
];

/** Build a fresh array of chocolate objects with sequential numeric ids. */
function buildChocolates() {
  return ROWS.map((row, index) => {
    const [name, brand, type, cacaoPercentage, price, stock, origin] = row;
    return {
      id: index + 1,
      name,
      brand,
      type,
      cacaoPercentage,
      price,
      stock,
      origin,
      sku: `${brand.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
      description: `${name} by ${brand} — a ${type} chocolate from ${origin}.`,
    };
  });
}

// A demo user so JMeter scripts can log in immediately without registering first.
// (Passwords are stored in plain text on purpose — this is a throwaway practice app.)
function buildUsers() {
  return [
    {
      id: 1,
      username: 'demo',
      email: 'demo@chocolate.store',
      password: 'password123',
    },
  ];
}

module.exports = { TYPES, BRANDS, buildChocolates, buildUsers };
