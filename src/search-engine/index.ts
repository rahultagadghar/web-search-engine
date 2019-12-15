import { config } from 'dotenv'
config()
import express from 'express'
const app = express();
import { attachFinishMethod, expressErrorHandler, ExpressError } from './index.middleware';
import { ExpressResponse } from './index.interface';
import { search } from './search/search';
const { log } = console;
const port = process.env.PORT;
app.listen(port, () => log("server on : ", port));

/* 
    INFO : attachFinishMethod callback attaches finish method (req.finish) to every incoming request  
    
    INFO : 
        * 200 is default success http statusCode for get method
        * 201 is default success http statusCode for rest of the methods 
        * 400 is default failure http statusCode for all methods

    INFO : Standard error handler,
           When we execute next() from api it is passed to next middleware 
           which is in our case expressErrorHandler and request is terminated !

*/
app.use(attachFinishMethod);

app.use(search)

/* 
*/
app.use(expressErrorHandler);
