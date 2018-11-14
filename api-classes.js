const BASE_URL = "https://hack-or-snooze-v2.herokuapp.com";
let stories;

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
      return cb(storyList);
    });
  }
}

class User {
  constructor(username, password, name, loginToken, favorites = [], ownStories){
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
      console.log(response);
      const { token, favorites, ownStories } = response; // data request from the API
      const user = new User(username, password, name, token, favorites, ownStories); // creating a new instance from the aggregate data from API and new user
      return callback(user);
    });

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
  stories = response;
});

let user;
User.create("ChaCha", "hey", "Whiskey", function(response){
  user = response;
});
