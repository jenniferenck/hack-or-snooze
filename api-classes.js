const BASE_URL = "https://hack-or-snooze-v2.herokuapp.com";
let storyList;

class StoryList {
  constructor(stories){
    this.stories = stories;
  }

  // grabs the complete storylist and creates individual story instances to be access later
  static getStories(cb) {
    $.getJSON(`${BASE_URL}/stories`, function(response) {
      const stories = response.stories.map(function(story) {
        const { username, title, author, url, storyId } = story;
        return new Story(username, title, author, url, storyId);
      });
      const storyList = new StoryList(stories);
      return cb(storyList); // return response from API, now you can proceed
    });
  }

  // parameters: 
  addStory(user, entryData, callback){
    $.post(`${BASE_URL}/stories`, 
    {"token": user.loginToken, "story": entryData }, 
    function(response){
      user.retrieveDetails(function(response){
        console.log(response);
        user.ownStories.push(response.user.stories[0]);// for now, assuming only one item in the array
      })
    });
  }
}

class User {
  constructor(username, password, name, loginToken = "", favorites = [], ownStories = []){
    this.username = username;
    this.password = password;
    this.name = name;
    this.loginToken = loginToken;
    this.favorites = favorites;
    this.ownStories = ownStories;
  }

  static create(username, password, name, callback){
    $.post(`${BASE_URL}/signup`, 
    { "user":{"name":name,"username":username,"password":password} },
    function(response){
      const { token } = response; // data request from the API
      const user = new User(username, password, name, token); // creating a new instance from the aggregate data from API and new user
      return callback(user);
    });
  }

  login(callback){
    $.post(
      `${BASE_URL}/login`, 
      {
        "user": {
            "username": this.username,
            "password": this.password
        }
      },
      function(response){
        console.log(response);
        this.loginToken = response.token;
        return callback(response);
      }
    )
  }

  retrieveDetails(callback){
    $.get(`${BASE_URL}/users/${this.username}?token=${this.loginToken}`,
    function(response){
      this.favorites = response.favorites;
      this.ownStories =response.ownStories;
      return callback(response);
    })
  }
}


// constructor of each story instance from the API
class Story {
  constructor(author, title, url, username, storyId){
    this.author = author; 
    this.title = title; 
    this.url = url; 
    this.username = username; 
    this.storyId = storyId;
  }
}

// invoking static function 
StoryList.getStories(function(response){
  storyList = response;
});

let user;
User.create(
  `testing${Math.floor(Math.random() * 10000)}`,
  `testing${Math.floor(Math.random() * 10000)}`,
  `testing${Math.floor(Math.random() * 10000)}`,
  
  function (newUser) {
    // this should be object containing newly created user
    user = newUser;
    // console.log(user);
    // using the `user` variable from above:
    user.login(function (data) {
      // should be object containing user info along with loginToken
      // console.log(data);
      user.retrieveDetails(function (response){
      // console.log(response) // this should be the user
        // using the `user` and `storyList` variables from above:
        var newStoryData = {title: "testing again",
        author: "A Rithm Instructor",
        url: "https://www.rithmschool.com"};
        storyList.addStory(user, newStoryData, function (response) {
        // should be array of all stories including new story
        console.log(response);
        // should be array of all stories written by user
        console.log(user.stories);
        })
      });
    });
  }
);


