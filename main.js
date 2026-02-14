class NumberBlock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const value = parseInt(this.getAttribute('value') || '0', 10);
        const colorScheme = this.getAttribute('color') || '#ccc';

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column-reverse';

        // --- UPDATED: Correct 7-color rainbow sequence ---
        const rainbowColors = [ 
            '#ff6f61', // 1. 빨간색
            '#ffa726', // 2. 주황색
            '#ffca28', // 3. 노란색
            '#66bb6a', // 4. 초록색
            '#42a5f5', // 5. 하늘색
            '#3f51b5', // 6. 남색 (Indigo)
            '#ab47bc'  // 7. 보라색
        ];

        for (let i = 0; i < value; i++) {
            const block = document.createElement('div');
            block.style.width = '40px';
            block.style.height = '40px';
            block.style.border = '2px solid rgba(0,0,0,0.2)';
            block.style.borderRadius = '4px';
            block.style.display = 'flex';
            block.style.justifyContent = 'center';
            block.style.alignItems = 'center';
            block.style.fontSize = '1.5rem';
            block.style.fontFamily = '"Jua", "Nunito", sans-serif';

            if (colorScheme === 'rainbow') {
                block.style.backgroundColor = rainbowColors[i % rainbowColors.length];
                block.style.color = 'white';
            } else if (colorScheme === 'white-red-border') {
                block.style.backgroundColor = '#ffffff';
                block.style.color = '#ff6f61';
                block.style.border = '3px solid #ff6f61';
            } else {
                block.style.backgroundColor = colorScheme;
                block.style.color = 'white';
            }
            
            if (i === value - 1) { // Show number on the top block
                block.textContent = value;
            }
            wrapper.appendChild(block);
        }

        this.shadowRoot.innerHTML = ''; 
        this.shadowRoot.appendChild(wrapper);
    }
}

customElements.define('number-block', NumberBlock);

// DOM Elements
const num1Container = document.getElementById('num1-container');
const num2Container = document.getElementById('num2-container');
const answerInput = document.getElementById('answer');
const checkAnswerBtn = document.getElementById('check-answer');
const newProblemBtn = document.getElementById('new-problem');
const feedbackEl = document.getElementById('feedback');
const hogiPopup = document.getElementById('hogi-popup');

// State
let correctAnswer;

// --- NEW: Number-to-Color Mapping ---
const colorMap = {
    1: '#ff6f61',      // 1: 빨간색
    2: '#ffa726',      // 2: 주황색
    3: '#ffca28',      // 3: 노란색
    4: '#66bb6a',      // 4: 초록색
    5: '#42a5f5',      // 5: 하늘색
    6: '#ab47bc',      // 6: 보라색
    7: 'rainbow',        // 7: 무지개
    8: '#ec407a',      // 8: 자주색
    9: '#9e9e9e',      // 9: 회색
    10: 'white-red-border' // 10: 흰색 (빨간 테두리)
};

function getColorForNumber(number) {
    return colorMap[number] || '#333'; // Return the color for the number, or a default
}

function closeHogiPopup() {
    hogiPopup.classList.add('hidden');
    document.body.classList.remove('popup-open');
}

function generateProblem() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 + num2;

    // --- UPDATED: Use the new color mapping logic ---
    const color1 = getColorForNumber(num1);
    const color2 = getColorForNumber(num2);

    num1Container.innerHTML = `<number-block value="${num1}" color="${color1}"></number-block>`;
    num2Container.innerHTML = `<number-block value="${num2}" color="${color2}"></number-block>`;

    answerInput.value = '';
    feedbackEl.textContent = '';
    closeHogiPopup();
    answerInput.focus();
}

function fireConfetti() {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) }));
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value, 10);
    if (isNaN(userAnswer)) {
        feedbackEl.textContent = "숫자를 입력해주세요!";
        feedbackEl.className = 'incorrect';
        return;
    }
    if (userAnswer === correctAnswer) {
        feedbackEl.textContent = "정답! 참 잘했어요!";
        feedbackEl.className = 'correct';
        fireConfetti();
        hogiPopup.classList.remove('hidden');
        hogiPopup.classList.add('show-animation'); // Trigger animation
        document.body.classList.add('popup-open');
        setTimeout(() => {
            closeHogiPopup();
            generateProblem(); // Automatically generate new problem after animation
        }, 2000); // Match animation duration
    } else {
        feedbackEl.textContent = `아쉽지만 다시 시도해보세요! 정답은 ${correctAnswer}이에요.`;
        feedbackEl.className = 'incorrect';
    }
}

// Event Listeners
checkAnswerBtn.addEventListener('click', checkAnswer);
// newProblemBtn.addEventListener('click', generateProblem); // Removed as problems generate automatically
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

// Initial problem
generateProblem();

// Modified closeHogiPopup to also remove the animation class
function closeHogiPopup() {
    hogiPopup.classList.add('hidden');
    hogiPopup.classList.remove('show-animation'); // Clean up animation class
    document.body.classList.remove('popup-open');
}
