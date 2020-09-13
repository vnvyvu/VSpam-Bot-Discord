let Discord, send, warn, embed, bot, Profane= require('./lib/profane.js');
const MongoClient=require('mongodb').MongoClient
require('dotenv').config();
module.exports={
    //Load file utils
    'fs': fs=require('fs'),
    //Load Discord lib
    'Discord': Discord=require('discord.js-light'),
    //Load Bot object
    'bot': bot=new Discord.Client({cacheGuilds: true, cacheChannels: true, cacheRoles: true,}),
    //Send message to textchannel
    'send': send=async (msg, message, options)=>{
        //Make sure the outgoing message will always be embed
        if(typeof message=="string") message=await embed('Error', message, '#faa61a');
        msg.channel.send(message).then(async sent=>{
            //init default of options and update if has new options
            options=Object.assign({timeoutSent: 30000, timeoutMsg: 10000, deleteSent: true, deleteMsg: true}, options);
            if(options.deleteSent) sent.delete({'timeout': options.timeoutSent}).catch(err=>{});
            if(options.deleteMsg) msg.delete({'timeout': options.timeoutMsg}).catch(err=>{});
        }
    )},
    //Command cooldown
    'isWaiting': (guildConfigs, msg, cmd)=>{
        let waiting=true;
        if(!cmd.used[msg.author.id]){//user not in waiting list
            cmd.used[msg.author.id]=Date.now()+cmd.delay;//add user to waitting list
            setTimeout(()=>delete cmd.used[msg.author.id], cmd.delay);//after delay time, user will be removed from waiting list
            waiting=false;
        }else send(msg, embed(guildConfigs.lang.WAITING_TITLE, guildConfigs.lang.WAITING.replace('%time%', parseFloat(cmd.used[msg.author.id]/1000-Date.now()/1000).toFixed(3)), 16426522));
        return waiting;
    },
    //MongoDB client init
    'client': new MongoClient(`mongodb+srv://vyvu:${process.env.DB_PASS}@vbot.fmhdt.gcp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }),
    //Connect to MongoDB, Have problems with async, Only close the connection when the bot stops working
    'run': async function (callback){
        await module.exports.client.connect();
        callback();
    },
    //Execute member warnings
    'warn': warn=async (guildConfigs, msg, warns, penaltyNow=false) => {
        //Make sure warns is not undefined
        warns[[guildConfigs['_id'], msg.author.id]]=warns[[guildConfigs['_id'], msg.author.id]]||{};
        //add to warn list
        warns[[guildConfigs['_id'], msg.author.id]]={"times": (warns[[guildConfigs['_id'], msg.author.id]].times||0)+1, "id": warns[[guildConfigs['_id'], msg.author.id]].id||0};
        //check limit range, member was received warn more than limited
        if(warns[[guildConfigs['_id'], msg.author.id]].times>guildConfigs.settings.WARN_LIMIT||penaltyNow) {
            let penaltyRole=await msg.guild.roles.cache.get(guildConfigs.settings.PENALTY_ROLE);
            //Penalty exception! Penalty role has not been set
            if(!penaltyRole) {send(msg, "Penalty role not found! Please set ``PENALTY_ROLE``!");return;}
            //Add penalty role
            msg.member.roles.add(penaltyRole).then(()=>{
                //Send penalty message
                send(msg, embed(guildConfigs.lang.PENALTY_NOTIFY_TITLE, guildConfigs.lang.PENALTY_NOTIFY.replace('%tag%', msg.member.toString()).replace('%penalty%', penaltyRole).replace('%time%', guildConfigs.settings.PENALTY_COUNTDOWN), 15746887), {deleteMsg: false, timeoutSent: 30000});
                //Clear old interval
                if(warns[[guildConfigs['_id'], msg.author.id]].id) clearInterval(warns[[guildConfigs['_id'], msg.author.id]].id);
                //Cooldown penalty
                warns[[guildConfigs['_id'], msg.author.id]].id=setTimeout(()=>{
                    //Remove penalty role
                    msg.member.roles.remove(penaltyRole);
                    warns[[guildConfigs['_id'], msg.author.id]]={};
                }, guildConfigs.settings.PENALTY_COUNTDOWN*1000);
            }).catch(async err=>{
                let botName=await bot.fetchApplication().then(clientApp=>clientApp.name);
                send(msg, msg.guild.roles.cache.array().find((r)=>r.name==botName).toString()+" role position should be **higher** than "+penaltyRole.toString()+"\nGo to settings, drag and drop to done!");
            });
        }else{
            //Refresh cooldown
            //Clear old interval
            if(warns[[guildConfigs['_id'], msg.author.id]].id) clearInterval(warns[[guildConfigs['_id'], msg.author.id]].id);
            //Set new interval
            warns[[guildConfigs['_id'], msg.author.id]].id=setTimeout(()=>warns[[guildConfigs['_id'], msg.author.id]]={}, guildConfigs.settings.WARN_COOLDOWN*1000);
        }
    },
    //Execute check profane
    'profane':async (guildConfigs, msg, warns)=>{
        let check=new Profane({firstLetter: true});
        check.addWords(...guildConfigs.badwords);
        if(guildConfigs.settings.PROFANE_CHANNELS.includes(msg.channel.id)) return;
        //Check profane
        if(check.isProfane(msg.content)){
            //delete profane
            msg.delete();
            //bot send warn message
            send(msg, embed(guildConfigs.lang.PROFANE_NOTIFY_TITLE, guildConfigs.lang.PROFANE_NOTIFY.replace('%tag%', msg.author.toString()).replace('%msg%', check.clean(msg.content)).replace('%times%', guildConfigs.settings.WARN_LIMIT), 16426522), {deleteMsg: false});
            //warn process
            warn(guildConfigs, msg, warns);
        }
    },
    //Execute check nomedia
    'nomedia':async (guildConfigs, msg, warns, noMediaInterval)=>{
        //If channel allow media
        if(!guildConfigs.settings.NOMEDIA_CHANNELS.includes(msg.channel.id)) return;
        //check attachment in message
        if(msg.attachments.size>0){
            //Send warn message
            send(msg, embed(guildConfigs.lang.NOMEDIA_NOTIFY_TITLE, guildConfigs.lang.NOMEDIA_NOTIFY.replace('%tag%', msg.member).replace('%minute%', guildConfigs.settings.NOMEDIA_TIMEOUT/60), 16426522),{deleteMsg: false});
            //Warn if message is not deleted
            noMediaInterval[msg]=setTimeout(()=>{//Save interval id for cancel it when msg deleted
                //The member will immediately receive penalty
                warn(guildConfigs, msg, warns, true);
                msg.delete();
            }, guildConfigs.settings.NOMEDIA_TIMEOUT*1000);
        }
    },
    //Execute check spam
    'spam': async (guildConfigs, msg, warns, spamMap) => {
        //If channel allow media=>return
        if(guildConfigs.settings.SPAM_CHANNELS.includes(msg.channel.id)) return;
        //Init spamMap to advoid undefined
        spamMap[[guildConfigs['_id'], msg.author.id]]=spamMap[[guildConfigs['_id'], msg.author.id]]||{msgs: []};
        //Add msg to map
        spamMap[[guildConfigs['_id'], msg.author.id]].msgs.push(msg);
        //Check number of messages and duplicate messages are bigger than settings
        if(spamMap[[guildConfigs['_id'], msg.author.id]].msgs.length>=guildConfigs.settings.MAX_MESSAGES||maxDup(spamMap[[guildConfigs['_id'], msg.author.id]].msgs)>=guildConfigs.settings.DUPLICATE_MESSAGES){
            //Send warn message
            send(msg, embed(guildConfigs.lang.SPAM_NOTIFY_TITLE, guildConfigs.lang.SPAM_NOTIFY.replace('%tag%', msg.member).replace('%minute%', guildConfigs.settings.NOMEDIA_TIMEOUT), '#faa61a'),{deleteMsg: false});

            warn(guildConfigs, msg, warns);
            clearInterval(spamMap[[guildConfigs['_id'], msg.author.id]].interval);
            delete spamMap[[guildConfigs['_id'], msg.author.id]];
        }else{
            //delete old interval
            if(spamMap[[guildConfigs['_id'], msg.author.id]].interval) clearInterval(spamMap[[guildConfigs['_id'], msg.author.id]].interval);
            //create new interval
            //if interval countdown to 0 then delete(user have been stop sending message)
            spamMap[[guildConfigs['_id'], msg.author.id]].interval=await setTimeout(()=>delete spamMap[[guildConfigs['_id'], msg.author.id]], guildConfigs.settings.INTERVAL*1000);
        }
    },
    //Default embed
    'embed': embed=(title, description, color, fields)=>{
        return new Discord.MessageEmbed({
            "title": `**${title}**`,
            "description": description,
            "color": color,
            "footer": {
              "text": "From @VyVu with 💓",
              "icon_url": "https://media.giphy.com/media/XGJTdS0YakU9BdSAhb/giphy.gif"
            },
            "timestamp": Date.now(),
            "fields": fields||'',
        });
    },
    //Explain the meaning of the keys
    setExplain:{
        NOMEDIA_TIMEOUT: {'func': 'Nomedia', 'details': 'Countdown in *NOMEDIA_TIMEOUT* seconds after a member sends a message containing media, if he don\'t delete it, will receive *PENALTY_ROLE*', 'unit': 'seconds'},
        MAX_MESSAGES: {'func': 'Spam', 'details': 'Maximum number of messages a member can send during *INTERVAL* period, if exceeded they will receive a warn', 'unit': 'messages'},
        DUPLICATE_MESSAGES: {'func': 'Spam', 'details': 'Number of duplicated messages allowed to appear, if exceeded, member will receive a warn', 'unit': 'messages'},
        INTERVAL: {'func': 'Spam', 'details': 'When members send messages they will be put on the list of suspected spam, after *INTERVAL* period, they will be freed', 'unit': 'seconds'},
        WARN_LIMIT: {'func': 'Warn', 'details': 'Maximum number of times a member can receive a warn, if exceeded they will receive *PENALTY_ROLE*', 'unit': 'warns'},
        WARN_COOLDOWN: {'func': 'Warn', 'details': 'The amount of time since the member was last warned, after that time the number of the member\'s warning returned to 0', 'unit': 'seconds'},
        PENALTY_ROLE: {'func': 'Penalty', 'details': 'The role will be similar to penalty, after  *PENALTY_COUNTDOWN* period, the penalty is done.', 'unit': 'role'},
        PENALTY_COUNTDOWN: {'func': 'Penalty', 'details': 'Penalty period', 'unit': 'seconds'},
    },
    defaultConfigs: (guild)=>{return {'_id': guild.id,'prefix': 'v!', 'badwords': [], 'lang': {
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
    }}},
};
//Trash function, 
function maxDup(arr){
    let res={};
    for (const i of arr) {
        res[i.content]=(res[i.content]||0)+1;
    }
    return Math.max(...Object.values(res));
}