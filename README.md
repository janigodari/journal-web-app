### Journal Web App

Journal is a web app built with Nodejs and MongoDB.

#### Features:

- Login/Register

- Create a journal entery

- Delete a journal entery

- Diplsay all journal enteries

Demo: https://journal-app-demo.herokuapp.com



#### Setup: [ Tested on Ubuntu 21.10]

##### Requirements:

- Nodejs

- MongoDB

- Npm



1.  Clone github repository

2. Inside the cloned repository run ``npm install``  to install all dependencies

3. Start MongoDB `sudo systemctl start mongod`
   
   - If your running old versions of linux use `sudo service mongod start`
   
   - For MacOs follow instructions [here](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/#std-label-run-with-homebrew)
   
   - For Windows [here](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-as-a-windows-service)

4. Run the app `node app.js`

5. Open browser and go to http://localhost:8000



#### To connect to [MongoDB Cloud ](https://cloud.mongodb.com)

Change the code from this:

`mongoose.connect("mongodb://localhost:27017/journalDB", {useNewUrlParser: true, useUnifiedTopology: true});`

To this:

`mongoose.connect("mongodb+srv://<username>:<password>@<address>?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});`

Username , password & address are give when setting up database on mongodb cloud, and can also be accessed after database is created

#### Deploying to [Heroku](https://www.heroku.com/)

##### Requirements:

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

App is very simple to deply to heroku, just follow the instructions on heroku website after creating a new app



[ Journal Web App was created after finishing Web Development Course on Udemy]


