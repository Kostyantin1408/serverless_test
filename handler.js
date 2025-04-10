const { getAllPosts, getGivenPost,
        addPost, editPost, deletePost,
        generatePolicy, unknownPathMessage } = require('./utils');


module.exports.description = async (event) => {
  let method = event.httpMethod;

  if (method !== "GET") return unknownPathMessage();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Hello! This is app for your blog! You can add posts here and observe them!",
    }),
  };
};

module.exports.get_posts = async (event) => {
  let path = event.path;
  let method = event.httpMethod;

  if (method !== "GET") return unknownPathMessage();

  if (path === "/posts") {
    return getAllPosts();
  } else {
    return unknownPathMessage();
  }
}

module.exports.get_unique_post = async (event) => {
  let method = event.httpMethod;

  if (method !== "GET") return unknownPathMessage();

  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return getGivenPost(title);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          message: "You can use /add_post only with POST method!",}),
        }
      }
      break;
    default:
      return unknownPathMessage();
      break;
  }
};

module.exports.edit_posts = async (event) => {
  let method = event.httpMethod;

  if (method !== "PUT") return unknownPathMessage();


  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return editPost(title, JSON.parse(event.body));
  } else {
    return unknownPathMessage();
  }
}

module.exports.delete_post = async (event) => {
  let method = event.httpMethod;

  if (method !== "DELETE") return unknownPathMessage();


  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return deletePost(title);
  } else {
    return unknownPathMessage();
  }
}


module.exports.user_authorizer = async (event) => {
  const token = event.authorizationToken;

  if (!token || token !== process.env.TOKEN) {
    return generatePolicy("anonymous", "Deny", event.methodArn);
  }
  return generatePolicy("user", "Allow", "*", { userId: "xxx" })
}
