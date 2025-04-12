const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand,
  PutCommand, UpdateCommand,
  DeleteCommand, ScanCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb");
const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");


const eventBridge = new EventBridgeClient({ region: 'us-east-1' });
const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "posts_with_categories";


const getAllEntries = async (table_name) => {
  const command = new ScanCommand({
    TableName: table_name,
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
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'title = :title',
    ExpressionAttributeValues: {
      ':title': title
    }
  });

  try {
    const result = await docClient.send(command);

    if (!result.Items) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Post not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: result.Items }),
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
  if (!data.title || !data.post_text || !data.category) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "You have to specify title and text for the post!",
      }),
    };
  }

  const eventDetail = {
    category: data.category
  };

  const params = {
    Entries: [
      {
        Source: 'com.mycompany.category.new_post',
        DetailType: 'post_created',
        Detail: JSON.stringify(eventDetail),
        EventBusName: 'default'
      }
    ]
  };

  const eventCommand = new PutEventsCommand(params);
  

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      category: data.category,
      title: data.title,
      post_text: data.post_text,
    },
  })

  try {
    await addCategory(data);
    await eventBridge.send(eventCommand);
    await docClient.send(command);
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

const editPost = async (category, title, data) => {
  if (!data.hasOwnProperty("title") || !data.hasOwnProperty("category")) {
    data.title = title;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      category: category,
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

const deletePost = async (category, title) => {

  const eventDetail = {
    category: category
  };

  const params = {
    Entries: [
      {
        Source: 'com.mycompany.category.new_post',
        DetailType: 'post_deleted',
        Detail: JSON.stringify(eventDetail),
        EventBusName: 'default'
      }
    ]
  };

  const eventCommand = new PutEventsCommand(params);


  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      category: category,
      title: title,
    },
  });

  try { 
    await eventBridge.send(eventCommand);
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

const getPostsByCategory = async (category) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "category = :category",
    ExpressionAttributeValues: {
      ":category": category,
    },
  });

  try {
    const result = await docClient.send(command);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts: result.Items }),
    };
  } catch (error) {
    console.error("DynamoDB Query Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Could not query posts by category",
        details: error.message,
      }),
    };
  }
}

const increseCategoryCounter = async (category) => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      category: category,
      title: "#"
    },
    UpdateExpression: "ADD category_counter :incr",
    ExpressionAttributeValues: {
      ":incr": 1, 
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await docClient.send(command);
    console.log("Updated counter:", result);
  } catch (error) {
    console.error("Failed to update counter:", error);
  }
}

const decreaseCategoryCounter = async (category) => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      category: category,
      title: "#"
    },
    UpdateExpression: "ADD category_counter :incr",
    ExpressionAttributeValues: {
      ":incr": -1, 
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await docClient.send(command);
    console.log("Updated counter:", result);
  } catch (error) {
    console.error("Failed to update counter:", error);
  }
}

const addCategory = async (data) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      category: data.category,
      title: "#",
      category_counter: 0
    },
    ConditionExpression: "attribute_not_exists(category) AND attribute_not_exists(title)"
  })

  try {
    await docClient.send(command);
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Category added successfully",
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
}

const getCategoryCounters = async () => {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });
  try {
    const result = await docClient.send(command);
    let categories_counters = {};
    for (let elem of result.Items) {
      console.log(elem);
      console.log(elem.title === "#");
      if (elem.title === "#") {
        categories_counters[elem.category] = elem.category_counter;
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories: categories_counters,
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
}

const unknownPathMessage = () => {
  return {
    statusCode: 404,
    body: JSON.stringify({
    message: "Unknown path!",}),
  }
}

module.exports = { getAllEntries, getGivenPost, addPost,
   editPost, deletePost, generatePolicy, 
   unknownPathMessage, getPostsByCategory, increseCategoryCounter, 
   decreaseCategoryCounter, addCategory, getCategoryCounters  };
