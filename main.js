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

        const rainbowColors = [
            '#ff6f61', '#ffa726', '#ffca28', '#66bb6a', '#42a5f5', '#3f51b5', '#ab47bc'
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

            if (i === value - 1) {
                block.textContent = value;
            }
            wrapper.appendChild(block);
        }

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(wrapper);
    }
}

customElements.define('number-block', NumberBlock);

const operations = [
    {
        id: 'add-no-carry',
        label: '덧셈 (올림 없음)',
        symbol: '+',
        min: 2,
        max: 9,
        randomPair: () => {
            const num1 = Math.floor(Math.random() * 9) + 1;
            const num2 = Math.floor(Math.random() * (9 - num1)) + 1;
            return [num1, num2];
        },
        solve: (a, b) => a + b,
        choiceSpan: 4
    },
    {
        id: 'add-carry',
        label: '덧셈 (올림 있음)',
        symbol: '+',
        min: 10,
        max: 17,
        randomPair: () => {
            const num1 = Math.floor(Math.random() * 8) + 1;
            const minNum2 = 10 - num1;
            const num2 = Math.floor(Math.random() * (9 - minNum2 + 1)) + minNum2;
            return [num1, num2];
        },
        solve: (a, b) => a + b,
        choiceSpan: 4
    },
    {
        id: 'multiply',
        label: '곱셈',
        symbol: '×',
        min: 1,
        max: 81,
        randomPair: () => [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1],
        solve: (a, b) => a * b,
        choiceSpan: 10
    }
];

const operationMap = Object.fromEntries(operations.map((op) => [op.id, op]));

const num1Container = document.getElementById('num1-container');
const num2Container = document.getElementById('num2-container');
const operatorSymbol = document.getElementById('operator-symbol');
const choicesArea = document.getElementById('choices-area');
const feedbackEl = document.getElementById('feedback');
const hogiPopup = document.getElementById('hogi-popup');
const modeMenuToggle = document.getElementById('mode-menu-toggle');
const modeMenuList = document.getElementById('mode-menu-list');

let currentMode = operations[0].id;
let correctAnswer;

const colorMap = {
    1: '#ff6f61',
    2: '#ffa726',
    3: '#ffca28',
    4: '#66bb6a',
    5: '#42a5f5',
    6: '#ab47bc',
    7: 'rainbow',
    8: '#ec407a',
    9: '#9e9e9e',
    10: 'white-red-border'
};

function getCurrentOperation() {
    return operationMap[currentMode] || operations[0];
}

function getColorForNumber(number) {
    return colorMap[number] || '#333';
}

function closeHogiPopup() {
    hogiPopup.classList.add('hidden');
    hogiPopup.classList.remove('show-animation');
    document.body.classList.remove('popup-open');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function buildChoices(answer) {
    const operation = getCurrentOperation();
    const choices = new Set([answer]);
    let attempts = 0;

    while (choices.size < 4 && attempts < 120) {
        attempts += 1;
        const offset = Math.floor(Math.random() * (operation.choiceSpan * 2 + 1)) - operation.choiceSpan;
        if (offset === 0) {
            continue;
        }

        const candidate = answer + offset;
        if (candidate >= operation.min && candidate <= operation.max) {
            choices.add(candidate);
        }
    }

    for (let candidate = operation.min; choices.size < 4 && candidate <= operation.max; candidate++) {
        if (candidate !== answer) {
            choices.add(candidate);
        }
    }

    return shuffle(Array.from(choices));
}

function renderChoices() {
    const options = buildChoices(correctAnswer);
    choicesArea.innerHTML = options
        .map((value) => `<button class="choice-btn" data-value="${value}" type="button">${value}</button>`)
        .join('');
}

function generateProblem() {
    const operation = getCurrentOperation();
    const [num1, num2] = operation.randomPair();
    correctAnswer = operation.solve(num1, num2);
    operatorSymbol.textContent = operation.symbol;

    const color1 = getColorForNumber(num1);
    const color2 = getColorForNumber(num2);

    num1Container.innerHTML = `<number-block value="${num1}" color="${color1}"></number-block>`;
    num2Container.innerHTML = `<number-block value="${num2}" color="${color2}"></number-block>`;

    feedbackEl.textContent = '';
    feedbackEl.className = '';
    closeHogiPopup();
    renderChoices();
}

function fireConfetti() {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

function disableChoices() {
    const buttons = choicesArea.querySelectorAll('.choice-btn');
    buttons.forEach((button) => {
        button.disabled = true;
    });
}

function checkAnswer(selectedValue, buttonEl) {
    if (selectedValue === correctAnswer) {
        feedbackEl.textContent = '정답! 참 잘했어요!';
        feedbackEl.className = 'correct';
        buttonEl.classList.add('correct-choice');
        disableChoices();
        fireConfetti();
        hogiPopup.classList.remove('hidden');
        hogiPopup.classList.add('show-animation');
        document.body.classList.add('popup-open');

        setTimeout(() => {
            closeHogiPopup();
            generateProblem();
        }, 2000);
        return;
    }

    feedbackEl.textContent = '아쉽지만 다시 시도해보세요!';
    feedbackEl.className = 'incorrect';
    buttonEl.classList.add('wrong-choice');
    buttonEl.disabled = true;
}

function closeModeMenu() {
    modeMenuList.classList.add('hidden');
    modeMenuToggle.setAttribute('aria-expanded', 'false');
}

function openModeMenu() {
    modeMenuList.classList.remove('hidden');
    modeMenuToggle.setAttribute('aria-expanded', 'true');
}

function updateModeButtonLabel() {
    const operation = getCurrentOperation();
    modeMenuToggle.textContent = `문제: ${operation.label}`;
}

function renderModeMenu() {
    modeMenuList.innerHTML = operations
        .map((operation) => {
            const selected = operation.id === currentMode;
            return `<li class="mode-item ${selected ? 'selected' : ''}" role="option" data-mode="${operation.id}" aria-selected="${selected}">${operation.label}</li>`;
        })
        .join('');
}

function setMode(modeId) {
    if (!operationMap[modeId]) {
        return;
    }

    currentMode = modeId;
    updateModeButtonLabel();
    renderModeMenu();
    generateProblem();
}

modeMenuToggle.addEventListener('click', () => {
    const isOpen = !modeMenuList.classList.contains('hidden');
    if (isOpen) {
        closeModeMenu();
    } else {
        openModeMenu();
    }
});

modeMenuList.addEventListener('click', (event) => {
    const item = event.target.closest('.mode-item');
    if (!item) {
        return;
    }

    const modeId = item.dataset.mode || '';
    closeModeMenu();
    setMode(modeId);
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('#mode-picker')) {
        closeModeMenu();
    }
});

choicesArea.addEventListener('click', (event) => {
    const button = event.target.closest('.choice-btn');
    if (!button) {
        return;
    }

    const selectedValue = parseInt(button.dataset.value || '', 10);
    if (Number.isNaN(selectedValue)) {
        return;
    }

    checkAnswer(selectedValue, button);
});

updateModeButtonLabel();
renderModeMenu();
generateProblem();
