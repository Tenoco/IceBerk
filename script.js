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
let hasIceFactory = false;
let lastIceFactoryPayout = null;
let hasIceMiner = false;
let lastIceMinerPayout = null;
let hasTaskManager = false;
let lastTaskManagerPayout = null;
let hasBerkVault = false;
let lastBerkVaultPayout = null;
let hasIceBot = false;
let lastIceBotPayout = null;
let hasFrostForge = false;
let lastFrostForgePayout = null;
let transactionHistory = [];
let receivedCodes = []
let storedBalance = 0;
let usersList = [
    { userId: 'PdGdx3WV8vph1Tz', username: 'Enoch', status: 'safe', balanceChange: '', expiryTime: 15 }, // Add 100 BERKS with a 60-second expiry
    { userId: 'N82H9GmK32khTwY', username: 'Juwon', status: 'safe', balanceChange: '-50', expiryTime: 120 },  // Subtract 50 BERKS with a 120-second expiry
    { userId: 'user3', username: 'Charlie', status: 'frozen', balanceChange: '200', expiryTime: 30 } // Set to 200 BERKS with a 30-second expiry
    // Add more users as needed
];


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
    // Create a new alert container
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert';

    // Create the message element
    const messageElement = document.createElement('span');
    messageElement.textContent = message;

    // Create the OK button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.className = 'alert-button';
    
    // Add event listener to remove alert on button click
    okButton.addEventListener('click', () => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            alertContainer.remove(); // Remove from DOM after fading out
        }, 300); // Wait for fade-out transition
    });

    // Append message and button to the alert container
    alertContainer.appendChild(messageElement);
    alertContainer.appendChild(okButton);
    
    // Append the alert container to the body
    document.body.appendChild(alertContainer);

    // Trigger the show animation
    setTimeout(() => {
        alertContainer.classList.add('show');
        
        // Automatically hide after 15 seconds if not dismissed
        setTimeout(() => {
            if (alertContainer) { // Check if it still exists
                alertContainer.classList.remove('show');
                setTimeout(() => {
                    alertContainer.remove(); // Remove from DOM after fading out
                }, 300); // Wait for fade-out transition
            }
        }, 15000); // Alert lasts for 15 seconds
    }, 10); // Small delay to allow rendering
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
            updateEarningsCountdowns();
            calculateTotalEarningsPerHour();
        } else {
            showAlert('Invalid User ID or encrypted data.');
        }
    } catch (e) {
        showAlert('Invalid encrypted data. Please try again.');
    }
}

function loadUserDataFromDecrypted(decryptedData) {
    // Ensure decryptedData is an object
    if (!decryptedData || typeof decryptedData !== 'object') {
        console.error('Invalid decrypted data.');
        return;
    }

    // Set default values for all variables
    userId = decryptedData.userId || ''; // Default to empty string if undefined
    username = decryptedData.username || 'Guest'; // Default to 'Guest' if undefined
    coinBalance = decryptedData.coinBalance || 0; // Default to 0 if undefined
    tasks = decryptedData.tasks || {}; // Default to empty object if undefined
    inviteStartTime = decryptedData.inviteStartTime || null; // Default to null if undefined
    lastPlayedTime = decryptedData.lastPlayedTime || null; // Default to null if undefined
    hasAssistant = decryptedData.hasAssistant !== undefined ? decryptedData.hasAssistant : false; // Default to false
    lastAssistantPayout = decryptedData.lastAssistantPayout || null; // Default to null if undefined
    hasIceFactory = decryptedData.hasIceFactory !== undefined ? decryptedData.hasIceFactory : false; // Default to false
    lastIceFactoryPayout = decryptedData.lastIceFactoryPayout || null; // Default to null if undefined
    hasIceMiner = decryptedData.hasIceMiner !== undefined ? decryptedData.hasIceMiner : false; // Default to false
    lastIceMinerPayout = decryptedData.lastIceMinerPayout || null; // Default to null if undefined
    hasTaskManager = decryptedData.hasTaskManager !== undefined ? decryptedData.hasTaskManager : false; // Default to false
    lastTaskManagerPayout = decryptedData.lastTaskManagerPayout || null; // Default to null if undefined
    hasBerkVault = decryptedData.hasBerkVault !== undefined ? decryptedData.hasBerkVault : false; // Default to false
    lastBerkVaultPayout = decryptedData.lastBerkVaultPayout || null; // Default to null if undefined
    hasIceBot = decryptedData.hasIceBot !== undefined ? decryptedData.hasIceBot : false; // Default to false
    lastIceBotPayout = decryptedData.lastIceBotPayout || null; // Default to null if undefined
    hasFrostForge = decryptedData.hasFrostForge !== undefined ? decryptedData.hasFrostForge : false; // Default to false
    lastFrostForgePayout = decryptedData.lastFrostForgePayout || null; // Default to null if undefined

    receivedCodes = decryptedData.receivedCodes || []; // Default to empty array if undefined
    transactionHistory = decryptedData.transactionHistory || []; // Default to empty array if undefined

   storedBalance = (decryptedData.storedBalance !== undefined) ? decryptedData.storedBalance : coinBalance;

   // Initialize or retrieve update status and timestamps with defaults
   if (decryptedData.balanceUpdated === undefined) {
       decryptedData.balanceUpdated = false; // Default value
   }
   if (decryptedData.lastUpdateTimestamp === undefined) {
       decryptedData.lastUpdateTimestamp = Date.now(); // Default to current time
   }
   if (decryptedData.expiryTimestamp === undefined) {
       decryptedData.expiryTimestamp = 0; // Default value for expiry timestamp
   }

   const currentTime = Date.now();
   if (currentTime > decryptedData.expiryTimestamp) {
       // If expired, reset balance update status
       decryptedData.balanceUpdated = false; 
   }

   updateStoredBalance(decryptedData); 

   document.getElementById('display-username').textContent = username;
   document.getElementById('coin-balance').textContent = coinBalance;

   const statusElement = document.createElement('div');
   statusElement.id = 'user-status';
   document.querySelector('.user-info').appendChild(statusElement);

   document.getElementById('sign-in-up').style.display = 'none';
   document.getElementById('app-header').style.display = 'block';
   document.getElementById('tab-bar').style.display = 'flex';
   showSection('account');

   checkUserStatus(); 
}
// Function to show a specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'shop') {
        updateShopButtons();
    }
}

// Function to update shop buttons based on ownership
function updateShopButtons() {
    document.getElementById('buyAssistantBtn').disabled = hasAssistant;
    document.getElementById('assistantInfo').style.display = hasAssistant ? 'block' : 'none';

    document.getElementById('buyIceFactoryBtn').disabled = hasIceFactory;
    document.getElementById('iceFactoryInfo').style.display = hasIceFactory ? 'block' : 'none';

    document.getElementById('buyIceMinerBtn').disabled = hasIceMiner;
    document.getElementById('iceMinerInfo').style.display = hasIceMiner ? 'block' : 'none';

    document.getElementById('buyTaskManagerBtn').disabled = hasTaskManager;
    document.getElementById('taskManagerInfo').style.display = hasTaskManager ? 'block' : 'none';

    document.getElementById('buyBerkVaultBtn').disabled = hasBerkVault;
    document.getElementById('berkVaultInfo').style.display = hasBerkVault ? 'block' : 'none';

    document.getElementById('buyIceBotBtn').disabled = hasIceBot;
    document.getElementById('iceBotInfo').style.display = hasIceBot ? 'block' : 'none';

    document.getElementById('buyFrostForgeBtn').disabled = hasFrostForge;
    document.getElementById('frostForgeInfo').style.display = hasFrostForge ? 'block' : 'none';
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
    if (coinBalance >= 100000) {
        coinBalance -= 100000;
        hasAssistant = true;
        lastAssistantPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyAssistantBtn').disabled = true;
        document.getElementById('assistantInfo').style.display = 'block';
        showAlert('You have successfully purchased an Assistant!');
        saveUserData();
        updateAssistantCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the Assistant.');
    }
}

// Function to buy an Ice Factory
function buyIceFactory() {
    if (coinBalance >= 350000) {
        coinBalance -= 350000;
        hasIceFactory = true;
        lastIceFactoryPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyIceFactoryBtn').disabled = true;
        document.getElementById('iceFactoryInfo').style.display = 'block';
        showAlert('You have successfully purchased an Ice Factory!');
        saveUserData();
        updateIceFactoryCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the Ice Factory.');
    }
}

// Function to buy an Ice Miner
function buyIceMiner() {
    if (coinBalance >= 200000) {
        coinBalance -= 200000;
        hasIceMiner = true;
        lastIceMinerPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyIceMinerBtn').disabled = true;
        document.getElementById('iceMinerInfo').style.display = 'block';
        showAlert('You have successfully purchased an IceMiner!');
        saveUserData();
        updateIceMinerCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the IceMiner.');
    }
}

// Function to buy a Task Manager
function buyTaskManager() {
    if (coinBalance >= 150000) {
        coinBalance -= 150000;
        hasTaskManager = true;
        lastTaskManagerPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyTaskManagerBtn').disabled = true;
        document.getElementById('taskManagerInfo').style.display = 'block';
        showAlert('You have successfully purchased a Task Manager!');
        saveUserData();
        updateTaskManagerCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the Task Manager.');
    }
}

// Function to buy a BERK Vault
function buyBerkVault() {
    if (coinBalance >= 500000) {
        coinBalance -= 500000;
        hasBerkVault = true;
        lastBerkVaultPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyBerkVaultBtn').disabled = true;
        document.getElementById('berkVaultInfo').style.display = 'block';
        showAlert('You have successfully purchased a BERK Vault!');
        saveUserData();
        updateBerkVaultCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the BERK Vault.');
    }
}

// Function to buy an IceBot
function buyIceBot() {
    if (coinBalance >= 250000) {
        coinBalance -= 250000;
        hasIceBot = true;
        lastIceBotPayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyIceBotBtn').disabled = true;
        document.getElementById('iceBotInfo').style.display = 'block';
        showAlert('You have successfully purchased an IceBot!');
        saveUserData();
        updateIceBotCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the IceBot.');
    }
}

// Function to buy a Frost Forge
function buyFrostForge() {
    if (coinBalance >= 2000000) {
        coinBalance -= 2000000;
        hasFrostForge = true;
        lastFrostForgePayout = Date.now();
        document.getElementById('coin-balance').textContent = coinBalance;
        document.getElementById('buyFrostForgeBtn').disabled = true;
        document.getElementById('frostForgeInfo').style.display = 'block';
        showAlert('You have successfully purchased a Frost Forge!');
        saveUserData();
        updateFrostForgeCountdown();
        calculateTotalEarningsPerHour();
    } else {
        showAlert('Not enough BERKS to purchase the Frost Forge.');
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
            coinBalance += 1500;
            lastAssistantPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your Assistant has generated 1500 BERKS!');
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
            coinBalance += 8000;
            lastIceFactoryPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your Ice Factory has generated 8,000 BERKS!');
        }

        setTimeout(updateIceFactoryCountdown, 1000);
    }
}
// Function to update IceMiner countdown
function updateIceMinerCountdown() {
    if (hasIceMiner) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastIceMinerPayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('iceMinerCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 5000;
            lastIceMinerPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your IceMiner has generated 5,000 BERKS!');
        }

        setTimeout(updateIceMinerCountdown, 1000);
    }
}

// Function to update Task Manager countdown
function updateTaskManagerCountdown() {
    if (hasTaskManager) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastTaskManagerPayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('taskManagerCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 3000;
            lastTaskManagerPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your Task Manager has generated 3,000 BERKS!');
        }

        setTimeout(updateTaskManagerCountdown, 1000);
    }
}

// Function to update BERK Vault countdown
function updateBerkVaultCountdown() {
    if (hasBerkVault) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastBerkVaultPayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('berkVaultCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 10000;
            lastBerkVaultPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your BERK Vault has generated 10,000 BERKS!');
        }

        setTimeout(updateBerkVaultCountdown, 1000);
    }
}

// Function to update IceBot countdown
function updateIceBotCountdown() {
    if (hasIceBot) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastIceBotPayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('iceBotCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 6500;
            lastIceBotPayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your IceBot has generated 6,500 BERKS!');
        }

        setTimeout(updateIceBotCountdown, 1000);
    }
}

// Function to update Frost Forge countdown
function updateFrostForgeCountdown() {
    if (hasFrostForge) {
        const now = Date.now();
        const timeSinceLastPayout = now - lastFrostForgePayout;
        const timeUntilNextPayout = Math.max(0, 3600000 - timeSinceLastPayout);
        const minutes = Math.floor(timeUntilNextPayout / 60000);
        const seconds = Math.floor((timeUntilNextPayout % 60000) / 1000);
        document.getElementById('frostForgeCountdown').textContent = `${minutes}m ${seconds}s`;

        if (timeUntilNextPayout === 0) {
            coinBalance += 50000;
            lastFrostForgePayout = now;
            document.getElementById('coin-balance').textContent = coinBalance;
            saveUserData();
            showAlert('Your Frost Forge has generated 50,000 BERKS!');
        }

        setTimeout(updateFrostForgeCountdown, 1000);
    }
}

// Function to update all earnings countdowns
function updateEarningsCountdowns() {
    updateAssistantCountdown();
    updateIceFactoryCountdown();
    updateIceMinerCountdown();
    updateTaskManagerCountdown();
    updateBerkVaultCountdown();
    updateIceBotCountdown();
    updateFrostForgeCountdown();
}

// Function to calculate total earnings per hour
function calculateTotalEarningsPerHour() {
    let totalEarnings = 0;
    if (hasAssistant) totalEarnings += 1500;
    if (hasIceFactory) totalEarnings += 8000;
    if (hasIceMiner) totalEarnings += 5000;
    if (hasTaskManager) totalEarnings += 3000;
    if (hasBerkVault) totalEarnings += 10000;
    if (hasIceBot) totalEarnings += 6500;
    if (hasFrostForge) totalEarnings += 50000;

    document.getElementById('total-earnings-per-hour').textContent = totalEarnings;
}

// Function to save user data (encrypted) using cookies
function saveUserData(storedBalanceValue, data = {}) {
    try {
        if (!userId) {
            throw new Error('User ID is not set. Cannot save data.');
        }

        const userInfo = {
            userId,
            username,
            coinBalance, 
            tasks,
            inviteStartTime,
            lastPlayedTime,
            hasAssistant,
            lastAssistantPayout,
            hasIceFactory,
            lastIceFactoryPayout,
            hasIceMiner,
            lastIceMinerPayout,
            hasTaskManager,
            lastTaskManagerPayout,
            hasBerkVault,
            lastBerkVaultPayout,
            hasIceBot,
            lastIceBotPayout,
            hasFrostForge,
            lastFrostForgePayout,
            receivedCodes, 
            transactionHistory, 
            
            storedBalance: storedBalanceValue,
            balanceUpdated: data.balanceUpdated || false, 
            lastUpdateTimestamp: data.lastUpdateTimestamp || Date.now(),
            expiryTimestamp: data.expiryTimestamp || 0
        };

        const jsonData = JSON.stringify(userInfo);
        const encryptedData = CryptoJS.AES.encrypt(jsonData, userId).toString();
        setCookie('userData', encryptedData, 7); 
        setCookie('userId', userId, 7); 
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
            updateEarningsCountdowns();
            calculateTotalEarningsPerHour();
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
        lastIceFactoryPayout,
        hasIceMiner,
        lastIceMinerPayout,
        hasTaskManager,
        lastTaskManagerPayout,
        hasBerkVault,
        lastBerkVaultPayout,
        hasIceBot,
        lastIceBotPayout,
        hasFrostForge,
        lastFrostForgePayout
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
        updateEarningsCountdowns();
        calculateTotalEarningsPerHour();
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
    hasIceFactory = false;
    lastIceFactoryPayout = null;
    hasIceMiner = false;
    lastIceMinerPayout = null;
    hasTaskManager = false;
    lastTaskManagerPayout = null;
    hasBerkVault = false;
    lastBerkVaultPayout = null;
    hasIceBot = false;
    lastIceBotPayout = null;
    hasFrostForge = false;
    lastFrostForgePayout = null;
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

// Function to handle quiz answer selection
function selectAnswer(option) {
    const lastQuizDate = getCookie('lastQuizDate');
    const today = new Date().toLocaleDateString();

    if (lastQuizDate === today) {
        showAlert('You have already played the quiz today. Please try again tomorrow.');
        return;
    }

    setCookie('lastQuizDate', today, 1);

    let correctAnswer = 'A';
    if (option === correctAnswer) {
        coinBalance += 10000;
        document.getElementById('coin-balance').textContent = coinBalance;
        showAlert('Correct! You have earned 10,000 BERKS.');
    } else {
        showAlert('Incorrect answer. Better luck next time!');
    }

    saveUserData();
}

function transferBerks() {
    const recipientName = document.getElementById('recipient-name').value;
    const recipientId = document.getElementById('recipient-id').value;
    const transferAmount = parseInt(document.getElementById('transfer-amount').value, 10);
    const userEncryptedData = document.getElementById('user-encrypted-data').value;

    // Validate input fields
    if (!recipientName || !recipientId || isNaN(transferAmount) || !userEncryptedData) {
        showAlert('Please fill in all fields.');
        return;
    }

    if (recipientId === userId) {
        showAlert('You cannot transfer BERKS to yourself.');
        return;
    }

    if (transferAmount < 1) {
        showAlert('Transfer amount must be at least 1 BERK.');
        return;
    }

    if (transferAmount + 50 > coinBalance) {
        showAlert('Insufficient balance to complete the transaction.');
        return;
    }

   // Check transaction limit
   const oneHourAgo = Date.now() - (60 * 60 * 1000);
   const recentTransactions = transactionHistory.filter(transaction => transaction.timestamp > oneHourAgo);
   
   if (recentTransactions.length >= 50) {
       showAlert('Transaction limit reached. You can only make 5 transfers per hour.');
       return;
   }

   try {
       const decryptedBytes = CryptoJS.AES.decrypt(userEncryptedData, userId);
       const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

       if (decryptedData.userId !== userId) {
           showAlert('Invalid encrypted data.');
           return;
       }

       // Create a transaction code
       const transactionCode = CryptoJS.AES.encrypt(
           JSON.stringify({ recipientId, amount: transferAmount, senderName: username }),
           recipientId
       ).toString();

       // Update coin balance
       coinBalance -= (transferAmount + 50);
       document.getElementById('coin-balance').textContent = coinBalance;

       // Record the transaction with timestamp
       transactionHistory.push({ timestamp: Date.now(), recipientId, amount: transferAmount });

       // Display the transaction code in a box
       document.getElementById('transaction-code').value = transactionCode;
       document.getElementById('transaction-code-container').style.display = 'block';

       // Show success alert
       showAlert(`Transfer successful! You sent ${transferAmount} BERKS to ${recipientName}.`);

       // Save user data after successful transfer
       saveUserData();
       
   } catch (e) {
       showAlert('Invalid encrypted data. Please try again.');
   }
}

function copyTransactionCode() {
    const transactionCodeTextArea = document.getElementById('transaction-code');
    transactionCodeTextArea.select();
    document.execCommand('copy');
    
    showAlert('Transaction code copied to clipboard!');
}

function receiveBerks() {
    const receiveCode = document.getElementById('receive-code').value;

    if (!receiveCode) {
        showAlert('Please enter a valid transaction code.');
        return;
    }

    // Check if the code has already been used
    if (receivedCodes.includes(receiveCode)) {
        showAlert('This transaction code has already been used.');
        return;
    }

    try {
        const decryptedBytes = CryptoJS.AES.decrypt(receiveCode, userId);
        const transactionData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

        if (transactionData.recipientId !== userId) {
            showAlert('Transaction code does not match your User ID.');
            return;
        }

        coinBalance += transactionData.amount;
        document.getElementById('coin-balance').textContent = coinBalance;

        // Add the code to the history
        receivedCodes.push(receiveCode);
        saveUserData();

        showAlert(`You have received ${transactionData.amount} BERKS from ${transactionData.senderName}.`);
        
    } catch (e) {
        showAlert('Invalid transaction code. Please try again.');
    }
}

function checkUserStatus() {
    const currentUser = usersList.find(user => user.userId === userId);

    if (!currentUser) {
        showAlert('User not found.');
        return;
    }

    const statusElement = document.getElementById('user-status');
    statusElement.textContent = `Status: ${currentUser.status}`;

    switch (currentUser.status) {
        case 'safe':
            // Allow normal usage
            updateEarningsCountdowns(); // Start earnings calculations
            enableQuiz(); // Enable quiz interactions
            break;
        case 'banned':
            // Redirect to ban.html
            window.location.href = 'ban.html';
            break;
        case 'frozen':
            // Disable earning, receiving, transferring BERKS, and quiz
            disableTransactions();
            stopEarnings(); // Stop earnings calculations
            disableQuiz(); // Disable quiz interactions
            break;
        default:
            showAlert('Unknown status.');
    }
}

function stopEarnings() {
    clearTimeout(updateAssistantCountdown);
    clearTimeout(updateIceFactoryCountdown);
    clearTimeout(updateIceMinerCountdown);
    clearTimeout(updateTaskManagerCountdown);
    clearTimeout(updateBerkVaultCountdown);
    clearTimeout(updateIceBotCountdown);
    clearTimeout(updateFrostForgeCountdown);
}

function disableQuiz() {
    document.querySelectorAll('.quiz-options button').forEach(button => {
        button.disabled = true;
    });
}

function enableQuiz() {
    document.querySelectorAll('.quiz-options button').forEach(button => {
        button.disabled = false;
    });
}

function updateStoredBalance(decryptedData) {
    const currentUser = usersList.find(user => user.userId === userId);
    
    if (currentUser) {
        const changeString = currentUser.balanceChange;
        const expiryTime = parseInt(currentUser.expiryTime, 10); 

        const currentTime = Date.now();
        const elapsedTime = (currentTime - decryptedData.lastUpdateTimestamp) / 1000;

        if (decryptedData.balanceUpdated && elapsedTime < expiryTime) {
            showAlert('Balance update is still valid; no changes will be made.');
            return;
        }

        let newBalance;
        if (changeString.startsWith('+')) {
            const amountToAdd = parseFloat(changeString.slice(1));
            newBalance = storedBalance + amountToAdd;
        } else if (changeString.startsWith('-')) {
            const amountToSubtract = parseFloat(changeString.slice(1));
            newBalance = storedBalance - amountToSubtract;
        } else {
            newBalance = parseFloat(changeString);
        }

        if (newBalance >= 0) {
            setTimeout(() => {
                storedBalance = newBalance;
                coinBalance = newBalance;
                document.getElementById('coin-balance').textContent = coinBalance;

                decryptedData.balanceUpdated = true;
                decryptedData.lastUpdateTimestamp = Date.now();
                saveUserData(storedBalance, { 
                    balanceUpdated: true, 
                    lastUpdateTimestamp: Date.now(), 
                    expiryTimestamp: Date.now() + (expiryTime * 1000) 
                });

                showAlert('User balance updated successfully.');
            }, (expiryTime - elapsedTime) * 1000);
        } else {
            showAlert('Insufficient balance for this operation.');
        }
    } else {
        showAlert('User not found in users list.');
    }
}
// Load user data when the window loads
window.onload = () => {
    loadUserData();
    calculateTotalEarningsPerHour();

    const lastQuizDate = getCookie('lastQuizDate');
    const today = new Date().toLocaleDateString();
    if (lastQuizDate === today) {
        document.querySelectorAll('.quiz-options button').forEach(button => {
            button.disabled = true;
        });
        showAlert('You have already played the quiz today. Please try again tomorrow.');
    }
};