let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'lang',
    description: 'Change messages of bot',
    usage: '[key] [newContent]',
    used: {},
    delay: 5*1000,
    allowMember: false,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(args[1]&&args[2]){
            args[1]=args[1].toLocaleUpperCase();
            if(guildConfigs.lang[args[1]]){
                //As argument 2 is split when processing input message, we need to concatenate them. Same "ignore" command
                args[2]=args.slice(2).join(' ');
                //update cache
                guildConfigs.lang[args[1]]=args[2];
                //update db
                client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$set: {['lang.'+args[1]]: args[2]}});
                send(msg, embed('Success', '``'+args[1]+'`` is set to "*'+args[2]+'*"', '#43b581'));
            }else send(msg, "Key doesn't exist!");
        }else {
            let entries=Object.entries(guildConfigs.lang), body='>>> ';
            for (let [key, value] of entries) {
                body+='``'+key+'``: '+JSON.stringify(value)+'\n';
            }
            send(msg, embed('Command Prompt', "You may have used the **wrong syntax** or **wrong input data**!?\nTry this: ``"+guildConfigs.prefix+this.name+" "+this.usage+"``\n\n**Key-Content**\n"+body, '#7289da'), {timeoutSent: 60*1000});
        }
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+"`` - Show current [key, content]\n∘ ``"+guildConfigs.prefix+this.name+" [key] [newContent]`` - Change content of key\n\nThis function helps you to change some BOT messages\nSorry for that is **NOT** all messages, I'm having budget issues to upgrade VPS/Database\nSome content contains its own placeholders (``%tag%, %list%, ...``), you can change their locations but **NOT** change or delele them";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "``"+guildConfigs.prefix+this.name+" PROFANE_NOTIFY_TITLE Dirty Old Man`` - Change notify title to \"Dirty Old Man\"\nUse ``"+guildConfigs.prefix+this.name+"`` to see all key-content"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};