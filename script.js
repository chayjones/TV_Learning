// Points System
let points = 0;

function loadPoints() {
    const saved = localStorage.getItem('tv_learning_points');
    points = saved ? parseInt(saved, 10) : 0;
    const counter = document.getElementById('points-counter');
    if (counter) counter.innerText = `${points} Points`;
}

function savePoints() {
    localStorage.setItem('tv_learning_points', points);
    const counter = document.getElementById('points-counter');
    if (counter) counter.innerText = `${points} Points`;
}

function addPoints(activityKey, score, total) {
    let earned = 0;
    const today = new Date().toISOString().split('T')[0];
    const activityDataKey = `tv_activity_${activityKey}`;
    
    let savedData = JSON.parse(localStorage.getItem(activityDataKey) || '{}');

    if (savedData.lastPlayed !== today) {
        earned += 1;
        savedData.lastPlayed = today;
    }

    if (score === total && total > 0) {
        earned += 1;
    }

    if (earned > 0) {
        points += earned;
        savePoints();
        localStorage.setItem(activityDataKey, JSON.stringify(savedData));
        
        if (earned === 2) {
            sayMascot("Bravo ! Un sans faute ET ta première partie d'aujourd'hui ! +2 points !");
        } else if (score === total) {
            sayMascot("Parfait ! Un sans faute ! +1 point !");
        } else {
            sayMascot("Super ! Tu as gagné 1 point de participation aujourd'hui !");
        }
    } else {
        if (score === total) {
            sayMascot("Encore parfait ! Tu es très fort !");
        } else if (score >= total / 2) {
            sayMascot("Bien joué ! Continue de t'entraîner !");
        } else {
            sayMascot("C'est en forgeant qu'on devient forgeron ! Tu feras mieux la prochaine fois !");
        }
    }
}

// Mascot System
function sayMascot(message) {
    const bubble = document.getElementById('speech-bubble');
    if (bubble) {
        bubble.innerText = message;
        bubble.classList.add('visible');
    }
}

// Global Game State
let gameState = {
    questions: [],
    currentIdx: 0,
    score: 0,
    selectedAnswer: null,
    total: 10,
    type: '',
    stage: 'game', // 'select_table' or 'game'
    selectedTable: null // 'random' or number
};

const VOCABULARY_DATA = [
    { word: "Chien", options: ["Un animal de compagnie", "Un légume", "Un moyen de transport", "Une maison"], answer: "Un animal de compagnie" },
    { word: "Voiture", options: ["Un animal", "Pour rouler", "Pour manger", "Pour voler"], answer: "Pour rouler" },
    { word: "Pomme", options: ["Un fruit", "Un jouet", "Un vêtement", "Une couleur"], answer: "Un fruit" },
    { word: "Rouge", options: ["Une couleur", "Un animal", "Un plat", "Un prénom"], answer: "Une couleur" },
    { word: "Maison", options: ["Pour y habiter", "Pour manger", "Pour courir", "Pour boire"], answer: "Pour y habiter" },
    { word: "Eau", options: ["Pour boire", "Pour lire", "Pour dormir", "Pour écrire"], answer: "Pour boire" },
    { word: "Livre", options: ["Pour lire", "Pour manger", "Pour rouler", "Pour sauter"], answer: "Pour lire" }
];

const CONJUGATION_DATA = [
    { pronoun: "Je", verb: "manger", answer: "mange", options: ["mangeons", "manges", "mange", "mangent"] },
    { pronoun: "Tu", verb: "parler", answer: "parles", options: ["parles", "parle", "parlons", "parlez"] },
    { pronoun: "Il", verb: "chanter", answer: "chante", options: ["chantes", "chantent", "chante", "chantons"] },
    { pronoun: "Nous", verb: "jouer", answer: "jouons", options: ["jouent", "joue", "jouez", "jouons"] },
    { pronoun: "Vous", verb: "danser", answer: "dansez", options: ["danse", "dansez", "dansons", "dansent"] },
    { pronoun: "Elles", verb: "regarder", answer: "regardent", options: ["regardent", "regarde", "regardes", "regardons"] },
    { pronoun: "Je", verb: "finir", answer: "finis", options: ["finit", "finissons", "finissent", "finis"] },
    { pronoun: "Nous", verb: "être", answer: "sommes", options: ["sommes", "sont", "êtes", "est"] }
];

const GEOMETRY_DATA = [
    { img: "🔺", question: "Quelle est cette figure ?", answer: "Un triangle", options: ["Un triangle", "Un carré", "Un cercle", "Un rectangle"] },
    { img: "🟦", question: "Quelle est cette figure ?", answer: "Un carré", options: ["Un carré", "Un cercle", "Un losange", "Un rectangle"] },
    { img: "🔴", question: "Quelle est cette figure ?", answer: "Un cercle", options: ["Un cercle", "Un triangle", "Un carré", "Un ovale"] },
    { img: "▭", question: "Quelle est cette figure ?", answer: "Un rectangle", options: ["Un rectangle", "Un carré", "Un triangle", "Un losange"] }
];

function initGame(type) {
    gameState.type = type;
    gameState.currentIdx = 0;
    gameState.score = 0;
    gameState.selectedAnswer = null;
    gameState.questions = [];
    gameState.total = 10;
    
    if (type === 'vocabulary' || type === 'conjugation' || type === 'geometry' || type === 'compare_numbers' || type === 'doubles_halves') {
        gameState.total = 5;
    }

    if (type === 'addition' || type === 'multiplication') {
        gameState.stage = 'select_table';
        sayMascot(`Choisis une table de ${type === 'addition' ? "d'addition" : 'multiplication'}, ou choisis "Mélange" !`);
        renderSelectTable();
    } else {
        gameState.stage = 'game';
        generateQuestions();
        renderGame();
    }
}

function startTableGame(table) {
    gameState.selectedTable = table;
    gameState.stage = 'game';
    generateQuestions();
    renderGame();
}

function renderSelectTable() {
    const area = document.getElementById('game-area');
    if (!area) return;

    let html = `<h1>Choisis ta table</h1><div class="options-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px;">`;
    
    for (let i = 1; i <= 10; i++) {
        html += `<button class="btn btn-outline option-btn" onclick="startTableGame(${i})">Table de ${i}</button>`;
    }
    
    html += `<button class="btn btn-primary option-btn" style="grid-column: span 2;" onclick="startTableGame('random')">Mélange !</button>`;
    html += `</div>`;
    area.innerHTML = html;
}

function generateQuestions() {
    const type = gameState.type;
    const table = gameState.selectedTable;

    if (type === 'addition') {
        for (let i = 0; i < gameState.total; i++) {
            const a = table === 'random' ? Math.floor(Math.random() * 20) + 1 : table;
            const b = Math.floor(Math.random() * 10) + 1;
            const answer = a + b;
            let options = [answer];
            while (options.length < 4) {
                let wrong = answer + (Math.floor(Math.random() * 10) - 5);
                if (wrong !== answer && wrong > 0 && !options.includes(wrong)) options.push(wrong);
            }
            options.sort(() => Math.random() - 0.5);
            // Randomize order of a and b so it's not always "table + X"
            if (Math.random() > 0.5) {
                gameState.questions.push({ qText: `${a} + ${b} = ?`, options, answer });
            } else {
                gameState.questions.push({ qText: `${b} + ${a} = ?`, options, answer });
            }
        }
        sayMascot("C'est parti pour les additions ! Trouve la bonne réponse.");
    } 
    else if (type === 'multiplication') {
        for (let i = 0; i < gameState.total; i++) {
            const a = table === 'random' ? Math.floor(Math.random() * 9) + 2 : table;
            const b = Math.floor(Math.random() * 10) + 1;
            const answer = a * b;
            let options = [answer];
            while (options.length < 4) {
                let wrong = answer + (Math.floor(Math.random() * 20) - 10);
                if (wrong !== answer && wrong > 0 && !options.includes(wrong)) options.push(wrong);
            }
            options.sort(() => Math.random() - 0.5);
            if (Math.random() > 0.5) {
                gameState.questions.push({ qText: `${a} × ${b} = ?`, options, answer });
            } else {
                gameState.questions.push({ qText: `${b} × ${a} = ?`, options, answer });
            }
        }
        sayMascot("C'est l'heure des multiplications !");
    }
    else if (type === 'subtraction') {
        for (let i = 0; i < gameState.total; i++) {
            const a = Math.floor(Math.random() * 20) + 5; // 5 to 24
            const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
            const answer = a - b;
            let options = [answer];
            while (options.length < 4) {
                let wrong = answer + (Math.floor(Math.random() * 10) - 5);
                if (wrong !== answer && wrong >= 0 && !options.includes(wrong)) options.push(wrong);
            }
            options.sort(() => Math.random() - 0.5);
            gameState.questions.push({ qText: `${a} - ${b} = ?`, options, answer });
        }
        sayMascot("Soustraction ! N'oublie pas, on enlève !");
    }
    else if (type === 'compare_numbers') {
        for (let i = 0; i < gameState.total; i++) {
            let a = Math.floor(Math.random() * 100);
            let b = Math.floor(Math.random() * 100);
            if (Math.random() > 0.8) b = a; // Sometimes equal
            
            let answer = a > b ? ">" : (a < b ? "<" : "=");
            gameState.questions.push({ qText: `${a} ... ${b}`, options: [">", "<", "="], answer });
        }
        sayMascot("Plus grand (>), plus petit (<) ou égal (=) ?");
    }
    else if (type === 'doubles_halves') {
        for (let i = 0; i < gameState.total; i++) {
            const isDouble = Math.random() > 0.5;
            if (isDouble) {
                let a = Math.floor(Math.random() * 20) + 1;
                let answer = a * 2;
                let options = [answer, answer + 2, answer - 2, answer + 4].filter(x => x > 0);
                options = [...new Set(options)].sort(() => 0.5 - Math.random());
                gameState.questions.push({ preText: "Calcule :", qText: `Le double de ${a}`, options, answer });
            } else {
                let answer = Math.floor(Math.random() * 20) + 1;
                let a = answer * 2; // ensuring it's an even number
                let options = [answer, answer + 1, answer - 1, answer + 2].filter(x => x > 0);
                options = [...new Set(options)].sort(() => 0.5 - Math.random());
                gameState.questions.push({ preText: "Calcule :", qText: `La moitié de ${a}`, options, answer });
            }
        }
        sayMascot("Les doubles et les moitiés !");
    }
    else if (type === 'geometry') {
        const shuffled = [...GEOMETRY_DATA].sort(() => 0.5 - Math.random());
        // Duplicate some randomly to reach 5
        while (shuffled.length < gameState.total) {
            shuffled.push(GEOMETRY_DATA[Math.floor(Math.random() * GEOMETRY_DATA.length)]);
        }
        const finalQuestions = shuffled.slice(0, gameState.total);
        finalQuestions.forEach(q => {
            q.options.sort(() => 0.5 - Math.random());
            gameState.questions.push({ preText: q.img, qText: q.question, options: q.options, answer: q.answer, largePretext: true });
        });
        sayMascot("Géométrie ! Reconnais-tu ces formes ?");
    }
    else if (type === 'vocabulary') {
        const shuffled = [...VOCABULARY_DATA].sort(() => 0.5 - Math.random()).slice(0, gameState.total);
        shuffled.forEach(q => {
            q.options.sort(() => 0.5 - Math.random());
            gameState.questions.push({ preText: "Que veut dire ce mot ?", qText: q.word, options: q.options, answer: q.answer });
        });
        sayMascot("Prêt pour le vocabulaire ? Trouve la bonne définition !");
    }
    else if (type === 'conjugation') {
        const shuffled = [...CONJUGATION_DATA].sort(() => 0.5 - Math.random()).slice(0, gameState.total);
        shuffled.forEach(q => {
            q.options.sort(() => 0.5 - Math.random());
            gameState.questions.push({ preText: `Verbe: ${q.verb} (Présent)`, qText: `${q.pronoun} ...`, options: q.options, answer: q.answer });
        });
        sayMascot("Conjugaison ! Conjugue le verbe au présent de l'indicatif.");
    }
}

function handleAnswer(optIndex) {
    if (gameState.selectedAnswer !== null) return;
    
    const q = gameState.questions[gameState.currentIdx];
    const selectedText = q.options[optIndex];
    gameState.selectedAnswer = selectedText;
    
    // Sometimes options can be numbers, so convert to string to compare just in case, but strict equality usually works since we generate numbers in JS.
    const isCorrect = String(selectedText) === String(q.answer);
    if (isCorrect) {
        gameState.score += 1;
        sayMascot("Bravo ! Bonne réponse !");
    } else {
        sayMascot(`Oups ! La bonne réponse était : ${q.answer}`);
    }

    renderGame();
}

function nextQuestion() {
    if (gameState.currentIdx + 1 < gameState.total) {
        gameState.currentIdx++;
        gameState.selectedAnswer = null;
        sayMascot("Au suivant !");
        renderGame();
    } else {
        // Game Over
        addPoints(gameState.type, gameState.score, gameState.total);
        document.getElementById('game-area').innerHTML = `
            <h1>Terminé !</h1>
            <h2>Ton score: ${gameState.score} / ${gameState.total}</h2>
            <a href="index.php" class="btn btn-primary" style="margin-top: 2rem;">Retour au menu</a>
        `;
    }
}

function renderGame() {
    const area = document.getElementById('game-area');
    if (!area) return;

    const q = gameState.questions[gameState.currentIdx];
    const progressPct = (gameState.currentIdx / gameState.total) * 100;

    let html = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPct}%"></div>
        </div>
    `;

    if (q.preText) {
        if (q.largePretext) {
            html += `<h1 style="font-size: 5rem; margin-top: 1rem; color: #2EC4B6;">${q.preText}</h1>`;
        } else {
            html += `<h2 style="font-size: 2rem; margin-top: 1rem; color: #666;">${q.preText}</h2>`;
        }
        html += `<h1 style="font-size: 3rem; margin: 1rem 0 2rem 0; color: #FF9F1C;">${q.qText}</h1>`;
    } else {
        html += `<h1 style="font-size: 3rem; margin: 2rem 0;">${q.qText}</h1>`;
    }

    html += `<div class="options-grid">`;
    q.options.forEach((opt, idx) => {
        let btnClass = "btn btn-outline option-btn";
        if (gameState.selectedAnswer !== null) {
            if (String(opt) === String(q.answer)) btnClass = "btn btn-primary option-btn"; 
            else if (String(opt) === String(gameState.selectedAnswer)) btnClass = "btn btn-secondary option-btn"; 
        }

        html += `<button class="${btnClass}" onclick="handleAnswer(${idx})">${opt}</button>`;
    });
    html += `</div>`;

    if (gameState.selectedAnswer !== null) {
        html += `<button class="btn btn-primary" onclick="nextQuestion()" style="margin-top: 2rem;">Suivant ➔</button>`;
    }

    area.innerHTML = html;
}

// Load points on startup
loadPoints();
