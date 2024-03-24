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

// ENV variable
const title = process.env.TITLE
const logo = process.env.LOGO
const platform = process.env.PLATFORM
const totalPrize = parseInt(process.env.TOTAL_PRIZE)
const startDate = process.env.START_DATE
const endDate = process.env.END_DATE
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
            url:  logo
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
            content: title,
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
        name: platform,
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
            start: startDate, // Start date in YYYY-MM-DD format
            end: endDate,   // End date in YYYY-MM-DD format
          },
    },
    Prize: {
      number: totalPrize,
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
