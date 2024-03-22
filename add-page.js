const { Client } = require("@notionhq/client");
const { config } = require("dotenv")
config();
const fs = require('fs');
const filePath = './contract_line_counts.txt';

const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.trim().split('\n');

const databaseId = process.env.NOTION_PAGE_ID; // Ensure you have this in your .env file
const apiKey = process.env.NOTION_API_KEY;

const notion = new Client({ auth: apiKey });

/**
 * Read from txt
 */
let totalNsloc = 0;
const contractsData = [];

for (let i = 0; i < lines.length; i++) {
    if (i === lines.length - 1) {
        // Last line: total nSLOC
        totalNsloc = parseInt(lines[i], 10);
    } else {
        // Contract lines: Extract contract name and nSLOC
        const [contractName, nsloc] = lines[i].split(', ');
        contractsData.push({
            contractName: contractName.trim(),
            nsloc: parseInt(nsloc, 10),
        });
    }
}


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
let newDatabase
async function createRelatedDatabase(parentPageId) {
    newDatabase = await notion.databases.create({
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
        name: "Codehawks",
      },
    },
    Reward: {
      number: 0,
    },
    nSLOC: {
      number: totalNsloc,
    },
    Complexity: {
      number: 0,
    },
    Date: {
        date: {
            start: "2024-03-23", // Start date in YYYY-MM-DD format
            end: "2024-03-30",   // End date in YYYY-MM-DD format
          },
    },
    Prize: {
      number: 0,
    },
  };

  // Add a new page to the database
  await addNotionPageToDatabase(databaseId, pageProperties);
  // Create a new related database within the new page
  await createRelatedDatabase(database_id);
  // Add page to the database 
  for (const contract of contractsData) {
    const pageProperties = {
        "Contract name": {
            title: [
                {
                    text: {
                        content: contract.contractName,
                    },
                },
            ],
        },
        Status: {
            select: {
              name: "Not started", // Adjust based on your actual status options
            },
          },
        nSLOC: {
            number: contract.nsloc,
        },
        // Add other properties as necessary
    }

    await addNotionPageToDatabase(newDatabase.id, pageProperties);
}

}

main().catch(console.error);
