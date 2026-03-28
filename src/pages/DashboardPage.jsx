import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import InventorySummary from '../components/InventorySummary';
import InventoryItem from '../components/InventoryItem';
import MetricsPanel from '../components/MetricsPanel';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { items, loading, error } = useInventory();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))];

  // Filter items for users
  const filteredItems = user.role === 'user' 
    ? items.filter((item) => {
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : items;

  if (error) {
    return (
      <div className="page-container" role="alert">
        <h1>Dashboard</h1>
        <div className="error-message">
          <p>Error loading inventory data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      <header className="page-header">
        <h1>Inventory Monitoring Dashboard</h1>
        <p className="page-subtitle">Monitor and manage your inventory in real-time</p>
      </header>

      {loading ? (
        <div className="loading-spinner" role="status" aria-label="Loading inventory data">
          <div className="spinner"></div>
          <p>Loading inventory data...</p>
        </div>
      ) : (
        <main className="dashboard-content">
          {user.role === 'user' ? (
            <>
              <h2>Available Products</h2>
              
              <div className="page-controls">
                <div className="search-section">
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Search products"
                  />
                </div>

                <div className="filter-section">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                    aria-label="Filter products by category"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  <p>No products found matching your criteria</p>
                </div>
              ) : (
                <div className="items-grid">
                  {filteredItems.map((item) => (
                    <InventoryItem
                      key={item.id}
                      item={item}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      userRole={user.role}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <InventorySummary items={items} />
              {user.role === 'manager' && <MetricsPanel />}
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default DashboardPage;
