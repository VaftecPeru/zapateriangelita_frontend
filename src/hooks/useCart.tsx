import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    product: any;
    quantity: number;
}

export interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    updateCartItem: (index: number, item: CartItem) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const variantValue = (value: any) => {
    if (value && typeof value === 'object') {
        return String(value.name ?? value.color ?? value.size ?? '').trim();
    }
    return String(value ?? '').trim();
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse stored cart", e);
            }
        }
    }, []);

    const persistCart = (nextCart: CartItem[]) => {
        localStorage.setItem('cart', JSON.stringify(nextCart));
        return nextCart;
    };

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.product.id === product.id
                && variantValue(item.product.size) === variantValue(product.size)
                && variantValue(item.product.color) === variantValue(product.color)
            );
            let newCart;
            if (existing) {
                newCart = prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                newCart = [...prev, { product, quantity: 1 }];
            }
            return persistCart(newCart);
        });
    };

    const updateCartItem = (index: number, nextItem: CartItem) => {
        setCart(prev => {
            if (index < 0 || index >= prev.length) return prev;

            const normalizedItem: CartItem = {
                product: nextItem.product,
                quantity: Math.max(1, Number(nextItem.quantity || 1)),
            };

            const duplicateIndex = prev.findIndex((item, itemIndex) =>
                itemIndex !== index
                && item.product.id === normalizedItem.product.id
                && variantValue(item.product.size) === variantValue(normalizedItem.product.size)
                && variantValue(item.product.color) === variantValue(normalizedItem.product.color)
            );

            let newCart: CartItem[];
            if (duplicateIndex >= 0) {
                newCart = prev
                    .map((item, itemIndex) => itemIndex === duplicateIndex
                        ? { ...item, quantity: item.quantity + normalizedItem.quantity }
                        : item)
                    .filter((_, itemIndex) => itemIndex !== index);
            } else {
                newCart = prev.map((item, itemIndex) => itemIndex === index ? normalizedItem : item);
            }

            return persistCart(newCart);
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => {
            const newCart = prev.filter(item => item.product.id !== productId);
            return persistCart(newCart);
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};