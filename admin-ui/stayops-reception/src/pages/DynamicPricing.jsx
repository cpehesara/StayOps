import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, Calendar } from 'lucide-react';
import {
  getAllPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  triggerPriceUpdate
} from '../api/automation';

const DynamicPricing = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    roomType: '',
    ruleType: 'OCCUPANCY_BASED',
    minOccupancy: 0,
    maxOccupancy: 100,
    priceAdjustmentPercent: 0,
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    loadPricingRules();
  }, []);

  const loadPricingRules = async () => {
    try {
      setLoading(true);
      const data = await getAllPricingRules();
      setRules(data);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
      alert('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const ruleData = {
        ...formData,
        daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek.join(',') : null
      };

      if (editingRule) {
        await updatePricingRule(editingRule.id, ruleData);
        alert('Pricing rule updated successfully');
      } else {
        await createPricingRule(ruleData);
        alert('Pricing rule created successfully');
      }
      
      resetForm();
      loadPricingRules();
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      alert('Failed to save pricing rule');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      roomType: rule.roomType || '',
      ruleType: rule.ruleType,
      minOccupancy: rule.minOccupancy || 0,
      maxOccupancy: rule.maxOccupancy || 100,
      priceAdjustmentPercent: rule.priceAdjustmentPercent,
      startDate: rule.startDate || '',
      endDate: rule.endDate || '',
      daysOfWeek: rule.daysOfWeek ? rule.daysOfWeek.split(',') : [],
      isActive: rule.isActive,
      priority: rule.priority || 1
    });
    setShowForm(true);
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this pricing rule?')) return;
    
    try {
      setLoading(true);
      await deletePricingRule(ruleId);
      alert('Pricing rule deleted successfully');
      loadPricingRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete pricing rule');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerUpdate = async () => {
    if (!window.confirm('Trigger immediate price update for all rooms?')) return;
    
    try {
      setLoading(true);
      const result = await triggerPriceUpdate();
      alert(result.message || 'Price update completed successfully');
      loadPricingRules();
    } catch (error) {
      console.error('Error triggering price update:', error);
      alert('Failed to trigger price update');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      roomType: '',
      ruleType: 'OCCUPANCY_BASED',
      minOccupancy: 0,
      maxOccupancy: 100,
      priceAdjustmentPercent: 0,
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      isActive: true,
      priority: 1
    });
    setEditingRule(null);
    setShowForm(false);
  };

  const toggleDayOfWeek = (day) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-light tracking-tight text-black mb-2">
                Dynamic Pricing
              </h1>
              <p className="text-sm text-gray-500">
                Manage automated pricing rules and adjustments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleTriggerUpdate}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <TrendingUp size={18} />
                Update Prices Now
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                New Pricing Rule
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border-2 border-black p-8 max-w-2xl w-11/12 max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-light mb-6">
                {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rule Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rule Type *</label>
                      <select
                        value={formData.ruleType}
                        onChange={(e) => setFormData({...formData, ruleType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
                        required
                      >
                        <option value="OCCUPANCY_BASED">Occupancy Based</option>
                        <option value="DATE_BASED">Date Based</option>
                        <option value="DAY_OF_WEEK">Day of Week</option>
                        <option value="SEASONAL">Seasonal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Room Type</label>
                      <input
                        type="text"
                        value={formData.roomType}
                        onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                        placeholder="Leave empty for all types"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Occupancy %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.minOccupancy}
                        onChange={(e) => setFormData({...formData, minOccupancy: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Max Occupancy %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.maxOccupancy}
                        onChange={(e) => setFormData({...formData, maxOccupancy: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price Adjustment % *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.priceAdjustmentPercent}
                      onChange={(e) => setFormData({...formData, priceAdjustmentPercent: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      placeholder="e.g., 15 for +15%, -10 for -10%"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Positive for increase, negative for decrease
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Days of Week</label>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeek.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayOfWeek(day)}
                          className={`px-3 py-2 text-xs border transition-colors ${
                            formData.daysOfWeek.includes(day)
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-200 hover:border-black'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Higher priority rules are applied first
                      </p>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Active</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300"
                  >
                    {loading ? 'Saving...' : (editingRule ? 'Update Rule' : 'Create Rule')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-200 text-black text-sm hover:border-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pricing Rules List */}
        <div>
          <h2 className="text-2xl font-light mb-6">Active Pricing Rules</h2>
          
          {loading && rules.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Loading pricing rules...
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm text-gray-500">No pricing rules configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{rule.name}</h3>
                        <span className={`px-3 py-1 text-xs ${
                          rule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Type: {rule.ruleType}</div>
                        {rule.roomType && <div>Room Type: {rule.roomType}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 border border-gray-200 hover:border-black transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Adjustment:</span>
                      <div className={`font-medium ${
                        rule.priceAdjustmentPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {rule.priceAdjustmentPercent > 0 ? '+' : ''}{rule.priceAdjustmentPercent}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Occupancy:</span>
                      <div className="font-medium">{rule.minOccupancy}% - {rule.maxOccupancy}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <div className="font-medium">{rule.priority}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Period:</span>
                      <div className="font-medium">
                        {rule.startDate && rule.endDate 
                          ? `${rule.startDate} to ${rule.endDate}`
                          : 'Ongoing'}
                      </div>
                    </div>
                  </div>

                  {rule.daysOfWeek && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Days: </span>
                      <span className="font-medium">{rule.daysOfWeek}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPricing;