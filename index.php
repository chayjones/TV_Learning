<?php
// Main routing file
$page = isset($_GET['page']) ? $_GET['page'] : 'home';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TV Learning</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-container">
        <div class="top-bar">
            <?php if ($page !== 'home'): ?>
                <a href="index.php" class="btn btn-outline">
                    <span>🏠 Menu Principal</span>
                </a>
            <?php else: ?>
                <div style="width: 150px;"></div>
            <?php endif; ?>

            <div class="points-display">
                <span id="points-counter">0 Points</span>
                <span class="star-icon bounce-hover">⭐</span>
            </div>
        </div>

        <main class="glass-card" style="flex: 1; display: flex; flex-direction: column;">
            <?php
            $allowed_pages = ['home', 'addition', 'multiplication', 'subtraction', 'compare_numbers', 'doubles_halves', 'geometry', 'vocabulary', 'conjugation', 'chrono_lecture', 'geography'];
            if (in_array($page, $allowed_pages)) {
                include "pages/{$page}.php";
            } else {
                echo "<h1>Page non trouvée</h1>";
            }
            ?>
        </main>

        <div class="mascot-container" id="mascot-container">
            <div id="speech-bubble" class="speech-bubble">
                Bonjour ! Prêt à apprendre ?
            </div>
            <?php include "mascot.svg"; ?>
        </div>
    </div>

    <script src="maps_data.js?v=5"></script>
    <script src="script.js?v=4"></script>
    <script>
        // Trigger page-specific JS initializations
        document.addEventListener('DOMContentLoaded', () => {
            const page = "<?php echo $page; ?>";
            if (page === 'home') {
                initHome();
            } else if (page === 'addition') {
                initGame('addition');
            } else if (page === 'multiplication') {
                initGame('multiplication');
            } else if (page === 'subtraction') {
                initGame('subtraction');
            } else if (page === 'compare_numbers') {
                initGame('compare_numbers');
            } else if (page === 'doubles_halves') {
                initGame('doubles_halves');
            } else if (page === 'geometry') {
                initGame('geometry');
            } else if (page === 'vocabulary') {
                initGame('vocabulary');
            } else if (page === 'conjugation') {
                initGame('conjugation');
            } else if (page === 'chrono_lecture') {
                initGame('chrono_lecture');
            } else if (page === 'geography') {
                initGame('geography');
            }
        });
    </script>
</body>
</html>
