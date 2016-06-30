#!/usr/bin/env node

var program = require('commander');
var nodemailer = require('nodemailer');
var os = require('os');
var exec = require('child_process').exec;
var moment = require('moment');
var command_to_execute;
var message;
var recipients;
var start;
var end;
var duration;
var text;
var transporter;
var command;

program
  .version('1.0.2')
  .usage('[options] "<command to execute>"')
  .description(
    'email-me-when: ' +
    'A simple utility which executes a command and emails you when it finishes.'
  )
  .option(
    '-s, --smtp [smtp.gmail.com]',
    'The DNS record for the SMTP server.  Required.'
  )
  .option(
    '-u, --user [ex@ample.com]',
    'The username for the SMTP server. Required.',
    encodeURIComponent
  )
  .option(
    '-p, --password [password]',
    'Password for the SMTP server username.  Required.',
    encodeURIComponent
  )
  .option(
    '-r, --recipients [foo@bar.com,baz@bar.com]', 'Recipients to email.  ' +
      'Defaults to the SMTP username.'
  )
  .action(function () {
    var args = Array.prototype.slice.call(arguments);
    args.pop();
    args = args[0];
    command_to_execute = args;
  })
  .parse(process.argv)
;

if (
  ! program.user ||
  ! program.password ||
  ! program.smtp ||
  ! command_to_execute
) {
  program.help();
}

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

command = exec(command_to_execute);

command.stdout.setEncoding('utf8');
command.stderr.setEncoding('utf8');

command.stdout.on('data', function (data) {
  console.log(data);
});

command.stderr.on('data', function (data) {
  console.error(data);
});

command.on('exit', function (code) {

  end = Date.now();
  duration = moment.duration(end - start);

  text = 'Started: ' +
    moment(start).format("dddd, MMMM Do YYYY, h:mm:ss a") + '\n' +
    'Ended: ' + moment(end).format("dddd, MMMM Do YYYY, h:mm:ss a") + '\n' +
    'Duration: ' + duration.humanize() + '\n' +
    'Exit code: ' + code
  ;

  console.log('Results for:', command_to_execute);
  console.log(text);

  message.text = text;

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.error(err);
    } else {
      console.log('Message sent.', info.response);
    }

  });
});

