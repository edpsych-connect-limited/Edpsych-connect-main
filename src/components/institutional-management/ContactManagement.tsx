import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  department?: string;
  institutionId: string;
}

interface ContactManagementProps {
  id: string;
  initialContacts?: Contact[];
}

const ContactManagement: React.FC<ContactManagementProps> = ({ 
  id,
  initialContacts = [] 
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [loading, setLoading] = useState<boolean>(initialContacts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    isPrimary: false,
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchContacts = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/institutions/${id}/contacts`);
      
      if (!response.ok) {
        throw new Error(`Error fetching contacts: ${response.statusText}`);
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading contacts');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (initialContacts.length === 0) {
      fetchContacts();
    }
  }, [id, initialContacts, fetchContacts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      isPrimary: false,
      department: ''
    });
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/institutions/${id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          institutionId: id
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating contact: ${response.statusText}`);
      }

      const newContact = await response.json();
      
      // If the new contact is primary, update other contacts
      if (newContact.isPrimary) {
        setContacts(prev => prev.map(contact => ({
          ...contact,
          isPrimary: contact.id === newContact.id
        })));
      } else {
        setContacts(prev => [...prev, newContact]);
      }
      
      setShowAddModal(false);
      resetFormData();
    } catch (err) {
      console.error('Error adding contact:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while adding the contact');
    }
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentContact) return;
    
    try {
      const response = await fetch(`/api/institutions/${id}/contacts/${currentContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error updating contact: ${response.statusText}`);
      }

      const updatedContact = await response.json();
      
      // Update contacts state
      setContacts(prev => prev.map(contact => {
        if (contact.id === updatedContact.id) {
          return updatedContact;
        }
        
        // If the updated contact is now primary, make sure others are not
        if (updatedContact.isPrimary && contact.isPrimary) {
          return {
            ...contact,
            isPrimary: contact.id === updatedContact.id
          };
        }
        
        return contact;
      }));
      
      setShowEditModal(false);
      setCurrentContact(null);
    } catch (err) {
      console.error('Error updating contact:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/institutions/${id}/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting contact: ${response.statusText}`);
      }

      // Remove from state
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the contact');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const response = await fetch(`/api/institutions/${id}/contacts/${id}/set-primary`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Error setting primary contact: ${response.statusText}`);
      }

      // Update state to reflect the new primary contact
      setContacts(prev => prev.map(contact => ({
        ...contact,
        isPrimary: contact.id === id
      })));
    } catch (err) {
      console.error('Error setting primary contact:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while setting the primary contact');
    }
  };

  const prepareEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      email: contact.email,
      phone: contact.phone || '',
      isPrimary: contact.isPrimary,
      department: contact.department || ''
    });
    setShowEditModal(true);
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(term) ||
      contact.role.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term) ||
      (contact.department?.toLowerCase().includes(term) || false)
    );
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading contacts...</div>;
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 text-red-500 rounded">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchContacts}
          className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm mt-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Contacts</h2>
          <p className="text-gray-600">Manage institution contacts</p>
        </div>
        <button
          onClick={() => {
            resetFormData();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Contact
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded w-full"
          />
        </div>

        {contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contacts found. Add a contact to get started.
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contacts match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.role}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">{contact.email}</a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="text-sm text-gray-900">{contact.phone}</a>
                      ) : (
                        <span className="text-sm text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.department || 'General'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {contact.isPrimary ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Primary Contact
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimary(contact.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Set as Primary
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => prepareEditContact(contact)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Add New Contact</h3>
            <form onSubmit={handleAddContact}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role *</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                    Set as primary contact
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && currentContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Edit Contact</h3>
            <form onSubmit={handleEditContact}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">Role *</label>
                  <input
                    type="text"
                    id="edit-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    id="edit-department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-isPrimary"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit-isPrimary" className="ml-2 block text-sm text-gray-700">
                    Set as primary contact
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;