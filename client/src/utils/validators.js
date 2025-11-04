// Email validator
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validator (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?91[-\s]?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Required field validator
export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return value !== null && value !== undefined;
};

// Positive number validator
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

// Min/Max validator
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Form validator
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !isRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Invalid email address';
    } else if (fieldRules.phone && !isValidPhone(value)) {
      errors[field] = 'Invalid phone number';
    } else if (fieldRules.min && parseFloat(value) < fieldRules.min) {
      errors[field] = `Minimum value is ${fieldRules.min}`;
    } else if (fieldRules.max && parseFloat(value) > fieldRules.max) {
      errors[field] = `Maximum value is ${fieldRules.max}`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};