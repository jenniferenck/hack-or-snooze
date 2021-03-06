const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

let stories;
let user;

// check localStorage for user on page load
let token = localStorage.getItem('HOSJWT');
let username = localStorage.getItem('HOSJWT_Username');

const $storyBoard = $('ol');
const $userProfile = $('.user-profile');

// if there's a user, grab their details
if (token && username) {
  let loggedInUser = new User(username);
  loggedInUser.loginToken = token;
  loggedInUser.retrieveDetails(details => {
    user = details;
    toggleUserView();
  });
}

/*  toggle nav links into or out of view based on login */
function toggleUserView() {
  if (user) {
    $('#submitToggle, #favoriteToggle, #displayProfile, #logoutUser').show();
  } else {
    $('#submitToggle, #favoriteToggle, #displayProfile, #logoutUser').hide();
    // remove all favorited list items
    $('li.favorite').removeClass('favorite');
  }
}

/* request all stories from API and assign to story list */
StoryList.getStories(function(response) {
  stories = response;
  console.log(stories);

  // create a copy and filter story list to 10 most recent
  const $mostRecentStories = Array.from(stories.stories).slice(0, 10);
  console.log($mostRecentStories);

  // build story list in HTML
  postStories($mostRecentStories);
});

/* show user profile */
$('#displayProfile').on('click', function() {
  // clear profile of previous data
  $userProfile.empty();

  // retrieve user data
  // $.get(`${BASE_URL}/users/${user.username}`, { token }, createUserTable)
  // favor named callbacks for documentation ^^^^

  // DON'T INVOKE!
  // $.get(`${BASE_URL}/users/${user.username}`, { token }, createUserTable())

  // might be equivalent to:
  // $.get(`${BASE_URL}/users/${user.username}`, { token }, undefined)
  $.get(`${BASE_URL}/users/${user.username}`, { token }, function(response) {
    const userTmpl = `
        <table class="table table-striped">
          <tr>
            <th>Username:</th>
            <td>${response.user.username}</td>
          </tr>
          <tr>
            <th>Name:</th>
            <td>${response.user.name}</td>
          </tr>
          <tr>
            <th>Created At:</th>
            <td>${response.user.createdAt}</td>
          </tr>
          <tr>
            <th>Favorites:</th>
            <td id="userFavorites"></td>
          </tr>
          <tr>
            <th>ownStories:</th>
            <td id="ownStories"></td>
          </tr>
        </table>
      `;

    // append template to table
    $userProfile.append(userTmpl);

    // append favorites to profile
    response.user.favorites.forEach(favorite => {
      $('#userFavorites').append(`<p class="m-0">${favorite.title}</p>`);
    });

    // append user stories to profile
    response.user.stories.forEach(story => {
      $('#ownStories').append(`<p class="m-0">${story.title}</p>`);
    });
  });
});

/* populate stories to the storyboard */
const postStories = stories => {
  // iterate over each story and append post template to storyboard
  stories.forEach(story => {
    const postTmpl = `
      <li id="${story.storyId}">
        <svg class="icon icon-star-empty star">
          <use xlink:href="#icon-star-empty"></use>
        </svg>
        <svg class="icon icon-star-full star">
          <use xlink:href="#icon-star-full"></use>
        </svg>
        <a href="javascript:void(0)">${story.title}</a> 
        <a href="javascript:void(0)" class="hostname"><small>(${
          story.url
        })</small></a>
        <small><a href="javascript:void(0)" class="remove-story">[remove]</a></small>
      </li>
    `;

    // append template to storyboard
    $storyBoard.append(postTmpl);
  });
};

/* event listener for sign up */
$('#signUpForm').on('submit', function(event) {
  event.preventDefault();

  const name = $('#signUpName').val();
  const username = $('#signUpUsername').val();
  const password = $('#signUpPassword').val();

  // create new user in API and update our local user
  User.create(username, password, name, function(newUser) {
    user = newUser;
    console.log('Created user: ', user);

    toggleUserView();

    $('#signUpName').val('');
    $('#signUpUsername').val('');
    $('#signUpPassword').val('');
  });
});

/* add event listener for login */
$('#loginForm').on('submit', function(event) {
  event.preventDefault();

  // get form field values
  const username = $('#loginFormUsername').val();
  const password = $('#loginFormPassword').val();

  // update user details
  User.login(username, password, function(response) {
    user = new User(
      response.user.username,
      response.user.password,
      response.user.name,
      response.token
    );

    // update navbar links visibility
    toggleUserView();

    // reset form fields
    $('#loginFormUsername').val('');
    $('#loginFormPassword').val('');
    console.log('Logged in: ', user);
  });
});

/* event listener for posting a new story */
$('#postNewStory').on('submit', function(event) {
  event.preventDefault();

  // get form field values
  let title = $('#title').val();
  let url = $('#url').val();

  const newStoryData = {
    title,
    author: user.name,
    url
  };

  stories.addStory(user, newStoryData, function(response) {
    console.log('Added story: ', response);

    const postTmpl = `
      <li id="${response.storyId}">
        <svg class="icon icon-star-empty star">
          <use xlink:href="#icon-star-empty"></use>
        </svg>
        <svg class="icon icon-star-full star">
          <use xlink:href="#icon-star-full"></use>
        </svg>
        <a href="javascript:void(0)">${response.title}</a> 
        <a href='javascript:void(0)' class='hostname'><small>(${
          response.url
        })</small></a>
        <small><a href="javascript:void(0)" class="remove-story">[remove]</a></small>
      </li>
    `;

    // append stories to OL
    $('ol').prepend(postTmpl);

    // reset form fields
    $('#title').val('');
    $('#url').val('');
  });
});

/* event listener for removing a story */
$('ol').on('click', '.remove-story', function() {
  const story = $(this).closest('li');
  const storyId = story.attr('id');

  // API call to remove story
  stories.removeStory(user, storyId, function(response) {
    story.remove();
    console.log('success');
  });
});

/* event listener for Favorites navbar link */
$('#favoriteToggle').on('click', 'a', function() {
  // toggle text change between "Favorites" and "Show All"
  let linkText = $(this).text();

  // if "Favorites"
  if (linkText === 'favorites') {
    // update link text
    $('#favoriteToggle')
      .find('a')
      .text('show all');

    // hide all LI elements that don't have a class of "favorite" with .hide()
    $('ol li')
      .not('.favorite')
      .hide();
  } else {
    // update link text
    $('#favoriteToggle')
      .find('a')
      .text('favorites');

    // else show all LI elements
    $('ol li').show();
  }
});

/* event listener for Favorites Star click through event delegation on the OL element */
$('ol').on('click', '.star', function() {
  if (user) {
    $(this)
      .parent('li')
      .toggleClass('favorite');

    // get parent('li') id and set to storyId
    const storyId = $(this)
      .parent('li')
      .attr('id');

    if (
      $(this)
        .parent('li')
        .hasClass('favorite')
    ) {
      // if favorited...
      // call function to add to API
      user.addFavorite(storyId, function(response) {
        console.log('Added favorite:', response);
      });
    } else {
      // if un-favorited...
      user.removeFavorite(storyId, function(response) {
        // this should include the removed favorite!
        console.log('Remove favorite: ', response);
      });
    }
  }
});

/* event listener for hostname toggle */
$('ol').on('click', '.hostname', function() {
  let currHostname = $(this).text();
  $('ol li').each(function() {
    if (
      $(this)
        .find('.hostname')
        .text() !== currHostname
    ) {
      $(this).hide();
    }
  });
});

/* logout user */
$('#logoutUser').on('click', function() {
  user = undefined;
  localStorage.clear();
  toggleUserView();
});

// function to update favorites
// retrieve user data at login or page refresh for favorites
// add to DOM

// function updateFavorites(storyIds) {
//   // go through OL story list and set all matching IDs to .favorite

//   $.get(`${BASE_URL/users/username}`,
//     {
//       user{

//       }
//     }
//   )
// }
