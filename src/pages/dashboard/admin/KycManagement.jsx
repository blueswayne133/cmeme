// src/pages/admin/KycManagement.jsx
import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import api from "../../../utils/api";

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    try {
      const response = await api.get('/admin/kyc/pending');
      setKycRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId) => {
    try {
      await api.post(`/admin/kyc/${kycId}/approve`);
      fetchKycRequests();
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const handleReject = async (kycId, reason) => {
    try {
      await api.post(`/admin/kyc/${kycId}/reject`, { reason });
      fetchKycRequests();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  const openPreview = (request) => {
    setSelectedRequest(request);
    setPreviewModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Verifications</h1>
        <p className="text-gray-400">Review and manage user identity verification requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <p className="text-2xl font-bold text-white">{kycRequests.length}</p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved Today</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected Today</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <XCircle className="text-red-400" size={24} />
          </div>
        </div>
      </div>

      {/* KYC Requests Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    Loading KYC requests...
                  </td>
                </tr>
              ) : kycRequests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    No pending KYC requests
                  </td>
                </tr>
              ) : (
                kycRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {request.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.user?.username}</p>
                          <p className="text-gray-400 text-sm">{request.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white capitalize">
                      {request.document_type?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(request.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPreview(request)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View Documents"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id, 'Document unclear')}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">KYC Document Review</h2>
              <button
                onClick={() => setPreviewModal(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Document Front</h3>
                  <div className="bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                    <img 
                      src={selectedRequest.document_front_path} 
                      alt="Document Front"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Document Back</h3>
                  <div className="bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                    <img 
                      src={selectedRequest.document_back_path} 
                      alt="Document Back"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Approve KYC
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id, 'Document verification failed')}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycManagement;