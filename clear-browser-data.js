// Run this in the browser console to clear all auth data
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
console.log('All auth data cleared from localStorage');

// Or clear everything
// localStorage.clear();
// console.log('All localStorage data cleared');
