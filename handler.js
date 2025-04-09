const { getAllPosts, getGivenPost, addPost, editPost, deletePost } = require('./utils');


module.exports.description = async (event) => {
  let method = event.httpMethod;

  if (method !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Sorry, you can observe description via GET!",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello! This is app for your blog! You can add posts here and observe them!",
    }),
  };
};

module.exports.get_posts = async (event) => {
  let path = event.path;
  let method = event.httpMethod;

  if (method !== "GET") {
    return {
      statusCode: 404,
      body: JSON.stringify({
      message: "Unknown path!",}),
    }
  }

  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return getGivenPost(title);
  } else if (method == "GET" && path === "/posts") {
    return getAllPosts();
  } else {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unknown path!" }),
    };
  }
}

module.exports.add_post = async (event) => {
  let path = event.path;
  let method = event.httpMethod;

  switch (path) {
    case "/add_post":
      if (method === "POST") {
        return addPost(JSON.parse(event.body));
      } else {
        return {
          statusCode: 405,
          body: JSON.stringify({
          message: "You can use /add_post only with POST method!",}),
        }
      }
      break;
    default:
      return {
        statusCode: 404,
        body: JSON.stringify({
        message: "Unknown path!",}),
      }
      break;
  }
};

module.exports.edit_posts = async (event) => {
  let method = event.httpMethod;

  if (method !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({
      message: "You can use /edit_posts only as PUT request!",}),
    }
  }

  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return editPost(title, JSON.parse(event.body));
  } else {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unknown path!" }),
    };
  }
}

module.exports.delete_post = async (event) => {
  let method = event.httpMethod;

  if (method !== "DELETE") {
    return {
      statusCode: 405,
      body: JSON.stringify({
      message: "You can use /delete_post only as DELETE request!",}),
    }
  }

  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return deletePost(title);
  } else {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unknown path!" }),
    };
  }
}
