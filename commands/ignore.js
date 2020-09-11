let {isWaiting, send, client, embed} = require('../head.js');
module.exports={
    name: 'ignore',
    description: 'Manager ignore roles',
    usage: '[add | remove] [roleNameWithout@]',
    delay: 8*1000,
    used: {},
    allowMember: false,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        if(args[1]) args[1]=args[1].toLocaleLowerCase();
        if(args[2]) args[2]=args[2].toLocaleLowerCase();
        //Filter roles in guild that are in config
        /*
            roles in guild: A=[1, 2, 3]
            roles in config: B=[2, 3, 4] => it's wrong at '4', because '4' doesn't exist in guild
            1. Filter A|B: C=[2, 3]
            2. B=C. Done!
        */
        let roleIgnored=await msg.guild.roles.cache.array().filter((r)=>guildConfigs.settings.IGNORE_ROLES.includes(r.id));
        //If there is roles deleted
        if(guildConfigs.settings.IGNORE_ROLES.length>roleIgnored.length){
            //Roles do not exist will be removed from IGNORE_ROLES
            guildConfigs.settings.IGNORE_ROLES=roleIgnored.map((r)=>r.id);
            //Roles do not exist will be removed from DB
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$set: {'settings.IGNORE_ROLES': guildConfigs.settings.IGNORE_ROLES}});
        };
        //if 2nd argument(Role name) contains spaces then it will be split in the previous message preprocessing, so need to be restored
        args[2]=args.slice(2).join(' ');
        //get role object by find name
        let roleInput=msg.guild.roles.cache.find((r)=>r.name.toLocaleLowerCase().includes(args[2]));
        if(args[1]=='add'&&roleInput&&!guildConfigs.settings.IGNORE_ROLES.some((r)=>roleInput.id==r)){
            //update cache
            guildConfigs.settings.IGNORE_ROLES.push(roleInput.id);
            //update db
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$push: {'settings.IGNORE_ROLES': roleInput.id}});
            send(msg, embed('Success',`${roleInput} has been added!`, '#43b581'));
        }else if(args[1]=='remove'&&guildConfigs.settings.IGNORE_ROLES.some((r)=>roleInput.id==r)){
            //update cache
            guildConfigs.settings.IGNORE_ROLES=guildConfigs.settings.IGNORE_ROLES.filter((r)=>r!=roleInput.id);
            //update db
            client.db(process.env.DB_NAME).collection('guild').updateOne({'_id': guildConfigs['_id']}, {$pull: {'settings.IGNORE_ROLES': roleInput.id}});
            send(msg, embed('Success',`${roleInput} has been removed!`, '#43b581'));
        }else send(msg, embed('Command Prompt', "You may have used the **wrong syntax** or **wrong input data**!?\nTry again: ``"+guildConfigs.prefix+this.name+" "+this.usage+"``\n\n"+'**Roles were ignored**\n'+roleIgnored.join(', ')+'\n**Roles in server**\n'+msg.guild.roles.cache.array().join(', '), '#7289da'), {deleteMsg: false});
    },
    descriptions: function(guildConfigs){
        return "∘ ``"+guildConfigs.prefix+this.name+" add [roleName]`` - Add role to ignored list\n∘ ``"+guildConfigs.prefix+this.name+" remove [roleName]`` - Remove role from ignored list\n∘ ``"+guildConfigs.prefix+this.name+"`` - Show ignored roles list\n\nThe member whose role is ignored will not be checked\n"
    },
    fields: function(guildConfigs){
        return [
            {
              "name": "Example",
              "value": "``"+guildConfigs.prefix+this.name+" add NITRO`` - The members whose **NITRO** role will be ignored, they are allowed to spam, send media, send profane words in any channel\n``"+guildConfigs.prefix+this.name+" remove NITRO`` - Remove NITRO from ignored list"
            },
            {
              "name": "Author",
              "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+"send [yourQuestion]``\n💙 I'm always in here to help you!"
            }
        ];
    }
};