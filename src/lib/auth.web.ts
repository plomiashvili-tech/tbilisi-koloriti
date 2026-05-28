const USERS_KEY = '@koloriti:users';
const SESSION_KEY = '@koloriti:session';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  points: number;
  badges: string[];
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); }
  catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(u: StoredUser): AuthUser {
  return {
    id: u.id, email: u.email, name: u.name,
    isAdmin: u.isAdmin ?? false,
    points: u.points ?? 0,
    badges: u.badges ?? [],
  };
}

// Seeds the admin account if it doesn't exist yet.
// Admin login: admin@tbilisi.ge / admin2024
export async function ensureAdmin(): Promise<void> {
  const users = loadUsers();
  if (users.find((u) => u.id === '__admin__')) return;
  const passwordHash = await sha256('admin2024');
  saveUsers([
    {
      id: '__admin__',
      email: 'admin@tbilisi.ge',
      name: 'Admin',
      isAdmin: true,
      points: 0,
      badges: [],
      passwordHash,
    },
    ...users,
  ]);
}

export function getUserById(id: string): AuthUser | null {
  const u = loadUsers().find((x) => x.id === id);
  return u ? toPublic(u) : null;
}

export function getLeaderboard(): AuthUser[] {
  return loadUsers()
    .filter((u) => !u.isAdmin)
    .map(toPublic)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}

export function awardPoints(userId: string, delta: number, newBadges: string[] = []): void {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx].points = (users[idx].points ?? 0) + delta;
  const existing = users[idx].badges ?? [];
  for (const b of newBadges) {
    if (!existing.includes(b)) existing.push(b);
  }
  users[idx].badges = existing;
  // auto-award City Hero at 50 pts
  if (users[idx].points >= 50 && !existing.includes('hero')) existing.push('hero');
  saveUsers(users);
}

export async function register(
  email: string,
  name: string,
  password: string,
): Promise<AuthUser> {
  const users = loadUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const user: StoredUser = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    isAdmin: false,
    points: 0,
    badges: [],
    passwordHash: await sha256(password),
  };
  saveUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
  return toPublic(user);
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const users = loadUsers();
  const hash = await sha256(password);
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === hash,
  );
  if (!user) throw new Error('Incorrect email or password.');
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
  return toPublic(user);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// Always reads live data so points/badges are always current.
export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { id } = JSON.parse(raw);
    return getUserById(id);
  } catch {
    return null;
  }
}
