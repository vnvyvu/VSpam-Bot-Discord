let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'badwords',
    description: 'Badwords manager!',
    usage: '[add | remove] [list of words separated by 1 comma]',
    delay: 15*1000,
    used: {},
    allowMember: true,
    execute: async function(guildConfigs, msg, args) {
        if(isWaiting(guildConfigs, msg, this)) return;
        //author is a admin and args[1] does exist
        if(args[1]) args[1]=args[1].toLocaleLowerCase();
        if(args[2]) args[2]=args[2].toLocaleLowerCase();
        if(args[1]&&msg.member.hasPermission('ADMINISTRATOR')){
            if(!args[2]) {
                send(msg,"Follow: "+guildConfigs.prefix+this.name+' '+this.usage, {'timeoutSent': 10000});
                return;
            }
            //get all words, input ex: a,b,c=>output: [a,b,c]
            let words=await args[2].split(/[,]+/g);
            if(args[1]=="add"){
                //update cache
                guildConfigs.badwords.push(...words);
                //update db
                client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$push: {'badwords': {$each: words}}});
                send(msg, embed('Success', '||'+words.join(', ')+' || added!', '#43b581'));
            }
            else if(args[1]=="remove"){
                //update cache
                guildConfigs.badwords=guildConfigs.badwords.filter((w)=>!words.includes(w));
                //update db
                client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$pull: {'badwords': {$in: words}}});
                send(msg, embed('Success', '||'+words.join(', ')+' || removed!', '#43b581'));
            }else send(msg, embed('Command Prompt', "You may have used the **wrong syntax** or **wrong input data**!?\nTry again: ``"+guildConfigs.prefix+this.name+" "+this.usage+"``", '#7289da'),);
        }else send(msg, embed(guildConfigs.lang.BADWORDS_VIEW_TITLE, guildConfigs.lang.BADWORDS_VIEW.replace('%list%', '||'+guildConfigs.badwords.join(', '))+' ||', 7506394), {'timeoutSent': guildConfigs.badwords.length*100+12000});
    },
    descriptions: function(guildConfigs){
        return "\n∘ ``"+guildConfigs.prefix+this.name+"`` - Show a list of forbidden words\n∘ ``"+guildConfigs.prefix+this.name+" add [words]`` - Add more words to list\n∘ ``"+guildConfigs.prefix+this.name+" remove [words]`` - Remove words from list"
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "``"+guildConfigs.prefix+this.name+" add cat,dog,mouse`` - cat,dog,mouse will be added\nbadwords=[cat, dog, mouse]\n``"+guildConfigs.prefix+this.name+" remove cat,mouse`` - cat,mouse will be removed if exist\nbadwords=[dog]\nUsers will be warned if they send messages containing these words"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};