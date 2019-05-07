<h1 align="center">SimpleURLShortener</h1>
<h3 align="center">A simple and open source solution to deploy a URL shortener anywhere</h3>

<p align="center">
  <img src="http://forthebadge.com/images/badges/built-with-love.svg"/>
  <img src="http://forthebadge.com/images/badges/uses-js.svg"/>
  <img src="https://forthebadge.com/images/badges/gluten-free.svg"/>

  <img src="https://xh4h.com/img/upload/20190506153239.gif"/>
</p>

## Live working version
I used this privately for a long time, now it is open to the public: https://xh4h.com/shorten

## What is "SimpleURLShortener"?
SimpleURLShortener is a lightweight and open sourced URL Shortener which aims to be easily deployed in any server running Express.

I was sick of full-of-ads shorteners and volatile shortened URLs, and since many more people are in the same situation, I decided to develop this project.

## How to install
1. Download [latest release](https://github.com/Xh4H/SimpleURLShortener/releases).
1. Open and edit `shortener_config.json` by filling the connection details to your DB.
1. run `npm install && npm run-script setup` to prepare the environment
1. run `node start` to start the service.

Service will be running in `ip/shorten`.
