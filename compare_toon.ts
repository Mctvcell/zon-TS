// Manual TOON conversion of hiking example
// Based on TOON spec: https://github.com/toon-format/spec

const hiking_json = {
  "context": {
    "task": "Our favorite hikes together",
    "location": "Boulder",
    "season": "spring_2025"
  },
  "friends": [
    "ana",
    "luis",
    "sam"
  ],
  "hikes": [
    {
      "id": 1,
      "name": "Blue Lake Trail",
      "distanceKm": 7.5,
      "elevationGain": 320,
      "companion": "ana",
      "wasSunny": true
    },
    {
      "id": 2,
      "name": "Ridge Overlook",
      "distanceKm": 9.2,
      "elevationGain": 540,
      "companion": "luis",
      "wasSunny": false
    },
    {
      "id": 3,
      "name": "Wildflower Loop",
      "distanceKm": 5.1,
      "elevationGain": 180,
      "companion": "sam",
      "wasSunny": true
    }
  ]
};

// TOON Format (based on spec rules):
// - 2 space indentation
// - NO braces for objects
// - key: value format
// - key: on line for nested objects
// - Arrays use [N]: header for uniform data
// - Or expanded list with - prefix

const toon_output = `context:
  task: Our favorite hikes together
  location: Boulder
  season: spring_2025
friends: [3]: ana, luis, sam
hikes: [3]{companion,distanceKm,elevationGain,id,name,wasSunny}:
  ana, 7.5, 320, 1, Blue Lake Trail, true
  luis, 9.2, 540, 2, Ridge Overlook, false
  sam, 5.1, 180, 3, Wildflower Loop, true`;

console.log('=== JSON (Original) ===');
console.log(JSON.stringify(hiking_json, null, 2));
console.log('\n=== TOON Format ===');
console.log(toon_output);

console.log('\n=== Token Comparison ===');
const json_tokens = JSON.stringify(hiking_json).length / 4; // rough estimate
const toon_tokens = toon_output.length / 4; // rough estimate
console.log(`JSON: ~${Math.round(json_tokens)} tokens`);
console.log(`TOON: ~${Math.round(toon_tokens)} tokens`);
console.log(`Savings: ~${Math.round((1 - toon_tokens/json_tokens) * 100)}%`);

// Note: TOON uses pure indentation (NO braces!)
console.log('\n=== Key Difference ===');
console.log('TOON: NO curly braces - pure indentation');
console.log('ZON: Hybrid approach - braces + indentation');
