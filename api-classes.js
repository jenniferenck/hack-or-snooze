const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

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
    /*
    Story {
      author: "testing6667"
      storyId: "d661e762-962f-43f4-93d9-c511b9b83692"
      title: "testing again"
      url: "A Rithm Instructor"
      username: "https://www.rithmschool.com"
    }
    */
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
        localStorage.setItem('HOSJWT', token);
        localStorage.setItem('HOSJWT_Username', username);
        const newUser = new User(username, password, name, token);
        return callback(newUser);
      }
    );
  }

  static login(username, password, callback) {
    $.post(
      `${BASE_URL}/login`,
      {
        user: {
          username: username,
          password: password
        }
      },
      response => {
        localStorage.setItem('HOSJWT', response.token);
        localStorage.setItem('HOSJWT_Username', username);
        return callback(response);
      }
    );
  }

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

//     // using the `user` variable from above:
//     user.login(function(data) {
//       // should be object containing user info along with loginToken
//       // console.log(data);
//       user.retrieveDetails(function(response) {
//         // using the `user` and `storyList` variables from above:
//         var newStoryData = {
//           title: 'testing again',
//           author: 'A Rithm Instructor',
//           url: 'https://www.rithmschool.com'
//         };
//         storyList.addStory(user, newStoryData, function(response) {
//           // should be array of all stories including new story
//           var firstStory = user.ownStories[0];
//           storyList.removeStory(user, firstStory.storyId, function(response) {
//             // console.log('Deleted a story:', response);
//           });

//           var newStoryData = {
//             title: 'testing again',
//             author: 'A Rithm Instructor',
//             url: 'https://www.rithmschool.com'
//           };

//           storyList.addStory(user, newStoryData, function(response) {
//             var firstStory = user.ownStories[0];
//             user.addFavorite(firstStory.storyId, function(response) {
//               console.log(firstStory.storyId, response); // this should include the added favorite!
//             });
//           });

//           storyList.addStory(user, newStoryData, function(response) {
//             var firstStory = user.ownStories[0];
//             user.addFavorite(firstStory.storyId, function(response) {
//               user.removeFavorite(firstStory.storyId, function(response) {
//                 // this should include the removed favorite!
//                 console.log(response);
//                 var updatedData = {
//                   title: 'NO MORE TESTING!',
//                   author: 'A Rithm Instructor',
//                   url: 'https://www.taco.com'
//                 };
//                 console.log('User story:', user.ownStories[0]);
//                 user.ownStories[0].update(user, updatedData, function(
//                   response
//                 ) {
//                   console.log(response); // this should be the updated story instance!
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   }
// );
