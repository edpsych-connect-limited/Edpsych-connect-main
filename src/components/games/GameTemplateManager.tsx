import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

const GameTemplateManager: React.FC = () => {
  const { hasRole, token } = useAuth();
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/games/templates', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    };
    if (hasRole('admin') || hasRole('superadmin')) {
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, [hasRole, token]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/games/templates/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete template');
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  if (!hasRole('admin') && !hasRole('superadmin')) {
    return <p className="text-red-600">You do not have permission to manage game templates.</p>;
  }

  if (loading) return <p>Loading templates...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Game Template Manager</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Created By</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id} className="hover:bg-gray-50">
              <td className="p-2 border">{template.name}</td>
              <td className="p-2 border">{template.description}</td>
              <td className="p-2 border">{template.createdBy}</td>
              <td className="p-2 border">{new Date(template.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameTemplateManager;