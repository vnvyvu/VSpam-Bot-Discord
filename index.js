const Discord= require('discord.js');
const client= new Discord.Client();

client.once('ready', ()=>{
    console.log('ready');
});

client.on('message', msg => {
    if(msg.content === '!vspam'){
        msg.channel.send('OMG!That you!');
    }
});

client.login('NTA3MDI0MzU0ODc4Njg1MjA1.W9kZOg.F3sSqI6kKDqHYyCQiQcxWFpI7OU');