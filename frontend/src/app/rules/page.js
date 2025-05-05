'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RulesPage() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Ban Slow Peers',
      description: 'Automatically ban peers with high ping times',
      conditions: JSON.stringify({ pingTime: { gt: 500 } }),
      actions: JSON.stringify({ action: 'ban', banTime: 86400 }),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Disconnect Old Clients',
      description: 'Disconnect peers with outdated Bitcoin Core versions',
      conditions: JSON.stringify({ subver: { contains: '/Satoshi:0.1' } }),
      actions: JSON.stringify({ action: 'disconnect' }),
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // In a real implementation, we would fetch rules from the API
    // For now, we're using the mock data initialized above
  }, [router]);

  const handleToggleActive = (id) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const handleAddNew = () => {
    setCurrentRule({
      id: rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1,
      name: '',
      description: '',
      conditions: JSON.stringify({}),
      actions: JSON.stringify({ action: 'ban', banTime: 86400 }),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowModal(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (rules.some((rule) => rule.id === currentRule.id)) {
        // Update existing rule
        setRules(
          rules.map((rule) =>
            rule.id === currentRule.id
              ? { ...currentRule, updatedAt: new Date().toISOString() }
              : rule
          )
        );
      } else {
        // Add new rule
        setRules([
          ...rules,
          { ...currentRule, updatedAt: new Date().toISOString() },
        ]);
      }

      setLoading(false);
      setShowModal(false);
    }, 500);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rule System</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add New Rule
        </button>
      </div>

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

      {/* Rule Modal */}
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
                    value={currentRule.description}
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
