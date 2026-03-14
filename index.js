const TelegramBot = require("node-telegram-bot-api")
const express = require("express")
const fs = require("fs")

const token = process.env.BOT_TOKEN
const bot = new TelegramBot(token,{polling:true})
const app = express()

// SETTINGS
const CHANNEL_ID = -1003892111256
const VERIFY_LINK = "https://link-center.net/4165973/LUdQfIWNaQzO"
const ADMIN_ID = 5595411143

let files = {}
let verified = {}

// load database
if(fs.existsSync("./files.json")){
 files = JSON.parse(fs.readFileSync("./files.json"))
}

if(fs.existsSync("./verified.json")){
 verified = JSON.parse(fs.readFileSync("./verified.json"))
}

// save db
function saveFiles(){
 fs.writeFileSync("./files.json",JSON.stringify(files,null,2))
}

function saveVerified(){
 fs.writeFileSync("./verified.json",JSON.stringify(verified,null,2))
}

// verification
function isVerified(user){
 if(!verified[user]) return false
 return Date.now() < verified[user]
}

// AUTO INDEX FROM CHANNEL
bot.on("channel_post",(msg)=>{

 if(msg.chat.id != CHANNEL_ID) return
 if(!msg.document) return
 if(!msg.caption) return

 let keyword = msg.caption.toLowerCase()

 if(!files[keyword]) files[keyword] = []

 files[keyword].push({
  name: msg.document.file_name,
  file_id: msg.document.file_id
 })

 saveFiles()

})

// SEARCH
bot.on("message",(msg)=>{

 if(!msg.text) return
 if(msg.text.startsWith("/")) return

 const keyword = msg.text.toLowerCase()
 const chatId = msg.chat.id

 if(!files[keyword]){

  bot.sendMessage(chatId,"❌ File not found")
  return
 }

 let results = files[keyword]

 let buttons = results.map((f,i)=>[
 {
  text:`${i+1}. ${f.name}`,
  callback_data:`get_${keyword}_${i}`
 }
 ])

 bot.sendMessage(chatId,
 `🔎 Results for: ${keyword}`,
 {
  reply_markup:{inline_keyboard:buttons}
 })

})

// BUTTON CLICK
bot.on("callback_query",async(q)=>{

 const data = q.data
 const user = q.from.id
 const chat = q.message.chat.id

 if(!data.startsWith("get_")) return

 if(!isVerified(user)){

  bot.sendMessage(chat,
  "🔐 Verify to access file",
  {
   reply_markup:{
    inline_keyboard:[
     [{text:"VERIFY",url:VERIFY_LINK}]
    ]
   }
  })

  return
 }

 let parts = data.split("_")
 let key = parts[1]
 let index = parts[2]

 let file = files[key][index]

 const sent = await bot.sendDocument(chat,file.file_id,{
  caption:"⚠ File will delete in 5 minutes"
 })

 setTimeout(()=>{
  bot.deleteMessage(chat,sent.message_id)
 },300000)

})

// VERIFY SUCCESS
bot.onText(/\/start verified/,(msg)=>{

 const user = msg.from.id

 verified[user] = Date.now() + 28800000

 saveVerified()

 bot.sendMessage(msg.chat.id,
 "✅ Verification successful\nAccess valid for 8 hours")

})

// ADMIN STATS
bot.onText(/\/stats/,(msg)=>{

 if(msg.from.id != ADMIN_ID) return

 bot.sendMessage(msg.chat.id,
 `📊 Total Keywords: ${Object.keys(files).length}`)
})

// SERVER
const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
 res.send("Bot Running")
})

app.listen(PORT,()=>{
 console.log("Server Running")
})
