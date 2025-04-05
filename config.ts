export {
    extractFormDataUrl, SINGUP_URL, VERIFY_EMAIL_URL, SUPABASE_URL, SUPABASE_ANON_KEY,
    SEND_RESETPASS_CODE_URL, RESET_PASS_URL, GIVE_FREE_CREDITS_URL, CREEM_API_KEY, CREEM_API_URL,
    PAYMENT_CALLBACK_URL, PAYMENT_RETURN_URL
};

const backEnd = 'https://autoformai-api.floxai.top';
const extractFormDataUrl = `${backEnd}/api/extractFormData`;
const SINGUP_URL = `${backEnd}/api/auth/signup`;
const VERIFY_EMAIL_URL = `${backEnd}/api/auth/verify-email`;
const SEND_RESETPASS_CODE_URL = `${backEnd}/api/auth/reset-password/send-code`;
const RESET_PASS_URL = `${backEnd}/api/auth/reset-password/reset-pass`;
const GIVE_FREE_CREDITS_URL = `${backEnd}/api/payment/giveFreeCredits`;

const SUPABASE_URL = 'https://xoirjktingupbntqquex.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaXJqa3Rpbmd1cGJudHFxdWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4Njc1ODMsImV4cCI6MjA0NTQ0MzU4M30.Dw_Vz2J43sLra9PIg_mZu5pmxqsifXZ1q19AhOlOzEM'

// creem payment
const CREEM_API_KEY = process.env.CREEM_API_KEY || '';
const CREEM_API_URL = 'https://api.creem.io/v1';
const PAYMENT_CALLBACK_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/callback`;
const PAYMENT_RETURN_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success`;

