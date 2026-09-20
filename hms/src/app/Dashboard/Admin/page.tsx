"use client";

import React, { useState, useEffect } from 'react';
import AddHostelModal from '@/components/dashboard/AddHostelModal';
import AddUserModal from '@/components/dashboard/AddUserModal';
import { User as UserIcon } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  code?: string;
  type: string;
  description: string;
}

interface Warden {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  assignedCategory: string;
}

export default function AdminDashboardPage() {
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, warRes] = await Promise.all([
        fetch('/api/superadmin/categories'),
        fetch('/api/superadmin/wardens')
      ]);
      
      const catData = await catRes.json();
      const warData = await warRes.json();

      if (catData.success) {
        setCategories(catData.categories || []);
      }
      if (warData.success) {
        setWardens(warData.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-blue-500">
          Hostel Details with assigned warden
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsHostelModalOpen(true)}
            className="px-4 py-2 text-sm font-medium border border-gray-400 rounded-md hover:bg-gray-50 transition-colors"
          >
            Add Hostel Categories
          </button>
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="px-4 py-2 text-sm font-medium border border-gray-400 rounded-md hover:bg-gray-50 transition-colors"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Hostels Grid */}
      {loading ? (
        <div className="text-gray-500">Loading hostels...</div>
      ) : categories.length === 0 ? (
        <div className="text-gray-500">No hostel categories found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            // Find wardens assigned to this category
            const assignedWardens = wardens.filter(w => w.assignedCategory === cat.name);

            return (
              <div 
                key={cat._id} 
                className="border border-gray-300 rounded-2xl p-6 min-h-[300px] bg-white flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {cat.name} 
                      <span className="text-xs font-normal px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">
                        {cat.type}
                      </span>
                    </h2>
                    {cat.code && (
                      <p className="text-sm font-mono text-gray-500 mt-1">Code: {cat.code}</p>
                    )}
                  </div>
                </div>

                {cat.description && (
                  <p className="text-sm text-gray-600 mb-6 flex-grow">{cat.description}</p>
                )}

                {/* Wardens Section */}
                <div className="mt-auto border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Assigned Wardens
                  </h3>
                  {assignedWardens.length > 0 ? (
                    <div className="space-y-3">
                      {assignedWardens.map(warden => (
                        <div key={warden._id} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <UserIcon size={16} />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{warden.name}</p>
                            <p className="text-xs text-gray-500 truncate">{warden.email}</p>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {warden.mobile}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100 border-dashed text-center">
                      No warden assigned yet
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddHostelModal 
        isOpen={isHostelModalOpen} 
        onClose={() => setIsHostelModalOpen(false)} 
        onSuccess={fetchData} 
      />
      
      <AddUserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
