const BASE_URL = "https://hack-or-snooze-v2.herokuapp.com";

let stories;
let user;

// check localStorage for user on page load
let token = localStorage.getItem('HOSJWT');
let username = localStorage.getItem('HOSJWT_Username');

const $storyBoard = $('ol');

// if there's a user, grab their details
if (token && username) {
  let loggedInUser = new User(username);
  loggedInUser.loginToken = token;
  loggedInUser.retrieveDetails(details => {
    user = details;
    toggleUserView();
  });
}

function toggleUserView() {
  // if (user) {
  //   $('#submitToggle, #favoriteToggle').show();
  // } else {
  //   $('#submitToggle, #favoriteToggle').hide();
  // }
}

// request all stories from API and assign to story list
StoryList.getStories(function(response) {
  stories = response;
  console.log(stories);

  // create a copy and filter story list to 10 most recent
  const $mostRecentStories = Array.from(stories.stories).slice(0, 10);
  console.log($mostRecentStories);

  // build story list in HTML
  postStories($mostRecentStories);
});

// // populate stories to the storyboard
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
        <a href="#">${story.title}</a> <a href="${
      story.url
    }" class="hostname"><small>(${story.url})</small></a>
      </li>
    `;

    $storyBoard.append(postTmpl);
  });
};

// add event listener for sign up
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

// add event listener for login
$('#loginForm').on('submit', function(event) {
  event.preventDefault();

  const username = $('#loginFormUsername').val();
  const password = $('#loginFormPassword').val();

  User.login(username, password, function(response) {
    user = new User(
      response.user.username,
      response.user.password,
      response.user.name,
      response.token
    );

    toggleUserView();
    $('#loginFormUsername').val('');
    $('#loginFormPassword').val('');
    console.log('Logged in: ', user);
  });
});

// add event listener for posting a new story
$('#postNewStory').on('submit', function(event) {
  event.preventDefault();

  let title = $('#title').val();
  let url = $('#url').val();

  const newStoryData = {
    title,
    author: user.name,
    url
  };

  stories.addStory(user, newStoryData, function(response) {
    console.log('Added story: ', response);
  });

  const postTmpl = `
    <li>
      <svg class="icon icon-star-empty star">
        <use xlink:href="#icon-star-empty"></use>
      </svg>
      <svg class="icon icon-star-full star">
        <use xlink:href="#icon-star-full"></use>
      </svg>
      <a href="#">${title}</a> <a href='#' class='hostname'><small>(${url})</small></a>
    </li>
  `;

  $('ol').append(postTmpl);
});

// add event listener for Favorites link
$('#favoriteToggle').on('click', 'a', function() {
  // toggle text change between "Favorites" and "Show All"
  let linkText = $(this).text();

  // if "Favorites"
  if (linkText === 'favorites') {
    // update link text
    $('#favoriteToggle').find('a').text('show all');

    // hide all LI elements that don't have a class of "favorite" with .hide()
    $('ol li')
      .not('.favorite')
      .hide();
  } else {
    // update link text
    $('#favoriteToggle').find('a').text('favorites');

    // else show all LI elements
    $('ol li').show();
  }
});

// add event listener for Favorites Star click through event delegation on the OL element
$('ol').on('click', '.star', function() {
  if (user){

    $(this)
    .parent('li')
    .toggleClass('favorite');
    
    // get parent('li') id and set to storyId
    const storyId = $(this).parent('li').attr('id');
    
    
    if($(this).parent('li').hasClass('favorite')){
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

// add event listener for hostname
// get hostname val
// hide not val
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
