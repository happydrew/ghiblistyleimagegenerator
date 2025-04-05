import { supabaseAdmin } from '@lib/supabase_service';
import { VERIFICATION_CODE_EXPIRE_MINUTES } from '@config_back';

export const runtime = 'edge';

export async function POST(request) {
    const { email, password, code } = await request.json();
    console.log('Verify email request', email, password, code);

    if (!email || !password || !code) {
        console.error('Invalid request', email, password, code);
        return new Response('Invalid request', { status: 400 });
    }

    // 使用数据库函数验证验证码
    const { data: verifyResult, error: verifyError } = await supabaseAdmin.rpc('verify_and_delete_code', {
        email_param: email,
        code_param: code,
        expire_minutes: VERIFICATION_CODE_EXPIRE_MINUTES
    });

    if (verifyError || !verifyResult || !verifyResult.success) {
        console.error('Verification failed:', verifyError || verifyResult?.error);
        return new Response(verifyResult?.error || 'Invalid or expired code', { status: 400 });
    }

    // 用户注册 (无需验证邮件)
    const { data: user, error: signupError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true  // 直接确认邮箱，无需验证邮件
    });

    if (signupError) {
        console.error('Failed to register user', signupError);
        return new Response('Failed to register user', { status: 500 });
    }

    console.log('User registered successfully', email);
    return new Response('User registered successfully', { status: 200 });
}
