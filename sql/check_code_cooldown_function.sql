-- 创建检查验证码发送冷却时间的函数
CREATE OR REPLACE FUNCTION check_code_cooldown(
  email_param TEXT,
  cooldown_minutes INTEGER DEFAULT 1 -- 默认冷却时间1分钟
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- 使用创建者权限运行
SET search_path = public
AS $$
DECLARE
  recent_code RECORD;
  now_time TIMESTAMP;
  time_diff INTERVAL;
  result JSONB;
BEGIN
  -- 当前时间
  now_time := NOW();
  
  -- 查找最近的验证码记录
  SELECT * INTO recent_code 
  FROM verification_codes
  WHERE email = email_param
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- 如果没有找到记录，可以发送
  IF recent_code IS NULL THEN
    RETURN jsonb_build_object(
      'can_send', true
    );
  END IF;
  
  -- 计算时间差
  time_diff := now_time - recent_code.created_at;
  
  -- 检查是否在冷却期内
  IF EXTRACT(EPOCH FROM time_diff) < (cooldown_minutes * 60) THEN
    -- 还在冷却期内，计算剩余时间（秒）
    RETURN jsonb_build_object(
      'can_send', false,
      'cooldown_remaining_seconds', (cooldown_minutes * 60) - EXTRACT(EPOCH FROM time_diff)::INTEGER,
      'last_sent_at', recent_code.created_at
    );
  END IF;
  
  -- 冷却期已过，可以发送
  RETURN jsonb_build_object(
    'can_send', true
  );
END;
$$;

-- 为函数添加注释
COMMENT ON FUNCTION check_code_cooldown(TEXT, INTEGER) IS 
'检查邮箱最近是否发送过验证码，实现发送冷却时间限制。
参数:
  email_param - 用户电子邮件
  cooldown_minutes - 冷却时间（分钟）
返回:
  JSON对象包含:
  - can_send: 是否可以发送新验证码
  - cooldown_remaining_seconds: 剩余冷却时间（秒，仅当can_send为false时）
  - last_sent_at: 上次发送时间（仅当can_send为false时）'; 