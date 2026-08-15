# Visual + Text Hybrid Search





https://github.com/user-attachments/assets/c9ad79ae-c7fc-4c9b-92ca-e758ad639cc6




Search a product catalog by typing what you want, dropping in a photo, or both. Type "red leather jacket under $200" or upload a picture of a jacket and get back the closest matches.

## How it works

A CLIP style model turns text and images into vectors in the same space, so "red dress" and a photo of a red dress end up near each other. Every product gets embedded once and stored in Qdrant along with its price and category. A search just embeds whatever you give it (text, image, or an average of both) and asks Qdrant for the nearest matches. Price limits like "under $200" get pulled out of the query with a bit of regex and applied as a normal metadata filter, since the embedding model has no idea what a dollar is.

Jina's `jina-clip-v2` handles the embeddings, since OpenAI doesn't offer a joint text and image embedding API and Jina's does the job cheaply. FastAPI wraps the search logic, and a small React frontend calls it.

## Running it

Needs Python 3.11+, Node 18+, Docker, and a free key from [jina.ai/embeddings](https://jina.ai/embeddings/).

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
docker compose up -d

pip install -r data/requirements.txt
python data/prep_dataset.py

pip install -r backend/requirements.txt
cd backend
python scripts/index_catalog.py
uvicorn app.main:app --reload --port 8000
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API

`POST /search/text`, `POST /search/image`, `POST /search/hybrid`, `GET /items/{id}`.

## Note

Prices are made up since the source dataset doesn't have any. Indexing stays well within Jina's free tier at demo scale.
