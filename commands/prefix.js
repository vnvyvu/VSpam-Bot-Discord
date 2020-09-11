let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'prefix',
    description: `Change bot's prefix`,
    usage: '[newPrefix]',
    delay: 15*1000,
    used: {},
    allowMember: false, 
    execute: function(guildConfigs, msg, args){
        //If user is in waiting then do nothing
        if(isWaiting(guildConfigs, msg, this)) return;
        if(args[1]) args[1]=args[1].toLocaleLowerCase();
        if(args[1]){
            guildConfigs.prefix=args[1];//change prefix in cache
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$set: {'prefix': args[1]}});//change prefix in db
            send(msg, embed('Success', 'Prefix has been changed to: '+args[1], '#43b581'), {deleteSent: false});
        }else send(msg, embed('Command Prompt', "You may have used the **wrong syntax** or **wrong input data**!?\nTry this: ``"+guildConfigs.prefix+this.name+" "+this.usage+"``", '#7289da'));
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+" "+this.usage+"`` - Change bot's prefix\n\nNothing too unfamiliar to you, just note **"+this.usage+" cannot contain SPACES**";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "``"+guildConfigs.prefix+this.name+" v.`` - Prefix will be changed to ``v.``"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
}