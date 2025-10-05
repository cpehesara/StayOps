import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';

const PaymentAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // This would connect to your payment API
      // const data = await getPaymentTransactions(filterStatus);
      // setPayments(data);
      
      // Placeholder data
      const placeholderData = [
        {
          id: 1,
          reservationId: 'RES001',
          guestName: 'John Doe',
          amount: 250.00,
          status: 'COMPLETED',
          paymentMethod: 'CREDIT_CARD',
          processedAt: new Date().toISOString(),
          transactionId: 'TXN123456'
        },
        {
          id: 2,
          reservationId: 'RES002',
          guestName: 'Jane Smith',
          amount: 180.00,
          status: 'PENDING',
          paymentMethod: 'DEBIT_CARD',
          scheduledAt: new Date().toISOString()
        }
      ];
      
      setPayments(placeholderData);
      
      // Calculate stats
      const completed = placeholderData.filter(p => p.status === 'COMPLETED');
      const pending = placeholderData.filter(p => p.status === 'PENDING');
      const failed = placeholderData.filter(p => p.status === 'FAILED');
      
      setStats({
        completed: completed.length,
        pending: pending.length,
        failed: failed.length,
        totalAmount: completed.reduce((sum, p) => sum + p.amount, 0)
      });
      
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'PENDING':
        return <Clock size={20} className="text-yellow-600" />;
      case 'FAILED':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertTriangle size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Payment Automation
          </h1>
          <p className="text-sm text-gray-500">
            Automated payment processing and tracking
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={24} className="text-green-600" />
              <h3 className="text-sm font-medium">Completed</h3>
            </div>
            <div className="text-3xl font-light">{stats.completed}</div>
          </div>

          <div className="border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={24} className="text-yellow-600" />
              <h3 className="text-sm font-medium">Pending</h3>
            </div>
            <div className="text-3xl font-light">{stats.pending}</div>
          </div>

          <div className="border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <XCircle size={24} className="text-red-600" />
              <h3 className="text-sm font-medium">Failed</h3>
            </div>
            <div className="text-3xl font-light">{stats.failed}</div>
          </div>

          <div className="border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign size={24} className="text-black" />
              <h3 className="text-sm font-medium">Total Processed</h3>
            </div>
            <div className="text-3xl font-light">${stats.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 text-sm border transition-colors ${
              filterStatus === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 text-sm border transition-colors ${
              filterStatus === 'pending'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 text-sm border transition-colors ${
              filterStatus === 'completed'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('failed')}
            className={`px-4 py-2 text-sm border transition-colors ${
              filterStatus === 'failed'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Failed
          </button>
        </div>

        {/* Payment List */}
        <div>
          {loading && payments.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm text-gray-500">No payment transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment.id} className="border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <h3 className="font-medium">
                            {payment.guestName}
                          </h3>
                          <div className="text-sm text-gray-500">
                            Reservation: {payment.reservationId}
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <div className="font-medium text-lg">
                            ${payment.amount.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Method:</span>
                          <div className="font-medium">
                            {payment.paymentMethod?.replace(/_/g, ' ')}
                          </div>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <span className="text-gray-500">Transaction ID:</span>
                            <div className="font-medium font-mono text-xs">
                              {payment.transactionId}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">
                            {payment.status === 'COMPLETED' ? 'Processed:' : 'Scheduled:'}
                          </span>
                          <div className="font-medium text-xs">
                            {new Date(payment.processedAt || payment.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {payment.failureReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200">
                          <div className="text-sm text-red-800 font-medium">Failure Reason:</div>
                          <div className="text-sm text-red-700">{payment.failureReason}</div>
                        </div>
                      )}

                      {payment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-medium mb-1">Notes:</div>
                          <div className="text-xs text-gray-700">{payment.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Automation Settings */}
        <div className="mt-12 border border-gray-200 p-6">
          <h3 className="font-medium mb-6">Automation Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200">
              <div>
                <div className="font-medium mb-1">Auto-charge at checkout</div>
                <div className="text-sm text-gray-500">
                  Automatically process payment when guest checks out
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200">
              <div>
                <div className="font-medium mb-1">Retry failed payments</div>
                <div className="text-sm text-gray-500">
                  Automatically retry failed transactions after 24 hours
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200">
              <div>
                <div className="font-medium mb-1">Send payment receipts</div>
                <div className="text-sm text-gray-500">
                  Email receipts automatically after successful payment
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAutomation;