import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return [...JSON.parse(storagedCart)];
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO

      const productExists = cart.find(product => product.id === productId);

      if (productExists) {
        updateProductAmount({ productId, amount: productExists.amount + 1 })

      } else {
        const response = await api.get(`/products/${productId}`);

        const newCart = [...cart, { ...response.data, amount: 1 }]

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        setCart(newCart);

        toast.success('Produto adicionado com sucesso');

      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productExists = cart.find(product => product.id === productId);
      if (productExists) {
        const updatedCart = cart.filter(product => product.id !== productExists.id);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
        setCart(updatedCart);
      } else {
        toast.error('Erro na remoção do produto');
      }



    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO

      const response = await api.get<Stock>(`stock/${productId}`);

      const { amount: stockAmount } = response.data;

      const updatedProducts = cart.map(product => product.id === productId ? { ...product, amount } : product)

      if (amount > stockAmount || amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      setCart(updatedProducts);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedProducts));


    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
