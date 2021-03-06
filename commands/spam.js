let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'spam',
    description: 'Turn on/off to allow/deny spam in this channel',
    usage: '',
    delay: 10*1000,
    used: {},
    allowMember: false,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(guildConfigs.settings.SPAM_CHANNELS.includes(msg.channel.id)){
            //update cache
            guildConfigs.settings.SPAM_CHANNELS=guildConfigs.settings.SPAM_CHANNELS.filter((c)=>c!=msg.channel.id);
            //update db
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$pull: {'settings.SPAM_CHANNELS': msg.channel.id}});
            send(msg, embed('Success', 'Spam is **denied** in __'+msg.channel.name+'__ channel', '#43b581'));
        }else{
            //update cache
            guildConfigs.settings.SPAM_CHANNELS.push(msg.channel.id);
            //update DB
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$push: {'settings.SPAM_CHANNELS': msg.channel.id}});
            send(msg, embed('Success', 'Spam is **allowed** in __'+msg.channel.name+'__ channel', '#43b581'));
        }
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+"`` - To allow/deny member to spam messages\n\nThe members will be received penalty role when they were over-warned\nBy **default**, all channels **deny** to spam messages";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "In **first time** use on this channel\n``"+guildConfigs.prefix+this.name+"`` - This channel will **allow** members to spam messages\nUse ``"+guildConfigs.prefix+this.name+"`` again, this channel will **deny** members to spam messages"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};