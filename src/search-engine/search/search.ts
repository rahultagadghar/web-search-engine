import { Router } from 'express'
import { ExpressResponse } from '../index.interface';
import { webSearch } from '../../web-crawler/elastic';

export const search = Router()



search.get("/", (req, res: ExpressResponse, next) => {
    try {
        res.finish({}, "Web Search Engine!");
    } catch (error) {
        next(error);
    }
})
search.get("/search", async (req, res: ExpressResponse, next) => {
    try {
        const { q } = req.query
        const result = await webSearch(q)
        res.finish(result, `Retrieved ${result.length} results`);
    } catch (error) {
        next(error);
    }
})