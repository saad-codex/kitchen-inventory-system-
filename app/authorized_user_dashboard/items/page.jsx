// app/authorized_user_dashboard/Items/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Package, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  Search,
  Filter
} from 'lucide-react';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    item_name: '',
    unit: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Categories for filter and selection
  const categories = [
  "Bakery Items",
  "Barbecue Items",
  "Basmati Rice",
  "Beans",
  "Beef",
  "Beverages",
  "Biryani Ingredients",
  "Biscuits",
  "Bread",
  "Breakfast Items",
  "Broths",
  "Butter",
  "Cakes",
  "Canned Foods",
  "Carbonated Drinks",
  "Cereals",
  "Cheese",
  "Chicken",
  "Chili Sauces",
  "Chocolate",
  "Chutneys",
  "Cleaning Supplies",
  "Coffee",
  "Condiments",
  "Cooking Oils",
  "Cooking Pastes",
  "Corn Products",
  "Cream",
  "Dairy Products",
  "Desserts",
  "Dips",
  "Disposable Items",
  "Dried Fruits",
  "Egg Products",
  "Eggs",
  "Energy Drinks",
  "Fast Food Ingredients",
  "Fish",
  "Flour",
  "Food Color",
  "Food Packaging",
  "Food Seasonings",
  "Frozen Foods",
  "Fruit Juices",
  "Fruits",
  "Garlic Products",
  "Ghee",
  "Grains",
  "Green Vegetables",
  "Herbs",
  "Honey",
  "Ice Cream",
  "Instant Foods",
  "Jam",
  "Juices",
  "Ketchup",
  "Kitchen Equipment",
  "Kitchen Tools",
  "Lentils",
  "Mayonnaise",
  "Meat",
  "Milk",
  "Mineral Water",
  "Mutton",
  "Noodles",
  "Nuts",
  "Oil",
  "Olives",
  "Other",
  "Pasta",
  "Pickles",
  "Pizza Ingredients",
  "Plastic Containers",
  "Poultry",
  "Powdered Spices",
  "Ready To Cook",
  "Rice",
  "Salad Ingredients",
  "Salt",
  "Sauces",
  "Seafood",
  "Seeds",
  "Snacks",
  "Soft Drinks",
  "Soup Ingredients",
  "Soy Products",
  "Spices",
  "Sugar",
  "Sweets",
  "Syrups",
  "Tea",
  "Tomato Products",
  "Vegetable Oils",
  "Vegetables",
  "Vinegar",
  "Water",
  "Wheat Products",
  "Wrap Ingredients",
  "Yogurt",
  "Others"
];

  // Units of measurement
 const units = [
  "Ampere",
  "Bag",
  "Bar",
  "Barrel",
  "Batch",
  "Block",
  "Board",
  "Bottle",
  "Box",
  "Bucket",
  "Bundle",
  "Bunch",
  "Bushel",
  "Can",
  "Capsule",
  "Carton",
  "Case",
  "Centigram",
  "Centiliter",
  "Centimeter",
  "Container",
  "Crate",
  "Cubic Centimeter",
  "Cubic Foot",
  "Cubic Inch",
  "Cubic Meter",
  "Cup",
  "Day",
  "Decagram",
  "Deciliter",
  "Decimeter",
  "Dozen",
  "Drum",
  "Each",
  "Foot",
  "Gallon",
  "Gram",
  "Gross",
  "Half Dozen",
  "Hour",
  "Inch",
  "Jar",
  "Jug",
  "Kilogram",
  "Kiloliter",
  "Kilometer",
  "Kit",
  "Liter",
  "Load",
  "Lot",
  "Meter",
  "Microgram",
  "Milligram",
  "Milliliter",
  "Millimeter",
  "Minute",
  "Month",
  "Nanogram",
  "Ounce",
  "Pack",
  "Packet",
  "Pad",
  "Pail",
  "Pair",
  "Pallet",
  "Panel",
  "Part",
  "Piece",
  "Pint",
  "Plate",
  "Portion",
  "Pouch",
  "Pound",
  "Quart",
  "Ream",
  "Roll",
  "Room",
  "Sack",
  "Sample",
  "Second",
  "Serving",
  "Set",
  "Sheet",
  "Shelf",
  "Slice",
  "Spool",
  "Square Centimeter",
  "Square Foot",
  "Square Inch",
  "Square Meter",
  "Stick",
  "Stone",
  "Strip",
  "Tablespoon",
  "Tank",
  "Teaspoon",
  "Tin",
  "Ton",
  "Tray",
  "Tube",
  "Unit",
  "Vial",
  "Volt",
  "Watt",
  "Week",
  "Yard",
  "Year",
  "Others",

];

  // Mock data - In real app, fetch from MongoDB
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items', { credentials: 'include' });
      if (response.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load items');
      }
      const data = await response.json();
      setItems(data);
    } catch {
      setItems([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentItem.item_name || !currentItem.unit || !currentItem.category) {
      alert('Please fill in all fields');
      return;
    }

    const payload = {
      item_name: currentItem.item_name,
      unit: currentItem.unit,
      category: currentItem.category,
    };

    if (isEditing && currentItem._id) {
      const res = await fetch(`/api/items/${currentItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!res.ok) {
        alert(err.error || 'Could not update item');
        return;
      }
      setSuccessMessage('Item updated successfully!');
    } else {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!res.ok) {
        alert(err.error || 'Could not add item');
        return;
      }
      setSuccessMessage('Item added successfully!');
    }

    await fetchItems();
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = '/';
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Could not delete item');
      return;
    }
    await fetchItems();
    setSuccessMessage('Item deleted successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetForm = () => {
    setCurrentItem({
      item_name: '',
      unit: '',
      category: ''
    });
    setIsEditing(false);
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const uniqueCategories = ['all', ...new Set(items.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6 md:p-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/authorized_user_dashboard" className="hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Items</span>
          </div>
          
          <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Manage <span className="text-emerald-600">Items</span>
              </h1>
              <p className="text-gray-500 mt-2">
                Add, edit, and manage your kitchen inventory items
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white"
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-500 hover:text-emerald-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {item.item_name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Unit:</span>
                    <span className="font-medium text-gray-700">{item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-400">Add your first item to get started</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={currentItem.item_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit of Measurement *
                  </label>
                  <select
                    name="unit"
                    value={currentItem.unit}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={currentItem.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update Item' : 'Save Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
