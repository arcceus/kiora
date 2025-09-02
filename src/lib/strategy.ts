import WAuthStrategy, { WAuthProviders } from "@wauth/strategy";

const strategies: { [key: string]: WAuthStrategy } = {
    [WAuthProviders.Google]: new WAuthStrategy({ provider: WAuthProviders.Google }),
    [WAuthProviders.Github]: new WAuthStrategy({ provider: WAuthProviders.Github }),
    [WAuthProviders.Discord]: new WAuthStrategy({ provider: WAuthProviders.Discord })
}

export function getStrategy(provider: WAuthProviders): WAuthStrategy {
    return strategies[provider]
}