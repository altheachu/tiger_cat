import * as fs from "node:fs";
import express from "express";
import bodyParser from 'body-parser';
import md5 from 'js-md5';

const app = express();
const port = 3000;
const path = "./files/";
const fileExtension = ".txt";
let loginStatus = false;
const users = [
  {
    account: 'althea',
    password: 'e10adc3949ba59abbe56e057f20f883e',
  }
];

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use('/css', express.static('node_modules/bootstrap/dist/css'));
app.use(express.static("public"))

app.listen(port, ()=>{
  console.log(`Listening on port ${port}`);
})

app.get("/", (req, res)=>{
  renderView(res);
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
})

app.get("/logout", (req, res) => {
  loginStatus = false;
  res.redirect("/");
})

app.post("/authorization", (req, res) => {
  const account = req.body.account;
  const index = users.findIndex((user) => user.account === account);
  if (index != -1){
    const user = users[index];
    if(md5(req.body.password)===user.password){
      loginStatus = true;
      res.redirect("/");
    } else{
      res.render("login.ejs", {msg: "Wrong password 密碼錯誤"});
    }
  } else {
    res.render("login.ejs", {msg: "Not a valid account 查無此帳號"});
  }
})

app.post("/add", (req, res)=>{

  const title = req.body.title;
  const content = req.body.content;
  let curFilesNo = [];
  let fileNo = String(0).padStart(3, 0);
  fs.readdir(path, (err, files) => {
    files.forEach((fileName)=>{
      curFilesNo.push(Number(fileName.replace(fileExtension,"")));
    })
    curFilesNo = curFilesNo.sort((a , b) => {
      return b - a;
    });
    fileNo = String(++curFilesNo[0]).padStart(3,0);
    const fileName = `${fileNo}${fileExtension}`;
    const fileContent = title + "$\r\n" + content;
    
    fs.writeFile(`${path}${fileName}`, fileContent, err=>{
      if (err) throw err;
      console.log("The file has been created.");
    });
    renderView(res);
  });

})

app.post("/save", (req, res)=>{

  const fileName = `${req.body.fileNo}${fileExtension}`;

  fs.readFile(`${path}${fileName}`, "utf8", function(err,data){
    if (err) console.log(err);
    const paragraphs = data.split("$");
    const title = paragraphs[0] + "$";
    const fileContent = title + req.body.content;
    fs.writeFile(`${path}${fileName}`, fileContent, err=>{
      if (err) throw err;
      console.log("The file has been saved.");
      renderView(res);
    });
  })
})

app.post("/delete", (req, res)=>{

  const fileName = `${req.body.fileNo}${fileExtension}`;

  fs.unlink(`${path}${fileName}`, function(err){
    if (err) {
      console.error("Delete error:", err);
      throw err;
    } else {
      console.log("File deleted successfully.");
    }
  });
  setTimeout(() => {renderView(res);}, 1500);
})

function renderView(res) {
  let articles = [];
  let tmpArticles = [];
  let length = 0;
  // 同步，回傳檔案名稱，停止執行其他程式碼，直到整個讀取過程結束。
  // const files = fs.readdirSync(path);
  // 非同步，一個在讀取過程結束時執行的回傳函數
  fs.readdir(path, (err, files) => {
    files.forEach((file)=>{
      fs.readFile(`${path}${file}`, "utf8", function(err,data){
        if (err) console.log(err);
        const contentArray = data.split("$");
        const aTitle = contentArray.shift();
        const idx = file.replace('.txt','');
        let content = contentArray[0];
        content = content.trimEnd();
        tmpArticles.push({idx: idx, title: aTitle, content: content});
        length++;
        if (length == files.length){
          let idxs = tmpArticles.map(function(value){
            return value['idx'];
          });
          idxs = idxs.sort();
          idxs.forEach((idx)=>{
            tmpArticles.forEach((article)=>{
              if(article['idx']==idx){
                let aArticles = {title: article['title'], content: article['content'], index: article['idx']}
                articles.push(aArticles);
              }
            });
          });
          res.render("index.ejs", {articles: articles, loginStatus: loginStatus})
        }
        setTimeout(()=>{}, 5000);
      });
      setTimeout(()=>{}, 1000);
    });
  });
}