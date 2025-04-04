// pages/api/payment/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { order_id } = req.query;

        // 验证用户会话
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 查询订单状态
        const { data: payment, error } = await supabase
            .from('payment_records')
            .select('status, credits')
            .eq('id', order_id)
            .eq('user_id', session.user.id)
            .single();

        if (error) {
            throw error;
        }

        return res.status(200).json({ payment });
    } catch (error) {
        console.error('Payment status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}