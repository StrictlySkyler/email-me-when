```
$ emw -h

  Usage: emw [options] "<command to execute>"

  email-me-when: A simple utility which executes a command and emails you when it finishes.

  Options:

    -h, --help                                  output usage information
    -V, --version                               output the version number
    -s, --smtp [smtp.gmail.com]                 The DNS record for the SMTP server.
    -u, --user [ex@ample.com]                   The username for the SMTP server.
    -p, --password [password]                   Password for the SMTP server username
    -r, --recipients [foo@bar.com,baz@bar.com]  Recipients to email.  Defaults to the SMTP username.
```

Installation: `npm i -g emw`

Given an example usage such as:

```
emw -s smtp.gmail.com -u example@gmail.com -p "example password" -r you@example.com "sleep 5; exit 0;"
```

You would receive an email titled: "Task exited: sleep 5; exit 0;", with the following contents:

```
Started: Wednesday, July 27th 2016, 9:08:28 am
Ended: Wednesday, July 27th 2016, 9:08:33 am
Duration: a few seconds
Exit code: 0
```

Enjoy!
