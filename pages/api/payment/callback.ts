// pages/api/payment/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 获取Creem回调数据
        const {
            order_id,
            status,
            signature,
            transaction_id,
            // 其他Creem回调参数...
        } = req.body;

        // 验证签名
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CREEM_SECRET_KEY || '')
            .update(order_id + status)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // 如果支付成功
        if (status === 'success') {
            // 查询订单信息
            const { data: payment, error: fetchError } = await supabase
                .from('payment_records')
                .select('user_id, credits, status, amount')
                .eq('id', order_id)
                .single();

            if (fetchError || !payment) {
                throw new Error('Payment record not found');
            }

            // 如果订单已处理过，直接返回成功
            if (payment.status === 'completed') {
                return res.status(200).json({ success: true });
            }

            // 开始数据库事务处理
            // 1. 更新支付记录状态
            const { error: updateError } = await supabase
                .from('payment_records')
                .update({
                    status: 'completed',
                    updated_at: new Date(),
                    creem_order_id: transaction_id || order_id
                })
                .eq('id', order_id);

            if (updateError) {
                throw updateError;
            }

            // 2. 获取用户当前点数
            const { data: userCredit, error: creditError } = await supabase
                .from('credits_balance')
                .select('credits')
                .eq('user_id', payment.user_id)
                .single();

            if (creditError && creditError.code !== 'PGRST116') { // PGRST116是未找到记录的错误码
                throw creditError;
            }

            // 3. 更新或创建用户点数记录
            const currentCredits = userCredit?.credits || 0;
            const newCredits = currentCredits + payment.credits;

            if (userCredit) {
                // 更新现有记录
                const { error: updateCreditError } = await supabase
                    .from('credits_balance')
                    .update({
                        credits: newCredits,
                        updated_at: new Date()
                    })
                    .eq('user_id', payment.user_id);

                if (updateCreditError) {
                    throw updateCreditError;
                }
            } else {
                // 创建新记录
                const { error: insertCreditError } = await supabase
                    .from('credits_balance')
                    .insert({
                        user_id: payment.user_id,
                        credits: payment.credits
                    });

                if (insertCreditError) {
                    throw insertCreditError;
                }
            }

            return res.status(200).json({ success: true });
        } else {
            // 如果支付失败，更新订单状态
            await supabase
                .from('payment_records')
                .update({ status: 'failed', updated_at: new Date() })
                .eq('id', order_id);

            return res.status(200).json({ success: false });
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}