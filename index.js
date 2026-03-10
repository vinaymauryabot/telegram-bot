const TelegramBot = require("node-telegram-bot-api")
const express = require("express")

const token = process.env.BOT_TOKEN
const bot = new TelegramBot(token,{polling:true})

const app = express()

// SETTINGS
const CHANNEL_ID = -1003892111256
const VERIFY_LINK = "https://tpi.li/verify"
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
      url:`https://t.me/${bot.username}?start=${keyword}`
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
