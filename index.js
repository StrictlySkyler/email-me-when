#!/usr/bin/env node

var program = require('commander');
var nodemailer = require('nodemailer');
var os = require('os');
var exec = require('child_process').execSync;
var moment = require('moment');
var command_to_execute;
var message;
var recipients;
var start;
var end;
var duration;
var exit_code = 0;
var text;
var transporter;

program
  .version('1.0.0')
  .usage('[options] "<command to execute>"')
  .description(
    'A simple utility which executes a command and emails you when it finishes.'
  )
  .option('-s, --smtp [smtp.gmail.com]', 'The DNS record for the SMTP server.')
  .option(
    '-u, --user [ex@ample.com]',
    'The username for the SMTP server.',
    encodeURIComponent
  )
  .option(
    '-p, --password [password]',
    'Password for the SMTP server username',
    encodeURIComponent
  )
  .option(
    '-r, --recipients [foo@bar.com,baz@bar.com]', 'Recipients to email.  ' +
      'Defaults to the username used for the SMTP server.'
  )
  .action(function () {
    var args = Array.prototype.slice.call(arguments);
    args.pop();
    command_to_execute = args.join(' ');
  })
  .parse(process.argv)
;

if (program.recipients) {
  recipients = program.recipients.split(',').join(', ');
}

transporter = nodemailer.createTransport(
  'smtps://' + program.user + ':' + program.password + '@' + program.smtp
);

message = {
  from: 'email-me-when <emw@' + (program.domain || os.hostname()) + '>',
  to: (recipients || decodeURIComponent(program.user)),
  subject: 'Task exited: ' + command_to_execute
};

start = Date.now();

try {
  exec(command_to_execute);

} catch (err) {

  exit_code = err.status;
} finally {

  end = Date.now();
  duration = moment.duration(end - start);
}

text = 'Task started: ' +
  moment(start).format("dddd, MMMM Do YYYY, h:mm:ss a") + '\n' +
  'Task ended: ' + moment(end).format("dddd, MMMM Do YYYY, h:mm:ss a") + '\n' +
  'Duration: ' + duration.humanize() + '\n' +
  'Exit code: ' + exit_code
;

message.text = text;

transporter.sendMail(message, function (err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log('Message sent.', info.response);
  }

});
