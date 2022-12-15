const http = require("http");
const fs = require("fs");

module.exports = (url,path) => {
    http.get(url, (res) => {
        const writeStream = fs.createWriteStream(path);     
        res.pipe(writeStream);     
        writeStream.on("finish", () => {
           writeStream.close();
           console.log("Download Completed!");
        })
     })
}