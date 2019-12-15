import elasticsearch from 'elasticsearch'
import uniqid from 'uniqid'
const indexName = 'my-search-db'
const typeName = "_doc"
const host = "localhost:9200" 

const client = new elasticsearch.Client({
    host,
    log: 'trace',
    apiVersion: '7.x',
});
const operations = async () => {
    try {
        const payload: any = {
            url: "yahoo.com",
            body: "true0"
        }

        const result = await getSpecificDoc(payload.url)

        if (!result) {

            return await save(payload)
        }
        return await update(result._id, payload)

    } catch (error) {
        console.log("Error generated", error);

    }
}
async function getSpecificDoc(urlToFind) {
    const result = await client.search({
        index: indexName,
        type: typeName,
        body: {
            query: {
                match: {
                    url: urlToFind
                }
            }
        }
    })
    return result.hits.hits.length ? result.hits.hits[0] : null
}

async function save(body: object) {
    await client.create({
        index: indexName,
        type: typeName,
        id: uniqid(),
        body
    })
}

async function update(id, doc) {
    return await client.update({
        index: indexName,
        type: typeName,
        id,
        body: {
            doc
        }
    });
}

operations()