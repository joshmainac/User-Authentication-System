const { authenticate } = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

//to initialize strategy(passport.use) we must 1)choseStrategy 2)Create Authfunction(need multiple done)

//Initialize will be called as initializepassport in server.js
//arguments:passport(instance),arrow-f(getUserByEmail),arrow-f(getUserByid)
//
function initialize(passport, getUserByEmail, getUserById) {
  //1)declare authenticateUser,this will be used as passport.authenticate in server.js,call done() end funtion
  const authenticateUser = async (email, password, done) => {
    //find user by email from  database
    const user = getUserByEmail(email);
    //if No user with that email. done(err?,user_found?,message)
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }
    //if getUserByEmail works
    //use password(input) & user.password(saved in database)
    try {
      //correct password
      if (await bcrypt.compare(password, user.password)) {
        console.log("correct");
        return done(null, user);
      }
      //incorrect password,the message is the flash message
      else {
        console.log("password incorrect");
        return done(null, false, { message: "password incorrect" });
      }
    } catch (e) {
      //somethimg went wrong
      console.log("weird error");
      return done(e);
    }
  };

  //2)set passport.use, passport.serializeUser,passport.deserializeUser
  //declare which passport strategy to use,overwrite usernameField: "email" for the POST,which function you want to call to authenticate the user
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  //store(in id) user in session (make cookie from id and pass it to client)
  passport.serializeUser((user, done) => done(null, user.id));
  //un-store(in id) user from session
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initialize;
