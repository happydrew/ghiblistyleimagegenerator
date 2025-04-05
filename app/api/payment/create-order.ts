// pages/api/payment/create-order.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Creem产品ID映射
const creem_products = {
  standard: {
    creem_product_id: "prod_2vLkQeIj7OLZz4FJTnw9sF",
    amount: 4.49,
    credits: 50,
  }
  // 添加更多套餐对应的产品ID
};

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

    // Get request body
    const { planId } = req.body;

    if (!planId || !creem_products[planId]) {
      return res.status(400).json({ error: 'Missing or invalid plan ID!' });
    }

    // Generate unique order ID
    const orderId = uuidv4();

    const product = creem_products[planId];

    // Create payment record
    const { error: insertError } = await supabase
      .from('payment_records')
      .insert({
        id: orderId,
        user_id: user.id,
        plan_id: planId,
        amount: product.amount,
        credits: product.credits,
        status: 'pending',
      });

    if (insertError) {
      throw insertError;
    }

    // fetch Creem payment URL
    const response = await fetch('https://api.creem.io/v1/checkouts',{
      method: 'POST',
      headers: {
        "x-api-key": `${process.env.CREEM_API_KEY}`
      },
      body: JSON.stringify({
        product_id: product.creem_product_id,
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    const paymentUrl = await response.text();

    return res.status(200).json({ paymentUrl });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}