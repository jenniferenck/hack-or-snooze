let stories;
let user;
const $storyBoard = $('ol');

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
    console.log(user);
  });
});

// add event listener for login
$('#loginForm').on('submit', function(event) {
  event.preventDefault();

  const username = $('#loginFormUsername').val();
  const password = $('#loginFormPassword').val();

  User.login(username, password, function(response) {
    console.log(response);
    user = response.user;
    user.loginToken = response.token;
    console.log(user);
  });
});

// add event listener for posting a new story
$('#postNewStory').on('submit', function(event) {
  event.preventDefault();

  let title = $('#title').val();
  let url = $('#url').val();

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
$('#favoriteToggle').on('click', function() {
  // toggle text change between "Favorites" and "Show All"
  let linkText = $(this).text();

  // if "Favorites"
  if (linkText === 'favorites') {
    // update link text
    $('#favoriteToggle').text('show all');

    // hide all LI elements that don't have a class of "favorite" with .hide()
    $('ol li')
      .not('.favorite')
      .hide();
  } else {
    // update link text
    $('#favoriteToggle').text('favorites');

    // else show all LI elements
    $('ol li').show();
  }
});

// add event listener for Favorites Star click through event delegation on the OL element
$('ol').on('click', '.star', function() {
  $(this)
    .parent('li')
    .toggleClass('favorite');
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
