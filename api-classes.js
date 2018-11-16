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
        stories.stories.splice(storyIndex, 1);
        //  ^^^^^^^ use `this`
        // run the callback with currenty StoryList instance
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
        localStorage.setItem('HOSJWT', token);
        localStorage.setItem('HOSJWT_Username', username);
        const newUser = new User(username, password, name, token);
        return callback(newUser); // <-- running callback with an instance of User
      }
    );
  }

  static login(username, password, callback) {
    $.post(
      `${BASE_URL}/login`,
      {
        user: {
          username,
          password
        }
      },
      response => {
        localStorage.setItem('HOSJWT', response.token);
        localStorage.setItem('HOSJWT_Username', username);
        return callback(response); // <-- NOT running callback with an instance of User
      }
    );
  }

  // favor this over global user
  addFavorite(storyId, callback) {
    $.ajax({
      url: `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
      method: 'POST',
      data: {
        token: user.loginToken
      },
      success: () => {
        user.retrieveDetails(() => callback(this));
      }
    });
  }

  // favor this over global user
  removeFavorite(storyId, callback) {
    $.ajax({
      url: `${BASE_URL}/users/${user.username}/favorites/${storyId}`,
      method: 'DELETE',
      data: {
        token: user.loginToken
      },
      success: () => {
        user.retrieveDetails(() => callback(this));
      },
      error: response => {
        console.log(response);
      }
    });
  }

  retrieveDetails(callback) {
    $.get(
      `${BASE_URL}/users/${this.username}?token=${this.loginToken}`,
      response => {
        this.name = response.user.name;
        this.favorites = response.user.favorites.map(story => {
          return new Story(
            story.author,
            story.title,
            story.url,
            story.username,
            story.storyId
          );
        });
        this.ownStories = response.user.stories.map(story => {
          return new Story(
            story.author,
            story.title,
            story.url,
            story.username,
            story.storyId
          );
        });
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

  update(user, storyData, callback) {
    $.ajax({
      url: `${BASE_URL}/stories/${this.storyId}`,
      method: 'PATCH',
      data: {
        token: user.loginToken,
        story: storyData
      },
      success: response => {
        const { author, title, url } = response.story;
        this.author = author;
        this.title = title;
        this.url = url;
        return callback(this);
      }
    });
  }
}
