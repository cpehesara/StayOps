import React, { useState, useEffect } from 'react';
import '../styles/billing.css';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // TODO: Fetch bills from API
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await billingAPI.getAllBills();
      // setBills(data);
      
      // Temporary: Set empty array
      setBills([]);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (billId) => {
    console.log(`Processing payment for bill ${billId}`);
    // TODO: Implement payment processing with API
  };

  const handleSendReminder = (billId) => {
    console.log(`Sending reminder for bill ${billId}`);
    // TODO: Implement reminder functionality with API
  };

  const handleViewDetails = (billId) => {
    console.log(`Viewing details for bill ${billId}`);
    // TODO: Implement view details modal or navigation
  };

  const handlePrintBill = (billId) => {
    console.log(`Printing bill ${billId}`);
    // TODO: Implement print functionality
  };

  const handleNewBill = () => {
    console.log('Creating new bill');
    // TODO: Implement new bill creation
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.roomNumber?.includes(searchTerm) ||
                         bill.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesType = filterType === 'all' || bill.billType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="billing-container">
      <div className="billing-wrapper">
        
        {/* Header */}
        <div className="billing-header">
          <h1 className="billing-title">Billing</h1>
          <p className="billing-subtitle">Manage payments and transactions</p>
        </div>

        {/* Stats Grid */}
        <div className="billing-stats">
          <div className="stat-card">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">${pendingAmount.toFixed(2)}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">${overdueAmount.toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Bills</div>
            <div className="stat-value">{bills.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="billing-controls">
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
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
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="room">Room</option>
            <option value="service">Service</option>
            <option value="partial">Partial</option>
            <option value="restaurant">Restaurant</option>
          </select>

          <button onClick={handleNewBill} className="btn-new-bill">
            New Bill
          </button>
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="empty-state">
            <p className="empty-state-text">Loading bills...</p>
          </div>
        ) : (
          <div className="bills-list">
            {filteredBills.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">
                  {bills.length === 0 ? 'No bills available' : 'No bills found matching your search'}
                </p>
              </div>
            ) : (
              filteredBills.map((bill) => (
                <div key={bill.id} className="bill-card">
                  <div className="bill-card-content">
                    
                    {/* Bill Header */}
                    <div className="bill-header">
                      <div className="bill-info">
                        <div className="bill-info-top">
                          <h3 className="bill-guest-name">{bill.guestName}</h3>
                          <span className="bill-id">{bill.id}</span>
                        </div>
                        <p className="bill-meta">
                          Room {bill.roomNumber} · {bill.billType}
                        </p>
                      </div>
                      
                      <div className="bill-amount-section">
                        <div className="bill-amount">${bill.amount.toFixed(2)}</div>
                        <span className={`bill-status ${bill.status}`}>
                          {bill.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bill Details Grid */}
                    <div className="bill-details-grid">
                      <div className="bill-detail-item">
                        <div className="bill-detail-label">Check In</div>
                        <div className="bill-detail-value">{bill.checkIn}</div>
                      </div>
                      <div className="bill-detail-item">
                        <div className="bill-detail-label">Check Out</div>
                        <div className="bill-detail-value">{bill.checkOut}</div>
                      </div>
                      <div className="bill-detail-item">
                        <div className="bill-detail-label">Created</div>
                        <div className="bill-detail-value">{bill.createdDate}</div>
                      </div>
                      {bill.paymentMethod && (
                        <div className="bill-detail-item">
                          <div className="bill-detail-label">Payment</div>
                          <div className="bill-detail-value">{bill.paymentMethod}</div>
                        </div>
                      )}
                    </div>

                    {/* Bill Items */}
                    {bill.items && bill.items.length > 0 && (
                      <div className="bill-items-section">
                        <div className="bill-items-title">Items</div>
                        <div className="bill-items-list">
                          {bill.items.map((item, index) => (
                            <div key={index} className="bill-item">
                              <span className="bill-item-description">{item.description}</span>
                              <span className="bill-item-amount">${item.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="bill-actions">
                      {(bill.status === 'pending' || bill.status === 'partial') && (
                        <button 
                          onClick={() => handlePayNow(bill.id)}
                          className="btn-pay-now"
                        >
                          Pay Now
                        </button>
                      )}
                      {bill.status === 'overdue' && (
                        <button 
                          onClick={() => handleSendReminder(bill.id)}
                          className="btn-send-reminder"
                        >
                          Send Reminder
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrintBill(bill.id)}
                        className="btn-print"
                      >
                        Print
                      </button>
                      <button 
                        onClick={() => handleViewDetails(bill.id)}
                        className="btn-details"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;