module.exports = {
  "jwtToken": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZmI4NzljY2Y0ZmIyMTMyNmVhYzA5YSIsInVzZXJuYW1lIjoiZGVtb3MiLCJpYXQiOjE1ODEzNDI2NDF9.8qWySUWiKlHIwB5nAO1J_YuUC-3BZF34tcDBTFFWIpU",
  "databases": [
    {
      "scheme": "mongodb://",
      "_id": "5b9108d1a7790e2bdf44e6f3",
      "title": "Contabo 01",
      "username": "dex8_freeuser",
      "password": "freedom5",
      "host_port": "5.189.161.70:27017",
      "dbname": "dex8-dev-pool-free01",
      "options": ""
    },
    {
      "scheme": "mongodb+srv://",
      "_id": "5e208abea53d945f78674048",
      "title": "Atlas 001",
      "username": "dex8_freeuser",
      "password": "12345",
      "host_port": "cluster0-n4qix.mongodb.net",
      "dbname": "dex8-dev-pool-free01",
      "options": "retryWrites=true&w=majority"
    },
    {
      "scheme": "mongodb://",
      "_id": "5d384afcf45a1f3bff306c6d",
      "title": "Contabo 02",
      "username": "dex8_freeuser",
      "password": "freedom2",
      "host_port": "5.189.161.70:27017",
      "dbname": "dex8-dev-pool-free02",
      "options": ""
    },
    {
      "scheme": "mongodb://",
      "_id": "5b9112b43e123130ad48ce11",
      "title": "Localhost DB",
      "username": "ms_user",
      "password": "12345",
      "host_port": "localhost:27017",
      "dbname": "dex8-pool-01",
      "options": ""
    }
  ]
}