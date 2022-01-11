const memoryCache = require("./store.middleware");

const storeDataInCacheMemory = async(req, data) =>{
    try {
        const key = req.url + req.query
        await memoryCache.set(key, data);
    } catch (error) {
        
    }
}

const cacheInterceptor = async(req, res, next) =>{
    try {
        const key = req.url + req.query
        const data = await memoryCache.get(key);
        if(data){
            return res.status(200).json(data)
        }
        return next();
    } catch (error) {
        
    }
}

module.exports = {storeDataInCacheMemory, cacheInterceptor};

