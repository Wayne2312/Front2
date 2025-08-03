import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('meals');
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState({ total_revenue: 0, total_orders: 0 });
  const [loading, setLoading] = useState(false);
  const [mealForm, setMealForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });
  const [selectedMealsForMenu, setSelectedMealsForMenu] = useState([]);
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchMeals();
    fetchOrders();
    fetchDailyRevenue();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await axios.get(`${API}/meals/`);
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const response = await axios.get(`${API}/orders/today/revenue/`);
      setDailyRevenue(response.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/meals/`, { 
        ...mealForm,
        price: parseFloat(mealForm.price)
      });
      setMealForm({ name: '', description: '', price: '', category: '', image_url: '' });
      await fetchMeals();
      alert('Meal created successfully!');
    } catch (error) {
      alert('Error creating meal: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createDailyMenu = async () => {
    if (selectedMealsForMenu.length === 0) {
      alert('Please select at least one meal for the menu');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/daily-menu/`, { 
        date: menuDate,
        meal_ids: selectedMealsForMenu
      });
      setSelectedMealsForMenu([]);
      alert('Daily menu created successfully!');
    } catch (error) {
      alert('Error creating menu: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMealSelection = (mealId) => {
    setSelectedMealsForMenu(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleDeleteMeal = async (mealId) => {
  const meal = meals.find(m => m.id === mealId);

  if (window.confirm(`Are you sure you want to delete "${meal?.name}"? This action cannot be undone.`)) {
    setLoading(true);
    try {
      await axios.delete(`${API}/meals/${mealId}/`);
      await fetchMeals();
      alert('Meal deleted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Unknown error';
      alert('Error deleting meal: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }
};

  const getDefaultImage = (category) => {
    const images = {
      'Appetizer': 'Add image URL here',
      'Main Course': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxkZWxpY2lvdXMlMjBmb29kfGVufDB8fHx8MTc1MzIxNzUzN3ww&ixlib=rb-4.1.0&q=85',
      'Burger': 'https://images.unsplash.com/photo-1600555379760-08a022e4726d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHxyZXN0YXVyYW50JTIwbWVhbHxlbnwwfHx8fDE3NTMyMTI1NTl8MA&ixlib=rb-4.1.0&q=85',
      'Dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBmb29kfGVufDB8fHx8MTc1MzIxNzUzN3ww&ixlib=rb-4.1.0&q=85',
      'default': 'Add image URL here' // Default image URL
    };
    return images[category] || images['default'];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">Manage your restaurant operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">KSh {dailyRevenue.total_revenue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dailyRevenue.total_orders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">🍽️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Meals</p>
              <p className="text-2xl font-bold text-gray-900">{meals.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'meals', label: 'Meals', count: meals.length },
            { id: 'menu', label: 'Daily Menu' },
            { id: 'orders', label: 'Orders', count: orders.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} {tab.count && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'meals' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Meal</h3>
            <form onSubmit={handleMealSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mealName" className="block text-sm font-medium text-gray-700 mb-2">Meal Name</label>
                <input
                  id="mealName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={mealForm.name}
                  onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="mealCategory" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="mealCategory"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={mealForm.category}
                  onChange={(e) => setMealForm({...mealForm, category: e.target.value, image_url: getDefaultImage(e.target.value)})}
                >
                  <option value="">Select Category</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Burger">Burger</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>
              <div>
                <label htmlFor="mealPrice" className="block text-sm font-medium text-gray-700 mb-2">Price (KSh)</label>
                <input
                  id="mealPrice"
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={mealForm.price}
                  onChange={(e) => setMealForm({...mealForm, price: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="mealImage" className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  id="mealImage"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={mealForm.image_url}
                  onChange={(e) => setMealForm({...mealForm, image_url: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="mealDescription" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  id="mealDescription"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={mealForm.description}
                  onChange={(e) => setMealForm({...mealForm, description: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Meal'}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {meal.image_url ? (
                    <img 
                      src={meal.image_url} 
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🍽️</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                      {meal.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
                  <div className="text-xl font-bold text-orange-600">KSh {meal.price}</div>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Daily Menu</h3>
          
          <div className="mb-6">
            <label htmlFor="menuDate" className="block text-sm font-medium text-gray-700 mb-2">Menu Date</label>
            <input
              id="menuDate"
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Select Meals for Menu ({selectedMealsForMenu.length} selected)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMealsForMenu.includes(meal.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => toggleMealSelection(meal.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {meal.image_url ? (
                        <img 
                          src={meal.image_url} 
                          alt={meal.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🍽️</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{meal.name}</h5>
                      <p className="text-sm text-gray-600">KSh {meal.price}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 ${
                      selectedMealsForMenu.includes(meal.id)
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMealsForMenu.includes(meal.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={createDailyMenu}
            disabled={loading || selectedMealsForMenu.length === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Daily Menu'}
          </button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.meal_name}</div>
                      <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Customer ID: {String(order.customer_id).slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.payment_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status === 'completed' ? 'Paid' : 'Pending Payment'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KSh {order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;