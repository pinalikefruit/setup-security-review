const { Client } = require("@notionhq/client");
const { config } = require("dotenv")
config();

const databaseId = process.env.NOTION_PAGE_ID; // Ensure you have this in your .env file
const apiKey = process.env.NOTION_API_KEY;

const notion = new Client({ auth: apiKey });

/**
 * Adds a new page to the specified Notion database with the given properties.
 */
async function addNotionPageToDatabase(databaseId, pageProperties) {
  const newPage = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    icon: {
        type: "external",
        external: {
            url:  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.freepik.com%2Fvector-premium%2Flogo-pina_535345-17.jpg%3Fw%3D2000&f=1&nofb=1&ipt=99205bbb645b0c44ebf3247a8959515eb1ee44d58283797e2a7dedc0f2b4a3b8&ipo=images"
        },
    },
    properties: pageProperties,
  });
  console.log(`New page created: ${newPage.url}`);
  database_id = newPage.id
}

let database_id
async function createRelatedDatabase(parentPageId) {
    const newDatabase = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: "Scope",
          },
        },
      ],
      properties: {
        "Contract name": {
          title: {},
        },
        Status: {
          select: {
            options: [
              { name: "Not started", color: "gray" },
              { name: "In progress", color: "blue" },
              { name: "Done", color: "green" },
            ],
          },
        },
        nSLOC: {
          number: {},
        },
        Complexity: {
          number: {},
        },
      },
    });
    
    console.log(`New related database created: ${newDatabase.url}`);
  }
/**
 * Example function that demonstrates how to add a new page to your Notion database.
 */
async function main() {
  console.log("Adding new pages...");

  // Example page properties, adjust these according to your needs
  const pageProperties = {
    Name: {
      title: [
        {
          text: {
            content: "Example Contest",
          },
        },
      ],
    },
    Status: {
      status: {
        name: "Not started", // Adjust based on your actual status options
      },
    },
    Platform: {
      select: {
        name: "Code4rena",
      },
    },
    Reward: {
      number: 0,
    },
    nSLOC: {
      number: 250,
    },
    Complexity: {
      number: 5,
    },
    Date: {
        date: {
            start: "2024-03-23", // Start date in YYYY-MM-DD format
            end: "2024-03-30",   // End date in YYYY-MM-DD format
          },
    },
    Prize: {
      number: 5000,
    },
  };

  // Add a new page to the database
  await addNotionPageToDatabase(databaseId, pageProperties);
  // Create a new related database within the new page
  console.log(database_id)
  await createRelatedDatabase(database_id);
}

main().catch(console.error);
