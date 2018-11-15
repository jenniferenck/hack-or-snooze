const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';
let storyList;

class StoryList {
  constructor(stories) {
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
  addStory(user, entryData, callback) {
    $.post(
      `${BASE_URL}/stories`,
      { token: user.loginToken, story: entryData },
      response => {
        const { author, title, url, username, storyId } = response.story;
        const newStory = new Story(author, title, url, username, storyId);
        this.stories.push(newStory);
        user.retrieveDetails(() => callback(newStory));
      }
    );
  }

  removeStory(user, storyId, callback) {
    $.ajax({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'DELETE',
      data: {
        token: user.loginToken
      },
      success: response => {
        const storyIndex = this.stories.findIndex(
          story => story.storyId === storyId
        );
        storyList.stories.splice(storyIndex, 1);
        user.retrieveDetails(() => callback(this));
      }
    });
  }
}

class User {
  constructor(username, password, name, loginToken) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.loginToken = loginToken;
    this.favorites = [];
    this.ownStories = [];
  }

  static create(username, password, name, callback) {
    $.post(
      `${BASE_URL}/signup`,
      {
        user: {
          username,
          password,
          name
        }
      },
      function(response) {
        const { token } = response;
        const { username, name } = response.user;
        // localStorage goes here
        const newUser = new User(username, password, name, token);
        return callback(newUser);
      }
    );
  }

  login(callback) {
    $.post(
      `${BASE_URL}/login`,
      {
        user: {
          username: this.username,
          password: this.password
        }
      },
      response => {
        this.loginToken = response.token;
        // localStorage goes here
        return callback(response);
      }
    );
  }

  retrieveDetails(callback) {
    $.get(
      `${BASE_URL}/users/${this.username}?token=${this.loginToken}`,
      response => {
        this.name = response.user.name;
        this.favorites = response.user.favorites;
        this.ownStories = response.user.stories;
        return callback(this);
      }
    );
  }
}

// constructor of each story instance from the API
class Story {
  constructor(author, title, url, username, storyId) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
  }
}

// invoking static function
StoryList.getStories(function(response) {
  storyList = response;
});

let user;
User.create(
  `testing${Math.floor(Math.random() * 10000)}`,
  `testing${Math.floor(Math.random() * 10000)}`,
  `testing${Math.floor(Math.random() * 10000)}`,

  function(newUser) {
    // this should be object containing newly created user
    user = newUser;
    // using the `user` variable from above:
    user.login(function(data) {
      // should be object containing user info along with loginToken
      // console.log(data);
      user.retrieveDetails(function(response) {
        // using the `user` and `storyList` variables from above:
        var newStoryData = {
          title: 'testing again',
          author: 'A Rithm Instructor',
          url: 'https://www.rithmschool.com'
        };
        storyList.addStory(user, newStoryData, function(response) {
          // should be array of all stories including new story
          console.log('Created a story: ', response);

          var firstStory = user.ownStories[0];
          console.log('firstStory: ', firstStory.storyId);

          storyList.removeStory(user, firstStory.storyId, function(response) {
            console.log('Deleted a story:', response);
          });
        });
      });
    });
  }
);
