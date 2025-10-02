import React from 'react';

// Hardcoded shop items
const shopItems = [
  { id: 1, name: 'Golden Badge', price: 100, description: 'A shiny badge to show off!' },
  { id: 2, name: 'Extra Challenge', price: 50, description: 'Unlock an extra challenge.' },
  { id: 3, name: 'Profile Theme', price: 75, description: 'Customize your profile theme.' },
  { id: 4, name: 'Leaderboard Boost', price: 200, description: 'Boost your leaderboard position.' },
];

interface ShopProps {
  coins: number;
}

const Shop: React.FC<ShopProps> = ({ coins }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Shop</h2>
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
          Coins: {coins}
        </div>
      </div>
      <div className="grid gap-4">
        {shopItems.map(item => (
          <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-white shadow">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">{item.name}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{item.price} coins</span>
            </div>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <button className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition">Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
