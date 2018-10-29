// Properties
// NPM Packages
const rp = require("request-promise");
const cheerio = require("cheerio");
// Adjusti.co Packages
const selectors = require("./selectors.json");
const urls = require("./urls.json");

// monitorKeyword("airpods case").then(a => {
//     console.log(a);
// });

function monitorKeyword(keyword) {
    return new Promise((resolve, reject) => {
        const options = {
            uri: urls.searchPage + keyword,
            transform: async function(body) {
                return await cheerio.load(body);
            }
        };

        rp(options)
            .then(async $ => {
                var keywordJson = {};
                var sponsoredBrand = await getSponsoredBrandDetailsFromHTML($);
                var sponsoredProducts = await getSponsoredProductsFromHTML($);
                if (sponsoredBrand != false) {
                    keywordJson.sponsoredBrand = sponsoredBrand;
                }
                if (sponsoredProducts != false) {
                    keywordJson.sponsoredProducts = sponsoredProducts;
                } else {
                    keywordJson = await monitorKeyword(keyword);
                }
                resolve(keywordJson);
            })
            .catch(err => {
                console.log(err);
            });
    });
}

async function getSponsoredBrandDetailsFromHTML($) {
    // Check if there is a sponsored brand
    if ($(selectors.searchPage.sponsoredBrand.brandName).text() != "") {
        var brandName = $(selectors.searchPage.sponsoredBrand.brandName).text();
        var adHeadline = $(
            selectors.searchPage.sponsoredBrand.adHeadline
        ).text();
        var productsBlocks = $(
            selectors.searchPage.sponsoredBrand.productsBlock
        ).children();
        var productsImages = [];
        await productsBlocks.each(function(i, element) {
            productsImages.push(
                $(this)
                    .find(
                        selectors.searchPage.sponsoredBrand.productsImagesClass
                    )
                    .attr("src")
            );
        });
        var firstProductDesc = $(
            selectors.searchPage.sponsoredBrand.firstProductDesc
        ).text();
        var secondProductDesc = $(
            selectors.searchPage.sponsoredBrand.secondProductDesc
        ).text();
        var thirdProductDesc = $(
            selectors.searchPage.sponsoredBrand.thirdProductDesc
        ).text();

        var sponsoredBrandJson = {
            brandName: brandName,
            adHeadline: adHeadline,
            firstProduct: {
                desc: firstProductDesc,
                image: productsImages[0]
            },
            secondProduct: {
                desc: secondProductDesc,
                image: productsImages[1]
            },
            thirdProduct: {
                desc: thirdProductDesc,
                image: productsImages[2]
            }
        };

        return sponsoredBrandJson;
    } else {
        return false;
    }
}

function getSponsoredProductsFromHTML($) {
    return new Promise(async (resolve, reject) => {
        if (
            $(selectors.searchPage.sponsoredProducts.sponsoredProductsBlocks)
                .length > 0
        ) {
            var sponsoredProducts = [];
            await $(
                selectors.searchPage.sponsoredProducts.sponsoredProductsBlocks
            ).each(async function(i, sponsoredProduct) {
                var sponsoredProductJson = {};
                // Retrieve ASIN
                var lookFor = "dp%2F";
                var sponsoredProductASIN = $(this)
                    .find(selectors.searchPage.sponsoredProducts.ASIN)
                    .attr("href");
                var sponsoredProductPosition = $(this).attr("id");
                if (sponsoredProductASIN != undefined) {
                    sponsoredProductASIN = sponsoredProductASIN.substring(
                        sponsoredProductASIN.indexOf(lookFor) + lookFor.length
                    );
                    sponsoredProductASIN = sponsoredProductASIN.substring(
                        0,
                        sponsoredProductASIN.indexOf("%2F")
                    );
                    if (sponsoredProductASIN.startsWith("B")) {
                        sponsoredProductJson.ASIN = sponsoredProductASIN;
                    } else {
                        return;
                    }
                } else {
                    return;
                }

                // Retrieve position
                if (
                    sponsoredProductPosition != undefined &&
                    sponsoredProductPosition.startsWith(
                        selectors.searchPage.sponsoredProducts.IdPrefix
                    )
                ) {
                    sponsoredProductPosition = sponsoredProductPosition.substring(
                        selectors.searchPage.sponsoredProducts.IdPrefix.length
                    );
                    sponsoredProductJson.position = sponsoredProductPosition;
                } else {
                    return;
                }
                sponsoredProducts.push(sponsoredProductJson);
            });
            resolve(sponsoredProducts);
        } else {
            resolve(false);
        }
    });
}

module.exports = {
    monitorKeyword: monitorKeyword
};
