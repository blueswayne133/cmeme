// src/utils/kycHelpers.js
export const getKycStatusColor = (status) => {
  switch (status) {
    case 'verified': return 'text-green-400 bg-green-400/10';
    case 'pending': return 'text-yellow-400 bg-yellow-400/10';
    case 'rejected': return 'text-red-400 bg-red-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
};

export const getKycStatusIcon = (status) => {
  switch (status) {
    case 'verified': return 'CheckCircle';
    case 'pending': return 'AlertTriangle';
    case 'rejected': return 'XCircle';
    default: return 'FileText';
  }
};

export const formatDocumentType = (type) => {
  const types = {
    'passport': 'Passport',
    'drivers_license': "Driver's License",
    'national_id': 'National ID Card'
  };
  return types[type] || type;
};

export const calculateVerificationScore = (score) => {
  return Math.round((score || 0) * 100);
};