let express = require('express')
let app = express()
let mongoClient = require("mongodb").mongoClient
let objectID = require("mongodb").ObjectID
let sha1 = require('sha1')
let multer = require('multer')
let upload = multer({ dest: __dirname + '/upload/' })
let reloadMagic = require('./reload-magic.js')
reloadMagic(app)
let dbo = undefined
let url = "mongodb+srv://ahmed:ahmed@cluster0-hlssn.mongodb.net/test?retryWrites=true&w=majority"
mongoClient.connect(url, { userNewUrlParser: true }, (err, db) => {
    dbo = db.db("Market")
})
app.use('/uploads', express.static("upload"))
app.use('/', express.static('build')); // Needed for the HTML and JS files
app.use('/', express.static('public')); // Needed for local assets
// Your endpoints go after this line
app.post('/signup', upload.none(), (req, res) => {
    let username = req.body.username
    let password = req.body.password
    dbo.collection('users').findOne({ username }), (err, user) => {
        if (err) {
            console.log(err, "signup err")
            res.send(JSON.stringify({ succes: false }))
            return
        }
        if (user === username) {
            console.log("same username")
            res.send(JSON.stringify({ success: false }))
            return
        }
        else {
            //this is for create the user & the cart in the backend
            dbo.collection('cart').insertOne({ username, items: [] })
            dbo.collection("users").insertOne({ username, password: sha1(password) })
            res.send({ success: true })
            return
        }
    }
})
app.post('/login', upload.none(), (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let hashedPwd = sha1(password)
    dbo.collection("users").findOne({ username }), (err, user) => {
        if (err) {
            console.log(err, "login error")
            res.send({ success: false })
            return
        }
        if (user === null) {
            res.send({ success: false })
            return
        }
        if (user.password === hashedPwd) {
            res.send({ success: true })
            return
        }
        res.send({ success: false })
    }
})
app.post('/newItem', upload.fields({ name: "images", maxCount: 5 }), (req, res) => {
    let images = []
    let seller = req.body.username
    let name = req.body.itemName
    let desc = req.body.desc
    let stock = req.body.stock
    let cat = req.body.categorie
    let files = req.files
    let price = req.body.price
    files.forEach(file => {
        // Each image path was send in the images array
        let frontendPath = '/upload/' + file.filenmae
        images.push(frontendPath)
    })
    dbo.collection(cat).insertOne({ name, description: desc, seller, stock, images, price })
    res.send({ success: true })
})
app.post('/addTocart', upload.none(), (req, res) => {
    let username = req.body.username
    let item = req.body.id
    let cat = req.body.cat
    dbo.collection(cat).findOne({ "_id": item }), (err, it) => {
        //this is for find the id of the item for stack it in the cart collection with the username
        if (err) {
            console.log(err, "add to cart error")
            res.send({ success: false })
        }
        if (it._id === item) {
            dbo.collection('cart').findOne({ username }), (err, user) => {
                //this is for find the good cart for stack the items inside of them.
                if (err) {
                    console.log(err, "erreur find cart user")
                    res.send({ success: false })
                    return
                }
                if (username) {
                    let newItems = it.items.concat(item)
                    dbo.collection('cart').updateOne({ username, items: newItems })
                    res.send({ success: true })
                    return
                }
            }
        }
    }
})
app.post('/checkout', uplod.none(), (req, res) => {
    let username = req.body.username
    dbo.collection('cart').findOne({ username }), (err, user) => {
        if (err) {
            console.log(err, "cart error")
            res.send({ success: false })
            return
        }
        if (username) {

            return
        }
        console.log("username not find")
        res.send({ success: false })
    }
})
// Your endpoints go before this line

app.all('/*', (req, res, next) => { // needed for react router
    res.sendFile(__dirname + '/build/index.html');
})


app.listen(4000, '0.0.0.0', () => { console.log("Server running on port 4000") })
