import React, { useState } from 'react';

const Billing = ({ bills = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const getBillIcon = (type) => {
    switch (type) {
      case 'room': return '🏨';
      case 'service': return '🛎️';
      case 'partial': return '📋';
      case 'restaurant': return '🍽️';
      default: return '💳';
    }
  };

  const handlePayNow = (billId) => {
    console.log(`Processing payment for bill ${billId}`);
  };

  const handleSendReminder = (billId) => {
    console.log(`Sending reminder for bill ${billId}`);
  };

  const handleViewDetails = (billId) => {
    console.log(`Viewing details for bill ${billId}`);
  };

  const handlePrintBill = (billId) => {
    console.log(`Printing bill ${billId}`);
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.roomNumber.includes(searchTerm) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesType = filterType === 'all' || bill.billType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-light tracking-tight text-black mb-3">
            Billing
          </h1>
          <p className="text-gray-500 text-sm">
            Manage payments and transactions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-16">
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Revenue</div>
            <div className="text-3xl font-light">${totalRevenue.toFixed(2)}</div>
          </div>
          
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Pending</div>
            <div className="text-3xl font-light">${pendingAmount.toFixed(2)}</div>
          </div>
          
          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Overdue</div>
            <div className="text-3xl font-light">${overdueAmount.toFixed(2)}</div>
          </div>

          <div className="border border-gray-200 p-6 hover:border-black transition-colors">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Total Bills</div>
            <div className="text-3xl font-light">{bills.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-12">
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Types</option>
            <option value="room">Room</option>
            <option value="service">Service</option>
            <option value="partial">Partial</option>
            <option value="restaurant">Restaurant</option>
          </select>

          <button className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors">
            New Bill
          </button>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {filteredBills.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-sm">No bills found</p>
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div 
                key={bill.id} 
                className="border border-gray-200 hover:border-black transition-colors group"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-light tracking-tight">
                          {bill.guestName}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {bill.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Room {bill.roomNumber} · {bill.billType}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-light mb-2">
                        ${bill.amount.toFixed(2)}
                      </div>
                      <span className={`inline-block px-3 py-1 text-xs ${
                        bill.status === 'paid' ? 'bg-black text-white' : 
                        bill.status === 'overdue' ? 'bg-gray-900 text-white' : 
                        bill.status === 'partial' ? 'bg-gray-300 text-black' : 
                        'border border-gray-300 text-black'
                      }`}>
                        {bill.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-8 text-sm mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Check In</div>
                      <div className="text-gray-900">{bill.checkIn}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Check Out</div>
                      <div className="text-gray-900">{bill.checkOut}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Created</div>
                      <div className="text-gray-900">{bill.createdDate}</div>
                    </div>
                    {bill.paymentMethod && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Payment</div>
                        <div className="text-gray-900">{bill.paymentMethod}</div>
                      </div>
                    )}
                  </div>

                  {/* Bill Items */}
                  <div className="mb-6">
                    <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Items</div>
                    <div className="space-y-2">
                      {bill.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.description}</span>
                          <span className="text-gray-900">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    {(bill.status === 'pending' || bill.status === 'partial') && (
                      <button 
                        onClick={() => handlePayNow(bill.id)}
                        className="px-4 py-2 bg-black text-white text-xs hover:bg-gray-900 transition-colors"
                      >
                        Pay Now
                      </button>
                    )}
                    {bill.status === 'overdue' && (
                      <button 
                        onClick={() => handleSendReminder(bill.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-xs hover:bg-black transition-colors"
                      >
                        Send Reminder
                      </button>
                    )}
                    <button 
                      onClick={() => handlePrintBill(bill.id)}
                      className="px-4 py-2 border border-gray-200 text-black text-xs hover:border-black transition-colors"
                    >
                      Print
                    </button>
                    <button 
                      onClick={() => handleViewDetails(bill.id)}
                      className="px-4 py-2 border border-gray-200 text-black text-xs hover:border-black transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Demo with sample data
const mockBills = [
  {
    id: 'BILL001',
    guestName: 'John Smith',
    roomNumber: '101',
    checkIn: '2024-01-10',
    checkOut: '2024-01-15',
    billType: 'room',
    amount: 750.00,
    status: 'paid',
    paymentMethod: 'Credit Card',
    createdDate: '2024-01-15 14:30',
    items: [
      { description: 'Room Charges (5 nights)', amount: 500.00 },
      { description: 'Room Service', amount: 150.00 },
      { description: 'Minibar', amount: 75.00 },
      { description: 'Tax', amount: 25.00 }
    ]
  },
  {
    id: 'BILL002',
    guestName: 'Emily Johnson',
    roomNumber: '205',
    checkIn: '2024-01-12',
    checkOut: '2024-01-18',
    billType: 'service',
    amount: 320.50,
    status: 'pending',
    paymentMethod: null,
    createdDate: '2024-01-18 11:15',
    items: [
      { description: 'Spa Services', amount: 200.00 },
      { description: 'Restaurant', amount: 95.50 },
      { description: 'Tax', amount: 25.00 }
    ]
  },
  {
    id: 'BILL003',
    guestName: 'Michael Brown',
    roomNumber: '301',
    checkIn: '2024-01-14',
    checkOut: '2024-01-16',
    billType: 'room',
    amount: 1250.00,
    status: 'overdue',
    paymentMethod: null,
    createdDate: '2024-01-16 16:45',
    items: [
      { description: 'Suite Charges (2 nights)', amount: 1000.00 },
      { description: 'Conference Room', amount: 150.00 },
      { description: 'Business Services', amount: 50.00 },
      { description: 'Tax', amount: 50.00 }
    ]
  },
  {
    id: 'BILL004',
    guestName: 'Sarah Davis',
    roomNumber: '102',
    checkIn: '2024-01-13',
    checkOut: '2024-01-20',
    billType: 'partial',
    amount: 450.25,
    status: 'partial',
    paymentMethod: 'Cash',
    createdDate: '2024-01-17 09:30',
    items: [
      { description: 'Additional Services', amount: 300.00 },
      { description: 'Laundry', amount: 125.25 },
      { description: 'Tax', amount: 25.00 }
    ]
  }
];

export default () => <Billing bills={mockBills} />;