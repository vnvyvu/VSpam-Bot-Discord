let {isWaiting, send, client, embed, setExplain} = require('../head.js');
module.exports={
    name: 'set',
    description: 'Change settings for bot',
    usage: '[key] [newValue]',
    delay: 5*1000,
    used: {},
    allowMember: false,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(args[1]&&args[2]){
            //Key is always upper
            args[1]=args[1].toLocaleUpperCase();
            if(typeof guildConfigs.settings[args[1]]=='number'){
                args[2]=parseInt(args[2]);
                if(isNaN(args[2])){
                    send(msg,"Value must be a number!");
                } else{
                    //update cache
                    guildConfigs.settings[args[1]]=args[2];
                    //update db
                    client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$set: {['settings.'+args[1]]: +args[2]}});
                    send(msg, embed('Success', '``'+args[1]+'`` is set to "*'+args[2]+'*"', '#43b581'));
                }
            }
            else if(typeof guildConfigs.settings[args[1]]=='string'){
                //if 2nd argument(Role name) contains spaces then it will be split in the previous message preprocessing, so need to be restored
                args[2]=args.slice(2).join(' ');
                args[2]=msg.guild.roles.cache.find((r)=>r.name.toLocaleLowerCase().includes(args[2].toLocaleLowerCase()));
                if(!args[2]) {
                    send(msg, "Penalty role not found!");
                    return;
                }
                //update cache
                guildConfigs.settings[args[1]]=""+args[2].id;
                //update db
                client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$set: {['settings.'+args[1]]: ""+args[2].id}});
                send(msg, embed('Success', '``'+args[1]+'`` is set to "*'+args[2].toString()+'*"', '#43b581'));
            }else send(msg, "You can't change this key or key doesn't exist!");
        }else {
            let entries=Object.entries(setExplain).sort((a, b)=>a[1].func>b[1].func), fields=[], title='', temp={};
            for (let [k, v] of entries) {
                if(title!=v.func){
                    title=v.func;
                    temp={"name": title, "value": '``'+k+'``: __'+(guildConfigs.settings[k]||'empty')+'__ ('+v.unit+')\n> '+v.details+'\n'};
                    fields.push(temp);
                }else{
                    temp.value+='\n``'+k+'``: __'+(guildConfigs.settings[k]||'empty')+'__ ('+v.unit+')\n> '+v.details+'\n';
                    fields[fields.length-1]=temp;
                }
            }
            send(msg, embed('Command Prompt', "You may have used the **wrong syntax** or **wrong input data**!?\nTry this: ``"+guildConfigs.prefix+this.name+" "+this.usage+"``\n\n**Key-Content**\n", '#7289da', fields), {timeoutSent: 120*1000});
        }
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+" "+this.usage+"`` - Change settings\n∘ ``"+guildConfigs.prefix+this.name+"`` - Show [key, value]\n\nThis function helps you to change some settings\nI tried to add any customizations that might be possible\nSee a list of Key-Value pairs for details";
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "``"+guildConfigs.prefix+this.name+" PENALTY_ROLE Muted`` - When the members are penalized they get \"Muted\" role"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};