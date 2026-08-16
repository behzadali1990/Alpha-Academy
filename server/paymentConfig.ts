import fs from 'fs';
import path from 'path';

export interface ServerFIBMerchantConfig {
  merchant_name: string;
  account_number: string;
  account_holder: string;
  iban: string;
  notes_kurdish: string;
  currency: string;
  is_active: boolean;
  // Private server-only payment gateway credentials
  merchant_id?: string;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
}

export interface SafeFIBPublicConfig {
  account_number: string;
  account_holder: string;
  iban: string;
  notes_kurdish: string;
  currency: string;
  is_active: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FIB_SETTINGS_FILE = path.join(DATA_DIR, 'fib_settings.json');

const DEFAULT_SERVER_FIB_CONFIG: ServerFIBMerchantConfig = {
  merchant_name: 'Alpha Academy (ئەکادیمیایا ئەلفا)',
  account_number: '0750 426 0155',
  account_holder: 'ئەکادیمیایا ئەلفا (Alpha Academy)',
  iban: 'IQ88FIBK0000000000882041',
  notes_kurdish: 'تکایە پشتی هنارتنا پارەی، وێنەیێ پسوولەیێ ل فایبەر یان واتسئاپ بۆ مە بهنێرە دا هەژمارا تە زوو بهێتە چالاککرن.',
  currency: 'IQD',
  is_active: true,
  merchant_id: process.env.FIB_MERCHANT_ID || 'fib_mch_alpha_2026',
  client_id: process.env.FIB_CLIENT_ID || 'fib_client_alpha_prod',
  client_secret: process.env.FIB_CLIENT_SECRET || '',
  webhook_secret: process.env.FIB_WEBHOOK_SECRET || ''
};

export function loadServerFibConfig(): ServerFIBMerchantConfig {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FIB_SETTINGS_FILE)) {
      const data = fs.readFileSync(FIB_SETTINGS_FILE, 'utf8');
      if (data.trim()) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SERVER_FIB_CONFIG, ...parsed };
      }
    }
    saveServerFibConfig(DEFAULT_SERVER_FIB_CONFIG);
    return DEFAULT_SERVER_FIB_CONFIG;
  } catch (err) {
    console.error('Failed to load FIB server config:', err);
    return DEFAULT_SERVER_FIB_CONFIG;
  }
}

export function saveServerFibConfig(config: Partial<ServerFIBMerchantConfig>): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = loadServerFibConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(FIB_SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save FIB server config:', err);
    return false;
  }
}

export function getSafePublicFibConfig(): SafeFIBPublicConfig {
  const serverConfig = loadServerFibConfig();
  // Strip all sensitive merchant credentials and internal gateway secrets
  return {
    account_number: serverConfig.account_number,
    account_holder: serverConfig.account_holder,
    iban: serverConfig.iban,
    notes_kurdish: serverConfig.notes_kurdish,
    currency: serverConfig.currency || 'IQD',
    is_active: serverConfig.is_active ?? true
  };
}
