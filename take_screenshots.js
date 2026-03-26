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
        const basePath = 'c:/Users/LENOVO/Desktop/project for git/semiv/iv/ridlegamev2/images';
        
        console.log("Loading page...");
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000)); // wait for particles

        // 1. Welcome Page
        await page.screenshot({ path: path.join(basePath, '1.png') });
        console.log("Captured 1.png");

        // 6. Auth Modal (taken on welcome page)
        console.log("Opening auth modal...");
        await page.evaluate(() => {
            document.getElementById('loginBtn').click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '6.png') });
        console.log("Captured 6.png");

        // 7. Leaderboard Modal
        console.log("Opening leaderboard modal...");
        await page.evaluate(() => {
            document.getElementById('closeAuthModal').click();
            setTimeout(() => document.getElementById('leaderboardBtn').click(), 500);
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '7.png') });
        console.log("Captured 7.png");

        // 2. Stage Selection Page
        console.log("Navigating to stage selection...");
        await page.evaluate(() => {
            document.getElementById('closeLeaderboardModal').click();
            setTimeout(() => document.getElementById('startGameBtn').click(), 500);
        });
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
            const el1 = document.getElementById('levelCompleteModal');
            el1.classList.remove('active');
            el1.style.display = 'none';
            
            const el2 = document.getElementById('showLevelsModal');
            el2.classList.add('active');
            el2.style.display = 'flex';
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(basePath, '5.png') });
        console.log("Captured 5.png");

        console.log("All screenshots captured successfully!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
})();
