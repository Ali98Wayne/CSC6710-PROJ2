# CSC 6710/DSE 6100 - Project 2 (Fall 2025)<br>
* We consider the design of a database-driven website for managing home-cleaning services for a contractor, Anna Johnson.

## The workflow is as follows:
1.	Service Request Submission
2.	Quote & Negotiation
3.	Service Order & Completion
4.	Billing & Payment

Workload for this project: 
1.	Draw an E-R diagram for the system, in particular, use arrows or thick lines to represent constraints appropriately. Write down your assumptions and justifications briefly and clearly. Translate the above E-R diagram into a relational model, i.e., write a set of CREATE TABLE statements. In particular, specify primary key, foreign key and other constraints whenever possible.
2.	Implement all interfaces and functionality described above and then implement the following functionality for the Dashboard for Anna Johnson. 
3.	Frequent clients – List the clients who completed the most service orders.
4.	Uncommitted clients – List clients who submitted 3 or more requests but never completed an order.
5.	This month’s accepted quotes – List all quotes agreed upon in a given month (e.g., December 2024).
6.	Prospective clients – List clients who registered but never submitted any request.
7.	Largest job – List the service requests with the largest number of rooms ever completed.
8.	Overdue bills – List all unpaid bills older than one week.
9.	Bad clients – List clients who never paid any overdue bill.
10.	Good clients – List clients who always paid their bills within 24 hours of being generated.

## Steps to run the code:
1. Install & run XAMPP
2. Start Apache & MySQL
3. Click on 'Admin' from the 'MySQL' module in XAMPP
4. Create a new database named 'proj_2'
5. Go to the 'Priviledges' tab & click 'Add new account'
6. The username & password should match 'DB_USER' & 'DB_PASSWORD' in the 'Backend/.env' file (Anna & 1234 by default)
7. Go to the 'SQL' tab & paste the 'CREATE TABLE' queries from the sql.txt file (copy lines 4-100) then click 'Go'
8. Open Command Prompt or a VSCode terminal
9. Run `cd Backend` in the "CSC6710-PROJ2" directory
10. Run `npm start`
11. Access the website in "http://127.0.0.1:5050/"

## Screenshots:
**Client Request Form:**<br>
<img width="878" height="497" alt="3  Client Request Form" src="https://github.com/user-attachments/assets/ca108728-2255-49f2-8ee1-a5a3cb6402c7" /> <br>
**Contractor Pending Request:**<br>
<img width="878" height="540" alt="4  Contractor Pending Request" src="https://github.com/user-attachments/assets/f5c5ce79-99ea-4586-9269-d4a01ec6f3a7" /> <br>
**Contractor Views Paid Bill:**<br>
<img width="878" height="542" alt="13  Contractor Views Paid Bill" src="https://github.com/user-attachments/assets/26c04182-4261-433d-9704-c5d5ee0c6e97" /> <br>
**Good Clients Query:**<br>
<img width="879" height="389" alt="15  Good Clients Query" src="https://github.com/user-attachments/assets/45e16f0f-b2f0-46a9-a93f-8463b4aad2a9" /> <br>


### NOTES: 
* By default, Anna Johnson is the DB user in the .env file, which hides the signup/login since she is the contractor. To enable the client view, edit the .env file username to "root" and make the password blank. 
  * Alternatively, make a copy of the code and replace every instance of the default port (5050) with another open port (ex. 5051), then change the .env file to the client view & update the port. This allows accessing the website as the contractor & client at the same time without swapping between them manually through the .env file. The link in Step 11 would be for the contractor & a similar link (with the updated port) for the client.
* Personal information & UI elements corresponding to them in this project serve as templates rather than having real-world functionality.
  * Credit card information isn't stored to the local database, personal information doesn't have to filled out accurately. Furthermore, the fields for paying a bill are optional, clicking 'Pay' will still process a bill.
* More screenshots can be viewed in the 'Screenshots' directory.
