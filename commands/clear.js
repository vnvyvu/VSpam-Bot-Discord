let {isWaiting, send, embed} = require('../head.js');
module.exports={
    name: 'clear',
    description: 'Clear message in channel',
    usage: '',
    delay: 10*1000,
    used: {},
    allowMember: false, 
    execute: function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        let process=async (callback)=>{//use sync
            let fetched, c=0;
            do{
                fetched=await msg.channel.messages.fetch({limit: 100});//get messages
                //filter old messages, discord not allow to delete them
                fetched=await fetched.filter(m=>m.createdTimestamp+14*86400000>Date.now());
                c+=await fetched.size;//count messages
                await msg.channel.bulkDelete(fetched);//delete messages
            }while(fetched.size>1);
            callback(c);
        };
        process((c)=>send(msg, embed(guildConfigs.lang.CMD_CLEAR_SUCC_TITLE, guildConfigs.lang.CMD_CLEAR_SUCC.replace('%amount%', c), 4437377), {deleteMsg: false}));
    },
    descriptions: function(guildConfigs){
        return "\n∘ ``"+guildConfigs.prefix+this.name+"`` - Delete all messages in channel but **only deleted messages sent in the last 2 weeks**\nWhy? Because Discord doesn't allow to do that.\nIf you really want to delete all messages, you can use **duplicate function** to keep channel's config and then, delete old channel";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "> (2/8) A: Hello\n> (10/8) B: Hi\n> (15/8) C: Good morning\nUse ``"+guildConfigs.prefix+this.name+"`` in channel, which you want to delete messages\nIf it's **20/8**, only message B and C will be deleted"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};