// src/components/common/EnhancedForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { cn } from '../../utils/common';

const EnhancedForm = ({ 
  schema, 
  defaultValues = {}, 
  onSubmit, 
  children, 
  className = '',
  mode = 'onChange' 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    watch,
    setValue,
    getValues,
    reset,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode,
  });

  const formMethods = {
    register,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    watch,
    setValue,
    getValues,
    reset,
    clearErrors,
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={cn('space-y-4', className)}
      noValidate
    >
      {typeof children === 'function' ? children(formMethods) : children}
    </form>
  );
};

// Input field component
export const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  register, 
  errors, 
  placeholder = '',
  required = false,
  className = '',
  ...props 
}) => {
  const error = errors[name];
  
  return (
    <div className={cn('form-group', className)}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
        {...register(name)}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// Select field component
export const FormSelect = ({ 
  label, 
  name, 
  options = [], 
  register, 
  errors, 
  placeholder = 'Select an option',
  required = false,
  className = '',
  ...props 
}) => {
  const error = errors[name];
  
  return (
    <div className={cn('form-group', className)}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
        {...register(name)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// Textarea field component
export const FormTextarea = ({ 
  label, 
  name, 
  register, 
  errors, 
  placeholder = '',
  required = false,
  rows = 3,
  className = '',
  ...props 
}) => {
  const error = errors[name];
  
  return (
    <div className={cn('form-group', className)}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'resize-vertical',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
        )}
        {...register(name)}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

// Submit button component
export const FormSubmitButton = ({ 
  children, 
  isSubmitting, 
  disabled = false,
  className = '',
  variant = 'primary',
  ...props 
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {isSubmitting ? 'Submitting...' : children}
    </button>
  );
};

export default EnhancedForm;