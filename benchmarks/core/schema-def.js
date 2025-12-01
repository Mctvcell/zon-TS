const { zon } = require('../../dist/index');

const UnifiedSchema = zon.object({
  metadata: zon.object({
    systemId: zon.string(),
    version: zon.string(),
    uptime: zon.number(),
    location: zon.string(),
    tags: zon.array(zon.string())
  }),
  users: zon.array(zon.object({
    id: zon.number(),
    name: zon.string(),
    role: zon.enum(['admin', 'dev', 'qa', 'ops', 'guest']),
    active: zon.boolean(),
    loginCount: zon.number(),
    lastLogin: zon.string()
  })),
  config: zon.object({
    database: zon.object({
      host: zon.string(),
      port: zon.number(),
      poolSize: zon.number(),
      timeout: zon.number(),
      replicas: zon.array(zon.object({
        host: zon.string(),
        priority: zon.number()
      }))
    }),
    cache: zon.object({
      enabled: zon.boolean(),
      provider: zon.string(),
      ttl: zon.number(),
      nodes: zon.array(zon.string())
    }),
    features: zon.object({
      darkMode: zon.boolean(),
      betaAccess: zon.boolean(),
      analytics: zon.object({
        enabled: zon.boolean(),
        sampleRate: zon.number()
      })
    })
  }),
  logs: zon.array(zon.object({
    id: zon.number(),
    timestamp: zon.string(),
    level: zon.enum(['INFO', 'WARN', 'ERROR']),
    message: zon.string(),
    source: zon.string(),
    latency: zon.number().optional(),
    usage: zon.number().optional(),
    requestId: zon.string().optional(),
    duration: zon.number().optional()
  })),
  products: zon.array(zon.object({
    id: zon.string(),
    name: zon.string(),
    price: zon.number(),
    category: zon.string(),
    inStock: zon.boolean(),
    tags: zon.array(zon.string())
  })),
  feed: zon.array(zon.object({
    id: zon.string(),
    type: zon.enum(['post', 'comment', 'ad']),
    author: zon.string().optional(),
    sponsor: zon.string().optional(),
    content: zon.string(),
    likes: zon.number().optional(),
    shares: zon.number().optional(),
    replyTo: zon.string().optional(),
    clickCount: zon.number().optional()
  }))
});

module.exports = { UnifiedSchema };
