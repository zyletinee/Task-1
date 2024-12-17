# Task 1 - Game Review Website 
## Links/resources
Storyboard link available [here](https://www.figma.com/design/uQ2JnGr9XZXFZzvTu6tivo/errm-what-the-software?node-id=0-1&node-type=canvas&t=GjsXLj45NbczPVXD-0).
Directory structure available [here](https://zyletinee.s-ul.eu/dgHwzCd9) and algorithms available [here](https://zyletinee.s-ul.eu/fHoP8srb)

## Running the website
After downloading the full package, follow these steps.
1. Download the node.js installer through [this link](https://nodejs.org/en/download/prebuilt-installer) and run the file.
2. Install SQLite using the command line using `npm install sqlite3`.
3. Similarly, you will need to install several APIs and packages with the same command (`npm install [module name]`):
    - require
    - express
    - express-session
    - multer
    - passport
    - bcryptjs
    - body-parser
    - cookie-parser
    - jsonwebtoken
    If you forget any of these, you'll get an error that will let you know what you're missing (i.e. "Error: cannot find module '[module name]'").
4. Run `node [full filepath]\server.js` in the command line.
5. The command line will return `Server running at http://localhost:3000`; type `http://localhost:3000/home` in your browser.
