import React, { useState, useEffect } from 'react';
import { Package, Minus, Plus, ShoppingCart, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: { [key: string]: number };
  sold: number;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStock: number;
  cost: number;
}

const MenuInventory: React.FC = () => {
  const [menuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Hot Dog',
      price: 8.99,
      category: 'Food',
      ingredients: { bread: 1, meat: 1, sauce: 1 },
      sold: 15,
    },
    {
      id: '2',
      name: 'Hamburger',
      price: 12.99,
      category: 'Food',
      ingredients: { bread: 2, meat: 2, cheese: 1, sauce: 1 },
      sold: 23,
    },
    {
      id: '3',
      name: 'Coffee',
      price: 4.99,
      category: 'Beverage',
      ingredients: { beans: 1, milk: 1 },
      sold: 45,
    },
    {
      id: '4',
      name: 'Haircut',
      price: 25.00,
      category: 'Service',
      ingredients: { shampoo: 1, conditioner: 1 },
      sold: 12,
    },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Bread', quantity: 84, unit: 'pieces', lowStock: 20, cost: 0.50 },
    { id: '2', name: 'Meat', quantity: 45, unit: 'patties', lowStock: 10, cost: 2.50 },
    { id: '3', name: 'Cheese', quantity: 67, unit: 'slices', lowStock: 15, cost: 0.75 },
    { id: '4', name: 'Sauce', quantity: 12, unit: 'bottles', lowStock: 5, cost: 3.00 },
    { id: '5', name: 'Beans', quantity: 28, unit: 'lbs', lowStock: 10, cost: 8.00 },
    { id: '6', name: 'Milk', quantity: 15, unit: 'gallons', lowStock: 5, cost: 4.50 },
    { id: '7', name: 'Shampoo', quantity: 8, unit: 'bottles', lowStock: 3, cost: 12.00 },
    { id: '8', name: 'Conditioner', quantity: 6, unit: 'bottles', lowStock: 3, cost: 15.00 },
  ]);

  const [recentSales, setRecentSales] = useState<Array<{ item: string; quantity: number; timestamp: Date }>>([]);

  // Mock real-time sales
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      // Update inventory based on ingredients used
      setInventory(prevInventory => 
        prevInventory.map(item => {
          const ingredientQuantity = randomMenuItem.ingredients[item.name.toLowerCase()] || 0;
          if (ingredientQuantity > 0) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - (ingredientQuantity * quantity))
            };
          }
          return item;
        })
      );

      // Add to recent sales
      setRecentSales(prev => [
        { item: randomMenuItem.name, quantity, timestamp: new Date() },
        ...prev.slice(0, 4)
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, [menuItems]);

  const sellItem = (menuItem: MenuItem, quantity: number = 1) => {
    // Update inventory
    setInventory(prevInventory => 
      prevInventory.map(item => {
        const ingredientQuantity = menuItem.ingredients[item.name.toLowerCase()] || 0;
        if (ingredientQuantity > 0) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - (ingredientQuantity * quantity))
          };
        }
        return item;
      })
    );

    // Add to recent sales
    setRecentSales(prev => [
      { item: menuItem.name, quantity, timestamp: new Date() },
      ...prev.slice(0, 4)
    ]);
  };

  const restockItem = (itemId: string, amount: number) => {
    setInventory(prevInventory => 
      prevInventory.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + amount }
          : item
      )
    );
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.lowStock);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  return (
    <div className="space-y-8">
      {/* Low Stock Alert */}
      {getLowStockItems().length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-900">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getLowStockItems().map(item => (
              <div key={item.id} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-red-900">{item.name}</h4>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-sm text-red-700">
                  Only {item.quantity} {item.unit} left
                </p>
                <button
                  onClick={() => restockItem(item.id, 50)}
                  className="mt-2 w-full bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  Quick Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <span>Menu Items</span>
              </h2>
              <p className="text-gray-600 text-sm mt-1">Manage your products and services</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">${item.price}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {item.sold} sold
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients Used:</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.ingredients).map(([ingredient, quantity]) => (
                          <span key={ingredient} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            {quantity}x {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => sellItem(item)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Sell Item
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Recent Sales</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </h3>
            </div>
            <div className="p-6">
              {recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((sale, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">{sale.item}</p>
                        <p className="text-sm text-green-700">Quantity: {sale.quantity}</p>
                      </div>
                      <span className="text-xs text-green-600">
                        {formatTimeAgo(sale.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent sales</p>
              )}
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span>Inventory</span>
              </h2>
              <p className="text-gray-600 text-sm mt-1">Real-time stock levels</p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <div className="p-6 space-y-4">
                {inventory.map(item => (
                  <div key={item.id} className={`p-4 rounded-lg border ${
                    item.quantity <= item.lowStock 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.quantity <= item.lowStock 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Cost: ${item.cost}</span>
                      <span>Low stock: {item.lowStock}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => restockItem(item.id, -5)}
                        disabled={item.quantity <= 0}
                        className="flex-1 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-red-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Minus className="w-3 h-3" />
                        <span>Use</span>
                      </button>
                      <button
                        onClick={() => restockItem(item.id, 10)}
                        className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuInventory;