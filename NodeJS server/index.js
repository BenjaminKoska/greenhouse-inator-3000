const express = require(`express`);

const server = express();
const router = express.Router();
const connectionport = 80;


  ///////////////////
 //// WEBSERVER ////
///////////////////
const createServerResponse = function(link, file){
    router.get(link, function(request, response){
        response.sendFile(`${__dirname}/html/${file}`)
    })
}

createServerResponse(`/`, `index.html`);



  //////////////
 //// INIT ////
//////////////
const init = function(){
    server.use('/', router);
    server.listen(connectionport, function(){
        console.log(`Server is listening on port: ${connectionport}`);
    })
}



init();