-- 确保UUID扩展已启用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建存储验证码并清理旧验证码的函数
CREATE OR REPLACE FUNCTION save_verification_code(
  email_param TEXT,
  code_param TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- 使用创建者权限运行
SET search_path = public
AS $$
DECLARE
  new_record_id INTEGER; -- 修改为INTEGER类型以匹配SERIAL
  new_created_at TIMESTAMP;
  result JSONB;
BEGIN
  -- 获取当前时间
  new_created_at := NOW();
  
  -- 插入新验证码记录
  INSERT INTO verification_codes (email, code, created_at)
  VALUES (email_param, code_param, new_created_at)
  RETURNING id INTO new_record_id;
  
  -- 删除旧的验证码记录（保留刚刚创建的那条）
  DELETE FROM verification_codes
  WHERE email = email_param
  AND id != new_record_id;
  
  -- 返回操作结果
  RETURN jsonb_build_object(
    'success', true,
    'message', '验证码已保存并清理了旧记录',
    'record_id', new_record_id,
    'created_at', new_created_at
  );
EXCEPTION
  WHEN OTHERS THEN
    -- 发生错误时返回错误信息
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- 为函数添加注释
COMMENT ON FUNCTION save_verification_code(TEXT, TEXT) IS 
'存储验证码到数据库并清理指定邮箱的旧验证码记录，只保留最新的一条。
参数:
  email_param - 用户电子邮件
  code_param - 生成的验证码
返回:
  JSON对象包含:
  - success: 操作是否成功
  - message: 成功或错误消息
  - record_id: 新记录ID (仅成功时)
  - created_at: 创建时间 (仅成功时)
  - error_code: 错误代码 (仅失败时)'; 