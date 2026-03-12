const TelegramBot = require("node-telegram-bot-api")
const express = require("express")

const token = process.env.BOT_TOKEN
const bot = new TelegramBot(token,{polling:true})

const app = express()

// SETTINGS
const CHANNEL_ID = -1003892111256
const VERIFY_LINK = "https://link-center.net/4165973/LUdQfIWNaQzO"
const ADMIN_ID = 5595411143   // apna telegram id dalna

// verification system
const verifiedUsers = {}

function isVerified(id){
 if(!verifiedUsers[id]) return false
 return Date.now() < verifiedUsers[id]
}

// message handler
bot.on("message", async (msg)=>{

 if(!msg.text) return
 if(msg.text.startsWith("/")) return

 const keyword = msg.text.toLowerCase()

 bot.sendMessage(msg.chat.id,
 "Click the button below to get your file",
 {
  reply_markup:{
   inline_keyboard:[
    [
     {
      text:"GET FILE",
      url:`https://t.me/MrVinay_bot?start=${encodeURIComponent(keyword)}`
     
     }
    ]
   ]
  }
 })

})

// start command
bot.onText(/\/start (.+)/,async(msg,match)=>{

 const user = msg.from.id
 const keyword = match[1]

 if(!isVerified(user)){

  bot.sendMessage(msg.chat.id,
  "You need to verify to access this file",
  {
   reply_markup:{
    inline_keyboard:[
     [
      {text:"VERIFY NOW",url:VERIFY_LINK}
     ]
    ]
   }
  })

  return
 }

 sendFile(msg.chat.id,keyword)

})

// verification success
bot.onText(/\/verified/,(msg)=>{

 const user = msg.from.id

 verifiedUsers[user] = Date.now() + (8*60*60*1000)

 bot.sendMessage(msg.chat.id,
 "Verification successful.\n\nYou have unlimited access for 8 hours.")

})

// send file from storage channel
async function sendFile(chat,keyword){

 try{

  const msgs = await bot.getChat(CHANNEL_ID)

  bot.sendMessage(chat,
  "Searching file...")

  const message = await bot.sendMessage(chat,
  "File found. Sending now.")

  bot.forwardMessage(chat,CHANNEL_ID,17)

  setTimeout(()=>{
   bot.sendMessage(chat,"File deleted.")
  },300000)

 }catch(e){

  bot.sendMessage(chat,
  "File not found or spelling wrong.")

 }

}

// admin panel
bot.onText(/\/stats/,async(msg)=>{

 if(msg.from.id != ADMIN_ID) return

 bot.sendMessage(msg.chat.id,
 "Bot Running Successfully")

})

// server
app.get("/",(req,res)=>{
 res.send("Bot Running")
})

app.listen(3000)
const fs = require("fs")

let files = JSON.parse(fs.readFileSync("./files.json"))
let verified = JSON.parse(fs.readFileSync("./verified.json"))
function isVerified(user){

 if(!verified[user]) return false

 return Date.now() < verified[user]

}

bot.onText(/\/start verified/, (msg)=>{

const user = msg.from.id

verified[user] = Date.now() + 28800000

fs.writeFileSync("./verified.json",JSON.stringify(verified,null,2))

bot.sendMessage(msg.chat.id,"✅ Verification successful\nAccess valid for 8 hours")

})
bot.on("message", async (msg)=>{

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
  reply_markup:{ inline_keyboard:buttons }
 })

 }

})
bot.on("callback_query", async (q)=>{

const data = q.data
const user = q.from.id
const chat = q.message.chat.id

if(data.startsWith("get_")){

 if(!isVerified(user)){

  bot.sendMessage(chat,
  "🔐 You need to verify to get this file",
  {
   reply_markup:{
    inline_keyboard:[
     [
      {
       text:"VERIFY",
       url:"https://link-center.net/4165973/LUdQfIWNaQzO"
      }
     ]
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
  caption:"⚠ This file will be deleted in 5 minutes. Save or forward it."
 })

 setTimeout(()=>{
  bot.deleteMessage(chat,sent.message_id)
 },300000)

}

})
