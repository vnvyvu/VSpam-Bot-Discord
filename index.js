let {fs, Discord, bot, send, client, run, profane, nomedia, spam, embed} = require('./head.js');
require('dotenv').config();

//Init commands: Read from "commands" folder
bot.commands=new Discord.Collection();
let commandFiles=fs.readdirSync('./commands').filter((f=>f.endsWith('.js'))), command;
for (let file of commandFiles) {
    command=require(`./commands/${file}`);
    bot.commands[command.name]=command;
}

//Init guilds
let guilds;
run(()=>{
    client.db(process.env.DB_NAME).collection('guild').find().toArray((err, res)=>{
        if(err) throw err;
        guilds=res;
    });
});

//Init warn, msg contain image/video
let warns=new Discord.Collection(), noMediaInterval=new Discord.Collection(), spamMap=new Discord.Collection();

//Bot first join
bot.on('guildCreate', async guild => {
    //Init prefix
    let temp;
    guilds.push(temp={'_id': guild.id,'prefix': 'v!', 'badwords': [], 'lang': {
        "PROFANE_NOTIFY": "%tag% said: %msg%\nYou will be penalized for profaning more than **%times%** times\n See badwords list to avoid!\n",
        "PROFANE_NOTIFY_TITLE": "Dirty Man",
        "SPAM_NOTIFY": "%tag% You got 1 warn for your spam messages",
        "SPAM_NOTIFY_TITLE": "Sewing Machine",
        "PENALTY_NOTIFY": "%tag% got %penalty% for **%time%s**",
        "PENALTY_NOTIFY_TITLE": "Jail",
        "CMD_CLEAR_SUCC": "**%amount%** messages deleted! (Sorry, I can't delete messages older than 2 weeks)",
        "CMD_CLEAR_SUCC_TITLE": "Recycling",
        "WAITING": "Please wait **%time%s** to use again!",
        "WAITING_TITLE": "Wait Me",
        "BADWORDS_VIEW": "%list%",
        "BADWORDS_VIEW_TITLE": "Bad Words",
        "NOMEDIA_NOTIFY": "%tag% You're restricted from sending messages containing **images/videos** in this channel\nYou must to delete it after **%minute%** minutes!",
        "NOMEDIA_NOTIFY_TITLE": "Notice Me"
        
    }, 'settings':{
        "IGNORE_ROLES": [],
        "NOMEDIA_CHANNELS": [],
        "NOMEDIA_TIMEOUT": 300,
        "PROFANE_CHANNELS": [],
        "SPAM_CHANNELS": [],
        "MAX_MESSAGES": 6,
        "DUPLICATE_MESSAGES": 4,
        "INTERVAL": 5,
        "WARN_LIMIT": 5,
        "WARN_COOLDOWN": 180,
        "PENALTY_ROLE": "",
        "PENALTY_COUNTDOWN": 3600,
    }});
    await client.db(process.env.DB_NAME).collection('guild').insertOne(temp);
});

//guild delete
bot.on('guildDelete', async guild => {
    await client.db(process.env.DB_NAME).collection('guild').deleteOne({'_id': guild.id});
});

//User send message event handle
bot.on('message',async msg => {
    //Check msg in dm
    //Check author is a bot
    if(msg.author.bot||msg.channel.type=='dm') return;
    //Get configs of this guild
    let guildConfigs=await guilds.filter((c)=>c['_id']==msg.guild.id)[0];
    //User fogot prefix
    if(msg.mentions.users.array().includes(bot.user)){
        send(msg, embed('Hula!', "My prefix is: ``"+guildConfigs.prefix+"``", '#6ff56c'));
        return;
    }
    //Message normalize
    msg.content=msg.content.trim();
    //Check inactive channels
    if(msg.content.toLocaleLowerCase().indexOf(guildConfigs.prefix)==0){//Is message contains prefix at start!?
        let args = msg.content.slice(guildConfigs.prefix.length).trim().split(/ +/g);//Remove prefix and split args
        args[0]=args[0].toLocaleLowerCase();
        if(bot.commands[args[0]]){//Is command list contains command from message?
            //Is command allow member to use? and Adminitrator can use all commands
            if(args[0]=='help') args.push(bot.commands);
            if(msg.member.hasPermission('ADMINISTRATOR')) bot.commands[args[0]].execute(guildConfigs, msg, args);
            else if(bot.commands[args[0]].allowMember) bot.commands[args[0]].execute(guildConfigs, msg, args);
            else send(msg, "😭 You **don't** have permission to use this command!");
        }else send(msg, "This command not found!");
    //author haven't inactive role will be check
    }else if(!msg.member.roles.cache.some((r)=>guildConfigs.settings.IGNORE_ROLES.includes(r.id))){
        profane(guildConfigs, msg, warns);
        spam(guildConfigs, msg, warns, spamMap);
        nomedia(guildConfigs, msg, warns, noMediaInterval);
    }
});

//message delete event handle
bot.on('messageDelete', async msgDelete=>{
    if(noMediaInterval[msgDelete]) clearTimeout(noMediaInterval[msgDelete]);
});

//bot status
bot.on('ready', ()=>{
    bot.user.setPresence({
        status: 'idle',
        activity: {
            name: "trong thùng rác!",
            type: "PLAYING",
        },
    });
    //bot.user.setActivity('in the garbage', {name: 'PLAYING'});
});

bot.login(process.env.VSPAM_BOT_TOKEN);