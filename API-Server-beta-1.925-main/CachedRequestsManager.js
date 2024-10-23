import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";

let cachedRequestsExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

global.cachedRequests = [];
global.cachedRequestsCleanerStarted = false;

export default class CachedRequestsManager {
    static cache = new Map();
    static startCachedRequestsCleaner() {/* démarre le processus de nettoyage des caches périmées */

        setInterval(CachedRequestsManager.flushExpired, cachedRequestsExpirationTime * 1000);
        console.log(BgWhite + FgBlue, "[Periodic cached requests data caches cleaning process started...]");
    }
    static add(url, content, ETag= "") {/* mise en cache */
        let expirationDate = Date.now() + this.cachedRequestsExpirationTime;
        this.cache.set(url,{ content, ETag, expirationDate});
        console.log(`Added to the cache: ${url}`)
       
    }
    static find(url) {/* retourne la cache associée à l'url */
        return this.cache.get(url);
        // try {
        //     if (url != "") {
        //         for (let cache of cachedRequests) {
        //             if (cache.url == url) {
        //                 // renew cache
        //                 cache.Expire_Time = utilities.nowInSeconds() + cachedRequestsExpirationTime;
        //                 console.log(BgWhite + FgBlue, `[${cache.url} data retrieved from cache]`);
        //                 return cache.data;
        //             }
        //         }
        //     }
        // } catch (error) {
        //     console.log(BgWhite + FgRed, "[cached request error!]", error);
        // }
        // return null;
    }
    static clear(url) {/* efface la cache associée à l’url */
        if (url) {
            let indexToDelete = [];
            let index = 0;
            for (let cache of cachedRequests) {
                if (cache.url == url) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(cachedRequests, indexToDelete);
        }
    }
    static flushExpired() {/* efface les caches expirées */
        let now = utilities.nowInSeconds();
        for (let cache of cachedRequests) {
            if (cache.Expire_Time <= now) {
                console.log(BgWhite + FgBlue, "Cached file data of " + cache.url + " expired");
            }
        }
        cachedRequests = cachedRequests.filter( cache => cache.Expire_Time > now);
    }
    static get(HttpContext) {/*
        Chercher la cache correspondant à l'url de la requête. Si trouvé,
        Envoyer la réponse avec
        HttpContext.response.JSON( content, ETag, true /* from cache */
        // return new Promise(async resolve =>{
        //     if(this.find(HttpContext.req.url) != null){
        //         let cache = this.find(HttpContext.req.url);
        //         HttpContext.response.JSON(cache.content,cache.ETag,true);
        //         resolve(true);
        //     }
        //     else{
        //         resolve(false);
        //     }
        // });

        let cache = this.find(HttpContext.req.url);
        if(cache){
            console.log(`Extracting the cache: ${HttpContext.req.url}`);
            HttpContext.response.JSON(cache.content, cache.ETag, true);
            return true;
        }
        return false;
    }
}
