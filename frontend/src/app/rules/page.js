'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch rules from the API
    fetchRules();
  }, [router]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/rules');
      setRules(response.data);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('Failed to fetch rules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      // Find the rule
      const rule = rules.find(r => r.id === id);
      if (!rule) return;
      
      // Update the rule's active status
      await api.put(`/rules/${id}`, {
        isActive: !rule.isActive
      });
      
      // Update local state
      setRules(
        rules.map((rule) =>
          rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
        )
      );
    } catch (err) {
      console.error('Error toggling rule status:', err);
      setError('Failed to update rule status. Please try again.');
    }
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await api.delete(`/rules/${id}`);
        setRules(rules.filter((rule) => rule.id !== id));
      } catch (err) {
        console.error('Error deleting rule:', err);
        setError('Failed to delete rule. Please try again.');
      }
    }
  };

  const handleAddNew = () => {
    setCurrentRule({
      name: '',
      description: '',
      conditions: JSON.stringify({}),
      actions: JSON.stringify({ action: 'ban', banTime: 86400 }),
      isActive: true
    });
    setShowModal(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentRule.id) {
        // Update existing rule
        const response = await api.put(`/rules/${currentRule.id}`, currentRule);
        setRules(
          rules.map((rule) =>
            rule.id === currentRule.id ? response.data : rule
          )
        );
      } else {
        // Add new rule
        const response = await api.post('/rules', currentRule);
        setRules([...rules, response.data]);
      }

      setShowModal(false);
    } catch (err) {
      console.error('Error saving rule:', err);
      setError('Failed to save rule. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExecuteRule = async (id) => {
    try {
      setExecuting(true);
      
      const response = await api.post(`/rules/${id}/execute`);
      
      alert(`Rule executed: ${response.data.message}`);
    } catch (err) {
      console.error('Error executing rule:', err);
      setError('Failed to execute rule. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rule System</h1>
        <div className="flex space-x-2">
          <Link
            href="/rules/logs"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Logs
          </Link>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add New Rule
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && rules.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule, index) => (
                  <tr key={rule.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rule.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rule.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleActive(rule.id)}
                          className={`text-sm ${
                            rule.isActive ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {rule.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleExecuteRule(rule.id)}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={executing}
                        >
                          Execute
                        </button>
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No rules defined
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {currentRule.id ? 'Edit Rule' : 'Add New Rule'}
              </h3>
            </div>
            <form onSubmit={handleSaveRule}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={currentRule.name}
                    onChange={(e) =>
                      setCurrentRule({ ...currentRule, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={currentRule.description || ''}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conditions (JSON)
                  </label>
                  <textarea
                    value={currentRule.conditions}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        conditions: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actions (JSON)
                  </label>
                  <textarea
                    value={currentRule.actions}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        actions: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={currentRule.isActive}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">About Rules</h2>
        <p className="text-sm text-gray-600 mb-2">
          Rules allow you to automate peer management based on specific conditions.
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Conditions:</strong> Define when a rule should be triggered (e.g., high ping time, specific version).
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Actions:</strong> Define what happens when conditions are met (e.g., ban, disconnect).
        </p>
        <p className="text-sm text-gray-600">
          Rules are evaluated periodically against all connected peers.
        </p>
      </div>
    </div>
  );
}
