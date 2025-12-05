export const validateCCCD = (cccd) => {
  // 1. Chỉ chứa số
  if (!/^\d+$/.test(cccd)) return false;

  // 2. Đúng 12 ký tự
  if (cccd.length !== 12) return false;

  // 3. Không cho dãy toàn số 0
  if (/^0+$/.test(cccd)) return false;

  // 4. Không cho dãy 12 chữ số giống nhau 
  if (/^(\d)\1{11}$/.test(cccd)) return false;

  return true;
};
