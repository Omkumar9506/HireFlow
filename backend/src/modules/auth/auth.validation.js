export const validateRegister = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }
  if (!data.password || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }
  return errors;
};

export const validateLogin = (data) => {
  const errors = [];
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  return errors;
};
