// dependencies
const Discord = require('discord.js')
const { getFiles } = require('./utils')
const axios = require('axios')
const CronJobb = require('cron').CronJob

const TOKEN = process.env.WAIFUTOKEN
const pre = '/' // what we use for the bot commands (nor for all of them tho)

let bot = new Discord.Client() // the bot itself
let previousMemes = [] // tmp variable so we don't repeat memes two times in a row

const randomRapiMessages = [
	`You’re too quiet, Commander, is everything alright?`,
	`Commander, Anis was just joking with the Christmas present…`,
	`Commander! When it's the next mission?`,
	`Please take care next time you go to the surface Commander.`,
	`Don't push yourself too hard Commander!`,
	`No matter what you think of us, we'll always be by your side.`,
	`Commander, I'll protect you.`,
]

// Bot commands object
// The name has to be lowercase
const botCommands = {
	nikke: {
		name: pre + 'nikke',
		async execute(msg, args) {
			// Pick image from folder
			let files = await getFiles('./public/images/nikke/')
			// Get Random
			let randomMeme = files[Math.floor(Math.random() * files.length)]

			while (previousMemes.includes(randomMeme.path) === true){
				randomMeme = files[Math.floor(Math.random() * files.length)]
			}

			previousMemes.push(randomMeme.path)
			if (previousMemes.length > files.length / 2) {
				previousMemes.splice(0, 5)
			}
		
			msg.reply({
				files: [{
					attachment: randomMeme.path,
				}],
				content: `- ${randomMeme.name}`,
			})
		}
	},
	diff: {
		name: pre + 'youtube',
		execute(msg, args) {
			msg.channel.send('https://www.youtube.com/@lootandwaifus')
		}
	},
	rules: {
		name: pre + 'rules',
		execute(msg, args) {
			msg.channel.send(`<:sure:1056601190726651985> SERVER RULES <:sure:1056601190726651985>

➜ Try to follow the rules or you'll get banned by Rapi
➜ Don't be racist
➜ Don't be a dick in general 
➜ Feel free to share your content on <#1054761687779123270>
➜ Suggest new memes, videos or anything in <#1055127265656193044>
`)
		}
	},
	help: {
		name: pre + 'help',
		execute(msg, args) {
			msg.channel.send(`<:vegesmug:1056608088037265539> CUSTOM COMMANDS <:vegesmug:1056608088037265539> \n
➜ **/rules** : follow them or you'll get banned by Rapi  
➜ **/help** : list of commands for all Commanders 
➜ **/nikke** : random Nikke memes from the community 
➜ **/youtube** : subscribe to the best YouTube channel 
➜ **good girl** : say thanks to the best girl & bot in this server 
➜ **wrong girl** : hey, take care who you talk to  
➜ **bad girl** : we all wanted to slap her  
➜ **reward?** : 10 gems!?  
\n
I’m an open source Nikke so if you want to upgrade me or see how I work, you can do so here: https://github.com/mascarell/lootandwaifus
`)
		}
	},
	goodgirl: {
		name: 'good girl',
		description: 'good girl Rapi',
		execute(msg, args) {
			msg.channel.send('Thank you Commander.')
		}
	},
	wronggirl: {
		name: 'wrong girl',
		description: 'wrong girl Rapi',
		execute(msg, args) {
			msg.reply({
				files: [{
					attachment: 'https://i.imgur.com/rQPg8Ja.png',
				}],
				content: `(￢з￢) Well well, so you DO see us that way, interesting!`,
			})
		}
	},
	badgirl: {
		name: 'bad girl',
		description: 'bad girl',
		execute(msg, args) {
			msg.reply({
				files: [{
					attachment: 'https://i.imgur.com/6htltYd.gif',
				}],
			})
		}
	},
	reward: {
		name: 'reward?',
		description: 'reward?',
		execute(msg, args) {
			msg.reply({
				files: [{
					attachment: 'https://i.imgur.com/sWUuYyb.jpg',
				}],
			})
		}
	},
}

function initDiscordBot() {	
	if (bot) new Error('Bot is already initialized, use getBot()')
		
	// Set commands
	bot.commands = new Discord.Collection()
	Object.keys(botCommands).map(key => {
		bot.commands.set(botCommands[key].name, botCommands[key])
	})

	// Set the rich presence activity of the bot
	bot.on('ready', () => {
		bot.user.setActivity('SIMULATION ROOM', { type: 'PLAYING' })
	})

	// Login the bot
	bot.login(TOKEN)

	// Greet new users when they join the server
	bot.on('guildMemberAdd', member => {
		let guild = bot.guilds.cache.get('1054761356416528475')
		const channel = guild.channels.cache.find(ch => ch.name === 'welcome')
		channel.send(`Welcome Commander ${member}, please take care when going to the surface.`)
	})

	// Send random messages in #nikke channel to increase engagement every 6 hours
	let nikkeMessage = new CronJobb(
		// '* * * * *',
		'0 */4 * * *',
		function () {
			let guild = bot.guilds.cache.get('1054761356416528475')
			const channel = guild.channels.cache.find(ch => ch.name === 'general')
			if (!channel) return
			channel.send(randomRapiMessages[Math.floor(Math.random() * randomRapiMessages.length)])
		}
	)
	nikkeMessage.start()

	// On message, find command and execute
	bot.on('message', message => {
		// Get message from param and turn lowercase
		let msg = message
		let guild = bot.guilds.cache.get('1054761356416528475')
		let user = guild.member(msg.author.id)

		msg.content = message.content.toLowerCase()

		// Not the best way, but here we collect reactions for the roles
		if (message.content === '!roles' && user.roles.cache.find(r => r.name === "Captain")) {
			message.channel.send(`Get your roles here Commander. \n
🍑 : Nikke 
🔞 : Degenerate (nsfw channel) 
💖 : YouTube (youtube alerts) 
📰 : Updates (server & misc updates) \n
( ͡° ͜ʖ ͡°)  
`).then(sentMessage => {
				sentMessage.react('🍑')
				sentMessage.react('🔞')
				sentMessage.react('💖')
				sentMessage.react('📰')

				// Add role when reacting to the message
				bot.on('messageReactionAdd', (reaction, user, sentMessage) => {
					let roleName
					guild.members.fetch(user.id).then(member => {
						switch (reaction.emoji.name) {
							case '🍑':
								roleName = "Nikke"
								break
							case '🔞':
								roleName = "Degenerate"
								break
							case '💖':
								roleName = "YouTube"
								break
							case '📰':
								roleName = "Updates"
								break
						}

						member.roles.add(member.guild.roles.cache.find(role => role.name === roleName)) // Add role
					})
				})

				// Remove role when reacting to the message
				bot.on('messageReactionRemove', (reaction, user, sentMessage) => {
					let roleName
					guild.members.fetch(user.id).then(member => {
						switch (reaction.emoji.name) {
							case '🍑':
								roleName = "Nikke"
								break
							case '🔞':
								roleName = "Degenerate"
								break
							case '💖':
								roleName = "YouTube"
								break
							case '📰':
								roleName = "Updates"
								break
						}

						member.roles.remove(member.guild.roles.cache.find(role => role.name === roleName)) // Add role
					})
				})
			})
		}

		// Establish arguments
		let args = []
		if (msg[0] === pre) {
			// if command contains prefix, get arguments
			args = msg.content.split(/ +/)
		} else {
			// else, the first argument, is the entire message
			args = [msg.content]
		}

		const command = args.shift().toLowerCase()

		if (!bot.commands.has(command)) return

		try {
			bot.commands.get(command).execute(msg, args)
		} catch (error) {
			console.error(error)
			msg.reply('RIP BOT BRO 💩')
		}
	})
}

function getDiscordBot() {
	if (bot) {
		return bot
	} else {
		new Error('Bot is not initialized')
	}
}

module.exports = {
	initDiscordBot,
	getDiscordBot,
}