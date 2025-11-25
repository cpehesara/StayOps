// Local (frontend-only) notifications service with localStorage persistence and pub/sub
// Scope this per userId for isolation.

const STORAGE_PREFIX = 'stayops.localNotifications';

const listenersByUser = new Map(); // userId -> Set(callback)

const getKey = (userId) => `${STORAGE_PREFIX}.${userId}`;

function load(userId) {
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(userId, list) {
  localStorage.setItem(getKey(userId), JSON.stringify(list));
  notify(userId, list);
}

function notify(userId, list) {
  const set = listenersByUser.get(userId);
  if (set) {
    [...set].forEach((cb) => {
      try { cb(list); } catch { /* ignore listener errors */ }
    });
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(notification) {
  return {
    id: notification.id || uid(),
    title: notification.title || 'Notification',
    message: notification.message || '',
    type: notification.type || 'INFO', // INFO | SUCCESS | WARNING | ERROR | RESERVATION | PAYMENT
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt || new Date().toISOString(),
    meta: notification.meta || {},
  };
}

export const localNotifications = {
  // Subscribe to changes for a user
  subscribe(userId, callback) {
    if (!listenersByUser.has(userId)) listenersByUser.set(userId, new Set());
    listenersByUser.get(userId).add(callback);
    // Emit current value immediately
    callback(load(userId));
    return () => {
      const set = listenersByUser.get(userId);
      if (set) set.delete(callback);
    };
  },

  // CRUD
  getAll(userId, { unreadOnly = false } = {}) {
    const list = load(userId);
    return unreadOnly ? list.filter((n) => !n.isRead) : list;
  },

  add(userId, notification) {
    const list = load(userId);
    const item = normalize(notification);
    list.unshift(item); // newest first
    save(userId, list);
    return item;
  },

  markRead(userId, id) {
    const list = load(userId);
    const idx = list.findIndex((n) => n.id === id);
    if (idx >= 0) {
      list[idx].isRead = true;
      save(userId, list);
    }
  },

  markAllRead(userId) {
    const list = load(userId).map((n) => ({ ...n, isRead: true }));
    save(userId, list);
  },

  remove(userId, id) {
    const list = load(userId).filter((n) => n.id !== id);
    save(userId, list);
  },

  clear(userId) {
    save(userId, []);
  },

  // Helpers for demos
  addSample(userId) {
    const samples = [
      { title: 'New Reservation', message: 'Room 204 reserved by Alex Kim.', type: 'RESERVATION' },
      { title: 'Payment Received', message: 'Invoice #1023 settled.', type: 'PAYMENT' },
      { title: 'Checkout Reminder', message: 'Guest in Room 318 checks out at 11:00 AM.', type: 'INFO' },
      { title: 'Maintenance Alert', message: 'Leaky faucet reported in Room 120.', type: 'WARNING' },
      { title: 'System Notice', message: 'Nightly sync completed successfully.', type: 'SUCCESS' },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    return this.add(userId, pick);
  },

  startMockStream(userId, intervalMs = 8000) {
    const timer = setInterval(() => this.addSample(userId), intervalMs);
    return () => clearInterval(timer);
  },
};
