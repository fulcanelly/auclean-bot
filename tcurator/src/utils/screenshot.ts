import puppeteer from 'puppeteer';


//todo: how to make screenshot using puppeteer, send to rmq and then send to telegragem

//puppeteer -> rmq send -> rmq recevie -> telegram bot client

//everything should be made in typescript
//skip configuration part, suppose all connections, channels are preparaed

export async function makeScreenshot() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1720, height: 980 });

    async function test() {
        await page.goto('http://localhost:3000/')
        await page.waitForSelector('#reactgooglegraph-2 > div > div:nth-child(1) > div > svg > g:nth-child(3) > rect')
        await page.screenshot({ path: 'screenshot.png' });
        console.log('done screenshot')

        test()
    }

    test()
}
// await browser.close()

