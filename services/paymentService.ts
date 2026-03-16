
export interface PaymentSessionResponse {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string;
  message: string;
}

export const paymentService = {
  /**
   * Simulates initiating a payment with a third-party API
   */
  initiateAutomatedPayment: async (
    methodId: string,
    amount: number,
    config: { 
      publicKey?: string; 
      secretKey?: string;
      merchantId?: string; 
      webhookUrl?: string;
      type: 'bank' | 'crypto' 
    }
  ): Promise<PaymentSessionResponse> => {
    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!config.publicKey || !config.merchantId) {
      return {
        success: false,
        message: "API Configuration missing. Please contact the administrator to set up Public Key and Merchant ID."
      };
    }

    // Mock validation logic
    if (amount <= 0) {
      return { success: false, message: "Invalid amount." };
    }

    return {
      success: true,
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      checkoutUrl: `https://checkout.nettoolz.com/pay/${methodId}`,
      message: "Payment session generated successfully."
    };
  },

  /**
   * Initiates a direct checkout payment for a cart/order
   */
  initiateDirectCheckout: async (
    amount: number,
    orderData: any,
    config: { 
      publicKey?: string; 
      merchantId?: string;
      methodId: string;
    }
  ): Promise<PaymentSessionResponse> => {
    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!config.publicKey || !config.merchantId) {
      return {
        success: false,
        message: "Gateway configuration missing. Please contact support."
      };
    }

    return {
      success: true,
      transactionId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      checkoutUrl: `https://checkout.nettoolz.com/checkout/${config.methodId}?amt=${amount}`,
      message: "Order payment session generated."
    };
  },

  /**
   * Simulates the webhook/callback that confirms payment
   */
  verifyPayment: async (transactionId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, this would query the gateway status
    return true; 
  }
};
