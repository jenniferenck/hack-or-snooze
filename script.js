$(document).ready(function() {
  // add event listener for Form
  $('form').on('submit', function(event) {
    event.preventDefault();

    let title = $('#title').val();
    let url = $('#url').val();

    let postTmpl = `
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
});
