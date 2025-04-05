import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@lib/supabase_service';
import { APP_NAME, VERIFICATION_CODE_EXPIRE_MINUTES, GMAIL_USER, GMAIL_PASS } from '@config_back';
import { generateVerificationCode } from '@lib/utils';
import { ProxyAgent } from 'proxy-agent';

export const runtime = 'nodejs'; // 'nodejs' or 'edge'

// HTTP 代理
const proxyAgent = new ProxyAgent({ host: '127.0.0.1', port: 7890 });

const COOLDOWN_MINUTES = 1;

export async function POST(request) {
  const { email } = await request.json();
  console.log('Received email:', email);

  // 检查邮箱是否已注册
  const { data: emailExists, error: checkEmailError } = await supabaseAdmin.rpc('check_email_exists', { input_email: email });

  if (checkEmailError) {
    console.error('Failed to check email', checkEmailError);
    return new Response('Failed to check email', { status: 500 });
  } else if (emailExists) {
    console.log('Email already registered');
    return new Response('Email already registered', { status: 400 });
  }
  console.log('Email not registered, contine with sending verification code');

  // 使用数据库函数检查冷却时间
  const { data: cooldownCheck, error: cooldownError } = await supabaseAdmin.rpc('check_code_cooldown', {
    email_param: email,
    cooldown_minutes: COOLDOWN_MINUTES
  });

  if (cooldownError) {
    console.error('Failed to check code cooldown', cooldownError);
    return new Response('Failed to check sending frequency', { status: 500 });
  }

  // 检查是否可以发送验证码
  if (!cooldownCheck.can_send) {
    const remainingSeconds = Math.ceil(cooldownCheck.cooldown_remaining_seconds);
    console.log(`Sending verification code too frequently, please wait ${remainingSeconds} seconds before trying again`);
    return new Response(`Sending verification code too frequently, please wait ${Math.ceil(remainingSeconds / 60)} minute before trying again`, { status: 429 }); // 请求过于频繁
  }

  // 生成验证码
  const verificationCode = generateVerificationCode();
  console.log('Generated verification code:', verificationCode);

  // 创建 Nodemailer transporter（使用 Gmail SMTP）
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    //service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    pooled: true,
    socketTimeout: 30000,
    // 使用代理
    proxy: proxyAgent
  });

  // 发送验证码邮件
  await transporter.sendMail({
    from: GMAIL_USER,
    to: email,
    subject: `[${APP_NAME}] - Verification Code`,
    html: getEmailContent(verificationCode, VERIFICATION_CODE_EXPIRE_MINUTES),
  });

  // 使用数据库函数存储验证码并清理旧记录
  const { data: saveResult, error: saveError } = await supabaseAdmin.rpc('save_verification_code', {
    email_param: email,
    code_param: verificationCode
  });

  if (saveError || !saveResult.success) {
    console.error('Failed to store verification code', saveError || saveResult.message);
    return new Response('Failed to store verification code', { status: 500 });
  }
  console.log('Verification code stored and old codes cleaned up');

  console.log('Verification code sent');
  return new Response('Verification code sent', { status: 200 });
}

function getEmailContent(code: string, expires_in_minutes: number) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
            color: #333;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }

        p {
            line-height: 1.6;
        }

        .code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            padding: 10px;
            border: 1px solid #007bff;
            border-radius: 4px;
            display: inline-block;
        }

        footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Welcome to ${APP_NAME}!</h1>
        <p>Thank you for signing up with ${APP_NAME}. Here is your verification code:</p>
        <p>Code: <span class="code">${code}</span></p>
        <p>Please enter this code within ${expires_in_minutes} minutes to complete your registration. If you did not
            request this code, please disregard this email.</p>
        <footer>
            <p>Best regards,</p>
            <p>The ${APP_NAME} Team</p>
        </footer>
    </div>
</body>

</html>`;
}
