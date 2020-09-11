let {isWaiting, send, embed, bot} = require('../head.js');
module.exports={
    name: 'send',
    description: 'Send question to author(me)',
    usage: '[message]',
    delay: 10*1000,
    used: {},
    allowMember: true,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(args[1]){
            bot.fetchApplication().then(clientApp=>clientApp.owner.send(embed(clientApp.name+' Report', msg.member.toString()+': '+args[1], '#00FFBA')));
        }else send(msg, embed('Command Prompt', "You may have used the **wrong syntax** or **wrong input data**!?\nTry again: ``"+guildConfigs.prefix+this.name+" "+this.usage+"``", '#7289da'), {deleteMsg: false});
    }
};