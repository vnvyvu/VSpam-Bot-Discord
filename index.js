const Discord= require('discord.js');
let config= require('./config.json');
const client= new Discord.Client();

client.once('ready', ()=>{
    console.log('ready');
});

client.on('message', (...args) => {
    if(args[0].content === `${config.prefix}`){
        msg.channel.send('OMG!That you!');
    }
    if(args[0].content ===`${config.prefix}prefix`){
        config.prefix=args[1].content;
    }
});

client.login(process.env.VSPAM_BOT_TOKEN);