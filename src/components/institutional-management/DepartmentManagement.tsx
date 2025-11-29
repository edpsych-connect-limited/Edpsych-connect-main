/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';

interface Department {
  id: string;
  name: string;
  parentId?: string;
  headOfDepartment?: string;
  staffCount?: number;
  description?: string;
  createdAt?: string;
  institutionId?: string;
}

interface DepartmentManagementProps {
  id: string;
  initialDepartments?: Department[];
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ 
  id, 
  initialDepartments = [] 
}) => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [loading, setLoading] = useState<boolean>(initialDepartments.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    headOfDepartment: '',
    description: '',
  });

  useEffect(() => {
    if (initialDepartments.length > 0) {
      return;
    }
    
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/institutions/${id}/departments`);
        
        if (!response.ok) {
          throw new Error(`Error fetching departments: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDepartments(data);
      } catch (_err) {
        console.error('Error fetching departments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [id, initialDepartments.length]);

  const handleAddDepartment = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be an API call
      const mockNewDept = {
        ...newDepartment,
        id: `dept-${Date.now()}`,
        institutionId: id,
        createdAt: new Date().toISOString(),
        staffCount: 0
      };
      
      setDepartments([...departments, mockNewDept as Department]);
      setNewDepartment({
        name: '',
        headOfDepartment: '',
        description: '',
      });
      setShowAddModal(false);
    } catch (_err) {
      console.error('Error adding department:', err);
      setError('Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!currentDepartment) return;
    
    try {
      setLoading(true);
      // In a real implementation, this would be an API call
      const updatedDepartments = departments.map(dept => 
        dept.id === currentDepartment.id ? currentDepartment : dept
      );
      
      setDepartments(updatedDepartments);
      setShowEditModal(false);
      setCurrentDepartment(null);
    } catch (_err) {
      console.error('Error updating department:', err);
      setError('Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!currentDepartment) return;
    
    try {
      setLoading(true);
      // In a real implementation, this would be an API call
      const filteredDepartments = departments.filter(dept => dept.id !== currentDepartment.id);
      
      setDepartments(filteredDepartments);
      setShowDeleteModal(false);
      setCurrentDepartment(null);
    } catch (_err) {
      console.error('Error deleting department:', err);
      setError('Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  if (loading && departments.length === 0) {
    return <div className="flex justify-center items-center h-40">Loading departments...</div>;
  }

  if (error && departments.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4">
        <h3 className="font-bold mb-2">Error Loading Departments</h3>
        <p>{error}</p>
        <button 
          className="mt-2 text-red-600 underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Departments</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          Add Department
        </button>
      </div>
      
      {departments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-500 mb-4">No departments have been added yet.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            Add Your First Department
          </button>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head of Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{department.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{department.headOfDepartment || 'Not assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{department.staffCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => {
                        setCurrentDepartment(department);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        setCurrentDepartment(department);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Add New Department</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Department Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                placeholder="Enter department name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Head of Department
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newDepartment.headOfDepartment || ''}
                onChange={(e) => setNewDepartment({...newDepartment, headOfDepartment: e.target.value})}
                placeholder="Enter head of department"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newDepartment.description || ''}
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                placeholder="Enter department description"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddDepartment}
                disabled={!newDepartment.name}
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Department Modal */}
      {showEditModal && currentDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Edit Department</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Department Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentDepartment.name}
                onChange={(e) => setCurrentDepartment({...currentDepartment, name: e.target.value})}
                placeholder="Enter department name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Head of Department
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentDepartment.headOfDepartment || ''}
                onChange={(e) => setCurrentDepartment({...currentDepartment, headOfDepartment: e.target.value})}
                placeholder="Enter head of department"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Staff Count
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentDepartment.staffCount || 0}
                onChange={(e) => setCurrentDepartment({...currentDepartment, staffCount: parseInt(e.target.value) || 0})}
                placeholder="Enter staff count"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentDepartment.description || ''}
                onChange={(e) => setCurrentDepartment({...currentDepartment, description: e.target.value})}
                placeholder="Enter department description"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleEditDepartment}
                disabled={!currentDepartment.name}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Department Confirmation Modal */}
      {showDeleteModal && currentDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Delete Department</h3>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{currentDepartment.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDeleteDepartment}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;