let jsotp = require('jsotp');

if(process.argv.length < 3) { console.log(`Please provide a key!`); process.exit(-1) }
let totp = jsotp.TOTP(process.argv[2]);
console.log(`Your OTP is: ${totp.now()}`);