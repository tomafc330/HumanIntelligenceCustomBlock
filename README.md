# Human Inteligence Custom Block

## Inspiration
As an indie game developer, we have limited resource as we are a small studio. Therefore, we fork out some of the small piecemeal work to third party workers via Amazon Mechanical Turk. Amazon Mechanical Turk (MTurk) is a marketplace for completion of virtual tasks that requires human intelligence. The Mechanical Turk service gives businesses access to a diverse, on-demand, scalable workforce and gives Workers a selection of thousands of tasks to complete whenever it's convenient.

Prior to discovering Airtable, we were using manual spreadsheets to keep track of tasks that the third parties on the Amazon human intelligence were doing for us and tracking the results manually, and the whole process was tedious and messy.

## What it does

With the Human Intelligence Remote Block, it is now possible to add in some manual processing by human intelligence to Airtable. The block is extensible enough to allow for many use cases that need some human intervention and processing.

We strive to eat our own dog food with a few specific use cases that we are doing:

Use Case 1.) Since we are located in Canada and there are 2 official languages (English and French), we need customized localizations for our apps and games (Google Translate doesn't do a good enough of a job. Thus we use actual humans via Amazon Mechanical Turk to help us translate our texts in the app for us.

Use Case 2.) We are constantly prospecting other companies to do partnerships with us, so we have a sales spreadsheet that we use to email prospects. What we found was that the reply rate was much higher if we can add some context about the company we're emailing, and thus our other use case involves getting a third party to do some research about a recent news/noteworthy event for that company we are looking to engage with. Again Airtable is a great help here, as it allows us to automatically create and upload tasks to Mechanical Turk and to retrieve the responses from these human intelligence workers and use it in our spreadsheet.

While building this block, we realize we need to be flexible since Airtable supports many different use cases (which is why Airtable is much better than a spreadsheet), so we created a way for people to create custom templates (ie. instructions to workers) that they can use for their use case prior to sending to Mechanical Turk. Thus, true to the spirit of Airtable, we allow users to create their own tasks that they want to post to the Mechanical Turk marketplace.

If you would like to customize the plugin (for example, ask qualifying questions before accepting workers), you can customize the logic in the server under the `airtable-server` folder. It is a standard Rails 5 application and deployment instructions are in the folder.

We are also using the newly released Button feature to activate the block so it's easy for a user to activate and upload a task easily. Just send the data to the block after you create the button and it will know what to do.

If you run into any issues, feel free to create an issue and I can try to help.

## Screenshots

![Step 1](media/1.png)
![Step 2](media/2.png)
![Step 3](media/3.png)
![Step 4](media/4.jpg)
![Step 5](media/5.png)
![Vid 1](media/hibpart1.gif)
![Vid 2](media/hibpart2.gif)

# Installation
## How to remix this block
Create a new base (or you can use an existing base).

Create a new block in your base (see Create a new block, selecting "Remix from Github" as your template. Choose the folder `client`, which will have the configuration settings. If you need custom backend logic, then you will need to deploy your own server, if not then you don't have to edit any configurations in `client/settings.js`

From the root of client block (ie: `client`), run block run.
