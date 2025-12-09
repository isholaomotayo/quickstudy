# APIs for Total learning manager

## List of packages and their functions

- Fastify - NodeJS server framework for developing server applications
- KnexJS - Database configuration drive for NodeJS that handles various operations like migration and seeding
- Boom - Error handling module
- Bookshelf - ORM wrapper for Knexjs
- pg - Postgres database for nodejs
- sendgrid - Email management module
- BcrpytJS - Password hash manager
- UUID - Random string generator packager
- fastify-\* - various fastify plugins like cookie parser et.c
- pino-pretty - for logger

This application is made up of 5 major components.

- Database configurations found in a db folder
- Documentation folder that contains the configurations for the API DOCS using Swagger.
- Controller folder which is a container that holds the various controllers for the models
- Route folder that holds all the routes of each endpoint exposed via the API.
- Models folder that hold all the models available in this application.

Other folders contained within this application provide utility and support methods and functions.

Development pattern of the API follows the CRUD / [GET, POST, PUT, DELETE] api pattern.

### The entry of this application is an index.js file contained at the root directory.

## Naming Strategy

The naming patterns in this application were intentionally used to provide developers and future maintainers
with clear and easy understanding about the intent of what the methods and functions contained in such files
are. An example is a User file in the models folder. Such a file contains object relationship and definition
for the user types available in the file.

It is also important to note the casing strategy used in the application.

For Models, file names are capitalised as in _S_ in *S*tudent
For files in controllers, documentation and routes, files are named using the as in _studentController_
For database table names and their respective columns, naming strategy employed is snake*case as in \_student_result*

Each database table name maps correctly to it's respective controller, documentation, route e.g.

---

| student_test| studentTestController | studentTestDocs | studentTestRoutes |

The config folder contains knexjs and swagger configurations. For knexjs, a connection.js file exists and for swagger,
a swagger.js file exist.

The logs folder contains application logs which can be very useful for debugging.

The api folder contains the serverless configuration used to deploy the application.

The email folder contains email templates used in the application.

## Authorization and Permissions

Authorization mechanism employed to this infastracture is the role based authorization.

Users are given access to a particular endpoint by explicitly passing their roles to the checkAccess methods and
calling the method in the controller that handles that endpoint.

Users who are not authorized to access such endpoint due to a lack of role or lesser role ranking would recieve
a 401 unauthorized error.

To make an endpoint available to the public, ignore the use of calling the checkAccess in such a controller.
This would expose that endpoint for access or query by the public.

## List of Environment Variables Needed

- NODE_ENV - current environment the node application is running e.g testing, development, production.
- DB_NAME - database name
- DB_PASSWORD
- DB_USER
- DB_HOST
- DB_CLIENT
- DB_PORT
- PORT
- JWTSECRET
- PAGESIZE
- LOG_LEVEL e.g. info
- NAME
- API_URL
- FRONTEND_URL
- SENDGRID_API_KEY
- SUPPORT_EMAIL
- EN_KEY - encrpytion key
- SERVER_ENV - server environment e.g testing, local

## Setup Instructions

- Clone repository from github
- Checkout to a new branch (never work on testing/production directly)
- Ensure you have all necessary environmental variables available
- Run `npm i` to install all node packages
- Startup server using `npm run dev`
- Start developing

Once development has been completed

- Pull latest changes from both testing and release production before pushing to github
- Push to the new branch and create pull request on testing branch

## Deployment Instructions

There are 3 environments upon which this application infrastructure lives.

- Local
- Tesitng
- Production

No environment is to be skipped ahead of the other. Development is done on local environment.
Features and changes are shipped to the testing envrionment to test local changes and how it
works in an online environment. Changes are moved to production only when end to end testing by
product team asserts the changes as without faults.

### For testing environment

- Ensure you've merged all requested branches and most importantly production.
- Testing environment deployment configuration is contained in the `testing-now.json` file
- If migrations exist, change local database configuration to testing configuration
  and run `knex migrate:latest`. Change db config back to local.
- Copy content of `testing-now.json` into `now.json` and run `now`.
- Wait for first build process to finish, test link provided.
- Once build is confirmed then run `now --prod`.
- Revert `now.json` to original file content and push to github.
- Once end to end testing is complete by product team with 100% feature correctness score,
  create a pull request for production.

### For production envrionemnt

Deployment on production is facilitated through automatic builds from vercel anytime changes or
pull requests are made on the `release/production` branch.

Deployment environment deployment configuration is contained in the `now.json` file.

Pull requests made from testing if merged would get deployed to production. It is important the
contents of `now.json` are production environment variables before making a pull request on production
from testing.

- Once first build has completed, test url endpoint provided. If no issues are found, push the
  build to production.

# Wishing you all the very best. T.P.O
