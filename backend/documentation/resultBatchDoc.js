//endpoints and routes for all result batch
const resultBatchProperties = {
    id: { type: 'integer' },
    course_id: { type: 'integer' },
    result_file: { type: 'string' },
    semester_id: { type: 'integer' }
    
};

const swagger = {
    getResultBatches: {
        tags:['Result-Batch'],
        description: 'Get all result batch in the database',
        summary: 'Get all result batch in the database',
        
    },
    getResultBatchById: {
        tags:['Result-Batch'],
        description: 'Retrieve a result batch from the database using the id',
        summary: 'Retrieve a result batch from the database',
        params: { id: { type: 'integer' } }
        
    },
    addResultBatch: {
        tags:['Result-Batch'],
        description: 'Add new Studentresult to the database',
        summary: 'Adds new Studentresult to the database',
        params: {},
        body: {
            type: 'object',
            required: ['course_id', 'semester_id'],
            properties: resultBatchProperties
        },
        response: {
            200: {
            description: 'New Studentresult',
            type: 'object',
            properties: resultBatchProperties
            }
        }
    },
    updateResultBatch: {
        tags:['Result-Batch'],
        description: 'Updates a result batch in the database',
        summary: 'Updates a result batch in the database',
        params: { id: { type: 'integer' } },
        body: {
            type: 'object',
            properties: resultBatchProperties
        }
    },
    deleteResultBatch: {
        tags:['Result-Batch'],
        description: 'Deletes a result batch from the database using the id',
        summary: 'Deletes a result batch from the database',
        params: { id: { type: 'integer' } },
    }
};

module.exports = swagger;
