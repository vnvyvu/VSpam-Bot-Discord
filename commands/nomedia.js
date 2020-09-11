let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'nomedia',
    description: 'Turn on/off to deny/allow media in this channel',
    usage: '',
    delay: 10*1000,
    used: {},
    allowMember: false,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(guildConfigs.settings.NOMEDIA_CHANNELS.includes(msg.channel.id)){
            //update cache
            guildConfigs.settings.NOMEDIA_CHANNELS=guildConfigs.settings.NOMEDIA_CHANNELS.filter((c)=>c!=msg.channel.id);
            //update db
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$pull: {'settings.NOMEDIA_CHANNELS': msg.channel.id}});
            send(msg, embed('Success', 'Media is **allowed** in __'+msg.channel.name+'__ channel', '#43b581'));
        }else{
            //update cache
            guildConfigs.settings.NOMEDIA_CHANNELS.push(msg.channel.id);
            //update DB
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$push: {'settings.NOMEDIA_CHANNELS': msg.channel.id}});
            send(msg, embed('Success', 'Media is **denied** in __'+msg.channel.name+'__ channel', '#43b581'));
        }
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+"`` - To deny/allow members send media\n\nThe members will be received penalty role when they forget to delete a message containing media\nBy **default**, all channels **allow** sending messages with media attachment";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "In **first time** use on this channel\n``"+guildConfigs.prefix+this.name+"`` - This channel will **deny** members to send media\nUse ``"+guildConfigs.prefix+this.name+"`` again, this channel will **allow** members to send media"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};