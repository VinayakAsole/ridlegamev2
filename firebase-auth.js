// 🔥 Firebase Auth & Database Integration

const firebaseConfig = {
    apiKey: "AIzaSyDurMu1cc9HuCAv1TzjJgsM0vBH4OiK4lA",
    authDomain: "alphanumerical-riddle-ga-13368.firebaseapp.com",
    projectId: "alphanumerical-riddle-ga-13368",
    storageBucket: "alphanumerical-riddle-ga-13368.firebasestorage.app",
    messagingSenderId: "107896381697",
    appId: "1:107896381697:web:578630d8a5a8475eea7b00"
};

// Initialize Firebase only if the config is valid
let app;
try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        console.warn("⚠️ Please update firebaseConfig in firebase-auth.js to enable Firebase features.");
    }
} catch (e) {
    console.error("Firebase init error:", e);
}

const auth = app ? firebase.auth() : null;
const db = app ? firebase.firestore() : null;

// Global State
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const authTitle = document.getElementById('authTitle');
const authSwitchTextEl = document.getElementById('authSwitchText');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authNameGroup = document.getElementById('authNameGroup');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const userProfileInfo = document.getElementById('userProfileInfo');
const userNameDisplay = document.getElementById('userNameDisplay');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const leaderboardModal = document.getElementById('leaderboardModal');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardList = document.getElementById('leaderboardList');

let isLoginMode = true;

// ─── AUTH MODAL LOGIC ─────────────────────────────────────────

function openAuthModal() {
    if (authModal) {
        authModal.classList.add('active');
        authError.textContent = '';
        authEmail.value = '';
        authPassword.value = '';
        authName.value = '';
    }
}

function closeAuthModal() {
    if (authModal) authModal.classList.remove('active');
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    authError.textContent = '';
    if (isLoginMode) {
        authTitle.innerHTML = '<i class="fas fa-lock"></i> Sign In';
        authNameGroup.style.display = 'none';
        authSubmitBtn.innerHTML = '<span class="btn-text">Sign In</span><span class="btn-glow"></span>';
        authSwitchTextEl.innerHTML = 'Need an account? <span onclick="toggleAuthMode()" class="auth-link">Sign Up</span>';
    } else {
        authTitle.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
        authNameGroup.style.display = 'block';
        authSubmitBtn.innerHTML = '<span class="btn-text">Create Account</span><span class="btn-glow"></span>';
        authSwitchTextEl.innerHTML = 'Already have an account? <span onclick="toggleAuthMode()" class="auth-link">Sign In</span>';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    if (!auth) {
        authError.textContent = 'Firebase is not properly configured.';
        return;
    }
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    try {
        authSubmitBtn.disabled = true;
        authError.textContent = '';

        if (isLoginMode) {
            await auth.signInWithEmailAndPassword(email, password);
            showToast('Successfully signed in!');
        } else {
            if (!name) throw new Error('Display Name is required.');
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });

            // Create a record in Firestore
            await db.collection("users").doc(userCredential.user.uid).set({
                displayName: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalCorrect: 0,
                bestStreak: 0,
                totalAttempts: 0
            });

            showToast('Account created successfully!');
        }
        closeAuthModal();
    } catch (error) {
        authError.textContent = error.message;
    } finally {
        authSubmitBtn.disabled = false;
    }
}

async function handleLogout() {
    if (auth) {
        await auth.signOut();
        showToast('Logged out.');
    }
}

// ─── STATE LISTENER ──────────────────────────────────────────

if (auth) {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            loginBtn.style.display = 'none';
            userProfileInfo.style.display = 'flex';
            userNameDisplay.textContent = user.displayName || 'Player';
            // Sync local stats to Firebase on login if they have points
            setTimeout(syncLocalStatsToFirebase, 1500);
        } else {
            loginBtn.style.display = 'inline-flex';
            userProfileInfo.style.display = 'none';
            userNameDisplay.textContent = '';
        }
    });
}

// ─── FIREBASE DB SYNC ────────────────────────────────────────

const gameStatsKey = 'riddleGameStats';

async function syncLocalStatsToFirebase() {
    if (!auth || !currentUser || !db) return;
    try {
        const localData = localStorage.getItem(gameStatsKey);
        if (!localData) return;
        const stats = JSON.parse(localData);

        const userRef = db.collection('users').doc(currentUser.uid);
        const doc = await userRef.get();
        let dbTotalCorrect = 0;
        let dbTotalAttempts = 0;
        let dbBestStreak = 0;

        if (doc.exists) {
            const data = doc.data();
            dbTotalCorrect = data.totalCorrect || 0;
            dbTotalAttempts = data.totalAttempts || 0;
            dbBestStreak = data.bestStreak || 0;
        }

        // Only update if local is strictly better, or combine them
        // For simplicity, let's keep the higher values
        const newTotalCorrect = Math.max(stats.overall.correct, dbTotalCorrect);
        const newTotalAttempts = Math.max(stats.overall.total, dbTotalAttempts);
        const newBestStreak = Math.max(stats.overall.bestStreak || 0, dbBestStreak);

        await userRef.set({
            totalCorrect: newTotalCorrect,
            totalAttempts: newTotalAttempts,
            bestStreak: newBestStreak,
            displayName: currentUser.displayName || "Player",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

    } catch (e) {
        console.error("Error syncing stats:", e);
    }
}

// This function will be called whenever checking an answer changes stats.
window.recordStatsToLeaderboard = async function (stats) {
    if (!auth || !currentUser || !db) return;
    try {
        await db.collection('users').doc(currentUser.uid).set({
            totalCorrect: stats.overall.correct,
            totalAttempts: stats.overall.total,
            bestStreak: stats.overall.bestStreak,
            displayName: currentUser.displayName || "Player",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn("Could not save to leaderboard:", e);
    }
}

// ─── LEADERBOARD MODAL LOGIC ──────────────────────────────────

async function openLeaderboard() {
    if (!db) {
        showToast("Firebase not configured!");
        return;
    }
    leaderboardModal.classList.add('active');
    leaderboardList.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading Leaderboard...</div>';

    try {
        // Single orderBy avoids needing a composite Firestore index.
        // We fetch more results and sort by bestStreak client-side as a tiebreaker.
        const snapshot = await db.collection('users')
            .orderBy('totalCorrect', 'desc')
            .limit(20)
            .get();

        leaderboardList.innerHTML = '';
        if (snapshot.empty) {
            leaderboardList.innerHTML = '<div class="empty-state">No players yet. Be the first!</div>';
            return;
        }

        // Client-side tiebreaker sort by bestStreak (avoids composite index)
        const docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, data: doc.data() }));
        docs.sort((a, b) => {
            const diff = (b.data.totalCorrect || 0) - (a.data.totalCorrect || 0);
            if (diff !== 0) return diff;
            return (b.data.bestStreak || 0) - (a.data.bestStreak || 0);
        });
        const top10 = docs.slice(0, 10);

        let rank = 1;
        top10.forEach(({ id, data }) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${currentUser && currentUser.uid === id ? 'current-user-rank' : ''} rank-${rank}`;

            let medal = `<div class="rank-num">${rank}</div>`;
            if (rank === 1) medal = `<div class="rank-num"><i class="fas fa-medal" style="color: #ffd700;"></i></div>`;
            else if (rank === 2) medal = `<div class="rank-num"><i class="fas fa-medal" style="color: #c0c0c0;"></i></div>`;
            else if (rank === 3) medal = `<div class="rank-num"><i class="fas fa-medal" style="color: #cd7f32;"></i></div>`;

            item.innerHTML = `
                ${medal}
                <div class="lb-name">${data.displayName || 'Anonymous'}</div>
                <div class="lb-stats">
                    <div class="lb-stat"><i class="fas fa-check-circle"></i> ${data.totalCorrect || 0}</div>
                    <div class="lb-stat"><i class="fas fa-fire"></i> ${data.bestStreak || 0}</div>
                </div>
            `;
            leaderboardList.appendChild(item);
            rank++;
        });

    } catch (e) {
        leaderboardList.innerHTML = `<div class="error-state">Failed to load leaderboard.<br>${e.message}</div>`;
    }
}

function closeLeaderboard() {
    leaderboardModal.classList.remove('active');
}

// Globals to showToast - piggybacking on existing ui
function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (toast && msgEl) {
        msgEl.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Attach UI events once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auth elements
    if (loginBtn) loginBtn.addEventListener('click', openAuthModal);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (authSubmitBtn) authSubmitBtn.addEventListener('click', handleAuthSubmit);
    if (document.getElementById('closeAuthModal')) document.getElementById('closeAuthModal').addEventListener('click', closeAuthModal);

    // Leaderboard elements
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', openLeaderboard);
    if (document.getElementById('closeLeaderboardModal')) document.getElementById('closeLeaderboardModal').addEventListener('click', closeLeaderboard);
    if (document.getElementById('closeLeaderboardBtn')) document.getElementById('closeLeaderboardBtn').addEventListener('click', closeLeaderboard);

    // Auth Modal Background click
    if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });
    if (leaderboardModal) leaderboardModal.addEventListener('click', (e) => { if (e.target === leaderboardModal) closeLeaderboard(); });
});
