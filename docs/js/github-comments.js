// use of ajax vs getJSON for headers use to get markdown (body vs body_htmml)
// todo: pages, configure issue url, open in new window?

function ParseLinkHeader(link) {
  if (link === null) {
    return {};
  }

  const entries = link.split(",");
  const links = {};

  for (const i in entries) {
    const entry = entries[i];

    const link = {};
    link.name = entry.match(/rel=\"([^\"]*)/)[1];
    link.url = entry.match(/<([^>]*)/)[1];
    link.page = entry.match(/page=(\d+).*$/)[1];

    links[link.name] = link;
  }
  return links;
}

function DoGithubComments(comment_id, page_id) {
  const repo_name = "omegaphoenix/omegaphoenix.github.com";

  if (page_id === undefined) page_id = 1;

  const api_url = `https://api.github.com/repos/${repo_name}`;
  const api_issue_url = `${api_url}/issues/${comment_id}`;
  const api_comments_url = `${api_url}/issues/${comment_id}/comments?page=${page_id}`;

  const url =
    `https://github.com/${repo_name}/issues/${comment_id}`;

  $(document).ready(function() {
    $.getJSON(api_issue_url, function(data) {
      NbComments = data.comments;
    });

    $.ajax(api_comments_url, {
      headers: { Accept: "application/vnd.github.v3.html+json" },
      dataType: "json",

      success: function(comments, textStatus, jqXHR) {
        // Add post button to first page
        if (page_id == 1)
          $("#gh-comments-list").append(
            "<a href='" +
              url +
              "#new_comment_field' rel='nofollow' class='btn'>Post a comment on Github</a>"
          );

        // Individual comments
        $.each(comments, function(i, comment) {
          const date = new Date(comment.created_at);

          let t = "<div id='gh-comment'>";
          t += "<img src='" + comment.user.avatar_url + "' width='24px'>";
          t +=
            "<b><a href='" +
            comment.user.html_url +
            "'>" +
            comment.user.login +
            "</a></b>";
          t += " posted at ";
          t += "<em>" + date.toUTCString() + "</em>";
          t += "<div id='gh-comment-hr'></div>";
          t += comment.body_html;
          t += "</div>";
          
          $("#gh-comments-list").append(t);
        });

        // Setup comments button if there are more pages to display
        const links = ParseLinkHeader(jqXHR.getResponseHeader("Link"));
        if ("next" in links) {
          $("#gh-load-comments").attr(
            "onclick",
            `DoGithubComments(${comment_id},${page_id + 1});`
          );

          $("#gh-load-comments").show();
        } else {
          $("#gh-load-comments").hide();
        }
      },
      error: function() {
        $("#gh-comments-list").append(
          "Comments are not open for this post yet."
        );
      }
    });
  });
}