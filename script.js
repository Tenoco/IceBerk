// Global variables
let coinBalance = 2500;
let userId = '';
let username = '';
let tasks = {
    telegram: false,
    whatsapp: false,
    invite: false,
    iceberk: false
};
let inviteStartTime = null;
let lastPlayedTime = null;
let hasAssistant = false;
let lastAssistantPayout = null;
let hasIceFactory = false; // New variable to track Ice Factory ownership
let lastIceFactoryPayout = null; // New variable to track last Ice Factory payout

// Function to generate a random user ID
function generateUserId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to show alerts
function showAlert(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.classList.add('show');
    setTimeout(() => {
        alert.classList.remove('show');
    }, 15000); // Alert lasts for 15 seconds
}

// Function to set a cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
}

// Function to get a cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

// Function to delete a cookie
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
}

// Function to sign up
function signUp() {
    username = document.getElementById('username').value;
    if (username) {
        userId = generateUserId();
        document.getElementById('display-username').textContent = username;
        document.getElementById('display-userId').textContent = userId;
        document.getElementById('sign-in-up').style.display = 'none';
        document.getElementById('app-header').style.display = 'block';
        document.getElementById('tab-bar').style.display = 'flex';
        showSection('account');
        saveUserData();
        showAlert('Account created successfully!');
    } else {
        showAlert('Please enter a username.');
    }
}

// Function to show sign-in fields
function showSignInFields() {
    document.getElementById('username').style.display = 'none';
    document.getElementById('userId').style.display = 'block';
    document.getElementById('encryptedData').style.display = 'block';
    document.getElementById('signUpButton').style.display = 'none';
    document.getElementById('showSignInButton').style.display = 'none';
    document.getElementById('signInButton').style.display = 'block';
}

// Function to sign in
function signIn() {
    const inputUserId = document.getElementById('userId').value;
    const inputEncryptedData = document.getElementById('encryptedData').value;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(inputEncryptedData, inputUserId);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        if (decryptedData.userId === inputUserId) {
            loadUserDataFromDecrypted(decryptedData);
            showAlert('Signed in successfully!');
            if (hasAssistant) {
                updateAssistantCountdown();
            }
            if (hasIceFactory) {
                updateIceFactoryCountdown();
            }
        } else {
            showAlert('Invalid User ID or encrypted data.');
        }
    } catch (e) {
        showAlert('Invalid encrypted data. Please try again.');
    }
}

// Function to load user data from decrypted object
function loadUserDataFromDecrypted(decryptedData) {
    userId = decryptedData.userId;
    username = decryptedData.username;
    coinBalance = decryptedData.coinBalance;
    tasks = decryptedData.tasks;
    inviteStartTime = decryptedData.inviteStartTime;
    lastPlayedTime = decryptedData.lastPlayedTime;
    hasAssistant = decryptedData.hasAssistant;
    lastAssistantPayout = decryptedData.lastAssistantPayout;
    hasIceFactory = decryptedData.hasIceFactory; // Load Ice Factory data
    lastIceFactoryPayout = decryptedData.lastIceFactoryPayout; // Load last Ice Factory payout

    document.getElementById('display-username').textContent = username;
    document.getElementById('display-userId').textContent = userId;
    document.getElementById('coin-balance').textContent = coinBalance;
    document.getElementById('sign-in-up').style.display = 'none';
    document.getElementById('app-header').style.display = 'block';
    document.getElementById('tab-bar').style.display = 'flex';
    showSection('account');
    saveUserData();
}

// Function to show a specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'shop') {
        if (hasAssistant) {
            document.getElementById('buyAssistantBtn').disabled = true;
            document.getElementById('assistantInfo').style.display = 'block';
            updateAssistantCountdown();
        }
        if (hasIceFactory) {
            document.getElementById('buyIceFactoryBtn').disabled = true;
            document.getElementById('iceFactoryInfo').style.display = 'block';
            updateIceFactoryCountdown();
        }
    }
}

// Function to complete a task
function completeTask(coins, task) {
    if (!tasks[task]) {
        showAlert('Verifying...');
        setTimeout(() => {
            coinBalance += coins;
            document.getElementById('coin-balance').textContent = coinBalance;
            tasks[task] = true;
            showAlert(`Task completed! You've earned ${coins} BERKS.`);
            saveUserData();
        }, 2000);
    } else {
        showAlert('Task already completed.');
    }
}

// Function to invite friends
function inviteFriends() {
    if (!tasks.invite) {
        inviteStartTime = Date.now();
        tasks.invite = true;
        showAlert('Share the @iceberobot link with your friends. You will be rewarded after 2 hours.');
        saveUserData();
    } else {
        const elapsed = (Date.now() - inviteStartTime) / (1000 * 60 * 60);
        if (elapsed >= 2) {
            coinBalance += 10000;
            document.getElementById('coin-balance').textContent = coinBalance;
            showAlert('You have been rewarded 10,000 BERKS for inviting friends!');
            tasks.invite = false;
            saveUserData();
        } else {
            showAlert(`Please wait for ${Math.ceil(2 - elapsed)} more hours to complete this task.`);
        }
    }
}

// Function to play mini games
function playMiniGames() {
    const currentTime = Date.now();
    const eightHoursInMillis = 8 * 60 * 60 * 1000;

    if (!lastPlayedTime || (currentTime - lastPlayedTime) >= eightHoursInMillis) {
        lastPlayedTime = currentTime;
        let playDuration = 0;
        let totalCoinsEarned = 0;

        const rewardInterval = setInterval(() => {
            playDuration += 60000;
            const coinsEarned = Math.min(playDuration / 60000 * 1000, 60000);
            coinBalance += coinsEarned;
            totalCoinsEarned += coinsEarned;
            document.getElementById('coin-balance').textContent = Math.floor(coinBalance);
            saveUserData();
        }, 60000);

        setTimeout(() => {
            clearInterval(rewardInterval);
            showAlert(`You have earned ${Math.floor(totalCoinsEarned)} BERKS for playing Mini Games!`);
        }, 60 * 60 * 1000);
    } else {
        const remainingTime = Math.ceil((eightHoursInMillis - (currentTime - lastPlayedTime)) / (60 * 60 * 1000));
        showAlert(`You can play Mini Games again in ${remainingTime} hours.`);
    }
}

// Function to buy an assistant
function buyAssistant() {
    if (coinBalance >= 10000) {
        coinBalance -= 10000;
        hasAssistant = true;
        lastAssistantPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyAssistantBtn').disabled = true;
        document.getElementById('assistantInfo').style.display = 'block';
        showAlert('You have successfully purchased an Assistant!');
        saveUserData();
        updateAssistantCountdown();
    } else {
        showAlert('Not enough BERKS to purchase the Assistant.');
    }
}

// Function to buy an Ice Factory
function buyIceFactory() {
    if (coinBalance >= 30000) {
        coinBalance -= 30000;
        hasIceFactory = true;
        lastIceFactoryPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyIceFactoryBtn').disabled = true;
        document.getElementById('iceFactoryInfo').style.display = 'block';
        showAlert('You have successfully purchased an Ice Factory!');
        saveUserData();
        updateIceFactoryCountdown();
    } else {
        showAlert('Not enough BERKS to purchase the Ice Factory.');
    }
}

// Function to update assistant countdown
function updateAssistantCountdown() {
    if (hasAssistant) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastAssistantPayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('assistantCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 500;
            lastAssistantPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your Assistant has generated 500 BERKS!');
        }

        setTimeout(updateAssistantCountdown, 1000);
    }
}

// Function to update Ice Factory countdown
function updateIceFactoryCountdown() {
    if (hasIceFactory) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastIceFactoryPayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('iceFactoryCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 8000; // Ice Factory generates 8000 BERKS
            lastIceFactoryPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your Ice Factory has generated 8,000 BERKS!');
        }

        setTimeout(updateIceFactoryCountdown, 1000);
    }
}

// Function to save user data (encrypted) using cookies
function saveUserData() {
    try {
        if (!userId) {
            throw new Error('User ID is not set. Cannot save data.');
        }

        const data = {
            userId,
            username,
            coinBalance,
            tasks,
            inviteStartTime,
            lastPlayedTime,
            hasAssistant,
            lastAssistantPayout,
            hasIceFactory, // Save Ice Factory data
            lastIceFactoryPayout // Save last Ice Factory payout
        };

        const jsonData = JSON.stringify(data);
        const encryptedData = CryptoJS.AES.encrypt(jsonData, userId).toString();
        setCookie('userData', encryptedData, 7); // Save for 7 days
        setCookie('userId', userId, 7); // Save userId separately for 7 days
    } catch (e) {
        console.error('Error saving user data:', e);
        showAlert('Error saving user data. Please try again.');
    }
}

// Function to load user data (decrypted) from cookies
function loadUserData() {
    const encryptedData = getCookie('userData');
    const storedUserId = getCookie('userId');
    if (encryptedData && storedUserId) {
        try {
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, storedUserId);
            const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) {
                throw new Error('Decryption failed: Invalid UTF-8 string.');
            }

            const decryptedData = JSON.parse(decryptedString);
            loadUserDataFromDecrypted(decryptedData);
            
            if (hasAssistant) {
                document.getElementById('buyAssistantBtn').disabled = true;
                document.getElementById('assistantInfo').style.display = 'block';
                updateAssistantCountdown();
            }
            if (hasIceFactory) {
                document.getElementById('buyIceFactoryBtn').disabled = true;
                document.getElementById('iceFactoryInfo').style.display = 'block';
                updateIceFactoryCountdown();
            }
        } catch (e) {
            console.error('Error loading user data:', e);
            showAlert('Error loading user data. Please sign in again or reset your data.');
        }
    }
}

// Function to export data
function exportData() {
    const data = {
        userId,
        username,
        coinBalance,
        tasks,
        inviteStartTime,
        lastPlayedTime,
        hasAssistant,
        lastAssistantPayout,
        hasIceFactory,
        lastIceFactoryPayout
    };
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), userId).toString();
    const exportDiv = document.getElementById('exported-data');
    exportDiv.textContent = encryptedData;
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(encryptedData);
        showAlert('Data copied to clipboard!');
    };
    exportDiv.appendChild(copyButton);
}

// Function to import data
function importData() {
    const encryptedData = prompt('Enter your exported data:');
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, userId);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        loadUserDataFromDecrypted(decryptedData);
        showAlert('Data imported successfully!');
        if (hasAssistant) {
            document.getElementById('buyAssistantBtn').disabled = true;
            document.getElementById('assistantInfo').style.display = 'block';
            updateAssistantCountdown();
        }
        if (hasIceFactory) {
            document.getElementById('buyIceFactoryBtn').disabled = true;
            document.getElementById('iceFactoryInfo').style.display = 'block';
            updateIceFactoryCountdown();
        }
    } catch (e) {
        showAlert('Invalid data. Please enter valid exported data.');
    }
}

// Function to logout
function logout() {
    deleteCookie('userData');
    deleteCookie('userId');
    userId = '';
    username = '';
    coinBalance = 0;
    tasks = { telegram: false, whatsapp: false, invite: false, iceberk: false };
    inviteStartTime = null;
    lastPlayedTime = null;
    hasAssistant = false;
    lastAssistantPayout = null;
    hasIceFactory = false; // Reset Ice Factory data
    lastIceFactoryPayout = null; // Reset last Ice Factory payout
    document.getElementById('sign-in-up').style.display = 'flex';
    document.getElementById('app-header').style.display = 'none';
    document.getElementById('tab-bar').style.display = 'none';
    document.getElementById('account').style.display = 'none';
    document.getElementById('username').style.display = 'block';
    document.getElementById('userId').style.display = 'none';
    document.getElementById('encryptedData').style.display = 'none';
    document.getElementById('signUpButton').style.display = 'block';
    document.getElementById('showSignInButton').style.display = 'block';
    document.getElementById('signInButton').style.display = 'none';
    showAlert('You have logged out successfully.');
}

// Function to copy user ID
function copyUserId() {
    navigator.clipboard.writeText(userId);
    showAlert('User ID copied to clipboard!');
}



// Load user data when the window loads
window.onload = () => {
    loadUserData();
};