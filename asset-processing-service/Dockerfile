FROM python:3.12-alpine

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/

RUN pip install poetry && poetry install --no-root

RUN poetry run install

COPY . /app/

CMD ["poetry", "run", "asset-processing-service"]

