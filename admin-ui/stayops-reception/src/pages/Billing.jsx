import React, { useState } from 'react';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

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

  const filteredBills = mockBills.filter(bill => {
    const matchesSearch = bill.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.roomNumber.includes(searchTerm) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesType = filterType === 'all' || bill.billType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = mockBills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = mockBills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = mockBills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 border-b border-black pb-4">
        <h1 className="text-4xl font-bold text-black mb-2">
          BILLING MANAGEMENT
        </h1>
        <p className="text-gray-600 uppercase tracking-wide">
          Manage guest bills, payments and financial transactions
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 min-w-80">
          <input
            type="text"
            placeholder="Search by guest, room, or bill ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-gray-600"
        >
          <option value="all">ALL STATUS</option>
          <option value="paid">PAID</option>
          <option value="pending">PENDING</option>
          <option value="partial">PARTIAL</option>
          <option value="overdue">OVERDUE</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-gray-600"
        >
          <option value="all">ALL TYPES</option>
          <option value="room">ROOM CHARGES</option>
          <option value="service">SERVICE CHARGES</option>
          <option value="partial">PARTIAL BILLS</option>
          <option value="restaurant">RESTAURANT</option>
        </select>

        {/* New Bill Button */}
        <button className="px-6 py-3 bg-black text-white font-bold uppercase text-sm tracking-wide hover:bg-gray-800 transition-colors">
          + NEW BILL
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-2xl font-bold text-black mb-2">
              ${totalRevenue.toFixed(2)}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide text-sm">Total Revenue</p>
          </div>
        </div>
        
        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">⏳</div>
            <h3 className="text-2xl font-bold text-black mb-2">
              ${pendingAmount.toFixed(2)}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide text-sm">Pending Payment</p>
          </div>
        </div>
        
        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-2xl font-bold text-black mb-2">
              ${overdueAmount.toFixed(2)}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide text-sm">Overdue Amount</p>
          </div>
        </div>

        <div className="border-2 border-black p-6 bg-white">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-2xl font-bold text-black mb-2">
              {mockBills.length}
            </h3>
            <p className="text-black font-semibold uppercase tracking-wide text-sm">Total Bills</p>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <div className="border-2 border-black p-12 text-center bg-white">
            <p className="text-black font-semibold uppercase tracking-wide">No bills found</p>
          </div>
        ) : (
          filteredBills.map((bill) => (
            <div key={bill.id} className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-2xl">
                      {getBillIcon(bill.billType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-black">
                          {bill.guestName.toUpperCase()} - ROOM {bill.roomNumber}
                        </h3>
                        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                          {bill.id}
                        </span>
                      </div>
                      <p className="text-gray-600 uppercase tracking-wide text-sm font-semibold mb-2">
                        {bill.billType.replace('-', ' ')} BILL
                      </p>
                      <div className="text-3xl font-bold text-black">
                        ${bill.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-bold text-black uppercase">Check-in:</span>
                      <br />
                      <span className="text-gray-600">{bill.checkIn}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black uppercase">Check-out:</span>
                      <br />
                      <span className="text-gray-600">{bill.checkOut}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black uppercase">Created:</span>
                      <br />
                      <span className="text-gray-600">{bill.createdDate}</span>
                    </div>
                    {bill.paymentMethod && (
                      <div>
                        <span className="font-bold text-black uppercase">Payment:</span>
                        <br />
                        <span className="text-gray-600">{bill.paymentMethod}</span>
                      </div>
                    )}
                  </div>

                  {/* Bill Items */}
                  <div className="border-t border-gray-300 pt-3">
                    <p className="font-bold text-black uppercase text-sm mb-2">Bill Items:</p>
                    <div className="space-y-1">
                      {bill.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.description}</span>
                          <span className="font-semibold text-black">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Content */}
                <div className="flex flex-col gap-4 lg:items-end">
                  {/* Status Badge */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-2 border-2 border-black text-sm font-bold uppercase tracking-wide ${
                      bill.status === 'paid' ? 'bg-black text-white' : 
                      bill.status === 'overdue' ? 'bg-gray-800 text-white' : 
                      bill.status === 'partial' ? 'bg-gray-200 text-black' : 
                      'bg-white text-black'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {(bill.status === 'pending' || bill.status === 'partial') && (
                      <button 
                        onClick={() => handlePayNow(bill.id)}
                        className="px-4 py-2 bg-black text-white font-bold uppercase text-xs tracking-wide hover:bg-gray-800 transition-colors"
                      >
                        Pay Now
                      </button>
                    )}
                    {bill.status === 'overdue' && (
                      <button 
                        onClick={() => handleSendReminder(bill.id)}
                        className="px-4 py-2 bg-gray-800 text-white font-bold uppercase text-xs tracking-wide hover:bg-black transition-colors"
                      >
                        Send Reminder
                      </button>
                    )}
                    <button 
                      onClick={() => handlePrintBill(bill.id)}
                      className="px-4 py-2 border-2 border-black bg-white text-black font-bold uppercase text-xs tracking-wide hover:bg-gray-100 transition-colors"
                    >
                      Print
                    </button>
                    <button 
                      onClick={() => handleViewDetails(bill.id)}
                      className="px-4 py-2 border-2 border-black bg-white text-black font-bold uppercase text-xs tracking-wide hover:bg-gray-100 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Billing;