export {
  loginWithGoogle, loginWithEmailAndPassword, checkLoginStatus, logout, sendEmailVerifyCode, verifyEmailCode,
  sendResetPasswordCode, resetPassword, getCurrentUser, getAccessToken, getCredits
};

// src/supabaseClient.ts
import { type User } from '@supabase/supabase-js';
import { SINGUP_URL, VERIFY_EMAIL_URL, RESET_PASS_URL, SEND_RESETPASS_CODE_URL } from '@config';
import { supabase } from './supabase';

// 定时刷新 access_token
function autoRefreshToken() {
  // 定时任务：每隔 55 分钟刷新一次 access_token
  setInterval(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (data.session) {
        // 手动刷新 session，确保 access_token 更新
        await supabase.auth.refreshSession();
        console.log("Access token refreshed successfully");
      } else {
        console.log("No active session, skipping refresh.");
      }
    } catch (error) {
      console.error("Failed to refresh access token:", error);
    }
  }, 55 * 60 * 1000); // 55 分钟刷新一次
}

autoRefreshToken();

let currentUser: User | null = null;

async function getAccessToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (data.session) {
      console.log("Get access token success, access_token:", data.session.access_token);
      return data.session.access_token;
    } else if (error) {
      console.error("Failed to get access token:", error);
      return null;
    } else {
      console.warn("No active session, skipping refresh.");
      return null;
    }
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

async function getCurrentUser(): Promise<User> {
  if (!currentUser) {
    currentUser = await checkLoginStatus();
  }
  return currentUser;
}

// 登录函数
async function loginWithGoogle(redirectTo: string): Promise<{ user?: User, errorCode?: string }> {

  console.log('loginWithGoogle, redirectTo:', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo, // 登录成功后回到当前站点
    }
  });

  if (error) {
    console.error('Google login failed:', error.message);
    return { errorCode: error.message || 'Google login failed' };
  } else {
    console.log('Google login success, data:', JSON.stringify(data));
    return {};
  }
}

// TODO: 邮箱密码登录
async function loginWithEmailAndPassword(email: string, password: string): Promise<{ user?: User, errorCode?: string }> {
  // 邮箱密码登录
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[auth:] Sign in with password to supabase failed:', error);
      return { errorCode: error.code || error.message || 'Internal server error' };
    }
    console.log('[auth:] Sign in with password to supabase success, user:', data.user);
    return { user: data.user };
  } catch (error) {
    console.error('[auth:] Sign in with password to supabase failed:', error);
    return { errorCode: error.message || 'Internal server error' };
  }
}

// 注册
async function sendEmailVerifyCode(email: string): Promise<{ success: boolean, error?: string }> {
  try {
    const response = await fetch(SINGUP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });
    if (response.ok) {
      console.log('send verify code success');
      return { success: true };
    } else if (response.status === 400) {
      console.error('signup failed: 400, Email cannot use or has been registered');
      return { success: false, error: 'Email address not available or has been registered, please use another.' };
    } else if (response.status === 429) {
      console.error('signup failed: 429, Too many requests');
      return { success: false, error: 'Sending verification code too frequently, please wait 1 minute before trying again' };
    } else {
      console.error('signup failed:', response.status, response.statusText);
      return { success: false, error: "Oops, send verify code failed, please try again later" };
    }
  } catch (error) {
    console.error('send verify code failed:', error);
    return { success: false, error: "Oops, send verify code failed, please try again later" };
  }
}

/**
 * 发送重置密码验证码
 * 
 * @param email 
 * @returns 
 */
// TODO
async function sendResetPasswordCode(email: string): Promise<{ success: boolean, error?: string }> {
  try {
    const response = await fetch(SEND_RESETPASS_CODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });
    if (response.ok) {
      console.log('send verify code success');
      return { success: true };
    } else if (response.status === 400) {
      console.error('signup failed: 400, Email not registered');
      return { success: false, error: 'Email address not registered, please register first.' };
    } else if (response.status === 429) {
      console.error('signup failed: 429, Too many requests');
      return { success: false, error: 'Sending verification code too frequently, please wait 1 minute before trying again' };
    } else {
      console.error('signup failed:', response.status, response.statusText);
      return { success: false, error: "Oops, send verify code failed, please try again later" };
    }
  } catch (error) {
    console.error('send verify code failed:', error);
    return { success: false, error: "Oops, send verify code failed, please try again later" };
  }
}

/**
 * 重设密码
 * @param email 
 * @param password 
 * @param code 
 * @returns 
 */
// TODO
async function resetPassword(email: string, password: string, code: string): Promise<{ success: boolean, error?: string }> {
  const response = await fetch(RESET_PASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      code
    })
  });
  if (response.ok) {
    console.log('reset password success');
    return { success: true };
  } else if (response.status === 400) {
    console.error('reset password failed: 400, Invalid or expired code');
    return { success: false, error: 'Invalid or expired code' };
  } else {
    console.error('reset password failed:', response.status, response.statusText);
    return { success: false, error: "Oops, reset password failed, please try again later" };
  }
}

// 验证邮箱
async function verifyEmailCode(email: string, password: string, code: string): Promise<{ success: boolean, error?: string }> {
  const response = await fetch(VERIFY_EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      code
    })
  });
  if (response.ok) {
    console.log('signup success');
    return { success: true };
  } else if (response.status === 400) {
    console.error('signup failed: 400, Invalid or expired code');
    return { success: false, error: 'Invalid or expired code' };
  } else {
    console.error('signup failed:', response.status, response.statusText);
    return { success: false, error: "Oops, verify email failed, please try again later" };
  }
}

// 检查登录状态
async function checkLoginStatus(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Get user failed:', error);
    currentUser = null;
    throw error;
  } else {
    currentUser = data.user;
    return data.user;
  }
}

// 登出函数
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

// 获取用户当前点数
async function getCredits(): Promise<number> {
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError) throw getUserError;

  const { data: credits, error: fetcheError } = await supabase
    .from('credits_balance')
    .select('credits')
    .eq('user_id', user.id)
    .limit(1);

  if (fetcheError) throw fetcheError;

  if (!credits || credits.length === 0) {
    return 0; // 用户没有点数记录时返回0
  }
  return credits[0].credits;
}

interface CreditTransaction {
  id: string,
  user_id: string,
  amount: number,
  type: 'purchase' | 'consume' | 'initial_grant',
  description: string,
  created_at: Date
}

// 获取用户点数交易记录，包括充值和消耗的，以及系统赠送的
// async function getCreditTransactions(page: number, limit: number): Promise<CreditTransaction[]> {
//   const { data: { user }, error: getUserError } = await supabase.auth.getUser();

//   if (getUserError) throw getUserError;

//   const { data: credits, error: fetcheError } = await supabase
//     .from('credit_transactions')
//     .select('id, user_id, amount, type, description, created_at')
//     .eq('user_id', user.id)
//     .order('created_at', { ascending: false })
//     .limit(limit);

//   if (fetcheError) throw fetcheError;

//   if (!credits || credits.length === 0) {
//     throw new Error('User credits not found');
//   }
//   return credits[0].credits;
// }