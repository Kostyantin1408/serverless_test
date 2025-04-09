# Posts console app
## To observe the description use:
```
https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/
```
or 
```
https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/description
```

## To add new post use:
```
curl --header "Content-Type: application/json" \
--request POST \
--data '{"title":"Autumn","post_text":"New story about autumn"}' \
https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/add_post
```
or use postman, as you prefer.

## To observe exect post use:
```
https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/post/Autumn
```
or any other name of the post, you've created. Take into account, use %20 if spaces present in title.

## To observe all posts use:
```
https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/posts
```

## To change already existing post:
```
curl -X PUT -H "Content-Type: application/json" -d '{"post_text":"Let it be another story"}' https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/edit_posts/Autumn
```

## To delete existing post simply:
```
curl -X DELETE "https://do1j23q5y6.execute-api.us-east-1.amazonaws.com/dev/delete_post/Autumn"
```