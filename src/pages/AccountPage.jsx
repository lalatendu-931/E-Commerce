import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  User, MapPin, Package, Wrench, Settings, LogOut,
  ChevronRight, Edit2, Plus, Clock, CheckCircle, Loader
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import Button from '../components/common/Button';
import { ordersApi, repairsApi } from '../services/api';
import './AccountPage.css';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // State for orders and repairs from API
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState({ orders: false, repairs: false });

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch repairs when repairs tab is active
  useEffect(() => {
    if (activeTab === 'repairs' && repairs.length === 0) {
      fetchRepairs();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const data = await ordersApi.getMy();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchRepairs = async () => {
    setLoading(prev => ({ ...prev, repairs: true }));
    try {
      const data = await repairsApi.getMy();
      setRepairs(data || []);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      setRepairs([]);
    } finally {
      setLoading(prev => ({ ...prev, repairs: false }));
    }
  };

  // Helper to format order status
  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'ready_for_pickup': 'Ready for Pickup',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Helper to format repair status
  const getRepairStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'diagnosed': 'Diagnosed',
      'in_progress': 'Under Repair',
      'waiting_parts': 'Waiting for Parts',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'repairs', label: 'Repair Requests', icon: Wrench },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <main className="account-page">
      <div className="container">
        {/* Page Header */}
        <div className="account-header">
          <h1>My Account</h1>
          <p>Welcome back, {user?.name || 'Customer'}!</p>
        </div>

        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="user-card">
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-info">
                <strong>{user?.name || 'User'}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <nav className="account-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </nav>

            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </aside>

          {/* Content */}
          <div className="account-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Profile Information</h2>
                  <Button variant="outline" size="small" icon={Edit2}>
                    Edit Profile
                  </Button>
                </div>

                <div className="profile-card">
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Full Name</label>
                      <p>{user?.name || 'Not provided'}</p>
                    </div>
                    <div className="profile-field">
                      <label>Email</label>
                      <p>{user?.email}</p>
                    </div>
                    <div className="profile-field">
                      <label>Phone</label>
                      <p>{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="profile-field">
                      <label>Member Since</label>
                      <p>January 2024</p>
                    </div>
                  </div>
                </div>

                <div className="quick-stats">
                  <div className="stat-card">
                    <Package size={24} />
                    <div className="stat-info">
                      <strong>2</strong>
                      <span>Total Orders</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Wrench size={24} />
                    <div className="stat-info">
                      <strong>2</strong>
                      <span>Repairs</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Clock size={24} />
                    <div className="stat-info">
                      <strong>1</strong>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>My Orders</h2>
                  <Link to="/shop">
                    <Button variant="primary" size="small">
                      Shop Now
                    </Button>
                  </Link>
                </div>

                {loading.orders ? (
                  <div className="loading-state">
                    <Loader className="spinner" size={32} />
                    <p>Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <Package size={48} />
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here.</p>
                    <Link to="/shop">
                      <Button variant="primary">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-id">
                            <strong>#{order.id.slice(0, 8)}</strong>
                            <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                          <span className={`order-status ${order.status}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                        <div className="order-details">
                          <p>{order.items?.length || 0} item(s)</p>
                          <p className="order-total">₹{(order.total_amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="order-actions">
                          <Button variant="outline" size="small">View Details</Button>
                          {order.status === 'ready_for_pickup' && (
                            <Button variant="primary" size="small">Get Directions</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Repairs Tab */}
            {activeTab === 'repairs' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Repair Requests</h2>
                  <Link to="/repair">
                    <Button variant="primary" size="small" icon={Plus}>
                      New Request
                    </Button>
                  </Link>
                </div>

                {loading.repairs ? (
                  <div className="loading-state">
                    <Loader className="spinner" size={32} />
                    <p>Loading repair requests...</p>
                  </div>
                ) : repairs.length === 0 ? (
                  <div className="empty-state">
                    <Wrench size={48} />
                    <h3>No repair requests</h3>
                    <p>Need something fixed? Submit a repair inquiry.</p>
                    <Link to="/repair">
                      <Button variant="primary">Request Repair</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="repairs-list">
                    {repairs.map((repair) => (
                      <div key={repair.id} className="repair-card">
                        <div className="repair-header">
                          <div className="repair-id">
                            <strong>#{repair.id.slice(0, 8)}</strong>
                            <span>{new Date(repair.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                          <span className={`repair-status ${repair.status}`}>
                            {getRepairStatusText(repair.status)}
                          </span>
                        </div>
                        <div className="repair-details">
                          <p className="appliance">{repair.appliance_type}</p>
                          <p className="issue">{repair.problem_description}</p>
                        </div>
                        <div className="repair-actions">
                          <Button variant="outline" size="small">View Details</Button>
                          {repair.status === 'completed' && (
                            <Button variant="success" size="small">Pay & Collect</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Saved Addresses</h2>
                  <Button variant="outline" size="small" icon={Plus}>
                    Add Address
                  </Button>
                </div>

                <div className="addresses-grid">
                  <div className="address-card">
                    <div className="address-label">
                      <span className="label-tag">Home</span>
                      <span className="default-tag">Default</span>
                    </div>
                    <p className="address-text">
                      123, Example Street<br />
                      Near Temple Road<br />
                      Bangalore - 560001<br />
                      Karnataka
                    </p>
                    <div className="address-actions">
                      <button className="edit-btn"><Edit2 size={14} /> Edit</button>
                    </div>
                  </div>

                  <div className="address-card add-new">
                    <Plus size={32} />
                    <span>Add New Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Settings</h2>
                </div>

                <div className="settings-section">
                  <h3>Notifications</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <strong>Order Updates</strong>
                      <span>Receive SMS/email for order status changes</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <strong>Repair Updates</strong>
                      <span>Get notified when your repair is complete</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <strong>Promotional Messages</strong>
                      <span>Receive offers and festive deals</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Account</h3>
                  <div className="setting-item clickable">
                    <div className="setting-info">
                      <strong>Change Password</strong>
                      <span>Update your account password</span>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                  <div className="setting-item clickable danger">
                    <div className="setting-info">
                      <strong>Delete Account</strong>
                      <span>Permanently delete your account and data</span>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
