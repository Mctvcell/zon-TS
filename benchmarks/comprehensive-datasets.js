/**
 * Comprehensive Benchmark Datasets
 * 
 * Matrix of datasets covering:
 * - Size: small (10-50 rows), medium (100-500 rows), large (1000-5000 rows)
 * - Structure: 6 combinations of uniformity and nesting
 */

// ============================================================================
// SMALL-SIMPLE DATASETS (10-50 rows, 3-8 columns)
// ============================================================================

const smallSimpleUniformFlat = {
  employees: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    department: ['Engineering', 'Sales', 'Marketing', 'HR'][i % 4],
    salary: 50000 + (i * 5000),
    active: i % 3 !== 0
  }))
};

const smallSimpleNonUniformFlat = {
  products: [
    { id: 1, name: 'Product A', price: 99.99, inStock: true },
    { id: 2, name: 'Product B', price: 149.99, inStock: false, discount: 10 },
    { id: 3, name: 'Product C', price: 199.99, inStock: true },
    { id: 4, name: 'Product D', price: 299.99, inStock: true, discount: 15, featured: true },
    { id: 5, name: 'Product E', price: 399.99, inStock: false },
    { id: 6, name: 'Product F', price: 499.99, inStock: true, discount: 20 },
    { id: 7, name: 'Product G', price: 599.99, inStock: true, featured: true },
    { id: 8, name: 'Product H', price: 699.99, inStock: false, discount: 25 },
    { id: 9, name: 'Product I', price: 799.99, inStock: true },
    { id: 10, name: 'Product J', price: 899.99, inStock: true, discount: 30, featured: true }
  ]
};

const smallSimpleUniformNestedUniform = {
  orders: Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    customer: {
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`
    },
    items: [
      { sku: `SKU-${i + 1}-1`, quantity: 2 },
      { sku: `SKU-${i + 1}-2`, quantity: 1 }
    ],
    total: 100 + (i * 10)
  }))
};

const smallSimpleUniformNestedNonuniform = {
  users: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    profile: i % 2 === 0
      ? { bio: `Bio ${i + 1}`, website: `https://user${i + 1}.com` }
      : { bio: `Bio ${i + 1}`, website: `https://user${i + 1}.com`, twitter: `@user${i + 1}` },
    loginCount: 10 + i
  }))
};

const smallSimpleNonuniformNestedNonuniform = {
  events: [
    { id: 1, type: 'click', user: { id: 101, name: 'Alice' }, timestamp: '2025-01-01T10:00:00Z' },
    { id: 2, type: 'view', user: { id: 102, name: 'Bob', role: 'admin' }, timestamp: '2025-01-01T10:01:00Z', duration: 30 },
    { id: 3, type: 'click', user: { id: 103, name: 'Charlie' }, timestamp: '2025-01-01T10:02:00Z' },
    { id: 4, type: 'purchase', user: { id: 104, name: 'Dave', role: 'user' }, timestamp: '2025-01-01T10:03:00Z', amount: 99.99, items: 3 },
    { id: 5, type: 'view', user: { id: 105, name: 'Eve' }, timestamp: '2025-01-01T10:04:00Z', duration: 45 },
    { id: 6, type: 'click', user: { id: 106, name: 'Frank', role: 'admin' }, timestamp: '2025-01-01T10:05:00Z' },
    { id: 7, type: 'purchase', user: { id: 107, name: 'Grace' }, timestamp: '2025-01-01T10:06:00Z', amount: 149.99, items: 2 },
    { id: 8, type: 'view', user: { id: 108, name: 'Hank', role: 'user' }, timestamp: '2025-01-01T10:07:00Z', duration: 60 }
  ]
};

const smallSimpleNonuniformNestedUniform = {
  tickets: [
    { id: 1, title: 'Bug in login', assignee: { name: 'Alice', team: 'Backend' }, priority: 'high' },
    { id: 2, title: 'UI glitch', assignee: { name: 'Bob', team: 'Frontend' }, priority: 'medium', tags: ['ui', 'css'] },
    { id: 3, title: 'Performance issue', assignee: { name: 'Charlie', team: 'Backend' }, priority: 'high' },
    { id: 4, title: 'Feature request', assignee: { name: 'Dave', team: 'Product' }, priority: 'low', tags: ['enhancement'] },
    { id: 5, title: 'Security concern', assignee: { name: 'Eve', team: 'Security' }, priority: 'critical' },
    { id: 6, title: 'Documentation', assignee: { name: 'Frank', team: 'DevRel' }, priority: 'low', tags: ['docs'] }
  ]
};

// ============================================================================
// MEDIUM-COMPLEX DATASETS (100-500 rows, 8-15 columns)
// ============================================================================

const mediumComplexUniformFlat = {
  transactions: Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(2025, 0, 1 + Math.floor(i / 10), i % 24, i % 60).toISOString(),
    userId: 1000 + (i % 50),
    amount: Math.round((Math.random() * 1000 + 10) * 100) / 100,
    currency: ['USD', 'EUR', 'GBP'][i % 3],
    status: ['pending', 'completed', 'failed'][i % 3],
    merchantId: 5000 + (i % 20),
    category: ['food', 'transport', 'entertainment', 'shopping'][i % 4],
    location: ['NYC', 'LON', 'PAR', 'TOK'][i % 4],
    paymentMethod: ['card', 'bank', 'wallet'][i % 3]
  }))
};

const mediumComplexNonUniformFlat = {
  logs: Array.from({ length: 300 }, (_, i) => {
    const base = {
      id: i + 1,
      timestamp: new Date(2025, 0, 1, Math.floor(i / 12), i % 60).toISOString(),
      level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][i % 4],
      message: `Log message ${i + 1}`,
      source: ['api', 'worker', 'scheduler'][i % 3]
    };
    
    // Add optional fields based on level
    if (base.level === 'ERROR') {
      base.errorCode = `E${1000 + (i % 100)}`;
      base.stackTrace = `Stack trace ${i}`;
    }
    if (base.level === 'WARN') {
      base.warningCode = `W${2000 + (i % 100)}`;
    }
    if (i % 5 === 0) {
      base.userId = 1000 + (i % 50);
    }
    if (i % 7 === 0) {
      base.duration = Math.round(Math.random() * 1000);
    }
    
    return base;
  })
};

const mediumComplexUniformNestedUniform = {
  shipments: Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    tracking: `TRK${10000 + i}`,
    sender: {
      name: `Sender ${i + 1}`,
      address: `${i + 1} Sender St`,
      city: ['NYC', 'LON', 'PAR'][i % 3]
    },
    recipient: {
      name: `Recipient ${i + 1}`,
      address: `${i + 1} Recipient Ave`,
      city: ['LAX', 'BER', 'TOK'][i % 3]
    },
    packages: [
      { weight: 1.5 + (i % 5), dimensions: '10x10x10' },
      { weight: 2.5 + (i % 3), dimensions: '15x15x15' }
    ],
    status: ['in-transit', 'delivered', 'pending'][i % 3]
  }))
};

const mediumComplexUniformNestedNonuniform = {
  courses: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Course ${i + 1}`,
    instructor: {
      name: `Instructor ${i + 1}`,
      email: `instructor${i + 1}@university.edu`,
      ...(i % 2 === 0 && { officeHours: 'Mon 2-4pm' }),
      ...(i % 3 === 0 && { researchArea: 'AI' })
    },
    students: Array.from({ length: 15 + (i % 10) }, (_, j) => ({
      id: j + 1,
      name: `Student ${j + 1}`
    })),
    credits: 3 + (i % 3)
  }))
};

const mediumComplexNonuniformNestedNonuniform = {
  apiCalls: Array.from({ length: 250 }, (_, i) => {
    const call = {
      id: i + 1,
      endpoint: ['/api/users', '/api/products', '/api/orders'][i % 3],
      method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
      timestamp: new Date(2025, 0, 1, Math.floor(i / 10), i % 60).toISOString(),
      statusCode: [200, 201, 400, 404, 500][i % 5]
    };
    
    if (call.method === 'POST' || call.method === 'PUT') {
      call.requestBody = {
        data: `payload ${i}`,
        ...(i % 2 === 0 && { metadata: { source: 'web' } })
      };
    }
    
    if (call.statusCode >= 400) {
      call.error = {
        message: `Error ${i}`,
        ...(call.statusCode === 500 && { stack: `Stack ${i}` })
      };
    } else {
      call.response = {
        data: `result ${i}`,
        ...(i % 3 === 0 && { cached: true }),
        ...(i % 5 === 0 && { duration: 100 + (i % 50) })
      };
    }
    
    return call;
  })
};

const mediumComplexNonuniformNestedUniform = {
  sensors: Array.from({ length: 180 }, (_, i) => {
    const reading = {
      id: i + 1,
      deviceId: `SENSOR-${1000 + (i % 30)}`,
      timestamp: new Date(2025, 0, 1, Math.floor(i / 6), (i * 10) % 60).toISOString(),
      location: {
        lat: 40.7128 + (i % 100) / 1000,
        lon: -74.0060 + (i % 100) / 1000
      },
      temperature: 20 + (i % 20)
    };
    
    if (i % 3 === 0) {
      reading.humidity = 50 + (i % 30);
    }
    if (i % 5 === 0) {
      reading.pressure = 1013 + (i % 20);
      reading.windSpeed = 5 + (i % 15);
    }
    
    return reading;
  })
};

// ============================================================================
// LARGE-COMPLEX DATASETS (1000-5000 rows, 15-25 columns)
// ============================================================================

const largeComplexUniformFlat = {
  sales: Array.from({ length: 2000 }, (_, i) => ({
    id: i + 1,
    orderId: `ORD-${100000 + i}`,
    customerId: `CUST-${10000 + (i % 500)}`,
    productId: `PROD-${1000 + (i % 200)}`,
    quantity: 1 + (i % 10),
    unitPrice: Math.round((10 + (i % 100)) * 100) / 100,
    totalPrice: Math.round((10 + (i % 100)) * (1 + (i % 10)) * 100) / 100,
    orderDate: new Date(2024, (i % 12), 1 + (i % 28)).toISOString().split('T')[0],
    shipDate: new Date(2024, (i % 12), 3 + (i % 28)).toISOString().split('T')[0],
    region: ['North', 'South', 'East', 'West'][i % 4],
    country: ['USA', 'UK', 'DE', 'FR', 'JP'][i % 5],
    salesRep: `Rep-${1 + (i % 50)}`,
    channel: ['Online', 'Retail', 'Partner'][i % 3],
    discount: (i % 5) * 5,
    tax: Math.round((10 + (i % 100)) * (1 + (i % 10)) * 0.1 * 100) / 100,
    shippingCost: 5 + (i % 10)
  }))
};

const largeComplexNonUniformFlat = {
  userActivity: Array.from({ length: 3000 }, (_, i) => {
    const activity = {
      id: i + 1,
      userId: 1000 + (i % 1000),
      sessionId: `SES-${Math.floor(i / 10)}`,
      timestamp: new Date(2025, 0, 1 + Math.floor(i / 100), (i % 24), (i * 3) % 60).toISOString(),
      action: ['view', 'click', 'scroll', 'submit', 'download'][i % 5],
      page: ['/home', '/products', '/about', '/contact', '/checkout'][i % 5],
      device: ['desktop', 'mobile', 'tablet'][i % 3],
      browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][i % 4],
      os: ['Windows', 'MacOS', 'Linux', 'iOS', 'Android'][i % 5]
    };
    
    // Conditional fields based on action type
    if (activity.action === 'click') {
      activity.elementId = `btn-${i % 100}`;
      activity.elementType = ['button', 'link', 'image'][i % 3];
    }
    if (activity.action === 'submit') {
      activity.formId = `form-${i % 20}`;
      activity.success = i % 3 !== 0;
    }
    if (activity.action === 'download') {
      activity.fileId = `file-${i % 50}`;
      activity.fileSize = 1024 * (1 + (i % 100));
    }
    if (i % 10 === 0) {
      activity.referrer = `https://referrer${i % 20}.com`;
    }
    if (i % 7 === 0) {
      activity.duration = 100 + (i % 500);
    }
    
    return activity;
  })
};

const largeComplexUniformNestedUniform = {
  inventoryItems: Array.from({ length: 1500 }, (_, i) => ({
    id: i + 1,
    sku: `SKU-${10000 + i}`,
    warehouse: {
      id: `WH-${1 + (i % 10)}`,
      location: {
        city: ['NYC', 'LAX', 'CHI', 'HOU', 'PHX'][i % 5],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5]
      }
    },
    stock: {
      available: 100 + (i % 500),
      reserved: 10 + (i % 50),
      damaged: i % 100 === 0 ? 5 : 0
    },
    pricing: {
      cost: Math.round((50 + (i % 200)) * 100) / 100,
      retail: Math.round((100 + (i % 300)) * 100) / 100,
      currency: 'USD'
    },
    lastRestock: new Date(2024, (i % 12), 1 + (i % 28)).toISOString().split('T')[0]
  }))
};

const largeComplexUniformNestedNonuniform = {
  jobApplications: Array.from({ length: 1200 }, (_, i) => ({
    id: i + 1,
    applicantId: `APP-${10000 + i}`,
    jobId: `JOB-${500 + (i % 100)}`,
    submittedAt: new Date(2024, (i % 12), 1 + (i % 28)).toISOString(),
    applicant: {
      name: `Applicant ${i + 1}`,
      email: `applicant${i + 1}@example.com`,
      phone: `+1-555-${1000 + (i % 9000)}`,
      ...(i % 2 === 0 && { linkedin: `linkedin.com/in/applicant${i + 1}` }),
      ...(i % 3 === 0 && { portfolio: `portfolio${i + 1}.com` })
    },
    experience: Array.from({ length: 2 + (i % 3) }, (_, j) => ({
      company: `Company ${j + 1}`,
      role: `Role ${j + 1}`,
      years: 1 + j
    })),
    status: ['pending', 'reviewing', 'interview', 'rejected', 'accepted'][i % 5]
  }))
};

const largeComplexNonuniformNestedNonuniform = {
  financialTransactions: Array.from({ length: 2500 }, (_, i) => {
    const txn = {
      id: i + 1,
      txnId: `TXN-${1000000 + i}`,
      timestamp: new Date(2025, 0, 1 + Math.floor(i / 100), (i % 24), (i * 2) % 60).toISOString(),
      type: ['deposit', 'withdrawal', 'transfer', 'payment'][i % 4],
      amount: Math.round((100 + (i % 10000)) * 100) / 100,
      currency: ['USD', 'EUR', 'GBP', 'JPY'][i % 4],
      accountId: `ACC-${10000 + (i % 500)}`
    };
    
    if (txn.type === 'transfer' || txn.type === 'payment') {
      txn.recipient = {
        accountId: `ACC-${10000 + ((i + 1) % 500)}`,
        name: `Recipient ${i % 500}`,
        ...(i % 2 === 0 && { bankCode: `BANK${100 + (i % 50)}` })
      };
    }
    
    if (txn.type === 'payment') {
      txn.merchant = {
        id: `MERCH-${1000 + (i % 200)}`,
        name: `Merchant ${i % 200}`,
        category: ['retail', 'food', 'travel', 'utilities'][i % 4]
      };
    }
    
    if (i % 3 === 0) {
      txn.fees = {
        processingFee: Math.round(txn.amount * 0.02 * 100) / 100,
        ...(i % 6 === 0 && { internationalFee: Math.round(txn.amount * 0.03 * 100) / 100 })
      };
    }
    
    if (i % 10 === 0) {
      txn.metadata = {
        ip: `192.168.${i % 256}.${(i * 2) % 256}`,
        device: ['web', 'mobile', 'atm'][i % 3],
        ...(i % 20 === 0 && { location: { lat: 40 + (i % 100) / 10, lon: -70 + (i % 100) / 10 } })
      };
    }
    
    return txn;
  })
};

const largeComplexNonuniformNestedUniform = {
  deviceMetrics: Array.from({ length: 1800 }, (_, i) => {
    const metric = {
      id: i + 1,
      deviceId: `DEV-${1000 + (i % 300)}`,
      timestamp: new Date(2025, 0, 1, Math.floor(i / 75), (i * 4) % 60).toISOString(),
      location: {
        building: `Building ${1 + (i % 5)}`,
        floor: 1 + (i % 10),
        room: `Room ${100 + (i % 50)}`
      },
      cpu: Math.round((20 + (i % 60)) * 10) / 10,
      memory: Math.round((30 + (i % 50)) * 10) / 10
    };
    
    if (i % 2 === 0) {
      metric.disk = Math.round((40 + (i % 40)) * 10) / 10;
    }
    if (i % 3 === 0) {
      metric.network = {
        rx: 1000 + (i % 5000),
        tx: 500 + (i % 3000)
      };
    }
    if (i % 5 === 0) {
      metric.temperature = 60 + (i % 20);
      metric.fanSpeed = 1000 + (i % 2000);
    }
    
    return metric;
  })
};

// Export all datasets
module.exports = {
  // Small-Simple
  smallSimpleUniformFlat,
  smallSimpleNonUniformFlat,
  smallSimpleUniformNestedUniform,
  smallSimpleUniformNestedNonuniform,
  smallSimpleNonuniformNestedNonuniform,
  smallSimpleNonuniformNestedUniform,
  
  // Medium-Complex
  mediumComplexUniformFlat,
  mediumComplexNonUniformFlat,
  mediumComplexUniformNestedUniform,
  mediumComplexUniformNestedNonuniform,
  mediumComplexNonuniformNestedNonuniform,
  mediumComplexNonuniformNestedUniform,
  
  // Large-Complex
  largeComplexUniformFlat,
  largeComplexNonUniformFlat,
  largeComplexUniformNestedUniform,
  largeComplexUniformNestedNonuniform,
  largeComplexNonuniformNestedNonuniform,
  largeComplexNonuniformNestedUniform
};
