export {};

declare global {
  interface Window {
    OpenPay: {
      setId: (merchantId: string) => void;

      setApiKey: (publicKey: string) => void;

      setSandboxMode: (sandbox: boolean) => void;

      deviceData: {
        setup: (
          formId?: string,
          hiddenFieldName?: string
        ) => string;
      };

      token: {
        create: (
          cardData: {
            card_number: string;
            holder_name: string;
            expiration_year: string;
            expiration_month: string;
            cvv2: string;
          },

          success: (response: {
            data: {
              id: string;
              card?: {
                card_number?: string;
                holder_name?: string;
                brand?: string;
              };
            };
          }) => void,

          error: (response: {
            data?: {
              description?: string;
              message?: string;
              error_code?: number | string;
            };
            message?: string;
          }) => void

        ) => void;
      };
    };
  }
}