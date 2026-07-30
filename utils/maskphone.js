

const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string' || phone.length < 10) {
    return '**********';
  }
  return `${phone.slice(0, 4)}****${phone.slice(-2)}`;
};

module.exports = maskPhoneNumber;