import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('https://kangemi-backend.onrender.com/api/members');
        const data = await response.json();
        setMembers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: ''
    });
    setEditMode(false);
    setCurrentMemberId(null);
    setShowModal(false);
  };

  // Open modal for adding new member
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Create new member or update existing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const url = editMode 
        ? `https://kangemi-backend.onrender.com/api/members/${currentMemberId}`
        : 'https://kangemi-backend.onrender.com/api/members';
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (editMode) {
        setMembers(members.map(member => 
          member._id === currentMemberId ? data : member
        ));
        toast.success('Member updated successfully');
      } else {
        setMembers([...members, data]);
        toast.success('Member added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member');
    } finally {
      setIsProcessing(false);
    }
  };

  // Edit member - open modal with member data
  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email
    });
    setEditMode(true);
    setCurrentMemberId(member._id);
    setShowModal(true);
  };

  // Delete member
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`https://kangemi-backend.onrender.com/api/members/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers(members.filter(member => member._id !== id));
        toast.success('Member deleted successfully');
      } else {
        throw new Error('Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
    <div className='flex flex-col md:flex-row justify-between'  >
           <div>
         <h1 className="text-3xl font-bold mb-8 text-blue-800">Kangemi Church Members</h1>
     </div>
      
      {/* Add Member Button */}
      <div className="mb-8">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Member
        </button>
      </div>
    </div>

      {/* Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editMode ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button 
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : editMode ? (
                    <>
                      <FaUserEdit className="mr-2" />
                      Update Member
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{member.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {member.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {member.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(member.joinDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            disabled={isProcessing}
                          >
                            <FaUserEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isProcessing}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Members;