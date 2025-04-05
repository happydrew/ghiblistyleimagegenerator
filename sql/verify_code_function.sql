-- 创建验证验证码的函数
CREATE OR REPLACE FUNCTION verify_and_delete_code(
  email_param TEXT,
  code_param TEXT,
  expire_minutes INTEGER DEFAULT 10 -- 默认10分钟过期
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- 使用创建者权限运行
SET search_path = public
AS $$
DECLARE
  found_code RECORD;
  now_time TIMESTAMP;
  result JSONB;
BEGIN
  -- 当前时间
  now_time := NOW();
  
  -- 查找验证码
  SELECT * INTO found_code 
  FROM verification_codes
  WHERE email = email_param
  AND code = code_param
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- 无论如何，验证后都删除该验证码
  DELETE FROM verification_codes 
  WHERE email = email_param
  AND code = code_param;
  
  -- 检查是否找到验证码
  IF found_code IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid verification code',
      'code', 'invalid_code'
    );
  END IF;
  
  -- 检查验证码是否过期
  IF (now_time - found_code.created_at) > (expire_minutes * INTERVAL '1 minute') THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Verification code has expired',
      'code', 'expired_code'
    );
  END IF;
  
  -- 验证成功
  RETURN jsonb_build_object(
    'success', true,
    'email', email_param
  );
END;
$$;

-- 为函数添加注释
COMMENT ON FUNCTION verify_and_delete_code(TEXT, TEXT, INTEGER) IS 
'验证用户提供的验证码是否有效。
参数:
  email_param - 用户电子邮件
  code_param - 验证码
  expire_minutes - 验证码有效期（分钟）
返回:
  JSON包含验证结果和相关信息
注意:
  无论验证码是否有效或过期，验证后都会删除该验证码'; 