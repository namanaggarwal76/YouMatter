import React, { useState } from 'react';
import { Award, Zap, Palette, TrendingUp, Coins, ShoppingBag, Sparkles, Star } from 'lucide-react';

// Enhanced shop items with icons and categories
const shopItems = [
  { 
    id: 1, 
    name: 'Golden Badge', 
    price: 100, 
    description: 'A prestigious golden badge to showcase your wellness achievements!', 
    icon: Award,
    category: 'Achievement',
    rarity: 'Legendary',
    gradient: 'from-yellow-400 to-amber-500'
  },
  { 
    id: 2, 
    name: 'Extra Challenge', 
    price: 50, 
    description: 'Unlock additional daily challenges to boost your progress.', 
    icon: Zap,
    category: 'Gameplay',
    rarity: 'Common',
    gradient: 'from-blue-400 to-indigo-500'
  },
  { 
    id: 3, 
    name: 'Profile Theme', 
    price: 75, 
    description: 'Personalize your profile with exclusive color themes and designs.', 
    icon: Palette,
    category: 'Customization',
    rarity: 'Rare',
    gradient: 'from-purple-400 to-pink-500'
  },
  { 
    id: 4, 
    name: 'Leaderboard Boost', 
    price: 200, 
    description: 'Get a temporary boost to climb higher on the wellness leaderboard.', 
    icon: TrendingUp,
    category: 'Power-up',
    rarity: 'Epic',
    gradient: 'from-green-400 to-emerald-500'
  },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Common': return 'text-gray-600 bg-gray-100';
    case 'Rare': return 'text-blue-600 bg-blue-100';
    case 'Epic': return 'text-purple-600 bg-purple-100';
    case 'Legendary': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

interface ShopProps {
  coins: number;
}

const Shop: React.FC<ShopProps> = ({ coins }) => {
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  const handlePurchase = async (itemId: number, price: number) => {
    if (coins < price) return;
    
    setPurchasingId(itemId);
    
    // Simulate purchase process
    setTimeout(() => {
      setPurchasingId(null);
      // Here you would typically update the user's coins and inventory
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800">Wellness Shop</h1>
              <p className="text-gray-600 text-lg">Enhance your wellness journey with exclusive items</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-xl flex items-center gap-2">
            <Coins className="w-6 h-6" />
            {coins.toLocaleString()}
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {shopItems.map(item => {
            const IconComponent = item.icon;
            const canAfford = coins >= item.price;
            const isPurchasing = purchasingId === item.id;
            
            return (
              <div 
                key={item.id} 
                className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${item.gradient} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`}></div>
                
                {/* Rarity badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(item.rarity)} flex items-center gap-1`}>
                  <Star className="w-3 h-3" />
                  {item.rarity}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.name}</h3>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-base leading-relaxed">{item.description}</p>

                  {/* Price and Buy Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-bold text-gray-800">{item.price.toLocaleString()}</span>
                      <span className="text-gray-500">coins</span>
                    </div>
                    
                    <button
                      onClick={() => handlePurchase(item.id, item.price)}
                      disabled={!canAfford || isPurchasing}
                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                        !canAfford 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : isPurchasing
                          ? 'bg-green-500 text-white'
                          : `bg-gradient-to-r ${item.gradient} text-white hover:scale-105 active:scale-95`
                      }`}
                    >
                      {isPurchasing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Purchasing...
                        </>
                      ) : !canAfford ? (
                        'Not enough coins'
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer message */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl">
          <p className="text-gray-700 text-lg">
            Complete challenges and track your wellness to earn more coins! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shop;
