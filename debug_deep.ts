import { encode } from './src/index';

const data = {
  level1: {
    level2: {
      level3: {
        level4: {
          data: [1, 2, 3],
          info: "Deep"
        }
      }
    }
  }
};

console.log("--- Deep Nesting Analysis ---");
console.log("Input:", JSON.stringify(data, null, 2));
console.log("Encoded:", encode(data));
