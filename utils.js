const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand,
  PutCommand, UpdateCommand,
  DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");


const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);



const getAllPosts = async () => {
  const command = new ScanCommand({
    TableName: "posts-dev",
  });

  try {
    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: result.Items,
      }),
    };
  } catch (error) {
    console.error("DynamoDB Scan Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Could not fetch items",
        details: error.message,
      }),
    };
  }
};

const getGivenPost = async (title) => {
  const command = new GetCommand({
    TableName: "posts-dev",
    Key: { title: title },
  })

  try {
    const result = await docClient.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Post not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: result.Item }),
    };
  } catch (error) {
    console.error("DynamoDB Get Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Could not get post",
        details: error.message,
      }),
    };
  }
};

const addPost = async (data) => {
  if (!data.title || !data.post_text) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "You have to specify title and text for the post!",
      }),
    };
  }

  const command = new PutCommand({
    TableName: "posts-dev",
    Item: {
      title: data.title,
      post_text: data.post_text,
    },
  })

  try {
    const result = await docClient.send(command);
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Post created successfully",
        post_info: data,
      }),
    };
  } catch (error) {
    console.error("DynamoDB Put Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Could not create the post" }),
    };
  }
};

const editPost = async (title, data) => {
  if (!data.hasOwnProperty("title")) {
    data.title = title;
  }

  const command = new UpdateCommand({
    TableName: "posts-dev",
    Key: {
      title: title,
    },
    UpdateExpression: "SET post_text = :post_text",
    ExpressionAttributeValues: {
      ":post_text": data.post_text,
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await docClient.send(command);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Item updated",
        item: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Update failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Failed to update item", error }),
    };
  }
};

const deletePost = async (title) => {

  const command = new DeleteCommand({
    TableName: "posts-dev",
    Key: {
      title: title,
    },
  });

  try {
    await docClient.send(command);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Item deleted!",
      }),
    };
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Failed to delete item", error }),
    };
  }
};

const generatePolicy = (principalId, effect, resource, context) => {
  const authResponse = { principalId };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
  }

  if (context) {
    authResponse.context = context;
  }

  return authResponse;
};

const unknownPathMessage = () => {
  return {
    statusCode: 404,
    body: JSON.stringify({
    message: "Unknown path!",}),
  }
}

module.exports = { getAllPosts, getGivenPost, addPost, editPost, deletePost, generatePolicy, unknownPathMessage  };
