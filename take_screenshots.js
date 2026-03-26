const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log("Launching puppeteer...");
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 800 }
    });
    
    
    try {
        const page = await browser.newPage();
        const fileUrl = 'file:///c:/Users/LENOVO/Desktop/project%20for%20git/semiv/iv/ridlegamev2/index.html';
        const basePath = path.join('c:/Users/LENOVO/Desktop/project for git/semiv/iv/ridlegamev2', 'images');
        
        console.log("Loading page...");
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000)); // wait for particles

        // 1. Welcome Page
        await page.screenshot({ path: path.join(basePath, '1.png') });
        console.log("Captured 1.png");

        // 2. Stage Selection Page
        console.log("Navigating to stage selection...");
        await page.evaluate(() => document.getElementById('startGameBtn').click());
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '2.png') });
        console.log("Captured 2.png");

        // 3. Game Page
        console.log("Navigating to game page...");
        await page.evaluate(() => {
            document.querySelector('.stage-card.easy').click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '3.png') });
        console.log("Captured 3.png");

        // 4. Congratulations Modal
        console.log("Triggering congratulations modal...");
        await page.evaluate(() => {
            const el = document.getElementById('levelCompleteModal');
            el.classList.add('active');
            el.style.display = 'flex';
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '4.png') });
        console.log("Captured 4.png");

        // 5. Levels Modal
        console.log("Opening levels modal...");
        await page.evaluate(() => {
            document.getElementById('levelCompleteModal').classList.remove('active');
            const elex = document.getElementById('showLevelsModal');
            elex.classList.add('active');
            elex.style.display = 'flex';
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '5.png') });
        console.log("Captured 5.png");

        // 6. Auth Modal
        console.log("Opening auth modal...");
        await page.evaluate(() => {
            document.getElementById('showLevelsModal').classList.remove('active');
            const elauth = document.getElementById('authModal');
            elauth.classList.add('active');
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '6.png') });
        console.log("Captured 6.png");

        // 7. Leaderboard Modal
        console.log("Opening leaderboard modal...");
        await page.evaluate(() => {
            document.getElementById('authModal').classList.remove('active');
            const elb = document.getElementById('leaderboardModal');
            elb.classList.add('active');
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '7.png') });
        console.log("Captured 7.png");

        console.log("All screenshots captured successfully!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
})();
