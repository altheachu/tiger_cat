import * as fs from "node:fs";
import express from "express";
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}))
app.use('/css', express.static('node_modules/bootstrap/dist/css'));
app.use(express.static("public"))

app.listen(port, ()=>{
  console.log(`Listening on port ${port}`);
})

app.get("/", (req, res)=>{
  const path = "./files/";
  let articles = [];
  let tmpArticles = [];
  let length = 0;
  // 非同步，一個在讀取過程結束時執行的回傳函數
  fs.readdir(path, (err, files) => {
    files.forEach((file)=>{
      fs.readFile(`${path}${file}`, "utf8", function(err,data){
        if (err) console.log(err);
        const getTitle = data.split("\r\n");
        const aTitle = getTitle.shift();
        const idx = file.replace('.txt','');
        let content = '';
        getTitle.forEach((paragraph)=>{
          content += paragraph;
        })
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
                let aArticls = {title: article['title'], content: article['content']}
                articles.push(aArticls);
              }
            });
          });
          res.render("index.ejs", {articles: articles})
        }
        setTimeout(()=>{}, 5000);
      });
      setTimeout(()=>{}, 1000);
    });
  });
  // 同步，回傳檔案名稱，停止執行其他程式碼，直到整個讀取過程結束。
  // const files = fs.readdirSync(path);
  
  // fs.writeFile("test.txt",'test', err=>{
  //   if (err) throw err;
  //   console.log("The file has been saved.");
  // })
})