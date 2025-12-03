import { decode } from './src/core/decoder';

// Access private method via any cast or just test public decode
// Testing public decode with the problematic string

const zon = `context: {
  location: Boulder
  season: spring_2025
  task: Our favorite hikes together
}
friends: [
  ana
  luis
  sam
]
hikes: [
  {
    id: 1
    name: Blue Lake Trail
    distanceKm: 7.5
    elevationGain: 320
    companion: ana
    wasSunny: true
  }
]`;

console.log('--- Input ZON ---');
console.log(zon);
console.log('-----------------');

try {
  const decoded = decode(zon);
  console.log('--- Decoded ---');
  console.log(JSON.stringify(decoded, null, 2));
} catch (e) {
  console.error(e);
}
