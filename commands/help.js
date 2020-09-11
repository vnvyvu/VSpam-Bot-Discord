let {isWaiting, send, embed} = require('../head.js');
module.exports={
    name: 'help',
    description: 'This is me :zany_face:',
    usage: '[command]',
    used: {},
    delay: 5*1000,
    allowMember: true,
    execute: async function(guildConfigs, msg, args){
        if(isWaiting(guildConfigs, msg, this)) return;
        let cmds=args[args.length-1];
        if(typeof args[1]=="string") args[1]=args[1].toLocaleLowerCase();
        if (args[1]&&args[1]!='help'&&args[1]!='send'&&cmds[args[1]]) {
            let title=cmds[args[1]].name.replace(/^./, cmds[args[1]].name[0].toLocaleUpperCase())+' Help', descriptions=cmds[args[1]].descriptions(guildConfigs), fields=cmds[args[1]].fields(guildConfigs);
            send(msg, embed(title, descriptions, '#7289da', fields), {timeoutSent: 120*1000});
        }
        else{
            send(msg, embed('Bot Catalog', '**Hi '+msg.member.toString()+'!**\n📌 You can use ``'+guildConfigs.prefix+this.name+' '+this.usage+'`` to know more about the commands\n', '#7289da', [
                {
                    "name": "Commands",
                    "value": [cmdHelp(guildConfigs, cmds)],
                },
                {
                    "name": "Author",
                    "value": "💻 I'm coding for fun!\n:question: Any question, ``"+guildConfigs.prefix+cmds['send'].name+" "+cmds['send'].usage+"``\n💙 I'm always in here to help you!"
                }]
            ));
        }
    }
};
function cmdHelp(guildConfigs, cmds){
    let res=">>> ", temp=Object.entries(cmds);
    for (let [name, cmd] of temp) {
        res+="``"+guildConfigs.prefix+name+"`` -"+cmd.description+"\n";
    }
    return res;
}