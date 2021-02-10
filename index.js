import puppeteer from 'puppeteer'

/**
 * @typedef {Object} SkyrockBlogLinkPosterConfig
 * @property {boolean} show default false
 * 
 * @param {string} login
 * @param {string} password
 * @param {string} link
 * @param {QuoraQuestionnfig} config 
 * 
 * @returns {Promise<string>}
 */
export default function (login, password, link, config = {}) {

    return new Promise(async (resolve, reject) => {
        
        setDefaultConfig(config, 'show', false)

        let browser
        try {
            browser = await puppeteer.launch({
                headless: ! config.show,
                args: [
                    '--disable-notifications',
                    '--no-sandbox'
                ]
            })
        } catch (e) {
            reject(e)
            return
        }
        
        try {
            const page = await browser.newPage()
            await page.goto('https://www.skyrock.com')

            const cookieValidationButtonSelector = 'button[mode="primary"]'
            await page.waitForSelector(cookieValidationButtonSelector)
            await page.click(cookieValidationButtonSelector)

            const connectButtonSelector = '.bouton'
            await page.waitForSelector(connectButtonSelector)
            await page.click(connectButtonSelector)

            const loginInputSelector = '#login'
            const passwordInputSelector = '#password'
            await page.waitForSelector(loginInputSelector)
            await page.waitForSelector(passwordInputSelector)

            await page.evaluate((login, password, loginInputSelector, passwordInputSelector) => {
                document.querySelector(loginInputSelector).value = login
                document.querySelector(passwordInputSelector).value = password
            }, login, password, loginInputSelector, passwordInputSelector)

            const loginButtonSelector = 'input[type="submit"]'
            await page.waitForSelector(loginButtonSelector)
            await page.click(loginButtonSelector)

            await page.waitForTimeout(3000)

            const linkPostSelector = 'a[href="#easy-link-panel"]'
            await page.waitForSelector(linkPostSelector)
            await page.click(linkPostSelector)

            const linkInputSelector = '#easy-link-url'
            await page.waitForSelector(linkInputSelector)

            await page.evaluate((link, linkInputSelector) => {
                document.querySelector(linkInputSelector).value = link
            }, link, linkInputSelector)

            await page.waitForTimeout(3000)

            const linkContinueButtonSelector = '#easy-link-panel input[value="Continuer"]'
            await page.waitForSelector(linkContinueButtonSelector)
            await page.click(linkContinueButtonSelector)

            await page.waitForTimeout(3000)

            const linkPostButtonSelector = '#easy-link-panel input[value="Publier"]'
            await page.waitForSelector(linkPostButtonSelector)
            await page.click(linkPostButtonSelector)

            await page.waitForTimeout(3000)

            const postId = await page.evaluate(() => {
                return document.querySelector('.article-title').href.split('/').slice(-1).pop()
            })

            await browser.close()
            resolve(postId)
            
        } catch (e) {
            await browser.close()
            reject(e)
        }
    })
}

/**
 * @param {SkyrockBlogLinkPosterConfig} config 
 * @param {string} configKey 
 * @param {*} defaultValue
 * 
 * @returns {void}
 */
function setDefaultConfig(config, configKey, defaultValue) {
    if (! (configKey in config)) {
        config[configKey] = defaultValue
    }
}
