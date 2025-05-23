FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

ARG GTFS_RT_URL
ENV GTFS_RT_URL=$GTFS_RT_URL



RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
