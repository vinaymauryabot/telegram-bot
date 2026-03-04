const TelegramBot = require("node-telegram-bot-api")
const express = require("express")

const app = express()

const token = process.env.BOT_TOKEN
const bot = new TelegramBot(token,{polling:true})

const verifiedUsers = {}

function verified(id){
 if(!verifiedUsers[id]) return false
 return Date.now() < verifiedUsers[id]
}

bot.on("message",(msg)=>{

 if(!msg.text) return
 if(msg.text.startsWith("/")) return

 const name = msg.text

 bot.sendMessage(msg.chat.id,
 "Click the button below to get your file",
 {
  reply_markup:{
   inline_keyboard:[
    [
     {
      text:"GET FILE",
      url:`https://t.me/${bot.username}?start=${encodeURIComponent(name)}`
     }
    ]
   ]
  }
 })

})

bot.onText(/\/start (.+)/,(msg,match)=>{

 const user = msg.from.id
 const keyword = match[1]

 if(!verified(user)){

  const verifyLink = `https://your-shortlink.com/?file=${keyword}`

  bot.sendMessage(msg.chat.id,
  "You need to verify to access this file",
  {
   reply_markup:{
    inline_keyboard:[
     [{text:"VERIFY NOW",url:verifyLink}]
    ]
   }
  })

  return
 }

 sendFile(msg.chat.id,keyword)

})

bot.onText(/\/verified/,(msg)=>{

 const user = msg.from.id

 verifiedUsers[user] = Date.now() + (8*60*60*1000)

 bot.sendMessage(msg.chat.id,
 "Verification successful.\n\nYou have unlimited access for 8 hours.")

})

function sendFile(chat,keyword){

 bot.sendMessage(chat,
 "Here is your file.\n\nSave or forward it.\nFile will auto delete in 5 minutes.")

 setTimeout(()=>{
  bot.sendMessage(chat,"File deleted.")
 },300000)

}

app.get("/",(req,res)=>{
 res.send("Bot Running")
})

app.listen(3000)
