//IMPORT REQUIRED MODULES
const express = require("express")
const path = require("path")
const mongo = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectId


const app = express() //create an express app and store in app variable
const port = process.env.PORT || 8888 //set up a port number


const dbUrl = "mongodb://127.0.0.1:27017/testdb" //connection string to testdb database
var db
var menuLinks //menuLinks will be a variable to hold a list of all menu links from the DB because the data is common across all pages


//test connection
//on successm you recieve client
mongo.connect(dbUrl, (error, client) => {
    db = client.db("testdb");  //ensure that testdb is the selected DB
    db.collection("menuLinks").find({}).toArray((err, res) => {
        menuLinks = res
    })
})

//set up paths to important files ad folders
//set up template engine
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")
app.use(express.static(path.join(__dirname, "public")))

app.use(express.urlencoded({ extended: true}))
app.use(express.json())


//set up page routes
app.get("/", (request, res) => {
    res.render("index", { title: "Home", links: menuLinks })
})

console.log(menuLinks)
app.get("/about", (request, res) => {
    res.render("about", { title: "About Us" })
})

// ADMIN PAGES FOR MENU LINKS
//listing page for all links in menulinks collection
app.get("/menu/admin", (request, res) =>{
    res.render("menu-list", { title: "Menu links admin", links: menuLinks })
})

//add page
app.get("/menu/add", (request,res) => {
    res.render("menu-add", { title: "Add menu link", links: menuLinks, numLinks:
menuLinks.length })
})

app.get("/menu/delete", (req,res) => {
    let id = new ObjectId(req.query.linkId)
    db.collection("menuLinks").deleteOne(
        {_id: id},
        (err, result) => {
            if (err) throw err
            refreshLinks()
            res.redirect("/menu/admin")
        }
    )
})

app.get("/menu/edit", (req, res) => {
    let id = new ObjectId(req.query.linkId)
    db.collection("menuLinks").findOne({ _id: id }, (err, result) => {
        if (err) throw err
        res.render("menu-edit", { title: "Edit menu link", links: menuLinks,
        editLink: result })
    })
})


function refreshLinks() {
    db.collection("menuLinks").find({}).toArray((err, result) => {
    menuLinks = result;
    })
}



//FORM HANDLERS FOR MENU LINK ADMIN PAGES
app.post("/menu/add/link", (req, res) => {
    //get form data
    let weight = req.body.weight
    let href = req.body.href
    let name = req.body.name
    let description = req.body.description
    var newLink = { "weight": weight, "href": href, "name": name, "description": description}
    db.collection("menuLinks").insertOne(newLink, (err, result) => {
        if (err) throw err
        refreshLinks()
        res.redirect("/menu/admin")
    })
})

app.post("/menu/edit/link", (req, res) => {
    //update data
    let id = new ObjectId(req.body.id)
    let weight = req.body.weight 
    let href = req.body.href
    let name = req.body.name
    let description = req.body.description
    db.collection("menuLinks").updateOne(
        { _id: id },
        {
        $set: {
        weight: weight,
        href: href,
        name: name,
        description: description
        }
        },
        { new: true },
        (err, result) => {
        if (err) throw err
        refreshLinks()
        res.redirect("/menu/admin")
    }
    )
})







app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})