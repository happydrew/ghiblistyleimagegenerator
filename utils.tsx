export { wait, isValidNumber, validEmailFormat, validatePasswordStrengthMid ,validYoutubeUrl};

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isValidNumber(num: any) {
  return typeof num === 'number' && Number.isFinite(num)
}

function validEmailFormat(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validYoutubeUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]{11})(&t=([0-9]+m[0-9]+s))?$/;
  return regex.test(url);
}

/**
 * 校验密码强度，使用最大强度校验
 * 密码长度至少8位，包含至少一个大写字母，一个小写字母，一个数字，一个特殊字符
 * @param password 
 * @returns 
 */
function validatePasswordStrengthMax(password: string): { valid: boolean, message: string } {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (!hasUpperCase) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!hasLowerCase) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!hasNumber) {
    return { valid: false, message: "Password must contain at least one number." };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: "Password must contain at least one special character." };
  }

  return { valid: true, message: "Password is strong." };
}

/**
 * 校验密码强度，使用中等强度校验
 * 密码长度至少8位，包含至少一个字母，一个数字
 * @param password 
 * @returns 
 */
function validatePasswordStrengthMid(password: string): { valid: boolean, message: string } {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (!hasUpperCase && !hasLowerCase) {
    return { valid: false, message: "Password must contain at least one letter." };
  }
  if (!hasNumber) {
    return { valid: false, message: "Password must contain at least one number." };
  }

  return { valid: true, message: "Password is strong." };
}