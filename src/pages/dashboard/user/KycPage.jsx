import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Upload, Check, X, AlertCircle, FileText, IdCard, CreditCard } from "lucide-react";
import api from "../../../utils/api";

const KycPage = () => {
  const [kycData, setKycData] = useState({
    kyc_status: 'not_submitted',
    document_type: '',
    kyc_submitted_at: null,
    kyc_verified_at: null,
    rejection_reason: null,
    is_verified: false
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    document_number: '',
    document_front: null,
    document_back: null
  });
  const [preview, setPreview] = useState({
    front: null,
    back: null
  });

  const { userData, refetchUserData } = useOutletContext();

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kyc/status');
      setKycData(response.data.data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [`document_${side}`]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(prev => ({
          ...prev,
          [side]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.document_type || !formData.document_number || !formData.document_front || !formData.document_back) {
      alert('Please fill all fields and upload both document sides');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('document_type', formData.document_type);
      submitData.append('document_number', formData.document_number);
      submitData.append('document_front', formData.document_front);
      submitData.append('document_back', formData.document_back);

      const response = await api.post('/kyc/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchKycStatus();
      if (refetchUserData) await refetchUserData();
      
      alert(response.data.message);
      
      // Reset form
      setFormData({
        document_type: '',
        document_number: '',
        document_front: null,
        document_back: null
      });
      setPreview({ front: null, back: null });

    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <Check size={20} />;
      case 'pending': return <AlertCircle size={20} />;
      case 'rejected': return <X size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">KYC Verification</h2>

      {/* Status Card */}
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border ${getStatusColor(kycData.kyc_status)}`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {getStatusIcon(kycData.kyc_status)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              KYC Status: {getStatusText(kycData.kyc_status)}
            </h3>
            {kycData.kyc_status === 'verified' && (
              <p className="text-sm opacity-80">
                Verified on {new Date(kycData.kyc_verified_at).toLocaleDateString()}
              </p>
            )}
            {kycData.kyc_status === 'pending' && (
              <p className="text-sm opacity-80">
                Submitted on {new Date(kycData.kyc_submitted_at).toLocaleDateString()} - Under automatic verification
              </p>
            )}
            {kycData.kyc_status === 'rejected' && kycData.rejection_reason && (
              <p className="text-sm opacity-80">
                Reason: {kycData.rejection_reason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KYC Form - Only show if not verified */}
      {kycData.kyc_status !== 'verified' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-6">Submit KYC Documents</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Document Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'passport', label: 'Passport', icon: IdCard },
                  { value: 'drivers_license', label: "Driver's License", icon: CreditCard },
                  { value: 'national_id', label: 'National ID', icon: FileText }
                ].map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <label
                      key={doc.value}
                      className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.document_type === doc.value
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="document_type"
                        value={doc.value}
                        checked={formData.document_type === doc.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <Icon size={24} className="mb-2 text-gray-300" />
                      <span className="text-sm font-medium text-gray-200 text-center">
                        {doc.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Document Number
              </label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleInputChange}
                placeholder="Enter your document number"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400"
              />
            </div>

            {/* Document Upload - Front */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Front of Document
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'front')}
                    className="sr-only"
                  />
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors h-48 flex items-center justify-center">
                    {preview.front ? (
                      <div className="relative w-full h-full">
                        <img
                          src={preview.front}
                          alt="Front preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Upload size={32} className="mx-auto mb-2" />
                        <p>Click to upload front side</p>
                        <p className="text-xs mt-1">JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Document Upload - Back */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Back of Document
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'back')}
                    className="sr-only"
                  />
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors h-48 flex items-center justify-center">
                    {preview.back ? (
                      <div className="relative w-full h-full">
                        <img
                          src={preview.back}
                          alt="Back preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Upload size={32} className="mx-auto mb-2" />
                        <p>Click to upload back side</p>
                        <p className="text-xs mt-1">JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || kycData.kyc_status === 'pending'}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit KYC Verification'}
            </button>
          </form>

          {/* Information */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h4 className="text-blue-400 font-semibold mb-2">Important Information</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Documents are automatically verified using our system</li>
              <li>• Ensure documents are clear and all information is visible</li>
              <li>• Supported documents: Passport, Driver's License, National ID</li>
              <li>• Verification typically completes within minutes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Verified Message */}
      {kycData.kyc_status === 'verified' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <Check size={48} className="text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-400 mb-2">KYC Verified Successfully!</h3>
          <p className="text-green-300">
            Your identity has been verified. You now have full access to all platform features.
          </p>
        </div>
      )}
    </div>
  );
};

export default KycPage;