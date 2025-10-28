import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, Download, AlertTriangle, FileText, Trash2 } from "lucide-react";
import api from "../../../utils/api";

const KycManagement = () => {
  const [kycList, setKycList] = useState([]);
  const [filteredKyc, setFilteredKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    documentType: 'all',
    search: ''
  });

  useEffect(() => {
    fetchKycList();
  }, []);

  useEffect(() => {
    filterKycList();
  }, [kycList, filters]);

  const fetchKycList = async () => {
    try {
      const response = await api.get('/admin/kyc');
      setKycList(response.data.data);
    } catch (error) {
      console.error('Error fetching KYC list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterKycList = () => {
    let filtered = kycList;

    if (filters.status !== 'all') {
      filtered = filtered.filter(kyc => kyc.status === filters.status);
    }

    if (filters.documentType !== 'all') {
      filtered = filtered.filter(kyc => kyc.document_type === filters.documentType);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(kyc => 
        kyc.user?.username?.toLowerCase().includes(searchLower) ||
        kyc.user?.email?.toLowerCase().includes(searchLower) ||
        kyc.document_number?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredKyc(filtered);
  };

  const viewKycDetails = async (kycId) => {
    try {
      const response = await api.get(`/admin/kyc/${kycId}`);
      setSelectedKyc(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching KYC details:', error);
    }
  };

  const approveKyc = async (kycId) => {
    try {
      await api.post(`/admin/kyc/${kycId}/approve`);
      await fetchKycList();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Failed to approve KYC');
    }
  };

  const rejectKyc = async (kycId, reason) => {
    if (!reason) return;
    
    try {
      await api.post(`/admin/kyc/${kycId}/reject`, { reason });
      await fetchKycList();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Failed to reject KYC');
    }
  };

  const deleteKyc = async (kycId) => {
    if (!confirm('Are you sure you want to delete this KYC submission? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/kyc/${kycId}`);
      await fetchKycList();
      if (showModal && selectedKyc?.id === kycId) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting KYC:', error);
      alert('Failed to delete KYC submission');
    }
  };

  const downloadDocument = async (kycId, documentType) => {
    try {
      const response = await api.get(`/admin/kyc/${kycId}/document/${documentType}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentType}_${kycId}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle size={16} />;
      case 'pending': return <AlertTriangle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">KYC Management</h1>
        <p className="text-gray-400 text-sm md:text-base">Manage user identity verification requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total KYC</p>
              <p className="text-xl md:text-2xl font-bold text-white">{kycList.length}</p>
            </div>
            <div className="p-2 md:p-3 rounded-full bg-blue-500">
              <FileText size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Pending</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {kycList.filter(k => k.status === 'pending').length}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-full bg-yellow-500">
              <AlertTriangle size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Verified</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {kycList.filter(k => k.status === 'verified').length}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-full bg-green-500">
              <CheckCircle size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Rejected</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {kycList.filter(k => k.status === 'rejected').length}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-full bg-red-500">
              <XCircle size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by username, email, or document number..."
                className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm md:text-base"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            className="px-3 md:px-4 py-2 md:py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm md:text-base"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Document Type Filter */}
          <select
            className="px-3 md:px-4 py-2 md:py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm md:text-base"
            value={filters.documentType}
            onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
          >
            <option value="all">All Document Types</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
            <option value="national_id">National ID</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4 mb-6">
        {filteredKyc.map((kyc) => (
          <div key={kyc.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-white font-medium truncate">{kyc.user?.username}</p>
                <p className="text-gray-400 text-sm truncate">{kyc.user?.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kyc.status)} whitespace-nowrap ml-2`}>
                {getStatusIcon(kyc.status)}
                {kyc.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-gray-400 text-xs">Document Type</p>
                <p className="text-white text-sm truncate">{kyc.document_type_label}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Document No.</p>
                <p className="text-white font-mono text-xs truncate">{kyc.document_number}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-12 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(kyc.verification_score || 0) * 100}%` }}
                  ></div>
                </div>
                <span className="text-gray-300 text-xs">
                  {Math.round((kyc.verification_score || 0) * 100)}%
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => viewKycDetails(kyc.id)}
                  className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                {kyc.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveKyc(kyc.id)}
                      className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) rejectKyc(kyc.id, reason);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XCircle size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => downloadDocument(kyc.id, 'front')}
                  className="p-1.5 text-gray-400 hover:bg-gray-400/10 rounded-lg transition-colors"
                  title="Download Document"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => deleteKyc(kyc.id)}
                  className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete KYC"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">Document Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">Document Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">Submitted</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredKyc.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="min-w-[120px]">
                      <p className="text-white font-medium text-sm truncate">{kyc.user?.username}</p>
                      <p className="text-gray-400 text-xs truncate">{kyc.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-sm whitespace-nowrap">
                    {kyc.document_type_label || kyc.document_type}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs font-mono truncate max-w-[120px] block">
                      {kyc.document_number}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                    {new Date(kyc.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kyc.status)} whitespace-nowrap`}>
                      {getStatusIcon(kyc.status)}
                      {kyc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {kyc.verification_score && (
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="w-12 bg-gray-700 rounded-full h-2 flex-shrink-0">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(kyc.verification_score || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300 text-xs whitespace-nowrap">
                          {Math.round((kyc.verification_score || 0) * 100)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => viewKycDetails(kyc.id)}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {kyc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveKyc(kyc.id)}
                            className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) rejectKyc(kyc.id, reason);
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => downloadDocument(kyc.id, 'front')}
                        className="p-1.5 text-gray-400 hover:bg-gray-400/10 rounded-lg transition-colors"
                        title="Download Front"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => deleteKyc(kyc.id)}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete KYC"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredKyc.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">No KYC requests found</p>
            <p className="text-gray-500 text-sm">Adjust your filters to see more results</p>
          </div>
        )}
      </div>

      {/* KYC Detail Modal */}
      {showModal && selectedKyc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-white">KYC Verification Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {/* User Information */}
              <div>
                <h4 className="text-md md:text-lg font-semibold text-white mb-4">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Username</label>
                    <p className="text-white">{selectedKyc.user?.username}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white">{selectedKyc.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">User ID</label>
                    <p className="text-white">{selectedKyc.user_id}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Registration Date</label>
                    <p className="text-white">
                      {new Date(selectedKyc.user?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div>
                <h4 className="text-md md:text-lg font-semibold text-white mb-4">Document Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Document Type</label>
                    <p className="text-white">{selectedKyc.document_type_label}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Document Number</label>
                    <p className="text-white font-mono">{selectedKyc.document_number}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Submitted At</label>
                    <p className="text-white">
                      {new Date(selectedKyc.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Verification Score</label>
                    <div className="flex items-center gap-2">
                      <div className="w-24 md:w-32 bg-gray-700 rounded-full h-2 md:h-3">
                        <div 
                          className="bg-blue-500 h-2 md:h-3 rounded-full" 
                          style={{ width: `${(selectedKyc.verification_score || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">
                        {Math.round((selectedKyc.verification_score || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div>
                <h4 className="text-md md:text-lg font-semibold text-white mb-4">Document Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Front Side</label>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <img 
                        src={`/api/admin/kyc/${selectedKyc.id}/document/front`}
                        alt="Document Front"
                        className="w-full h-32 md:h-48 object-contain rounded"
                      />
                      <button
                        onClick={() => downloadDocument(selectedKyc.id, 'front')}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                      >
                        <Download size={16} />
                        Download Front
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Back Side</label>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <img 
                        src={`/api/admin/kyc/${selectedKyc.id}/document/back`}
                        alt="Document Back"
                        className="w-full h-32 md:h-48 object-contain rounded"
                      />
                      <button
                        onClick={() => downloadDocument(selectedKyc.id, 'back')}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                      >
                        <Download size={16} />
                        Download Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              {selectedKyc.verification_details && (
                <div>
                  <h4 className="text-md md:text-lg font-semibold text-white mb-4">Verification Details</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedKyc.verification_details.map((detail, index) => (
                        <li key={index} className="text-gray-300 flex items-center gap-2 text-sm">
                          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedKyc.status === 'pending' && (
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => approveKyc(selectedKyc.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm md:text-base"
                  >
                    <CheckCircle size={18} />
                    Approve KYC
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Please enter the rejection reason:');
                      if (reason) rejectKyc(selectedKyc.id, reason);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm md:text-base"
                  >
                    <XCircle size={18} />
                    Reject KYC
                  </button>
                </div>
              )}

              {/* Delete Button */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => deleteKyc(selectedKyc.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm md:text-base"
                >
                  <Trash2 size={18} />
                  Delete KYC Submission
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