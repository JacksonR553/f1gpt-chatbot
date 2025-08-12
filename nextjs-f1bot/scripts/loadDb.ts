import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"
import OpenAI from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter" // split up web pages to be more digestable 

import "dotenv/config" // hide our secret and keys

// similarity of two vectors - cosine (how similar the vector are) / dot product (50% faster than cosine, but need to be normalize) / euclidean (how close to vector are, two vector had small eucliden space, they are close)
type SimilarityMetrics = "dot_product" | "cosine" | "euclidean"

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env

// connect to OpenAI, methods and properties will be connected to it
const openai = new OpenAI({apiKey: OPENAI_API_KEY})

// define websites that we want to scrap
const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship',
    'https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions',
    'https://www.formula1.com/en/latest.html',
    'https://www.formula1.com/en/results.html/2025/races.html',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Constructors%27_Champions',
    'https://en.wikipedia.org/wiki/History_of_Formula_One',
    'https://en.wikipedia.org/wiki/Formula_One_teams',
    'https://en.wikipedia.org/wiki/Formula_One_regulations',
    'https://en.wikipedia.org/wiki/Formula_One_racing',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_circuits',
    'https://www.crash.net/f1' 
  ];
  
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)

const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace : ASTRA_DB_NAMESPACE})

// Increase the chances of retrieval 
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100 // Number of character in each chunks
})

const createCollection = async (similarityMetric: SimilarityMetrics = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            // go in and check for embedding size https://platform.openai.com/docs/guides/embeddings#how-to-get-embeddings
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}

// Create a function that will get all the URL we collected above, chunk them up and create better embedding to put them into our vector embeddings
const loadSampleData = async () => {
    const collection = await db.collection (ASTRA_DB_COLLECTION)
    for await (const url of f1Data){
        // This function: scrapePage will scrape every url that we pass through it
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await (const chunk of chunks) {
            // This method is from openAI docs
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            // refer to exampleOutput.txt to see the output format, each comes with object and an array with its embeddings in the data list.
            // Then, we start going into the object (embedding)
            const vector = embedding.data[0].embedding

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}

// This is a function
const scrapePage = async (url: string) => {
    // using PuppetTeer to scrape (Javascript Lib)
    const loader = new PuppeteerWebBaseLoader(url, {
        // Make the web browser to launch headlessly
        launchOptions: {
            headless: true
        },
        // Waiting for the content to load
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        // Evalute the javascript code in the page, extracting data from the page + interacting with page element
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    // We are only interested in the text
    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

// Callback function inside the ()
createCollection().then(()=> loadSampleData())