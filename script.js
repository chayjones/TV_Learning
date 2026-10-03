// Global State
let points = 0;
let userName = localStorage.getItem('tv_learning_username') || '';

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

    const nameStr = userName ? ` ${userName}` : '';

    if (earned > 0) {
        points += earned;
        savePoints();
        localStorage.setItem(activityDataKey, JSON.stringify(savedData));
        
        if (earned === 2) {
            sayMascot(`Bravo${nameStr} ! Un sans faute ET ta première partie d'aujourd'hui ! +2 points !`);
        } else if (score === total) {
            sayMascot(`Parfait${nameStr} ! Un sans faute ! +1 point !`);
        } else {
            sayMascot(`Super ! Tu as gagné 1 point de participation aujourd'hui !`);
        }
    } else {
        if (score === total) {
            sayMascot(`Encore parfait${nameStr} ! Tu es très fort !`);
        } else if (score >= total / 2) {
            sayMascot(`Bien joué${nameStr} ! Continue de t'entraîner !`);
        } else {
            sayMascot(`C'est en forgeant qu'on devient forgeron ! Tu feras mieux la prochaine fois !`);
        }
    }
}

// User Identity
function initHome() {
    if (!userName) {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainMenu = document.getElementById('main-menu');
        if (welcomeScreen && mainMenu) {
            welcomeScreen.style.display = 'block';
            mainMenu.style.display = 'none';
        }
        sayMascot("Salut ! Moi c'est Red le renard. Comment t'appelles-tu ?");
    } else {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainMenu = document.getElementById('main-menu');
        const displayUser = document.getElementById('display-username');
        if (welcomeScreen && mainMenu) {
            welcomeScreen.style.display = 'none';
            mainMenu.style.display = 'block';
        }
        if (displayUser) {
            displayUser.innerText = userName;
        }
        sayMascot(`Coucou ${userName} ! Choisis une activité !`);
    }
}

function saveUsername() {
    const input = document.getElementById('username-input');
    if (input && input.value.trim().length > 0) {
        userName = input.value.trim();
        localStorage.setItem('tv_learning_username', userName);
        initHome();
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
    // Être
    { pronoun: "Je", verb: "être", answer: "suis", options: ["suis", "es", "est", "sommes"] },
    { pronoun: "Tu", verb: "être", answer: "es", options: ["est", "es", "suis", "êtes"] },
    { pronoun: "Il", verb: "être", answer: "est", options: ["es", "est", "sont", "suis"] },
    { pronoun: "Nous", verb: "être", answer: "sommes", options: ["sommes", "êtes", "sont", "suis"] },
    { pronoun: "Vous", verb: "être", answer: "êtes", options: ["êtes", "sommes", "sont", "est"] },
    { pronoun: "Elles", verb: "être", answer: "sont", options: ["sont", "sommes", "est", "êtes"] },
    
    // Avoir
    { pronoun: "J'", verb: "avoir", answer: "ai", options: ["as", "a", "ai", "avons"] },
    { pronoun: "Tu", verb: "avoir", answer: "as", options: ["a", "ai", "as", "avez"] },
    { pronoun: "Elle", verb: "avoir", answer: "a", options: ["ai", "as", "a", "ont"] },
    { pronoun: "Nous", verb: "avoir", answer: "avons", options: ["avons", "avez", "ont", "a"] },
    { pronoun: "Vous", verb: "avoir", answer: "avez", options: ["avez", "avons", "ont", "as"] },
    { pronoun: "Ils", verb: "avoir", answer: "ont", options: ["ont", "a", "avons", "avez"] },
    
    // Aller
    { pronoun: "Je", verb: "aller", answer: "vais", options: ["vais", "vas", "va", "allons"] },
    { pronoun: "Tu", verb: "aller", answer: "vas", options: ["va", "vais", "vas", "allez"] },
    { pronoun: "Il", verb: "aller", answer: "va", options: ["vas", "vais", "va", "vont"] },
    { pronoun: "Nous", verb: "aller", answer: "allons", options: ["allez", "allons", "vont", "va"] },
    { pronoun: "Vous", verb: "aller", answer: "allez", options: ["allons", "allez", "vont", "vas"] },
    { pronoun: "Elles", verb: "aller", answer: "vont", options: ["vont", "allons", "allez", "va"] },

    // Faire
    { pronoun: "Je", verb: "faire", answer: "fais", options: ["fais", "fait", "faisons", "faites"] },
    { pronoun: "Tu", verb: "faire", answer: "fais", options: ["fait", "fais", "font", "faisons"] },
    { pronoun: "On", verb: "faire", answer: "fait", options: ["fais", "fait", "font", "faites"] },
    { pronoun: "Nous", verb: "faire", answer: "faisons", options: ["faisons", "faites", "font", "fais"] },
    { pronoun: "Vous", verb: "faire", answer: "faites", options: ["faisons", "faites", "font", "fait"] },
    { pronoun: "Ils", verb: "faire", answer: "font", options: ["font", "faites", "faisons", "fais"] },

    // Dire
    { pronoun: "Je", verb: "dire", answer: "dis", options: ["dis", "dit", "disons", "dites"] },
    { pronoun: "Tu", verb: "dire", answer: "dis", options: ["dit", "dis", "disent", "disons"] },
    { pronoun: "Elle", verb: "dire", answer: "dit", options: ["dis", "dit", "dites", "disent"] },
    { pronoun: "Nous", verb: "dire", answer: "disons", options: ["disons", "dites", "disent", "dis"] },
    { pronoun: "Vous", verb: "dire", answer: "dites", options: ["disons", "dites", "disent", "dit"] },
    { pronoun: "Ils", verb: "dire", answer: "disent", options: ["disent", "dites", "disons", "dis"] },

    // Venir
    { pronoun: "Je", verb: "venir", answer: "viens", options: ["viens", "vient", "venons", "viennent"] },
    { pronoun: "Tu", verb: "venir", answer: "viens", options: ["vient", "viens", "venez", "venons"] },
    { pronoun: "Il", verb: "venir", answer: "vient", options: ["viens", "vient", "viennent", "venez"] },
    { pronoun: "Nous", verb: "venir", answer: "venons", options: ["venons", "venez", "viennent", "viens"] },
    { pronoun: "Vous", verb: "venir", answer: "venez", options: ["venez", "venons", "viennent", "vient"] },
    { pronoun: "Elles", verb: "venir", answer: "viennent", options: ["viennent", "venez", "venons", "viens"] },

    // 1st Group: Chanter
    { pronoun: "Je", verb: "chanter", answer: "chante", options: ["chante", "chantes", "chantons", "chantent"] },
    { pronoun: "Tu", verb: "chanter", answer: "chantes", options: ["chante", "chantes", "chantez", "chantent"] },
    { pronoun: "Il", verb: "chanter", answer: "chante", options: ["chantes", "chante", "chantons", "chantent"] },
    { pronoun: "Nous", verb: "chanter", answer: "chantons", options: ["chantons", "chantez", "chantent", "chante"] },
    { pronoun: "Vous", verb: "chanter", answer: "chantez", options: ["chantez", "chantons", "chantent", "chantes"] },
    { pronoun: "Ils", verb: "chanter", answer: "chantent", options: ["chantent", "chantons", "chantez", "chante"] },

    // 1st Group: Manger (G+E exception)
    { pronoun: "Je", verb: "manger", answer: "mange", options: ["mange", "manges", "mangeons", "mangent"] },
    { pronoun: "Tu", verb: "manger", answer: "manges", options: ["mange", "manges", "mangez", "mangent"] },
    { pronoun: "On", verb: "manger", answer: "mange", options: ["manges", "mange", "mangeons", "mangent"] },
    { pronoun: "Nous", verb: "manger", answer: "mangeons", options: ["mangons", "mangeons", "mangez", "mangent"] },
    { pronoun: "Vous", verb: "manger", answer: "mangez", options: ["mangez", "mangeons", "mangent", "manges"] },
    { pronoun: "Elles", verb: "manger", answer: "mangent", options: ["mangent", "mangeons", "mangez", "mange"] },

    // 2nd Group: Finir
    { pronoun: "Je", verb: "finir", answer: "finis", options: ["finis", "finit", "finissons", "finissent"] },
    { pronoun: "Tu", verb: "finir", answer: "finis", options: ["finit", "finis", "finissez", "finissons"] },
    { pronoun: "Il", verb: "finir", answer: "finit", options: ["finis", "finit", "finissent", "finissez"] },
    { pronoun: "Nous", verb: "finir", answer: "finissons", options: ["finissons", "finissez", "finissent", "finit"] },
    { pronoun: "Vous", verb: "finir", answer: "finissez", options: ["finissez", "finissons", "finissent", "finis"] },
    { pronoun: "Ils", verb: "finir", answer: "finissent", options: ["finissent", "finissez", "finissons", "finit"] }
];

const GEOMETRY_DATA = [
    { img: "🔺", question: "Quelle est cette figure ?", answer: "Un triangle", options: ["Un triangle", "Un carré", "Un cercle", "Un rectangle"] },
    { img: "🟦", question: "Quelle est cette figure ?", answer: "Un carré", options: ["Un carré", "Un cercle", "Un losange", "Un rectangle"] },
    { img: "🔴", question: "Quelle est cette figure ?", answer: "Un cercle", options: ["Un cercle", "Un triangle", "Un carré", "Un ovale"] },
    { img: "▭", question: "Quelle est cette figure ?", answer: "Un rectangle", options: ["Un rectangle", "Un carré", "Un triangle", "Un losange"] }
];

const CHRONO_TEXTS = {
    'ce1': [
        {
            title: "La visite au zoo",
            text: "Aujourd'hui, toute la classe part visiter le grand zoo de la ville. Les enfants sont très heureux. Dans le bus, ils chantent des chansons. En arrivant, ils voient d'abord les grands singes qui font des grimaces. Ensuite, ils passent devant la cage des lions. Un énorme lion dort au soleil avec sa famille. Plus loin, les pingouins nagent très vite dans une eau glacée. À midi, tout le monde s'assoit sur l'herbe pour manger un pique-nique. Le soleil brille et le ciel est bleu. C'est une journée magnifique. Avant de rentrer, la maîtresse achète une petite glace pour chaque enfant. Ils retournent à l'école avec le sourire, fatigués mais très contents de leur belle aventure parmi les animaux.",
            words: 119
        },
        {
            title: "Le petit chien perdu",
            text: "Milo est un petit chien avec des taches brunes. Un jour, il court trop loin dans la forêt pour attraper un papillon. Bientôt, il ne voit plus sa maison. Milo a un peu peur, mais il est courageux. Il renifle le sol pour trouver le chemin. Il rencontre un petit écureuil très gentil. L'écureuil lui montre une piste près de la grande rivière. Milo marche doucement sur les cailloux. Bientôt, il entend une voix. C'est son ami Lucas qui le cherche ! Lucas court vers lui et le prend dans ses bras. Milo remue sa petite queue très fort. Il est si heureux de retrouver son maître et sa maison chaude. Plus jamais il ne courra si loin tout seul.",
            words: 117
        },
        {
            title: "Le gâteau d'anniversaire",
            text: "C'est dimanche et c'est l'anniversaire de maman. Papa et Sophie sont dans la cuisine. Ils préparent un beau gâteau au chocolat pour lui faire une grande surprise. Sophie casse les œufs dans un grand bol en verre. Ensuite, elle ajoute du sucre et de la farine. Papa fait fondre le chocolat dans une casserole chaude. Il sent très bon ! Ils mélangent bien le tout et mettent le gâteau dans le four. Une heure plus tard, le gâteau est prêt et tout doré. Sophie ajoute de jolies bougies rouges dessus. Quand maman arrive dans la cuisine, elle crie de joie. Ils chantent tous ensemble et maman souffle les bougies avec un grand sourire sur son visage heureux.",
            words: 118
        },
        {
            title: "La journée à la plage",
            text: "Le soleil brille fort ce matin. Toute la famille prend la voiture pour aller à la plage. En arrivant, les enfants courent sur le sable chaud. Ils construisent un énorme château de sable avec un pont et une haute tour. Papa les aide à creuser un grand trou pour faire une piscine. L'eau de la mer est fraîche, mais très bonne. Ils nagent un peu et jouent avec un gros ballon coloré. Maman lit un livre sous le grand parasol bleu. Plus tard, ils mangent des sandwichs et boivent du jus de pomme. Avant de partir, ils ramassent de jolis coquillages blancs. C'est une journée parfaite. Tout le monde dort bien dans la voiture sur le chemin du retour.",
            words: 118
        },
        {
            title: "Le potager de grand-père",
            text: "Grand-père a un beau jardin derrière sa maison. Ce matin, il aide Léo à planter des graines. Ils portent tous les deux des gants et de grandes bottes. Léo fait un petit trou dans la terre douce. Il dépose une graine rouge et la couvre de terre. Ensuite, il prend l'arrosoir pour donner à boire à la petite plante. Grand-père dit qu'il faut beaucoup d'eau et de soleil pour grandir. Dans le jardin, il y a déjà de belles tomates rouges, de longues carottes oranges et des salades vertes. Léo est très fier de son travail. Il a hâte de manger les bons légumes de son grand-père. Il promet de revenir chaque jour pour regarder ses petites plantes pousser.",
            words: 119
        }
    ],
    'ce2': [
        {
            title: "L'exploration spatiale",
            text: "Depuis toujours, l'espace fascine les êtres humains. Les étoiles qui brillent dans le ciel sombre cachent de nombreux mystères incroyables. Pour comprendre cet univers infini, les astronautes voyagent dans d'immenses fusées très puissantes. Ils portent des combinaisons spéciales pour pouvoir respirer et flotter dans le vide spatial. Lorsqu'ils arrivent dans la station spatiale, ils réalisent des expériences scientifiques passionnantes. Ils observent aussi notre planète Terre, qui ressemble à une magnifique bille bleue entourée de nuages blancs. Bientôt, les scientifiques espèrent pouvoir envoyer des explorateurs sur la planète Mars. C'est un voyage qui durera plusieurs mois ! En attendant, les robots continuent de prendre de magnifiques photos des autres planètes pour nous aider à mieux comprendre la galaxie dans laquelle nous vivons.",
            words: 119
        },
        {
            title: "Le château fort",
            text: "Au Moyen Âge, les rois et les seigneurs habitaient dans de gigantesques châteaux forts pour se protéger des ennemis. Ces châteaux étaient construits en pierre très solide et possédaient de hautes murailles. Tout autour, de grands fossés remplis d'eau empêchaient les attaquants d'approcher. Pour entrer, il fallait faire descendre un lourd pont-levis en bois. À l'intérieur, la vie était très organisée. Les chevaliers s'entraînaient au combat dans la grande cour avec leurs épées étincelantes. Le seigneur vivait dans le donjon, qui était la tour la plus haute et la mieux gardée. Lors des grands banquets, la salle résonnait des chants des troubadours. Aujourd'hui, on peut encore visiter ces magnifiques forteresses qui nous racontent l'histoire passionnante de nos ancêtres lointains.",
            words: 118
        },
        {
            title: "Le mystère de la forêt",
            text: "À la lisière du village, il existe une forêt ancienne que tout le monde appelle la Forêt des Murmures. Les vieux arbres y sont si hauts qu'ils cachent presque totalement la lumière du soleil. Un après-midi, deux enfants curieux décident d'explorer ce lieu mystérieux. Ils marchent doucement sur le tapis de feuilles mortes qui craquent sous leurs chaussures. Soudain, ils aperçoivent une étrange lueur dorée derrière un buisson épineux. En s'approchant, ils découvrent une toute petite porte en bois incrustée dans le tronc d'un chêne millénaire. Une minuscule clé rouillée est posée juste devant l'entrée. Leurs cœurs battent à toute vitesse. Doivent-ils ouvrir cette porte secrète ou retourner prudemment au village ? L'aventure ne fait que commencer pour les deux amis.",
            words: 119
        },
        {
            title: "Le cycle de l'eau",
            text: "Sais-tu comment l'eau voyage autour de notre planète ? C'est un cycle fascinant qui ne s'arrête jamais. Tout commence lorsque le soleil réchauffe l'eau des océans et des rivières. L'eau se transforme alors en vapeur invisible et monte doucement vers le ciel. C'est ce qu'on appelle l'évaporation. En refroidissant dans l'air, cette vapeur forme des petits nuages cotonneux. Quand les nuages deviennent trop lourds et gonflés d'eau, la pluie finit par tomber sur la terre. Cette eau précieuse arrose les grandes forêts et permet aux plantes de grandir. Ensuite, elle ruisselle sur le sol et retourne lentement vers la mer pour recommencer son incroyable voyage. L'eau est essentielle à la vie, il faut toujours veiller à ne pas la gaspiller.",
            words: 119
        },
        {
            title: "Le tournoi de football",
            text: "C'est enfin le grand jour tant attendu par toute l'équipe. Le tournoi régional de football se déroule sur le stade principal de la ville. Les gradins sont remplis de supporters qui chantent et agitent des drapeaux colorés. Le capitaine motive ses coéquipiers dans les vestiaires avant le début du match. Dès le coup d'envoi, le rythme est très rapide. Le ballon circule d'un joueur à l'autre avec une grande précision. À la dernière minute, l'attaquant accélère, dribble deux adversaires redoutables et frappe le ballon de toutes ses forces. Le gardien plonge, mais il est trop tard ! La balle termine sa course au fond des filets. L'arbitre siffle la fin de la partie. L'équipe soulève la coupe avec une immense fierté.",
            words: 118
        }
    ]
};

let chronoTimerInterval = null;
let chronoSeconds = 0;

function initGame(type) {
    gameState.type = type;
    gameState.currentIdx = 0;
    gameState.score = 0;
    gameState.selectedAnswer = null;
    gameState.questions = [];
    gameState.total = 10;
    
    if (type === 'chrono_lecture') {
        gameState.stage = 'select_difficulty';
        sayMascot("Chrono Lecture ! Choisis ton niveau.");
        renderChronoSelect();
        return;
    }

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

function renderChronoSelect() {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = `
        <h1>Choisis la difficulté</h1>
        <div class="options-grid" style="grid-template-columns: 1fr 1fr; margin-top: 2rem;">
            <button class="btn btn-outline option-btn" onclick="prepareChronoLecture('ce1')">Niveau CE1</button>
            <button class="btn btn-outline option-btn" onclick="prepareChronoLecture('ce2')">Niveau CE2</button>
        </div>
    `;
}

function prepareChronoLecture(diff) {
    gameState.selectedTable = diff; // reuse for difficulty
    gameState.stage = 'ready';
    sayMascot("Dès que tu es prêt, clique sur DÉMARRER !");
    const area = document.getElementById('game-area');
    area.innerHTML = `
        <h1>Es-tu prêt(e) ?</h1>
        <button class="btn btn-primary" style="margin-top: 3rem; font-size: 2rem; padding: 2rem 4rem;" onclick="startChronoLecture()">DÉMARRER</button>
    `;
}

function startChronoLecture() {
    gameState.stage = 'reading';
    chronoSeconds = 0;
    
    const area = document.getElementById('game-area');
    const textsArray = CHRONO_TEXTS[gameState.selectedTable];
    const data = textsArray[Math.floor(Math.random() * textsArray.length)];
    gameState.currentChronoData = data;
    
    area.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>${data.title}</h2>
            <div id="chrono-display" style="font-size: 2rem; color: #E71D36; font-weight: bold;">0 s</div>
        </div>
        <div style="font-size: 2rem; line-height: 1.6; text-align: left; background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            ${data.text}
        </div>
        <button class="btn btn-secondary" style="margin-top: 3rem; font-size: 2rem; padding: 1rem 3rem; width: 100%;" onclick="finishChronoLecture()">J'AI FINI !</button>
    `;

    sayMascot("Lis le texte à voix haute. Clique sur 'J'AI FINI' quand tu as terminé !");
    
    chronoTimerInterval = setInterval(() => {
        chronoSeconds++;
        const disp = document.getElementById('chrono-display');
        if (disp) disp.innerText = `${chronoSeconds} s`;
    }, 1000);
}

function finishChronoLecture() {
    clearInterval(chronoTimerInterval);
    gameState.stage = 'finished';
    
    const data = gameState.currentChronoData;
    let wpm = 0;
    if (chronoSeconds > 0) {
        const minutes = chronoSeconds / 60;
        wpm = Math.round(data.words / minutes);
    }

    const mascotContainer = document.getElementById('mascot-container');
    if (mascotContainer) {
        mascotContainer.classList.add('mascot-happy');
        setTimeout(() => mascotContainer.classList.remove('mascot-happy'), 3000);
    }

    sayMascot(`Wow ! Tu as lu ${wpm} mots par minute ! C'est super !`);
    addPoints('chrono_lecture', 1, 1); 
    
    const area = document.getElementById('game-area');
    area.innerHTML = `
        <h1>Terminé !</h1>
        <h2 style="margin-top: 2rem;">Temps : <span style="color: #FF9F1C;">${chronoSeconds} secondes</span></h2>
        <h2 style="margin-top: 1rem;">Vitesse : <span style="color: #2EC4B6;">${wpm} mots / minute</span></h2>
        <a href="index.php" class="btn btn-primary" style="margin-top: 3rem;">Retour au menu</a>
    `;
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
    
    const mascotContainer = document.getElementById('mascot-container');
    mascotContainer.classList.remove('mascot-happy', 'mascot-sad');

    // Sometimes options can be numbers, so convert to string to compare just in case, but strict equality usually works since we generate numbers in JS.
    const isCorrect = String(selectedText) === String(q.answer);
    if (isCorrect) {
        gameState.score += 1;
        sayMascot("Bravo ! Bonne réponse !");
        mascotContainer.classList.add('mascot-happy');
    } else {
        sayMascot(`Oups ! La bonne réponse était : ${q.answer}`);
        mascotContainer.classList.add('mascot-sad');
    }

    // Remove the state after a few seconds so it goes back to idle for the next question
    setTimeout(() => {
        mascotContainer.classList.remove('mascot-happy', 'mascot-sad');
    }, 2500);

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
