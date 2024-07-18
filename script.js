const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

let isDrawing = false;
let tool = 'pen';
let startX, startY;
let drawingSettings = {
    color: '#000',
    lineThickness: 2,
};
let isLocked = false;
let zoomLevel = 1;
let username = localStorage.getItem('username') || '';

if (username) {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    loadWhiteboard();
} else {
    document.getElementById('app').style.display = 'none';
}

function register() {
    const registerUsername = document.getElementById('registerUsername').value;
    const registerPassword = document.getElementById('registerPassword').value;
    if (registerUsername && registerPassword) {
        localStorage.setItem(`user_${registerUsername}`, registerPassword);
        showNotification('Registration successful. Please log in.');
    } else {
        showNotification('Please enter a username and password.');
    }
}

function login() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const storedPassword = localStorage.getItem(`user_${usernameInput}`);
    if (storedPassword && storedPassword === passwordInput) {
        username = usernameInput;
        localStorage.setItem('username', username);
        document.getElementById('auth').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        loadWhiteboard();
    } else {
        showNotification('Invalid username or password.');
    }
}

function logout() {
    localStorage.removeItem('username');
    username = '';
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth').style.display = 'block';
}

function changeTool(selectedTool) {
    tool = selectedTool;
}

function changeColor(selectedColor) {
    drawingSettings.color = selectedColor;
}

function changeThickness(value) {
    drawingSettings.lineThickness = value;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(event) {
    if (isLocked) return;
    isDrawing = true;
    startX = (event.clientX - canvas.offsetLeft) / zoomLevel;
    startY = (event.clientY - canvas.offsetTop) / zoomLevel;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
}

function stopDrawing(event) {
    if (isLocked || !isDrawing) return;
    isDrawing = false;
    ctx.closePath();

    if (tool !== 'pen' && tool !== 'eraser') {
        drawShape(event);
    }
}

function draw(event) {
    if (isLocked || !isDrawing) return;

    const x = (event.clientX - canvas.offsetLeft) / zoomLevel;
    const y = (event.clientY - canvas.offsetTop) / zoomLevel;

    ctx.lineWidth = tool === 'eraser' ? 10 : drawingSettings.lineThickness;
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : drawingSettings.color;
    ctx.lineCap = 'round';

    if (tool === 'pen' || tool === 'eraser') {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function drawShape(event) {
    const x = (event.clientX - canvas.offsetLeft) / zoomLevel;
    const y = (event.clientY - canvas.offsetTop) / zoomLevel;

    ctx.lineWidth = drawingSettings.lineThickness;
    ctx.strokeStyle = drawingSettings.color;

    switch (tool) {
        case 'line':
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'rectangle':
            ctx.strokeRect(startX, startY, x - startX, y - startY);
            break;
        case 'circle':
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'ellipse':
            const centerX = (startX + x) / 2;
            const centerY = (startY + y) / 2;
            const radiusX = Math.abs(x - startX) / 2;
            const radiusY = Math.abs(y - startY) / 2;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'text':
            const text = prompt('Enter text:');
            if (text) {
                ctx.font = `${drawingSettings.lineThickness * 5}px Arial`;
                ctx.fillStyle = drawingSettings.color;
                ctx.fillText(text, startX, startY);
            }
            break;
    }
}

function addStickyNote() {
    const stickyNote = document.createElement('div');
    stickyNote.className = 'sticky-note';
    stickyNote.contentEditable = true;
    stickyNote.style.position = 'absolute';
    stickyNote.style.left = '100px';
    stickyNote.style.top = '100px';
    stickyNote.style.width = '200px'; // Set width
    stickyNote.style.height = '150px'; // Set height
    stickyNote.style.padding = '10px'; // Add padding
    stickyNote.style.border = '1px solid #ccc'; // Add border
    stickyNote.style.backgroundColor = '#ffeb3b'; // Default background color
    stickyNote.innerText = 'Double-click to edit';

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#ffeb3b';
    colorPicker.onchange = () => {
        stickyNote.style.backgroundColor = colorPicker.value;
    };

    const highlightButton = document.createElement('button');
    highlightButton.innerText = 'Highlight';
    highlightButton.onclick = () => {
        stickyNote.style.backgroundColor = 'yellow'; // Highlight color
    };

    stickyNote.appendChild(colorPicker);
    stickyNote.appendChild(highlightButton);
    document.body.appendChild(stickyNote);

    stickyNote.ondblclick = function () {
        this.contentEditable = true;
        this.focus();
    };

    stickyNote.onblur = function () {
        this.contentEditable = false;
    };
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function lockCanvas() {
    isLocked = !isLocked;
    document.getElementById('lock').innerText = isLocked ? 'Unlock' : 'Lock';
}

function zoomIn() {
    zoomLevel += 0.1;
    canvas.style.height = `${(window.innerHeight - 100) * zoomLevel}px`;
}

function zoomOut() {
    if (zoomLevel > 1) {
        zoomLevel -= 0.1;
        canvas.style.height = `${(window.innerHeight - 100) * zoomLevel}px`;
    }
}

function changeCanvasBackground(color) {
    if (color === 'custom') {
        const customColor = prompt('Enter a color (name or hex):');
        canvas.style.backgroundColor = customColor;
    } else {
        canvas.style.backgroundColor = color;
    }
}

function exportCanvas() {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function loadWhiteboard() {
    const savedData = localStorage.getItem('whiteboard');
    if (savedData) {
        const img = new Image();
        img.src = savedData;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
    }
}

function saveWhiteboard() {
    const data = canvas.toDataURL();
    localStorage.setItem('whiteboard', data);
    showNotification('Whiteboard saved!');
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 100;
    loadWhiteboard(); 
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set the size

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 's':
            saveWhiteboard();
            break;
        case 'c':
            clearBoard();
            break;
        case 'l':
            changeTool('line');
            break;
        case 'r':
            changeTool('rectangle');
            break;
        case 'o':
            changeTool('circle');
            break;
        case 'e':
            changeTool('ellipse');
            break;
        case 't':
            changeTool('text');
            break;
        case 'z':
            zoomIn();
            break;
        case 'x':
            zoomOut();
            break;
    }
});


function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.toggle('dark-theme');

    if (currentTheme) {
        body.style.backgroundColor = '#333';
        body.style.color = '#fff';
        showNotification('Switched to Dark Mode');
    } else {
        body.style.backgroundColor = '#fff';
        body.style.color = '#000';
        showNotification('Switched to Light Mode');
    }
}