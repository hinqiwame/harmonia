/**
 * Professional Guitar Tuner - Multi-Tuning Support
 * Desktop application with real-time pitch detection
 */

// ============================================
// TUNING DEFINITIONS
// ============================================

const TUNINGS = {
    'e-standard': {
        name: 'E Standard',
        notes: [
            { string: 6, note: 'E', octave: 2, frequency: 82.41 },
            { string: 5, note: 'A', octave: 2, frequency: 110.00 },
            { string: 4, note: 'D', octave: 3, frequency: 146.83 },
            { string: 3, note: 'G', octave: 3, frequency: 196.00 },
            { string: 2, note: 'B', octave: 3, frequency: 246.94 },
            { string: 1, note: 'E', octave: 4, frequency: 329.63 }
        ]
    },
    'b-standard': {
        name: 'B Standard',
        notes: [
            { string: 6, note: 'B', octave: 1, frequency: 61.74 },
            { string: 5, note: 'E', octave: 2, frequency: 82.41 },
            { string: 4, note: 'A', octave: 2, frequency: 110.00 },
            { string: 3, note: 'D', octave: 3, frequency: 146.83 },
            { string: 2, note: 'F#', octave: 3, frequency: 185.00 },
            { string: 1, note: 'B', octave: 3, frequency: 246.94 }
        ]
    },
    'd-standard': {
        name: 'D Standard',
        notes: [
            { string: 6, note: 'D', octave: 2, frequency: 73.42 },
            { string: 5, note: 'G', octave: 2, frequency: 98.00 },
            { string: 4, note: 'C', octave: 3, frequency: 130.81 },
            { string: 3, note: 'F', octave: 3, frequency: 174.61 },
            { string: 2, note: 'A', octave: 3, frequency: 220.00 },
            { string: 1, note: 'D', octave: 4, frequency: 293.66 }
        ]
    },
    'c-standard': {
        name: 'C Standard',
        notes: [
            { string: 6, note: 'C', octave: 2, frequency: 65.41 },
            { string: 5, note: 'F', octave: 2, frequency: 87.31 },
            { string: 4, note: 'Bb', octave: 2, frequency: 116.54 },
            { string: 3, note: 'Eb', octave: 3, frequency: 155.56 },
            { string: 2, note: 'G', octave: 3, frequency: 196.00 },
            { string: 1, note: 'C', octave: 4, frequency: 261.63 }
        ]
    },
    'drop-d': {
        name: 'Drop D',
        notes: [
            { string: 6, note: 'D', octave: 2, frequency: 73.42 },
            { string: 5, note: 'A', octave: 2, frequency: 110.00 },
            { string: 4, note: 'D', octave: 3, frequency: 146.83 },
            { string: 3, note: 'G', octave: 3, frequency: 196.00 },
            { string: 2, note: 'B', octave: 3, frequency: 246.94 },
            { string: 1, note: 'E', octave: 4, frequency: 329.63 }
        ]
    },
    'drop-c': {
        name: 'Drop C',
        notes: [
            { string: 6, note: 'C', octave: 2, frequency: 65.41 },
            { string: 5, note: 'G', octave: 2, frequency: 98.00 },
            { string: 4, note: 'C', octave: 3, frequency: 130.81 },
            { string: 3, note: 'F', octave: 3, frequency: 174.61 },
            { string: 2, note: 'A', octave: 3, frequency: 220.00 },
            { string: 1, note: 'D', octave: 4, frequency: 293.66 }
        ]
    },
    'drop-b': {
        name: 'Drop B',
        notes: [
            { string: 6, note: 'B', octave: 1, frequency: 61.74 },
            { string: 5, note: 'F#', octave: 2, frequency: 92.50 },
            { string: 4, note: 'B', octave: 2, frequency: 123.47 },
            { string: 3, note: 'E', octave: 3, frequency: 164.81 },
            { string: 2, note: 'G#', octave: 3, frequency: 207.65 },
            { string: 1, note: 'C#', octave: 4, frequency: 277.18 }
        ]
    },
    'half-step-down': {
        name: 'Eb Standard',
        notes: [
            { string: 6, note: 'Eb', octave: 2, frequency: 77.78 },
            { string: 5, note: 'Ab', octave: 2, frequency: 103.83 },
            { string: 4, note: 'Db', octave: 3, frequency: 138.59 },
            { string: 3, note: 'Gb', octave: 3, frequency: 185.00 },
            { string: 2, note: 'Bb', octave: 3, frequency: 233.08 },
            { string: 1, note: 'Eb', octave: 4, frequency: 311.13 }
        ]
    }
};

// Current tuning state
let currentTuning = 'e-standard';
let currentDeviceId = null;

// Tuning thresholds (in cents)
const CENTS_IN_TUNE = 5;
const CENTS_CLOSE = 15;
const CENTS_MAX_DISPLAY = 50;

// Audio configuration
const AUDIO_CONFIG = {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -60,
    maxDecibels: -10
};

// Application state
let audioContext = null;
let analyser = null;
let microphone = null;
let isListening = false;
let animationId = null;
let dataArray = null;

// DOM Elements - initialized after DOM ready
let elements = {};

/**
 * Get current tuning notes
 */
function getCurrentTuningNotes() {
    return TUNINGS[currentTuning].notes;
}

/**
 * Enumerate available audio input devices
 */
async function getMicrophones() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === 'audioinput');

        // Populate custom select options
        const micSelectCustom = document.querySelector('#micSelectCustom .select-options');
        const micTriggerSpan = document.querySelector('#micSelectCustom .select-trigger span');

        if (micSelectCustom) {
            micSelectCustom.innerHTML = '';

            // Default option
            const defaultOpt = document.createElement('div');
            defaultOpt.className = 'select-option' + (!currentDeviceId ? ' selected' : '');
            defaultOpt.dataset.value = '';
            defaultOpt.textContent = 'Default Input';
            defaultOpt.addEventListener('click', () => handleMicSelect('', 'Default Input'));
            micSelectCustom.appendChild(defaultOpt);

            mics.forEach((mic, index) => {
                const opt = document.createElement('div');
                const isSelected = mic.deviceId === currentDeviceId;
                opt.className = 'select-option' + (isSelected ? ' selected' : '');
                opt.dataset.value = mic.deviceId;
                const label = mic.label || `Microphone ${index + 1}`;
                opt.textContent = label;

                // Update trigger text if this is the selected device
                if (isSelected && micTriggerSpan) {
                    micTriggerSpan.textContent = label;
                }

                opt.addEventListener('click', () => handleMicSelect(mic.deviceId, label));
                micSelectCustom.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Error enumerating devices:', e);
    }
}

/**
 * Handle microphone selection
 */
async function handleMicSelect(deviceId, label) {
    currentDeviceId = deviceId;

    // Update trigger text
    const triggerSpan = document.querySelector('#micSelectCustom .select-trigger span');
    if (triggerSpan) triggerSpan.textContent = label;

    // Update selected state
    document.querySelectorAll('#micSelectCustom .select-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === deviceId);
    });

    // Close dropdown
    const customSelect = document.getElementById('micSelectCustom');
    if (customSelect) customSelect.classList.remove('open');

    if (isListening) {
        await initAudio();
    }
}

/**
 * Setup custom select dropdowns
 */
function setupCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelectorAll('.select-option');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            customSelects.forEach(s => {
                if (s !== select) s.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        // Handle options (for static tuning select)
        options.forEach(option => {
            if (select.id === 'tuningSelectCustom') {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const label = option.textContent;

                    // Update selected state
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');

                    // Update trigger text
                    select.querySelector('.select-trigger span').textContent = label;

                    // Close dropdown
                    select.classList.remove('open');

                    // Change tuning
                    changeTuning(value);
                });
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        customSelects.forEach(select => select.classList.remove('open'));
    });
}

/**
 * Initialize the audio context and microphone
 */
async function initAudio() {
    try {
        if (audioContext) {
            await audioContext.close();
        }

        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const constraints = {
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        };

        if (currentDeviceId) {
            constraints.audio.deviceId = { exact: currentDeviceId };
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();

        analyser.fftSize = AUDIO_CONFIG.fftSize;
        analyser.smoothingTimeConstant = AUDIO_CONFIG.smoothingTimeConstant;
        analyser.minDecibels = AUDIO_CONFIG.minDecibels;
        analyser.maxDecibels = AUDIO_CONFIG.maxDecibels;

        microphone.connect(analyser);

        dataArray = new Float32Array(analyser.fftSize);

        // Refresh device list to get labels after permission is granted
        await getMicrophones();

        return true;
    } catch (error) {
        console.error('Error initializing audio:', error);
        updateStatus('Microphone access denied', false);
        return false;
    }
}

/**
 * Start listening for guitar input
 */
async function startListening() {
    if (!audioContext) {
        const success = await initAudio();
        if (!success) return;
    }

    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    isListening = true;
    updateUI();
    detectPitch();
}

/**
 * Stop listening
 */
function stopListening() {
    isListening = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    updateUI();
    resetDisplay();
}

/**
 * Toggle listening state
 */
function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

/**
 * Autocorrelation-based pitch detection
 */
function autoCorrelate(buffer, sampleRate) {
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) return -1;

    const size = buffer.length;
    const correlations = new Float32Array(size);

    for (let lag = 0; lag < size; lag++) {
        let sum = 0;
        for (let i = 0; i < size - lag; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;
    }

    let minLag = Math.floor(sampleRate / 500);
    let maxLag = Math.floor(sampleRate / 50); // Extended for lower tunings (B1 ~61Hz)

    let valley = minLag;
    for (let i = minLag; i < maxLag; i++) {
        if (correlations[i] < correlations[valley]) {
            valley = i;
        }
        if (correlations[i] > correlations[valley] * 1.1) {
            break;
        }
    }

    let peak = valley;
    let foundPeak = false;
    for (let i = valley; i < maxLag; i++) {
        if (correlations[i] > correlations[peak]) {
            peak = i;
            foundPeak = true;
        }
    }

    if (!foundPeak || peak === 0) return -1;

    const y1 = correlations[peak - 1];
    const y2 = correlations[peak];
    const y3 = correlations[peak + 1];

    const refinedPeak = peak + (y3 - y1) / (2 * (2 * y2 - y1 - y3));
    const frequency = sampleRate / refinedPeak;

    // Extended range for lower tunings
    if (frequency < 50 || frequency > 400) return -1;

    return frequency;
}

/**
 * Find the closest note to a given frequency
 */
function findClosestNote(frequency) {
    const notes = getCurrentTuningNotes();
    let closest = notes[0];
    let minDiff = Math.abs(frequency - closest.frequency);

    for (const note of notes) {
        const diff = Math.abs(frequency - note.frequency);
        if (diff < minDiff) {
            minDiff = diff;
            closest = note;
        }
    }

    return closest;
}

/**
 * Calculate cents difference
 */
function getCentsDifference(detected, target) {
    return Math.round(1200 * Math.log2(detected / target));
}

/**
 * Main pitch detection loop
 */
function detectPitch() {
    if (!isListening) return;

    analyser.getFloatTimeDomainData(dataArray);
    const frequency = autoCorrelate(dataArray, audioContext.sampleRate);

    if (frequency > 0) {
        const note = findClosestNote(frequency);
        const cents = getCentsDifference(frequency, note.frequency);

        updateDisplay(note, frequency, cents);
        updateActiveString(note.string);
    }

    animationId = requestAnimationFrame(detectPitch);
}

/**
 * Update the display
 */
function updateDisplay(note, frequency, cents) {
    elements.noteLetter.textContent = note.note;
    elements.noteOctave.textContent = note.octave;
    elements.freqValue.textContent = frequency.toFixed(1);

    const clampedCents = Math.max(-CENTS_MAX_DISPLAY, Math.min(CENTS_MAX_DISPLAY, cents));
    elements.centsValue.textContent = (cents >= 0 ? '+' : '') + cents;

    elements.centsValue.classList.remove('in-tune', 'close', 'off');
    if (Math.abs(cents) <= CENTS_IN_TUNE) {
        elements.centsValue.classList.add('in-tune');
    } else if (Math.abs(cents) <= CENTS_CLOSE) {
        elements.centsValue.classList.add('close');
    } else {
        elements.centsValue.classList.add('off');
    }

    const needlePosition = 50 + (clampedCents / CENTS_MAX_DISPLAY) * 45;
    elements.gaugeNeedle.style.left = `${needlePosition}%`;

    updateDirectionIndicators(cents);

    if (Math.abs(cents) <= CENTS_IN_TUNE) {
        elements.tunerCard.classList.add('in-tune');
    } else {
        elements.tunerCard.classList.remove('in-tune');
    }
}

/**
 * Update direction arrows
 */
function updateDirectionIndicators(cents) {
    const isInTune = Math.abs(cents) <= CENTS_IN_TUNE;
    const needsTuneUp = cents < -CENTS_IN_TUNE;
    const needsTuneDown = cents > CENTS_IN_TUNE;

    elements.arrowUp.classList.toggle('active', needsTuneUp);
    elements.arrowDown.classList.toggle('active', needsTuneDown);
    elements.inTuneIndicator.classList.toggle('active', isInTune);
}

/**
 * Highlight the active string
 */
function updateActiveString(stringNumber) {
    elements.stringBtns.forEach(btn => {
        const btnString = parseInt(btn.dataset.string);
        btn.classList.toggle('active', btnString === stringNumber);
    });
}

/**
 * Reset display
 */
function resetDisplay() {
    elements.noteLetter.textContent = '-';
    elements.noteOctave.textContent = '';
    elements.freqValue.textContent = '---';
    elements.centsValue.textContent = '0';
    elements.centsValue.classList.remove('in-tune', 'close', 'off');
    elements.gaugeNeedle.style.left = '50%';
    elements.arrowUp.classList.remove('active');
    elements.arrowDown.classList.remove('active');
    elements.inTuneIndicator.classList.remove('active');
    elements.tunerCard.classList.remove('in-tune');
    elements.stringBtns.forEach(btn => btn.classList.remove('active'));
}

/**
 * Update UI based on listening state
 */
function updateUI() {
    elements.startBtn.classList.toggle('listening', isListening);
    elements.startBtn.querySelector('.btn-text').textContent = isListening ? 'Stop Tuning' : 'Start Tuning';
    elements.statusDot.classList.toggle('active', isListening);
    updateStatus(isListening ? 'Listening... Play a string' : 'Ready to tune', isListening);
}

/**
 * Update status bar text
 */
function updateStatus(text, active = false) {
    elements.statusText.textContent = text;
    elements.statusDot.classList.toggle('active', active);
}

/**
 * Change tuning
 */
function changeTuning(tuningId) {
    if (!TUNINGS[tuningId]) return;

    currentTuning = tuningId;
    updateStringButtons();
    updateTuningBadge();

    // Reset display when changing tuning
    if (!isListening) {
        resetDisplay();
    }
}

/**
 * Update string buttons for current tuning
 */
function updateStringButtons() {
    const notes = getCurrentTuningNotes();

    elements.stringBtns.forEach(btn => {
        const stringNum = parseInt(btn.dataset.string);
        const note = notes.find(n => n.string === stringNum);

        if (note) {
            btn.querySelector('.string-note').textContent = note.note + note.octave;
            btn.querySelector('.string-freq').textContent = Math.round(note.frequency) + ' Hz';
        }
    });
}

/**
 * Update tuning badge
 */
function updateTuningBadge() {
    const badge = document.querySelector('.tuning-badge');
    if (badge) {
        badge.textContent = TUNINGS[currentTuning].name;
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Window Controls (Electron)
    if (window.require) {
        try {
            const { ipcRenderer } = window.require('electron');

            document.getElementById('minBtn')?.addEventListener('click', () => {
                ipcRenderer.send('minimize-window');
            });

            document.getElementById('closeBtn')?.addEventListener('click', () => {
                ipcRenderer.send('close-window');
            });

            document.getElementById('closeBtn')?.addEventListener('click', () => {
                ipcRenderer.send('close-window');
            });
        } catch (e) {
            console.log('Not running in Electron or IPC not available');
        }
    }

    elements.startBtn.addEventListener('click', toggleListening);

    // Initialize Custom Selects
    setupCustomSelects();

    // Remove old native listeners logic
    /*
    // Tuning selector
    const tuningSelect = document.getElementById('tuningSelect');
    if (tuningSelect) {
        tuningSelect.addEventListener('change', (e) => {
            changeTuning(e.target.value);
        });
    }

    // Mic selector
    if (elements.micSelect) {
        elements.micSelect.addEventListener('change', async (e) => {
            currentDeviceId = e.target.value;
            if (isListening) {
                await initAudio(); // Restart with new device
            }
        });
    }
    */

    // String buttons
    elements.stringBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.stringBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isListening) {
            stopListening();
        }
    });
}

/**
 * Check browser support
 */
function checkBrowserSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('Microphone not supported');
        elements.startBtn.disabled = true;
        return false;
    }

    if (!window.AudioContext && !window.webkitAudioContext) {
        updateStatus('Audio API not supported');
        elements.startBtn.disabled = true;
        return false;
    }

    return true;
}

/**
 * Initialize the application
 */
function init() {
    // Initialize DOM elements
    elements = {
        startBtn: document.getElementById('startBtn'),
        noteLetter: document.getElementById('noteLetter'),
        noteOctave: document.getElementById('noteOctave'),
        gaugeNeedle: document.getElementById('gaugeNeedle'),
        centsValue: document.getElementById('centsValue'),
        freqValue: document.getElementById('freqValue'),
        arrowUp: document.getElementById('arrowUp'),
        arrowDown: document.getElementById('arrowDown'),
        inTuneIndicator: document.getElementById('inTuneIndicator'),
        tunerCard: document.querySelector('.tuner-card'),
        statusDot: document.querySelector('.status-dot'),
        statusText: document.querySelector('.status-text'),
        stringBtns: document.querySelectorAll('.string-btn'),
        micSelect: document.getElementById('micSelect')
    };

    if (checkBrowserSupport()) {
        initEventListeners();
        updateStringButtons();
        getMicrophones(); // Initial population
        console.log('Harmonia Guitar Tuner initialized - by hinqiwame');
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
