export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

export const getOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5); // 5 minutes validity
  return expiry;
};
