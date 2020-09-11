let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'profane',
    description: 'Turn on/off to allow/deny profane in this channel',
    usage: '',
    delay: 10*1000,
    used: {},
    allowMember: false,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(guildConfigs.settings.PROFANE_CHANNELS.includes(msg.channel.id)){
            //update cache
            guildConfigs.settings.PROFANE_CHANNELS=guildConfigs.settings.PROFANE_CHANNELS.filter((c)=>c!=msg.channel.id);
            //update db
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$pull: {'settings.PROFANE_CHANNELS': msg.channel.id}});
            send(msg, embed('Success', 'Profane is **denied** in __'+msg.channel.name+'__ channel', '#43b581'));
        }else{
            //update cache
            guildConfigs.settings.PROFANE_CHANNELS.push(msg.channel.id);
            //update DB
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$push: {'settings.PROFANE_CHANNELS': msg.channel.id}});
            send(msg, embed('Success', 'Profane is **allowed** in __'+msg.channel.name+'__ channel', '#43b581'));
        }
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+"`` - To allow/deny member messages to contain badwords\n\nThe members will be received penalty role when they were over-warned\nBy **default**, all channels **deny** to send profane messages";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "In **first time** use on this channel\n``"+guildConfigs.prefix+this.name+"`` - This channel will **allow** members to send badwords\nUse ``"+guildConfigs.prefix+this.name+"`` again, this channel will **deny** members to send badwords"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};