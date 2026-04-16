# TaskAgent — Full-Stack Implementation Plan & Codex Prompt

## PROJECT OVERVIEW

TaskAgent is an editorial-style, minimalist task management web application. Build it as a **Next.js 14 (App Router)** full-stack application with **Firebase** as the entire backend (Authentication + Firestore database + Firebase Storage). The UI uses **Tailwind CSS** with the **Manrope** font and **Material Symbols Outlined** icons. The design follows a glassmorphism/editorial aesthetic with a specific color system defined below.

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS 3.4+ with custom theme |
| Icons | Google Material Symbols Outlined (variable font) |
| Font | Manrope (Google Fonts) |
| Auth | **Firebase Authentication** (Email/Password + Google + Apple OAuth) |
| Database | **Cloud Firestore** |
| Storage | **Firebase Storage** (for attachments & avatars) |
| State | React Context + Server Components where possible |
| Deployment | Vercel |

---

## COLOR SYSTEM (Tailwind Config)

Add these to `tailwind.config.ts` under `theme.extend.colors`:

```json
{
  "surface-tint": "#3f618c",
  "inverse-surface": "#0b0f11",
  "inverse-primary": "#aacbfd",
  "primary": "#3f618c",
  "primary-dim": "#32557f",
  "primary-container": "#aacbfd",
  "primary-fixed": "#aacbfd",
  "primary-fixed-dim": "#9cbeee",
  "on-primary": "#f8f8ff",
  "on-primary-container": "#1f436d",
  "on-primary-fixed": "#022f58",
  "on-primary-fixed-variant": "#2a4c76",
  "secondary": "#4b626e",
  "secondary-dim": "#3f5661",
  "secondary-container": "#cde6f4",
  "secondary-fixed": "#cde6f4",
  "secondary-fixed-dim": "#bfd8e5",
  "on-secondary": "#f2faff",
  "on-secondary-container": "#3e5560",
  "on-secondary-fixed": "#2b424d",
  "on-secondary-fixed-variant": "#475f6a",
  "tertiary": "#5c6400",
  "tertiary-dim": "#505800",
  "tertiary-container": "#e4f265",
  "tertiary-fixed": "#e4f265",
  "tertiary-fixed-dim": "#d6e359",
  "on-tertiary": "#f8ffae",
  "on-tertiary-container": "#525a00",
  "on-tertiary-fixed": "#414700",
  "on-tertiary-fixed-variant": "#5c6400",
  "error": "#a83836",
  "error-dim": "#67040d",
  "error-container": "#fa746f",
  "on-error": "#fff7f6",
  "on-error-container": "#6e0a12",
  "surface": "#f7f9fc",
  "surface-bright": "#f7f9fc",
  "surface-dim": "#d4dbe1",
  "surface-variant": "#dce3e9",
  "surface-container": "#e9eef3",
  "surface-container-low": "#f0f4f8",
  "surface-container-high": "#e3e9ee",
  "surface-container-highest": "#dce3e9",
  "surface-container-lowest": "#ffffff",
  "on-surface": "#2c3338",
  "on-surface-variant": "#596065",
  "on-background": "#2c3338",
  "background": "#f7f9fc",
  "outline": "#747c81",
  "outline-variant": "#abb3b9",
  "inverse-on-surface": "#9a9da0"
}
```

Also add:
```json
{
  "borderRadius": {
    "DEFAULT": "0.25rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    "4xl": "2rem",
    "5xl": "2.5rem",
    "full": "9999px"
  },
  "fontFamily": {
    "headline": ["Manrope", "sans-serif"],
    "body": ["Manrope", "sans-serif"],
    "label": ["Manrope", "sans-serif"]
  }
}
```

---

## FIREBASE SETUP

### Firebase Project Configuration

1. Create a Firebase project in the Firebase Console
2. Enable these services:
   - **Authentication** → Enable providers: Email/Password, Google, Apple
   - **Cloud Firestore** → Create database in production mode
   - **Firebase Storage** → Create default bucket

### Firebase Client Config (`lib/firebase/config.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### Firebase Admin Config (`lib/firebase/admin.ts`)

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
```

---

## FIRESTORE DATA MODEL

### Collection: `users/{uid}`
```typescript
interface UserProfile {
  uid: string;                    // Firebase Auth UID
  email: string;
  fullName: string;
  avatarUrl: string;
  jobTitle: string;
  language: 'en' | 'tr';
  pushNotifications: boolean;
  darkMode: boolean;
  isPremium: boolean;
  premiumPlan: 'monthly' | 'yearly' | null;
  premiumExpiresAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `users/{uid}/categories/{categoryId}`
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;                   // Material Symbols icon name
  color: string;                  // Theme color key (primary, secondary, tertiary)
  taskCount: number;
  createdAt: Timestamp;
}
```

### Collection: `users/{uid}/tasks/{taskId}`
```typescript
interface Task {
  id: string;
  categoryId: string | null;
  categoryName: string | null;    // Denormalized for display
  title: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  dueDate: Timestamp | null;
  dueTime: string | null;        // "09:00" format
  reminderTime: string | null;   // "09:00" format
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcollection: `users/{uid}/tasks/{taskId}/subtasks/{subtaskId}`
```typescript
interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: Timestamp;
}
```

### Collection: `users/{uid}/tasks/{taskId}/attachments/{attachmentId}`
```typescript
interface Attachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  storagePath: string;            // Firebase Storage path for deletion
  createdAt: Timestamp;
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      // Categories subcollection
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }

      // Tasks subcollection
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;

        // Subtasks sub-subcollection
        match /subtasks/{subtaskId} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }

        // Attachments sub-subcollection
        match /attachments/{attachmentId} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }
      }
    }
  }
}
```

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Storage Folder Structure

```
/users/{uid}/avatars/profile.jpg
/users/{uid}/tasks/{taskId}/attachment-{timestamp}.{ext}
```

---

## FILE & FOLDER STRUCTURE

```
TaskAgent/
├── .env.local                          # Firebase keys
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (font, theme, AuthProvider)
│   │   ├── page.tsx                    # Redirect: auth'd → /dashboard, else → /login
│   │   ├── globals.css                 # Tailwind directives + custom styles
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              # Auth layout (centered, ambient glow bg)
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login screen
│   │   │   └── signup/
│   │   │       └── page.tsx            # Sign up screen
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # App layout (sidebar + topbar + bottom nav)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Dashboard / Focus view
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx            # Task list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Add new task
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Task detail/edit
│   │   │   ├── categories/
│   │   │   │   └── page.tsx            # Categories view
│   │   │   ├── premium/
│   │   │   │   └── page.tsx            # Premium membership
│   │   │   └── settings/
│   │   │       └── page.tsx            # Profile & Settings
│   │   └── api/
│   │       └── auth/
│   │           └── session/
│   │               └── route.ts        # Server-side session management (optional)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── TopAppBar.tsx           # Sticky top navigation bar
│   │   │   ├── BottomNav.tsx           # Mobile bottom navigation
│   │   │   ├── Sidebar.tsx             # Desktop side navigation
│   │   │   ├── PriorityBadge.tsx       # High/Medium/Low badge
│   │   │   ├── TaskCard.tsx            # Task list item card
│   │   │   ├── ProgressRing.tsx        # SVG circular progress
│   │   │   ├── CategoryCard.tsx        # Category card with progress bar
│   │   │   ├── FAB.tsx                 # Floating action button
│   │   │   └── GlassPanel.tsx          # Glassmorphism container
│   │   ├── forms/
│   │   │   ├── TaskForm.tsx            # Add/Edit task form
│   │   │   ├── SubtaskList.tsx         # Subtask checklist
│   │   │   └── AttachmentGrid.tsx      # Attachment upload grid
│   │   └── providers/
│   │       ├── AuthProvider.tsx         # Firebase auth context + onAuthStateChanged
│   │       └── ThemeProvider.tsx        # Dark mode context
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts               # Firebase client initialization
│   │   │   ├── admin.ts                # Firebase Admin SDK (server-side)
│   │   │   ├── auth.ts                 # Auth helper functions
│   │   │   ├── firestore.ts            # Firestore CRUD helper functions
│   │   │   └── storage.ts              # Storage upload/delete helpers
│   │   ├── types.ts                    # TypeScript types (Task, Category, Profile, etc.)
│   │   └── utils.ts                    # Helper functions (date formatting, etc.)
│   ├── hooks/
│   │   ├── useTasks.ts                 # Task CRUD hook with Firestore listeners
│   │   ├── useCategories.ts            # Category CRUD hook
│   │   ├── useProfile.ts               # Profile hook
│   │   └── useAuth.ts                  # Auth state hook (wraps onAuthStateChanged)
│   └── middleware.ts                    # Next.js middleware (optional: cookie-based session check)
```

---

## FIREBASE AUTH IMPLEMENTATION

### Auth Helper Functions (`lib/firebase/auth.ts`)

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Sign in with email/password
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Sign up with email/password
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(credential.user, fullName);
  return credential;
};

// Google sign in
export const signInWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  await createUserProfileIfNotExists(credential.user);
  return credential;
};

// Apple sign in
export const signInWithApple = async () => {
  const credential = await signInWithPopup(auth, appleProvider);
  await createUserProfileIfNotExists(credential.user);
  return credential;
};

// Sign out
export const logOut = () => signOut(auth);

// Create user profile in Firestore on first sign-up
async function createUserProfile(user: User, fullName: string) {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    fullName: fullName || user.displayName || '',
    avatarUrl: user.photoURL || '',
    jobTitle: '',
    language: 'en',
    pushNotifications: true,
    darkMode: false,
    isPremium: false,
    premiumPlan: null,
    premiumExpiresAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create default categories
  const categoriesData = [
    { name: 'Work', icon: 'work', color: 'primary' },
    { name: 'Personal', icon: 'person', color: 'secondary' },
    { name: 'Health', icon: 'favorite', color: 'tertiary' },
  ];
  for (const cat of categoriesData) {
    const catRef = doc(db, 'users', user.uid, 'categories', crypto.randomUUID());
    await setDoc(catRef, {
      ...cat,
      taskCount: 0,
      createdAt: serverTimestamp(),
    });
  }
}

async function createUserProfileIfNotExists(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await createUserProfile(user, user.displayName || '');
  }
}
```

### Auth Provider (`components/providers/AuthProvider.tsx`)

```typescript
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
        router.push('/login');
      }
      if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## FIRESTORE CRUD HELPERS (`lib/firebase/firestore.ts`)

```typescript
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// --- TASKS ---
export const tasksRef = (uid: string) =>
  collection(db, 'users', uid, 'tasks');

export const addTask = async (uid: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const ref = await addDoc(tasksRef(uid), {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateTask = (uid: string, taskId: string, data: Partial<Task>) =>
  updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteTask = (uid: string, taskId: string) =>
  deleteDoc(doc(db, 'users', uid, 'tasks', taskId));

export const toggleTaskComplete = (uid: string, taskId: string, isCompleted: boolean) =>
  updateTask(uid, taskId, { isCompleted });

// --- SUBTASKS ---
export const subtasksRef = (uid: string, taskId: string) =>
  collection(db, 'users', uid, 'tasks', taskId, 'subtasks');

export const addSubtask = (uid: string, taskId: string, title: string, sortOrder: number) =>
  addDoc(subtasksRef(uid, taskId), {
    title,
    isCompleted: false,
    sortOrder,
    createdAt: serverTimestamp(),
  });

export const toggleSubtask = (uid: string, taskId: string, subtaskId: string, isCompleted: boolean) =>
  updateDoc(doc(db, 'users', uid, 'tasks', taskId, 'subtasks', subtaskId), { isCompleted });

// --- CATEGORIES ---
export const categoriesRef = (uid: string) =>
  collection(db, 'users', uid, 'categories');

export const addCategory = (uid: string, name: string, icon: string, color: string) =>
  addDoc(categoriesRef(uid), {
    name,
    icon,
    color,
    taskCount: 0,
    createdAt: serverTimestamp(),
  });

// --- PROFILE ---
export const updateProfile = (uid: string, data: Partial<UserProfile>) =>
  updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
```

---

## FIREBASE STORAGE HELPERS (`lib/firebase/storage.ts`)

```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const uploadAvatar = async (uid: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `users/${uid}/avatars/profile.${file.name.split('.').pop()}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const uploadTaskAttachment = async (
  uid: string,
  taskId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  const path = `users/${uid}/tasks/${taskId}/attachment-${Date.now()}.${file.name.split('.').pop()}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

export const deleteAttachment = (storagePath: string) =>
  deleteObject(ref(storage, storagePath));
```

---

## SCREEN-BY-SCREEN IMPLEMENTATION INSTRUCTIONS

### SCREEN 1: Login (`/login`)

**Layout:** Centered card, ambient glow background with radial gradient, decorative blurred circles.

**Components:**
- Top bar: Close button (left), "TaskAgent" title (center)
- Welcome text: "Welcome Back." (h1, text-5xl, font-extralight) + subtitle "Find your focus again."
- Social login buttons:
  - "Continue with Google" — calls `signInWithGoogle()` from auth helpers
  - "Continue with Apple" — calls `signInWithApple()` from auth helpers
- Divider: "or" with horizontal lines
- Email input + Password input + "Continue with Email" button — calls `signInWithEmail(email, password)`
- Footer link: "Don't have an account? Sign up" → `/signup`
- Footer: Privacy Policy + Terms of Service links

**Sign Up page (`/signup`):** Same layout but with:
- Full name input + Email input + Password input
- "Create Account" button → calls `signUpWithEmail(email, password, fullName)`
- "Already have an account? Sign in" → `/login`

**Behavior:**
- After successful auth, `AuthProvider` automatically redirects to `/dashboard`
- Error states: show inline error messages below inputs
- Loading states: disable buttons, show spinner during auth

---

### SCREEN 2: Dashboard (`/dashboard`)

**Layout:** Desktop has sidebar (left) + main content. Mobile has top bar + bottom nav.

**Sidebar (desktop only, `lg:block`):**
- User avatar + name + "Ethereal Workspace"
- "08 Tasks Left" badge (live count of incomplete tasks)
- Nav links: Today (active), Planned, High Priority, Completed, Settings
- Active state: white bg, blue text, bold, rounded-xl

**Main Content:**
- Greeting: "Good morning, {name}." with italic quote below
- Decorative large "08" number (opacity-[0.03])
- **Bento Grid (2 columns on md+):**
  - **Left (col-span-5): Focus Flow card**
    - SVG circular progress ring (animated)
    - Percentage in center
    - "12/16 TASKS" label
    - Query: `onSnapshot` on tasks collection, count completed vs total for today
  - **Right (col-span-7): Today's Focus card**
    - List of today's tasks (max 3-4), queried with `where('dueDate', '==', today)`
    - Each: checkbox circle + title + time + priority badge
    - "View All" link → `/tasks`
  - **Bottom (col-span-12): Quick Categories**
    - 3 category cards in row
    - Each: icon, name, progress bar, "X Active Tasks"
    - `onSnapshot` on categories subcollection

**FAB:** Fixed bottom-right, "+" icon, links to `/tasks/new`

**Bottom Nav (mobile):** Focus (active) | Tasks | Categories | Profile

**Data Fetching:** Use `onSnapshot` real-time listeners for live updates. Wrap in custom hooks (`useTasks`, `useCategories`).

---

### SCREEN 3: Task List (`/tasks`)

**Layout:** Same shell as dashboard.

**Content:**
- Header: "Daily Focus" (text-6xl, font-light) + subtitle
- Search input (rounded-2xl, search icon left)
- Task list:
  - Each task: rounded-[2rem] card, checkbox, title, date, category, priority badge
  - Completed tasks: checked, different bg
  - Hover: shadow + translate-y
  - Clicking checkbox → `toggleTaskComplete()` (optimistic UI update)
  - Clicking card → navigate to `/tasks/[id]`
- **Right sidebar (lg:col-span-4):**
  - Momentum card: percentage + progress bar + motivational text
  - Upcoming Milestones: event cards with icons (tasks due in next 7 days)

**Search:** Client-side filter by title from the already-loaded snapshot.

**Priority badge colors:**
- High: `bg-error-container text-on-error-container`
- Medium: `bg-secondary-container text-on-secondary-container`
- Low: `bg-surface-variant text-on-surface-variant`

---

### SCREEN 4: Task Detail (`/tasks/[id]`)

**Layout:** Focused view, no sidebar, no bottom nav.

**Top bar:** Close button + "TaskAgent" + archive/delete buttons + avatar

**Content (grid: 8 + 4 cols):**

**Left column (col-span-8):**
- "Current Focus" label + large editable task title (input, text-4xl)
- Decorative large "08" (opacity-10)
- Notes section: textarea in rounded-[2rem] card
- Subtasks section:
  - "ADD SUBTASK" button → `addSubtask()`
  - List of subtasks with round checkboxes, `onSnapshot` on subtasks subcollection
  - Completed: line-through, checked
  - Toggle: `toggleSubtask()`

**Right column (col-span-4):**
- Metadata card (rounded-[2rem], surface-container-high):
  - Due Date (calendar icon + date picker)
  - Priority (selectable badge)
  - Reminder (notifications icon + time picker)
  - Category (dropdown from user's categories)
- Attachments:
  - Grid of images (2 cols), `onSnapshot` on attachments subcollection
  - Upload placeholder with "add_a_photo" icon → `uploadTaskAttachment()` then save to attachments subcollection

**FAB:** "SAVE CHANGES" button (fixed bottom-right, gradient bg) → calls `updateTask()`

**Delete:** Confirm dialog → `deleteTask()` → navigate back to `/tasks`

---

### SCREEN 5: Add New Task (`/tasks/new`)

**Layout:** Focused view, no sidebar, no bottom nav. Decorative "NEW" text bg.

**Top bar:** Close button + "TaskAgent" + avatar

**Content:**
- Header: "Workspace / Draft" breadcrumb + "Create a new Focus Point." title
- Task name input (text-3xl, no border, underline on focus)
- **Bento grid (2 cols):**
  - Category selection: chip buttons loaded from user's categories + "+" to add new
  - Priority selection: 3 buttons (High/Med/Low) with icons
- Schedule section: native date input + time input styled in rounded cards
- Info text: "This task will be synced with your Planned view."
- "Add Task" button → `addTask()` → redirect to `/tasks/[newId]`

---

### SCREEN 6: Premium (`/premium`)

**Layout:** Use the second (more detailed) design variant.

**Content:**
- Hero: "Your Sanctuary of Digital Focus" + subtitle
- Feature grid (bento style):
  - Unlimited Tasks (col-span-2)
  - Cloud Sync
  - Deep Insights (with bar chart graphic)
  - Priority Support (col-span-2, horizontal layout)
- Pricing section (2 cards):
  - Monthly: $5/month, "Start Free Trial" button
  - Yearly: $49.99/year, "Best Value" badge, "Go Premium" button, "Save $10"
- Trust footer: trial info

**Bottom Nav:** Workspace | Premium (active) | Settings

**Note:** Premium is UI-only for MVP. Button click calls `updateProfile(uid, { isPremium: true, premiumPlan: 'monthly' })`. No real payment.

---

### SCREEN 7: Profile & Settings (`/settings`)

**Layout:** Centered content, bottom nav.

**Content:**
- Profile header: large avatar (w-32, rounded-full) with edit button → `uploadAvatar()` then `updateProfile(uid, { avatarUrl })`
- Name + job title (editable)
- **Bento grid (2 cols):**
  - Language: radio buttons (English / Turkish) → `updateProfile(uid, { language })`
  - Experience: toggle switches:
    - Push Alerts → `updateProfile(uid, { pushNotifications })`
    - Night Mode → toggle `dark` class on `<html>` + `updateProfile(uid, { darkMode })`
- Premium status card: shows current plan status from profile
- Logout button → `logOut()` → redirect to `/login`

---

## NAVIGATION MAP

```
/login ──→ /dashboard (after auth)
/signup ──→ /dashboard (after auth)

/dashboard
  ├── Sidebar: Today, Planned, High Priority, Completed, Settings
  ├── Task click → /tasks/[id]
  ├── Category click → /categories (filtered)
  ├── FAB (+) → /tasks/new
  └── Bottom Nav: Focus*, Tasks, Categories, Profile

/tasks
  ├── Task click → /tasks/[id]
  ├── FAB (+) → /tasks/new
  └── Bottom Nav: Focus, Tasks*, Categories, Profile

/tasks/new → creates task → /tasks/[id]

/tasks/[id]
  ├── Close → back to /tasks
  ├── Archive → mark archived, go back
  └── Delete → confirm, delete, go back

/premium
  └── Bottom Nav: Workspace, Premium*, Settings

/settings
  ├── Logout → /login
  └── Bottom Nav: Workspace, Premium, Settings*
```

---

## IMPLEMENTATION ORDER

Execute in this exact order:

### Phase 1: Project Setup
1. `npx create-next-app@latest . --typescript --tailwind --app --src-dir` (inside TaskAgent directory)
2. Install dependencies: `npm install firebase firebase-admin`
3. Configure `tailwind.config.ts` with the full color system, fonts, border-radius
4. Set up `globals.css` with Manrope font import (`@import url(...)`) and Material Symbols link in `layout.tsx` head
5. Create `.env.local` with all Firebase env variables (see ENV VARIABLES section)
6. Create `lib/firebase/config.ts` (client SDK init)
7. Create `lib/firebase/admin.ts` (admin SDK init)
8. Create `lib/firebase/auth.ts` (all auth helper functions)
9. Create `lib/firebase/firestore.ts` (all Firestore CRUD helpers)
10. Create `lib/firebase/storage.ts` (all Storage upload/delete helpers)
11. Create `lib/types.ts` (TypeScript interfaces for all data models)

### Phase 2: Firebase Console Setup (Manual Steps — Document for user)
12. Enable Auth providers: Email/Password, Google, Apple
13. Create Firestore database in production mode
14. Deploy Firestore security rules (copy from this document)
15. Create Firebase Storage default bucket
16. Deploy Storage security rules (copy from this document)

### Phase 3: Auth Flow
17. Build `AuthProvider` component (`components/providers/AuthProvider.tsx`)
18. Build root `layout.tsx` wrapping app in `AuthProvider`
19. Build Login page (`/login`) — matching the HTML design exactly
20. Build Signup page (`/signup`) — same design with name + password fields
21. Build root `page.tsx` — redirect based on auth state
22. Test: sign up, sign in with Google, sign out, redirect flows

### Phase 4: App Shell
23. Build TopAppBar component (sticky, glass effect)
24. Build Sidebar component (desktop, `lg:block`)
25. Build BottomNav component (mobile, `md:hidden`)
26. Build App layout (`(app)/layout.tsx`) — combines TopAppBar + Sidebar + BottomNav + children
27. Build FAB component (fixed position, gradient bg)

### Phase 5: Dashboard
28. Build ProgressRing SVG component (animated circular progress)
29. Build TaskCard component (reusable for both dashboard and task list)
30. Build CategoryCard component (icon + name + progress bar)
31. Build Dashboard page with real-time Firestore listeners
32. Wire up: greeting with user name, task counts, completion %, today's tasks, categories

### Phase 6: Tasks
33. Build PriorityBadge component
34. Build Task List page (`/tasks`) with search filter
35. Build Add New Task page (`/tasks/new`) with category/priority selection
36. Build Task Detail page (`/tasks/[id]`) with inline editing
37. Build SubtaskList component (add, toggle, delete subtasks)
38. Build AttachmentGrid component (upload to Firebase Storage, display grid)

### Phase 7: Settings & Premium
39. Build Settings page — profile edit, avatar upload, language, toggles, logout
40. Build Premium page — feature grid + pricing cards (UI-only)
41. Wire dark mode toggle (ThemeProvider + html class + persist to Firestore)

### Phase 8: Polish
42. Add loading states (skeleton loaders matching the bento card shapes)
43. Add empty states for task list ("No tasks yet. Create your first Focus Point.")
44. Add toast notifications for actions (save, delete, error) — use a simple toast component or `react-hot-toast`
45. Responsive testing: ensure mobile bottom nav / desktop sidebar switch at `lg` breakpoint
46. Test all CRUD operations end-to-end
47. Verify Firestore security rules block cross-user access

---

## KEY IMPLEMENTATION NOTES

1. **Real-time data:** Use `onSnapshot` listeners (not `getDocs`) for tasks, subtasks, categories. This gives live updates. Unsubscribe on component unmount.

2. **Task completion toggle** should be optimistic — update UI state immediately, then call `toggleTaskComplete()`. If Firestore call fails, revert UI.

3. **The decorative "08" numbers** are purely visual. Use the current day of month: `new Date().getDate().toString().padStart(2, '0')`.

4. **Priority badge component** should accept a `priority` prop and return the correct color scheme:
   - `high` → `bg-error-container text-on-error-container`
   - `medium` → `bg-secondary-container text-on-secondary-container`
   - `low` → `bg-surface-variant text-on-surface-variant`

5. **Bottom navigation** active state: blue bg pill with filled icon (`font-variation-settings: 'FILL' 1`). Use `usePathname()` to determine active route.

6. **Sidebar** active state: white bg card with blue text. Same pathname logic.

7. **Glass panel effect**: `backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);` with `bg-white/70`.

8. **All rounded corners** on major cards should be `rounded-[2rem]` or `rounded-[2.5rem]` (32px-40px).

9. **The ambient glow** on login page: `background: radial-gradient(circle at 50% -20%, #aacbfd33 0%, transparent 70%)`

10. **Firestore queries for "today's tasks":**
    ```typescript
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
    query(tasksRef(uid), where('dueDate', '>=', Timestamp.fromDate(startOfDay)), where('dueDate', '<=', Timestamp.fromDate(endOfDay)))
    ```

11. **Category task count:** When adding/completing/deleting a task, update the parent category's `taskCount` field. Use a batch write or transaction for atomicity.

12. **Login page** uses `signInWithEmail` (email + password). **NOT** magic link. Sign up page creates account with `signUpWithEmail`.

---

## ENV VARIABLES NEEDED

```env
# Firebase Client SDK (exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (server-side only, NEVER expose to client)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## SINGLE COMMAND TO START

```bash
cd TaskAgent && npm run dev
```

App should be accessible at `http://localhost:3000`. Unauthenticated users see the login page. After Firebase auth, they land on the dashboard with their tasks, categories, and progress — all powered by real-time Firestore listeners.
