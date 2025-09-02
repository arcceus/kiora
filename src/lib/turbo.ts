import { TurboFactory, ArconnectSigner } from '@ardrive/turbo-sdk/web';

export const initializeTurboWithWalletKit = async (api: any, connected: boolean) => {
  if (!connected || !api) {
    return { turbo: TurboFactory.unauthenticated(), authenticated: false };
  }

  try {
    let signer;

    // Prefer explicit signer getters from the active strategy/api if available
    if (typeof api.getArweaveSigner === 'function') {
      signer = await api.getArweaveSigner();
    } else if (typeof api.getSigner === 'function') {
      signer = await api.getSigner();
    } else if (api.id?.startsWith("wauth") && typeof api.getAoSigner === 'function') {
      signer = api.getAoSigner();
    } else if (typeof window !== 'undefined' && (window as any).arweaveWallet) {
      // Use existing ArConnect session without forcing a new connect prompt
      signer = new ArconnectSigner((window as any).arweaveWallet);
    } else {
      // No signer available
      return { turbo: TurboFactory.unauthenticated(), authenticated: false };
    }

    const turbo = TurboFactory.authenticated({ signer });
    return { turbo, authenticated: true };

  } catch (error) {
    console.error('Failed to create authenticated Turbo client:', error);
    return { turbo: TurboFactory.unauthenticated(), authenticated: false };
  }
};
