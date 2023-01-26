import React from "react";
import {
    RainbowKitProvider,
    getDefaultWallets,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {configureChains, createClient, WagmiConfig} from 'wagmi';
import {mainnet, goerli, polygon} from 'wagmi/chains';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import Layout from "./Layout";

const {chains, provider, webSocketProvider} = configureChains(
    [
        mainnet,
        polygon,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS == 'true'
            ? [goerli]
            : []),
    ],
    [
        alchemyProvider({apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY_MAINNET || ''}),
        alchemyProvider({apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY_POLYGON || ''}),
        alchemyProvider({apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY_GOERLI || ''}),
        publicProvider(),
    ]
);

const {wallets} = getDefaultWallets({
    appName: 'Superhedge demo',
    chains,
});

const demoAppInfo = {
    appName: 'Superhedge Demo',
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'Other',
        wallets: [
            argentWallet({chains}),
            trustWallet({chains}),
            ledgerWallet({chains}),
        ],
    },
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider,
});

type AppProps = {
    children?: React.ReactNode
}

function App({children}: AppProps) {
    return (
        <React.StrictMode>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
                    <Layout>{children}</Layout>
                </RainbowKitProvider>
            </WagmiConfig>
        </React.StrictMode>
    );
}

export default App;
