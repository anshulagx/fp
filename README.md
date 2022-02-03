# YouTube API Assignment

[DEMO Web Dashboard](https://fp-yt.herokuapp.com/)

[DEMO Swagger API](https://fp-yt.herokuapp.com/docs/)

## Running locally

Clone the repository using: `git clone https://github.com/anshulagx/fp.git`
Change to project directory by `cd fp`.

Install all the dependencies (including the dev dependencies) using the `npm install` or `npm i` command. Create a .env file and add all the environment variables to the file. Once the dependencies are installed, use `npm start` to start the server.

### The `.env` file

The `.env` file holds the important variables. Refer `.env.sample` file to get the structure of the .env file

### Multiple Google API keys

You can specify multiple Google API keys to avoid quota exceeded errors. To do this, specify them as a single string, separated using `,` (comma). Example:

`GOOGLE_API_KEY = 'KEY1,KEY2,KEY3,KEY4'`

### Mongo Atlas Search Index

Using MongoDB Atlas web interface, create a search index using the following JSON config. If indexes are not created, the search function will not work.

```
{
  "mappings": {
    "dynamic": true
  }
}
```
