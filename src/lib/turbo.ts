import { TurboFactory, ArconnectSigner } from '@ardrive/turbo-sdk';

export const initializeTurboWithWalletKit = async (api: any, connected: boolean) => {
  if (!connected || !api) {
    return { turbo: TurboFactory.unauthenticated(), authenticated: false };
  }

  try {
    let signer;
    
    // Handle different wallet strategies
    if (api.getArweaveSigner) {
      signer = api.getArweaveSigner();
    } else if (api.id?.startsWith("wauth")) {
      signer = api.getAoSigner();
    } else {
      signer = new ArconnectSigner(api);
    }

    const turbo = TurboFactory.authenticated({ signer });
    return { turbo, authenticated: true };

  } catch (error) {
    console.error('Failed to create authenticated Turbo client:', error);
    return { turbo: TurboFactory.unauthenticated(), authenticated: false };
  }
};
