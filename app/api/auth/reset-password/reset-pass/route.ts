import { supabaseAdmin } from '@lib/supabase_service';
import { VERIFICATION_CODE_EXPIRE_MINUTES } from '@config_back';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { email, password, code } = await request.json();
  console.log('Reset password request', email, password, code);

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

  // 查找用户id
  const { data: userIdData, error: getIdError } = await supabaseAdmin.rpc('get_user_id_by_email', { email });

  if (getIdError) {
    console.error('Failed to get user id by email', email, getIdError);
    return new Response('Failed to get user id', { status: 500 });
  }

  if (!userIdData || userIdData.length === 0) {
    console.warn(`User not found for email: ${email}, this should not happen`);
    return new Response(`User not found for email ${email}`, { status: 500 });
  }

  const userId = userIdData[0].id;
  console.log('User id found for email', email, userId);

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });

  if (updateError) {
    console.error('Failed to update password for user', email, updateError);
    return new Response('Failed to update password', { status: 500 });
  }

  console.log('Password updated for user', email);
  return new Response('Password updated', { status: 200 });
}
