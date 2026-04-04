// app/authorized_user_dashboard/kitchens/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Building2, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  MapPin,
  UtensilsCrossed
} from 'lucide-react';

const KitchensPage = () => {
  const [kitchens, setKitchens] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentKitchen, setCurrentKitchen] = useState({
    kitchen_name: '',
    location: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data - In real app, fetch from MongoDB
  useEffect(() => {
    fetchKitchens();
  }, []);

  const fetchKitchens = async () => {
    try {
      const response = await fetch('/api/kitchens', { credentials: 'include' });
      if (response.status === 401) {
        window.location.href = '/';
        return;
      }
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setKitchens(data);
    } catch {
      setKitchens([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentKitchen(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentKitchen.kitchen_name || !currentKitchen.location) {
      alert('Please fill in all fields');
      return;
    }

    const payload = {
      kitchen_name: currentKitchen.kitchen_name,
      location: currentKitchen.location,
    };

    if (isEditing && currentKitchen._id) {
      const res = await fetch(`/api/kitchens/${currentKitchen._id}`, {
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
        alert(err.error || 'Could not update kitchen');
        return;
      }
      setSuccessMessage('Kitchen updated successfully!');
    } else {
      const res = await fetch('/api/kitchens', {
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
        alert(err.error || 'Could not add kitchen');
        return;
      }
      setSuccessMessage('Kitchen added successfully!');
    }

    await fetchKitchens();
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (kitchen) => {
    setCurrentKitchen(kitchen);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this kitchen?')) return;
    const res = await fetch(`/api/kitchens/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = '/';
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Could not delete kitchen');
      return;
    }
    await fetchKitchens();
    setSuccessMessage('Kitchen deleted successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetForm = () => {
    setCurrentKitchen({
      kitchen_name: '',
      location: ''
    });
    setIsEditing(false);
  };

  // Filter kitchens based on search
  const filteredKitchens = kitchens.filter(kitchen => {
    return kitchen.kitchen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           kitchen.location.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            <span className="text-gray-900 font-semibold">Kitchens</span>
          </div>
          
          <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Manage <span className="text-emerald-600">Kitchens</span>
              </h1>
              <p className="text-gray-500 mt-2">
                Add, edit, and manage your kitchen locations
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
              Add New Kitchen
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

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search kitchens by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Kitchens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKitchens.map((kitchen) => (
            <div
              key={kitchen._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(kitchen)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-500 hover:text-emerald-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(kitchen._id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {kitchen.kitchen_name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 flex-1">{kitchen.location}</span>
                  </div>
                </div>

                {/* Stats or additional info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      Active Kitchen
                    </span>
                    <span>ID: {kitchen._id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredKitchens.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No kitchens found</h3>
            <p className="text-gray-400">Add your first kitchen to get started</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Edit Kitchen' : 'Add New Kitchen'}
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
                    Kitchen Name *
                  </label>
                  <input
                    type="text"
                    name="kitchen_name"
                    value={currentKitchen.kitchen_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="e.g., Main Kitchen, Pastry Kitchen"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={currentKitchen.location}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="e.g., 1st Floor, Main Building"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Update Kitchen' : 'Save Kitchen'}
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

export default KitchensPage;
