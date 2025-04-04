import { supabaseAdmin } from './supabase_service';

/**
 * 检查用户是否有足够的点数
 * @param userId 用户ID
 * @param requiredCredits 需要的点数
 * @returns 是否有足够点数
 */
export async function hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    try {
        // 检查用户点数是否足够
        const { data: hasCredits, error: checkError } = await supabaseAdmin.rpc(
            'check_user_credits',
            { user_id: userId, required_amount: requiredCredits }
        );

        //console.log(`hasCredits: ${hasCredits}, checkError: ${JSON.stringify(checkError)}`);

        if (checkError || !hasCredits) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Check credits error:', error);
        return false;
    }
}

/**
 * 扣除用户点数
 * @param userId 用户ID
 * @param amount 扣除的点数
 * @param description 扣除原因
 * @returns 是否扣除成功
 */
export async function deductCredits(userId: string, amount: number, description: string): Promise<boolean> {
    try {
        const { data: deducted, error: deductError } = await supabaseAdmin.rpc(
            'deduct_user_credits',
            { user_id: userId, amount }
        );

        if (deductError || !deducted) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Deduct credits error:', error);
        return false;
    }
}