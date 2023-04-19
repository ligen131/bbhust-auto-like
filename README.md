# BBHust-Auto-Like

A simple script for BBHust to automatically like every new posts.

https://bb.hust.online

## Usage

**You need to ensure your environment version `node >= 18` and `npm >= 9.6.4`.**

Copy `config/config-default.json` to `config/config.json`, and fill in your student ID and password.

```json
{
  "person_id": "U202123456",
  "password": "your-password-here"
}
```

Then run

```shell
$ npm i
$ npn run start
```

## LICENSE

GNU General Public License v3.0