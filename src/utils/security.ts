// Security & Encryption Utilities for Court Portal

/**
 * Generate SHA-256 hash for document verification
 */
export const generateHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Verify document hash
 */
export const verifyHash = async (data: string, expectedHash: string): Promise<boolean> => {
  const actualHash = await generateHash(data);
  return actualHash === expectedHash;
};

/**
 * Generate unique signature ID
 */
export const generateSignatureId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `SIG-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate unique notice number
 */
export const generateNoticeNumber = (
  courtCode: string,
  noticeType: string,
  year: number = new Date().getFullYear()
): string => {
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const typeCode = noticeType.substring(0, 3).toUpperCase();
  return `${courtCode}/${typeCode}/${year}/${random}`;
};

/**
 * Generate case number
 */
export const generateCaseNumber = (
  courtCode: string,
  caseType: string,
  year: number = new Date().getFullYear()
): string => {
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  const typeCode = caseType.substring(0, 2).toUpperCase();
  return `${typeCode}-${courtCode}-${random}/${year}`;
};

/**
 * Encrypt sensitive data (client-side encryption)
 */
export const encryptData = async (data: string, key: string): Promise<string> => {
  try {
    // Using Web Crypto API for encryption
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(key.padEnd(32, '0').substring(0, 32));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(key.padEnd(32, '0').substring(0, 32));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[91]?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Mask sensitive data (e.g., phone, email)
 */
export const maskPhone = (phone: string): string => {
  if (phone.length < 10) return phone;
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3');
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (name.length <= 3) return email;
  const maskedName = name[0] + '****' + name[name.length - 1];
  return `${maskedName}@${domain}`;
};

/**
 * Get device fingerprint for audit logs
 */
export const getDeviceInfo = (): string => {
  const { userAgent, platform, language } = navigator;
  return JSON.stringify({
    userAgent,
    platform,
    language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

/**
 * Get client IP address (requires backend API)
 */
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Log security event for audit trail
 */
export interface SecurityLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  deviceInfo: string;
  success: boolean;
  errorMessage?: string;
}

export const logSecurityEvent = async (log: SecurityLog): Promise<void> => {
  // Send to backend for secure storage
  console.log('Security Event:', log);
  // TODO: Implement backend API call
  // await fetch('/api/security/log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(log),
  // });
};

/**
 * Check if user session is still valid
 */
export const validateSession = async (userId: string): Promise<boolean> => {
  // TODO: Implement session validation with backend
  return true;
};

/**
 * Rate limiting check (client-side)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate file upload (security checks)
 */
export const validateFileUpload = (
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
): { valid: boolean; error?: string } => {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeExtensionMap: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  };
  
  const expectedExtensions = mimeExtensionMap[file.type] || [];
  if (extension && !expectedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' };
  }
  
  return { valid: true };
};

/**
 * Redact sensitive information from text
 */
export const redactSensitiveInfo = (text: string): string => {
  // Redact phone numbers
  let redacted = text.replace(/\b\d{10}\b/g, '**********');
  
  // Redact email addresses
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '****@****.***');
  
  // Redact Aadhaar numbers
  redacted = redacted.replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '**** **** ****');
  
  // Redact PAN numbers
  redacted = redacted.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '*****0000*');
  
  return redacted;
};
