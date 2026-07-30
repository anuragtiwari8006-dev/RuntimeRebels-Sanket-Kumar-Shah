// Mask phone number for zero-trust privacy (e.g., 9208699626 -> 9208****26)
function maskPhoneNumber(phone) {
  if (!phone || phone.length < 6) return phone;
  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  const maskedLength = phone.length - 6;
  return `${start}${'*'.repeat(maskedLength)}${end}`;
}

module.exports = maskPhoneNumber;