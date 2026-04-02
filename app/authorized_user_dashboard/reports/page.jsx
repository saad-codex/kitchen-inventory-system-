// app/authorized_user_dashboard/reports/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BarChart3, 
  ChevronRight, 
  Filter,
  Calendar,
  Download,
  TrendingUp,
  Package,
  Building2,
  DollarSign,
  Printer,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage = () => {
  const [inventory, setInventory] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedItem, setSelectedItem] = useState('all');
  const [selectedKitchen, setSelectedKitchen] = useState('all');
  
  // UI states
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - In real app, fetch from MongoDB
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReports();
  }, [dateFrom, dateTo, selectedItem, selectedKitchen, inventory]);

  const fetchData = async () => {
    // Replace with actual API calls
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
      { _id: 'item_5', item_name: 'Garlic', unit: 'g', category: 'Spices' },
      { _id: 'item_6', item_name: 'Milk', unit: 'L', category: 'Dairy' },
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
      { 
        _id: 'inv_5', 
        kitchen_id: 'kitchen_3', 
        item_id: 'item_5', 
        quantity: 500, 
        price_per_unit: 0.5, 
        total_price: 250,
        created_at: new Date('2024-01-13')
      },
      { 
        _id: 'inv_6', 
        kitchen_id: 'kitchen_1', 
        item_id: 'item_6', 
        quantity: 40, 
        price_per_unit: 1.5, 
        total_price: 60,
        created_at: new Date('2024-01-13')
      },
      { 
        _id: 'inv_7', 
        kitchen_id: 'kitchen_2', 
        item_id: 'item_1', 
        quantity: 35, 
        price_per_unit: 2.5, 
        total_price: 87.5,
        created_at: new Date('2024-01-12')
      },
    ];
    
    setKitchens(mockKitchens);
    setItems(mockItems);
    setInventory(mockInventory);
    setFilteredReports(mockInventory);
  };

  // Helper functions
  const getKitchenName = (kitchenId) => {
    const kitchen = kitchens.find(k => k._id === kitchenId);
    return kitchen ? kitchen.kitchen_name : 'Unknown Kitchen';
  };

  const getItemDetails = (itemId) => {
    const item = items.find(i => i._id === itemId);
    return item || { item_name: 'Unknown Item', unit: '', category: '' };
  };

  // Set date filters
  const setToday = () => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    setDateFrom(formattedToday);
    setDateTo(formattedToday);
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];
    setDateFrom(formattedYesterday);
    setDateTo(formattedYesterday);
  };

  const setLast7Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  const setLast30Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedItem('all');
    setSelectedKitchen('all');
  };

  // Filter reports
  const filterReports = () => {
    let filtered = [...inventory];

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate >= fromDate && invDate <= toDate;
      });
    } else if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(inv => new Date(inv.created_at) >= fromDate);
    } else if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(inv => new Date(inv.created_at) <= toDate);
    }

    if (selectedItem !== 'all') {
      filtered = filtered.filter(inv => inv.item_id === selectedItem);
    }

    if (selectedKitchen !== 'all') {
      filtered = filtered.filter(inv => inv.kitchen_id === selectedKitchen);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setFilteredReports(filtered);
  };

  // Generate PDF
  const generatePDF = () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94);
      doc.text('Kitchen Management System', 14, 15);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Inventory Report', 14, 25);
      
      // Add report info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      let yPos = 35;
      
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos);
      yPos += 5;
      
      if (dateFrom || dateTo) {
        doc.text(`Date Range: ${dateFrom || 'Start'} to ${dateTo || 'End'}`, 14, yPos);
        yPos += 5;
      }
      
      if (selectedItem !== 'all') {
        const item = getItemDetails(selectedItem);
        doc.text(`Item Filter: ${item.item_name}`, 14, yPos);
        yPos += 5;
      }
      
      if (selectedKitchen !== 'all') {
        doc.text(`Kitchen Filter: ${getKitchenName(selectedKitchen)}`, 14, yPos);
        yPos += 5;
      }
      
      // Prepare table data
      const tableData = filteredReports.map(report => {
        const item = getItemDetails(report.item_id);
        const kitchen = getKitchenName(report.kitchen_id);
        return [
          item.item_name,
          item.category,
          kitchen,
          report.quantity.toString(),
          item.unit,
          `$${report.price_per_unit}`,
          `$${report.total_price.toFixed(2)}`,
          new Date(report.created_at).toLocaleDateString()
        ];
      });
      
      // Add summary statistics
      const totalQuantity = filteredReports.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = filteredReports.reduce((sum, item) => sum + item.total_price, 0);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Summary:`, 14, yPos + 5);
      doc.text(`Total Units: ${totalQuantity}`, 14, yPos + 12);
      doc.text(`Total Value: $${totalValue.toFixed(2)}`, 14, yPos + 19);
      doc.text(`Total Records: ${filteredReports.length}`, 14, yPos + 26);
      
      // Add table
      doc.autoTable({
        startY: yPos + 35,
        head: [['Item Name', 'Category', 'Kitchen', 'Quantity', 'Unit', 'Price/Unit', 'Total Price', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 8,
          cellPadding: 3
        }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} - Kitchen Management System`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      doc.save(`inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  const groupReportsByDate = () => {
    const grouped = {};
    filteredReports.forEach(report => {
      const date = new Date(report.created_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(report);
    });
    return grouped;
  };

  const totalQuantity = filteredReports.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = filteredReports.reduce((sum, item) => sum + item.total_price, 0);
  const uniqueItems = new Set(filteredReports.map(item => item.item_id)).size;
  const uniqueKitchens = new Set(filteredReports.map(item => item.kitchen_id)).size;

  const groupedReports = groupReportsByDate();

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
            <span className="text-gray-900 font-semibold">Reports</span>
          </div>
          
          <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Inventory <span className="text-emerald-600">Reports</span>
              </h1>
              <p className="text-gray-500 mt-2">
                View and analyze inventory reports with advanced filtering
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={printReport}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-green-700">PDF report downloaded successfully!</span>
            <button onClick={() => setShowSuccess(false)} className="ml-auto">
              <X className="w-4 h-4 text-green-600" />
            </button>
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
            <h3 className="text-2xl font-bold text-gray-800">{totalQuantity}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Units</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">${totalValue.toFixed(2)}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Value</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{uniqueKitchens}</h3>
            <p className="text-gray-500 text-sm mt-1">Kitchens</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{uniqueItems}</h3>
            <p className="text-gray-500 text-sm mt-1">Unique Items</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-600" />
            Filter Reports
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Date Filters</label>
            <div className="flex flex-wrap gap-3">
              <button onClick={setToday} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Today
              </button>
              <button onClick={setYesterday} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Yesterday
              </button>
              <button onClick={setLast7Days} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Last 7 Days
              </button>
              <button onClick={setLast30Days} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Last 30 Days
              </button>
              <button onClick={clearFilters} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors">
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Filter by Item Name
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">All Items</option>
                {items.map(item => (
                  <option key={item._id} value={item._id}>{item.item_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Filter by Restaurant/Kitchen Name
              </label>
              <select
                value={selectedKitchen}
                onChange={(e) => setSelectedKitchen(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="all">All Kitchens</option>
                {kitchens.map(kitchen => (
                  <option key={kitchen._id} value={kitchen._id}>{kitchen.kitchen_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              {filteredReports.length} Records Found
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {Object.entries(groupedReports).map(([date, reports]) => (
              <div key={date} className="mb-6">
                <div className="bg-emerald-50 p-3 border-b border-emerald-200 sticky top-0">
                  <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {date}
                  </h3>
                </div>
                
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Item Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Category</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Kitchen</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Quantity</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Unit</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Price/Unit</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const itemDetails = getItemDetails(report.item_id);
                      const kitchenName = getKitchenName(report.kitchen_id);
                      return (
                        <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 text-gray-800">{itemDetails.item_name}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {itemDetails.category}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{kitchenName}</td>
                          <td className="p-3 font-semibold text-gray-800">{report.quantity}</td>
                          <td className="p-3 text-gray-600">{itemDetails.unit}</td>
                          <td className="p-3 text-gray-600">${report.price_per_unit}</td>
                          <td className="p-3 font-semibold text-emerald-600">${report.total_price.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="p-3 text-right font-semibold text-gray-700">
                        Subtotal:
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        ${reports.reduce((sum, r) => sum + r.total_price, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="h-4"></div>
              </div>
            ))}
          </div>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No records found</h3>
              <p className="text-gray-400">Try adjusting your filters to see results</p>
            </div>
          )}

          {filteredReports.length > 0 && (
            <div className="bg-gray-100 p-4 border-t border-gray-200">
              <div className="flex justify-end items-center gap-4">
                <span className="font-semibold text-gray-700">Grand Total:</span>
                <span className="text-2xl font-bold text-emerald-600">${totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .min-h-screen, .min-h-screen * {
            visibility: visible;
          }
          .min-h-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;