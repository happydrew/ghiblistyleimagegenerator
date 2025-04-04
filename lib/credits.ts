import {  supabase } from './supabase';

/**
 * 获取用户的点数余额
 * @param userId 用户ID
 * @returns 用户点数
 */
export async function getUserCredits(userId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('credits_balance')
            .select('credits')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Get user credits error:', error);
            return 0;
        }

        return data ? data.credits : 0;
    } catch (error) {
        console.error('Get user credits error:', error);
        return 0;
    }
}

/**
 * 获取用户支付记录
 * @param userId 用户ID
 * @param limit 限制数量
 * @param offset 偏移量（分页）
 * @returns 支付记录列表
 */
export async function getUserPaymentRecords(userId: string, limit = 10, offset = 0) {
    try {
        const { data, error } = await supabase
            .from('payment_records')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Get payment records error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get payment records error:', error);
        return [];
    }
} 