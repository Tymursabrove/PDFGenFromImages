const express = require('express')
const bodyParser = require('body-parser')
const cors  = require("cors")
const fs = require("fs");
const multer = require("multer");
const PDFDocument = require('pdfkit');
const doc = new PDFDocument({size: [500, 600]});
const app = express()
const port = 3000
const upload = multer({ dest: 'uploads/' })

app.set("view engine", "ejs");
app.use(cors())
app.use(bodyParser.json({limit: '100mb'}))
app.use(bodyParser.urlencoded({extended: false, limit: '100mb'}))

app.get('/', (req, res) => {
  res.render("index")
})

app.post('/uploadrawfile', upload.array('picture', 100), async function (req, res, next) {
    console.log("photo", req.files)
    req.files?.map((file, index)=> {
      if(index == 1) {
        doc.pipe(fs.createWriteStream('output.pdf')) // write to PDF
        doc.image(`uploads/${file.filename}`,0,0, {width:500, height: 600});
      } else {  
        doc.addPage();
        doc.image(`uploads/${file.filename}`,0,0, {width:500, height: 600});
        if(index == req.files.length-1) doc.end()  
      }
    })               
})

app.post('/uploadwithbase64', (req, res) => {
  console.log("received");
  req.body.base64?.map(async(base64Data, index)=> {
    console.log("works?");
    let buffer = await Buffer.from(base64Data, 'base64');
    if(index == 0) {
      doc.pipe(fs.createWriteStream('output.pdf')) // write to PDF
      doc.image(buffer,0,0, {width:500, height: 600});
      if(req.body.base64.length==1) {doc.save(); doc.end(); res.json("sucess")}
    } else {  
      doc.addPage();
      doc.image(buffer,0,0, {width:500, height: 600});
      if(index == req.body.base64.length-1) {doc.save(); doc.end(); res.json("sucess")}  
    }
  })
})
app.get("/download", (req, res) => {
  const file = `${__dirname}/output.pdf`;
  res.download(file);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})