# Backend server for the human intelligence server

## Introduction
This is the backend server that will call the human intelligence marketplace (Mechanical Turk for now).

## 2 Step Deployment
We deploy to heroku in 2 easy steps!

1.) Set up a new project in heroku first
2.) Then run the following
```shell script
git push heroku master
heroku git:remote -a <project name>
heroku run rake db:migrate
```

Make sure that your client code now reference this new server url! (in settings.js in the client project)

## Customization of the backend
You can actually prequalify a user first before having them submit something -- this could be useful to weed out the people who for example don't have a good command of the lauguage you are trying to translate to, for example.

For more information on how to do this, please consult the how to [create a qualification](https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateQualificationTypeOperation.html).


