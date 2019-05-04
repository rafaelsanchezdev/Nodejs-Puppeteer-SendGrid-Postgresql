
const puppeteer = require('puppeteer');

lapstoneandhammer = async () => {
    // Actual Scraping goes Here...

    const chromeLaunchOptions = {
        // ignoreHTTPSErrors: true,
        headless: true,
        // timeout: 0,
        args: [
            '--disable-setuid-sandbox',
            '--no-sandbox',
        ],
    };

    const browser = await puppeteer.launch(chromeLaunchOptions);
    const page = await browser.newPage();

    let productList = [];

    let page_index = 1;

    while (1) {
        await page.goto(`https://www.lapstoneandhammer.com/collections/sale?page=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pagination > .right');
            const productDetails = document.querySelectorAll('.product-grid > .product-item > .caption');
            for (var product of productDetails) {
                const div_name = product.children[0];
                const div_brand = product.children[1];
                const div_price = product.children[2];
                if (div_brand && div_name && div_price) {
                    const productVendor = div_brand.innerText;
                    if (productVendor.toUpperCase().includes('NIKE') || productVendor.toUpperCase().includes('JORDAN')) {
                        const productRef = "https://www.lapstoneandhammer.com" + div_name.firstElementChild.getAttribute('href');
                        let productTitle = productVendor + " " + div_name.innerText;
                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')
                        const div_money = div_price.firstElementChild;
                        const productPrice = div_money != null ? div_money.innerText : div_price.innerHTML;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });

                    }
                }
            }

            return { products, bLastPage: btnNextPage[0].classList.contains('unavailable') }
        });

        console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`);

        productList = [...productList, ...pageInfo.products]

        if (pageInfo.bLastPage == true)
            break;
        page_index++;
    }

    //console.log(productList.length)

    browser.close();
    return productList;
};
exports.default = lapstoneandhammer;