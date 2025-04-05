import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get JWT token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No valid authorization token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT token and get user info
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth error:', authError);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // 查询用户当前点数
        const { data: userCredit, error: creditError } = await supabase
            .from('credits_balance')
            .select('credits')
            .eq('user_id', user.id)
            .single();

        // 模拟网络延迟 (1-2秒)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // 如果用户没有点数记录，创建一个
        if (creditError && creditError.code === 'PGRST116') {
            const { error: insertError } = await supabase
                .from('credits_balance')
                .insert({
                    user_id: user.id,
                    credits: 10
                });

            if (insertError) {
                throw insertError;
            }

            // 创建一条赠送记录
            await supabase
                .from('payment_records')
                .insert({
                    user_id: user.id,
                    plan_id: 'free_gift',
                    amount: 0,
                    credits: 10,
                    status: 'completed'
                });

            return res.status(200).json({ success: true, credits: 10 });
        }

        // 增加10点数
        if (userCredit) {
            const newCredits = userCredit.credits + 10;
            const { error: updateError } = await supabase
                .from('credits_balance')
                .update({
                    credits: newCredits,
                    updated_at: new Date()
                })
                .eq('user_id', user.id);

            if (updateError) {
                throw updateError;
            }

            // 创建一条赠送记录
            await supabase
                .from('payment_records')
                .insert({
                    user_id: user.id,
                    plan_id: 'free_gift',
                    amount: 0,
                    credits: 10,
                    status: 'completed'
                });

            return res.status(200).json({ success: true, credits: newCredits });
        }

        throw new Error('Failed to update user credits');
    } catch (error) {
        console.error('Free credits error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 