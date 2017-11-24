// Sentencias SQL para inicializar una base de datos

// Business Users
CREATE TABLE businessusers(id SERIAL PRIMARY KEY, _ref VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40), roles TEXT[]);

// Servers
CREATE TABLE servers(id VARCHAR(10) PRIMARY KEY, _ref VARCHAR(40), createdBy INT, createdTime VARCHAR(40), name VARCHAR(40), lastConnection INT);

// Rules
CREATE TABLE rules(id SERIAL PRIMARY KEY, _ref VARCHAR(20), name VARCHAR(255), language VARCHAR(40), blobCondition VARCHAR(255), blobConsequence VARCHAR(255), blobPriority VARCHAR(255), active BOOLEAN);

// Rule Changes
CREATE TABLE rulechanges(id SERIAL PRIMARY KEY, _ref VARCHAR(20), name VARCHAR(255), blobCondition VARCHAR(255), blobConsequence VARCHAR(255), blobPriority VARCHAR(255), reason VARCHAR(255), time DATE, active BOOLEAN, businessuser VARCHAR(255), userinfo VARCHAR(255));

// Pending Payments
CREATE TABLE pendingpayments(pendingtransactionid SERIAL PRIMARY KEY, _ref VARCHAR(20), originaltransactionid INT, userid INT NOT NULL, tripid INT NOT NULL, timestamp VARCHAR(30), costcurrency VARCHAR(20) NOT NULL, costvalue INT NOT NULL, description VARCHAR(200), paymethod VARCHAR(50), expiration_month INT, expiration_year INT, number VARCHAR(30), type VARCHAR(100));

// Transactions
CREATE TABLE transactions(id SERIAL PRIMARY KEY, _ref VARCHAR(20), remotetransactionid VARCHAR(50), userid INT NOT NULL, tripid INT NOT NULL, timestamp VARCHAR(30), costcurrency VARCHAR(20) NOT NULL, costvalue INT NOT NULL, description VARCHAR(50));

// Trips
CREATE TABLE trips(id SERIAL PRIMARY KEY, _ref VARCHAR(20), applicationowner VARCHAR(20), driverid INT NOT NULL, passengerid INT NOT NULL, startaddressstreet VARCHAR(100), startaddresslocationlat INT NOT NULL, startaddresslocationlon INT NOT NULL, starttimestamp INT, endaddressstreet VARCHAR(100), endaddresslocationlat INT NOT NULL, endaddresslocationlon INT NOT NULL, endtimestamp INT, totaltime INT, waittime INT, traveltime INT, distance INT, route VARCHAR(100), costcurrency VARCHAR(15) NOT NULL, costvalue INT NOT NULL);

// Users
CREATE TABLE users(id SERIAL PRIMARY KEY, _ref VARCHAR(20), applicationowner VARCHAR(20), type VARCHAR(20), username VARCHAR(40), password VARCHAR(40), facebookuserid VARCHAR(255),name VARCHAR(40), lastname VARCHAR(40), country VARCHAR(40), email VARCHAR(40), birthdate VARCHAR(20), balance INT);

// Cars
CREATE TABLE cars(id SERIAL PRIMARY KEY, _ref VARCHAR(20), owner INT, properties jsonb[]);