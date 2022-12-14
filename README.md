# What is Jordgames?

See [live demo](https://jordgames.hoie.kim)!

# How do I run Jordgames?

## Option 1: Using Docker

Pull latest released image from [hoie/jordgames](https://hub.docker.com/r/hoie/jordgames).

```
docker pull hoie/jordgames
```

Run!

```
docker run -p 3003:3003 hoie/jordgames
```

Now Jordgames app should be live [here](http://localhost:3003). Take a look!

## Option 2: Using Node.js

First, download Jordgames with this command in your terminal. This command will create `jordgames` folder and download all files in this repository.

```
git clone https://github.com/hoiekim/jordgames.git
```

Make sure you have [npm](https://npmjs.com) installed in your machine and available in your terminal. Then use this command to install Jordgames.

```
cd jordgames
npm install
```

Then use this command to run Jordgames.

```
npm start
```

Now Jordgames app should be live [here](http://localhost:3003). Take a look!

# How to contribute

Create an [issue](https://github.com/hoiekim/jordgames/issues/new) and explain how you want to improve this project. Or send us an email to jordgames@hoie.kim if you feel shy. We welcome your ideas!
