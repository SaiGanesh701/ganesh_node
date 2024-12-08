const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Port number that server listens to
const PORT = 4042;

const artDetails = async (client) => {
    //Fetches records from given database
    const cursor = await client.db("ArtGalleryDB").collection("Arts").find({});
    const results = await cursor.toArray();
    return JSON.stringify(results);
}

//Creates HTTP Server(i.e our system acts as server)
http.createServer(async (req, res) => {
    if (req.url === "/api") {
        const URL = "mongodb+srv://saichowdary:saichowdary@artgallerycluster.esx6c.mongodb.net/?retryWrites=true&w=majority&appName=ArtGalleryCluster";

        // Creating a new client for connecting to database
        const client = new MongoClient(URL);
        try {
            // Connects to database
            await client.connect();
            console.log("Database is connected sucessfully");
            const artData = await artDetails(client);
            // Handling CORS Issue
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.writeHead(200, { "content-type": "application/json" });
            res.end(artData);
        }
        catch (err) {
            console.error("Error in connecting database", err);
        }
        finally {
            //Closing connection to database
            await client.close();
            console.log("Database connection is closed");
        }
    }
    else {
        console.log(req.url);
        let contentType;
        const filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url.slice(1));
        //Assigning content type based on file extension
        if (filePath.endsWith(".png")) contentType = "image/png";
        else if (filePath.endsWith(".jpeg") || filePath.endsWith(".jpg")) contentType = "image/jpeg";
        else contentType = "text/html";
        //Reads given file from given path
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.writeHead(404, { "content-type": "text/html" });
                    res.end("<h1>404 Page Not Found!</h1>");
                } else {
                    // Handle other errors
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server error");
                }
            }
            else {
                res.writeHead(200, { "content-type": contentType });
                res.end(content, "utf8");
            }
        });
    }
}).listen(PORT, () => console.log(`Server is running on ${PORT}`));