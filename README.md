# Grants

## Summary

This set of API endpoints allows users to:

1. Create a household
2. Create a family member and add that family member to a household
3. Retrieve all households and their respective family members
4. Retrieve one household and its family members
5. Search for households and family members eligible for various grants

## Built with

- Express.js
- Sequelize / PostgreSQL

## Usage

#### Clone the repository

```
git clone git@github.com:samkohlq/grants.git
```

#### Install dependencies

```
npm install
```

#### Set up development and test databases

1. [Download PostgreSQL](https://www.postgresql.org/download/)
2. During installation:

- Use "postgres" for both username and password when setting up database superuser, and
- Set the port number to 5432

3. Open pgAdmin4 and create databases grants_dev_env and grants_test_env
4. Run migrations on both the development and test environments from the grants project folder

```
npx sequelize db:migrate
```

```
npx sequelize db:migrate --env test
```

#### Run tests

```
npm test
```

## Grants' rules and assumptions made

#### Student Encouragement Bonus

Eligibility critera:

- there must be at least one child under the age of 16
- the combined household income must be less than \$150,000

The response should contain all households, as well as the child(ren) eligible for the bonus

#### Family Togetherness Scheme

Eligibility criteria:

- there must be at least one child under the age of 18, with two parent IDs
- the two parents must have the other's family member ID saved as spouseId

The response should contain all households, as well as the parents and child(ren) eligible for the bonus

#### Elder Bonus

Eligibility criteria:

- household must be of housingType "HDB"
- there must be at least one adult above the age of 50

The response should contain all households and elderly eligible for the bonus

#### Baby Sunshine Grant

Eligibility criteria:

- there must be at least one child under the age of 5

The response should contain all households and young children eligible for the grant

#### YOLO GST Grant

Eligibility criteria:

- household must be of housingType "HDB"
- the combined household income must be less than \$100,000

The response should contain all households eligible for the grant
