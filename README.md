> This is a back-end of the [Inventory-System-UI](https://github.com/abrehan2/Inventory-System-UI.git)

### Run the commands below to get started ⚙️
```nodejs
  git clone https://github.com/abrehan2/Inventory-System-API.git
```
```nodejs
  npm install
```
### Kindly set up the following environment variables within the `config/config.env` file 🔎
> `PORT` `DB_URL` `JWT_SECRET` `JWT_EXPIRE` `COOKIE_EXPIRE` `FRONTEND_URL` `SMPT_SERVICE` `SMPT_MAIL` `SMPT_PASSWORD` `SMPT_HOST` `SMPT_PORT` `CLOUD_NAME` `API_KEY` `API_SECRET`

# Back-End Structure 🛠
    .                    
    │   └── config      # Stores all the database configurations
    │   └── controllers # Stores all the components to handle client-side requests
    │   └── middlewares # Stores all the middlewares to be used throughout the application
    │   └── models      # Stores all the schemas to be used throughout the application
    │   └── routes      # Stores all the API routes
    │   └── utils       # Stores all the features, email and JSON web token configurations, and the error-handling root class
    |   ├── app.js      # Instantiates all the routes and middlewares
    |   ├── server.js   # Entry point for a server
    └──   
