#!/usr/bin/env node
import { encode, decode } from './index';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];
const inputFile = args[1];

if (!command || !inputFile) {
  console.error('Usage: zon <encode|decode> <file>');
  console.error('Example: zon encode data.json > data.zonf');
  process.exit(1);
}

try {
  const absolutePath = path.resolve(process.cwd(), inputFile);
  const content = fs.readFileSync(absolutePath, 'utf-8');

  if (command === 'encode') {
    const json = JSON.parse(content);
    console.log(encode(json));
  } else if (command === 'decode') {
    const decoded = decode(content);
    console.log(JSON.stringify(decoded, null, 2));
  } else {
    console.error('Unknown command:', command);
    console.error('Usage: zon <encode|decode> <file>');
    console.error('Example: zon encode data.json > data.zonf');
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
