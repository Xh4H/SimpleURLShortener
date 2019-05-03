const readlineSync = require('readline-sync');
const fs = require('fs');
const mariadb = require('mariadb');
const colors = require('colors');
var crypto = require('crypto');

// Load DB connection details
var dbConfig = JSON.parse(fs.readFileSync('shortener_config.json'));
var hash_length;

// Functions
const log = (input) => console.log("[Shortener] " + input);
const ask = (what, hide) => {
	return readlineSync.question("[Shortener] " + what, {
		hideEchoBack: hide != undefined ? hide : false // Hide user input (passwords)
	})
};

function generateStructure(conn) {
	const DROP_QUERY = "DROP TABLE IF EXISTS \`shortener_urls\`;";
	const CREATE_QUERY = `CREATE TABLE \`shortener_urls\` (
			\`id\` int(11) NOT NULL AUTO_INCREMENT,
			\`hash\` varchar(`+ hash_length + `) NOT NULL,
			\`url\` varchar(400) NOT NULL,
			\`ip\` varchar(15) NOT NULL,
			PRIMARY KEY (\`id\`)
		);`;

	conn.query(DROP_QUERY);
	conn.query(CREATE_QUERY)
		.then(() => {
			log("Structure created. Exiting...");
			process.kill(1);
		})
}

function modifyDBDetails() {
	log("DB connection details are wrong. Please fix them.".red);
	ask("Whenever you have edited 'shortener_config.json' please press ENTER: ");
	dbConfig = JSON.parse(fs.readFileSync('shortener_config.json'));
	log("Attempting another connection...".yellow);

	openConnection();
}

function openConnection() {
	log("Needed DB structure will be created.".green);
	log("Opening a connection to the DB...".green);

	createPool()
		.then((conn) => generateStructure(conn))
		.catch((e) => {
			log("An error has occurred.".red)
			log(e)
			modifyDBDetails();
		});
}

function createPool() {
	let pool = mariadb.createPool({
		host: dbConfig.host,
		port: dbConfig.port,
		user: dbConfig.username,
		password: dbConfig.password,
		database: dbConfig.database
	});

	return pool.getConnection();
}

function askLength() {
	log("Choose the length of the hash used in shortened URLs.".green);
	let MAX = 30, MIN = 5, value = 10, key;
	console.log('\n\n' + (new Array(10)).join(' ') +
		'[Z] <- -> [X]  WHEN FINISHED PRESS: [SPACE]\n');

	while (true) {
		console.log('\x1B[1A\x1B[K' +
			(new Array(13)).join(' ') + "|" +
			(new Array(value + 1)).join('-') + 'O' +
			(new Array(MAX - value + 1)).join('-') + '| ' + value);

		key = readlineSync.keyIn('',
			{hideEchoBack: true, mask: '', limit: 'zx '});

		if (key === 'z') { if (value > MIN) { value--; } }
		else if (key === 'x') { if (value < MAX) { value++; } }
		else { break; }
	}

	return value;
}

let createStructure;
let unexpectedInput = false;

while (createStructure !== "" && createStructure !== "y" && createStructure !== "n") {
	if (unexpectedInput) log("Excuse me, I did not expect that answer...".yellow);

	createStructure = ask("Should I create the database structure? (Y/N) [Y by default]: ").toLowerCase();
	unexpectedInput = true // Destroyed when the loop is finished
}

delete unexpectedInput;
createStructure = !createStructure.includes("n"); // Whether we should create the structure

if (createStructure) {
	hash_length = parseInt(askLength());
	let hash = crypto.createHash('sha256').update("someurlgoeshere" + (+ new Date())).digest("hex").substring(0, hash_length);
	log("Example of a shortened url: https://www.mydomain.com/shorten?hash=" + hash);

	// Update settings
	dbConfig.length = hash_length;
	fs.writeFileSync('shortener_config.json', JSON.stringify(dbConfig, null, 4), 'utf8');
	openConnection();
} else {
	log("Exiting...");
}