// Fraud Detection System Types

export interface Transaction {
  id: string;
  hash: string;
  blockNumber: number;
  timestamp: Date;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategory: string;
  cardLast4: string;
  cardType: 'visa' | 'mastercard' | 'rupay' | 'amex';
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  status: 'pending' | 'approved' | 'flagged' | 'blocked';
  riskScore: number;
  processingTime: {
    payment: number;
    fraudDetection: number;
    gateway: number;
    total: number;
  };
  xaiExplanation?: XAIExplanation;
  customerEmail?: string;
  customerId?: string;
}

export interface XAIExplanation {
  riskScore: number;
  confidence: number;
  decision: 'approved' | 'flagged' | 'blocked';
  factors: XAIFactor[];
  summary: string;
  modelVersion: string;
}

export interface XAIFactor {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
  threshold?: number;
  actualValue?: string | number;
}

export interface MachineStatus {
  id: 'payment' | 'fraud-detection' | 'gateway';
  name: string;
  status: 'online' | 'processing' | 'offline' | 'error';
  processedToday: number;
  avgProcessingTime: number;
  successRate: number;
  lastActive: Date;
  currentLoad: number;
}

export interface BlockchainBlock {
  number: number;
  hash: string;
  previousHash: string;
  timestamp: Date;
  transactions: string[];
  nonce: number;
  gasUsed: number;
  gasLimit: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  walletAddress?: string;
  walletBalance?: number;
  createdAt: Date;
  lastLogin?: Date;
  isNewCustomer?: boolean;
}

export interface AnalyticsData {
  totalTransactions: number;
  approvedCount: number;
  flaggedCount: number;
  blockedCount: number;
  totalVolume: number;
  avgRiskScore: number;
  fraudRate: number;
  hourlyData: { hour: number; count: number; flagged: number }[];
  dailyData: { date: string; count: number; volume: number; flagged: number }[];
  stateData: { state: string; count: number; flaggedCount: number; volume: number }[];
  categoryData: { category: string; count: number; flaggedRate: number }[];
  modelMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    accuracy: number;
  };
}

export interface IndianState {
  name: string;
  code: string;
  coordinates: { lat: number; lng: number };
  transactionCount: number;
  fraudCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Indian merchant categories
export const MERCHANT_CATEGORIES = [
  'E-commerce',
  'Grocery',
  'Fuel Station',
  'Restaurant',
  'Travel & Airlines',
  'Entertainment',
  'Healthcare',
  'Education',
  'Utilities',
  'Electronics',
  'Fashion & Apparel',
  'Jewelry',
  'Insurance',
  'Government Services',
  'Telecom',
] as const;

// Indian states for geographic analysis
export const INDIAN_STATES: IndianState[] = [
  { name: 'Maharashtra', code: 'MH', coordinates: { lat: 19.7515, lng: 75.7139 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Delhi', code: 'DL', coordinates: { lat: 28.7041, lng: 77.1025 }, transactionCount: 0, fraudCount: 0, riskLevel: 'high' },
  { name: 'Karnataka', code: 'KA', coordinates: { lat: 15.3173, lng: 75.7139 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Tamil Nadu', code: 'TN', coordinates: { lat: 11.1271, lng: 78.6569 }, transactionCount: 0, fraudCount: 0, riskLevel: 'low' },
  { name: 'Gujarat', code: 'GJ', coordinates: { lat: 22.2587, lng: 71.1924 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Uttar Pradesh', code: 'UP', coordinates: { lat: 26.8467, lng: 80.9462 }, transactionCount: 0, fraudCount: 0, riskLevel: 'high' },
  { name: 'West Bengal', code: 'WB', coordinates: { lat: 22.9868, lng: 87.855 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Rajasthan', code: 'RJ', coordinates: { lat: 27.0238, lng: 74.2179 }, transactionCount: 0, fraudCount: 0, riskLevel: 'low' },
  { name: 'Telangana', code: 'TS', coordinates: { lat: 18.1124, lng: 79.0193 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Kerala', code: 'KL', coordinates: { lat: 10.8505, lng: 76.2711 }, transactionCount: 0, fraudCount: 0, riskLevel: 'low' },
  { name: 'Madhya Pradesh', code: 'MP', coordinates: { lat: 22.9734, lng: 78.6569 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Punjab', code: 'PB', coordinates: { lat: 31.1471, lng: 75.3412 }, transactionCount: 0, fraudCount: 0, riskLevel: 'low' },
  { name: 'Haryana', code: 'HR', coordinates: { lat: 29.0588, lng: 76.0856 }, transactionCount: 0, fraudCount: 0, riskLevel: 'medium' },
  { name: 'Bihar', code: 'BR', coordinates: { lat: 25.0961, lng: 85.3131 }, transactionCount: 0, fraudCount: 0, riskLevel: 'high' },
  { name: 'Odisha', code: 'OR', coordinates: { lat: 20.9517, lng: 85.0985 }, transactionCount: 0, fraudCount: 0, riskLevel: 'low' },
];

// Popular Indian merchants
export const INDIAN_MERCHANTS = [
  { name: 'Flipkart', category: 'E-commerce' },
  { name: 'Amazon India', category: 'E-commerce' },
  { name: 'BigBasket', category: 'Grocery' },
  { name: 'Swiggy', category: 'Restaurant' },
  { name: 'Zomato', category: 'Restaurant' },
  { name: 'MakeMyTrip', category: 'Travel & Airlines' },
  { name: 'BookMyShow', category: 'Entertainment' },
  { name: 'Apollo Pharmacy', category: 'Healthcare' },
  { name: 'Reliance Digital', category: 'Electronics' },
  { name: 'Myntra', category: 'Fashion & Apparel' },
  { name: 'Tanishq', category: 'Jewelry' },
  { name: 'ICICI Lombard', category: 'Insurance' },
  { name: 'Jio', category: 'Telecom' },
  { name: 'Indian Oil', category: 'Fuel Station' },
  { name: 'BPCL', category: 'Fuel Station' },
  { name: 'DMart', category: 'Grocery' },
  { name: 'Croma', category: 'Electronics' },
  { name: 'Airtel', category: 'Telecom' },
  { name: 'IRCTC', category: 'Travel & Airlines' },
  { name: 'Paytm Mall', category: 'E-commerce' },
];

export const INDIAN_CITIES: { city: string; state: string; lat: number; lng: number }[] = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
  { city: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648 },
  { city: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { city: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
  { city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.391 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },
  { city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
  { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { city: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
  { city: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { city: 'Amritsar', state: 'Punjab', lat: 31.634, lng: 74.8723 },
  { city: 'Ludhiana', state: 'Punjab', lat: 30.901, lng: 75.8573 },
  { city: 'Jalandhar', state: 'Punjab', lat: 31.326, lng: 75.5762 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { city: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { city: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  { city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.033, lng: 73.0297 },
  { city: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  { city: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.856 },
  { city: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.648 },
  { city: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828 },
  { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
  { city: 'Jamshedpur', state: 'Jharkhand', lat: 22.8056, lng: 86.2031 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953 },
  { city: 'Gangtok', state: 'Sikkim', lat: 27.3314, lng: 88.6138 },
  { city: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
  { city: 'Imphal', state: 'Manipur', lat: 24.817, lng: 93.9368 },
  { city: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
  { city: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lng: 74.857 },
  { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296 },
  { city: 'Bilaspur', state: 'Chhattisgarh', lat: 22.0797, lng: 82.1409 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864 }
];
