// ✅ ETAPA 6: Setup para tests de Vitest
import { vi } from "vitest";

// Mock global objects
global.window = {
  location: {
    href: "https://test.com",
    pathname: "/test",
    search: "",
    hash: "",
  },
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  performance: {
    getEntriesByType: vi.fn(() => []),
    now: vi.fn(() => 1000),
  },
  matchMedia: vi.fn(() => ({
    matches: true,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
};

global.navigator = {
  userAgent: "Test User Agent",
  connection: { effectiveType: "4g" },
  clipboard: {
    writeText: vi.fn().mockResolvedValue(),
  },
};

global.document = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  createElement: vi.fn(() => ({
    style: {},
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    click: vi.fn(),
    parentNode: {
      removeChild: vi.fn(),
    },
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  head: {
    appendChild: vi.fn(),
  },
  getElementById: vi.fn(() => ({
    appendChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    style: {},
    offsetHeight: 100,
  })),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
};

// Mock Firebase
vi.mock("@/firebase", () => ({
  default: {},
  db: {},
  auth: {},
  performance: {},
  analytics: {},
}));

// Mock Firebase functions
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  increment: vi.fn(),
}));

vi.mock("firebase/performance", () => ({
  getPerformance: vi.fn(),
  trace: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    putAttribute: vi.fn(),
    putMetric: vi.fn(),
  })),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
};
