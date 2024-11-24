from fastapi import FastAPI
import uvicorn  # this help t run the fastapi

app = FastAPI()

@app.get('/ping')
async def ping():
    return 'Hello, I am alive'

if __name__ == '__main__':
    uvicorn.run(app, host='localhost', port=2000)