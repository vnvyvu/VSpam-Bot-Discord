const Discord= require('discord.js');
let config= require('./config.json');
const client= new Discord.Client();

client.once('ready', ()=>{
    console.log('ready');
});

client.on('message', msg => {
    if(msg.content === '!vspam'){
        msg.channel.send('OMG!That you!');
    }
});

client.login(process.env.VSPAM_BOT_TOKEN);