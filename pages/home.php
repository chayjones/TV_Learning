<div id="welcome-screen" style="display: none; text-align: center; margin-top: 5rem;" class="animate-fade-in">
    <h1 style="font-size: 3rem; color: #FF9F1C;">Salut ! Moi c'est Red 🦊</h1>
    <h2 style="color: #666; margin: 1rem 0 2rem 0;">Comment t'appelles-tu ?</h2>
    <input type="text" id="username-input" class="btn btn-outline" style="background: white; width: 300px; text-align: center; font-size: 1.5rem;" placeholder="Ton prénom..." />
    <br/><br/>
    <button class="btn btn-primary" onclick="saveUsername()">C'est parti !</button>
</div>

<div id="main-menu" style="text-align: center; width: 100%; display: none;" class="animate-fade-in">
    <h1>Qu'allons-nous apprendre aujourd'hui, <span id="display-username" style="color: #FF9F1C;"></span> ?</h1>
    <h2 style="margin-top: 2rem; color: #666; font-size: 1.5rem;">Mathématiques (CE1 / CE2)</h2>
    <div class="activities-grid">
        <a href="index.php?page=addition" class="activity-card glass-card">
            <div class="icon-wrapper math">➕</div>
            <h2>Addition</h2>
            <p>Apprendre à additionner</p>
        </a>

        <a href="index.php?page=subtraction" class="activity-card glass-card">
            <div class="icon-wrapper math">➖</div>
            <h2>Soustraction</h2>
            <p>Apprendre à soustraire</p>
        </a>

        <a href="index.php?page=multiplication" class="activity-card glass-card">
            <div class="icon-wrapper math">✖️</div>
            <h2>Multiplication</h2>
            <p>Les tables de multiplication</p>
        </a>

        <a href="index.php?page=compare_numbers" class="activity-card glass-card">
            <div class="icon-wrapper math">⚖️</div>
            <h2>Comparaison</h2>
            <p>Plus grand ou plus petit</p>
        </a>

        <a href="index.php?page=doubles_halves" class="activity-card glass-card">
            <div class="icon-wrapper math">🌗</div>
            <h2>Doubles et Moitiés</h2>
            <p>Calculer le double ou la moitié</p>
        </a>

        <a href="index.php?page=geometry" class="activity-card glass-card">
            <div class="icon-wrapper math">🔺</div>
            <h2>Géométrie</h2>
            <p>Reconnaître les figures géométriques</p>
        </a>
    </div>

    <h2 style="margin-top: 3rem; color: #666; font-size: 1.5rem;">Français (CE1 / CE2)</h2>
    <div class="activities-grid">
        <a href="index.php?page=vocabulary" class="activity-card glass-card">
            <div class="icon-wrapper french">📖</div>
            <h2>Vocabulaire</h2>
            <p>Les mots de tous les jours</p>
        </a>

        <a href="index.php?page=conjugation" class="activity-card glass-card">
            <div class="icon-wrapper french">🗣️</div>
            <h2>Conjugaison</h2>
            <p>Le présent de l'indicatif</p>
        </a>

        <a href="index.php?page=chrono_lecture" class="activity-card glass-card">
            <div class="icon-wrapper french">⏱️</div>
            <h2>Chrono Lecture</h2>
            <p>Teste ta vitesse de lecture</p>
        </a>
    </div>
</div>
