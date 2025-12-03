/**
 * Batch Migration Script
 * 
 * Example: Migrate large dataset from JSON to ZON
 */

import fs from 'fs';
import path from 'path';
import { encode, decode, embedVersion } from 'zon-format';
import { compareFormats, analyze } from 'zon-format';

interface MigrationOptions {
  /** Source directory */
  sourceDir: string;
  
  /** Target directory */
  targetDir: string;
  
  /** Source format */
  sourceFormat: 'json' | 'zonf';
  
  /** Target format */
  targetFormat: 'json' | 'zonf';
  
  /** Add version metadata */
  addVersion?: string;
  
  /** Schema ID */
  schemaId?: string;
  
  /** Dry run (don't write files) */
  dryRun?: boolean;
  
  /** Show detailed stats */
  verbose?: boolean;
}

interface MigrationStats {
  totalFiles: number;
  successful: number;
  failed: number;
  totalSizeBefore: number;
  totalSizeAfter: number;
  errors: Array<{ file: string; error: string }>;
}

/**
 * Migrate files from one format to another
 */
export async function migrateFiles(options: MigrationOptions): Promise<MigrationStats> {
  const {
    sourceDir,
    targetDir,
    sourceFormat,
    targetFormat,
    addVersion,
    schemaId,
    dryRun = false,
    verbose = false
  } = options;
  
  const stats: MigrationStats = {
    totalFiles: 0,
    successful: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
    errors: []
  };
  
  // Ensure target directory exists
  if (!dryRun && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Get all source files
  const ext = sourceFormat === 'json' ? '.json' : '.zonf';
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith(ext));
  
  console.log(`Found ${files.length} ${sourceFormat.toUpperCase()} files to migrate`);
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${targetDir}`);
  if (dryRun) console.log('DRY RUN - No files will be written\n');
  
  for (const file of files) {
    stats.totalFiles++;
    const sourcePath = path.join(sourceDir, file);
    const targetFile = file.replace(ext, targetFormat === 'json' ? '.json' : '.zonf');
    const targetPath = path.join(targetDir, targetFile);
    
    try {
      // Read source
      const content = fs.readFileSync(sourcePath, 'utf-8');
      stats.totalSizeBefore += content.length;
      
      // Parse source
      let data: any;
      if (sourceFormat === 'json') {
        data = JSON.parse(content);
      } else {
        data = decode(content);
      }
      
      // Add version if requested
      if (addVersion) {
        data = embedVersion(data, addVersion, schemaId);
      }
      
      // Convert to target
      let output: string;
      if (targetFormat === 'json') {
        output = JSON.stringify(data, null, 2);
      } else {
        output = encode(data);
      }
      
      stats.totalSizeAfter += output.length;
      
      // Write target
      if (!dryRun) {
        fs.writeFileSync(targetPath, output, 'utf-8');
      }
      
      stats.successful++;
      
      if (verbose) {
        const sizeDiff = ((output.length - content.length) / content.length * 100).toFixed(1);
        const sign = output.length < content.length ? '-' : '+';
        console.log(`✓ ${file} → ${targetFile} (${sign}${Math.abs(parseFloat(sizeDiff))}%)`);
      }
    } catch (error: any) {
      stats.failed++;
      stats.errors.push({ file, error: error.message });
      console.error(`✗ ${file}: ${error.message}`);
    }
  }
  
  // Print summary
  const totalSavings = ((stats.totalSizeBefore - stats.totalSizeAfter) / stats.totalSizeBefore * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(50));
  console.log('Migration Summary');
  console.log('='.repeat(50));
  console.log(`Total Files:    ${stats.totalFiles}`);
  console.log(`Successful:     ${stats.successful}`);
  console.log(`Failed:         ${stats.failed}`);
  console.log(`Size Before:    ${stats.totalSizeBefore.toLocaleString()} bytes`);
  console.log(`Size After:     ${stats.totalSizeAfter.toLocaleString()} bytes`);
  console.log(`Space Savings:  ${totalSavings}%`);
  
  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }
  
  return stats;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node migration-script.js <source-dir> <target-dir> [options]');
    console.error('Options:');
    console.error('  --from=<json|zonf>     Source format (default: json)');
    console.error('  --to=<json|zonf>       Target format (default: zonf)');
    console.error('  --version=<1.0.0>     Add version metadata');
    console.error('  --schema=<id>         Schema ID');
    console.error('  --dry-run             Don\'t write files');
    console.error('  --verbose             Show detailed progress');
    process.exit(1);
  }
  
  const options: MigrationOptions = {
    sourceDir: args[0],
    targetDir: args[1],
    sourceFormat: 'json',
    targetFormat: 'zonf',
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };
  
  const fromArg = args.find(a => a.startsWith('--from='));
  if (fromArg) options.sourceFormat = fromArg.split('=')[1] as any;
  
  const toArg = args.find(a => a.startsWith('--to='));
  if (toArg) options.targetFormat = toArg.split('=')[1] as any;
  
  const versionArg = args.find(a => a.startsWith('--version='));
  if (versionArg) options.addVersion = versionArg.split('=')[1];
  
  const schemaArg = args.find(a => a.startsWith('--schema='));
  if (schemaArg) options.schemaId = schemaArg.split('=')[1];
  
  migrateFiles(options).then(stats => {
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
