import React, { useState } from 'react';

interface Institution {
  id: string;
  name: string;
  type: string;
  verified: boolean;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  founded?: string;
  size?: string;
  description?: string;
  tags?: string[];
}

interface InstitutionOverviewProps {
  institution: Institution;
}

const InstitutionOverview: React.FC<InstitutionOverviewProps> = ({ institution }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: institution.name || '',
    type: institution.type || '',
    phone: institution.phone || '',
    email: institution.email || '',
    website: institution.website || '',
    founded: institution.founded || '',
    size: institution.size || '',
    description: institution.description || '',
    address: {
      line1: institution.address?.line1 || '',
      line2: institution.address?.line2 || '',
      city: institution.address?.city || '',
      county: institution.address?.county || '',
      postcode: institution.address?.postcode || '',
      country: institution.address?.country || 'United Kingdom',
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save changes via API
      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error updating institution: ${response.statusText}`);
      }

      setIsEditing(false);
      // You might want to refresh the data or show a success message
    } catch (error) {
      console.error('Failed to update institution:', error);
      // Show error message to user
    }
  };

  // Display the institution info in view mode
  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-4">Institution Details</h2>
        <button 
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Edit Details
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold mb-3">Basic Information</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Institution Name</p>
              <p className="font-medium">{institution.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Institution Type</p>
              <p className="font-medium">{institution.type}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Verification Status</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs ${institution.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {institution.verified ? 'Verified' : 'Pending Verification'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold mb-3">Contact Information</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-medium">{institution.phone || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="font-medium">{institution.email || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Website</p>
              <p className="font-medium">
                {institution.website ? (
                  <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {institution.website}
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-3">Address</h3>
        
        {institution.address ? (
          <address className="not-italic">
            {institution.address.line1 && <p>{institution.address.line1}</p>}
            {institution.address.line2 && <p>{institution.address.line2}</p>}
            {institution.address.city && <p>{institution.address.city}</p>}
            {institution.address.county && <p>{institution.address.county}</p>}
            {institution.address.postcode && <p>{institution.address.postcode}</p>}
            {institution.address.country && <p>{institution.address.country}</p>}
          </address>
        ) : (
          <p className="text-gray-600">No address information provided</p>
        )}
      </div>
      
      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-3">Additional Information</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Year Founded</p>
            <p className="font-medium">{institution.founded || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Institution Size</p>
            <p className="font-medium">{institution.size || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium">{institution.description || 'No description provided'}</p>
          </div>
          
          {institution.tags && institution.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {institution.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Display the institution info in edit mode
  const renderEditMode = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-4">Edit Institution Details</h2>
        <div>
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm mr-2"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold mb-3">Basic Information</h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm text-gray-600">Institution Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm text-gray-600">Institution Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select a type</option>
                <option value="Primary School">Primary School</option>
                <option value="Secondary School">Secondary School</option>
                <option value="College">College</option>
                <option value="University">University</option>
                <option value="Research Institution">Research Institution</option>
                <option value="Educational Organization">Educational Organization</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold mb-3">Contact Information</h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-600">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm text-gray-600">Website</label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-3">Address</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address.line1" className="block text-sm text-gray-600">Address Line 1</label>
            <input
              id="address.line1"
              name="address.line1"
              type="text"
              value={formData.address.line1}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="address.line2" className="block text-sm text-gray-600">Address Line 2</label>
            <input
              id="address.line2"
              name="address.line2"
              type="text"
              value={formData.address.line2}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="address.city" className="block text-sm text-gray-600">City</label>
            <input
              id="address.city"
              name="address.city"
              type="text"
              value={formData.address.city}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="address.county" className="block text-sm text-gray-600">County</label>
            <input
              id="address.county"
              name="address.county"
              type="text"
              value={formData.address.county}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="address.postcode" className="block text-sm text-gray-600">Postcode</label>
            <input
              id="address.postcode"
              name="address.postcode"
              type="text"
              value={formData.address.postcode}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="address.country" className="block text-sm text-gray-600">Country</label>
            <input
              id="address.country"
              name="address.country"
              type="text"
              value={formData.address.country}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-3">Additional Information</h3>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="founded" className="block text-sm text-gray-600">Year Founded</label>
            <input
              id="founded"
              name="founded"
              type="text"
              value={formData.founded}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="size" className="block text-sm text-gray-600">Institution Size</label>
            <input
              id="size"
              name="size"
              type="text"
              value={formData.size}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="e.g., '500 students', 'Medium (200-500)', etc."
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm text-gray-600">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>
    </form>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

export default InstitutionOverview;