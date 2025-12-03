/**
 * Express Middleware for ZON Content Negotiation
 * 
 * Example: API Gateway supporting JSON, ZON, and Binary ZON
 */

import express, { Request, Response, NextFunction } from 'express';
import { encode, decode, encodeBinary, decodeBinary } from 'zon-format';

interface ZonMiddlewareOptions {
  /** Default format if no Accept header */
  defaultFormat?: 'json' | 'zonf' | 'binary';
  
  /** Enable compression for responses */
  compress?: boolean;
  
  /** Log format usage */
  logFormat?: boolean;
}

/**
 * Middleware for automatic ZON content negotiation
 */
export function zonMiddleware(options: ZonMiddlewareOptions = {}) {
  const {
    defaultFormat = 'json',
    compress = false,
    logFormat = false
  } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    const accept = req.headers.accept || '';
    
    // Decode incoming ZON requests
    if (contentType.includes('application/zon-binary')) {
      try {
        if (Buffer.isBuffer(req.body)) {
          req.body = decodeBinary(new Uint8Array(req.body));
        }
      } catch (error: any) {
        return res.status(400).json({ error: 'Invalid binary ZON', message: error.message });
      }
    } else if (contentType.includes('application/zonf')) {
      try {
        const zonText = typeof req.body === 'string' ? req.body : req.body.toString();
        req.body = decode(zonText);
      } catch (error: any) {
        return res.status(400).json({ error: 'Invalid ZON', message: error.message });
      }
    }
    
    // Wrap res.json to support multiple output formats
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      let format = defaultFormat;
      
      // Determine output format from Accept header
      if (accept.includes('application/zon-binary')) {
        format = 'binary';
      } else if (accept.includes('application/zonf')) {
        format = 'zonf';
      } else if (accept.includes('application/json')) {
        format = 'json';
      }
      
      if (logFormat) {
        console.log(`[ZON] Responding with format: ${format}`);
      }
      
      try {
        switch (format) {
          case 'binary': {
            const binary = encodeBinary(data);
            res.type('application/zon-binary');
            return res.send(Buffer.from(binary));
          }
          
          case 'zonf': {
            const zon = encode(data);
            res.type('application/zonf');
            return res.send(zon);
          }
          
          case 'json':
          default:
            return originalJson(data);
        }
      } catch (error: any) {
        return res.status(500).json({ error: 'Encoding failed', message: error.message });
      }
    };
    
    next();
  };
}

// Example usage
const app = express();

// Apply middleware
app.use(express.json());
app.use(express.raw({ type: 'application/zon-binary' }));
app.use(express.text({ type: 'application/zonf' }));
app.use(zonMiddleware({ logFormat: true }));

// Example endpoint
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
  
  // Automatically responds in requested format
  res.json({ users, count: users.length });
});

app.post('/api/users', (req, res) => {
  // req.body is already decoded from ZON if sent as ZON
  const user = req.body;
  
  console.log('Received user:', user);
  
  // Save to database...
  const saved = { ...user, id: Date.now() };
  
  res.status(201).json(saved);
});

export default app;

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Supported formats:');
    console.log('  - application/json');
    console.log('  - application/zonf');
    console.log('  - application/zon-binary');
  });
}
