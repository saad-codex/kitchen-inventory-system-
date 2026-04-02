// app/authorized_user_dashboard/inventory/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ClipboardList, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Package,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInventory, setCurrentInventory] = useState({
    kitchen_id: '',
    item_id: '',
    quantity: '',
    price_per_unit: '',
    total_price: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKitchen, setSelectedKitchen] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data - In real app, fetch from MongoDB
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Replace with actual API calls
    // const inventoryRes = await fetch('/api/inventory');
    // const kitchensRes = await fetch('/api/kitchens');
    // const itemsRes = await fetch('/api/items');
    
    // Mock data for demonstration
    const mockKitchens = [
      { _id: 'kitchen_1', kitchen_name: 'Main Kitchen', location: '1st Floor' },
      { _id: 'kitchen_2', kitchen_name: 'Banquet Kitchen', location: 'Ground Floor' },
      { _id: 'kitchen_3', kitchen_name: 'Pastry Kitchen', location: '2nd Floor' },
    ];
    
    const mockItems = [
      { _id: 'item_1', item_name: 'Tomatoes', unit: 'kg', category: 'Vegetables' },
      { _id: 'item_2', item_name: 'Chicken Breast', unit: 'kg', category: 'Meat' },
      { _id: 'item_3', item_name: 'Basmati Rice', unit: 'kg', category: 'Grains' },
      { _id: 'item_4', item_name: 'Olive Oil', unit: 'L', category: 'Other' },
    ];
    
    const mockInventory = [
      { 
        _id: 'inv_1', 
        kitchen_id: 'kitchen_1', 
        item_id: 'item_1', 
        quantity: 50, 
        price_per_unit: 2.5, 
        total_price: 125,
        created_at: new Date('2024-01-15')
      },
      { 
        _id: 'inv_2', 
        kitchen_id: 'kitchen_1', 
        item_id: 'item_2', 
        quantity: 30, 
        price_per_unit: 8.99, 
        total_price: 269.7,
        created_at: new Date('2024-01-15')
      },
      { 
        _id: 'inv_3', 
        kitchen_id: 'kitchen_2', 
        item_id: 'item_3', 
        quantity: 100, 
        price_per_unit: 1.2, 
        total_price: 120,
        created_at: new Date('2024-01-14')
      },
      { 
        _id: 'inv_4', 
        kitchen_id: 'kitchen_2', 
        item_id: 'item_4', 
        quantity: 20, 
        price_per_unit: 12.99, 
        total_price: 259.8,
        created_at: new Date('2024-01-14')
      },
    ];
    
    setKitchens(mockKitchens);
    setItems(mockItems);
    setInventory(mockInventory);
  };

  // Helper function to get kitchen name by ID
  const getKitchenName = (kitchenId) => {
    const kitchen = kitchens.find(k => k._id === kitchenId);
    return kitchen ? kitchen.kitchen_name : 'Unknown Kitchen';
  };

  // Helper function to get item details by ID
  const getItemDetails = (itemId) => {
    const item = items.find(i => i._id === itemId);
    return item || { item_name: 'Unknown Item', unit: '' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentInventory(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate total price when quantity or price_per_unit changes
      if (name === 'quantity' || name === 'price_per_unit') {
        const quantity = parseFloat(name === 'quantity' ? value : prev.quantity);
        const pricePerUnit = parseFloat(name === 'price_per_unit' ? value : prev.price_per_unit);
        if (!isNaN(quantity) && !isNaN(pricePerUnit)) {
          updated.total_price = (quantity * pricePerUnit).toFixed(2);
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentInventory.kitchen_id || !currentInventory.item_id || !currentInventory.quantity || !currentInventory.price_per_unit) {
      alert('Please fill in all required fields');
      return;
    }

    const inventoryData = {
      ...currentInventory,
      quantity: parseFloat(currentInventory.quantity),
      price_per_unit: parseFloat(currentInventory.price_per_unit),
      total_price: parseFloat(currentInventory.total_price),
      created_at: new Date()
    };

    if (isEditing && currentInventory._id) {
      // Update existing inventory
      setInventory(inventory.map(item => 
        item._id === currentInventory._id ? { ...inventoryData, _id: currentInventory._id } : item
      ));
      setSuccessMessage('Inventory updated successfully!');
    } else {
      // Add new inventory
      const newInventory = { ...inventoryData, _id: Date.now().toString() };
      setInventory([...inventory, newInventory]);
      setSuccessMessage('Inventory added successfully!');
    }
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (inventoryItem) => {
    setCurrentInventory({
      kitchen_id: inventoryItem.kitchen_id,
      item_id: inventoryItem.item_id,
      quantity: inventoryItem.quantity.toString(),
      price_per_unit: inventoryItem.price_per_unit.toString(),
      total_price: inventoryItem.total_price.toString(),
      _id: inventoryItem._id
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      setInventory(inventory.filter(item => item._id !== id));
      setSuccessMessage('Inventory deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const resetForm = () => {
    setCurrentInventory({
      kitchen_id: '',
      item_id: '',
      quantity: '',
      price_per_unit: '',
      total_price: ''
    });
    setIsEditing(false);
  };

  // Calculate summary statistics
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.total_price, 0);
  const uniqueItems = new Set(inventory.map(item => item.item_id)).size;

  // Filter inventory based on search and kitchen
  const filteredInventory = inventory.filter(inv => {
    const itemDetails = getItemDetails(inv.item_id);
    const kitchenName = getKitchenName(inv.kitchen_id);
    const matchesSearch = itemDetails.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kitchenName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKitchen = selectedKitchen === 'all' || inv.kitchen_id === selectedKitchen;
    return matchesSearch && matchesKitchen;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6 md:p-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/authorized_user_dashboard" className="hover:text-emerald-600 transition-colors">
              Dashboard
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Inventory</span>
          </div>
          
          <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Manage <span className="text-emerald-600">Inventory</span>
              </h1>
              <p className="text-gray-500 mt-2">
                Track stock levels, manage supplies, and monitor inventory value
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
              Add Inventory Item
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{totalItems}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Units in Stock</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">${totalValue.toFixed(2)}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Inventory Value</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{kitchens.length}</h3>
            <p className="text-gray-500 text-sm mt-1">Active Kitchens</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-50 p-3 rounded-lg">
                <ClipboardList className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{uniqueItems}</h3>
            <p className="text-gray-500 text-sm mt-1">Unique Items</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item name or kitchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedKitchen}
                onChange={(e) => setSelectedKitchen(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white"
              >
                <option value="all">All Kitchens</option>
                {kitchens.map(kitchen => (
                  <option key={kitchen._id} value={kitchen._id}>{kitchen.kitchen_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Item Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Kitchen</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Unit</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Price/Unit</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Total Price</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Date Added</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((inv) => {
                  const itemDetails = getItemDetails(inv.item_id);
                  const kitchenName = getKitchenName(inv.kitchen_id);
                  return (
                    <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{itemDetails.item_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{kitchenName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-800">{inv.quantity}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600">{itemDetails.unit}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600">${inv.price_per_unit}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-600">${inv.total_price.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(inv)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-500 hover:text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No inventory items found</h3>
              <p className="text-gray-400">Add inventory items to get started</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}
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
                    Select Kitchen *
                  </label>
                  <select
                    name="kitchen_id"
                    value={currentInventory.kitchen_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select Kitchen</option>
                    {kitchens.map(kitchen => (
                      <option key={kitchen._id} value={kitchen._id}>{kitchen.kitchen_name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Item *
                  </label>
                  <select
                    name="item_id"
                    value={currentInventory.item_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select Item</option>
                    {items.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.item_name} ({item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentInventory.quantity}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit ($) *
                  </label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={currentInventory.price_per_unit}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter price per unit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Price ($)
                  </label>
                  <input
                    type="text"
                    name="total_price"
                    value={currentInventory.total_price}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    placeholder="Auto-calculated"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated based on quantity and price</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update Inventory' : 'Save Inventory'}
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

export default InventoryPage;
