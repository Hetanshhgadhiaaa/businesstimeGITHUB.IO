// =============================================
// STUDY AI - Advanced JavaScript
// =============================================

// ===== STATE MANAGEMENT =====
const appState = {
    images: [],
    audioBlob: null,
    recordedChunks: [],
    isRecording: false,
    mediaRecorder: null,
    mediaStream: null,
    chatHistory: [],
    materials: [],
    uploadedFile: null
};

// ===== DOM ELEMENTS =====
const elements = {
    dragDropZone: document.getElementById('dragDropZone'),
    imageInput: document.getElementById('imageInput'),
    imageGallery: document.getElementById('imageGallery'),
    imageCount: document.getElementById('imageCount'),
    recordBtn: document.getElementById('recordBtn'),
    stopBtn: document.getElementById('stopBtn'),
    playBtn: document.getElementById('playBtn'),
    clearAudioBtn: document.getElementById('clearAudioBtn'),
    recordingStatus: document.getElementById('recordingStatus'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    chatMessages: document.getElementById('chatMessages'),
    fileInput: document.getElementById('fileInput'),
    fileInfo: document.getElementById('fileInfo'),
    materialsContainer: document.getElementById('materialsContainer'),
    clearMaterialsBtn: document.getElementById('clearMaterialsBtn'),
    modal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage'),
    closeBtn: document.querySelector('.close'),
    loadingSpinner: document.getElementById('loadingSpinner')
};

// =============================================
// IMAGE UPLOAD FUNCTIONALITY
// =============================================

// Drag and Drop Events
elements.dragDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dragDropZone.classList.add('drag-over');
});

elements.dragDropZone.addEventListener('dragleave', () => {
    elements.dragDropZone.classList.remove('drag-over');
});

elements.dragDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dragDropZone.classList.remove('drag-over');
    handleImageFiles(e.dataTransfer.files);
});

// Click to Upload
elements.dragDropZone.addEventListener('click', () => {
    elements.imageInput.click();
});

elements.imageInput.addEventListener('change', (e) => {
    handleImageFiles(e.target.files);
});

// Handle Image Files
function handleImageFiles(files) {
    const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (appState.images.length + newImages.length > 7) {
        showNotification(`Maximum 7 images allowed. You have ${appState.images.length} images.`, 'warning');
        return;
    }

    newImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            appState.images.push({
                id: Date.now() + Math.random(),
                src: e.target.result,
                name: file.name,
                size: (file.size / 1024).toFixed(2)
            });
            renderImages();
        };
        reader.onerror = () => {
            showNotification('Error reading file', 'error');
        };
        reader.readAsDataURL(file);
    });
}

// Render Images
function renderImages() {
    if (appState.images.length === 0) {
        elements.imageGallery.innerHTML = '';
        elements.imageCount.textContent = '0/7 images uploaded';
        return;
    }

    elements.imageGallery.innerHTML = appState.images.map(img => `
        <div class="image-item">
            <img src="${img.src}" alt="Study material: ${img.name}" onclick="viewImage('${img.src}')">
            <button class="remove-btn" onclick="removeImage('${img.id}')" title="Remove image">×</button>
        </div>
    `).join('');

    elements.imageCount.textContent = `${appState.images.length}/7 images uploaded`;
}

// Remove Image
function removeImage(id) {
    appState.images = appState.images.filter(img => img.id !== id);
    renderImages();
    saveAppState();
}

// View Image Modal
function viewImage(src) {
    elements.modal.style.display = 'block';
    elements.modalImage.src = src;
    document.body.style.overflow = 'hidden';
}

elements.closeBtn.addEventListener('click', () => {
    elements.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        elements.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modal.style.display === 'block') {
        elements.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// =============================================
// AUDIO RECORDING FUNCTIONALITY
// =============================================

// Start Recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        appState.mediaStream = stream;
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
            
            updateRecordingStatus('✅ Recording saved! Ready to use.', '#10b981');
            
            stream.getTracks().forEach(track => track.stop());
        };

        appState.mediaRecorder.onerror = (e) => {
            showNotification(`Recording error: ${e.error}`, 'error');
        };

        appState.mediaRecorder.start();
        appState.isRecording = true;
        
        updateRecordingButtons(true);
        updateRecordingStatus('🔴 Recording...', '#ef4444');
        
    } catch (error) {
        showNotification('Microphone access denied. Please enable it in your browser settings.', 'error');
        console.error('Microphone error:', error);
    }
}

// Stop Recording
function stopRecording() {
    if (appState.mediaRecorder && appState.isRecording) {
        appState.mediaRecorder.stop();
        appState.isRecording = false;
        updateRecordingButtons(false);
    }
}

// Clear Audio
function clearAudio() {
    appState.audioBlob = null;
    appState.recordedChunks = [];
    document.getElementById('audioPlayer').style.display = 'none';
    elements.recordingStatus.textContent = '';
    elements.playBtn.disabled = true;
    elements.clearAudioBtn.disabled = true;
    saveAppState();
}

// Update Recording Buttons
function updateRecordingButtons(isRecording) {
    elements.recordBtn.disabled = isRecording;
    elements.stopBtn.disabled = !isRecording;
    elements.playBtn.disabled = isRecording;
    elements.clearAudioBtn.disabled = isRecording;
}

// Update Recording Status
function updateRecordingStatus(text, color) {
    elements.recordingStatus.textContent = text;
    elements.recordingStatus.style.color = color;
}

// Event Listeners
elements.recordBtn.addEventListener('click', startRecording);
elements.stopBtn.addEventListener('click', stopRecording);
elements.clearAudioBtn.addEventListener('click', clearAudio);

// =============================================
// FILE UPLOAD FUNCTIONALITY
// =============================================

elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        elements.fileInfo.textContent = `✅ File: ${file.name} (${sizeMB} MB)`;
        appState.uploadedFile = file;
        saveAppState();
    }
});

// =============================================
// CHAT FUNCTIONALITY
// =============================================

// Add Message to Chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]).replace(/\n/g, '<br>');
}

// Send Message
async function sendMessage() {
    const message = elements.chatInput.value.trim();
    
    if (!message) {
        showNotification('Please type something!', 'warning');
        return;
    }

    // Add user message
    addMessage(message, true);
    appState.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';

    // Show loading
    showLoading(true);

    // Simulate AI response
    setTimeout(() => {
        showLoading(false);
        
        const responses = [
            `📚 Great question! I can see you have ${appState.images.length} images uploaded. Let me analyze and create study materials for you.`,
            `🤖 I'm processing your request. Based on your materials (${appState.images.length} images${appState.audioBlob ? ' and audio' : ''}), I'll generate helpful content.`,
            `💡 Excellent! Let me create study notes and summaries from your uploaded materials.`,
            `✨ Perfect! I'm analyzing your study materials. Here are some personalized learning suggestions.`,
            `🎯 Based on your request and the ${appState.images.length} images you've uploaded, I recommend:\n\n📝 Creating flashcards\n🎤 Recording explanations\n📊 Visual summaries`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, false);
        appState.chatHistory.push({ role: 'assistant', content: randomResponse, timestamp: new Date() });

        // Auto-generate materials if keywords present
        const keywords = ['summarize', 'create', 'generate', 'explain', 'help', 'teach', 'learn'];
        if (keywords.some(kw => message.toLowerCase().includes(kw))) {
            generateMaterial(message);
        }

        saveAppState();
    }, 800);
}

// Generate Study Material
function generateMaterial(query) {
    const materials = [
        `📝 Study Note: "${query}"\n\n✓ Key concepts covered\n✓ Important definitions\n✓ Practice examples`,
        `🎯 Learning Summary\n1. Main ideas from your materials\n2. Supporting details\n3. Application tips`,
        `💾 Flashcard Set\nQ: What is the main topic?\nA: Review your study materials\n\nQ: How can you apply this?\nA: Consider real-world examples`,
        `📚 Chapter Summary\n• Overview of concepts\n• Key terminology\n• Review questions`
    ];

    const material = materials[Math.floor(Math.random() * materials.length)];
    appState.materials.push({
        id: Date.now(),
        content: material,
        query: query,
        timestamp: new Date()
    });
    
    renderMaterials();
}

// Render Materials
function renderMaterials() {
    if (appState.materials.length === 0) {
        elements.materialsContainer.innerHTML = '<p class="empty-state">Materials will appear here after you ask questions</p>';
        return;
    }

    elements.materialsContainer.innerHTML = appState.materials.map((material, index) => `
        <div class="material-item">
            ${escapeHtml(material.content).replace(/\n/g, '<br>')}
            <button onclick="removeMaterial(${index})" title="Remove material">Delete</button>
        </div>
    `).join('');
}

// Remove Material
function removeMaterial(index) {
    appState.materials.splice(index, 1);
    renderMaterials();
    saveAppState();
}

// Clear All Materials
elements.clearMaterialsBtn?.addEventListener('click', () => {
    if (confirm('Clear all materials?')) {
        appState.materials = [];
        renderMaterials();
        saveAppState();
    }
});

// Send Button Click
elements.sendBtn.addEventListener('click', sendMessage);

// Enter to Send (Shift+Enter for new line)
elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
elements.chatInput.addEventListener('input', () => {
    elements.chatInput.style.height = 'auto';
    elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 120) + 'px';
});

// =============================================
// NOTIFICATIONS & LOADING
// =============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showLoading(show) {
    elements.loadingSpinner.style.display = show ? 'flex' : 'none';
}

// =============================================
// STORAGE & INITIALIZATION
// =============================================

// Save State
function saveAppState() {
    const dataToSave = {
        chatHistory: appState.chatHistory,
        materials: appState.materials,
        lastSaved: new Date()
    };
    localStorage.setItem('studyAiAppState', JSON.stringify(dataToSave));
}

// Load State
function loadAppState() {
    const saved = localStorage.getItem('studyAiAppState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appState.chatHistory = data.chatHistory || [];
            appState.materials = data.materials || [];
            
            // Restore materials display
            if (appState.materials.length > 0) {
                renderMaterials();
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
}

// Auto-save every 30 seconds
setInterval(saveAppState, 30000);

// =============================================
// WELCOME & INITIALIZATION
// =============================================

window.addEventListener('load', () => {
    // Load saved data
    loadAppState();
    
    // Show welcome message
    const welcomeMessage = `👋 Welcome to Study AI!\n\nHere's how to get started:\n1. 📸 Upload up to 7 study images\n2. 🎤 Record audio explanations\n3. 📁 Upload audio/video files\n4. 💬 Ask me questions about your materials\n5. 📝 Get AI-generated study materials\n\nLet's make learning smarter! 🚀`;
    
    addMessage(welcomeMessage, false);
});

// =============================================
// DEBUGGING & CONSOLE
// =============================================

console.log('%c📚 Study AI App Loaded Successfully', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('Available Features:', {
    'Image Upload': '✅ Up to 7 images',
    'Audio Recording': '✅ Using Web Audio API',
    'File Upload': '✅ Audio/Video files',
    'AI Chat': '✅ Simulated responses',
    'Study Materials': '✅ Auto-generated content',
    'Local Storage': '✅ Data persistence',
    'Responsive Design': '✅ Mobile & Desktop'
});
