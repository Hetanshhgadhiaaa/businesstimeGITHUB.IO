// ============================================
// STUDY AI APP - Main JavaScript
// ============================================

// State Management
const appState = {
    images: [],
    audioBlob: null,
    recordedChunks: [],
    isRecording: false,
    mediaRecorder: null,
    chatHistory: [],
    materials: []
};

// DOM Elements
const dragDropZone = document.getElementById('dragDropZone');
const imageInput = document.getElementById('imageInput');
const imageGallery = document.getElementById('imageGallery');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const playBtn = document.getElementById('playBtn');
const clearAudioBtn = document.getElementById('clearAudioBtn');
const recordingStatus = document.getElementById('recordingStatus');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const materialsContainer = document.getElementById('materialsContainer');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.querySelector('.close');

// ============================================
// IMAGE UPLOAD FUNCTIONALITY
// ============================================

// Drag and Drop
dragDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropZone.classList.add('drag-over');
});

dragDropZone.addEventListener('dragleave', () => {
    dragDropZone.classList.remove('drag-over');
});

dragDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    handleImageFiles(files);
});

// Click to Upload
dragDropZone.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    handleImageFiles(e.target.files);
});

// Handle Image Files
function handleImageFiles(files) {
    const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (appState.images.length + newImages.length > 7) {
        alert('Maximum 7 images allowed. You have ' + appState.images.length + ' images already.');
        return;
    }

    newImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            appState.images.push({
                id: Date.now() + Math.random(),
                src: e.target.result,
                name: file.name
            });
            renderImages();
        };
        reader.readAsDataURL(file);
    });
}

// Render Images
function renderImages() {
    imageGallery.innerHTML = appState.images.map(img => `
        <div class="image-item">
            <img src="${img.src}" alt="Study material" onclick="viewImage('${img.src}')">
            <button class="remove-btn" onclick="removeImage('${img.id}')">×</button>
        </div>
    `).join('');
}

// Remove Image
function removeImage(id) {
    appState.images = appState.images.filter(img => img.id !== id);
    renderImages();
}

// View Image in Modal
function viewImage(src) {
    modal.style.display = 'block';
    modalImage.src = src;
}

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ============================================
// AUDIO RECORDING FUNCTIONALITY
// ============================================

// Request Microphone Access
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        appState.mediaRecorder = new MediaRecorder(stream);
        appState.recordedChunks = [];

        appState.mediaRecorder.ondataavailable = (e) => {
            appState.recordedChunks.push(e.data);
        };

        appState.mediaRecorder.onstop = () => {
            appState.audioBlob = new Blob(appState.recordedChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(appState.audioBlob);
            
            const audioPlayer = document.querySelector('#audioPlayer audio');
            audioPlayer.src = audioUrl;
            document.getElementById('audioPlayer').style.display = 'block';
            
            recordingStatus.textContent = '✅ Recording saved! Ready to use.';
            recordingStatus.style.color = '#10b981';
        };

        appState.mediaRecorder.start();
        appState.isRecording = true;
        
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        playBtn.disabled = true;
        recordingStatus.textContent = '🔴 Recording...';
        recordingStatus.style.color = '#ef4444';
    } catch (error) {
        alert('Microphone access denied. Please enable it in your browser settings.');
        console.error('Microphone error:', error);
    }
}

// Stop Recording
function stopRecording() {
    if (appState.mediaRecorder) {
        appState.mediaRecorder.stop();
        appState.isRecording = false;
        
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        playBtn.disabled = false;
        clearAudioBtn.disabled = false;
    }
}

// Clear Audio
function clearAudio() {
    appState.audioBlob = null;
    appState.recordedChunks = [];
    document.getElementById('audioPlayer').style.display = 'none';
    recordingStatus.textContent = '';
    playBtn.disabled = true;
    clearAudioBtn.disabled = true;
}

recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
clearAudioBtn.addEventListener('click', clearAudio);

// ============================================
// FILE UPLOAD FUNCTIONALITY
// ============================================

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileInfo.textContent = `✅ File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        appState.uploadedFile = file;
    }
});

// ============================================
// CHAT FUNCTIONALITY
// ============================================

// Add Message to Chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Message
async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) {
        alert('Please type something!');
        return;
    }

    // Add user message
    addMessage(message, true);
    appState.chatHistory.push({ role: 'user', content: message });
    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
        const responses = [
            '📚 Great question! Based on your study materials, I can help you understand this better. I see you have ' + appState.images.length + ' images uploaded. Let me analyze them...',
            '🤖 I\'m processing your request. I can see your study materials and will help you create personalized learning content.',
            '💡 Excellent! Let me create a summary of your materials and generate study notes based on what you\'ve uploaded.',
            '✨ Perfect! I\'m analyzing your images and audio to create comprehensive study materials for you.',
            '🎯 I understand! Based on your study materials (' + appState.images.length + ' images' + (appState.audioBlob ? ' and audio' : '') + '), here\'s what I recommend:\n\n📝 Create flashcards\n🎤 Practice speaking points\n📊 Visual summaries'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, false);

        // Generate material
        if (message.toLowerCase().includes('summarize') || 
            message.toLowerCase().includes('create') || 
            message.toLowerCase().includes('generate')) {
            generateMaterial(message);
        }
    }, 500);
}

// Generate Study Material
function generateMaterial(query) {
    const materials = [
        `📝 Study Note: "${query}"\n\nKey Points:\n• Key concept 1\n• Key concept 2\n• Key concept 3`,
        `🎯 Practice Summary:\n✓ Review all uploaded images\n✓ Listen to audio recordings\n✓ Answer practice questions`,
        `💾 Generated Content:\nBased on your materials, focus on:\n1. Main ideas\n2. Supporting details\n3. Application examples`
    ];

    const material = materials[Math.floor(Math.random() * materials.length)];
    appState.materials.push(material);
    
    renderMaterials();
}

// Render Generated Materials
function renderMaterials() {
    if (appState.materials.length === 0) {
        materialsContainer.innerHTML = '<p class="empty-state">Materials will appear here after you ask questions</p>';
        return;
    }

    materialsContainer.innerHTML = appState.materials.map((material, index) => `
        <div class="material-item">
            ${material.replace(/\n/g, '<br>')}
            <button style="margin-top: 10px; padding: 5px 10px; background: var(--danger-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 11px;" onclick="removeMaterial(${index})">Delete</button>
        </div>
    `).join('');
}

// Remove Material
function removeMaterial(index) {
    appState.materials.splice(index, 1);
    renderMaterials();
}

// Send Button Click
sendBtn.addEventListener('click', sendMessage);

// Enter to Send (Shift+Enter for new line)
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Welcome Message
window.addEventListener('load', () => {
    addMessage('👋 Welcome to Study AI! I\'m your AI Study Assistant. Here\'s how to get started:\n\n1. 📸 Upload up to 7 study images (textbooks, notes, diagrams)\n2. 🎤 Record audio explanations or lectures\n3. 📁 Upload audio/video files\n4. 💬 Ask me questions and I\'ll help create personalized study materials\n\nLet\'s make learning smarter! 🚀', false);
});

// Save Data to LocalStorage
function saveAppState() {
    localStorage.setItem('appState', JSON.stringify({
        chatHistory: appState.chatHistory,
        materials: appState.materials
    }));
}

// Load Data from LocalStorage
function loadAppState() {
    const saved = localStorage.getItem('appState');
    if (saved) {
        const data = JSON.parse(saved);
        appState.chatHistory = data.chatHistory || [];
        appState.materials = data.materials || [];
        renderMaterials();
    }
}

// Auto-save
setInterval(saveAppState, 30000);

// Load on startup
loadAppState();

// ============================================
// CONSOLE LOGS FOR DEBUGGING
// ============================================

console.log('%c📚 Study AI App Loaded', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('Features available:', {
    'Image Upload': 'Up to 7 images',
    'Audio Recording': 'Using MediaRecorder API',
    'File Upload': 'Audio/Video files',
    'AI Chat': 'Simulated responses',
    'Study Materials': 'Auto-generated summaries'
});
