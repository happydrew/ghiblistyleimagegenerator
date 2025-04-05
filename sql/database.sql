-- 创建用户点数余额表
CREATE TABLE public.credits_balance (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建支付记录表
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  creem_order_id VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE public.credits_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的点数余额
CREATE POLICY "Users can view their own balance" 
  ON public.credits_balance 
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view their own payment records" 
  ON public.payment_records 
  FOR SELECT USING (auth.uid() = user_id);


-- 创建一个事务函数来扣除用户点数
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  user_id UUID,
  amount INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INT;
BEGIN
  -- 开始事务
  BEGIN
    -- 查询当前点数，并锁定行防止并发修改
    SELECT credits INTO current_credits
    FROM credits_balance
    WHERE user_id = deduct_user_credits.user_id
    FOR UPDATE;
    
    -- 检查是否有足够的点数
    IF current_credits IS NULL OR current_credits < amount THEN
      RETURN FALSE;
    END IF;
    
    -- 更新点数
    UPDATE credits_balance
    SET 
      credits = current_credits - amount,
      updated_at = NOW()
    WHERE user_id = deduct_user_credits.user_id;

    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error deducting credits: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$;

-- 设置权限
GRANT EXECUTE ON FUNCTION public.deduct_user_credits TO service_role;


-- 检查点数函数
CREATE OR REPLACE FUNCTION public.check_user_credits(
  user_id UUID,
  required_amount INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_credits INT;
BEGIN
  SELECT credits INTO user_credits
  FROM credits_balance
  WHERE user_id = check_user_credits.user_id;
  
  RETURN user_credits IS NOT NULL AND user_credits >= required_amount;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_credits TO service_role;


-- 创建名为 verification_codes 的表
CREATE TABLE verification_codes (
    id SERIAL PRIMARY KEY,              -- 唯一标识符
    email VARCHAR(255),                 -- 用户邮箱，用于未注册用户的验证码发送
    password VARCHAR(255),              -- 密码
    code VARCHAR(6) NOT NULL,           -- 验证码
    created_at TIMESTAMP DEFAULT NOW(), -- 生成时间
    is_used BOOLEAN DEFAULT FALSE       -- 验证码是否已使用
);


-- 为了提高查询速度，可以在 email 和 code 上创建索引
CREATE INDEX idx_verification_email_code ON verification_codes(email, code);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;


-- 允许 service_role 进行 SELECT 操作
CREATE POLICY service_role_policy ON verification_codes
  FOR SELECT
  TO service_role
  USING (true);


-- 允许 service_role 进行 INSERT 操作
create policy "Users can create a profile." on verification_codes 
for insert
to service_role                          -- the Postgres Role (recommended)
with check ( (select auth.role()) = 'service_role' );


-- 允许 service_role 进行 UPDATE 操作
CREATE POLICY "Allow service_role update" ON verification_codes
FOR UPDATE
TO service_role
USING (true); -- 这里的 CHECK 子句也是可选的


-- 允许 service_role 进行 DELETE 操作
CREATE POLICY "Allow service_role delete" ON verification_codes
FOR DELETE
TO service_role
USING (true);


-- 创建函数：根据email查找user_id
CREATE OR REPLACE FUNCTION get_user_id_by_email(email TEXT)
RETURNS TABLE (id uuid)
SECURITY definer
AS $$
BEGIN
  RETURN QUERY SELECT au.id FROM auth.users au WHERE au.email = $1;
END;
$$ LANGUAGE plpgsql;


-- 创建函数：检测email是否已经注册过
CREATE OR REPLACE FUNCTION check_email_exists(input_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- 查询是否有该 email
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = input_email
    ) INTO user_exists;

    -- 返回查询结果
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 创建函数：检测user_id是否存在
CREATE OR REPLACE FUNCTION check_user_id_exists(input_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- 查询是否有该 user_id
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE user_id = input_user_id
    ) INTO user_exists;

    -- 返回查询结果
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;