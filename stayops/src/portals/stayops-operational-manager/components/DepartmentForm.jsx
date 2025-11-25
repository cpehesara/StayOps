import React, { useState, useEffect } from 'react';
import { X, Building2, Save, User, Mail, Phone, MapPin, Clock, TrendingUp } from 'lucide-react';
import { departmentAPI } from '../api/department';
import '../styles/departmentForm.css';

const DepartmentForm = ({ 
  isOpen, 
  onClose, 
  department = null, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    email: '',
    phone: '',
    location: '',
    workingHours: '',
    status: 'ACTIVE',
    performance: 0,
    hotelId: 1 // This should be dynamically set based on the current hotel
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        headOfDepartment: department.headOfDepartment || department.head || '',
        email: department.email || '',
        phone: department.phone || '',
        location: department.location || '',
        workingHours: department.workingHours || department.hours || '',
        status: department.status || 'ACTIVE',
        performance: department.performance || 0,
        hotelId: 1 // This should be dynamically set
      });
    } else {
      // Reset form for new department
      setFormData({
        name: '',
        description: '',
        headOfDepartment: '',
        email: '',
        phone: '',
        location: '',
        workingHours: '',
        status: 'ACTIVE',
        performance: 0,
        hotelId: 1
      });
    }
    setErrors({});
  }, [department]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Department name cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.headOfDepartment && formData.headOfDepartment.length > 100) {
      newErrors.headOfDepartment = 'Head of department name cannot exceed 100 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.email && formData.email.length > 150) {
      newErrors.email = 'Email cannot exceed 150 characters';
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone cannot exceed 20 characters';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    if (formData.workingHours && formData.workingHours.length > 50) {
      newErrors.workingHours = 'Working hours cannot exceed 50 characters';
    }

    if (formData.performance < 0 || formData.performance > 100) {
      newErrors.performance = 'Performance must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let result;
      if (department?.id) {
        // Update existing department
        result = await departmentAPI.updateDepartment(department.id, formData);
      } else {
        // Create new department
        result = await departmentAPI.createDepartment(formData);
      }
      
      onSave(result);
      onClose();
    } catch (error) {
      console.error('Error saving department:', error);
      setErrors({ submit: error.message || 'Failed to save department' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <Building2 size={20} />
            <h2>{department ? 'Edit Department' : 'Create New Department'}</h2>
          </div>
          <button 
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">
                  <Building2 size={16} />
                  Department Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter department name"
                  className={errors.name ? 'error' : ''}
                  maxLength={100}
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter department description"
                  className={errors.description ? 'error' : ''}
                  maxLength={500}
                  rows={3}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>Contact Information</h3>
              
              <div className="form-group">
                <label htmlFor="headOfDepartment">
                  <User size={16} />
                  Head of Department
                </label>
                <input
                  id="headOfDepartment"
                  type="text"
                  value={formData.headOfDepartment}
                  onChange={(e) => handleInputChange('headOfDepartment', e.target.value)}
                  placeholder="Enter head of department name"
                  className={errors.headOfDepartment ? 'error' : ''}
                  maxLength={100}
                />
                {errors.headOfDepartment && <span className="error-text">{errors.headOfDepartment}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'error' : ''}
                  maxLength={150}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={16} />
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className={errors.phone ? 'error' : ''}
                  maxLength={20}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            {/* Operational Information */}
            <div className="form-section">
              <h3>Operational Information</h3>
              
              <div className="form-group">
                <label htmlFor="location">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                  className={errors.location ? 'error' : ''}
                  maxLength={100}
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="workingHours">
                  <Clock size={16} />
                  Working Hours
                </label>
                <input
                  id="workingHours"
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => handleInputChange('workingHours', e.target.value)}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                  className={errors.workingHours ? 'error' : ''}
                  maxLength={50}
                />
                {errors.workingHours && <span className="error-text">{errors.workingHours}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="performance">
                  <TrendingUp size={16} />
                  Performance Score (0-100)
                </label>
                <input
                  id="performance"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performance}
                  onChange={(e) => handleInputChange('performance', parseInt(e.target.value) || 0)}
                  placeholder="Enter performance score"
                  className={errors.performance ? 'error' : ''}
                />
                {errors.performance && <span className="error-text">{errors.performance}</span>}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : (department ? 'Update Department' : 'Create Department')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;