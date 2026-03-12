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

// load database
let files = {}
let verified = {}

if(fs.existsSync("./files.json")){
 files = JSON.parse(fs.readFileSync("./files.json"))
}

if(fs.existsSync("./verified.json")){
 verified = JSON.parse(fs.readFileSync("./verified.json"))
}

// verification check
function isVerified(user){
 if(!verified[user]) return false
 return Date.now() < verified[user]
}

// search keyword
bot.on("message",async(msg)=>{

 if(!msg.text) return
 if(msg.text.startsWith("/")) return

 const keyword = msg.text.toLowerCase()
 const chatId = msg.chat.id

 if(files[keyword]){

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

 }

})

// button click
bot.on("callback_query",async(q)=>{

 const data = q.data
 const user = q.from.id
 const chat = q.message.chat.id

 if(data.startsWith("get_")){

  if(!isVerified(user)){

   bot.sendMessage(chat,
   "🔐 You need to verify first",
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

 }

})

// verification success
bot.onText(/\/start verified/,(msg)=>{

 const user = msg.from.id

 verified[user] = Date.now() + 28800000

 fs.writeFileSync("./verified.json",JSON.stringify(verified,null,2))

 bot.sendMessage(msg.chat.id,
 "✅ Verification successful\nAccess valid for 8 hours")

})

// admin command
bot.onText(/\/stats/,(msg)=>{

 if(msg.from.id!=ADMIN_ID) return

 bot.sendMessage(msg.chat.id,"Bot running successfully")

})

// server for render
const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
 res.send("Bot Running")
})

app.listen(PORT,()=>{
 console.log("Server running")
})
