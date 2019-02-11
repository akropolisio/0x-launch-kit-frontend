import { BigNumber, OrderStatus } from '0x.js';
import { createSelector } from 'reselect';

import { OrderBook, StoreState, UIOrderSide } from '../util/types';
import { mergeByPrice } from '../util/ui_orders';

export const getEthAccount = (state: StoreState) => state.blockchain.ethAccount;
export const getKnownTokens = (state: StoreState) => state.blockchain.knownTokens;
export const getWeb3State = (state: StoreState) => state.blockchain.web3State;
export const getWethBalance = (state: StoreState) => state.blockchain.wethBalance;
export const getOrders = (state: StoreState) => state.relayer.orders;
export const getUserOrders = (state: StoreState) => state.relayer.userOrders;
export const getSelectedToken = (state: StoreState) => state.relayer.selectedToken;

export const getOpenOrders = createSelector(
    getOrders,
    orders => {
        return orders.filter(order => order.status === OrderStatus.Fillable);
    },
);

export const getOpenSellOrders = createSelector(
    getOpenOrders,
    orders => {
        return orders
            .filter(order => order.side === UIOrderSide.Sell)
            .sort((o1, o2) => o2.price.comparedTo(o1.price));
    },
);

export const getOpenBuyOrders = createSelector(
    getOpenOrders,
    orders => {
        return orders
            .filter(order => order.side === UIOrderSide.Buy)
            .sort((o1, o2) => o2.price.comparedTo(o1.price));
    },
);

export const getSpread = createSelector(
    getOpenBuyOrders,
    getOpenSellOrders,
    (buyOrders, sellOrders) => {
        if (!buyOrders.length || !sellOrders.length) {
            return new BigNumber(0);
        }

        const lowestPriceSell = sellOrders[sellOrders.length - 1].price;
        const highestPriceBuy = buyOrders[0].price;

        return lowestPriceSell.sub(highestPriceBuy);
    },
);

export const getOrderBook = createSelector(
    getOpenSellOrders,
    getOpenBuyOrders,
    getSpread,
    (sellOrders, buyOrders, spread): OrderBook => {
        return {
            sellOrders: mergeByPrice(sellOrders),
            buyOrders: mergeByPrice(buyOrders),
            spread,
        };
    },
);